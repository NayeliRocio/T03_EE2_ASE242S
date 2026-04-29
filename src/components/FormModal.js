import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../constants/colors";

const { height, width } = Dimensions.get("window");

// ── Palette (Consistente con Dashboard y Productos) ──────────
const BG = '#080d1a';
const CARD = '#0f1729';
const BORDER = '#1a2640';
const CYAN = '#00d4d4';
const PURPLE = '#8b5cf6';
const PINK = '#ec4899';
const GREEN = '#10b981';
const GOLD = '#fbbf24';

const InputField = ({ field, value, onChange, loading, focused, onFocus, onBlur }) => {
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: focused ? 1 : 0,
      duration: 250,
      useNativeDriver: false, // Color doesn't work with native driver
    }).start();
  }, [focused]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [BORDER, CYAN],
  });

  const shadowOpacity = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  if (field.type === 'checkbox') {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{field.label}</Text>
        <TouchableOpacity
          style={[styles.checkbox, value && { borderColor: CYAN + '88', backgroundColor: CYAN + '10' }]}
          onPress={() => onChange(field.key, !value)}
          activeOpacity={0.7}
          disabled={loading}
        >
          <View style={[styles.checkCircle, { borderColor: value ? CYAN : BORDER }]}>
            {value && <View style={[styles.checkInner, { backgroundColor: CYAN }]} />}
          </View>
          <Text style={[styles.checkboxText, value && { color: CYAN }]}>
            {value ? 'Activado' : 'Desactivado'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {field.label}
        {field.required && <Text style={styles.required}> *</Text>}
      </Text>
      <Animated.View style={[
        styles.inputWrapper,
        { borderColor, shadowOpacity, shadowColor: CYAN }
      ]}>
        <TextInput
          style={[styles.input, field.multiline && styles.multilineInput]}
          value={String(value || "")}
          onChangeText={(val) => onChange(field.key, val)}
          placeholder={field.placeholder || `Ingresa ${field.label.toLowerCase()}`}
          placeholderTextColor="#475569"
          keyboardType={field.keyboardType || "default"}
          multiline={field.multiline}
          numberOfLines={field.multiline ? 4 : 1}
          editable={!loading}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </Animated.View>
    </View>
  );
};

export const FormModal = ({
  visible,
  onClose,
  onSave,
  title,
  fields,
  initialData = {},
  isEditing = false,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);

  // Animation values
  const overlayOp = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      setFormData(initialData);
      Animated.parallel([
        Animated.timing(overlayOp, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(modalScale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
        Animated.spring(modalY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 8 }),
      ]).start();
    } else {
      overlayOp.setValue(0);
      modalScale.setValue(0.9);
      modalY.setValue(50);
    }
  }, [visible, initialData]);

  const handleSave = async () => {
    const requiredFields = fields.filter((field) => field.required);
    const missingFields = requiredFields.filter((field) => !formData[field.key]);

    if (missingFields.length > 0) {
      Alert.alert(
        "Campos Requeridos",
        "Por favor completa:\n" + missingFields.map((f) => f.label).join(", ")
      );
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} transparent onRequestClose={onClose} animationType="none">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Animated.View style={[styles.overlay, { opacity: overlayOp }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

          <Animated.View style={[
            styles.modal,
            { transform: [{ scale: modalScale }, { translateY: modalY }] }
          ]}>
            {/* ── HEADER ── */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerLabel}>{isEditing ? 'MODO EDICIÓN' : 'NUEVO REGISTRO'}</Text>
                <Text style={styles.title}>{title}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.headerDivider} />

            {/* ── CONTENT ── */}
            <ScrollView
              style={styles.content}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {fields.map((field) => (
                <InputField
                  key={field.key}
                  field={field}
                  value={formData[field.key]}
                  onChange={updateField}
                  loading={loading}
                  focused={activeField === field.key}
                  onFocus={() => setActiveField(field.key)}
                  onBlur={() => setActiveField(null)}
                />
              ))}
            </ScrollView>

            {/* ── FOOTER ── */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelTxt}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={loading}
              >
                <View style={[styles.saveBtnBg, { backgroundColor: loading ? '#334155' : CYAN }]}>
                  {loading ? (
                    <Icon name="hourglass-empty" size={20} color="#94a3b8" />
                  ) : (
                    <Icon name="check" size={20} color="#000" />
                  )}
                  <Text style={[styles.saveTxt, { color: loading ? '#94a3b8' : '#000' }]}>
                    {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Confirmar')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ── Estilos ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(3, 7, 18, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: CARD,
    borderRadius: 28,
    width: "100%",
    maxHeight: height * 0.85,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
    overflow: "hidden",
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: CYAN,
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
  },
  headerDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginHorizontal: 0,
  },
  content: {
    padding: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    marginBottom: 8,
    marginLeft: 4,
  },
  required: {
    color: PINK,
  },
  inputWrapper: {
    backgroundColor: BG,
    borderWidth: 1.5,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 2,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },

  // Checkbox
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: BG,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 16,
    gap: 12,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },

  // Footer
  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: CARD,
  },
  cancelBtn: {
    flex: 0.4,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cancelTxt: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "700",
  },
  saveBtn: {
    flex: 0.6,
  },
  saveBtnBg: {
    flexDirection: "row",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveTxt: {
    fontSize: 15,
    fontWeight: "900",
  },
});

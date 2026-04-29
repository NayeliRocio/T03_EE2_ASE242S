import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

// ── Palette (Consistente con todo el sistema) ────────────────
const BG = '#080d1a';
const CARD = '#0f1729';
const BORDER = '#1a2640';
const CYAN = '#00d4d4';
const PINK = '#ec4899';
const GREEN = '#10b981';

export const ConfirmModal = ({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    type = 'danger', // 'danger' o 'success'
    confirmText = 'Continuar',
    cancelText = 'Cancelar'
}) => {
    const overlayOp = useRef(new Animated.Value(0)).current;
    const modalScale = useRef(new Animated.Value(0.8)).current;

    const accentColor = type === 'danger' ? PINK : GREEN;
    const accentIcon = type === 'danger' ? 'delete-sweep' : 'restore';

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(overlayOp, { toValue: 1, duration: 250, useNativeDriver: true }),
                Animated.spring(modalScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
            ]).start();
        } else {
            overlayOp.setValue(0);
            modalScale.setValue(0.8);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent onRequestClose={onClose} animationType="none">
            <View style={styles.overlay}>
                <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(3, 7, 18, 0.9)', opacity: overlayOp }]} />
                <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

                <Animated.View style={[
                    styles.modal,
                    { transform: [{ scale: modalScale }], opacity: overlayOp }
                ]}>
                    <View style={[styles.iconContainer, { backgroundColor: accentColor + '15', borderColor: accentColor + '40' }]}>
                        <Icon name={accentIcon} size={42} color={accentColor} />
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelTxt}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm} activeOpacity={0.8}>
                            <View style={[styles.confirmBtnBg, { backgroundColor: accentColor }]}>
                                <Text style={styles.confirmTxt}>{confirmText}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    modal: {
        backgroundColor: CARD,
        borderRadius: 32,
        width: '100%',
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.6,
        shadowRadius: 25,
        elevation: 24,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 28,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 8,
    },
    content: {
        alignItems: 'center',
        marginBottom: 28,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: 0.2,
    },
    message: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: BG,
    },
    cancelTxt: {
        color: '#64748b',
        fontSize: 15,
        fontWeight: '700',
    },
    confirmBtn: {
        flex: 1.2,
    },
    confirmBtnBg: {
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    confirmTxt: {
        color: '#000',
        fontSize: 15,
        fontWeight: '900',
    },
});

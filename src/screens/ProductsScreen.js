import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/colors';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { FormModal } from '../components/FormModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useFetch } from '../hooks/useFetch';
import {
  getProducts,
  getProductsActivos,
  getProductsInactivos,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
} from '../services/api';

const { width } = Dimensions.get('window');

// ── Palette (Consistente con Dashboard) ──────────────────────
const BG = '#080d1a';
const CARD = '#0f1729';
const BORDER = '#1a2640';
const CYAN = '#00d4d4';
const PURPLE = '#8b5cf6';
const PINK = '#ec4899';
const GREEN = '#10b981';
const GOLD = '#fbbf24';

// ── Componentes Visuales Puros ───────────────────────────────

const SectionLabel = ({ label }) => (
  <View style={styles.sec}>
    <View style={styles.secLine} />
    <Text style={styles.secLabel}>{label}</Text>
    <View style={styles.secLine} />
  </View>
);

const ProductCard = ({ item, index, onEdit, onDelete, onRestore, statusFilter }) => {
  const isInactive = item.isAvailable === false || item.is_available === false;
  const accent = isInactive ? '#475569' : CYAN;

  const slideX = useRef(new Animated.Value(-30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideX, {
        toValue: 0,
        delay: index * 60,
        useNativeDriver: true,
        tension: 50,
        friction: 9,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [item.id, statusFilter]);

  return (
    <Animated.View style={[styles.cardContainer, { opacity, transform: [{ translateX: slideX }] }]}>
      <TouchableOpacity
        style={[styles.card, isInactive && styles.cardInactive, { borderLeftColor: accent }]}
        onPress={() => !isInactive && onEdit(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.imagePlaceholder, { backgroundColor: accent + '15', borderColor: accent + '44' }]}>
            <Icon name="restaurant" size={24} color={accent} />
          </View>
          <View style={styles.infoContainer}>
            <Text style={[styles.productName, isInactive && styles.textDimmed]}>{item.name}</Text>
            <Text style={styles.productCategory}>{item.category || 'Sin categoría'}</Text>
          </View>
          <Text style={[styles.productPrice, { color: isInactive ? '#64748b' : GOLD }]}>S/. {item.price}</Text>
        </View>

        {item.description && (
          <Text style={[styles.productDesc, isInactive && styles.textDimmed]} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.metaContainer}>
            {(item.prepTime || item.prep_time) && (
              <View style={styles.metaItem}>
                <Icon name="access-time" size={14} color={COLORS.textTertiary} />
                <Text style={styles.metaText}>{item.prepTime || item.prep_time}</Text>
              </View>
            )}
            {isInactive && (
              <View style={[styles.statusBadge, { backgroundColor: '#ef444422', borderColor: '#ef444455' }]}>
                <Text style={styles.statusBadgeText}>DESACTIVADO</Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            {!isInactive ? (
              <>
                <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(item)}>
                  <Icon name="edit" size={20} color={CYAN} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(item)}>
                  <Icon name="delete-outline" size={20} color={PINK} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[styles.actionBtn, styles.restoreBtn]} onPress={() => onRestore(item)}>
                <Icon name="restore" size={20} color={GREEN} />
                <Text style={[styles.restoreText, { color: GREEN }]}>Restaurar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Pantalla Principal ───────────────────────────────────────

export const ProductsScreen = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Confirm Modal state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmData, setConfirmData] = useState({
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'danger'
  });

  const headerY = useRef(new Animated.Value(-60)).current;
  const headerO = useRef(new Animated.Value(0)).current;

  // Memoizar la función de fetch basada en statusFilter
  const fetchFn = useCallback(async () => {
    if (statusFilter === 'active') {
      return await getProductsActivos();
    } else if (statusFilter === 'inactive') {
      return await getProductsInactivos();
    } else {
      return await getProducts();
    }
  }, [statusFilter]);

  const { data, loading, error, refetch } = useFetch(fetchFn, [statusFilter]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerY, { toValue: 0, useNativeDriver: true, tension: 45, friction: 9 }),
      Animated.timing(headerO, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const filteredData = data ? data.filter(item => {
    const searchLower = search.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(searchLower)) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      (item.category && item.category.toLowerCase().includes(searchLower))
    );
  }) : [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setModalVisible(true);
  };

  const handleEdit = (product) => {
    setEditingProduct({
      ...product,
      imageUrl: product.image_url || product.imageUrl || '',
      prepTime: product.prep_time || product.prepTime || '',
      nutritionalInfo: product.nutritional_info || product.nutritionalInfo || '',
    });
    setModalVisible(true);
  };

  const handleDelete = (product) => {
    setConfirmData({
      title: 'Eliminar Producto',
      message: `¿Estás seguro de que quieres eliminar "${product.name}"? Esta acción se puede deshacer restaurando el producto.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteProduct(product.id);
          refetch();
          setConfirmVisible(false);
        } catch (error) {
          Alert.alert('Error', 'No se pudo eliminar el producto');
        }
      }
    });
    setConfirmVisible(true);
  };

  const handleRestore = (product) => {
    setConfirmData({
      title: 'Restaurar Producto',
      message: `¿Deseas restaurar "${product.name}" al catálogo activo?`,
      type: 'success',
      onConfirm: async () => {
        try {
          await restoreProduct(product.id);
          refetch();
          setConfirmVisible(false);
        } catch (error) {
          Alert.alert('Error', 'No se pudo restaurar el producto');
        }
      }
    });
    setConfirmVisible(true);
  };

  const toBackendFormat = (formData) => ({
    name: formData.name,
    description: formData.description,
    price: formData.price ? parseFloat(formData.price) : undefined,
    category: formData.category,
    image_url: formData.imageUrl || formData.image_url,
    prep_time: formData.prepTime || formData.prep_time,
    nutritional_info: formData.nutritionalInfo || formData.nutritional_info,
    is_available: formData.isAvailable !== undefined ? formData.isAvailable : formData.is_available,
    is_featured: formData.isFeatured !== undefined ? formData.isFeatured : formData.is_featured,
  });

  const toFormFormat = (product) => ({
    ...product,
    imageUrl: product.image_url || product.imageUrl,
    prepTime: product.prep_time || product.prepTime,
    nutritionalInfo: product.nutritional_info || product.nutritionalInfo,
  });

  const handleSubmit = async (formData) => {
    try {
      const payload = toBackendFormat(
        editingProduct ? { ...toFormFormat(editingProduct), ...formData } : formData
      );
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }
      setModalVisible(false);
      refetch();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el producto');
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message="Error al cargar productos" onRetry={refetch} />;

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <Animated.View style={[styles.header, { opacity: headerO, transform: [{ translateY: headerY }] }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greetText}>Gestión de Menú</Text>
            <Text style={styles.brandText}>Productos</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleCreate} activeOpacity={0.8}>
            <LinearGradientBackground color={CYAN}>
              <Icon name="add" size={28} color="#000" />
            </LinearGradientBackground>
          </TouchableOpacity>
        </View>

        {/* Search Bar Premium */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={COLORS.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o categoría..."
            placeholderTextColor={COLORS.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Strip */}
        <View style={styles.filterStrip}>
          {[
            { key: 'active', label: 'Activos', icon: 'check_circle' },
            { key: 'inactive', label: 'Inactivos', icon: 'pause_circle' },
            { key: 'all', label: 'Todos', icon: 'list' },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterTab,
                statusFilter === f.key && { backgroundColor: CYAN + '15', borderColor: CYAN + '88' }
              ]}
              onPress={() => setStatusFilter(f.key)}
            >
              <Icon name={f.icon} size={16} color={statusFilter === f.key ? CYAN : COLORS.textTertiary} />
              <Text style={[styles.filterTabText, statusFilter === f.key && { color: CYAN, fontWeight: '700' }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      <SectionLabel label={statusFilter === 'active' ? 'CATÁLOGO ACTIVO' : statusFilter === 'inactive' ? 'PRODUCTOS DESACTIVADOS' : 'TODOS LOS PRODUCTOS'} />

      <FlatList
        data={filteredData}
        renderItem={({ item, index }) => (
          <ProductCard
            item={item}
            index={index}
            statusFilter={statusFilter}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={CYAN} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inventory-2" size={64} color={BORDER} />
            <Text style={styles.emptyText}>
              No se encontraron productos en esta sección
            </Text>
          </View>
        }
      />

      <ConfirmModal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onConfirm={confirmData.onConfirm}
        title={confirmData.title}
        message={confirmData.message}
        type={confirmData.type}
        confirmText={confirmData.type === 'danger' ? 'Eliminar' : 'Restaurar'}
      />

      <FormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSubmit}
        title={editingProduct ? 'Editar Producto' : 'Crear Producto'}
        fields={[
          { key: 'name', label: 'Nombre', type: 'text', required: true },
          { key: 'description', label: 'Descripción', type: 'text', multiline: true },
          { key: 'price', label: 'Precio', type: 'number', required: true, keyboardType: 'decimal-pad' },
          { key: 'category', label: 'Categoría', type: 'text' },
          { key: 'imageUrl', label: 'URL Imagen', type: 'text', placeholder: 'https://...' },
          { key: 'prepTime', label: 'Tiempo Preparación', type: 'text', placeholder: 'Ej: 20 min' },
          { key: 'nutritionalInfo', label: 'Info Nutricional', type: 'text', multiline: true },
        ]}
        initialData={editingProduct || {}}
        isEditing={!!editingProduct}
      />
    </View>
  );
};

const LinearGradientBackground = ({ color, children }) => (
  <View style={{
    backgroundColor: color,
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: color, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  }}>
    {children}
  </View>
);

// ── Estilos ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    margin: 16, marginBottom: 8,
    backgroundColor: CARD, borderRadius: 24,
    padding: 20, borderWidth: 1, borderColor: BORDER,
    shadowColor: CYAN, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 12,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  greetText: { fontSize: 13, color: '#475569', marginBottom: 2, fontWeight: '500' },
  brandText: { fontSize: 28, fontWeight: '900', color: '#ffffff', letterSpacing: 0.4 },
  addBtn: { padding: 2 },

  // Search
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: BG, borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: BORDER,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#ffffff', fontSize: 14, fontWeight: '500' },

  // Filters
  filterStrip: { flexDirection: 'row', gap: 8 },
  filterTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: BORDER, backgroundColor: BG,
  },
  filterTabText: { fontSize: 11, fontWeight: '600', color: '#475569' },

  // Section Label
  sec: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 12, marginBottom: 12, gap: 10 },
  secLine: { flex: 1, height: 1, backgroundColor: BORDER },
  secLabel: { fontSize: 9, fontWeight: '800', color: '#334155', letterSpacing: 2.5 },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  cardContainer: { marginBottom: 12 },
  card: {
    backgroundColor: CARD, borderRadius: 20,
    borderWidth: 1, borderColor: BORDER, borderLeftWidth: 4,
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  cardInactive: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  imagePlaceholder: {
    width: 50, height: 50, borderRadius: 15,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },
  infoContainer: { flex: 1 },
  productName: { fontSize: 17, fontWeight: '800', color: '#ffffff', marginBottom: 2 },
  productCategory: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  productPrice: { fontSize: 18, fontWeight: '900' },
  textDimmed: { color: '#64748b' },

  productDesc: { fontSize: 13, color: '#94a3b8', lineHeight: 18, marginBottom: 14 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaContainer: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#64748b', fontWeight: '500' },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  statusBadgeText: { fontSize: 9, fontWeight: '800', color: '#ef4444' },

  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: BG, borderWidth: 1, borderColor: BORDER,
    justifyContent: 'center', alignItems: 'center',
  },
  restoreBtn: { flexDirection: 'row', width: 'auto', paddingHorizontal: 12, gap: 6 },
  restoreText: { fontSize: 12, fontWeight: '700' },

  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 16 },
  emptyText: { color: '#475569', fontSize: 14, textAlign: 'center', paddingHorizontal: 40, fontWeight: '500' },
});
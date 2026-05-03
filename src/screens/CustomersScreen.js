import React, { useState, useCallback, useEffect, useRef } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/colors';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { FormModal } from '../components/FormModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useFetch } from '../hooks/useFetch';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  restoreCustomer,
} from '../services/api';

// --- Paleta de Colores ---
const BG = '#080d1a';
const CARD = '#0f1729';
const BORDER = '#1a2640';
const CYAN = '#00d4d4';
const PINK = '#ec4899';
const GREEN = '#10b981'; // Verde para Activos
const RED = '#ef4444';   // Rojo para Inactivos
const GOLD = '#fbbf24';

export const CustomersScreen = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); 
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmData, setConfirmData] = useState({
    title: '', message: '', onConfirm: () => {}, type: 'danger',
  });

  const headerO = useRef(new Animated.Value(0)).current;

  const { data = [], loading, error, refetch } = useFetch(getCustomers, [statusFilter]);

  useEffect(() => {
    Animated.timing(headerO, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const filteredData = data.filter(item => {
    const name = `${item.first_name} ${item.last_name}`.toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) || item.email?.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'active') return matchesSearch && item.is_active;
    if (statusFilter === 'inactive') return matchesSearch && !item.is_active;
    return matchesSearch;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = (customer) => {
    setConfirmData({
      title: 'Desactivar Cliente',
      message: `¿Estás seguro de que quieres eliminar a ${customer.first_name}?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteCustomer(customer.id);
          await refetch();
          setConfirmVisible(false);
        } catch (err) {
          Alert.alert('Error', 'No se pudo eliminar');
        }
      },
    });
    setConfirmVisible(true);
  };

  const handleRestore = (customer) => {
    setConfirmData({
      title: 'Restaurar Cliente',
      message: `¿Activar nuevamente a ${customer.first_name}?`,
      type: 'success',
      onConfirm: async () => {
        try {
          await restoreCustomer(customer.id);
          await refetch();
          setConfirmVisible(false);
        } catch (err) {
          Alert.alert('Error', 'No se pudo restaurar');
        }
      },
    });
    setConfirmVisible(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
      } else {
        await createCustomer(formData);
      }
      setModalVisible(false);
      refetch();
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar');
    }
  };

  if (loading && !refreshing) return <Loader />;
  if (error) return <ErrorMessage message="Error al cargar" onRetry={refetch} />;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Animated.View style={[styles.header, { opacity: headerO }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greetText}>Gestión de Base</Text>
            <Text style={styles.brandText}>Clientes</Text>
          </View>
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={() => { setEditingCustomer(null); setModalVisible(true); }}
          >
            <View style={styles.iconCircle}>
              <Icon name="add" size={28} color="#000" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#475569" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o email..."
            placeholderTextColor="#475569"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filterStrip}>
          {['active', 'inactive', 'all'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, statusFilter === f && { borderColor: CYAN, backgroundColor: CYAN + '10' }]}
              onPress={() => setStatusFilter(f)}
            >
              <Text style={[styles.filterTabText, statusFilter === f && { color: CYAN }]}>
                {f === 'active' ? 'Activos' : f === 'inactive' ? 'Inactivos' : 'Todos'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => {
          // Lógica de color dinámica
          const statusColor = item.is_active ? GREEN : RED;

          return (
            <View style={[styles.card, { borderLeftColor: statusColor }]}>
              <View style={styles.cardInfo}>
                <Text style={styles.customerName}>{item.first_name} {item.last_name}</Text>
                <Text style={styles.customerEmail}>{item.email}</Text>
                <Text style={styles.customerPhone}>{item.phone} • {item.client_type || 'Regular'}</Text>
                {/* Texto de Estado pedido */}
                <Text style={[styles.statusText, { color: statusColor }]}>
                  ESTADO: {item.is_active ? 'ACTIVO' : 'INACTIVO'}
                </Text>
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => { setEditingCustomer(item); setModalVisible(true); }}>
                  <Icon name="edit" size={24} color={CYAN} />
                </TouchableOpacity>

                {item.is_active ? (
                  <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Icon name="delete" size={24} color={RED} /> 
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => handleRestore(item)}>
                    <Icon name="restore" size={24} color={GREEN} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={CYAN} />}
      />

      <ConfirmModal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onConfirm={confirmData.onConfirm}
        title={confirmData.title}
        message={confirmData.message}
        type={confirmData.type}
      />

      <FormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
        fields={[
          { key: 'first_name', label: 'Nombre', required: true },
          { key: 'last_name', label: 'Apellido', required: true },
          { key: 'email', label: 'Email', required: true },
          { key: 'phone', label: 'Teléfono', required: true },
          { key: 'client_type', label: 'Tipo (VIP/Regular)' },
        ]}
        initialData={editingCustomer || {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { margin: 16, padding: 20, backgroundColor: CARD, borderRadius: 24, borderWidth: 1, borderColor: BORDER },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  brandText: { fontSize: 26, fontWeight: '900', color: '#fff' },
  greetText: { fontSize: 12, color: '#475569' },
  iconCircle: { backgroundColor: CYAN, padding: 10, borderRadius: 12 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 12, paddingHorizontal: 10, marginBottom: 15 },
  searchInput: { flex: 1, color: '#fff', height: 40 },
  filterStrip: { flexDirection: 'row', gap: 10 },
  filterTab: { flex: 1, padding: 8, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: BORDER },
  filterTabText: { color: '#475569', fontSize: 11, fontWeight: '700' },
  card: { 
    backgroundColor: CARD, marginBottom: 12, padding: 16, 
    borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between',
    borderLeftWidth: 6, // El borde de la izquierda
  },
  customerName: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  customerEmail: { color: '#64748b', fontSize: 13, marginVertical: 2 },
  customerPhone: { color: GOLD, fontSize: 12, fontWeight: '600' },
  statusText: { fontSize: 11, fontWeight: '900', marginTop: 8, letterSpacing: 0.5 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 20 },
});
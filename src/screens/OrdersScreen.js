import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, FlatList, StyleSheet, RefreshControl, Text,
  Alert, TouchableOpacity, TextInput, Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { FormModal } from '../components/FormModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useFetch } from '../hooks/useFetch';
import { getOrders, createOrder, updateOrder, deleteOrder } from '../services/api';

const BG = '#080d1a';
const CARD = '#0f1729';
const BORDER = '#1a2640';
const CYAN = '#00d4d4';
const PINK = '#ec4899';
const GREEN = '#10b981';
const RED = '#ef4444';
const GOLD = '#fbbf24';

export const OrdersScreen = () => {
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmData, setConfirmData] = useState({ title: '', message: '', onConfirm: () => {}, type: 'danger' });

  const { data = [], loading, error, refetch } = useFetch(getOrders);
  const headerO = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerO, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const filteredData = data.filter(item => 
    item.order_id?.toLowerCase().includes(search.toLowerCase()) ||
    item.customer_id?.toString().includes(search)
  );

  const handleDelete = (order) => {
    setConfirmData({
      title: 'Anular Orden',
      message: `¿Estás seguro de eliminar la orden ${order.order_id}?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteOrder(order.id);
          await refetch();
          setConfirmVisible(false);
        } catch (err) { 
          Alert.alert('Error', 'No se pudo anular la orden'); 
        }
      },
    });
    setConfirmVisible(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingOrder) await updateOrder(editingOrder.id, formData);
      else await createOrder(formData);
      setModalVisible(false);
      refetch();
    } catch (err) { 
      Alert.alert('Error', 'No se pudo procesar la solicitud'); 
    }
  };

  if (loading && !refreshing) return <Loader />;
  if (error) return <ErrorMessage message="Error al cargar órdenes" onRetry={refetch} />;

  return (
    <View style={styles.container}>
      {/* HEADER NEÓN */}
      <Animated.View style={[styles.header, { opacity: headerO }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greetText}>Registro de Ventas</Text>
            <Text style={styles.brandText}>Órdenes</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => { setEditingOrder(null); setModalVisible(true); }}>
            <View style={styles.iconCircle}>
              <Icon name="add" size={28} color="#000" />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#475569" style={{ marginRight: 10 }} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Buscar por código..." 
            placeholderTextColor="#475569" 
            value={search} 
            onChangeText={setSearch} 
          />
        </View>
      </Animated.View>

      {/* LISTADO DE ÓRDENES */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => {
          const statusColor = item.is_active ? GREEN : RED;
          return (
            <View style={[styles.card, { borderLeftColor: statusColor }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderId}>ORDEN: {item.order_id}</Text>
                <Text style={styles.orderTotal}>S/ {item.total_amount}</Text>
                <Text style={styles.orderSub}>Cliente ID: {item.customer_id} • {item.order_date}</Text>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  ESTADO: {item.is_active ? 'ACTIVO' : 'ANULADO'}
                </Text>
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => { setEditingOrder(item); setModalVisible(true); }}>
                  <Icon name="edit" size={24} color={CYAN} />
                </TouchableOpacity>

                {item.is_active && (
                  <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Icon name="delete" size={24} color={RED} /> 
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={async () => { setRefreshing(true); await refetch(); setRefreshing(false); }} 
            tintColor={CYAN} 
          />
        }
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
        title={editingOrder ? 'Editar Orden' : 'Nueva Orden'} 
        fields={[
          { key: 'order_id', label: 'Código de Orden', required: true }, 
          { key: 'customer_id', label: 'ID del Cliente', required: true }, 
          { key: 'total_amount', label: 'Monto Total', keyboardType: 'decimal-pad' }
        ]} 
        initialData={editingOrder || {}} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { 
    margin: 16, padding: 20, backgroundColor: CARD, 
    borderRadius: 24, borderWidth: 1, borderColor: BORDER 
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  brandText: { fontSize: 26, fontWeight: '900', color: '#fff' },
  greetText: { fontSize: 12, color: '#475569' },
  iconCircle: { backgroundColor: PINK, padding: 10, borderRadius: 12 },
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: BG, 
    borderRadius: 12, paddingHorizontal: 10 
  },
  searchInput: { flex: 1, color: '#fff', height: 40 },
  card: { 
    backgroundColor: CARD, marginBottom: 12, padding: 16, 
    borderRadius: 16, flexDirection: 'row', borderLeftWidth: 6 
  },
  orderId: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  orderTotal: { color: GOLD, fontSize: 20, fontWeight: '900', marginVertical: 4 },
  orderSub: { color: '#64748b', fontSize: 12 },
  statusText: { fontSize: 11, fontWeight: '900', marginTop: 8, letterSpacing: 0.5 },
  actions: { justifyContent: 'center', alignItems: 'center', paddingLeft: 10, gap: 20 },
});
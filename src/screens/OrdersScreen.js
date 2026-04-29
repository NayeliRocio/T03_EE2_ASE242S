import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { SearchBar } from '../components/SearchBar';
import { CardItem } from '../components/CardItem';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { FormModal } from '../components/FormModal';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { useFetch } from '../hooks/useFetch';
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from '../services/api';

export const OrdersScreen = ({ navigation }) => {
  const { data, loading, error, refetch } = useFetch(getOrders);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const filteredData = data.filter(item => {
    const searchLower = search.toLowerCase();
    return (
      item.id?.toString().includes(search) ||
      (item.customer_name && item.customer_name.toLowerCase().includes(searchLower)) ||
      (item.status && item.status.toLowerCase().includes(searchLower))
    );
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreate = () => {
    setEditingOrder(null);
    setModalVisible(true);
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setModalVisible(true);
  };

  const handleDelete = (order) => {
    Alert.alert(
      'Eliminar Orden',
      `¿Estás seguro de que quieres eliminar la orden #${order.id}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOrder(order.id);
              refetch();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la orden');
            }
          },
        },
      ]
    );
  };

  const handleSave = async (formData) => {
    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, formData);
      } else {
        await createOrder(formData);
      }
      refetch();
    } catch (error) {
      throw error;
    }
  };

  const orderFields = [
    { key: 'customer_name', label: 'Nombre del Cliente', required: true },
    { key: 'status', label: 'Estado', required: true, placeholder: 'Ej: pending, preparing, ready, completed' },
    { key: 'total_price', label: 'Precio Total', required: true, keyboardType: 'decimal-pad' },
  ];

  if (loading && !refreshing) return <Loader />;

  if (error && !data.length) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  const renderItem = ({ item }) => {
    const totalPrice = item.total_price || item.total || '0.00';
    const status = item.status || 'Pendiente';

    return (
      <CardItem
        title={`Orden #${item.id}`}
        subtitle={`Total: $${totalPrice}`}
        data={[
          `Estado: ${status}`,
          `Items: ${item.items?.length || item.order_items?.length || '0'}`,
          `Cliente: ${item.customer_name || 'N/A'}`,
        ]}
        showActions={true}
        onEdit={() => handleEdit(item)}
        onDelete={() => handleDelete(item)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Órdenes</Text>
        <Text style={styles.headerSubtitle}>{filteredData.length} resultados</Text>
      </View>

      <SearchBar
        placeholder="Buscar órdenes..."
        value={search}
        onChangeText={setSearch}
      />

      {filteredData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay órdenes disponibles</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.listContainer}
          scrollEnabled={true}
        />
      )}

      <FloatingActionButton onPress={handleCreate} />

      <FormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        title={editingOrder ? 'Editar Orden' : 'Nueva Orden'}
        fields={orderFields}
        initialData={editingOrder || {}}
        isEditing={!!editingOrder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  listContainer: {
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});

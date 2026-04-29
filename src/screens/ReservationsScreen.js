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
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,
} from '../services/api';

export const ReservationsScreen = ({ navigation }) => {
  const { data, loading, error, refetch } = useFetch(getReservations);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  const filteredData = data.filter(item => {
    const searchLower = search.toLowerCase();
    return (
      (item.customer_name && item.customer_name.toLowerCase().includes(searchLower)) ||
      (item.customer?.name && item.customer.name.toLowerCase().includes(searchLower)) ||
      item.id?.toString().includes(search)
    );
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreate = () => {
    setEditingReservation(null);
    setModalVisible(true);
  };

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setModalVisible(true);
  };

  const handleDelete = (reservation) => {
    Alert.alert(
      'Eliminar Reserva',
      `¿Estás seguro de que quieres eliminar la reserva de ${reservation.customer_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReservation(reservation.id);
              refetch();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la reserva');
            }
          },
        },
      ]
    );
  };

  const handleSave = async (formData) => {
    try {
      if (editingReservation) {
        await updateReservation(editingReservation.id, formData);
      } else {
        await createReservation(formData);
      }
      refetch();
    } catch (error) {
      throw error;
    }
  };

  const reservationFields = [
    { key: 'customer_name', label: 'Nombre del Cliente', required: true },
    { key: 'party_size', label: 'Número de Personas', required: true, keyboardType: 'numeric' },
    { key: 'reservation_date', label: 'Fecha (YYYY-MM-DD)', required: true },
    { key: 'reservation_time', label: 'Hora (HH:MM)', required: true },
    { key: 'table_number', label: 'Número de Mesa', required: true, keyboardType: 'numeric' },
  ];

  if (loading && !refreshing) return <Loader />;

  if (error && !data.length) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  const renderItem = ({ item }) => {
    const customerName = item.customer_name || item.customer?.name || 'Sin nombre';
    const date = item.reservation_date ? new Date(item.reservation_date).toLocaleDateString('es-ES') : 'N/A';
    const time = item.reservation_time || 'N/A';

    return (
      <CardItem
        title={customerName}
        subtitle={`${date} - ${time}`}
        data={[
          `Personas: ${item.party_size || item.guests || '0'}`,
          `Mesa: ${item.table_number || item.table?.table_number || 'N/A'}`,
          `ID: ${item.id}`,
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
        <Text style={styles.headerTitle}>Reservas</Text>
        <Text style={styles.headerSubtitle}>{filteredData.length} resultados</Text>
      </View>

      <SearchBar
        placeholder="Buscar reservas..."
        value={search}
        onChangeText={setSearch}
      />

      {filteredData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay reservas disponibles</Text>
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
        title={editingReservation ? 'Editar Reserva' : 'Nueva Reserva'}
        fields={reservationFields}
        initialData={editingReservation || {}}
        isEditing={!!editingReservation}
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

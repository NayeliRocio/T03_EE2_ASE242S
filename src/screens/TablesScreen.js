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
  getTableSpots,
  createTableSpot,
  updateTableSpot,
  deleteTableSpot,
} from '../services/api';

export const TablesScreen = ({ navigation }) => {
  const { data, loading, error, refetch } = useFetch(getTableSpots);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const filteredData = data.filter(item => {
    const searchLower = search.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(searchLower)) ||
      (item.location && item.location.toLowerCase().includes(searchLower)) ||
      item.table_number?.toString().includes(search)
    );
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreate = () => {
    setEditingTable(null);
    setModalVisible(true);
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setModalVisible(true);
  };

  const handleDelete = (table) => {
    Alert.alert(
      'Eliminar Mesa',
      `¿Estás seguro de que quieres eliminar la mesa ${table.table_number || table.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTableSpot(table.id);
              refetch();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la mesa');
            }
          },
        },
      ]
    );
  };

  const handleSave = async (formData) => {
    try {
      if (editingTable) {
        await updateTableSpot(editingTable.id, formData);
      } else {
        await createTableSpot(formData);
      }
      refetch();
    } catch (error) {
      throw error;
    }
  };

  const tableFields = [
    { key: 'table_number', label: 'Número de Mesa', required: true, keyboardType: 'numeric' },
    { key: 'capacity', label: 'Capacidad', required: true, keyboardType: 'numeric' },
    { key: 'location', label: 'Ubicación', required: true, placeholder: 'Ej: Terraza, Interior, VIP' },
  ];

  if (loading && !refreshing) return <Loader />;

  if (error && !data.length) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  const renderItem = ({ item }) => {
    const isAvailable = item.status === 'available' || item.available === true;
    const statusColor = isAvailable ? COLORS.success : COLORS.error;

    return (
      <CardItem
        title={`Mesa ${item.table_number || item.name || 'N/A'}`}
        subtitle={`Capacidad: ${item.capacity || '0'} personas`}
        data={[
          `Ubicación: ${item.location || 'N/A'}`,
          `Estado: ${isAvailable ? 'Disponible' : 'Ocupada'}`,
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
        <Text style={styles.headerTitle}>Mesas</Text>
        <Text style={styles.headerSubtitle}>{filteredData.length} resultados</Text>
      </View>

      <SearchBar
        placeholder="Buscar mesas..."
        value={search}
        onChangeText={setSearch}
      />

      {filteredData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay mesas disponibles</Text>
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
        title={editingTable ? 'Editar Mesa' : 'Nueva Mesa'}
        fields={tableFields}
        initialData={editingTable || {}}
        isEditing={!!editingTable}
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

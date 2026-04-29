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
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../services/api';

export const CustomersScreen = ({ navigation }) => {
  const { data, loading, error, refetch } = useFetch(getCustomers);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const filteredData = data.filter(item => {
    const searchLower = search.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(searchLower)) ||
      (item.email && item.email.toLowerCase().includes(searchLower)) ||
      (item.phone && item.phone.includes(search))
    );
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    setModalVisible(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setModalVisible(true);
  };

  const handleDelete = (customer) => {
    Alert.alert(
      'Eliminar Cliente',
      `¿Estás seguro de que quieres eliminar a ${customer.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomer(customer.id);
              refetch();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el cliente');
            }
          },
        },
      ]
    );
  };

  const handleSave = async (formData) => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
      } else {
        await createCustomer(formData);
      }
      refetch();
    } catch (error) {
      throw error;
    }
  };

  const customerFields = [
    { key: 'name', label: 'Nombre', required: true, placeholder: 'Nombre completo' },
    { key: 'email', label: 'Email', required: true, keyboardType: 'email-address' },
    { key: 'phone', label: 'Teléfono', required: true, keyboardType: 'phone-pad' },
  ];

  if (loading && !refreshing) return <Loader />;

  if (error && !data.length) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  const renderItem = ({ item }) => (
    <CardItem
      title={item.name || 'Sin nombre'}
      subtitle={item.email || item.phone}
      data={[
        `Email: ${item.email || 'N/A'}`,
        `Teléfono: ${item.phone || 'N/A'}`,
        `ID: ${item.id}`,
      ]}
      showActions={true}
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clientes</Text>
        <Text style={styles.headerSubtitle}>{filteredData.length} resultados</Text>
      </View>

      <SearchBar
        placeholder="Buscar clientes..."
        value={search}
        onChangeText={setSearch}
      />

      {filteredData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay clientes disponibles</Text>
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
        title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
        fields={customerFields}
        initialData={editingCustomer || {}}
        isEditing={!!editingCustomer}
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

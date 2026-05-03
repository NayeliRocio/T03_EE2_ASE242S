import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFetch } from '../hooks/useFetch';
import { getOrderDetails } from '../services/api';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';

const BG = '#080d1a';
const CARD = '#0f1729';
const BORDER = '#1a2640';
const PURPLE = '#8b5cf6';

export const OrderDetailScreen = () => {
  const { data, loading, error, refetch } = useFetch(getOrderDetails);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Items de Órdenes</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconBox}><Icon name="inventory" size={20} color={PURPLE} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.prodName}>Producto ID: {item.product_id}</Text>
              <Text style={styles.sub}>Cantidad: {item.quantity} • Orden: {item.order_id}</Text>
            </View>
            <Text style={styles.price}>S/ {item.price_at_purchase}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, padding: 16 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  card: { backgroundColor: CARD, padding: 16, borderRadius: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  iconBox: { width: 40, height: 40, backgroundColor: PURPLE + '20', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  prodName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sub: { color: '#475569', fontSize: 12 },
  price: { color: PURPLE, fontWeight: 'bold', fontSize: 16 }
});
import React, { useRef, useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { DashboardScreen } from '../screens/DashboardScreen';
import { CustomersScreen } from '../screens/CustomersScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { TablesScreen } from '../screens/TablesScreen';
import { ReservationsScreen } from '../screens/ReservationsScreen';
import { OrdersScreen } from '../screens/OrdersScreen';

// ── Palette (igual que DashboardScreen) ──────────────────────
const BG = '#080d1a';
const CARD = '#0f1729';
const BORDER = '#1a2640';
const CYAN = '#00d4d4';
const PURPLE = '#8b5cf6';
const PINK = '#ec4899';
const GREEN = '#10b981';
const GOLD = '#fbbf24';

const Drawer = createDrawerNavigator();

// ── Menú items con color neón ─────────────────────────────────
const MENU = [
  { name: 'Dashboard', label: 'Dashboard', icon: 'dashboard', color: CYAN },
  { name: 'Clientes', label: 'Clientes', icon: 'people', color: PURPLE },
  { name: 'Productos', label: 'Productos', icon: 'restaurant-menu', color: GOLD },
  { name: 'Mesas', label: 'Mesas', icon: 'table-restaurant', color: GREEN },
  { name: 'Reservas', label: 'Reservas', icon: 'event-note', color: CYAN },
  { name: 'Órdenes', label: 'Órdenes', icon: 'receipt', color: PINK },
];

// ── Animated menu item ────────────────────────────────────────
const MenuItem = ({ item, index, onPress, isActive }) => {
  const slideX = useRef(new Animated.Value(-40)).current;
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
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX: slideX }] }}>
      <TouchableOpacity
        style={[styles.menuItem, isActive && { backgroundColor: item.color + '18', borderColor: item.color + '44' }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Icon badge */}
        <View style={[styles.iconBadge, { backgroundColor: item.color + '20', borderColor: item.color + '50' }]}>
          <Icon name={item.icon} size={20} color={item.color} />
        </View>

        {/* Label */}
        <Text style={[styles.menuText, isActive && { color: item.color }]}>
          {item.label}
        </Text>

        {/* Active indicator dot */}
        {isActive && <View style={[styles.activeDot, { backgroundColor: item.color }]} />}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Custom drawer content ─────────────────────────────────────
const CustomDrawerContent = ({ navigation, state }) => {
  const activeRoute = state?.routes[state?.index]?.name;

  const headerY = useRef(new Animated.Value(-20)).current;
  const headerO = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerY, { toValue: 0, useNativeDriver: true, tension: 45, friction: 9 }),
      Animated.timing(headerO, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <Animated.View style={[styles.header, { opacity: headerO, transform: [{ translateY: headerY }] }]}>
        {/* Logo ring */}
        <View style={styles.logoRing}>
          <View style={styles.logoInner}>
            <Text style={styles.logoLetter}>A</Text>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.brandName}>Altavista</Text>
          <Text style={styles.brandSub}>Rooftop Bar</Text>
        </View>
      </Animated.View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Label */}
      <Text style={styles.navLabel}>NAVEGACIÓN</Text>

      {/* ── MENU ITEMS ── */}
      <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
        {MENU.map((item, index) => (
          <MenuItem
            key={item.name}
            item={item}
            index={index}
            isActive={activeRoute === item.name}
            onPress={() => navigation.navigate(item.name)}
          />
        ))}
      </ScrollView>

      {/* ── FOOTER ── */}
      <View style={styles.footer}>
        <View style={styles.footerCard}>
          <View style={[styles.footerDot, { backgroundColor: GREEN }]} />
          <View>
            <Text style={styles.footerTitle}>Sistema activo</Text>
            <Text style={styles.footerSub}>v1.0.0 · Altavista</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ── Drawer Navigator ──────────────────────────────────────────
export const DrawerNavigator = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerStyle: {
        backgroundColor: CARD,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
      },
      headerTintColor: CYAN,
      headerTitleStyle: {
        fontWeight: '800',
        fontSize: 18,
        color: '#ffffff',
        letterSpacing: 0.3,
      },
      drawerStyle: {
        backgroundColor: BG,
        width: 280,
      },
    }}
  >
    <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{
      title: 'Dashboard',
      drawerIcon: ({ color, size }) => <Icon name="dashboard" color={color} size={size} />
    }} />
    <Drawer.Screen name="Clientes" component={CustomersScreen} options={{
      title: 'Clientes',
      drawerIcon: ({ color, size }) => <Icon name="people" color={color} size={size} />
    }} />
    <Drawer.Screen name="Productos" component={ProductsScreen} options={{
      title: 'Productos',
      drawerIcon: ({ color, size }) => <Icon name="restaurant-menu" color={color} size={size} />
    }} />
    <Drawer.Screen name="Mesas" component={TablesScreen} options={{
      title: 'Mesas',
      drawerIcon: ({ color, size }) => <Icon name="table-restaurant" color={color} size={size} />
    }} />
    <Drawer.Screen name="Reservas" component={ReservationsScreen} options={{
      title: 'Reservas',
      drawerIcon: ({ color, size }) => <Icon name="event-note" color={color} size={size} />
    }} />
    <Drawer.Screen name="Órdenes" component={OrdersScreen} options={{
      title: 'Órdenes',
      drawerIcon: ({ color, size }) => <Icon name="receipt" color={color} size={size} />
    }} />
  </Drawer.Navigator>
);

// ── STYLES ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 22,
  },
  logoRing: {
    padding: 3,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: CYAN + '80',
  },
  logoInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: CYAN + '1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: {
    fontSize: 22,
    fontWeight: '900',
    color: CYAN,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  brandSub: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
    fontWeight: '600',
  },

  // Divider + label
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginHorizontal: 20,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 2.5,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },

  // Menu
  menu: {
    flex: 1,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.2,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  // Footer
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  footerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  footerSub: {
    fontSize: 10,
    color: '#475569',
    marginTop: 1,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Loader } from '../components/Loader';
import { useFetch } from '../hooks/useFetch';
import {
  getCustomers,
  getProducts,
  getTableSpots,
  getReservations,
  getOrders,
} from '../services/api';

const { width } = Dimensions.get('window');

// ── Palette ──────────────────────────────────────────────────
const BG = '#080d1a';
const CARD = '#0f1729';
const BORDER = '#1a2640';
const CYAN = '#00d4d4';
const PURPLE = '#8b5cf6';
const PINK = '#ec4899';
const GREEN = '#10b981';
const GOLD = '#fbbf24';

// ── Pure display components (NO hooks) ───────────────────────
const Sec = ({ label }) => (
  <View style={styles.sec}>
    <View style={styles.secLine} />
    <Text style={styles.secLabel}>{label}</Text>
    <View style={styles.secLine} />
  </View>
);

const MetricNum = ({ value, label, color }) => (
  <View style={styles.metricItem}>
    <Text style={[styles.metricNum, { color }]}>{value}</Text>
    <Text style={styles.metricLbl}>{label}</Text>
  </View>
);

// Ring stat: circle border + center text (no hooks, no rotation tricks)
const RingStat = ({ value, pct, label, color, ringAnim }) => {
  const size = 130;
  const stroke = 14;
  return (
    <View style={[styles.ringCard]}>
      {/* Circle + center */}
      <View style={{ alignSelf: 'center', width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        {/* Background ring */}
        <View style={{
          position: 'absolute',
          width: size, height: size, borderRadius: size / 2,
          borderWidth: stroke, borderColor: BORDER,
        }} />
        {/* Colored ring (shows via opacity only — simpler, no bug) */}
        <View style={{
          position: 'absolute',
          width: size, height: size, borderRadius: size / 2,
          borderWidth: stroke, borderColor: color, opacity: 0.2,
        }} />
        {/* Center content always centered */}
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[styles.ringValue, { color }]}>{value}</Text>
          <Text style={styles.ringPct}>{pct}%</Text>
        </View>
      </View>
      {/* Progress bar below ring */}
      <View style={styles.ringBarTrack}>
        <Animated.View style={[styles.ringBarFill, {
          backgroundColor: color,
          width: ringAnim ? ringAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
            extrapolate: 'clamp',
          }) : `${pct}%`,
        }]} />
      </View>
      <Text style={[styles.ringLabel, { color: COLORS.textSecondary }]}>{label}</Text>
    </View>
  );
};

// Pure bar item (receives animatedHeight as Animated.Value already)
const BarCol = ({ animH, color, label, value, maxH }) => (
  <View style={styles.barItem}>
    <Text style={[styles.barTopVal, { color }]}>{value}</Text>
    <View style={[styles.barTrack, { backgroundColor: color + '18' }]}>
      <Animated.View style={[styles.barFill, { backgroundColor: color, height: animH }]} />
    </View>
    <Text style={styles.barLabel}>{label}</Text>
  </View>
);

// Activity row (pure)
const ActRow = ({ icon, main, sub, accent }) => (
  <View style={styles.actRow}>
    <View style={[styles.actIcon, { backgroundColor: accent + '20', borderColor: accent + '50' }]}>
      <Text style={{ fontSize: 15 }}>{icon}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.actMain}>{main}</Text>
      {sub ? <Text style={styles.actSub}>{sub}</Text> : null}
    </View>
    <View style={[styles.actDot, { backgroundColor: accent }]} />
  </View>
);

// ── MAIN SCREEN ───────────────────────────────────────────────
// ALL hooks declared here unconditionally, before any return.
export const DashboardScreen = () => {
  // 1. Data hooks (always × 5)
  const customers = useFetch(getCustomers);
  const products = useFetch(getProducts);
  const tables = useFetch(getTableSpots);
  const reservations = useFetch(getReservations);
  const orders = useFetch(getOrders);

  // 2. UI state
  const [refreshing, setRefreshing] = useState(false);
  const [counts, setCounts] = useState({ c: 0, p: 0, o: 0, r: 0 });

  // 3. Animation refs (all declared unconditionally)
  const fadeH = useRef(new Animated.Value(0)).current;
  const slideH = useRef(new Animated.Value(-30)).current;
  const prog0 = useRef(new Animated.Value(0)).current; // activePct
  const prog1 = useRef(new Animated.Value(0)).current; // tablesPct
  const bar0 = useRef(new Animated.Value(0)).current;
  const bar1 = useRef(new Animated.Value(0)).current;
  const bar2 = useRef(new Animated.Value(0)).current;
  const bar3 = useRef(new Animated.Value(0)).current;
  const bar4 = useRef(new Animated.Value(0)).current;

  // 4. Compute derived values (safe before data loads)
  const safe = h => h.data || [];
  const totalCustomers = safe(customers).length;
  const totalProducts = safe(products).length;
  const activeProducts = safe(products).filter(p => p.isAvailable !== false && p.is_available !== false).length;
  const totalOrders = safe(orders).length;
  const totalTables = safe(tables).length;
  const availableTables = safe(tables).filter(t => t.status === 'available' || t.available === true).length;
  const totalRes = safe(reservations).length;
  const pendingOrders = safe(orders).filter(o => o.status === 'pending' || o.status === 'preparing').length;
  const activePct = totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0;
  const tablesPct = totalTables > 0 ? Math.round((availableTables / totalTables) * 100) : 0;
  const maxBar = Math.max(totalCustomers, totalProducts, totalOrders, totalRes, totalTables, 1);
  const BAR_H = 90;

  const dataReady = !customers.loading && !products.loading && !tables.loading && !reservations.loading && !orders.loading;

  // 5. Animations effect (runs once data is ready)
  useEffect(() => {
    // Header entrance
    Animated.parallel([
      Animated.spring(slideH, { toValue: 0, useNativeDriver: true, tension: 45, friction: 9 }),
      Animated.timing(fadeH, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    if (!dataReady) return;

    // Count-up
    const total = { c: totalCustomers, p: totalProducts, o: totalOrders, r: totalRes };
    const steps = 30;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const t = step / steps;
      setCounts({
        c: Math.round(total.c * t),
        p: Math.round(total.p * t),
        o: Math.round(total.o * t),
        r: Math.round(total.r * t),
      });
      if (step >= steps) clearInterval(iv);
    }, 800 / steps);

    // Progress rings
    Animated.parallel([
      Animated.timing(prog0, { toValue: activePct, duration: 1000, delay: 300, useNativeDriver: false }),
      Animated.timing(prog1, { toValue: tablesPct, duration: 1000, delay: 450, useNativeDriver: false }),
    ]).start();

    // Bars
    const barData = [totalCustomers, totalProducts, totalOrders, totalRes, totalTables];
    const barRefs = [bar0, bar1, bar2, bar3, bar4];
    Animated.stagger(80, barRefs.map((b, i) =>
      Animated.spring(b, {
        toValue: maxBar > 0 ? (barData[i] / maxBar) * BAR_H : 0,
        useNativeDriver: false, tension: 40, friction: 8,
      })
    )).start();

    return () => clearInterval(iv);
  }, [dataReady]);

  // 6. Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([customers.refetch(), products.refetch(), tables.refetch(), reservations.refetch(), orders.refetch()]);
    setRefreshing(false);
  };

  // 7. Conditional render (AFTER ALL hooks)
  if (!dataReady) return <Loader />;

  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Buenos días ☀️' : hr < 18 ? 'Buenas tardes 🌤️' : 'Buenas noches 🌙';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={CYAN} />}
    >
      {/* ── HEADER ── */}
      <Animated.View style={[styles.header, { opacity: fadeH, transform: [{ translateY: slideH }] }]}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greet}>{greeting}</Text>
            <Text style={styles.brand}>Altavista Rooftop</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>AR</Text>
          </View>
        </View>
        <View style={styles.headerDivider} />
        <Text style={styles.dateStr}>
          {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </Animated.View>

      {/* ── METRIC BAND ── */}
      <View style={styles.metricBand}>
        <MetricNum value={counts.c} label="Clientes" color={CYAN} />
        <View style={styles.metricDiv} />
        <MetricNum value={counts.p} label="Productos" color={PURPLE} />
        <View style={styles.metricDiv} />
        <MetricNum value={counts.o} label="Órdenes" color={PINK} />
        <View style={styles.metricDiv} />
        <MetricNum value={counts.r} label="Reservas" color={GREEN} />
      </View>

      {/* Pending alert */}
      {pendingOrders > 0 && (
        <View style={styles.alert}>
          <Text style={styles.alertTxt}>
            ⚡ <Text style={{ color: PINK, fontWeight: '900' }}>{pendingOrders}</Text> órdenes pendientes
          </Text>
        </View>
      )}

      {/* ── RING STATS ── */}
      <Sec label="DISPONIBILIDAD" />
      <View style={styles.ringsRow}>
        <RingStat value={activeProducts} pct={activePct} label="Productos activos" color={CYAN} ringAnim={prog0} />
        <RingStat value={availableTables} pct={tablesPct} label="Mesas disponibles" color={GREEN} ringAnim={prog1} />
      </View>

      {/* ── BAR CHART ── */}
      <Sec label="RESUMEN GENERAL" />
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Totales por módulo</Text>
        <View style={[styles.barsRow, { height: BAR_H + 36 }]}>
          <BarCol animH={bar0} color={CYAN} label="Clientes" value={totalCustomers} maxH={BAR_H} />
          <BarCol animH={bar1} color={PURPLE} label="Productos" value={totalProducts} maxH={BAR_H} />
          <BarCol animH={bar2} color={PINK} label="Órdenes" value={totalOrders} maxH={BAR_H} />
          <BarCol animH={bar3} color={GREEN} label="Reservas" value={totalRes} maxH={BAR_H} />
          <BarCol animH={bar4} color={GOLD} label="Mesas" value={totalTables} maxH={BAR_H} />
        </View>
      </View>

      {/* ── ACTIVITY ── */}
      <Sec label="ACTIVIDAD RECIENTE" />
      <View style={styles.actCard}>
        {safe(orders).length === 0 && safe(reservations).length === 0 && (
          <Text style={styles.emptyTxt}>Sin actividad reciente</Text>
        )}
        {safe(orders).slice(0, 3).map((o, i) => (
          <ActRow key={'o' + i} icon="🧾"
            main={`Orden #${o.id || i + 1}`}
            sub={o.total_price ? `S/. ${o.total_price}` : null}
            accent={PINK} />
        ))}
        {safe(reservations).slice(0, 3).map((r, i) => (
          <ActRow key={'r' + i} icon="📅"
            main={r.customer_name || 'Reserva'}
            sub={r.party_size ? `${r.party_size} personas` : null}
            accent={PURPLE} />
        ))}
      </View>

      <View style={{ height: 36 }} />
    </ScrollView>
  );
};

// ── STYLES ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    margin: 16, marginBottom: 0,
    backgroundColor: CARD, borderRadius: 22,
    padding: 20, borderWidth: 1, borderColor: BORDER,
    shadowColor: CYAN, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 8,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  greet: { fontSize: 12, color: '#475569', marginBottom: 2 },
  brand: { fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: 0.2 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: CYAN + '22', borderWidth: 2, borderColor: CYAN + '88',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarTxt: { fontSize: 14, fontWeight: '900', color: CYAN },
  headerDivider: { height: 1, backgroundColor: BORDER, marginVertical: 12 },
  dateStr: { fontSize: 11, color: '#334155', textTransform: 'capitalize' },

  // Metrics
  metricBand: {
    flexDirection: 'row', backgroundColor: CARD,
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    paddingVertical: 14, paddingHorizontal: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  metricItem: { flex: 1, alignItems: 'center' },
  metricNum: { fontSize: 26, fontWeight: '900', lineHeight: 30 },
  metricLbl: { fontSize: 9, color: '#475569', marginTop: 3, fontWeight: '600' },
  metricDiv: { width: 1, height: 36, backgroundColor: BORDER, alignSelf: 'center' },

  // Alert
  alert: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 10,
    backgroundColor: PINK + '14', borderRadius: 12,
    borderWidth: 1, borderColor: PINK + '44',
    paddingVertical: 9, paddingHorizontal: 14,
  },
  alertTxt: { fontSize: 13, color: '#cbd5e1' },

  // Section
  sec: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 22, marginBottom: 12, gap: 10,
  },
  secLine: { flex: 1, height: 1, backgroundColor: BORDER },
  secLabel: { fontSize: 9, fontWeight: '800', color: '#334155', letterSpacing: 2.5 },

  // Ring stats
  ringsRow: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 12,
  },
  ringCard: {
    flex: 1, backgroundColor: CARD, borderRadius: 20,
    borderWidth: 1, borderColor: BORDER,
    paddingVertical: 20, paddingHorizontal: 14,
    alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  ringValue: { fontSize: 28, fontWeight: '900', lineHeight: 32, textAlign: 'center' },
  ringPct: { fontSize: 11, color: '#475569', fontWeight: '700', textAlign: 'center' },
  ringBarTrack: {
    width: '100%', height: 5, backgroundColor: BORDER,
    borderRadius: 3, overflow: 'hidden',
  },
  ringBarFill: { height: 5, borderRadius: 3 },
  ringLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  // Bar chart
  chartCard: {
    marginHorizontal: 16, backgroundColor: CARD,
    borderRadius: 20, borderWidth: 1, borderColor: BORDER,
    padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
  },
  chartTitle: { fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 16, letterSpacing: 0.6 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  barItem: { flex: 1, alignItems: 'center', gap: 4 },
  barTopVal: { fontSize: 12, fontWeight: '800' },
  barTrack: {
    width: '80%', borderRadius: 6, justifyContent: 'flex-end',
    overflow: 'hidden',
    height: 90,
  },
  barFill: { width: '100%', borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 8, color: '#475569', fontWeight: '600', textAlign: 'center' },

  // Activity
  actCard: {
    marginHorizontal: 16, backgroundColor: CARD,
    borderRadius: 20, borderWidth: 1, borderColor: BORDER,
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  actRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  actIcon: {
    width: 38, height: 38, borderRadius: 11,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },
  actMain: { fontSize: 13, color: '#e2e8f0', fontWeight: '600' },
  actSub: { fontSize: 11, color: '#475569', marginTop: 2 },
  actDot: { width: 7, height: 7, borderRadius: 3.5 },
  emptyTxt: { fontSize: 12, color: '#334155', textAlign: 'center', paddingVertical: 12, fontStyle: 'italic' },
});

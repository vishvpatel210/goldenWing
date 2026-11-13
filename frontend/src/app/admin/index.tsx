import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenWingTheme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { adminApi, AdminAnalytics } from '../../api/admin.api';
import { LuxuryCard } from '../../components/common/LuxuryCard';
import { Header } from '../../components/common/Header';
import { formatCurrency, formatFlightDate } from '../../utils/formatters';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      Alert.alert('Admin Access Error', err.message || 'Failed to load executive dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      Alert.alert('Access Denied', 'Administrator privileges are required to view this portal.');
      router.replace('/(tabs)');
      return;
    }
    fetchStats();
  }, [isAuthenticated, user, fetchStats, router]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Executive Suite" showBack onBackPress={() => router.replace('/(tabs)/profile')} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={GoldenWingTheme.colors.primaryGold} />
          <Text style={styles.loadingText}>Loading GoldenWing Intelligence...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Admin Command Center"
        showBack
        onBackPress={() => router.replace('/(tabs)/profile')}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}
      >
        {/* Welcome VIP Badge */}
        <View style={styles.adminBadgeRow}>
          <View style={styles.adminShield}>
            <Ionicons name="shield-checkmark" size={18} color="#080808" />
          </View>
          <View>
            <Text style={styles.adminTitle}>EXECUTIVE OPERATING SYSTEM</Text>
            <Text style={styles.adminSub}>Logged in as {user?.name} (Administrator)</Text>
          </View>
        </View>

        {/* Action Shortcuts */}
        <Text style={styles.sectionHeader}>COMMAND ACTIONS</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/admin/flights')}
          >
            <Ionicons name="airplane" size={24} color={GoldenWingTheme.colors.primaryGold} />
            <Text style={styles.actionBtnText}>Manage Flights</Text>
            <Text style={styles.actionBtnSub}>Add, Edit, Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/admin/bookings')}
          >
            <Ionicons name="receipt" size={24} color={GoldenWingTheme.colors.primaryGold} />
            <Text style={styles.actionBtnText}>All Bookings</Text>
            <Text style={styles.actionBtnSub}>Passengers & Manifests</Text>
          </TouchableOpacity>
        </View>

        {/* Financial & Booking Analytics */}
        <Text style={styles.sectionHeader}>REVENUE & BOOKING METRICS</Text>
        <View style={styles.kpiRow}>
          <LuxuryCard style={styles.kpiCard}>
            <View style={styles.kpiIconWrap}>
              <Ionicons name="cash-outline" size={22} color={GoldenWingTheme.colors.primaryGold} />
            </View>
            <Text style={styles.kpiLabel}>TOTAL REVENUE</Text>
            <Text style={styles.kpiValue}>{formatCurrency(analytics?.totalRevenue || 0)}</Text>
          </LuxuryCard>

          <LuxuryCard style={styles.kpiCard}>
            <View style={styles.kpiIconWrap}>
              <Ionicons name="ticket-outline" size={22} color={GoldenWingTheme.colors.primaryGold} />
            </View>
            <Text style={styles.kpiLabel}>TOTAL BOOKINGS</Text>
            <Text style={styles.kpiValue}>{analytics?.totalBookings || 0}</Text>
          </LuxuryCard>
        </View>

        <View style={styles.kpiRow}>
          <LuxuryCard style={styles.kpiCard}>
            <View style={styles.kpiIconWrap}>
              <Ionicons name="checkmark-done-circle-outline" size={22} color="#4ADE80" />
            </View>
            <Text style={styles.kpiLabel}>CONFIRMED</Text>
            <Text style={[styles.kpiValue, { color: '#4ADE80' }]}>{analytics?.confirmedBookings || 0}</Text>
          </LuxuryCard>

          <LuxuryCard style={styles.kpiCard}>
            <View style={styles.kpiIconWrap}>
              <Ionicons name="close-circle-outline" size={22} color="#EF4444" />
            </View>
            <Text style={styles.kpiLabel}>CANCELLED</Text>
            <Text style={[styles.kpiValue, { color: '#EF4444' }]}>{analytics?.cancelledBookings || 0}</Text>
          </LuxuryCard>
        </View>

        {/* Fleet & Passenger Stats */}
        <Text style={styles.sectionHeader}>FLEET & PASSENGERS</Text>
        <LuxuryCard style={styles.fleetCard}>
          <View style={styles.fleetRow}>
            <View>
              <Text style={styles.fleetLabel}>Active Scheduled Routes</Text>
              <Text style={styles.fleetValue}>{analytics?.totalFlights || 0} Luxury Flights</Text>
            </View>
            <Ionicons name="airplane-outline" size={28} color={GoldenWingTheme.colors.primaryGold} />
          </View>

          <View style={styles.divider} />

          <View style={styles.fleetRow}>
            <View>
              <Text style={styles.fleetLabel}>Fleet Occupancy Rate</Text>
              <Text style={styles.fleetValue}>{analytics?.overallOccupancyRate || 0}% Cabin Load</Text>
            </View>
            <Ionicons name="people-outline" size={28} color={GoldenWingTheme.colors.lightGold} />
          </View>

          <View style={styles.divider} />

          <View style={styles.fleetRow}>
            <View>
              <Text style={styles.fleetLabel}>Registered VIP Club Members</Text>
              <Text style={styles.fleetValue}>{analytics?.totalUsers || 0} Travelers</Text>
            </View>
            <Ionicons name="diamond-outline" size={28} color={GoldenWingTheme.colors.primaryGold} />
          </View>
        </LuxuryCard>

        {/* Recent Reservations */}
        {analytics?.recentBookings && analytics.recentBookings.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>RECENT VIP RESERVATIONS</Text>
            {analytics.recentBookings.map((b) => (
              <LuxuryCard key={b._id} style={styles.recentBookingCard}>
                <View style={styles.recentTopRow}>
                  <Text style={styles.recentPnr}>{b.pnr}</Text>
                  <Text style={styles.recentDate}>{formatFlightDate(b.createdAt)}</Text>
                </View>
                <Text style={styles.recentPassenger}>
                  Lead Traveler: {b.passengers[0]?.fullName || 'VIP Guest'}
                </Text>
                <View style={styles.recentBottomRow}>
                  <Text style={styles.recentAmount}>{formatCurrency(b.totalAmount)}</Text>
                  <Text style={styles.recentSeats}>Suites: {b.passengers.map((p) => p.seatNumber).join(', ')}</Text>
                </View>
              </LuxuryCard>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GoldenWingTheme.colors.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 14,
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1C1917',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.primaryGold,
    marginTop: 10,
    marginBottom: 20,
  },
  adminShield: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminTitle: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  adminSub: {
    color: '#E5E5E5',
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeader: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 18,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#171717',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'flex-start',
    gap: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  actionBtnSub: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    padding: 16,
  },
  kpiIconWrap: {
    marginBottom: 10,
  },
  kpiLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  kpiValue: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  fleetCard: {
    padding: 18,
  },
  fleetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fleetLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
  },
  fleetValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#262626',
    marginVertical: 14,
  },
  recentBookingCard: {
    padding: 14,
    marginBottom: 10,
  },
  recentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentPnr: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  recentDate: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
  },
  recentPassenger: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  recentBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  recentAmount: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 14,
    fontWeight: '700',
  },
  recentSeats: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
  },
});

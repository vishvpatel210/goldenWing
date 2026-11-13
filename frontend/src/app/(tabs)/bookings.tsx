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
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenWingTheme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { bookingsApi } from '../../api/bookings.api';
import { Booking } from '../../types';
import { LuxuryCard } from '../../components/common/LuxuryCard';
import { Badge } from '../../components/common/Badge';
import { GoldenButton } from '../../components/common/GoldenButton';
import { formatFlightDate, formatFlightTime, formatCurrency } from '../../utils/formatters';

export default function BookingsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await bookingsApi.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.warn('Failed to load trips:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [isAuthenticated])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'cancelled') return b.status === 'Cancelled';
    if (activeTab === 'completed') return b.status === 'Completed';
    return b.status === 'Confirmed';
  });

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.authPromptContainer}>
          <View style={styles.authIconBox}>
            <Ionicons name="receipt-outline" size={42} color={GoldenWingTheme.colors.primaryGold} />
          </View>
          <Text style={styles.authTitle}>Manage Your Bookings</Text>
          <Text style={styles.authSubtitle}>
            Sign in to view your luxury itineraries, seat selections, and digital VIP boarding passes.
          </Text>
          <GoldenButton
            title="Sign In to Member Account"
            onPress={() => router.push('/(auth)/login')}
            style={{ width: '100%', marginTop: 24 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Trips & Itineraries</Text>
        <Text style={styles.headerSubtitle}>CONFIRMED LUXURY FLIGHTS</Text>
      </View>

      {/* Segmented Filter Bar */}
      <View style={styles.tabBar}>
        {(['upcoming', 'completed', 'cancelled'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={GoldenWingTheme.colors.primaryGold} size="large" />
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={GoldenWingTheme.colors.primaryGold}
            />
          }
          contentContainerStyle={styles.scrollList}
          showsVerticalScrollIndicator={false}
        >
          {filteredBookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="airplane-outline" size={48} color="#333333" />
              <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'upcoming'
                  ? 'Your next luxurious journey begins with GoldenWing.'
                  : `You have no ${activeTab} flights on record.`}
              </Text>
              {activeTab === 'upcoming' ? (
                <GoldenButton
                  title="Search New Flights"
                  variant="outline"
                  onPress={() => router.push('/(tabs)')}
                  style={{ marginTop: 20 }}
                />
              ) : null}
            </View>
          ) : (
            filteredBookings.map((b) => (
              <LuxuryCard
                key={b._id}
                goldBorder
                style={styles.bookingCard}
                onPress={() => router.push(`/ticket/${b.pnr}`)}
              >
                {/* Header row */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.pnrCode}>PNR: {b.pnr}</Text>
                    <Text style={styles.flightNo}>{b.flight?.flightNumber || 'GW-VIP'}</Text>
                  </View>
                  <Badge
                    label={b.status}
                    variant={b.status === 'Confirmed' ? 'gold' : b.status === 'Cancelled' ? 'danger' : 'default'}
                  />
                </View>

                {/* Route Row */}
                <View style={styles.routeRow}>
                  <View>
                    <Text style={styles.airportCode}>{b.flight?.departureAirport?.code}</Text>
                    <Text style={styles.city}>{b.flight?.departureAirport?.city}</Text>
                    <Text style={styles.time}>{formatFlightTime(b.flight?.departureTime)}</Text>
                  </View>

                  <View style={styles.planeIconContainer}>
                    <Ionicons name="airplane" size={20} color={GoldenWingTheme.colors.primaryGold} />
                    <Text style={styles.date}>{formatFlightDate(b.flight?.departureTime)}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.airportCode}>{b.flight?.arrivalAirport?.code}</Text>
                    <Text style={styles.city}>{b.flight?.arrivalAirport?.city}</Text>
                    <Text style={styles.time}>{formatFlightTime(b.flight?.arrivalTime)}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Passengers & View Boarding Pass */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.passengerCount}>
                      {b.passengers?.length} {b.passengers?.length === 1 ? 'Guest' : 'Guests'} • {b.cabinClass.toUpperCase()}
                    </Text>
                    <Text style={styles.totalPrice}>{formatCurrency(b.totalAmount)}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => router.push(`/ticket/${b.pnr}`)}
                    style={styles.passBtn}
                  >
                    <Ionicons name="qr-code-outline" size={16} color="#080808" />
                    <Text style={styles.passBtnText}>Boarding Pass</Text>
                  </TouchableOpacity>
                </View>
              </LuxuryCard>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GoldenWingTheme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#161616',
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
  },
  tabText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: GoldenWingTheme.colors.lightGold,
    fontWeight: '700',
  },
  scrollList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingCard: {
    marginVertical: 8,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pnrCode: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  flightNo: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  airportCode: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  city: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
  },
  time: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  planeIconContainer: {
    alignItems: 'center',
    gap: 4,
  },
  date: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: GoldenWingTheme.colors.border,
    marginVertical: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passengerCount: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
  },
  totalPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  passBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  passBtnText: {
    color: '#080808',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 40,
  },
  authPromptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  authIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GoldenWingTheme.colors.card,
    borderWidth: 1.5,
    borderColor: GoldenWingTheme.colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  authTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  authSubtitle: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
});


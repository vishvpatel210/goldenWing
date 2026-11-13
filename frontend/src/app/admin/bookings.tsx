import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenWingTheme } from '../../constants/theme';
import { adminApi } from '../../api/admin.api';
import { Booking } from '../../types';
import { Header } from '../../components/common/Header';
import { LuxuryCard } from '../../components/common/LuxuryCard';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatFlightDate } from '../../utils/formatters';

export default function AdminBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Cancelled'>('All');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllBookings({
        status: statusFilter === 'All' ? undefined : statusFilter,
        search: search.trim() || undefined,
        limit: 50,
      });
      setBookings(res.bookings);
    } catch (err: any) {
      Alert.alert('Load Error', err.message || 'Cannot retrieve master booking records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Master Passenger Manifest"
        showBack
        onBackPress={() => router.replace('/admin')}
      />

      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={GoldenWingTheme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by PNR or Passenger name..."
            placeholderTextColor="#666"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchBookings}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={GoldenWingTheme.colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['All', 'Confirmed', 'Cancelled'] as const).map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.filterChip, statusFilter === st && styles.filterChipActive]}
              onPress={() => setStatusFilter(st)}
            >
              <Text style={[styles.filterText, statusFilter === st && styles.filterTextActive]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bookings List */}
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={GoldenWingTheme.colors.primaryGold} />
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item._id}
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="documents-outline" size={48} color={GoldenWingTheme.colors.textSecondary} />
                <Text style={styles.emptyText}>No reservations match the search criteria.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <LuxuryCard style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.pnrText}>{item.pnr}</Text>
                    <Text style={styles.dateText}>{formatFlightDate(item.createdAt)}</Text>
                  </View>
                  <Badge
                    label={item.status}
                    variant={item.status === 'Confirmed' ? 'gold' : 'default'}
                  />
                </View>

                {/* Account Owner */}
                <View style={styles.accountRow}>
                  <Ionicons name="person-circle-outline" size={16} color={GoldenWingTheme.colors.primaryGold} />
                  <Text style={styles.accountName}>
                    {item.user?.name || 'VIP Member'} ({item.user?.email || 'N/A'})
                  </Text>
                </View>

                {/* Flight Route */}
                {item.flight ? (
                  <View style={styles.routeRow}>
                    <Text style={styles.flightNum}>{item.flight.flightNumber}</Text>
                    <Text style={styles.flightAirports}>
                      {item.flight.departureAirport?.code || 'ORIGIN'} ➔ {item.flight.arrivalAirport?.code || 'DEST'}
                    </Text>
                  </View>
                ) : null}

                {/* Passenger Manifest */}
                <View style={styles.passengerBox}>
                  <Text style={styles.passengerHeading}>TRAVELING PASSENGERS & SUITES</Text>
                  {item.passengers.map((p, idx) => (
                    <View key={idx} style={styles.passengerItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pName}>{p.fullName}</Text>
                        <Text style={styles.pPassport}>Passport: {p.passportNumber || 'N/A'}</Text>
                      </View>
                      <View style={styles.suitePill}>
                        <Text style={styles.suiteText}>Suite {p.seatNumber}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Financial Summary */}
                <View style={styles.cardFooter}>
                  <Text style={styles.paymentMethod}>{item.paymentMethod || 'GoldenWing Card'}</Text>
                  <Text style={styles.amountText}>{formatCurrency(item.totalAmount)}</Text>
                </View>
              </LuxuryCard>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GoldenWingTheme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171717',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#303030',
  },
  filterChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: GoldenWingTheme.colors.primaryGold,
  },
  filterText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: GoldenWingTheme.colors.primaryGold,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pnrText: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  dateText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  accountName: {
    color: '#D4D4D4',
    fontSize: 13,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E1E1E',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  flightNum: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 13,
    fontWeight: '700',
  },
  flightAirports: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  passengerBox: {
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#242424',
    marginBottom: 12,
  },
  passengerHeading: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  passengerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  pPassport: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
  },
  suitePill: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  suiteText: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#262626',
    paddingTop: 10,
  },
  paymentMethod: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
  },
  amountText: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 14,
  },
});

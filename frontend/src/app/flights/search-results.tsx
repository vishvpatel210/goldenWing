import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenWingTheme } from '../../constants/theme';
import { useBooking } from '../../context/BookingContext';
import { flightsApi } from '../../api/flights.api';
import { Flight } from '../../types';
import { FlightCard } from '../../components/flight/FlightCard';
import { Header } from '../../components/common/Header';

export default function SearchResultsScreen() {
  const router = useRouter();
  const { searchState, setSelectedFlight } = useBooking();

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price_asc' | 'departure_asc' | 'duration_asc'>('price_asc');

  useEffect(() => {
    fetchFlights();
  }, [sortBy]);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const data = await flightsApi.searchFlights({
        origin: searchState.originAirport?.code,
        destination: searchState.destinationAirport?.code,
        cabinClass: searchState.cabinClass,
        sortBy,
      });

      if (data && data.length > 0) {
        setFlights(data);
      } else {
        // Fallback demo flights if database has not been seeded yet
        setFlights(getMockFlights());
      }
    } catch {
      setFlights(getMockFlights());
    } finally {
      setLoading(false);
    }
  };

  const getMockFlights = (): Flight[] => {
    const origin = searchState.originAirport || {
      _id: '1',
      code: 'DXB',
      city: 'Dubai',
      name: 'Dubai International',
      country: 'UAE',
      terminals: ['T3 VIP'],
    };
    const dest = searchState.destinationAirport || {
      _id: '2',
      code: 'LHR',
      city: 'London',
      name: 'Heathrow Airport',
      country: 'UK',
      terminals: ['T5'],
    };

    const dep1 = new Date();
    dep1.setHours(9, 30, 0, 0);
    const arr1 = new Date(dep1.getTime() + 450 * 60000);

    const dep2 = new Date();
    dep2.setHours(15, 45, 0, 0);
    const arr2 = new Date(dep2.getTime() + 460 * 60000);

    const dep3 = new Date();
    dep3.setHours(22, 15, 0, 0);
    const arr3 = new Date(dep3.getTime() + 440 * 60000);

    return [
      {
        _id: 'mock-1',
        flightNumber: 'GW-101',
        airline: 'GoldenWing Airways',
        aircraft: 'Boeing 787-9 Dreamliner',
        departureAirport: origin,
        arrivalAirport: dest,
        departureTime: dep1.toISOString(),
        arrivalTime: arr1.toISOString(),
        durationMinutes: 450,
        gate: 'A12',
        terminal: 'T3 VIP',
        status: 'Scheduled',
        classes: {
          economy: { price: 820, availableSeats: 48, baggageAllowance: '30 kg' },
          business: { price: 2450, availableSeats: 16, baggageAllowance: '40 kg' },
          first: { price: 5800, availableSeats: 6, baggageAllowance: '50 kg' },
        },
        seats: generateMockSeats(),
      },
      {
        _id: 'mock-2',
        flightNumber: 'GW-105',
        airline: 'GoldenWing Airways',
        aircraft: 'Airbus A350-1000 Prestige',
        departureAirport: origin,
        arrivalAirport: dest,
        departureTime: dep2.toISOString(),
        arrivalTime: arr2.toISOString(),
        durationMinutes: 460,
        gate: 'B04',
        terminal: 'T3 VIP',
        status: 'Scheduled',
        classes: {
          economy: { price: 890, availableSeats: 52, baggageAllowance: '30 kg' },
          business: { price: 2600, availableSeats: 18, baggageAllowance: '40 kg' },
          first: { price: 6100, availableSeats: 4, baggageAllowance: '50 kg' },
        },
        seats: generateMockSeats(),
      },
      {
        _id: 'mock-3',
        flightNumber: 'GW-109',
        airline: 'GoldenWing Airways',
        aircraft: 'Boeing 777-300ER Sovereign',
        departureAirport: origin,
        arrivalAirport: dest,
        departureTime: dep3.toISOString(),
        arrivalTime: arr3.toISOString(),
        durationMinutes: 440,
        gate: 'A08',
        terminal: 'T3 VIP',
        status: 'Scheduled',
        classes: {
          economy: { price: 790, availableSeats: 60, baggageAllowance: '30 kg' },
          business: { price: 2350, availableSeats: 22, baggageAllowance: '40 kg' },
          first: { price: 5500, availableSeats: 8, baggageAllowance: '50 kg' },
        },
        seats: generateMockSeats(),
      },
    ];
  };

  const generateMockSeats = () => {
    const list: any[] = [];
    ['1', '2'].forEach((r) => {
      ['A', 'B', 'E', 'F'].forEach((c) => {
        list.push({ seatNumber: `${r}${c}`, cabinClass: 'first', isBooked: c === 'B' });
      });
    });
    ['3', '4', '5', '6'].forEach((r) => {
      ['A', 'B', 'C', 'D'].forEach((c) => {
        list.push({ seatNumber: `${r}${c}`, cabinClass: 'business', isBooked: c === 'C' && r === '4' });
      });
    });
    for (let r = 9; r <= 16; r++) {
      ['A', 'B', 'C', 'D', 'E', 'F'].forEach((c) => {
        list.push({ seatNumber: `${r}${c}`, cabinClass: 'economy', isBooked: (r + c.charCodeAt(0)) % 4 === 0 });
      });
    }
    return list;
  };

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    router.push('/flights/details');
  };

  const routeTitle = `${searchState.originAirport?.code || 'DXB'} ➔ ${searchState.destinationAirport?.code || 'LHR'}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={routeTitle}
        subtitle={`${searchState.cabinClass.toUpperCase()} • ${searchState.passengerCount} ${
          searchState.passengerCount === 1 ? 'GUEST' : 'GUESTS'
        }`}
        showBack
      />

      {/* Sort Options */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>SORT BY:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortOptions}>
          {[
            { id: 'price_asc', label: 'Lowest Price' },
            { id: 'departure_asc', label: 'Departure Time' },
            { id: 'duration_asc', label: 'Shortest Flight' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSortBy(item.id as any)}
              style={[styles.sortChip, sortBy === item.id && styles.sortChipActive]}
            >
              <Text style={[styles.sortChipText, sortBy === item.id && styles.sortChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Flights List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={GoldenWingTheme.colors.primaryGold} size="large" />
          <Text style={styles.loadingText}>Fetching luxury routes...</Text>
        </View>
      ) : (
        <FlatList
          data={flights}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <FlightCard
              flight={item}
              selectedCabinClass={searchState.cabinClass}
              onSelect={handleSelectFlight}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="airplane-outline" size={48} color="#333333" />
              <Text style={styles.emptyTitle}>No Available Flights Found</Text>
              <Text style={styles.emptySubtitle}>Try choosing another departure hub or cabin class.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GoldenWingTheme.colors.background,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: GoldenWingTheme.colors.border,
  },
  sortLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginRight: 10,
  },
  sortOptions: {
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  sortChipActive: {
    borderColor: GoldenWingTheme.colors.primaryGold,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  sortChipText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: GoldenWingTheme.colors.lightGold,
    fontWeight: '700',
  },
  listContainer: {
    paddingVertical: 8,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 13,
    marginTop: 12,
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
    marginTop: 14,
  },
  emptySubtitle: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },
});

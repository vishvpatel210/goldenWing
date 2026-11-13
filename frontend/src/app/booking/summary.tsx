import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenWingTheme } from '../../constants/theme';
import { useBooking } from '../../context/BookingContext';
import { Header } from '../../components/common/Header';
import { LuxuryCard } from '../../components/common/LuxuryCard';
import { GoldenButton } from '../../components/common/GoldenButton';
import {
  formatCurrency,
  formatFlightDate,
  formatFlightTime,
  formatDuration,
} from '../../utils/formatters';

export default function BookingSummaryScreen() {
  const router = useRouter();
  const { selectedFlight, searchState, selectedSeats, passengers, totalPrice } = useBooking();

  if (!selectedFlight) {
    router.replace('/(tabs)');
    return null;
  }

  const taxesAndFees = 120 * searchState.passengerCount;
  const grandTotal = totalPrice + taxesAndFees;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Booking Summary"
        subtitle="VERIFY ITINERARY & GUESTS"
        showBack
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.stepsBar}>
          <View style={styles.stepItemActive}>
            <View style={styles.stepCircleActive}>
              <Text style={styles.stepNumActive}>1</Text>
            </View>
            <Text style={styles.stepTextActive}>Flight</Text>
          </View>
          <View style={styles.stepLineActive} />
          <View style={styles.stepItemActive}>
            <View style={styles.stepCircleActive}>
              <Text style={styles.stepNumActive}>2</Text>
            </View>
            <Text style={styles.stepTextActive}>Seats</Text>
          </View>
          <View style={styles.stepLineActive} />
          <View style={styles.stepItemActive}>
            <View style={styles.stepCircleActive}>
              <Text style={styles.stepNumActive}>3</Text>
            </View>
            <Text style={styles.stepTextActive}>Summary</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepItem}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNum}>4</Text>
            </View>
            <Text style={styles.stepText}>Pay</Text>
          </View>
        </View>

        {/* Flight Overview Card */}
        <LuxuryCard goldBorder style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.airlineName}>{selectedFlight.airline}</Text>
              <Text style={styles.flightNo}>{selectedFlight.flightNumber} • {selectedFlight.aircraft}</Text>
            </View>
            <View style={styles.classPill}>
              <Text style={styles.classPillText}>{searchState.cabinClass.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <View>
              <Text style={styles.airportCode}>{selectedFlight.departureAirport?.code}</Text>
              <Text style={styles.cityName}>{selectedFlight.departureAirport?.city}</Text>
              <Text style={styles.timeText}>{formatFlightTime(selectedFlight.departureTime)}</Text>
            </View>

            <View style={styles.flightPath}>
              <Text style={styles.durationText}>{formatDuration(selectedFlight.durationMinutes)}</Text>
              <View style={styles.pathLine}>
                <Ionicons name="airplane" size={16} color={GoldenWingTheme.colors.primaryGold} />
              </View>
              <Text style={styles.dateText}>{formatFlightDate(selectedFlight.departureTime)}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.airportCode}>{selectedFlight.arrivalAirport?.code}</Text>
              <Text style={styles.cityName}>{selectedFlight.arrivalAirport?.city}</Text>
              <Text style={styles.timeText}>{formatFlightTime(selectedFlight.arrivalTime)}</Text>
            </View>
          </View>
        </LuxuryCard>

        {/* Guests & Seats Card */}
        <Text style={styles.sectionTitle}>PASSENGERS & SUITE ALLOCATIONS</Text>
        <LuxuryCard style={styles.card}>
          {passengers.map((p, idx) => (
            <View key={idx} style={[styles.passengerItem, idx > 0 && styles.passengerItemBorder]}>
              <View style={styles.passengerIconBox}>
                <Ionicons name="person" size={16} color={GoldenWingTheme.colors.primaryGold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.passengerName}>{p.fullName || `Guest ${idx + 1}`}</Text>
                <Text style={styles.passengerSub}>Passport: {p.passportNumber || 'Pending verification'}</Text>
              </View>
              <View style={styles.seatPill}>
                <Text style={styles.seatPillText}>SUITE {selectedSeats[idx] || '1A'}</Text>
              </View>
            </View>
          ))}
        </LuxuryCard>

        {/* Inclusions */}
        <Text style={styles.sectionTitle}>COMPLIMENTARY PRIVILEGES</Text>
        <LuxuryCard style={styles.card}>
          <View style={styles.privilegeRow}>
            <Ionicons name="sparkles" size={16} color={GoldenWingTheme.colors.primaryGold} />
            <Text style={styles.privilegeText}>Private Tarmac Chauffeur Transfer</Text>
          </View>
          <View style={styles.privilegeRow}>
            <Ionicons name="sparkles" size={16} color={GoldenWingTheme.colors.primaryGold} />
            <Text style={styles.privilegeText}>Dedicated VIP Customs & Immigration Lane</Text>
          </View>
          <View style={styles.privilegeRow}>
            <Ionicons name="sparkles" size={16} color={GoldenWingTheme.colors.primaryGold} />
            <Text style={styles.privilegeText}>First Class Lounge Access & Vintage Bar</Text>
          </View>
        </LuxuryCard>

        {/* Fare Summary */}
        <Text style={styles.sectionTitle}>FARE SUMMARY</Text>
        <LuxuryCard style={styles.card}>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>
              Base Ticket ({searchState.passengerCount} {searchState.passengerCount === 1 ? 'Guest' : 'Guests'})
            </Text>
            <Text style={styles.fareValue}>{formatCurrency(totalPrice)}</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Aviation Security & Airport Taxes</Text>
            <Text style={styles.fareValue}>{formatCurrency(taxesAndFees)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.totalAmount}>{formatCurrency(grandTotal)}</Text>
          </View>
        </LuxuryCard>

        {/* Proceed to Payment CTA */}
        <GoldenButton
          title="Proceed to Payment"
          onPress={() => router.push('/booking/payment')}
          size="lg"
          icon={<Ionicons name="lock-closed" size={18} color="#080808" />}
          style={{ marginTop: 24 }}
        />
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
  stepsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 6,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepItemActive: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#202020',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  stepNumActive: {
    color: '#080808',
    fontSize: 11,
    fontWeight: '900',
  },
  stepText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  stepTextActive: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 10,
    fontWeight: '700',
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: '#252525',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  stepLineActive: {
    width: 32,
    height: 2,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  card: {
    marginVertical: 8,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  airlineName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  flightNo: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  classPill: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.primaryGold,
  },
  classPillText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 11,
    fontWeight: '800',
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  airportCode: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  cityName: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  timeText: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  flightPath: {
    alignItems: 'center',
  },
  durationText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  pathLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dateText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
  },
  sectionTitle: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 18,
    marginBottom: 6,
    marginLeft: 4,
  },
  passengerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  passengerItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#242424',
  },
  passengerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
  },
  passengerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  passengerSub: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  seatPill: {
    backgroundColor: '#222222',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.primaryGold,
  },
  seatPillText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 11,
    fontWeight: '800',
  },
  privilegeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  privilegeText: {
    color: GoldenWingTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  fareLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 13,
  },
  fareValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: GoldenWingTheme.colors.border,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  totalAmount: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 24,
    fontWeight: '900',
  },
});


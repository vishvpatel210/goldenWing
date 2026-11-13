import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenWingTheme } from '../../constants/theme';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { bookingsApi } from '../../api/bookings.api';
import { Header } from '../../components/common/Header';
import { LuxuryCard } from '../../components/common/LuxuryCard';
import { GoldenButton } from '../../components/common/GoldenButton';
import { formatCurrency, formatFlightDate, formatFlightTime } from '../../utils/formatters';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { selectedFlight, searchState, selectedSeats, passengers, totalPrice } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'points' | 'applePay'>('card');
  const [loading, setLoading] = useState(false);

  if (!selectedFlight) {
    router.replace('/(tabs)');
    return null;
  }

  const taxesAndFees = 120 * searchState.passengerCount;
  const grandTotal = totalPrice + taxesAndFees;

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Membership Required',
        'Please sign in or join the GoldenWing Elite club to confirm and issue your luxury boarding pass.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const booking = await bookingsApi.createBooking({
        flightId: selectedFlight._id,
        cabinClass: searchState.cabinClass,
        selectedSeats: selectedSeats.length > 0 ? selectedSeats : passengers.map((p) => p.seatNumber || '1A'),
        passengers: passengers.map((p, idx) => ({
          fullName: p.fullName,
          passportNumber: p.passportNumber,
          seatNumber: selectedSeats[idx] || p.seatNumber || '1A',
        })),
        contactDetails: {
          email: user?.email || 'vip@goldenwing.com',
          phone: user?.phone || '+1 555-0199',
        },
        paymentMethod:
          paymentMethod === 'card'
            ? 'GoldenWing Black Diamond VIP Card'
            : paymentMethod === 'points'
            ? 'GoldenWing Elite Miles (Points)'
            : 'Apple Pay Privé',
      });

      // Redirect to confirmation screen with confirmed PNR
      router.replace({
        pathname: '/booking/confirmation',
        params: { pnr: booking.pnr, bookingId: booking._id },
      });
    } catch (err: any) {
      Alert.alert(
        'Booking Failed',
        err.message || 'Unable to complete reservation. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Review & Confirm" subtitle="EXCLUSIVE LUXURY CHECKOUT" showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Flight Summary Card */}
        <LuxuryCard goldBorder style={styles.summaryCard}>
          <View style={styles.flightMetaHeader}>
            <Text style={styles.flightNumber}>{selectedFlight.flightNumber}</Text>
            <Text style={styles.cabinTier}>{searchState.cabinClass.toUpperCase()}</Text>
          </View>

          <View style={styles.routeRow}>
            <View>
              <Text style={styles.airportCode}>{selectedFlight.departureAirport?.code}</Text>
              <Text style={styles.city}>{selectedFlight.departureAirport?.city}</Text>
              <Text style={styles.time}>{formatFlightTime(selectedFlight.departureTime)}</Text>
            </View>

            <View style={styles.planeIconBox}>
              <Ionicons name="airplane" size={20} color={GoldenWingTheme.colors.primaryGold} />
              <Text style={styles.date}>{formatFlightDate(selectedFlight.departureTime)}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.airportCode}>{selectedFlight.arrivalAirport?.code}</Text>
              <Text style={styles.city}>{selectedFlight.arrivalAirport?.city}</Text>
              <Text style={styles.time}>{formatFlightTime(selectedFlight.arrivalTime)}</Text>
            </View>
          </View>
        </LuxuryCard>

        {/* Traveling Guests Card */}
        <Text style={styles.sectionTitle}>TRAVELING GUESTS</Text>
        <LuxuryCard style={styles.guestsCard}>
          {passengers.map((p, idx) => (
            <View key={idx} style={[styles.guestRow, idx > 0 && styles.guestRowBorder]}>
              <View style={styles.guestAvatar}>
                <Ionicons name="person" size={16} color={GoldenWingTheme.colors.primaryGold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guestName}>{p.fullName || `Guest ${idx + 1}`}</Text>
                <Text style={styles.guestPassport}>Passport: {p.passportNumber || 'N/A'}</Text>
              </View>
              <View style={styles.guestSeatPill}>
                <Text style={styles.guestSeatText}>SEAT {selectedSeats[idx] || '1A'}</Text>
              </View>
            </View>
          ))}
        </LuxuryCard>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>
        <View style={styles.paymentMethodsRow}>
          {[
            { id: 'card', name: 'Black VIP Card', icon: 'card-outline' },
            { id: 'points', name: 'Elite Points', icon: 'sparkles-outline' },
            { id: 'applePay', name: 'Apple Pay', icon: 'logo-apple' },
          ].map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setPaymentMethod(m.id as any)}
              style={[
                styles.paymentOption,
                paymentMethod === m.id && styles.paymentOptionActive,
              ]}
            >
              <Ionicons
                name={m.icon as any}
                size={22}
                color={paymentMethod === m.id ? GoldenWingTheme.colors.primaryGold : '#888888'}
              />
              <Text
                style={[
                  styles.paymentOptionText,
                  paymentMethod === m.id && styles.paymentOptionTextActive,
                ]}
              >
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fare Breakdown */}
        <Text style={styles.sectionTitle}>FARE BREAKDOWN</Text>
        <LuxuryCard style={styles.breakdownCard}>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>
              Base Fare ({searchState.passengerCount} {searchState.passengerCount === 1 ? 'Guest' : 'Guests'})
            </Text>
            <Text style={styles.fareValue}>{formatCurrency(totalPrice)}</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Taxes & VIP Aviation Fee</Text>
            <Text style={styles.fareValue}>{formatCurrency(taxesAndFees)}</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Lounge & Dom Pérignon Service</Text>
            <Text style={styles.fareFree}>INCLUDED</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.totalAmount}>{formatCurrency(grandTotal)}</Text>
          </View>
        </LuxuryCard>

        {/* CTA */}
        <GoldenButton
          title={loading ? 'Authorizing Payment...' : `Confirm & Pay ${formatCurrency(grandTotal)}`}
          onPress={handleConfirmBooking}
          loading={loading}
          size="lg"
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
  summaryCard: {
    marginVertical: 12,
    padding: 18,
  },
  flightMetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  flightNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cabinTier: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
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
  planeIconBox: {
    alignItems: 'center',
    gap: 4,
  },
  date: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
  },
  sectionTitle: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 4,
  },
  guestsCard: {
    padding: 14,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  guestRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#252525',
  },
  guestAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
  },
  guestName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  guestPassport: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  guestSeatPill: {
    backgroundColor: '#222222',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.primaryGold,
  },
  guestSeatText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 11,
    fontWeight: '800',
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentOption: {
    flex: 1,
    backgroundColor: GoldenWingTheme.colors.card,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.border,
  },
  paymentOptionActive: {
    borderColor: GoldenWingTheme.colors.primaryGold,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  paymentOptionText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  paymentOptionTextActive: {
    color: GoldenWingTheme.colors.lightGold,
    fontWeight: '700',
  },
  breakdownCard: {
    padding: 18,
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
  fareFree: {
    color: '#2ECC71',
    fontSize: 11,
    fontWeight: '800',
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


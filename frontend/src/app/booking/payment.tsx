import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
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
import { GoldenInput } from '../../components/common/GoldenInput';
import { GoldenButton } from '../../components/common/GoldenButton';
import { formatCurrency } from '../../utils/formatters';

export default function PaymentScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { selectedFlight, searchState, selectedSeats, passengers, totalPrice, resetBooking } = useBooking();

  const [paymentType, setPaymentType] = useState<'blackCard' | 'creditCard' | 'applePay' | 'miles'>('blackCard');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 8849');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Lord Alexander Vance');
  const [expiry, setExpiry] = useState('12/29');
  const [cvv, setCvv] = useState('884');
  const [loading, setLoading] = useState(false);

  if (!selectedFlight) {
    router.replace('/(tabs)');
    return null;
  }

  const taxesAndFees = 120 * searchState.passengerCount;
  const grandTotal = totalPrice + taxesAndFees;

  const handlePay = async () => {
    setLoading(true);

    try {
      if (isAuthenticated) {
        const booking = await bookingsApi.createBooking({
          flightId: selectedFlight._id,
          cabinClass: searchState.cabinClass,
          passengers: passengers.map((p, idx) => ({
            fullName: p.fullName || `Guest ${idx + 1}`,
            passportNumber: p.passportNumber || 'E884920',
            seatNumber: selectedSeats[idx] || p.seatNumber || '1A',
          })),
          paymentMethod:
            paymentType === 'blackCard'
              ? 'GoldenWing Black Diamond VIP Card'
              : paymentType === 'miles'
              ? 'GoldenWing Elite Miles'
              : paymentType === 'applePay'
              ? 'Apple Pay Privé'
              : 'Mastercard World Elite',
        });

        router.replace({
          pathname: '/booking/confirmation',
          params: { pnr: booking.pnr, bookingId: booking._id },
        });
      } else {
        // Guest fallback
        const mockPnr = `GW${Math.floor(1000 + Math.random() * 9000)}`;
        router.replace({
          pathname: '/booking/confirmation',
          params: { pnr: mockPnr, bookingId: 'guest-booking' },
        });
      }
    } catch {
      const mockPnr = `GW${Math.floor(1000 + Math.random() * 9000)}`;
      router.replace({
        pathname: '/booking/confirmation',
        params: { pnr: mockPnr, bookingId: 'mock-booking' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Secure Payment"
        subtitle="256-BIT ENCRYPTED GATEWAY"
        showBack
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Virtual Black Diamond VIP Card */}
          <View style={styles.cardPreview}>
            <View style={styles.cardBrandRow}>
              <View style={styles.cardBrandBadge}>
                <Ionicons name="airplane" size={16} color={GoldenWingTheme.colors.primaryGold} />
                <Text style={styles.cardBrandText}>GOLDENWING PRIVÉ</Text>
              </View>
              <Text style={styles.cardType}>BLACK DIAMOND</Text>
            </View>

            <View style={styles.chipRow}>
              <View style={styles.simChip}>
                <View style={styles.chipLine} />
                <View style={styles.chipLine} />
              </View>
              <Ionicons
                name="wifi"
                size={22}
                color={GoldenWingTheme.colors.primaryGold}
                style={{ transform: [{ rotate: '90deg' }] }}
              />
            </View>

            <Text style={styles.cardNumberText}>
              {paymentType === 'blackCard' ? '4188 •••• •••• 8849' : cardNumber || '•••• •••• •••• ••••'}
            </Text>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardMetaLabel}>CARDHOLDER</Text>
                <Text style={styles.cardMetaVal} numberOfLines={1}>{cardHolder}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.cardMetaLabel}>EXPIRES</Text>
                <Text style={styles.cardMetaVal}>{expiry}</Text>
              </View>
            </View>
          </View>

          {/* Payment Method Selector */}
          <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>
          <View style={styles.methodSelectorRow}>
            {[
              { id: 'blackCard', name: 'VIP Card', icon: 'card' },
              { id: 'creditCard', name: 'New Card', icon: 'card-outline' },
              { id: 'applePay', name: 'Apple Pay', icon: 'logo-apple' },
              { id: 'miles', name: 'Miles', icon: 'sparkles' },
            ].map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => setPaymentType(m.id as any)}
                style={[
                  styles.methodTab,
                  paymentType === m.id && styles.methodTabActive,
                ]}
              >
                <Ionicons
                  name={m.icon as any}
                  size={20}
                  color={paymentType === m.id ? GoldenWingTheme.colors.primaryGold : '#777777'}
                />
                <Text
                  style={[
                    styles.methodTabText,
                    paymentType === m.id && styles.methodTabTextActive,
                  ]}
                >
                  {m.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Card Form Inputs (if creditCard selected) */}
          {paymentType === 'creditCard' ? (
            <LuxuryCard style={styles.formCard}>
              <GoldenInput
                label="Card Number"
                placeholder="4000 1234 5678 9010"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                maxLength={19}
                leftIcon={<Ionicons name="card-outline" size={18} color={GoldenWingTheme.colors.textSecondary} />}
              />

              <GoldenInput
                label="Cardholder Full Name"
                placeholder="e.g. Lord Alexander Vance"
                value={cardHolder}
                onChangeText={setCardHolder}
                leftIcon={<Ionicons name="person-outline" size={18} color={GoldenWingTheme.colors.textSecondary} />}
              />

              <View style={styles.splitRow}>
                <View style={{ flex: 1 }}>
                  <GoldenInput
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={expiry}
                    onChangeText={setExpiry}
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <GoldenInput
                    label="Security CVV"
                    placeholder="3 or 4 digits"
                    value={cvv}
                    onChangeText={setCvv}
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
            </LuxuryCard>
          ) : paymentType === 'blackCard' ? (
            <LuxuryCard style={styles.vipPerksCard}>
              <View style={styles.vipPerkHeader}>
                <Ionicons name="shield-checkmark" size={24} color={GoldenWingTheme.colors.primaryGold} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.vipPerkTitle}>GoldenWing Concierge Billing</Text>
                  <Text style={styles.vipPerkDesc}>
                    Charges will be posted directly to your monthly private flight account.
                  </Text>
                </View>
              </View>
            </LuxuryCard>
          ) : paymentType === 'applePay' ? (
            <LuxuryCard style={styles.applePayCard}>
              <Ionicons name="logo-apple" size={36} color="#FFFFFF" />
              <Text style={styles.applePayText}>
                Authenticate with FaceID / TouchID to confirm booking.
              </Text>
            </LuxuryCard>
          ) : (
            <LuxuryCard style={styles.vipPerksCard}>
              <View style={styles.vipPerkHeader}>
                <Ionicons name="sparkles" size={24} color={GoldenWingTheme.colors.primaryGold} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.vipPerkTitle}>Pay With Elite Miles</Text>
                  <Text style={styles.vipPerkDesc}>
                    120,000 miles will be deducted from your member balance.
                  </Text>
                </View>
              </View>
            </LuxuryCard>
          )}

          {/* Total & Authorize CTA */}
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>TOTAL DUE</Text>
              <Text style={styles.totalAmount}>{formatCurrency(grandTotal)}</Text>
            </View>

            <View style={styles.secureBadge}>
              <Ionicons name="lock-closed" size={14} color="#2ECC71" />
              <Text style={styles.secureText}>256-Bit SSL</Text>
            </View>
          </View>

          <GoldenButton
            title={loading ? 'Processing Authorisation...' : `Authorize ${formatCurrency(grandTotal)}`}
            onPress={handlePay}
            loading={loading}
            size="lg"
            style={{ marginTop: 16 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  cardPreview: {
    backgroundColor: '#121212',
    borderRadius: 18,
    padding: 22,
    marginVertical: 14,
    borderWidth: 1.5,
    borderColor: GoldenWingTheme.colors.primaryGold,
    shadowColor: GoldenWingTheme.colors.primaryGold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  cardBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardBrandText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  cardType: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: 20,
  },
  simChip: {
    width: 36,
    height: 26,
    borderRadius: 5,
    backgroundColor: '#8C7322',
    borderWidth: 1,
    borderColor: '#F5D77A',
    justifyContent: 'space-around',
    paddingVertical: 3,
  },
  chipLine: {
    height: 1,
    backgroundColor: '#121212',
  },
  cardNumberText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardMetaLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardMetaVal: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 16,
    marginBottom: 10,
    marginLeft: 4,
  },
  methodSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  methodTab: {
    flex: 1,
    backgroundColor: GoldenWingTheme.colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.border,
  },
  methodTabActive: {
    borderColor: GoldenWingTheme.colors.primaryGold,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  methodTabText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  methodTabTextActive: {
    color: GoldenWingTheme.colors.lightGold,
    fontWeight: '700',
  },
  formCard: {
    padding: 18,
    marginBottom: 14,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  vipPerksCard: {
    padding: 18,
    marginVertical: 8,
  },
  vipPerkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  vipPerkTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  vipPerkDesc: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  applePayCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    marginVertical: 8,
  },
  applePayText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  totalLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  totalAmount: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 26,
    fontWeight: '900',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(46, 204, 113, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2ECC71',
  },
  secureText: {
    color: '#2ECC71',
    fontSize: 11,
    fontWeight: '700',
  },
});


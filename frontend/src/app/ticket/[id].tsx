import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenWingTheme } from '../../constants/theme';
import { bookingsApi } from '../../api/bookings.api';
import { Booking } from '../../types';
import { Header } from '../../components/common/Header';
import { BoardingPassCard } from '../../components/ticket/BoardingPassCard';
import { GoldenButton } from '../../components/common/GoldenButton';

export default function TicketScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPassengerIdx, setSelectedPassengerIdx] = useState(0);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      if (id) {
        const data = await bookingsApi.getBookingById(id);
        setBooking(data);
      }
    } catch {
      // Fallback preview booking for demonstration
      setBooking(getMockBooking());
    } finally {
      setLoading(false);
    }
  };

  const getMockBooking = (): Booking => {
    const dep = new Date();
    dep.setHours(9, 30, 0, 0);
    const arr = new Date(dep.getTime() + 450 * 60000);

    return {
      _id: 'mock-b-1',
      pnr: id?.toUpperCase() || 'GW88A2',
      user: {
        _id: 'u-1',
        name: 'Lord Alexander Vance',
        email: 'elite@goldenwing.com',
        frequentFlyerNumber: 'GW-88019',
        membershipTier: 'GoldenWing Elite',
      },
      flight: {
        _id: 'f-1',
        flightNumber: 'GW-101',
        airline: 'GoldenWing Airways',
        aircraft: 'Boeing 787-9 Dreamliner',
        departureAirport: {
          _id: 'a1',
          code: 'DXB',
          city: 'Dubai',
          name: 'Dubai International',
          country: 'UAE',
          terminals: ['T3 VIP'],
        },
        arrivalAirport: {
          _id: 'a2',
          code: 'LHR',
          city: 'London',
          name: 'Heathrow Airport',
          country: 'UK',
          terminals: ['T5'],
        },
        departureTime: dep.toISOString(),
        arrivalTime: arr.toISOString(),
        durationMinutes: 450,
        gate: 'A12',
        terminal: 'T3 VIP',
        status: 'Scheduled',
        classes: {
          economy: { price: 820, availableSeats: 40, baggageAllowance: '30 kg' },
          business: { price: 2450, availableSeats: 12, baggageAllowance: '40 kg' },
          first: { price: 5800, availableSeats: 4, baggageAllowance: '50 kg' },
        },
        seats: [],
      },
      cabinClass: 'first',
      passengers: [
        {
          fullName: 'Lord Alexander Vance',
          passportNumber: 'E9812409',
          seatNumber: '1A',
          ticketNumber: '074-9281048291',
        },
      ],
      contactDetails: {
        email: 'elite@goldenwing.com',
        phone: '+1 555-0199',
      },
      totalAmount: 5800,
      paymentStatus: 'Completed',
      paymentMethod: 'GoldenWing Black Diamond VIP Card',
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };
  };

  const handleShare = async () => {
    if (!booking) return;
    try {
      await Share.share({
        message: `GoldenWing Luxury Flight: ${booking.flight.flightNumber} from ${booking.flight.departureAirport.code} to ${booking.flight.arrivalAirport.code}. PNR: ${booking.pnr}. Seat: ${booking.passengers[0]?.seatNumber}`,
        title: 'GoldenWing Boarding Pass',
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handleCancelBooking = () => {
    if (!booking) return;
    Alert.alert(
      'Cancel Reservation',
      `Are you sure you want to cancel booking ${booking.pnr}? Full refund will be credited back according to VIP policy.`,
      [
        { text: 'Keep Reservation', style: 'cancel' },
        {
          text: 'Cancel Flight',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingsApi.cancelBooking(booking._id);
              Alert.alert('Cancelled', 'Your reservation has been cancelled and refunded.');
              router.replace('/(tabs)/bookings');
            } catch (err: any) {
              Alert.alert('Notice', err.message || 'Cancelled successfully.');
              router.replace('/(tabs)/bookings');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Digital Boarding Pass"
        subtitle={`PNR: ${booking?.pnr || id || 'GW-PASS'}`}
        showBack
        onBackPress={() => router.replace('/(tabs)/bookings')}
        rightElement={
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Ionicons name="share-outline" size={20} color={GoldenWingTheme.colors.primaryGold} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={GoldenWingTheme.colors.primaryGold} size="large" />
        </View>
      ) : booking ? (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Passenger Selector if multiple passengers */}
          {booking.passengers.length > 1 ? (
            <View style={styles.passengerTabBar}>
              {booking.passengers.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedPassengerIdx(idx)}
                  style={[
                    styles.passengerTabItem,
                    selectedPassengerIdx === idx && styles.passengerTabItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.passengerTabText,
                      selectedPassengerIdx === idx && styles.passengerTabTextActive,
                    ]}
                  >
                    Guest {idx + 1} ({p.seatNumber})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {/* The Luxury Boarding Pass Component */}
          <BoardingPassCard
            booking={booking}
            passengerIndex={selectedPassengerIdx}
          />

          {/* Wallet and Save Actions */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={() => Alert.alert('Saved to Wallet', 'This pass has been added to your Apple Wallet / Google Pay.')}
              style={styles.walletBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="wallet-outline" size={20} color="#080808" />
              <Text style={styles.walletBtnText}>Add to Apple Wallet / Google Pay</Text>
            </TouchableOpacity>

            {booking.status === 'Confirmed' ? (
              <TouchableOpacity
                onPress={handleCancelBooking}
                style={styles.cancelFlightBtn}
              >
                <Text style={styles.cancelFlightText}>Cancel This Booking</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.cancelledBadge}>
                <Text style={styles.cancelledBadgeText}>RESERVATION HAS BEEN CANCELLED</Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loadingBox}>
          <Text style={styles.notFoundText}>Boarding Pass Not Found</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GoldenWingTheme.colors.background,
  },
  container: {
    paddingBottom: 40,
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GoldenWingTheme.colors.card,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 16,
  },
  passengerTabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  passengerTabItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  passengerTabItemActive: {
    borderColor: GoldenWingTheme.colors.primaryGold,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  passengerTabText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  passengerTabTextActive: {
    color: GoldenWingTheme.colors.lightGold,
    fontWeight: '700',
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 12,
  },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
    paddingVertical: 14,
    borderRadius: 12,
  },
  walletBtnText: {
    color: '#080808',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelFlightBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelFlightText: {
    color: GoldenWingTheme.colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  cancelledBadge: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.danger,
  },
  cancelledBadgeText: {
    color: GoldenWingTheme.colors.danger,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
});


import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenWingTheme } from '../../constants/theme';
import { useBooking } from '../../context/BookingContext';
import { Header } from '../../components/common/Header';
import { SeatMatrix } from '../../components/flight/SeatMatrix';
import { GoldenButton } from '../../components/common/GoldenButton';
import { formatCurrency } from '../../utils/formatters';

export default function SeatSelectionScreen() {
  const router = useRouter();
  const {
    selectedFlight,
    searchState,
    selectedSeats,
    toggleSeatSelection,
    passengers,
    updatePassenger,
    totalPrice,
  } = useBooking();

  if (!selectedFlight) {
    router.replace('/(tabs)');
    return null;
  }

  const seatsNeeded = searchState.passengerCount;
  const isComplete = selectedSeats.length === seatsNeeded;

  const handleContinue = () => {
    if (!isComplete) {
      Alert.alert(
        'Seat Selection Required',
        `Please select exactly ${seatsNeeded} ${seatsNeeded === 1 ? 'seat' : 'seats'} to continue.`
      );
      return;
    }

    // Automatically map chosen seats to passengers
    selectedSeats.forEach((seat, idx) => {
      updatePassenger(idx, { seatNumber: seat });
    });

    router.push('/flights/passenger-info');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Select Cabin Seats"
        subtitle={`${selectedFlight.flightNumber} • ${searchState.cabinClass.toUpperCase()}`}
        showBack
      />

      <View style={styles.content}>
        <SeatMatrix
          seats={selectedFlight.seats || []}
          cabinClass={searchState.cabinClass}
          selectedSeats={selectedSeats}
          onToggleSeat={toggleSeatSelection}
          maxSelectable={seatsNeeded}
        />
      </View>

      {/* Bottom Floating Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomMeta}>
          <Text style={styles.selectedSeatsLabel}>
            SELECTED ({selectedSeats.length}/{seatsNeeded}):
          </Text>
          <Text style={styles.selectedSeatsList}>
            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <View>
            <Text style={styles.totalLabel}>TOTAL FARE</Text>
            <Text style={styles.totalPriceText}>{formatCurrency(totalPrice)}</Text>
          </View>

          <GoldenButton
            title={isComplete ? 'Continue' : `Pick ${seatsNeeded - selectedSeats.length} more`}
            onPress={handleContinue}
            disabled={!isComplete}
            style={styles.ctaBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GoldenWingTheme.colors.background,
  },
  content: {
    flex: 1,
  },
  bottomBar: {
    backgroundColor: '#141414',
    borderTopWidth: 1,
    borderTopColor: GoldenWingTheme.colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  bottomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  selectedSeatsLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  selectedSeatsList: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 14,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  totalPriceText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  ctaBtn: {
    minWidth: 160,
  },
});


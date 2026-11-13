import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Seat, CabinClass } from '../../types';
import { GoldenWingTheme } from '../../constants/theme';

interface SeatMatrixProps {
  seats: Seat[];
  cabinClass: CabinClass;
  selectedSeats: string[];
  onToggleSeat: (seatNumber: string) => void;
  maxSelectable: number;
}

export const SeatMatrix: React.FC<SeatMatrixProps> = ({
  seats,
  cabinClass,
  selectedSeats,
  onToggleSeat,
  maxSelectable,
}) => {
  // Filter seats by active cabin class
  const classSeats = seats.filter((s) => s.cabinClass === cabinClass);

  // Group seats by row number
  const rowsMap = new Map<string, Seat[]>();
  classSeats.forEach((seat) => {
    const rowNum = seat.seatNumber.replace(/\D/g, '');
    if (!rowsMap.has(rowNum)) {
      rowsMap.set(rowNum, []);
    }
    rowsMap.get(rowNum)?.push(seat);
  });

  const rowNumbers = Array.from(rowsMap.keys()).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const renderSeat = (seat?: Seat) => {
    if (!seat) {
      return <View style={styles.seatEmptyPlaceholder} />;
    }

    const isSelected = selectedSeats.includes(seat.seatNumber);
    const isBooked = seat.isBooked;

    let seatStyle: any = styles.seatAvailable;
    let textStyle: any = styles.seatTextAvailable;

    if (isBooked) {
      seatStyle = styles.seatBooked;
      textStyle = styles.seatTextBooked;
    } else if (isSelected) {
      seatStyle = styles.seatSelected;
      textStyle = styles.seatTextSelected;
    }

    return (
      <TouchableOpacity
        key={seat.seatNumber}
        disabled={isBooked}
        onPress={() => onToggleSeat(seat.seatNumber)}
        activeOpacity={0.7}
        style={[styles.seatBase, seatStyle]}
      >
        <Text style={[styles.seatTextBase, textStyle]}>{seat.seatNumber}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.seatAvailable]} />
          <Text style={styles.legendLabel}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.seatSelected]} />
          <Text style={styles.legendLabel}>Selected ({selectedSeats.length}/{maxSelectable})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.seatBooked]} />
          <Text style={styles.legendLabel}>Booked</Text>
        </View>
      </View>

      {/* Cockpit Indicator */}
      <View style={styles.cockpitIndicator}>
        <View style={styles.cockpitArch} />
        <Text style={styles.cockpitText}>FRONT OF AIRCRAFT</Text>
      </View>

      {/* Seat Rows Scroll */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.rowsContainer}
      >
        {rowNumbers.map((rowNum) => {
          const rowSeats = rowsMap.get(rowNum) || [];
          return (
            <View key={rowNum} style={styles.row}>
              <Text style={styles.rowLabel}>{rowNum}</Text>

              {/* Seats layout based on Cabin Class */}
              {cabinClass === 'economy' ? (
                // 3 - 3 layout (A B C - aisle - D E F)
                <View style={styles.rowSeatGroup}>
                  <View style={styles.seatSide}>
                    {renderSeat(rowSeats.find((s) => s.seatNumber === `${rowNum}A`))}
                    {renderSeat(rowSeats.find((s) => s.seatNumber === `${rowNum}B`))}
                    {renderSeat(rowSeats.find((s) => s.seatNumber === `${rowNum}C`))}
                  </View>
                  <View style={styles.aisle} />
                  <View style={styles.seatSide}>
                    {renderSeat(rowSeats.find((s) => s.seatNumber === `${rowNum}D`))}
                    {renderSeat(rowSeats.find((s) => s.seatNumber === `${rowNum}E`))}
                    {renderSeat(rowSeats.find((s) => s.seatNumber === `${rowNum}F`))}
                  </View>
                </View>
              ) : (
                // 2 - 2 layout for First and Business
                <View style={styles.rowSeatGroup}>
                  <View style={styles.seatSide}>
                    {renderSeat(rowSeats[0])}
                    {renderSeat(rowSeats[1])}
                  </View>
                  <View style={styles.aisleWide} />
                  <View style={styles.seatSide}>
                    {renderSeat(rowSeats[2])}
                    {renderSeat(rowSeats[3])}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: GoldenWingTheme.colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
  },
  legendLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
  },
  cockpitIndicator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  cockpitArch: {
    width: 120,
    height: 24,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: GoldenWingTheme.colors.primaryGold,
    marginBottom: 4,
  },
  cockpitText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  rowsContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  rowLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  },
  rowSeatGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatSide: {
    flexDirection: 'row',
    gap: 8,
  },
  aisle: {
    width: 28,
  },
  aisleWide: {
    width: 44,
  },
  seatBase: {
    width: 40,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatEmptyPlaceholder: {
    width: 40,
    height: 44,
  },
  seatAvailable: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
  },
  seatSelected: {
    backgroundColor: GoldenWingTheme.colors.primaryGold,
    shadowColor: GoldenWingTheme.colors.primaryGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 4,
  },
  seatBooked: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    opacity: 0.5,
  },
  seatTextBase: {
    fontSize: 12,
    fontWeight: '700',
  },
  seatTextAvailable: {
    color: GoldenWingTheme.colors.textPrimary,
  },
  seatTextSelected: {
    color: '#080808',
  },
  seatTextBooked: {
    color: '#444444',
  },
});

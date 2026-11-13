import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../../types';
import { GoldenWingTheme } from '../../constants/theme';
import { formatFlightTime, formatFlightDate } from '../../utils/formatters';

interface BoardingPassCardProps {
  booking: Booking;
  passengerIndex?: number;
}

export const BoardingPassCard: React.FC<BoardingPassCardProps> = ({
  booking,
  passengerIndex = 0,
}) => {
  const passenger = booking.passengers[passengerIndex] || booking.passengers[0];
  const flight = booking.flight;

  return (
    <View style={styles.cardContainer}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <View style={styles.airlineBadge}>
            <Ionicons name="airplane" size={18} color={GoldenWingTheme.colors.primaryGold} />
            <Text style={styles.airlineName}>GOLDENWING AIRWAYS</Text>
          </View>
          <View style={styles.classBadge}>
            <Text style={styles.classBadgeText}>{booking.cabinClass.toUpperCase()}</Text>
          </View>
        </View>

        {/* Route Row */}
        <View style={styles.routeRow}>
          <View>
            <Text style={styles.city}>{flight.departureAirport?.city}</Text>
            <Text style={styles.airportCode}>{flight.departureAirport?.code}</Text>
            <Text style={styles.time}>{formatFlightTime(flight.departureTime)}</Text>
          </View>

          <View style={styles.planeIconContainer}>
            <Text style={styles.flightNo}>{flight.flightNumber}</Text>
            <Ionicons
              name="airplane-sharp"
              size={24}
              color={GoldenWingTheme.colors.primaryGold}
            />
            <Text style={styles.date}>{formatFlightDate(flight.departureTime)}</Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.city}>{flight.arrivalAirport?.city}</Text>
            <Text style={styles.airportCode}>{flight.arrivalAirport?.code}</Text>
            <Text style={styles.time}>{formatFlightTime(flight.arrivalTime)}</Text>
          </View>
        </View>

        {/* Flight Details Grid */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>PASSENGER</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {passenger?.fullName || 'VIP Guest'}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>SEAT</Text>
            <Text style={styles.seatValue}>{passenger?.seatNumber || '1A'}</Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>GATE</Text>
            <Text style={styles.metaValue}>{flight.gate || 'A12'}</Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>TERMINAL</Text>
            <Text style={styles.metaValue}>{flight.terminal || 'T3'}</Text>
          </View>
        </View>
      </View>

      {/* Perforation Cutouts */}
      <View style={styles.perforationContainer}>
        <View style={styles.cutoutLeft} />
        <View style={styles.perforationLine} />
        <View style={styles.cutoutRight} />
      </View>

      {/* Bottom Stub / Barcode Section */}
      <View style={styles.bottomSection}>
        <View style={styles.stubMetaRow}>
          <View>
            <Text style={styles.metaLabel}>BOOKING REF (PNR)</Text>
            <Text style={styles.pnrCode}>{booking.pnr}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.metaLabel}>E-TICKET</Text>
            <Text style={styles.metaValue}>{passenger?.ticketNumber || '074-2918402'}</Text>
          </View>
        </View>

        {/* Simulated Barcode */}
        <View style={styles.barcodeBox}>
          <View style={styles.barcodeLines}>
            {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4].map(
              (weight, i) => (
                <View
                  key={i}
                  style={[
                    styles.barcodeBar,
                    { width: weight * 2, marginHorizontal: weight > 2 ? 3 : 1 },
                  ]}
                />
              )
            )}
          </View>
          <Text style={styles.barcodeNumber}>
            *{booking.pnr}-{passenger?.seatNumber || '1A'}*
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#121212',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: GoldenWingTheme.colors.borderGold,
    shadowColor: GoldenWingTheme.colors.primaryGold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  topSection: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  airlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  airlineName: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  classBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.primaryGold,
  },
  classBadgeText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  city: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  airportCode: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
    marginVertical: 2,
  },
  time: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 14,
    fontWeight: '700',
  },
  planeIconContainer: {
    alignItems: 'center',
  },
  flightNo: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  date: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 6,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 14,
  },
  metaItem: {
    alignItems: 'flex-start',
  },
  metaLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metaValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  seatValue: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 16,
    fontWeight: '800',
  },
  perforationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 24,
  },
  cutoutLeft: {
    width: 20,
    height: 24,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: GoldenWingTheme.colors.background,
    marginLeft: -1,
  },
  cutoutRight: {
    width: 20,
    height: 24,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: GoldenWingTheme.colors.background,
    marginRight: -1,
  },
  perforationLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#333333',
  },
  bottomSection: {
    padding: 20,
    paddingTop: 8,
  },
  stubMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pnrCode: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  barcodeBox: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#181818',
    borderRadius: 10,
  },
  barcodeLines: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
  },
  barcodeBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  barcodeNumber: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 6,
  },
});


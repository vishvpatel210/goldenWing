import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Flight, CabinClass } from '../../types';
import { GoldenWingTheme } from '../../constants/theme';
import { formatCurrency, formatFlightTime, formatDuration } from '../../utils/formatters';
import { Badge } from '../common/Badge';

interface FlightCardProps {
  flight: Flight;
  selectedCabinClass: CabinClass;
  onSelect: (flight: Flight) => void;
  onToggleWishlist?: (flight: Flight) => void;
  isWishlisted?: boolean;
}

export const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  selectedCabinClass,
  onSelect,
  onToggleWishlist,
  isWishlisted = false,
}) => {
  const classInfo = flight.classes[selectedCabinClass] || flight.classes.economy;
  const price = classInfo.price;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onSelect(flight)}
      style={styles.card}
    >
      {/* Top Bar: Flight number, Aircraft, Status */}
      <View style={styles.topRow}>
        <View style={styles.flightMeta}>
          <Ionicons name="airplane" size={16} color={GoldenWingTheme.colors.primaryGold} />
          <Text style={styles.flightNumber}>{flight.flightNumber}</Text>
          <Text style={styles.aircraft}>{flight.aircraft}</Text>
        </View>
        <View style={styles.topActions}>
          {onToggleWishlist ? (
            <TouchableOpacity
              onPress={() => onToggleWishlist(flight)}
              style={styles.bookmarkBtn}
            >
              <Ionicons
                name={isWishlisted ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={isWishlisted ? GoldenWingTheme.colors.primaryGold : GoldenWingTheme.colors.textSecondary}
              />
            </TouchableOpacity>
          ) : null}
          <Badge
            label={flight.status}
            variant={flight.status === 'Scheduled' || flight.status === 'Boarding' ? 'gold' : 'default'}
          />
        </View>
      </View>

      {/* Middle Row: Route, Times, Duration */}
      <View style={styles.routeRow}>
        {/* Origin */}
        <View style={styles.airportBlock}>
          <Text style={styles.timeText}>{formatFlightTime(flight.departureTime)}</Text>
          <Text style={styles.airportCode}>{flight.departureAirport?.code}</Text>
          <Text style={styles.cityName} numberOfLines={1}>
            {flight.departureAirport?.city}
          </Text>
        </View>

        {/* Flight Path Graphic */}
        <View style={styles.pathGraphic}>
          <Text style={styles.durationText}>{formatDuration(flight.durationMinutes)}</Text>
          <View style={styles.lineContainer}>
            <View style={styles.dot} />
            <View style={styles.line} />
            <Ionicons
              name="airplane-outline"
              size={18}
              color={GoldenWingTheme.colors.primaryGold}
              style={styles.planeIcon}
            />
            <View style={styles.line} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.nonstopText}>Non-stop</Text>
        </View>

        {/* Destination */}
        <View style={[styles.airportBlock, { alignItems: 'flex-end' }]}>
          <Text style={styles.timeText}>{formatFlightTime(flight.arrivalTime)}</Text>
          <Text style={styles.airportCode}>{flight.arrivalAirport?.code}</Text>
          <Text style={styles.cityName} numberOfLines={1}>
            {flight.arrivalAirport?.city}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Bottom Bar: Baggage and Price CTA */}
      <View style={styles.bottomRow}>
        <View style={styles.baggageInfo}>
          <Ionicons name="briefcase-outline" size={14} color={GoldenWingTheme.colors.textSecondary} />
          <Text style={styles.baggageText}>{classInfo.baggageAllowance} included</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.fromLabel}>from</Text>
          <Text style={styles.priceText}>{formatCurrency(price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: GoldenWingTheme.colors.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  flightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flightNumber: {
    color: GoldenWingTheme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  aircraft: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  airportBlock: {
    width: '28%',
  },
  timeText: {
    color: GoldenWingTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  airportCode: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  cityName: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  pathGraphic: {
    alignItems: 'center',
    width: '42%',
  },
  durationText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: GoldenWingTheme.colors.borderGold,
  },
  planeIcon: {
    marginHorizontal: 4,
    transform: [{ rotate: '90deg' }],
  },
  nonstopText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: GoldenWingTheme.colors.border,
    marginVertical: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  baggageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  baggageText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  fromLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
  },
  priceText: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 22,
    fontWeight: '800',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookmarkBtn: {
    padding: 4,
  },
});


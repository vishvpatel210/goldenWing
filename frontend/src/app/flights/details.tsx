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
import { Badge } from '../../components/common/Badge';
import { GoldenButton } from '../../components/common/GoldenButton';
import {
  formatCurrency,
  formatFlightDate,
  formatFlightTime,
  formatDuration,
} from '../../utils/formatters';

export default function FlightDetailsScreen() {
  const router = useRouter();
  const { selectedFlight, searchState } = useBooking();

  if (!selectedFlight) {
    router.replace('/(tabs)');
    return null;
  }

  const cabinClass = searchState.cabinClass;
  const classInfo = selectedFlight.classes[cabinClass] || selectedFlight.classes.economy;

  const AMENITIES = [
    {
      icon: 'bed-outline',
      title: 'Private Suite',
      desc: cabinClass === 'first' ? 'Full lie-flat double bed with privacy door' : 'Ergonomic recline with generous legroom',
    },
    {
      icon: 'wine-outline',
      title: 'Haute Cuisine & Bar',
      desc: 'Multi-course chef curated tasting menu and vintage champagne',
    },
    {
      icon: 'wifi-outline',
      title: 'SkyLink High-Speed Wi-Fi',
      desc: 'Complimentary unlimited streaming and connectivity',
    },
    {
      icon: 'headset-outline',
      title: 'Noise-Cancelling Audio',
      desc: 'Bespoke Bang & Olufsen studio acoustic headphones',
    },
    {
      icon: 'briefcase-outline',
      title: 'Generous Luggage',
      desc: `${classInfo.baggageAllowance} checked luggage + 2 cabin bags`,
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'VIP Lounge Access',
      desc: 'Dedicated private lounge with spa & à la carte dining',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Flight Details"
        subtitle={`${selectedFlight.flightNumber} • ${cabinClass.toUpperCase()}`}
        showBack
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Route Card */}
        <LuxuryCard goldBorder style={styles.routeCard}>
          <View style={styles.airlineRow}>
            <View style={styles.airlineBadge}>
              <Ionicons name="airplane" size={16} color={GoldenWingTheme.colors.primaryGold} />
              <Text style={styles.airlineName}>{selectedFlight.airline}</Text>
            </View>
            <Badge label={selectedFlight.status} variant="gold" />
          </View>

          <Text style={styles.aircraftText}>{selectedFlight.aircraft}</Text>

          {/* Timeline */}
          <View style={styles.timelineContainer}>
            {/* Departure */}
            <View style={styles.timelineNode}>
              <View style={styles.nodeBullet} />
              <View style={styles.nodeDetails}>
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>{formatFlightTime(selectedFlight.departureTime)}</Text>
                  <Text style={styles.dateText}>{formatFlightDate(selectedFlight.departureTime)}</Text>
                </View>
                <Text style={styles.airportCode}>{selectedFlight.departureAirport?.code}</Text>
                <Text style={styles.airportName}>
                  {selectedFlight.departureAirport?.name} ({selectedFlight.departureAirport?.city})
                </Text>
                <Text style={styles.gateTerminalText}>
                  Terminal: {selectedFlight.terminal} • Gate: {selectedFlight.gate}
                </Text>
              </View>
            </View>

            {/* Flight Duration Line */}
            <View style={styles.timelineLineContainer}>
              <View style={styles.verticalLine} />
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={12} color={GoldenWingTheme.colors.primaryGold} />
                <Text style={styles.durationText}>
                  {formatDuration(selectedFlight.durationMinutes)} (Non-stop)
                </Text>
              </View>
            </View>

            {/* Arrival */}
            <View style={styles.timelineNode}>
              <View style={[styles.nodeBullet, styles.nodeBulletArrival]} />
              <View style={styles.nodeDetails}>
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>{formatFlightTime(selectedFlight.arrivalTime)}</Text>
                  <Text style={styles.dateText}>{formatFlightDate(selectedFlight.arrivalTime)}</Text>
                </View>
                <Text style={styles.airportCode}>{selectedFlight.arrivalAirport?.code}</Text>
                <Text style={styles.airportName}>
                  {selectedFlight.arrivalAirport?.name} ({selectedFlight.arrivalAirport?.city})
                </Text>
                <Text style={styles.gateTerminalText}>
                  Terminal: {selectedFlight.terminal} • Baggage Carousel: 4
                </Text>
              </View>
            </View>
          </View>
        </LuxuryCard>

        {/* Cabin Amenities */}
        <Text style={styles.sectionHeader}>CABIN PRIVILEGES & AMENITIES</Text>
        <LuxuryCard style={styles.amenitiesCard}>
          {AMENITIES.map((item, idx) => (
            <View key={idx} style={[styles.amenityRow, idx > 0 && styles.amenityRowBorder]}>
              <View style={styles.amenityIconCircle}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={GoldenWingTheme.colors.primaryGold}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.amenityTitle}>{item.title}</Text>
                <Text style={styles.amenityDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </LuxuryCard>

        {/* Policies Card */}
        <Text style={styles.sectionHeader}>FARE RULES & CANCELLATION</Text>
        <LuxuryCard style={styles.policyCard}>
          <View style={styles.policyRow}>
            <Ionicons name="checkmark-circle" size={16} color="#2ECC71" />
            <Text style={styles.policyText}>
              Complimentary flight rescheduling up to 4 hours before departure
            </Text>
          </View>
          <View style={styles.policyRow}>
            <Ionicons name="checkmark-circle" size={16} color="#2ECC71" />
            <Text style={styles.policyText}>
              100% refund in GoldenWing flight credit upon cancellation
            </Text>
          </View>
          <View style={styles.policyRow}>
            <Ionicons name="checkmark-circle" size={16} color="#2ECC71" />
            <Text style={styles.policyText}>
              Fast-track VIP tarmac security & customs included
            </Text>
          </View>
        </LuxuryCard>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomBarLabel}>FARE PER PASSENGER</Text>
          <Text style={styles.bottomBarPrice}>{formatCurrency(classInfo.price)}</Text>
        </View>

        <GoldenButton
          title="Select Cabin Seats"
          onPress={() => router.push('/flights/seat-selection')}
          size="md"
          icon={<Ionicons name="apps-outline" size={18} color="#080808" />}
          style={{ minWidth: 180 }}
        />
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  routeCard: {
    marginVertical: 12,
    padding: 18,
  },
  airlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  airlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  airlineName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aircraftText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 18,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineNode: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  nodeBullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
    marginTop: 4,
  },
  nodeBulletArrival: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: GoldenWingTheme.colors.primaryGold,
  },
  nodeDetails: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  dateText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
  },
  airportCode: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
  airportName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 1,
  },
  gateTerminalText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },
  timelineLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingLeft: 5,
  },
  verticalLine: {
    width: 2,
    height: 48,
    backgroundColor: GoldenWingTheme.colors.borderGold,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 16,
    borderWidth: 1,
    borderColor: '#303030',
  },
  durationText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  amenitiesCard: {
    padding: 16,
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  amenityRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#242424',
  },
  amenityIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
  },
  amenityTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  amenityDesc: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  policyCard: {
    padding: 16,
    gap: 10,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  policyText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#141414',
    borderTopWidth: 1,
    borderTopColor: GoldenWingTheme.colors.border,
  },
  bottomBarLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bottomBarPrice: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 22,
    fontWeight: '900',
  },
});


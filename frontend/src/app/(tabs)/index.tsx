import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenWingTheme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { GoldenButton } from '../../components/common/GoldenButton';
import { LuxuryCard } from '../../components/common/LuxuryCard';
import { airportsApi } from '../../api/airports.api';
import { Airport, CabinClass } from '../../types';
import { formatCurrency, formatFlightDate } from '../../utils/formatters';
import { DatePickerModal } from '../../components/home/DatePickerModal';
import { PassengerSelectorModal } from '../../components/home/PassengerSelectorModal';
import { NotificationModal } from '../../components/home/NotificationModal';

// Fallback airports
const DEFAULT_AIRPORTS: Airport[] = [
  { _id: '1', code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'United Arab Emirates', terminals: ['T3 VIP'] },
  { _id: '2', code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'United Kingdom', terminals: ['T5 VIP'] },
  { _id: '3', code: 'JFK', city: 'New York', name: 'John F. Kennedy International', country: 'United States', terminals: ['T4 Prestige'] },
  { _id: '4', code: 'HND', city: 'Tokyo', name: 'Tokyo Haneda Airport', country: 'Japan', terminals: ['T3 Imperial'] },
  { _id: '5', code: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport', country: 'Singapore', terminals: ['T1 SilverKris'] },
  { _id: '6', code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France', terminals: ['T2E Royal'] },
];

const POPULAR_DESTINATIONS = [
  {
    code: 'DXB',
    city: 'Dubai',
    country: 'United Arab Emirates',
    subtitle: 'The Oasis of Opulence',
    firstPrice: 1850,
    tags: ['Lounge Access', 'Chauffeur'],
  },
  {
    code: 'LHR',
    city: 'London',
    country: 'United Kingdom',
    subtitle: 'Royal Mayfair & Westminster',
    firstPrice: 2400,
    tags: ['First Suite', 'Caviar Bar'],
  },
  {
    code: 'HND',
    city: 'Tokyo',
    country: 'Japan',
    subtitle: 'Imperial Serenity & Ginza',
    firstPrice: 2750,
    tags: ['Lie-flat Suite', 'Spa Escort'],
  },
  {
    code: 'CDG',
    city: 'Paris',
    country: 'France',
    subtitle: 'Haute Couture & Champagne',
    firstPrice: 2100,
    tags: ['Limousine', 'VIP Terminal'],
  },
  {
    code: 'JFK',
    city: 'New York',
    country: 'United States',
    subtitle: 'Fifth Avenue & Private Skyline',
    firstPrice: 2900,
    tags: ['Blade Heli', 'Butler Onboard'],
  },
  {
    code: 'SIN',
    city: 'Singapore',
    country: 'Singapore',
    subtitle: 'Jewel of the Orient & Sky Gardens',
    firstPrice: 1950,
    tags: ['Fast-Track', 'SilverKris VIP'],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { searchState, setSearchState } = useBooking();

  const [airports, setAirports] = useState<Airport[]>(DEFAULT_AIRPORTS);
  const [airportSearchQuery, setAirportSearchQuery] = useState('');
  const [modalAirportType, setModalAirportType] = useState<'origin' | 'destination' | null>(null);

  // Date Pickers Modals
  const [showDepDatePicker, setShowDepDatePicker] = useState(false);
  const [showRetDatePicker, setShowRetDatePicker] = useState(false);

  // Passenger & Class Modal
  const [showPassengerModal, setShowPassengerModal] = useState(false);

  // Notification Modal
  const [showNotifications, setShowNotifications] = useState(false);

  // Rotation animation for swap button
  const [swapAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async () => {
    try {
      const data = await airportsApi.getAirports();
      if (data && data.length > 0) {
        setAirports(data);
        if (!searchState.originAirport) {
          setSearchState((prev) => ({
            ...prev,
            originAirport: data[0],
            destinationAirport: data[1],
          }));
        }
      } else {
        setDefaultAirports();
      }
    } catch {
      setDefaultAirports();
    }
  };

  const setDefaultAirports = () => {
    if (!searchState.originAirport) {
      setSearchState((prev) => ({
        ...prev,
        originAirport: DEFAULT_AIRPORTS[0],
        destinationAirport: DEFAULT_AIRPORTS[1],
      }));
    }
  };

  const handleSwap = () => {
    Animated.sequence([
      Animated.timing(swapAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(swapAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();

    setSearchState((prev) => ({
      ...prev,
      originAirport: prev.destinationAirport,
      destinationAirport: prev.originAirport,
    }));
  };

  const spin = swapAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const selectAirport = (airport: Airport) => {
    if (modalAirportType === 'origin') {
      setSearchState((prev) => ({ ...prev, originAirport: airport }));
    } else if (modalAirportType === 'destination') {
      setSearchState((prev) => ({ ...prev, destinationAirport: airport }));
    }
    setModalAirportType(null);
    setAirportSearchQuery('');
  };

  const filteredAirports = airports.filter((a) => {
    const q = airportSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
    );
  });

  const handleApplyPassengers = (params: {
    cabinClass: CabinClass;
    adultsCount: number;
    childrenCount: number;
    totalCount: number;
  }) => {
    setSearchState((prev) => ({
      ...prev,
      cabinClass: params.cabinClass,
      adultsCount: params.adultsCount,
      childrenCount: params.childrenCount,
      passengerCount: params.totalCount,
    }));
  };

  const handleSearch = () => {
    if (!searchState.originAirport || !searchState.destinationAirport) {
      Alert.alert('Airport Required', 'Please select both departure and destination airports.');
      return;
    }

    if (searchState.originAirport.code === searchState.destinationAirport.code) {
      Alert.alert(
        'Invalid Route',
        'Departure airport and arrival airport cannot be identical. Please choose a different destination.'
      );
      return;
    }

    if (searchState.tripType === 'roundTrip' && searchState.returnDate) {
      const dep = new Date(searchState.departureDate);
      const ret = new Date(searchState.returnDate);
      if (ret < dep) {
        Alert.alert(
          'Invalid Dates',
          'Return date cannot be earlier than your departure date.'
        );
        return;
      }
    }

    if (searchState.passengerCount < 1) {
      Alert.alert('Passenger Required', 'Please select at least 1 passenger.');
      return;
    }

    router.push('/flights/search-results');
  };

  const handleQuickDestinationSelect = (destCode: string, cityName: string) => {
    const foundDest = airports.find((a) => a.code === destCode) || {
      _id: destCode,
      code: destCode,
      city: cityName,
      name: `${cityName} International`,
      country: '',
      terminals: ['T1 VIP'],
    };

    setSearchState((prev) => ({
      ...prev,
      destinationAirport: foundDest,
    }));

    router.push('/flights/search-results');
  };

  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return 'Select Date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Top App Header with Logo & Notification */}
        <View style={styles.headerRow}>
          <View style={styles.logoBadgeContainer}>
            <View style={styles.logoCrestCircle}>
              <Ionicons name="airplane" size={20} color={GoldenWingTheme.colors.primaryGold} />
            </View>
            <View>
              <Text style={styles.logoTitle}>GOLDENWING</Text>
              <Text style={styles.logoSubtitle}>PRIVATE & FIRST CLASS</Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              onPress={() => setShowNotifications(true)}
              style={styles.notifButton}
            >
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
              <View style={styles.notifBadge} />
            </TouchableOpacity>

            {isAuthenticated ? (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/profile')}
                style={styles.vipPill}
              >
                <Ionicons name="shield-checkmark" size={14} color={GoldenWingTheme.colors.primaryGold} />
                <Text style={styles.vipPillText}>ELITE</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                style={styles.signInPill}
              >
                <Text style={styles.signInPillText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeTitle}>
            {isAuthenticated ? `Welcome, ${user?.name.split(' ')[0]}` : 'Welcome, Distinguished Guest'}
          </Text>
          <Text style={styles.welcomeTagline}>
            Where shall we fly you today?
          </Text>
        </View>

        {/* Main Flight Booking Card */}
        <View style={styles.searchCard}>
          {/* Trip Type Tabs: One-Way, Round-Trip, Multi-City */}
          <View style={styles.tripTabsRow}>
            {[
              { id: 'oneWay', label: 'One-Way' },
              { id: 'roundTrip', label: 'Round-Trip' },
              { id: 'multiCity', label: 'Multi-City' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() =>
                  setSearchState((prev) => ({
                    ...prev,
                    tripType: tab.id as any,
                  }))
                }
                style={[
                  styles.tripTab,
                  searchState.tripType === tab.id && styles.tripTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.tripTabText,
                    searchState.tripType === tab.id && styles.tripTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Airport Route Selectors */}
          <View style={styles.routeBox}>
            {/* Origin Airport */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalAirportType('origin')}
              style={styles.airportBlock}
            >
              <View style={styles.airportLabelRow}>
                <Ionicons name="airplane-outline" size={13} color={GoldenWingTheme.colors.primaryGold} />
                <Text style={styles.airportLabel}>FROM / DEPARTURE</Text>
              </View>
              <Text style={styles.airportCodeText}>
                {searchState.originAirport?.code || 'DXB'}
              </Text>
              <Text style={styles.airportCityText} numberOfLines={1}>
                {searchState.originAirport?.city || 'Dubai'}
              </Text>
              <Text style={styles.airportSubText} numberOfLines={1}>
                {searchState.originAirport?.name || 'Dubai International Airport'}
              </Text>
            </TouchableOpacity>

            {/* Centered Floating Swap Button */}
            <View style={styles.swapButtonWrapper}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSwap}
                style={styles.swapCircle}
              >
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Ionicons name="swap-vertical" size={20} color={GoldenWingTheme.colors.primaryGold} />
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Destination Airport */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalAirportType('destination')}
              style={[styles.airportBlock, { borderTopWidth: 1, borderTopColor: '#252525' }]}
            >
              <View style={styles.airportLabelRow}>
                <Ionicons name="location-outline" size={13} color={GoldenWingTheme.colors.primaryGold} />
                <Text style={styles.airportLabel}>TO / DESTINATION</Text>
              </View>
              <Text style={styles.airportCodeText}>
                {searchState.destinationAirport?.code || 'LHR'}
              </Text>
              <Text style={styles.airportCityText} numberOfLines={1}>
                {searchState.destinationAirport?.city || 'London'}
              </Text>
              <Text style={styles.airportSubText} numberOfLines={1}>
                {searchState.destinationAirport?.name || 'Heathrow International Airport'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker Selectors */}
          <View style={styles.datesRow}>
            {/* Departure Date */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowDepDatePicker(true)}
              style={styles.dateCard}
            >
              <View style={styles.dateLabelRow}>
                <Ionicons name="calendar-outline" size={14} color={GoldenWingTheme.colors.primaryGold} />
                <Text style={styles.dateLabel}>DEPARTURE</Text>
              </View>
              <Text style={styles.dateValue}>
                {formatDisplayDate(searchState.departureDate)}
              </Text>
              <Text style={styles.dateSubText}>
                {searchState.departureDate || 'Set flight date'}
              </Text>
            </TouchableOpacity>

            {/* Return Date (if Round-trip) */}
            {searchState.tripType === 'roundTrip' ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowRetDatePicker(true)}
                style={[styles.dateCard, styles.dateCardActive]}
              >
                <View style={styles.dateLabelRow}>
                  <Ionicons name="return-down-back-outline" size={14} color={GoldenWingTheme.colors.primaryGold} />
                  <Text style={styles.dateLabel}>RETURN</Text>
                </View>
                <Text style={styles.dateValue}>
                  {formatDisplayDate(searchState.returnDate)}
                </Text>
                <Text style={styles.dateSubText}>
                  {searchState.returnDate || 'Set return date'}
                </Text>
              </TouchableOpacity>
            ) : searchState.tripType === 'multiCity' ? (
              <View style={[styles.dateCard, { opacity: 0.8 }]}>
                <View style={styles.dateLabelRow}>
                  <Ionicons name="git-branch-outline" size={14} color={GoldenWingTheme.colors.primaryGold} />
                  <Text style={styles.dateLabel}>MULTI-LEG</Text>
                </View>
                <Text style={styles.dateValue}>Segment 2</Text>
                <Text style={styles.dateSubText}>Custom route enabled</Text>
              </View>
            ) : null}
          </View>

          {/* Passengers & Cabin Class Selector */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowPassengerModal(true)}
            style={styles.passengerCard}
          >
            <View style={styles.passengerLeftCol}>
              <View style={styles.passengerLabelRow}>
                <Ionicons name="people-outline" size={14} color={GoldenWingTheme.colors.primaryGold} />
                <Text style={styles.passengerLabel}>GUESTS & CABIN CLASS</Text>
              </View>
              <Text style={styles.passengerValue}>
                {searchState.passengerCount} {searchState.passengerCount === 1 ? 'Passenger' : 'Passengers'}
              </Text>
              <Text style={styles.passengerSub}>
                {searchState.adultsCount || 1} Adults
                {(searchState.childrenCount || 0) > 0 ? `, ${searchState.childrenCount} Children` : ''}
              </Text>
            </View>

            <View style={styles.classPillBadge}>
              <Ionicons name="sparkles" size={12} color={GoldenWingTheme.colors.primaryGold} />
              <Text style={styles.classPillText}>
                {searchState.cabinClass.toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Search Flights CTA Button */}
          <GoldenButton
            title="Search Luxury Flights"
            onPress={handleSearch}
            size="lg"
            icon={<Ionicons name="airplane" size={20} color="#080808" />}
            style={{ marginTop: 22 }}
          />
        </View>

        {/* Popular Destinations Showcase Carousel */}
        <View style={styles.popularSection}>
          <View style={styles.popularHeaderRow}>
            <View>
              <Text style={styles.popularSectionTitle}>Curated VIP Destinations</Text>
              <Text style={styles.popularSectionSub}>PRIVATE CHARTERS & BESPOKE ROUTES</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularCarousel}
          >
            {POPULAR_DESTINATIONS.map((dest) => (
              <LuxuryCard
                key={dest.code}
                goldBorder
                style={styles.destCard}
                onPress={() => handleQuickDestinationSelect(dest.code, dest.city)}
              >
                <View style={styles.destCardTop}>
                  <View style={styles.destCodePill}>
                    <Text style={styles.destCodeText}>{dest.code}</Text>
                  </View>
                  <Text style={styles.destPriceText}>
                    From {formatCurrency(dest.firstPrice)}
                  </Text>
                </View>

                <Text style={styles.destCityText}>{dest.city}</Text>
                <Text style={styles.destCountryText}>{dest.country}</Text>
                <Text style={styles.destSubText}>{dest.subtitle}</Text>

                <View style={styles.destTagsRow}>
                  {dest.tags.map((tag, i) => (
                    <View key={i} style={styles.destTagPill}>
                      <Ionicons name="sparkles" size={10} color={GoldenWingTheme.colors.primaryGold} />
                      <Text style={styles.destTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => handleQuickDestinationSelect(dest.code, dest.city)}
                  style={styles.destBookBtn}
                >
                  <Text style={styles.destBookBtnText}>Select Route</Text>
                  <Ionicons name="arrow-forward" size={14} color="#080808" />
                </TouchableOpacity>
              </LuxuryCard>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Airport Search Modal */}
      <Modal visible={modalAirportType !== null} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <Text style={styles.modalSheetTitle}>
                Select {modalAirportType === 'origin' ? 'Departure' : 'Arrival'} Airport
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalAirportType(null);
                  setAirportSearchQuery('');
                }}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Airport Live Search Input */}
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={18} color={GoldenWingTheme.colors.primaryGold} />
              <TextInput
                placeholder="Search city, airport code, or country..."
                placeholderTextColor={GoldenWingTheme.colors.textSecondary}
                value={airportSearchQuery}
                onChangeText={setAirportSearchQuery}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {airportSearchQuery ? (
                <TouchableOpacity onPress={() => setAirportSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#888888" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Airport List */}
            <FlatList
              data={filteredAirports}
              keyExtractor={(item) => item._id || item.code}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => selectAirport(item)}
                  style={styles.airportItemRow}
                >
                  <View style={styles.airportItemCodeBox}>
                    <Text style={styles.airportItemCodeText}>{item.code}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.airportItemCityText}>
                      {item.city}, {item.country}
                    </Text>
                    <Text style={styles.airportItemNameText} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={GoldenWingTheme.colors.primaryGold}
                  />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyAirportBox}>
                  <Ionicons name="search-outline" size={32} color="#555555" />
                  <Text style={styles.emptyAirportText}>No matching airports found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Interactive Departure Date Picker Modal */}
      <DatePickerModal
        visible={showDepDatePicker}
        title="Departure Date"
        selectedDate={searchState.departureDate}
        onSelectDate={(date) => {
          setSearchState((prev) => ({
            ...prev,
            departureDate: date,
            // If return date is earlier than new departure, bump it forward
            returnDate:
              prev.returnDate && prev.returnDate < date ? date : prev.returnDate,
          }));
        }}
        onClose={() => setShowDepDatePicker(false)}
      />

      {/* Interactive Return Date Picker Modal */}
      <DatePickerModal
        visible={showRetDatePicker}
        title="Return Date"
        selectedDate={searchState.returnDate || searchState.departureDate}
        minDate={searchState.departureDate}
        onSelectDate={(date) => {
          setSearchState((prev) => ({
            ...prev,
            returnDate: date,
          }));
        }}
        onClose={() => setShowRetDatePicker(false)}
      />

      {/* Passenger & Cabin Class Selector Modal */}
      <PassengerSelectorModal
        visible={showPassengerModal}
        cabinClass={searchState.cabinClass}
        adultsCount={searchState.adultsCount || 1}
        childrenCount={searchState.childrenCount || 0}
        onApply={handleApplyPassengers}
        onClose={() => setShowPassengerModal(false)}
      />

      {/* VIP Notifications Modal */}
      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GoldenWingTheme.colors.background,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  logoBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCrestCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GoldenWingTheme.colors.card,
    borderWidth: 1.5,
    borderColor: GoldenWingTheme.colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GoldenWingTheme.colors.primaryGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  logoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  logoSubtitle: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notifButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GoldenWingTheme.colors.card,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  vipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
  },
  vipPillText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 11,
    fontWeight: '800',
  },
  signInPill: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.primaryGold,
  },
  signInPillText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 12,
    fontWeight: '700',
  },
  welcomeBox: {
    marginTop: 8,
    marginBottom: 20,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  welcomeTagline: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  searchCard: {
    backgroundColor: GoldenWingTheme.colors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
    shadowColor: GoldenWingTheme.colors.primaryGold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tripTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  tripTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  tripTabActive: {
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
  },
  tripTabText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  tripTabTextActive: {
    color: GoldenWingTheme.colors.lightGold,
    fontWeight: '800',
  },
  routeBox: {
    backgroundColor: '#191919',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    position: 'relative',
    overflow: 'hidden',
  },
  airportBlock: {
    padding: 16,
  },
  airportLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  airportLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  airportCodeText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  airportCityText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  airportSubText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  swapButtonWrapper: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -20,
    zIndex: 10,
  },
  swapCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#252525',
    borderWidth: 1.5,
    borderColor: GoldenWingTheme.colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 6,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  dateCard: {
    flex: 1,
    backgroundColor: '#191919',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  dateCardActive: {
    borderColor: GoldenWingTheme.colors.borderGold,
  },
  dateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  dateLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dateValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  dateSubText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 11,
    marginTop: 2,
  },
  passengerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#191919',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  passengerLeftCol: {
    flex: 1,
  },
  passengerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  passengerLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  passengerValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  passengerSub: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  classPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.primaryGold,
  },
  classPillText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  popularSection: {
    marginTop: 32,
  },
  popularHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  popularSectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  popularSectionSub: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  viewAllText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 13,
    fontWeight: '700',
  },
  popularCarousel: {
    paddingRight: 20,
    gap: 14,
  },
  destCard: {
    width: 230,
    padding: 16,
    marginVertical: 4,
  },
  destCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  destCodePill: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
  },
  destCodeText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 13,
    fontWeight: '900',
  },
  destPriceText: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 13,
    fontWeight: '800',
  },
  destCityText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  destCountryText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  destSubText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    marginTop: 6,
    lineHeight: 15,
  },
  destTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 12,
  },
  destTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#202020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  destTagText: {
    color: GoldenWingTheme.colors.textPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
  destBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  destBookBtnText: {
    color: '#080808',
    fontSize: 12,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 22,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
  },
  modalSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalSheetTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#303030',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  airportItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#202020',
  },
  airportItemCodeBox: {
    width: 52,
    height: 42,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  airportItemCodeText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 15,
    fontWeight: '900',
  },
  airportItemCityText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  airportItemNameText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  emptyAirportBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyAirportText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 14,
  },
});

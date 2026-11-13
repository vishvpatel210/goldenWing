import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenWingTheme } from '../../constants/theme';
import { useBooking } from '../../context/BookingContext';
import { LuxuryCard } from '../../components/common/LuxuryCard';

const LUXURY_DESTINATIONS = [
  {
    id: 'dxb',
    city: 'Dubai',
    country: 'United Arab Emirates',
    tagline: 'Private Desert Havens & Sky Penthouse Living',
    airportCode: 'DXB',
    startingPrice: '$1,850',
    tags: ['Lounge Access', 'Helicopter Transfer', 'Chauffeur'],
  },
  {
    id: 'lhr',
    city: 'London',
    country: 'United Kingdom',
    tagline: 'Mayfair Elegance, Royal Parks & Bespoke Heritage',
    airportCode: 'LHR',
    startingPrice: '$2,400',
    tags: ['First Class Suite', 'Fine Dining', 'Priority Track'],
  },
  {
    id: 'hnd',
    city: 'Tokyo',
    country: 'Japan',
    tagline: 'Imperial Serenity, Ginza Luxury & Kaiseki Masterclasses',
    airportCode: 'HND',
    startingPrice: '$2,750',
    tags: ['Lie-Flat Beds', 'Caviar Service', 'Private Escort'],
  },
  {
    id: 'cdg',
    city: 'Paris',
    country: 'France',
    tagline: 'Haute Couture, Vintage Champagne & Palace Hotels',
    airportCode: 'CDG',
    startingPrice: '$2,100',
    tags: ['VIP Terminal', 'Sommelier Selection', 'Limousine'],
  },
  {
    id: 'sin',
    city: 'Singapore',
    country: 'Singapore',
    tagline: 'Jewel of the Orient, Sky Gardens & Waterfront Lounges',
    airportCode: 'SIN',
    startingPrice: '$1,950',
    tags: ['Spa Access', 'Fast-Track Customs', 'Silver Kris VIP'],
  },
  {
    id: 'jfk',
    city: 'New York',
    country: 'United States',
    tagline: 'Fifth Avenue Splendor, Broadway Galas & Private Sky Lounges',
    airportCode: 'JFK',
    startingPrice: '$2,900',
    tags: ['Blade Airport Heli', 'Butler Onboard', 'Dom Pérignon'],
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { setSearchState } = useBooking();

  const handleBookDestination = (destCode: string, cityName: string) => {
    setSearchState((prev) => ({
      ...prev,
      destinationAirport: {
        _id: destCode,
        code: destCode,
        name: `${cityName} International`,
        city: cityName,
        country: '',
        terminals: ['T1', 'T2'],
      },
    }));
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>GOLDENWING PRIVÉ</Text>
          <Text style={styles.title}>Curated Luxury Journeys</Text>
          <Text style={styles.subtitle}>
            Handcrafted itineraries and privileged services for the distinguished traveler.
          </Text>
        </View>

        {/* Destination Cards */}
        {LUXURY_DESTINATIONS.map((dest) => (
          <LuxuryCard
            key={dest.id}
            goldBorder
            style={styles.destCard}
            onPress={() => handleBookDestination(dest.airportCode, dest.city)}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cityText}>{dest.city}</Text>
                <Text style={styles.countryText}>{dest.country}</Text>
              </View>
              <View style={styles.codePill}>
                <Text style={styles.codeText}>{dest.airportCode}</Text>
              </View>
            </View>

            <Text style={styles.tagline}>{dest.tagline}</Text>

            {/* Privilege Tags */}
            <View style={styles.tagsRow}>
              {dest.tags.map((tag, idx) => (
                <View key={idx} style={styles.tagPill}>
                  <Ionicons name="sparkles" size={10} color={GoldenWingTheme.colors.primaryGold} />
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.startingFrom}>FIRST CLASS FROM</Text>
                <Text style={styles.priceText}>{dest.startingPrice}</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleBookDestination(dest.airportCode, dest.city)}
                style={styles.bookCta}
              >
                <Text style={styles.bookCtaText}>Book Route</Text>
                <Ionicons name="arrow-forward" size={14} color="#080808" />
              </TouchableOpacity>
            </View>
          </LuxuryCard>
        ))}
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
  header: {
    paddingVertical: 18,
  },
  badge: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  destCard: {
    marginVertical: 10,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cityText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  countryText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  codePill: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
  },
  codeText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tagline: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#202020',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#303030',
  },
  tagText: {
    color: GoldenWingTheme.colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: GoldenWingTheme.colors.border,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startingFrom: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  priceText: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 22,
    fontWeight: '900',
  },
  bookCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bookCtaText: {
    color: '#080808',
    fontSize: 13,
    fontWeight: '800',
  },
});


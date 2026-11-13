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
import { useWishlist } from '../../context/WishlistContext';
import { useBooking } from '../../context/BookingContext';
import { LuxuryCard } from '../../components/common/LuxuryCard';
import { GoldenButton } from '../../components/common/GoldenButton';
import { formatCurrency } from '../../utils/formatters';

export default function WishlistScreen() {
  const router = useRouter();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { setSearchState } = useBooking();

  const handleBookWishlistItem = (item: any) => {
    setSearchState((prev) => ({
      ...prev,
      originAirport: {
        _id: item.fromCode,
        code: item.fromCode,
        city: item.fromCity,
        name: `${item.fromCity} International`,
        country: '',
        terminals: ['T1', 'T2'],
      },
      destinationAirport: {
        _id: item.toCode,
        code: item.toCode,
        city: item.toCity,
        name: `${item.toCity} International`,
        country: '',
        terminals: ['T1', 'T2'],
      },
    }));
    router.push('/flights/search-results');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Journeys</Text>
        <Text style={styles.headerSubtitle}>TRACKED LUXURY ROUTES & FARES</Text>
      </View>

      {wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bookmark-outline" size={38} color={GoldenWingTheme.colors.primaryGold} />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite first-class routes and private aviation deals to track real-time price updates.
          </Text>
          <GoldenButton
            title="Explore Luxury Destinations"
            onPress={() => router.push('/(tabs)/explore')}
            style={{ marginTop: 24 }}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {wishlist.map((item) => (
            <LuxuryCard key={item.id} goldBorder style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.airlineBadge}>
                  <Ionicons name="airplane" size={14} color={GoldenWingTheme.colors.primaryGold} />
                  <Text style={styles.airlineText}>{item.airline}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => removeFromWishlist(item.id)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color="#888888" />
                </TouchableOpacity>
              </View>

              {/* Route */}
              <View style={styles.routeRow}>
                <View>
                  <Text style={styles.airportCode}>{item.fromCode}</Text>
                  <Text style={styles.cityName}>{item.fromCity}</Text>
                </View>

                <View style={styles.pathGraphic}>
                  <Text style={styles.durationText}>{item.duration}</Text>
                  <View style={styles.lineContainer}>
                    <View style={styles.dot} />
                    <View style={styles.line} />
                    <Ionicons name="airplane-sharp" size={16} color={GoldenWingTheme.colors.primaryGold} />
                    <View style={styles.line} />
                    <View style={styles.dot} />
                  </View>
                  <Text style={styles.classText}>{item.cabinClass}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.airportCode}>{item.toCode}</Text>
                  <Text style={styles.cityName}>{item.toCity}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Footer */}
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.priceLabel}>ESTIMATED VIP FARE</Text>
                  <Text style={styles.priceValue}>{formatCurrency(item.price)}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleBookWishlistItem(item)}
                  style={styles.bookCta}
                >
                  <Text style={styles.bookCtaText}>Book Route</Text>
                  <Ionicons name="arrow-forward" size={14} color="#080808" />
                </TouchableOpacity>
              </View>
            </LuxuryCard>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GoldenWingTheme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    marginVertical: 8,
    padding: 18,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  airlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  airlineText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 4,
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
  cityName: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  pathGraphic: {
    alignItems: 'center',
    width: '40%',
  },
  durationText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: GoldenWingTheme.colors.borderGold,
  },
  classText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: GoldenWingTheme.colors.border,
    marginVertical: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  priceValue: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 20,
    fontWeight: '900',
  },
  bookCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  bookCtaText: {
    color: '#080808',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GoldenWingTheme.colors.card,
    borderWidth: 1.5,
    borderColor: GoldenWingTheme.colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  emptySubtitle: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
});


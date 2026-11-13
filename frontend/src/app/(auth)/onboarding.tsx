import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenWingTheme } from '../../constants/theme';
import { GoldenButton } from '../../components/common/GoldenButton';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    badge: 'PRIVATE & FIRST CLASS AVIATION',
    title: 'The Sovereign Skies',
    description:
      'Experience the pinnacle of luxury air travel. Handcrafted itineraries, private lounge access, and seamless global connections.',
    icon: 'airplane',
  },
  {
    id: '2',
    badge: 'SIGNATURE FIRST CLASS SUITES',
    title: 'Bespoke Cabin Luxury',
    description:
      'Full lie-flat private suites, vintage sommelier cellars, and Michelin-inspired haute cuisine at 40,000 feet.',
    icon: 'sparkles',
  },
  {
    id: '3',
    badge: 'VIP TERMINAL ACCESS',
    title: 'Effortless Departure',
    description:
      'Fast-track customs, biometric boarding, and complimentary chauffeur transfers straight to your penthouse suite.',
    icon: 'shield-checkmark',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Skip Bar */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Ionicons name="airplane" size={18} color={GoldenWingTheme.colors.primaryGold} />
          <Text style={styles.logoText}>GOLDENWING</Text>
        </View>

        {currentIndex < SLIDES.length - 1 ? (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Carousel Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.graphicCircleOuter}>
              <View style={styles.graphicCircleInner}>
                <Ionicons
                  name={item.icon as any}
                  size={56}
                  color={GoldenWingTheme.colors.primaryGold}
                />
              </View>
            </View>

            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>{item.badge}</Text>
            </View>

            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDesc}>{item.description}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        style={styles.carousel}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomSection}>
        {/* Indicators */}
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.indicatorDot,
                currentIndex === i && styles.indicatorDotActive,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.actionButtonGroup}>
          {currentIndex === SLIDES.length - 1 ? (
            <>
              <GoldenButton
                title="Begin Your Journey"
                onPress={() => router.replace('/(tabs)')}
                size="lg"
                icon={<Ionicons name="compass-outline" size={20} color="#080808" />}
              />
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                style={styles.signInLink}
              >
                <Text style={styles.signInLinkText}>
                  Already a member? <Text style={styles.signInLinkHighlight}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.nextRow}>
              <GoldenButton
                title="Continue"
                onPress={handleNext}
                size="lg"
                style={{ flex: 1 }}
                icon={<Ionicons name="arrow-forward" size={18} color="#080808" />}
              />
            </View>
          )}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipBtnText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  carousel: {
    flex: 1,
  },
  slide: {
    width: width,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphicCircleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1.5,
    borderColor: GoldenWingTheme.colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: GoldenWingTheme.colors.primaryGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  graphicCircleInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: GoldenWingTheme.colors.card,
    borderWidth: 1.5,
    borderColor: GoldenWingTheme.colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
    marginBottom: 14,
  },
  badgePillText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  slideTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  slideDesc: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2A2A2A',
  },
  indicatorDotActive: {
    width: 28,
    height: 8,
    borderRadius: 4,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
  },
  actionButtonGroup: {
    width: '100%',
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInLink: {
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 6,
  },
  signInLinkText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 13,
  },
  signInLinkHighlight: {
    color: GoldenWingTheme.colors.primaryGold,
    fontWeight: '700',
  },
});


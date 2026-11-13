import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenWingTheme } from '../../constants/theme';
import { GoldenButton } from '../../components/common/GoldenButton';
import { LuxuryCard } from '../../components/common/LuxuryCard';

export default function ConfirmationScreen() {
  const router = useRouter();
  const { pnr, bookingId } = useLocalSearchParams<{ pnr: string; bookingId: string }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Celebration Crest */}
        <View style={styles.crestCircle}>
          <Ionicons name="checkmark-done" size={44} color={GoldenWingTheme.colors.primaryGold} />
        </View>

        <Text style={styles.badgeText}>RESERVATION CONFIRMED</Text>
        <Text style={styles.title}>Have a Splendid Flight</Text>
        <Text style={styles.subtitle}>
          Your private reservation has been booked. Your VIP boarding pass is ready for check-in.
        </Text>

        {/* PNR Card */}
        <LuxuryCard goldBorder style={styles.pnrCard}>
          <Text style={styles.pnrLabel}>BOOKING REFERENCE NUMBER</Text>
          <Text style={styles.pnrCode}>{pnr || 'GW92K4'}</Text>
          <Text style={styles.pnrNotice}>
            A confirmation receipt and flight details have been emailed to your registered address.
          </Text>
        </LuxuryCard>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <GoldenButton
            title="View Digital Boarding Pass"
            onPress={() => router.replace(`/ticket/${pnr || bookingId}`)}
            size="lg"
            icon={<Ionicons name="qr-code-outline" size={20} color="#080808" />}
          />

          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/bookings')}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>Go to My Trips</Text>
          </TouchableOpacity>
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  crestCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: GoldenWingTheme.colors.card,
    borderWidth: 2,
    borderColor: GoldenWingTheme.colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: GoldenWingTheme.colors.primaryGold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  badgeText: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 12,
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
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  pnrCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  pnrLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  pnrCode: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 4,
    marginVertical: 8,
  },
  pnrNotice: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 6,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  secondaryBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});


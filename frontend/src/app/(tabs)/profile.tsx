import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenWingTheme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { LuxuryCard } from '../../components/common/LuxuryCard';
import { GoldenButton } from '../../components/common/GoldenButton';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of GoldenWing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.guestContainer}>
          <View style={styles.guestCrest}>
            <Ionicons name="airplane" size={36} color={GoldenWingTheme.colors.primaryGold} />
          </View>
          <Text style={styles.guestTitle}>GoldenWing Concierge</Text>
          <Text style={styles.guestSubtitle}>
            Sign in to access your personal travel concierge, frequent flyer miles, and bespoke preferences.
          </Text>

          <GoldenButton
            title="Sign In to Member Portal"
            onPress={() => router.push('/(auth)/login')}
            style={{ width: '100%', marginTop: 28 }}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            style={styles.guestRegisterBtn}
          >
            <Text style={styles.guestRegisterText}>Join The Elite Club</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>VIP Member Profile</Text>
          <Text style={styles.headerSubtitle}>GOLDENWING PRIVILEGES</Text>
        </View>

        {/* Luxury Membership Card */}
        <View style={styles.memberCard}>
          <View style={styles.cardTopRow}>
            <View>
              <Text style={styles.cardBrand}>GOLDENWING AIRWAYS</Text>
              <Text style={styles.cardTier}>{'GOLDENWING ELITE'}</Text>
            </View>
            <Ionicons name="shield-checkmark" size={32} color={GoldenWingTheme.colors.primaryGold} />
          </View>

          <View style={styles.chipRow}>
            <View style={styles.simChip}>
              <View style={styles.chipLine} />
              <View style={styles.chipLine} />
            </View>
            <Ionicons name="wifi" size={24} color="#D4AF37" style={{ transform: [{ rotate: '90deg' }] }} />
          </View>

          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardLabel}>MEMBER NAME</Text>
              <Text style={styles.cardName}>{user?.name}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardLabel}>FLYER NO.</Text>
              <Text style={styles.cardFlyerNo}>{user?.frequentFlyerNumber || 'GW-902184'}</Text>
            </View>
          </View>
        </View>

        {/* Member Privileges Section */}
        <Text style={styles.sectionHeader}>TIER PRIVILEGES</Text>
        <LuxuryCard style={styles.privilegeCard}>
          {[
            { icon: 'wine', title: 'First Class Lounge Access', desc: 'Complimentary caviar & fine wine at 65 global hubs' },
            { icon: 'car-sport', title: 'Chauffeur Transfer', desc: 'Complimentary private luxury sedan to/from airport' },
            { icon: 'speedometer', title: 'Fast-Track Customs', desc: 'Dedicated GoldenWing security & border clearance' },
            { icon: 'briefcase', title: '50 KG Baggage Allowance', desc: 'Priority tags & direct penthouse delivery' },
          ].map((item, idx) => (
            <View key={idx} style={[styles.privilegeItem, idx > 0 && styles.privilegeItemBorder]}>
              <View style={styles.privilegeIcon}>
                <Ionicons name={item.icon as any} size={20} color={GoldenWingTheme.colors.primaryGold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.privilegeTitle}>{item.title}</Text>
                <Text style={styles.privilegeDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </LuxuryCard>

        {/* Account Details */}
        <Text style={styles.sectionHeader}>ACCOUNT CREDENTIALS</Text>
        <LuxuryCard style={styles.accountCard}>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Email</Text>
            <Text style={styles.accountValue}>{user?.email}</Text>
          </View>
          <View style={styles.accountDivider} />
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Phone</Text>
            <Text style={styles.accountValue}>{user?.phone || 'Not set'}</Text>
          </View>
          <View style={styles.accountDivider} />
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Role</Text>
            <Text style={[styles.accountValue, user?.role === 'admin' ? { color: GoldenWingTheme.colors.primaryGold } : null]}>
              {user?.role === 'admin' ? 'Executive Administrator' : 'VIP Club Member'}
            </Text>
          </View>
        </LuxuryCard>

        {/* Administrator Executive Control Suite button */}
        {user?.role === 'admin' && (
          <GoldenButton
            title="Executive Command Center"
            onPress={() => router.push('/admin')}
            style={{ marginTop: 18 }}
            icon={<Ionicons name="shield-checkmark" size={18} color="#080808" />}
          />
        )}

        {/* Logout Button */}
        <GoldenButton
          title="Sign Out"
          variant="outline"
          onPress={handleLogout}
          style={{ marginTop: user?.role === 'admin' ? 12 : 24 }}
          icon={<Ionicons name="log-out-outline" size={18} color={GoldenWingTheme.colors.lightGold} />}
        />
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
    paddingBottom: 50,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
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
  memberCard: {
    backgroundColor: '#161616',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1.5,
    borderColor: GoldenWingTheme.colors.primaryGold,
    shadowColor: GoldenWingTheme.colors.primaryGold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
    marginVertical: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardBrand: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  cardTier: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 24,
  },
  simChip: {
    width: 38,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#8C7322',
    borderWidth: 1,
    borderColor: '#F5D77A',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  chipLine: {
    height: 1,
    backgroundColor: '#161616',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardFlyerNo: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionHeader: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
  },
  privilegeCard: {
    padding: 16,
  },
  privilegeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  privilegeItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#252525',
  },
  privilegeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
  },
  privilegeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  privilegeDesc: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  accountCard: {
    padding: 16,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  accountLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 14,
  },
  accountValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  accountDivider: {
    height: 1,
    backgroundColor: '#252525',
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  guestCrest: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: GoldenWingTheme.colors.card,
    borderWidth: 2,
    borderColor: GoldenWingTheme.colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  guestTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  guestSubtitle: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  guestRegisterBtn: {
    marginTop: 18,
    paddingVertical: 8,
  },
  guestRegisterText: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 14,
    fontWeight: '700',
  },
});


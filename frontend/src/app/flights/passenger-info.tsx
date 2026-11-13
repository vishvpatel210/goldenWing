import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenWingTheme } from '../../constants/theme';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { GoldenInput } from '../../components/common/GoldenInput';
import { GoldenButton } from '../../components/common/GoldenButton';
import { LuxuryCard } from '../../components/common/LuxuryCard';
import { Passenger } from '../../types';

// ─── Stable icon constants (never recreated) ────────────────────────────────
const MailIcon = <Ionicons name="mail-outline" size={18} color={GoldenWingTheme.colors.textSecondary} />;
const PhoneIcon = <Ionicons name="call-outline" size={18} color={GoldenWingTheme.colors.textSecondary} />;

// ─── PassengerCard: fully self-contained local state ────────────────────────
// Owns its own input state → typing here NEVER triggers a parent re-render.
// Syncs up only when the user finishes (onBlur) so parent's ref stays current.
interface PassengerCardProps {
  initialName: string;
  initialPassport: string;
  idx: number;
  seatLabel: string;
  onNameChange: (idx: number, val: string) => void;
  onPassportChange: (idx: number, val: string) => void;
}

const PassengerCard = memo(
  ({ initialName, initialPassport, idx, seatLabel, onNameChange, onPassportChange }: PassengerCardProps) => {
    const [name, setName] = useState(initialName);
    const [passport, setPassport] = useState(initialPassport);

    // Keep parent's ref in sync immediately on every keystroke
    const handleNameChange = useCallback(
      (text: string) => {
        setName(text);
        onNameChange(idx, text);
      },
      [idx, onNameChange],
    );

    const handlePassportChange = useCallback(
      (text: string) => {
        setPassport(text);
        onPassportChange(idx, text);
      },
      [idx, onPassportChange],
    );

    return (
      <LuxuryCard style={styles.passengerCard}>
        <View style={styles.passengerHeader}>
          <View style={styles.passengerIndexBadge}>
            <Text style={styles.passengerIndexText}>{idx + 1}</Text>
          </View>
          <Text style={styles.passengerTitle}>Guest {idx + 1}</Text>
          <View style={styles.seatBadge}>
            <Text style={styles.seatBadgeText}>SEAT {seatLabel}</Text>
          </View>
        </View>

        <GoldenInput
          label="Full Legal Name (as on Passport)"
          placeholder="e.g. Lord Alexander Vance"
          value={name}
          onChangeText={handleNameChange}
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
        />

        <GoldenInput
          label="Passport / ID Number"
          placeholder="e.g. E9812409"
          value={passport}
          onChangeText={handlePassportChange}
          autoCapitalize="characters"
          autoComplete="off"
          textContentType="none"
          returnKeyType="done"
        />
      </LuxuryCard>
    );
  },
);

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function PassengerInfoScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    searchState,
    selectedSeats,
    passengers: contextPassengers,
    setPassengers: setContextPassengers,
  } = useBooking();

  // ── Local state for contact fields (already never touches context) ──────
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');

  // ── Build the initial passenger list once from context ──────────────────
  const [initPassengers] = useState<Passenger[]>(() => {
    const list: Passenger[] = [];
    for (let i = 0; i < searchState.passengerCount; i++) {
      list.push(
        contextPassengers[i] ?? {
          fullName: i === 0 && user?.name ? user.name : '',
          passportNumber: i === 0 && user?.passportNumber ? user.passportNumber : '',
          seatNumber: selectedSeats[i] ?? '',
        },
      );
    }
    return list;
  });

  // ── Ref stores CURRENT values for validation without triggering re-renders
  const latestPassengers = useRef<Passenger[]>(initPassengers.map((p) => ({ ...p })));

  const handleNameChange = useCallback((idx: number, val: string) => {
    latestPassengers.current[idx] = { ...latestPassengers.current[idx], fullName: val };
  }, []);

  const handlePassportChange = useCallback((idx: number, val: string) => {
    latestPassengers.current[idx] = { ...latestPassengers.current[idx], passportNumber: val };
  }, []);

  // ── Autofill: update both local display and the ref ──────────────────────
  const [autofillKey, setAutofillKey] = useState(0);
  const autofillDataRef = useRef<Passenger[]>(initPassengers);

  const handleAutofillSaved = useCallback(() => {
    if (user?.savedPassengers && user.savedPassengers.length > 0) {
      const updated = initPassengers.map((p, idx) => {
        const saved = user.savedPassengers?.[idx];
        return saved
          ? { ...p, fullName: saved.fullName, passportNumber: saved.passportNumber, seatNumber: selectedSeats[idx] ?? '' }
          : p;
      });
      autofillDataRef.current = updated;
      latestPassengers.current = updated.map((p) => ({ ...p }));
    } else if (user) {
      const updated = [...initPassengers];
      updated[0] = {
        ...updated[0],
        fullName: user.name,
        passportNumber: user.passportNumber || 'E884920',
        seatNumber: selectedSeats[0] ?? '',
      };
      autofillDataRef.current = updated;
      latestPassengers.current = updated.map((p) => ({ ...p }));
    }
    // Bump key to remount PassengerCards with new initial values
    setAutofillKey((k) => k + 1);
  }, [user, initPassengers, selectedSeats]);

  const handleContinue = useCallback(() => {
    const current = latestPassengers.current;
    for (let i = 0; i < current.length; i++) {
      if (!current[i].fullName.trim() || !current[i].passportNumber.trim()) {
        Alert.alert('Incomplete Details', `Please enter full name and passport number for Passenger ${i + 1}`);
        return;
      }
    }
    if (!contactEmail.trim()) {
      Alert.alert('Required', 'Please enter your contact email for ticket confirmation');
      return;
    }
    // Sync final values to context right before navigation
    setContextPassengers(current.map((p) => ({ ...p })));
    router.push('/booking/summary');
  }, [contactEmail, router, setContextPassengers]);

  const displayPassengers = autofillKey === 0 ? initPassengers : autofillDataRef.current;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Guest Information"
        subtitle={`${searchState.passengerCount} ${searchState.passengerCount === 1 ? 'PASSENGER' : 'PASSENGERS'}`}
        showBack
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Auto-fill pill */}
          {isAuthenticated ? (
            <TouchableOpacity onPress={handleAutofillSaved} style={styles.autofillPill}>
              <Ionicons name="sparkles" size={16} color={GoldenWingTheme.colors.primaryGold} />
              <Text style={styles.autofillText}>Auto-fill with Saved VIP Profile</Text>
            </TouchableOpacity>
          ) : null}

          {/* Passenger cards — each owns its own state, parent never re-renders from typing */}
          {displayPassengers.map((passenger, idx) => (
            <PassengerCard
              key={`pcard-${autofillKey}-${idx}`}
              idx={idx}
              initialName={passenger.fullName}
              initialPassport={passenger.passportNumber}
              seatLabel={selectedSeats[idx] || passenger.seatNumber || 'Unassigned'}
              onNameChange={handleNameChange}
              onPassportChange={handlePassportChange}
            />
          ))}

          {/* Contact Details */}
          <Text style={styles.sectionHeader}>CONTACT DETAILS</Text>
          <LuxuryCard style={styles.contactCard}>
            <GoldenInput
              label="E-Ticket Receipt Email"
              placeholder="e.g. vip@goldenwing.com"
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              leftIcon={MailIcon}
            />

            <GoldenInput
              label="Mobile Phone (SMS Gate Updates)"
              placeholder="+1 (555) 019-2834"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              leftIcon={PhoneIcon}
            />
          </LuxuryCard>

          <GoldenButton
            title="Review & Proceed to Payment"
            onPress={handleContinue}
            size="lg"
            style={{ marginTop: 24 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  autofillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
    marginBottom: 6,
  },
  autofillText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 13,
    fontWeight: '700',
  },
  passengerCard: {
    marginVertical: 10,
    padding: 18,
  },
  passengerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  passengerIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  passengerIndexText: {
    color: '#080808',
    fontSize: 12,
    fontWeight: '900',
  },
  passengerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  seatBadge: {
    backgroundColor: '#262626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.primaryGold,
  },
  seatBadgeText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeader: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 4,
  },
  contactCard: {
    padding: 18,
  },
});

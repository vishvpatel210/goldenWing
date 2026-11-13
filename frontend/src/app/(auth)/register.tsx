import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { GoldenWingTheme } from '../../constants/theme';
import { GoldenButton } from '../../components/common/GoldenButton';
import { GoldenInput } from '../../components/common/GoldenInput';
import { SafeAreaView } from 'react-native-safe-area-context';

// Stable icon nodes defined outside the component to prevent new object refs on every render
const PersonIcon = <Ionicons name="person-outline" size={20} color={GoldenWingTheme.colors.textSecondary} />;
const MailIcon = <Ionicons name="mail-outline" size={20} color={GoldenWingTheme.colors.textSecondary} />;
const PhoneIcon = <Ionicons name="call-outline" size={20} color={GoldenWingTheme.colors.textSecondary} />;
const LockIcon = <Ionicons name="lock-closed-outline" size={20} color={GoldenWingTheme.colors.textSecondary} />;
const ShieldIcon = <Ionicons name="shield-checkmark-outline" size={20} color={GoldenWingTheme.colors.textSecondary} />;

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in your name, email and password');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={GoldenWingTheme.colors.primaryGold} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>New Membership</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Join GoldenWing</Text>
            <Text style={styles.formSubtitle}>
              Unlock complimentary seat upgrades, priority boarding, and private lounge access.
            </Text>

            {error ? <Text style={styles.formError}>{error}</Text> : null}

            <GoldenInput
              label="Full Name"
              placeholder="e.g. Lord Alexander Vance"
              value={name}
              onChangeText={setName}
              autoComplete="name"
              textContentType="name"
              leftIcon={PersonIcon}
            />

            <GoldenInput
              label="Email Address"
              placeholder="member@goldenwing.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              leftIcon={MailIcon}
            />

            <GoldenInput
              label="Mobile Phone (Optional)"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              leftIcon={PhoneIcon}
            />

            <GoldenInput
              label="Password"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              leftIcon={LockIcon}
            />

            <GoldenInput
              label="Confirm Password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              leftIcon={ShieldIcon}
            />

            <GoldenButton
              title="Create VIP Account"
              onPress={handleRegister}
              loading={loading}
              style={styles.submitBtn}
            />

            <View style={styles.bottomLinkRow}>
              <Text style={styles.bottomLinkText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.bottomLinkHighlight}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GoldenWingTheme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  formContainer: {
    backgroundColor: GoldenWingTheme.colors.card,
    borderRadius: 20,
    padding: 24,
    marginTop: 10,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.border,
  },
  formTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  formSubtitle: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },
  formError: {
    color: GoldenWingTheme.colors.danger,
    fontSize: 13,
    marginBottom: 12,
  },
  submitBtn: {
    marginTop: 20,
  },
  bottomLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  bottomLinkText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 13,
  },
  bottomLinkHighlight: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 13,
    fontWeight: '700',
  },
});


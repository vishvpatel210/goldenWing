import React, { useState, useCallback } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { GoldenWingTheme } from '../../constants/theme';
import { GoldenButton } from '../../components/common/GoldenButton';
import { GoldenInput } from '../../components/common/GoldenInput';
import { SafeAreaView } from 'react-native-safe-area-context';

// Stable icon components defined OUTSIDE the render function to prevent re-creation
const MailIcon = <Ionicons name="mail-outline" size={20} color={GoldenWingTheme.colors.textSecondary} />;
const LockIcon = <Ionicons name="lock-closed-outline" size={20} color={GoldenWingTheme.colors.textSecondary} />;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please provide your email and password');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('elite@goldenwing.com');
    setPassword('password123');
    setError('');
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
          {/* Top Close / Back button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)')}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={24} color={GoldenWingTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Luxury Wing Crest & Branding */}
          <View style={styles.brandingBox}>
            <View style={styles.crestCircle}>
              <Ionicons name="airplane" size={32} color={GoldenWingTheme.colors.primaryGold} />
            </View>
            <Text style={styles.brandTitle}>GOLDENWING</Text>
            <Text style={styles.brandSubtitle}>PRIVATE & FIRST CLASS TRAVEL</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Member Sign In</Text>

            {error ? <Text style={styles.formError}>{error}</Text> : null}

            <GoldenInput
              label="Email Address"
              placeholder="e.g. member@goldenwing.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              leftIcon={MailIcon}
            />

            <GoldenInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              leftIcon={LockIcon}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={GoldenWingTheme.colors.textSecondary}
                  />
                </TouchableOpacity>
              }
            />

            <GoldenButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.submitBtn}
            />

            {/* Quick Demo Credentials */}
            <TouchableOpacity
              onPress={fillDemoAccount}
              style={styles.demoAccountBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="flash-outline" size={16} color={GoldenWingTheme.colors.primaryGold} />
              <Text style={styles.demoAccountText}>Use Demo VIP Account (1-Click)</Text>
            </TouchableOpacity>

            {/* Register link */}
            <View style={styles.bottomLinkRow}>
              <Text style={styles.bottomLinkText}>Not yet a GoldenWing member? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.bottomLinkHighlight}>Join Elite Club</Text>
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
    justifyContent: 'flex-end',
    paddingVertical: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GoldenWingTheme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandingBox: {
    alignItems: 'center',
    marginVertical: 24,
  },
  crestCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GoldenWingTheme.colors.card,
    borderWidth: 2,
    borderColor: GoldenWingTheme.colors.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: GoldenWingTheme.colors.primaryGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 3,
  },
  brandSubtitle: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 6,
  },
  formContainer: {
    backgroundColor: GoldenWingTheme.colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  formTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  formError: {
    color: GoldenWingTheme.colors.danger,
    fontSize: 13,
    marginBottom: 12,
  },
  submitBtn: {
    marginTop: 16,
  },
  demoAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
  },
  demoAccountText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 13,
    fontWeight: '600',
  },
  bottomLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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


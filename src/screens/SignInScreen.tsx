import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthResult = {
  error: string | null;
  message?: string;
};

type SignInScreenProps = {
  isSupabaseConfigured: boolean;
  onSignIn: (payload: { email: string; password: string }) => Promise<AuthResult>;
  onSignUpParent: (payload: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<AuthResult>;
};

type AuthMode = 'sign-in' | 'register-parent';

export function SignInScreen({
  isSupabaseConfigured,
  onSignIn,
  onSignUpParent,
}: SignInScreenProps) {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clearFeedback = () => setFeedback(null);

  const handleSubmit = async () => {
    clearFeedback();

    if (mode === 'sign-in') {
      if (!email.trim() || !password) {
        setFeedback('Enter your email and password.');
        return;
      }

      setSubmitting(true);
      const result = await onSignIn({ email, password });
      setSubmitting(false);
      setFeedback(result.error ?? result.message ?? null);
      return;
    }

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setFeedback('Complete all account creation fields.');
      return;
    }

    if (password !== confirmPassword) {
      setFeedback('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await onSignUpParent({ fullName, email, password });
    setSubmitting(false);
    setFeedback(result.error ?? result.message ?? null);
  };

  const feedbackIsError = feedback != null && !feedback.toLowerCase().includes('check your email');

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FAFCFB', '#F8FAFC', '#F3F7F4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.kicker}>Aether Education Systems</Text>
            <Text style={styles.title}>
              {mode === 'sign-in' ? 'Sign in' : 'Create parent account'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'sign-in'
                ? 'Use your email and password to continue.'
                : 'Parent registration is self-service. Teacher accounts are managed by administrators.'}
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.modeRow}>
              <Pressable
                onPress={() => {
                  setMode('sign-in');
                  clearFeedback();
                }}
                style={[styles.modeChip, mode === 'sign-in' && styles.modeChipActive]}
              >
                <Text
                  style={
                    mode === 'sign-in' ? styles.modeChipTextActive : styles.modeChipText
                  }
                >
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMode('register-parent');
                  clearFeedback();
                }}
                style={[
                  styles.modeChip,
                  mode === 'register-parent' && styles.modeChipActive,
                ]}
              >
                <Text
                  style={
                    mode === 'register-parent'
                      ? styles.modeChipTextActive
                      : styles.modeChipText
                  }
                >
                  Register
                </Text>
              </Pressable>
            </View>

            {!isSupabaseConfigured ? (
              <View style={styles.setupPanel}>
                <Text style={styles.setupTitle}>Supabase setup required</Text>
                <Text style={styles.setupBody}>
                  Add your project URL and anon key in `src/config/supabase.ts` before auth can work.
                </Text>
              </View>
            ) : null}

            {mode === 'register-parent' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  onChangeText={text => {
                    setFullName(text);
                    clearFeedback();
                  }}
                  placeholder="Parent full name"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  value={fullName}
                />
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={text => {
                  setEmail(text);
                  clearFeedback();
                }}
                placeholder="name@school.com"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                value={email}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={text => {
                  setPassword(text);
                  clearFeedback();
                }}
                placeholder="Enter password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>

            {mode === 'register-parent' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={text => {
                    setConfirmPassword(text);
                    clearFeedback();
                  }}
                  placeholder="Re-enter password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  style={styles.input}
                  value={confirmPassword}
                />
              </View>
            ) : null}

            {feedback ? (
              <Text style={feedbackIsError ? styles.errorText : styles.successText}>
                {feedback}
              </Text>
            ) : null}

            <Pressable
              disabled={submitting}
              onPress={handleSubmit}
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            >
              <Text style={styles.submitText}>
                {submitting
                  ? 'Please wait...'
                  : mode === 'sign-in'
                    ? 'Sign In'
                    : 'Create Account'}
              </Text>
            </Pressable>

            <Text style={styles.footerText}>
              {mode === 'sign-in'
                ? 'Teacher accounts should be invited by an administrator.'
                : 'Parent accounts can be created here directly.'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  header: {
    marginBottom: 34,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F7A67',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 12,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 10,
    maxWidth: 320,
    fontSize: 14,
    lineHeight: 21,
    color: '#667085',
  },
  formCard: {
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 24,
    paddingVertical: 24,
    shadowColor: '#B8C7BE',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  modeChip: {
    flex: 1,
    height: 42,
    borderRadius: 999,
    backgroundColor: '#F4F7F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeChipActive: {
    backgroundColor: '#E7F2EB',
  },
  modeChipText: {
    color: '#77847C',
    fontSize: 13,
    fontWeight: '600',
  },
  modeChipTextActive: {
    color: '#214B38',
    fontSize: 13,
    fontWeight: '700',
  },
  setupPanel: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  setupTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C2410C',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  setupBody: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#9A3412',
  },
  inputGroup: {
    marginTop: 18,
  },
  inputLabel: {
    marginBottom: 7,
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 17,
    backgroundColor: 'rgba(255,255,255,0.96)',
    color: '#0F172A',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E3E9E5',
  },
  errorText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
  },
  successText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
  },
  submitButton: {
    marginTop: 24,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#214B38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  footerText: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 17,
    color: '#7A857E',
    textAlign: 'center',
  },
});

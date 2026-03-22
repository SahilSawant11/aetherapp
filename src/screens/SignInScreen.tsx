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
        colors={['#E6FFF4', '#F4FBFF', '#E0F2FE']}
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
          <View>
            <Text style={styles.kicker}>Aether Education Systems</Text>
            <Text style={styles.title}>
              {mode === 'sign-in' ? 'Sign in' : 'Create parent account'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'sign-in'
                ? 'Use your email and password. The app will route you based on the role attached to your Supabase account.'
                : 'Parent registration is self-service. Teacher accounts should be created and invited by administrators.'}
            </Text>
          </View>

          <View style={styles.formCard}>
            <LinearGradient
              colors={mode === 'sign-in' ? ['#0F766E', '#34D399'] : ['#1D4ED8', '#38BDF8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardAccent}
            />

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
                  Register Parent
                </Text>
              </Pressable>
            </View>

            {!isSupabaseConfigured ? (
              <View style={styles.setupPanel}>
                <Text style={styles.setupTitle}>Supabase setup required</Text>
                <Text style={styles.setupBody}>
                  Add your project URL and anon key in `src/config/supabase.ts`
                  before auth can work.
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

            <View style={styles.demoPanel}>
              <Text style={styles.demoTitle}>Account model</Text>
              <Text style={styles.demoLine}>
                Parent accounts can self-register here.
              </Text>
              <Text style={styles.demoLine}>
                Teacher accounts should be invited or provisioned by admin.
              </Text>
            </View>
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
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 28,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 14,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
    maxWidth: 340,
  },
  formCard: {
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    paddingHorizontal: 20,
    paddingVertical: 22,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeChip: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.68)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeChipActive: {
    backgroundColor: '#0F172A',
  },
  modeChipText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  modeChipTextActive: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  setupPanel: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  setupTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C2410C',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  setupBody: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#9A3412',
  },
  inputGroup: {
    marginTop: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  input: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.82)',
    color: '#0F172A',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
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
    marginTop: 18,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  demoPanel: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.62)',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  demoLine: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
  },
});

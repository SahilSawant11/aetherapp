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

type ResetPasswordScreenProps = {
  onFinish: () => Promise<void>;
  onUpdatePassword: (payload: { password: string }) => Promise<AuthResult>;
};

const MIN_PASSWORD_LENGTH = 8;

export function ResetPasswordScreen({
  onFinish,
  onUpdatePassword,
}: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const submitDisabled =
    submitting || passwordUpdated || !password || !confirmPassword;

  const handleSubmit = async () => {
    setFeedback(null);

    if (!password || !confirmPassword) {
      setFeedback('Enter and confirm your new password.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFeedback(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setFeedback('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      const result = await onUpdatePassword({ password });

      if (result.error) {
        setFeedback(result.error);
        return;
      }

      setPassword('');
      setConfirmPassword('');
      setPasswordUpdated(true);
      setFeedback(result.message ?? 'Password updated. Sign in with your new password.');
    } catch {
      setFeedback('Something went wrong while updating your password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    onFinish().catch(() => undefined);
  };

  const feedbackIsError =
    feedback != null && !feedback.toLowerCase().includes('password updated');

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
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.subtitle}>
              Create a new password to finish recovering your account.
            </Text>
          </View>

          <View style={styles.formCard}>
            {!passwordUpdated ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="new-password"
                    autoCorrect={false}
                    onChangeText={text => {
                      setPassword(text);
                      setFeedback(null);
                    }}
                    placeholder={`Create a password (${MIN_PASSWORD_LENGTH}+ characters)`}
                    placeholderTextColor="#94A3B8"
                    returnKeyType="next"
                    secureTextEntry
                    style={styles.input}
                    textContentType="newPassword"
                    value={password}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="new-password"
                    autoCorrect={false}
                    onChangeText={text => {
                      setConfirmPassword(text);
                      setFeedback(null);
                    }}
                    onSubmitEditing={() => {
                      handleSubmit().catch(() => undefined);
                    }}
                    placeholder="Re-enter password"
                    placeholderTextColor="#94A3B8"
                    returnKeyType="done"
                    secureTextEntry
                    style={styles.input}
                    textContentType="newPassword"
                    value={confirmPassword}
                  />
                </View>
              </>
            ) : null}

            {feedback ? (
              <Text style={feedbackIsError ? styles.errorText : styles.successText}>
                {feedback}
              </Text>
            ) : null}

            {!passwordUpdated ? (
              <Pressable
                disabled={submitDisabled}
                onPress={handleSubmit}
                style={[styles.submitButton, submitDisabled && styles.submitButtonDisabled]}
              >
                <Text style={styles.submitText}>
                  {submitting ? 'Updating...' : 'Update Password'}
                </Text>
              </Pressable>
            ) : (
              <Pressable onPress={handleFinish} style={styles.submitButton}>
                <Text style={styles.submitText}>Back to Sign In</Text>
              </Pressable>
            )}
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
});

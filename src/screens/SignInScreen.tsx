import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppRole,
  AppUser,
  DEMO_ACCOUNTS,
  authenticateDemoUser,
} from '../auth/session';

type SignInScreenProps = {
  onSignIn: (user: AppUser) => void;
};

const ROLE_COPY: Record<AppRole, string> = {
  parent: 'Track classes, attendance, live school status, and pickup context.',
  teacher:
    'Manage attendance punches, today’s schedule, monthly presence, and staff alerts.',
};

const ROLE_ACCENTS: Record<AppRole, [string, string]> = {
  parent: ['#0F766E', '#34D399'],
  teacher: ['#1D4ED8', '#38BDF8'],
};

export function SignInScreen({ onSignIn }: SignInScreenProps) {
  const [role, setRole] = useState<AppRole>('parent');
  const [email, setEmail] = useState('parent@aether.app');
  const [password, setPassword] = useState('parent123');
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (nextRole: AppRole) => {
    setRole(nextRole);
    const account = DEMO_ACCOUNTS.find(item => item.user.role === nextRole);
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
    setError(null);
  };

  const handleSubmit = () => {
    const matchedUser = authenticateDemoUser(email, password, role);
    if (!matchedUser) {
      setError('Invalid credentials for the selected role.');
      return;
    }

    setError(null);
    onSignIn(matchedUser);
  };

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
        <View>
          <Text style={styles.kicker}>Aether Education Systems</Text>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>
            Select a role, enter credentials, and the app will route you into the
            correct workspace automatically.
          </Text>
        </View>

        <View style={styles.formCard}>
          <LinearGradient
            colors={ROLE_ACCENTS[role]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardAccent}
          />

          <View style={styles.roleRow}>
            {(['parent', 'teacher'] as AppRole[]).map(option => {
              const active = option === role;
              return (
                <Pressable
                  key={option}
                  onPress={() => handleRoleChange(option)}
                  style={[styles.roleChip, active && styles.roleChipActive]}
                >
                  <Text style={active ? styles.roleChipTextActive : styles.roleChipText}>
                    {option === 'parent' ? 'Parent' : 'Teacher'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.cardEyebrow}>
            {role === 'parent' ? 'Parent Hub access' : 'Teacher Workspace access'}
          </Text>
          <Text style={styles.cardSubtitle}>{ROLE_COPY[role]}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="name@aether.app"
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
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitText}>Sign In</Text>
          </Pressable>

          <View style={styles.demoPanel}>
            <Text style={styles.demoTitle}>Demo credentials</Text>
            {DEMO_ACCOUNTS.map(account => (
              <Text key={account.user.id} style={styles.demoLine}>
                {account.user.role}: {account.email} / {account.password}
              </Text>
            ))}
          </View>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 28,
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
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleChip: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.68)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleChipActive: {
    backgroundColor: '#0F172A',
  },
  roleChipText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  roleChipTextActive: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cardEyebrow: {
    marginTop: 18,
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  cardSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
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
  submitButton: {
    marginTop: 18,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
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

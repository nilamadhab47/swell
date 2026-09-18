import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GlowingButton } from '../components/GlowingButton';
import { OceanBackground } from '../components/OceanBackground';
import { useNicheConfig } from '../config/NicheConfigProvider';
import { ApiError } from '../data/types';
import { formatLocalPhone, isSimpleMobile } from '../auth/phone';
import { useAuthStore } from '../auth/useAuthStore';
import { useTheme } from '../theme/useTheme';
import { useTypography } from '../theme/useTypography';

type Mode = 'phone' | 'otp' | 'email' | 'register' | 'email-otp';

function messageFromError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went quiet on the network. Try again.';
}

export function AuthScreen() {
  const theme = useTheme();
  const config = useNicheConfig();
  const { display, body, label, title } = useTypography();
  const requestPhoneCode = useAuthStore((s) => s.requestPhoneCode);
  const verifyPhoneCode = useAuthStore((s) => s.verifyPhoneCode);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const loginWithApple = useAuthStore((s) => s.loginWithApple);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const resendOtp = useAuthStore((s) => s.resendOtp);

  const [mode, setMode] = useState<Mode>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appleReady, setAppleReady] = useState(false);

  const trimmedEmail = email.trim().toLowerCase();
  const phoneReady = isSimpleMobile(phone);
  const canSubmitLogin = trimmedEmail.includes('@') && password.length >= 1;
  const canSubmitRegister = canSubmitLogin && password.length >= 8;
  const canSubmitOtp = code.trim().length === 6;

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let alive = true;
    import('expo-apple-authentication')
      .then((mod) => mod.isAvailableAsync())
      .then((ok) => {
        if (alive) setAppleReady(ok);
      })
      .catch(() => {
        if (alive) setAppleReady(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const run = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(messageFromError(err));
    } finally {
      setBusy(false);
    }
  };

  const heading =
    mode === 'otp'
      ? 'Enter the code.'
      : mode === 'email-otp'
        ? 'Check your email.'
        : 'Keep this streak yours.';

  const subcopy =
    mode === 'otp'
      ? `A 6-digit code was sent to ${formatLocalPhone(phone)}.${
          __DEV__ ? ' In this build it prints in the backend terminal.' : ''
        }`
      : mode === 'email-otp'
        ? `We sent a 6-digit code to ${trimmedEmail}.${
            __DEV__ ? ' Check the backend terminal.' : ''
          }`
      : 'Your number is enough. Google or Apple if you prefer.';

  const inputStyle = [
    styles.input,
    {
      color: theme.text.primary,
      borderColor: theme.border.subtle,
      backgroundColor: theme.surface.glass,
      fontFamily: theme.fonts.body,
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: theme.surface.canvas }]}>
      <OceanBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <Text style={[label, { color: theme.text.secondary }]}>
            {config.brand.name.toUpperCase()}
          </Text>
          <Text
            style={[
              display,
              {
                color: theme.text.primary,
                marginTop: 16,
                fontSize: 36,
                lineHeight: 44,
              },
            ]}
          >
            {heading}
          </Text>
          <Text
            style={[
              body,
              {
                color: theme.text.secondary,
                marginTop: 12,
                lineHeight: 22,
              },
            ]}
          >
            {subcopy}
          </Text>

          {mode === 'phone' ? (
            <TextInput
              value={formatLocalPhone(phone)}
              onChangeText={(text) => setPhone(text.replace(/\D/g, '').slice(0, 10))}
              placeholder="98765 43210"
              placeholderTextColor={theme.text.secondary}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              style={inputStyle}
            />
          ) : null}

          {mode === 'otp' || mode === 'email-otp' ? (
            <TextInput
              value={code}
              onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="000000"
              placeholderTextColor={theme.text.secondary}
              keyboardType="number-pad"
              maxLength={6}
              style={[
                ...inputStyle,
                styles.code,
                { fontFamily: theme.fonts.display },
              ]}
            />
          ) : null}

          {mode === 'register' ? (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name (optional)"
              placeholderTextColor={theme.text.secondary}
              autoCapitalize="words"
              style={inputStyle}
            />
          ) : null}

          {mode === 'email' || mode === 'register' ? (
            <>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@email.com"
                placeholderTextColor={theme.text.secondary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                style={inputStyle}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={mode === 'register' ? 'Password (8+ characters)' : 'Password'}
                placeholderTextColor={theme.text.secondary}
                secureTextEntry
                style={inputStyle}
              />
            </>
          ) : null}

          {error ? (
            <Text style={[body, { color: theme.accent.coral, marginTop: 16 }]}>
              {error}
            </Text>
          ) : null}

          <View style={styles.footer}>
            {mode === 'phone' ? (
              <>
                <GlowingButton
                  label={busy ? 'Sending…' : 'Send code'}
                  disabled={!phoneReady || busy}
                  onPress={() =>
                    run(async () => {
                      await requestPhoneCode(config.appId, phone);
                      setCode('');
                      setMode('otp');
                    })
                  }
                  style={{ width: '100%', maxWidth: 320 }}
                />
                <GlowingButton
                  label="Continue with Google"
                  variant="glass"
                  disabled={busy}
                  onPress={() => run(() => loginWithGoogle(config.appId))}
                  style={{ width: '100%', maxWidth: 320 }}
                />
                {appleReady ? (
                  <GlowingButton
                    label="Continue with Apple"
                    variant="glass"
                    disabled={busy}
                    onPress={() => run(() => loginWithApple(config.appId))}
                    style={{ width: '100%', maxWidth: 320 }}
                  />
                ) : null}
                <Pressable
                  onPress={() => {
                    setError(null);
                    setMode('email');
                  }}
                  style={styles.switch}
                >
                  <Text style={[body, { color: theme.text.secondary }]}>
                    Use email instead
                  </Text>
                </Pressable>
              </>
            ) : null}

            {mode === 'otp' ? (
              <>
                <GlowingButton
                  label={busy ? 'Checking…' : "I'm in"}
                  disabled={!canSubmitOtp || busy}
                  onPress={() =>
                    run(() => verifyPhoneCode(config.appId, phone, code.trim()))
                  }
                />
                <Pressable
                  onPress={() =>
                    run(async () => {
                      await requestPhoneCode(config.appId, phone);
                    })
                  }
                  style={styles.switch}
                >
                  <Text style={[body, { color: theme.text.secondary }]}>
                    Resend code
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setError(null);
                    setCode('');
                    setMode('phone');
                  }}
                  style={styles.switch}
                >
                  <Text style={[title, { color: theme.accent.aqua, fontSize: 16 }]}>
                    Change number
                  </Text>
                </Pressable>
              </>
            ) : null}

            {mode === 'email' ? (
              <>
                <GlowingButton
                  label={busy ? 'Signing in…' : 'Sign in'}
                  disabled={!canSubmitLogin || busy}
                  onPress={() =>
                    run(() => login(config.appId, trimmedEmail, password))
                  }
                />
                <Pressable
                  onPress={() => {
                    setError(null);
                    setMode('register');
                  }}
                  style={styles.switch}
                >
                  <Text style={[body, { color: theme.accent.aqua }]}>
                    New here? Create an account
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setError(null);
                    setMode('phone');
                  }}
                  style={styles.switch}
                >
                  <Text style={[body, { color: theme.text.secondary }]}>
                    Back to phone
                  </Text>
                </Pressable>
              </>
            ) : null}

            {mode === 'register' ? (
              <>
                <GlowingButton
                  label={busy ? 'Sending code…' : 'Create account'}
                  disabled={!canSubmitRegister || busy}
                  onPress={() =>
                    run(async () => {
                      await register(
                        config.appId,
                        trimmedEmail,
                        password,
                        name.trim() || undefined
                      );
                      setMode('email-otp');
                    })
                  }
                />
                <Pressable
                  onPress={() => {
                    setError(null);
                    setMode('email');
                  }}
                  style={styles.switch}
                >
                  <Text style={[body, { color: theme.text.secondary }]}>
                    I already have an account
                  </Text>
                </Pressable>
              </>
            ) : null}

            {mode === 'email-otp' ? (
              <>
                <GlowingButton
                  label={busy ? 'Checking…' : "I'm in"}
                  disabled={!canSubmitOtp || busy}
                  onPress={() =>
                    run(() => verifyOtp(config.appId, trimmedEmail, code.trim()))
                  }
                />
                <Pressable
                  onPress={() => run(() => resendOtp(config.appId, trimmedEmail))}
                  style={styles.switch}
                >
                  <Text style={[body, { color: theme.text.secondary }]}>
                    Resend code
                  </Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  input: {
    marginTop: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 18,
  },
  code: {
    fontSize: 28,
    letterSpacing: 8,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 48,
    gap: 12,
    alignItems: 'center',
  },
  switch: {
    paddingVertical: 8,
  },
});

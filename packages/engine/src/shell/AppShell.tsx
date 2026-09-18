import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { BottomNav, type NavTab } from '../components/BottomNav';
import type { DevScreenTarget } from '../components/DevScreenMenu';
import { OceanBackground } from '../components/OceanBackground';
import { useAuthStore } from '../auth/useAuthStore';
import { useNicheConfig } from '../config/NicheConfigProvider';
import { getProfile, setApiBaseUrl, setDefaultAppId } from '../data/api';
import { profileLooksOnboarded, profileToAnswers } from '../data/profileMap';
import { useFlowStore } from '../flow/useFlowStore';
import { useOnboardingStore } from '../onboarding/useOnboardingStore';
import { CravingFlow } from '../flow/CravingFlow';
import { ScreenTransition } from '../motion/ScreenTransition';
import { tabEntering, tabExiting } from '../motion/presets';
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTheme } from '../theme/useTheme';

const TAB_ORDER: NavTab[] = ['home', 'progress', 'settings'];

function isNavTab(target: DevScreenTarget): target is NavTab {
  return TAB_ORDER.includes(target as NavTab);
}

/** Tab shell when idle; full-screen craving flow during a fight. */
export function AppShell() {
  const theme = useTheme();
  const config = useNicheConfig();
  const flowState = useFlowStore((s) => s.state);
  const devJumpTo = useFlowStore((s) => s.devJumpTo);
  const reset = useFlowStore((s) => s.reset);
  const onboardingDone = useOnboardingStore((s) => s.completed);
  const completeOnboarding = useOnboardingStore((s) => s.complete);
  const replayOnboarding = useOnboardingStore((s) => s.replay);
  const hydrated = useAuthStore((s) => s.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrate = useAuthStore((s) => s.hydrate);
  const [tab, setTab] = useState<NavTab>('home');
  const directionRef = useRef(1);
  const animateTabsRef = useRef(false);

  useEffect(() => {
    setApiBaseUrl(config.apiBaseUrl);
    setDefaultAppId(config.appId);
    void hydrate();
  }, [config.apiBaseUrl, config.appId, hydrate]);

  useEffect(() => {
    if (config.useMockApi || !accessToken || onboardingDone) return;
    let cancelled = false;
    getProfile(config.appId)
      .then((profile) => {
        if (cancelled || !profileLooksOnboarded(profile)) return;
        completeOnboarding(profileToAnswers(profile));
      })
      .catch(() => {
        // First-time users get an empty default profile — onboarding still shows.
      });
    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    completeOnboarding,
    config.appId,
    config.useMockApi,
    onboardingDone,
  ]);

  const handleTabPress = (next: NavTab) => {
    if (next === tab) return;
    const from = TAB_ORDER.indexOf(tab);
    const to = TAB_ORDER.indexOf(next);
    directionRef.current = to >= from ? 1 : -1;
    animateTabsRef.current = true;
    setTab(next);
  };

  const handleDevJump = (target: DevScreenTarget) => {
    if (target === 'onboarding') {
      reset();
      replayOnboarding();
      return;
    }
    if (isNavTab(target)) {
      reset();
      handleTabPress(target);
      return;
    }
    devJumpTo(target);
  };

  const handleDevReset = () => {
    reset();
    setTab('home');
  };

  if (!config.useMockApi && !hydrated) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: theme.surface.canvas }]}>
        <OceanBackground />
        <ActivityIndicator color={theme.accent.coral} />
      </View>
    );
  }

  if (!config.useMockApi && !accessToken) {
    return <AuthScreen />;
  }

  if (!onboardingDone) {
    return <OnboardingScreen />;
  }

  if (flowState !== 'idle') {
    return <CravingFlow />;
  }

  const dir = directionRef.current;
  const animateTabs = animateTabsRef.current;

  return (
    <View style={[styles.root, { backgroundColor: theme.surface.canvas }]}>
      <OceanBackground />
      <AppHeader />
      <View style={styles.pages}>
        <ScreenTransition
          childKey={tab}
          entering={animateTabs ? tabEntering(dir) : undefined}
          exiting={animateTabs ? tabExiting(dir) : undefined}
        >
          {tab === 'home' && <HomeScreen hideNav />}
          {tab === 'progress' && <ProgressScreen hideNav />}
          {tab === 'settings' && (
            <SettingsScreen
              onDevJump={handleDevJump}
              onDevReset={handleDevReset}
              hideNav
            />
          )}
        </ScreenTransition>
      </View>
      <BottomNav active={tab} onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  pages: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

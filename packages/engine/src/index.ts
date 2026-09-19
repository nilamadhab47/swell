export { NicheConfigProvider, useNicheConfig } from './config/NicheConfigProvider';
export type {
  Milestone,
  MonetizationConfig,
  NicheConfig,
  OnboardingQuestion,
} from './config/types';

export { AppShell } from './shell/AppShell';
export { OnboardingScreen } from './screens/OnboardingScreen';
export { AuthScreen } from './screens/AuthScreen';
export { useOnboardingStore } from './onboarding/useOnboardingStore';
export type { OnboardingAnswers } from './onboarding/useOnboardingStore';
export { useAuthStore } from './auth/useAuthStore';
export { CravingFlow } from './flow/CravingFlow';
export { useFlowStore } from './flow/useFlowStore';
export { ReflectScreen } from './screens/ReflectScreen';
export type { FlowState, GameId, ReflectionNote } from './flow/types';

export { BlockStackGame } from './games/blockStack/BlockStackGame';
export { ScribbleGame } from './games/scribble/ScribbleGame';
export { FlappyGame } from './games/flappy/FlappyGame';

export { getMessageForTime, getPhase, getAllMessages, MESSAGE_TRIGGER_SECONDS } from './craving/messages';
export type { CravingMessage, CravingPhase } from './craving/messages';
export { CravingTimer } from './craving/CravingTimer';
export { CravingMessageOverlay } from './craving/CravingMessageOverlay';

export { BreathingOrb } from './components/BreathingOrb';
export { ScorePlaque } from './components/ScorePlaque';
export { GlowingButton } from './components/GlowingButton';
export { StatChip } from './components/StatChip';
export { CoolingBackground } from './components/CoolingBackground';
export { OceanBackground } from './components/OceanBackground';
export { GlassCard } from './components/GlassCard';
export { AppHeader } from './components/AppHeader';
export { BottomNav } from './components/BottomNav';
export type { NavTab } from './components/BottomNav';
export { OceanConstellation } from './components/OceanConstellation';
export { LungsVisual, lungClarity } from './components/LungsVisual';
export { DevScreenMenu } from './components/DevScreenMenu';
export type { DevScreenTarget } from './components/DevScreenMenu';
export { HealthTimelineList, HealthTimelineFromConfig } from './components/HealthTimelineList';

export {
  setApiBaseUrl,
  setDefaultAppId,
  setAuthToken,
  setRefreshToken,
  getAuthToken,
  registerEmail,
  verifyEmailOtp,
  resendEmailOtp,
  loginEmail,
  logoutRemote,
  deleteAccountRemote,
  requestPhoneOtp,
  verifyPhoneOtp,
  getGoogleAuthUrl,
  loginGoogleIdToken,
  loginAppleIdToken,
  postCraving,
  patchCraving,
  getCravingStats,
  getCravings,
  getDashboard,
  getProfile,
  updateProfile,
  createProfile,
  registerPushToken,
  unregisterPushToken,
} from './data/api';
export { useDashboard, useCravingStats, dashboardQueryKey } from './data/hooks/useDashboard';
export { useCravings, useLatestNote, cravingsQueryKey } from './data/hooks/useCravings';
export { useProfile, profileQueryKey } from './data/hooks/useProfile';
export { usePushNotifications } from './hooks/usePushNotifications';
export { formatMoney, formatTimeSaved, formatDays, pickDailyQuote, moneyInRealTerms, buildProgressInsight } from './data/format';
export type {
  ApiResponse,
  CravingPayload,
  CravingRecord,
  CravingList,
  CravingStats,
  Dashboard,
  DerivedStats,
  HealthTimelineItem,
  HealthTimelineStatus,
  Profile,
  ProfileUpdate,
  AuthTokens,
  AuthUser,
} from './data/types';
export { ApiError } from './data/types';

export { useTheme } from './theme/useTheme';
export { useTypography } from './theme/useTypography';
export { ThemeProvider, useColorSchemePreference } from './theme/ThemeProvider';
export type { Theme, ColorScheme, SchemePreference } from './theme/tokens';
export {
  useMonetization,
  maybeShowPostVictoryAd,
  presentPlusPaywall,
  SWELL_PLUS,
} from './monetization';

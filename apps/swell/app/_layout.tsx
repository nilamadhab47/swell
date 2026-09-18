import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import {
  Rubik_400Regular,
  Rubik_500Medium,
} from '@expo-google-fonts/rubik';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NicheConfigProvider, ThemeProvider, useTheme } from '@swell/engine';
import { nicheConfig } from '../niche.config';

const queryClient = new QueryClient();

// ThemeProvider owns light/dark; StatusBar follows the resolved scheme.

function ThemedStatusBar() {
  const theme = useTheme();
  return <StatusBar style={theme.scheme === 'light' ? 'dark' : 'light'} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    Rubik_400Regular,
    Rubik_500Medium,
  });

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <NicheConfigProvider config={nicheConfig}>
        <ThemeProvider>
          <ThemedStatusBar />
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
        </ThemeProvider>
      </NicheConfigProvider>
    </QueryClientProvider>
  );
}

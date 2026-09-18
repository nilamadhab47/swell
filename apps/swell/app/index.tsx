import { useEffect } from 'react';
import { AppShell, setApiBaseUrl } from '@swell/engine';
import { nicheConfig } from '../niche.config';

export default function Home() {
  useEffect(() => {
    setApiBaseUrl(nicheConfig.apiBaseUrl);
  }, []);

  return <AppShell />;
}

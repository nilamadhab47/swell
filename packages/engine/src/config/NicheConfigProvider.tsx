import React, { createContext, useContext, type ReactNode } from 'react';
import type { NicheConfig } from './types';

const NicheConfigContext = createContext<NicheConfig | null>(null);

export function NicheConfigProvider({
  config,
  children,
}: {
  config: NicheConfig;
  children: ReactNode;
}) {
  return (
    <NicheConfigContext.Provider value={config}>
      {children}
    </NicheConfigContext.Provider>
  );
}

export function useNicheConfig(): NicheConfig {
  const config = useContext(NicheConfigContext);
  if (!config) {
    throw new Error('useNicheConfig must be used within NicheConfigProvider');
  }
  return config;
}

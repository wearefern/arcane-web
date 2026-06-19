import type { ReactNode } from 'react';
import { AnimatedBackground } from './AnimatedBackground';

export function CosmicAtmosphereProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <AnimatedBackground />
      {children}
    </>
  );
}

import type { ReactNode } from 'react';

/** Ambient light now lives in a single CSS layer (body::before in base.css).
 *  Kept as a thin wrapper so the app shell composition is unchanged. */
export function CosmicAtmosphereProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

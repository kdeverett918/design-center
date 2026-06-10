import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_PACK } from './copyPacks';
import type { CopyPack } from './copyPacks';

// Default = the clinical pack (the original voice), so anything rendered
// outside a provider — thumbnails, tests — reads exactly as before.
const CopyContext = createContext<CopyPack>(DEFAULT_PACK);

export function CopyProvider({ pack, children }: { pack: CopyPack; children: ReactNode }) {
  return <CopyContext.Provider value={pack}>{children}</CopyContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- tiny paired hook
export function useCopy(): CopyPack {
  return useContext(CopyContext);
}

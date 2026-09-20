import { DEFAULT_THEME_MODE, THEME_MODES, type ThemeMode } from '@repo-radar/ui';
import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS, STORAGE_VERSION } from '@/constants/storage';
import { parseOrFallback } from '@/lib/validation';

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const persistedThemeSchema = z.object({
  mode: z.enum(THEME_MODES),
});

/**
 * The app owns *where* the mode is stored; @repo-radar/ui owns how theming works.
 * Reading happens synchronously at module init, so the first paint is correct.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: DEFAULT_THEME_MODE,
      setMode: (mode) => set({ mode }),
    }),
    {
      name: STORAGE_KEYS.themeMode,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ mode: state.mode }),
      // A hand-edited or stale value can never produce an illegal palette mode.
      merge: (persisted, current) => ({
        ...current,
        ...parseOrFallback(persistedThemeSchema, persisted, { mode: DEFAULT_THEME_MODE }),
      }),
    },
  ),
);

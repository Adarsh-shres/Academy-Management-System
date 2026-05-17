import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type TextSize = 'default' | 'large' | 'extra-large';
export type LayoutDensity = 'compact' | 'comfortable';

export interface AccessibilityPreferences {
  textSize: TextSize;
  highContrast: boolean;
  reduceMotion: boolean;
  readableFont: boolean;
  layoutDensity: LayoutDensity;
  enhancedFocus: boolean;
  colorVisionSupport: boolean;
}

interface AccessibilityContextValue {
  preferences: AccessibilityPreferences;
  updatePreference: <Key extends keyof AccessibilityPreferences>(
    key: Key,
    value: AccessibilityPreferences[Key],
  ) => void;
  resetPreferences: () => void;
}

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  textSize: 'default',
  highContrast: false,
  reduceMotion: false,
  readableFont: false,
  layoutDensity: 'compact',
  enhancedFocus: false,
  colorVisionSupport: false,
};

const STORAGE_PREFIX = 'learnify-accessibility';

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function getStorageKey(userId?: string) {
  return `${STORAGE_PREFIX}:${userId ?? 'guest'}`;
}

function loadPreferences(userId?: string): AccessibilityPreferences {
  try {
    const stored = window.localStorage.getItem(getStorageKey(userId));
    if (!stored) return DEFAULT_PREFERENCES;

    return {
      ...DEFAULT_PREFERENCES,
      ...(JSON.parse(stored) as Partial<AccessibilityPreferences>),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function applyAccessibilityClasses(preferences: AccessibilityPreferences) {
  const root = document.documentElement;
  root.classList.toggle('a11y-large-text', preferences.textSize === 'large');
  root.classList.toggle('a11y-extra-large-text', preferences.textSize === 'extra-large');
  root.classList.toggle('a11y-high-contrast', preferences.highContrast);
  root.classList.toggle('a11y-reduce-motion', preferences.reduceMotion);
  root.classList.toggle('a11y-readable-font', preferences.readableFont);
  root.classList.toggle('a11y-comfortable-layout', preferences.layoutDensity === 'comfortable');
  root.classList.toggle('a11y-enhanced-focus', preferences.enhancedFocus);
  root.classList.toggle('a11y-color-vision-support', preferences.colorVisionSupport);
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => loadPreferences());

  useEffect(() => {
    setPreferences(loadPreferences(user?.id));
  }, [user?.id]);

  useEffect(() => {
    applyAccessibilityClasses(preferences);
    window.localStorage.setItem(getStorageKey(user?.id), JSON.stringify(preferences));
  }, [preferences, user?.id]);

  const updatePreference = useCallback(
    <Key extends keyof AccessibilityPreferences>(key: Key, value: AccessibilityPreferences[Key]) => {
      setPreferences((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  const value = useMemo(
    () => ({ preferences, updatePreference, resetPreferences }),
    [preferences, resetPreferences, updatePreference],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within <AccessibilityProvider>');
  return ctx;
}

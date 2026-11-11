'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: (event?: React.MouseEvent<HTMLElement> | MouseEvent) => void;
  isDark: boolean;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(t: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (t === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Stable initial state for SSR and initial client hydration
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem('dspace-theme') as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        setThemeState('dark');
        applyTheme('dark');
      }
    } catch {
      applyTheme('dark');
    }
  }, []);

  const triggerThemeChange = (nextTheme: Theme, event?: React.MouseEvent<HTMLElement> | MouseEvent) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      setThemeState(nextTheme);
      return;
    }

    const apply = () => {
      setThemeState(nextTheme);
      localStorage.setItem('dspace-theme', nextTheme);
      applyTheme(nextTheme);
    };

    // Use native View Transitions API with circular ripple when supported
    const isDocWithTransition = document as unknown as {
      startViewTransition?: (callback: () => void) => {
        ready: Promise<void>;
      };
    };

    if (
      typeof isDocWithTransition.startViewTransition === 'function' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      const x = event?.clientX ?? window.innerWidth - 80;
      const y = event?.clientY ?? 30;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const isGoingDark = nextTheme === 'dark';
      const transition = isDocWithTransition.startViewTransition(() => {
        apply();
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];
        document.documentElement.animate(
          {
            clipPath: isGoingDark ? clipPath : [...clipPath].reverse(),
          },
          {
            duration: 380,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pseudoElement: isGoingDark
              ? '::view-transition-new(root)'
              : '::view-transition-old(root)',
          }
        );
      });
    } else {
      apply();
    }
  };

  const setTheme = (t: Theme) => {
    if (t === theme) return;
    triggerThemeChange(t);
  };

  const toggleTheme = (event?: React.MouseEvent<HTMLElement> | MouseEvent) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    triggerThemeChange(next, event);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

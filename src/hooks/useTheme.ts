import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem('theme');
      } catch {
        // Storage can be blocked (private mode, disabled site data)
      }
      return document.documentElement.getAttribute('data-theme') || saved || 'dark';
    }
    return 'dark';
  });

  // Apply theme on mount and when it changes, and listen for external changes
  useEffect(() => {
    // Set initial
    document.documentElement.setAttribute('data-theme', theme);

    // Listen to changes (e.g. from other components)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const currentTheme = document.documentElement.getAttribute('data-theme');
          if (currentTheme !== theme) {
            if (currentTheme) setTheme(currentTheme);
          }
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    // This will trigger the observer, updating all useTheme hooks globally
    document.documentElement.setAttribute('data-theme', newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch {
      // Ignore storage failures; theme still applies for this session
    }
  };

  return { theme, toggleTheme };
};

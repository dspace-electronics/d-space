'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SearchContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  removeRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const POPULAR_DEFAULT_SEARCHES = ['ESP32-S3', 'Raspberry Pi 5', 'BME280', 'Soldering Iron', 'OLED', 'TP4056'];

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(POPULAR_DEFAULT_SEARCHES);

  useEffect(() => {
    const saved = localStorage.getItem('dspace_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => setIsOpen(false), []);
  const toggleSearch = useCallback(() => setIsOpen((prev) => !prev), []);

  const addRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8);
      localStorage.setItem('dspace_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== term);
      localStorage.setItem('dspace_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('dspace_recent_searches');
  }, []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K / /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearch();
      } else if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleSearch, closeSearch]);

  return (
    <SearchContext.Provider
      value={{
        isOpen,
        setIsOpen,
        openSearch,
        closeSearch,
        toggleSearch,
        recentSearches,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

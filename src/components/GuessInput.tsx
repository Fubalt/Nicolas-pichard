'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { VideoItem } from '@/types/game';
import { normalizeTitle, matchesSearch, cleanDisplayTitle } from '@/lib/utils';
import { Search, Send, Film, Check } from 'lucide-react';

interface Props {
  catalog: VideoItem[];
  onGuess: (selectedTitle: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export function GuessInput({ catalog, onGuess, disabled, placeholder = 'Rechercher une vidéo de Cyprien...' }: Props) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter video list based on query with smart fuzzy & token matching
  const suggestions = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const normQuery = normalizeTitle(trimmed);

    const matches = catalog.filter(
      (video) =>
        matchesSearch(video.title, trimmed) ||
        matchesSearch(cleanDisplayTitle(video.title), trimmed)
    );

    // Sort by best match (starts with query first, then alphabetical)
    return matches
      .sort((a, b) => {
        const cleanA = cleanDisplayTitle(a.title).toLowerCase();
        const cleanB = cleanDisplayTitle(b.title).toLowerCase();
        const aStarts = cleanA.startsWith(normQuery) || normalizeTitle(a.title).startsWith(normQuery);
        const bStarts = cleanB.startsWith(normQuery) || normalizeTitle(b.title).startsWith(normQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return cleanA.localeCompare(cleanB);
      })
      .slice(0, 15); // Show top 15 suggestions with smooth scroll
  }, [catalog, query]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen && suggestions.length > 0) {
        setIsOpen(true);
        setSelectedIndex(0);
        return;
      }
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && selectedIndex >= 0 && suggestions[selectedIndex]) {
        submitSelection(suggestions[selectedIndex].title);
      } else if (suggestions.length > 0) {
        submitSelection(suggestions[0].title);
      } else if (query.trim()) {
        submitSelection(query.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const submitSelection = (title: string) => {
    onGuess(title);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Scroll selected item into view when navigating with arrows
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Autocomplete Dropdown - Positioned ABOVE the search bar */}
      {isOpen && suggestions.length > 0 && !disabled && (
        <ul
          ref={listRef}
          className="absolute left-0 right-0 bottom-full mb-2 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto divide-y divide-zinc-800/60"
        >
          {suggestions.map((video, index) => {
            const isSelected = index === selectedIndex;
            const displayTitle = cleanDisplayTitle(video.title);

            return (
              <li
                key={video.id}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => submitSelection(video.title)}
                className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer text-sm transition-colors ${
                  isSelected ? 'bg-orange-500/15 text-orange-200' : 'text-zinc-200 hover:bg-zinc-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Film className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-orange-400' : 'text-zinc-500'}`} />
                  <span className="truncate font-medium">{displayTitle}</span>
                </div>

                {isSelected && (
                  <span className="text-[11px] font-mono text-orange-400/80 shrink-0 ml-2">
                    Entrée ↵
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {isOpen && query.trim() && suggestions.length === 0 && !disabled && (
        <div className="absolute left-0 right-0 bottom-full mb-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center text-xs text-zinc-400 shadow-xl z-50">
          Aucun titre correspondant dans le catalogue de Cyprien.
        </div>
      )}

      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-10 pr-24 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
        />

        <button
          type="button"
          onClick={() => {
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
              submitSelection(suggestions[selectedIndex].title);
            } else if (suggestions.length > 0) {
              submitSelection(suggestions[0].title);
            } else if (query.trim()) {
              submitSelection(query.trim());
            }
          }}
          disabled={disabled || !query.trim()}
          className="absolute right-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-zinc-950 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-orange-950/40"
        >
          <span>Valider</span>
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

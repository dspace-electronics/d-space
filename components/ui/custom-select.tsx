'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-neutral-900 dark:text-white hover:border-gray-300 dark:hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#e51e2b] transition-all cursor-pointer select-none"
      >
        <span className="flex items-center gap-2 truncate font-medium">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          {selectedOption ? selectedOption.label : <span className="text-neutral-400">{placeholder}</span>}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#e51e2b]' : ''
          }`}
        />
      </button>

      {/* Floating Options Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-2xl bg-white dark:bg-[#12141e] border border-gray-200 dark:border-white/15 shadow-2xl p-1.5 focus:outline-none"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-red-50 dark:bg-[#e51e2b]/15 text-[#e51e2b] font-bold'
                      : 'text-neutral-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-white/5 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <div>
                      <div className="truncate">{option.label}</div>
                      {option.description && (
                        <div className="text-[10px] text-neutral-400 font-normal">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#e51e2b] shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

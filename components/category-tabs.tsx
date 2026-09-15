'use client';

import React from 'react';
import { Cpu, Activity, BatteryCharging, Tv, Wrench, Layers, Zap } from 'lucide-react';
import { useProducts } from '@/context/product-context';

const CATEGORIES = [
  { id: 'all', name: 'All Components', icon: Layers },
  { id: 'microcontrollers', name: 'Microcontrollers & SBCs', icon: Cpu },
  { id: 'sensors', name: 'Sensors & IMUs', icon: Activity },
  { id: 'power', name: 'Power & Battery', icon: BatteryCharging },
  { id: 'actuators', name: 'Displays & Relays', icon: Tv },
  { id: 'tools', name: 'Lab & Soldering', icon: Wrench },
];

export function CategoryTabs() {
  const { selectedCategory, setSelectedCategory, voltageFilter, setVoltageFilter } = useProducts();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-200/80">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all apple-btn-press ${
                isSelected
                  ? 'bg-gray-950 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:text-gray-950 hover:bg-gray-50 border border-gray-200/90 shadow-2xs'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-red-400' : 'text-gray-500'}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Voltage Level Quick Filter */}
      <div className="flex items-center gap-2 self-start md:self-auto text-xs bg-white px-3 py-1.5 rounded-xl border border-gray-200/90 shadow-2xs">
        <span className="text-gray-500 font-medium flex items-center gap-1">
          <Zap className="h-3 w-3 text-red-500" /> Logic:
        </span>
        <div className="flex items-center gap-1">
          {['all', '3.3V', '5V'].map((volt) => (
            <button
              key={volt}
              onClick={() => setVoltageFilter(volt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                voltageFilter === volt
                  ? 'bg-red-50 text-red-700 font-bold border border-red-200 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {volt === 'all' ? 'All' : volt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

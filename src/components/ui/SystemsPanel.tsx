'use client';

// FTL-style systems panel with circular icons

import React from 'react';
import { useGameStore } from '@/stores/gameStore';
import { SystemType } from '@/utils/types';
import { COLORS } from '@/utils/constants';

// System icons and colors
const SYSTEM_CONFIG: Record<SystemType, { label: string; color: string; icon: string }> = {
  shields: { label: 'SH', color: COLORS.SHIELDS, icon: 'SH' },
  weapons: { label: 'WP', color: COLORS.WEAPONS, icon: 'WP' },
  engines: { label: 'EN', color: COLORS.ENGINES, icon: 'EN' },
  piloting: { label: 'PL', color: COLORS.PILOTING, icon: 'PL' },
};

interface SystemIconProps {
  systemType: SystemType;
}

function SystemIcon({ systemType }: SystemIconProps) {
  const { playerShip, setPowerLevel } = useGameStore();
  const system = playerShip.systems[systemType];
  const config = SYSTEM_CONFIG[systemType];

  const maxPower = Math.min(system.powerMax, system.health);
  const isPowered = system.powerCurrent > 0;
  const isDamaged = system.health < system.maxHealth;
  const isFullyDamaged = system.health === 0;

  // Power level as percentage for ring display
  const powerPercent = maxPower > 0 ? (system.powerCurrent / system.powerMax) * 100 : 0;

  const handleClick = () => {
    // Cycle power: off -> 1 -> 2 -> ... -> max -> off
    const nextPower = system.powerCurrent >= maxPower ? 0 : system.powerCurrent + 1;
    setPowerLevel(systemType, nextPower);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Circular icon with power ring */}
      <button
        onClick={handleClick}
        className="relative w-10 h-10"
        title={`${config.label}: ${system.powerCurrent}/${system.powerMax} power (${system.health}/${system.maxHealth} HP)`}
      >
        {/* Power ring background */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="17"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="4"
          />
          {/* Power ring fill */}
          <circle
            cx="20"
            cy="20"
            r="17"
            fill="none"
            stroke={isFullyDamaged ? '#c0392b' : config.color}
            strokeWidth="4"
            strokeDasharray={`${(powerPercent / 100) * 106.8} 106.8`}
            className="transition-all duration-200"
          />
        </svg>
        
        {/* Center icon */}
        <div
          className={`absolute inset-1 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
            isFullyDamaged
              ? 'bg-[#2a1a1a] text-[#c0392b]'
              : isPowered
              ? 'bg-[#1a2a1a] text-white'
              : 'bg-[#1a1a1a] text-[#5a5a5a]'
          }`}
          style={{
            backgroundColor: isPowered && !isFullyDamaged ? `${config.color}22` : undefined,
          }}
        >
          {config.icon}
        </div>

        {/* Damage indicator */}
        {isDamaged && !isFullyDamaged && (
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#c0392b] rounded-full animate-pulse" />
        )}

        {/* Manning indicator */}
        {system.manned && (
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#f1c40f] rounded-full" />
        )}
      </button>

      {/* Power bars below icon */}
      <div className="flex gap-[1px]">
        {Array.from({ length: system.powerMax }).map((_, i) => {
          const isPoweredBar = i < system.powerCurrent;
          const isDamagedBar = i >= system.health;

          return (
            <div
              key={i}
              className={`w-2 h-3 transition-all ${
                isDamagedBar
                  ? 'bg-[#4a2020] border border-[#5a2020]'
                  : isPoweredBar
                  ? 'border border-opacity-50'
                  : 'bg-[#1a1a1a] border border-[#2a2a2a]'
              }`}
              style={{
                backgroundColor: isPoweredBar && !isDamagedBar ? config.color : undefined,
                borderColor: isPoweredBar && !isDamagedBar ? config.color : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function SystemsPanel() {
  const { playerShip } = useGameStore();

  return (
    <div className="flex flex-col gap-2">
      {/* Reactor power indicator */}
      <div className="flex items-center justify-center gap-1 mb-1">
        <div className="flex gap-[1px]">
          {Array.from({ length: playerShip.reactor }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-4 ${
                i < playerShip.powerUsed
                  ? 'bg-[#f1c40f]'
                  : 'bg-[#1a1a1a] border border-[#2a2a2a]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* System icons in a grid */}
      <div className="grid grid-cols-2 gap-2">
        <SystemIcon systemType="shields" />
        <SystemIcon systemType="weapons" />
        <SystemIcon systemType="engines" />
        <SystemIcon systemType="piloting" />
      </div>
    </div>
  );
}

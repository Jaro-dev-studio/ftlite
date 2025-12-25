'use client';

// FTL-style target panel showing enemy ship info

import React from 'react';
import { useGameStore } from '@/stores/gameStore';
import { COLORS } from '@/utils/constants';

// System icon configs
const SYSTEM_ICONS: Record<string, { color: string; label: string }> = {
  oxygen: { color: COLORS.OXYGEN, label: 'O2' },
  weapons: { color: COLORS.WEAPONS, label: 'W' },
  shields: { color: COLORS.SHIELDS, label: 'S' },
  engines: { color: COLORS.ENGINES, label: 'E' },
  piloting: { color: COLORS.PILOTING, label: 'P' },
};

export function TargetPanel() {
  const { enemyShip } = useGameStore();

  if (!enemyShip) {
    return (
      <div className="bg-[#1a0a0a] h-full p-3">
        <div className="bg-[#2a1515] px-3 py-2 -mx-3 -mt-3 mb-3 border-b border-[#4a2525]">
          <span className="text-[#ff6b6b] font-bold text-sm tracking-wider">TARGET</span>
        </div>
        <div className="text-center text-[#4a4a4a] text-xs py-8">
          No enemy detected
        </div>
      </div>
    );
  }

  const hullPercent = (enemyShip.hull / enemyShip.maxHull) * 100;

  return (
    <div className="bg-[#180808] h-full flex flex-col">
      {/* Header */}
      <div className="bg-[#2a1010] px-3 py-2 border-b border-[#4a2020]">
        <span className="text-[#ff6b6b] font-bold text-sm tracking-wider">TARGET</span>
      </div>

      {/* Ship Info */}
      <div className="p-3 flex-1">
        {/* Hull bar */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#27ae60] text-[10px] font-bold">HULL</span>
            <div className="flex-1 h-2 bg-[#1a1a1a] rounded-sm overflow-hidden">
              <div
                className="h-full bg-[#27ae60] transition-all"
                style={{ width: `${hullPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Shields bar */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#3498db] text-[10px] font-bold">SHIELDS</span>
            <div className="flex gap-1">
              {Array.from({ length: enemyShip.maxShieldLayers }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border ${
                    i < enemyShip.shieldLayers
                      ? 'bg-[#3498db] border-[#5dade2]'
                      : 'bg-[#1a1a1a] border-[#2a2a2a]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Ship class info */}
        <div className="mb-3 py-2 border-y border-[#2a1515]">
          <div className="text-[10px] text-[#8a8a8a]">
            Class: <span className="text-[#ecf0f1]">{enemyShip.name}</span>
          </div>
          <div className="text-[10px] text-[#8a8a8a]">
            Relationship: <span className="text-[#ff6b6b]">Hostile</span>
          </div>
        </div>

        {/* Spacer for visual representation area */}
        <div className="flex-1 min-h-[100px] bg-[#0a0505] rounded border border-[#2a1515] mb-3 flex items-center justify-center">
          <span className="text-[#3a2020] text-[10px]">Enemy View</span>
        </div>

        {/* System status icons at bottom */}
        <div className="flex justify-center gap-2 pt-2 border-t border-[#2a1515]">
          {(['oxygen', 'weapons', 'shields', 'engines', 'piloting'] as const).map(sysKey => {
            const system = sysKey === 'oxygen' ? null : enemyShip.systems[sysKey as keyof typeof enemyShip.systems];
            const config = SYSTEM_ICONS[sysKey];
            const health = system ? system.health : 2;
            const maxHealth = system ? system.maxHealth : 2;
            const healthPercent = maxHealth > 0 ? health / maxHealth : 1;
            
            let bgColor = config.color;
            if (healthPercent === 0) bgColor = '#4a4a4a';
            else if (healthPercent < 0.5) bgColor = '#c0392b';

            return (
              <div
                key={sysKey}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2"
                style={{
                  backgroundColor: `${bgColor}44`,
                  borderColor: bgColor,
                }}
                title={`${sysKey}: ${health}/${maxHealth}`}
              >
                {config.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

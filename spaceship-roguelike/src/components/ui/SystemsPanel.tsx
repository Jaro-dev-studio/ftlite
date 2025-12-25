'use client';

// Systems panel for power allocation

import React from 'react';
import { useGameStore } from '@/stores/gameStore';
import { SystemType } from '@/utils/types';
import { SYSTEM_NAMES } from '@/utils/constants';

interface SystemRowProps {
  systemType: SystemType;
}

function SystemRow({ systemType }: SystemRowProps) {
  const { playerShip, setPowerLevel } = useGameStore();
  const system = playerShip.systems[systemType];

  const maxPower = Math.min(system.powerMax, system.health);
  const displayName = SYSTEM_NAMES[systemType] || systemType;

  const handlePowerChange = (delta: number) => {
    const newPower = system.powerCurrent + delta;
    if (newPower >= 0 && newPower <= maxPower) {
      setPowerLevel(systemType, newPower);
    }
  };

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-20 text-gray-300 text-sm">{displayName}</span>
      
      {/* Power bars */}
      <div className="flex gap-0.5">
        {Array.from({ length: system.powerMax }).map((_, i) => {
          let bgColor = 'bg-gray-700';
          if (i < system.powerCurrent) {
            bgColor = 'bg-green-500';
          } else if (i >= system.health) {
            bgColor = 'bg-red-900';
          }
          
          return (
            <button
              key={i}
              onClick={() => setPowerLevel(systemType, i + 1)}
              className={`w-4 h-6 ${bgColor} hover:opacity-80 transition-opacity`}
              title={`Set power to ${i + 1}`}
            />
          );
        })}
      </div>

      {/* Power controls */}
      <div className="flex gap-1 ml-2">
        <button
          onClick={() => handlePowerChange(-1)}
          disabled={system.powerCurrent === 0}
          className="w-6 h-6 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm rounded"
        >
          -
        </button>
        <button
          onClick={() => handlePowerChange(1)}
          disabled={system.powerCurrent >= maxPower}
          className="w-6 h-6 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm rounded"
        >
          +
        </button>
      </div>

      {/* Manning indicator */}
      {system.manned && (
        <span className="text-xs text-yellow-400 ml-2" title="System is manned (+bonus)">
          [M]
        </span>
      )}

      {/* Damage indicator */}
      {system.health < system.maxHealth && (
        <span className="text-xs text-red-400 ml-1" title="System damaged">
          DMG
        </span>
      )}
    </div>
  );
}

export function SystemsPanel() {
  const { playerShip } = useGameStore();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold text-sm">SYSTEMS</h3>
        <span className="text-gray-400 text-xs">
          Power: {playerShip.powerUsed}/{playerShip.reactor}
        </span>
      </div>
      
      <div className="space-y-1">
        <SystemRow systemType="shields" />
        <SystemRow systemType="weapons" />
        <SystemRow systemType="engines" />
        <SystemRow systemType="piloting" />
      </div>
    </div>
  );
}

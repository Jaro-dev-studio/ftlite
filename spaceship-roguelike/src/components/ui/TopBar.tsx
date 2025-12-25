'use client';

// Top bar showing hull, shields, resources, and pause status

import React from 'react';
import { useGameStore } from '@/stores/gameStore';

export function TopBar() {
  const { playerShip, paused, missiles, fuel, scrap, togglePause, gameStarted } = useGameStore();

  const hullPercent = (playerShip.hull / playerShip.maxHull) * 100;
  let hullColor = 'bg-green-500';
  if (hullPercent < 30) hullColor = 'bg-red-500';
  else if (hullPercent < 60) hullColor = 'bg-yellow-500';

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {/* Hull */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm font-medium">HULL</span>
          <div className="w-32 h-4 bg-gray-700 rounded overflow-hidden">
            <div
              className={`h-full ${hullColor} transition-all duration-300`}
              style={{ width: `${hullPercent}%` }}
            />
          </div>
          <span className="text-white text-sm font-mono">
            {playerShip.hull}/{playerShip.maxHull}
          </span>
        </div>

        {/* Shields */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm font-medium">SHIELDS</span>
          <div className="flex gap-1">
            {Array.from({ length: playerShip.maxShieldLayers }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 ${
                  i < playerShip.shieldLayers
                    ? 'bg-blue-500 border-blue-400'
                    : 'bg-gray-700 border-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-orange-400 text-sm">Missiles:</span>
            <span className="text-white font-mono">{missiles}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-sm">Fuel:</span>
            <span className="text-white font-mono">{fuel}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-emerald-400 text-sm">Scrap:</span>
            <span className="text-white font-mono">{scrap}</span>
          </div>
        </div>
      </div>

      {/* Pause button */}
      <div className="flex items-center gap-4">
        {gameStarted && (
          <>
            {paused ? (
              <span className="text-yellow-400 font-bold animate-pulse">PAUSED</span>
            ) : (
              <span className="text-green-400 font-bold">RUNNING</span>
            )}
            <button
              onClick={togglePause}
              className="px-4 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              {paused ? 'Resume (Space)' : 'Pause (Space)'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

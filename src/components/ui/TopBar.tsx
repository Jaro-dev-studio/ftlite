'use client';

// FTL-style top bar

import React from 'react';
import { useGameStore } from '@/stores/gameStore';

export function TopBar() {
  const { playerShip, paused, missiles, fuel, scrap, togglePause, gameStarted } = useGameStore();

  const hullPercent = (playerShip.hull / playerShip.maxHull) * 100;
  const isCritical = hullPercent < 30;
  const isDamaged = hullPercent < 60;

  return (
    <div className="bg-[#0a0a0a] border-b border-[#2a2a2a] px-3 py-1.5">
      <div className="flex items-center justify-between">
        {/* Left: Hull and Shields */}
        <div className="flex items-center gap-6">
          {/* Hull Bar */}
          <div className="flex items-center gap-2">
            <span className="text-[#27ae60] font-bold text-xs tracking-wider">HULL</span>
            <div className="flex gap-[1px]">
              {Array.from({ length: playerShip.maxHull }).map((_, i) => {
                const isFilled = i < playerShip.hull;
                const segmentCritical = isCritical && isFilled;
                const segmentDamaged = isDamaged && !isCritical && isFilled;

                return (
                  <div
                    key={i}
                    className={`w-[8px] h-[14px] ${
                      isFilled
                        ? segmentCritical
                          ? 'bg-[#c0392b]'
                          : segmentDamaged
                          ? 'bg-[#f39c12]'
                          : 'bg-[#27ae60]'
                        : 'bg-[#1a1a1a]'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Shields */}
          <div className="flex items-center gap-2">
            <span className="text-[#3498db] font-bold text-xs tracking-wider">SHIELDS</span>
            <div className="flex gap-1">
              {Array.from({ length: playerShip.maxShieldLayers }).map((_, i) => {
                const isActive = i < playerShip.shieldLayers;
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 ${
                      isActive
                        ? 'bg-[#3498db] border-[#5dade2]'
                        : 'bg-[#1a1a1a] border-[#2a2a3a]'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Scrap counter */}
          <div className="flex items-center gap-1 border-l border-[#2a2a2a] pl-4">
            <svg className="w-4 h-4 text-[#1abc9c]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-[#ecf0f1] font-bold text-lg">{scrap}</span>
          </div>

          {/* Missiles */}
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#e67e22]" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
            <span className="text-[#ecf0f1] font-bold">{missiles}</span>
          </div>

          {/* Fuel */}
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#f1c40f] rounded-sm" />
            <span className="text-[#ecf0f1] font-bold">{fuel}</span>
          </div>
        </div>

        {/* Center: FTL Drive */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-[#7a7a8a] text-[9px]">FTL Drive</span>
            <div className="w-20 h-5 bg-[#1a1a1a] border border-[#2a2a2a] rounded flex items-center justify-center">
              <span className="text-[#3498db] text-[10px] font-bold">CHARGING</span>
            </div>
          </div>
          <button className="ftl-button px-4 py-1.5 text-xs">
            SHIP
          </button>
        </div>

        {/* Right: Pause controls */}
        <div className="flex items-center gap-3">
          {gameStarted && (
            <>
              <button
                onClick={togglePause}
                className={`ftl-button ${paused ? 'primary' : ''} px-4 py-1 text-xs`}
              >
                {paused ? 'RESUME' : 'PAUSE'}
              </button>
              <span className="text-[10px] text-[#5a5a6a]">[SPACE]</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

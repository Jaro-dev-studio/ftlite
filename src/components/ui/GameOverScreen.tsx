'use client';

// FTL-style game over screen

import React from 'react';
import { useGameStore } from '@/stores/gameStore';

export function GameOverScreen() {
  const { gameOver, victory, resetGame, scrap } = useGameStore();

  if (!gameOver) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="ftl-panel p-8 max-w-md text-center">
        {victory ? (
          <>
            {/* Victory */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#27ae60] to-[#1e8449] flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-[#27ae60] mb-2 tracking-wider">
                VICTORY
              </h2>
              <p className="text-[#95a5a6] text-sm">
                Enemy ship destroyed!
              </p>
            </div>

            {/* Rewards */}
            <div className="bg-[#1a1a1a] rounded p-4 mb-6">
              <div className="text-[#f1c40f] text-xs font-bold tracking-wider mb-2">
                REWARDS
              </div>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-[#1abc9c] text-2xl font-bold">+15</div>
                  <div className="text-[#5a5a5a] text-[10px]">SCRAP</div>
                </div>
                <div className="text-center">
                  <div className="text-[#e67e22] text-2xl font-bold">+2</div>
                  <div className="text-[#5a5a5a] text-[10px]">MISSILES</div>
                </div>
                <div className="text-center">
                  <div className="text-[#f1c40f] text-2xl font-bold">+1</div>
                  <div className="text-[#5a5a5a] text-[10px]">FUEL</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Defeat */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#c0392b] to-[#962d22] flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-[#c0392b] mb-2 tracking-wider">
                SHIP DESTROYED
              </h2>
              <p className="text-[#95a5a6] text-sm">
                Your ship has been destroyed by the enemy.
              </p>
            </div>

            {/* Final Stats */}
            <div className="bg-[#1a1a1a] rounded p-4 mb-6">
              <div className="text-[#5a5a5a] text-xs font-bold tracking-wider mb-2">
                FINAL STATS
              </div>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-[#1abc9c] text-2xl font-bold">{scrap}</div>
                  <div className="text-[#5a5a5a] text-[10px]">SCRAP</div>
                </div>
                <div className="text-center">
                  <div className="text-[#95a5a6] text-2xl font-bold">1</div>
                  <div className="text-[#5a5a5a] text-[10px]">SECTOR</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={resetGame}
            className={`ftl-button ${victory ? 'primary' : 'danger'} px-8 py-3`}
          >
            {victory ? 'CONTINUE' : 'TRY AGAIN'}
          </button>
        </div>

        {/* Hint */}
        <p className="mt-4 text-[#4a4a5a] text-[10px]">
          Press any key to continue
        </p>
      </div>
    </div>
  );
}

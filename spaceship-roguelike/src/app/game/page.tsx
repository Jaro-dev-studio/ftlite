'use client';

// Main game screen

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { GameCanvas } from '@/components/canvas/GameCanvas';
import { TopBar } from '@/components/ui/TopBar';
import { SystemsPanel } from '@/components/ui/SystemsPanel';
import { WeaponsPanel } from '@/components/ui/WeaponsPanel';
import { CrewPanel } from '@/components/ui/CrewPanel';
import { GameOverScreen } from '@/components/ui/GameOverScreen';
import { useKeyboard } from '@/hooks/useKeyboard';

export default function GamePage() {
  const router = useRouter();
  const { gameStarted, startGame } = useGameStore();

  // Initialize keyboard controls
  useKeyboard();

  // Start game on mount if not started
  useEffect(() => {
    if (!gameStarted) {
      // Don't auto-start, let user click
    }
  }, [gameStarted]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top bar */}
      <TopBar />

      {/* Main game area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Start button overlay */}
        {!gameStarted && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">FTL-Style Roguelike</h1>
              <p className="text-gray-400 mb-8">A spaceship combat game</p>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold rounded-lg transition-colors"
              >
                Start Combat
              </button>
              <button
                onClick={() => router.push('/')}
                className="block mx-auto mt-4 text-gray-400 hover:text-white transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}

        {/* Canvas */}
        <GameCanvas />

        {/* Bottom panels */}
        <div className="w-full max-w-4xl mt-4 grid grid-cols-3 gap-4">
          <SystemsPanel />
          <WeaponsPanel />
          <CrewPanel />
        </div>

        {/* Controls help */}
        <div className="mt-4 text-gray-500 text-sm text-center">
          <span className="mx-2">Space: Pause</span>
          <span className="mx-2">Tab: Cycle crew</span>
          <span className="mx-2">1-4: Fire weapons</span>
          <span className="mx-2">Click: Select/move crew, target weapons</span>
        </div>
      </div>

      {/* Game over overlay */}
      <GameOverScreen />
    </div>
  );
}

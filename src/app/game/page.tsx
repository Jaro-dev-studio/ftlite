'use client';

// Main game screen - Full screen canvas with HUD overlays (FTL-style)

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { GameCanvas } from '@/components/canvas/GameCanvas';
import { HUD } from '@/components/ui/HUD';
import { GameOverScreen } from '@/components/ui/GameOverScreen';
import { useKeyboard } from '@/hooks/useKeyboard';

export default function GamePage() {
  const router = useRouter();
  const { gameStarted, startGame } = useGameStore();

  // Initialize keyboard controls
  useKeyboard();

  return (
    <div className="fixed inset-0 bg-[#0a0a12] overflow-hidden">
      {/* Full screen game canvas */}
      <GameCanvas />

      {/* HUD overlay */}
      <HUD />

      {/* Start button overlay */}
      {!gameStarted && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center ftl-panel p-8">
            <h1 className="text-3xl font-bold text-[#4fc3f7] mb-2 tracking-wider">
              FTL-STYLE COMBAT
            </h1>
            <p className="text-[#95a5a6] mb-6 text-sm">
              Tactical spaceship combat simulator
            </p>
            <button
              onClick={startGame}
              className="ftl-button primary px-10 py-3 text-lg"
            >
              START COMBAT
            </button>
            <button
              onClick={() => router.push('/')}
              className="block mx-auto mt-4 text-[#5a5a6a] hover:text-[#8a8a9a] transition-colors text-sm"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Game over overlay */}
      <GameOverScreen />
    </div>
  );
}

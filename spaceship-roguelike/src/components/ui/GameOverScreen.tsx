'use client';

// Game over screen showing victory or defeat

import React from 'react';
import { useGameStore } from '@/stores/gameStore';

export function GameOverScreen() {
  const { gameOver, victory, resetGame, playerShip, enemyShip } = useGameStore();

  if (!gameOver) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 max-w-md text-center">
        <h1
          className={`text-4xl font-bold mb-4 ${
            victory ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {victory ? 'VICTORY!' : 'DEFEAT'}
        </h1>

        <p className="text-gray-300 mb-6">
          {victory
            ? 'You have destroyed the enemy ship!'
            : 'Your ship has been destroyed.'}
        </p>

        <div className="bg-gray-700/50 rounded p-4 mb-6">
          <h3 className="text-white font-bold mb-2">Battle Summary</h3>
          <div className="flex justify-around text-sm">
            <div>
              <div className="text-gray-400">Your Hull</div>
              <div className={`font-mono ${playerShip.hull > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {playerShip.hull}/{playerShip.maxHull}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Enemy Hull</div>
              <div className={`font-mono ${enemyShip && enemyShip.hull > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {enemyShip?.hull || 0}/{enemyShip?.maxHull || 0}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

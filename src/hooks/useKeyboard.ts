'use client';

// Keyboard hook for handling hotkeys

import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function useKeyboard() {
  const {
    togglePause,
    cycleCrewSelection,
    startTargeting,
    cancelTargeting,
    playerShip,
    targetingWeaponId,
    gameStarted,
    gameOver,
  } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          if (gameStarted && !gameOver) {
            togglePause();
          }
          break;

        case 'Tab':
          event.preventDefault();
          if (gameStarted && !gameOver) {
            cycleCrewSelection();
          }
          break;

        case 'Escape':
          if (targetingWeaponId) {
            cancelTargeting();
          }
          break;

        // Weapon hotkeys 1-4 - always start targeting mode
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
          if (gameStarted && !gameOver) {
            const weaponIndex = parseInt(event.code.replace('Digit', '')) - 1;
            const weapon = playerShip.weapons[weaponIndex];
            if (weapon && weapon.powered) {
              startTargeting(weapon.id);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePause,
    cycleCrewSelection,
    startTargeting,
    cancelTargeting,
    playerShip,
    targetingWeaponId,
    gameStarted,
    gameOver,
  ]);
}

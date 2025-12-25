'use client';

// Main game canvas component

import React, { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { drawShip } from './ShipRenderer';
import { drawProjectiles } from './CombatRenderer';
import { RENDER, COLORS } from '@/utils/constants';
import { findRoomAtPoint } from '@/utils/helpers';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const {
    playerShip,
    enemyShip,
    projectiles,
    paused,
    gameStarted,
    gameOver,
    targetingWeaponId,
    selectedCrewId,
    updateGame,
    setWeaponTarget,
    moveCrew,
    selectCrew,
  } = useGameStore();

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // If targeting, check for enemy ship room click
      if (targetingWeaponId && enemyShip) {
        const room = findRoomAtPoint({ x, y }, enemyShip);
        if (room) {
          setWeaponTarget(targetingWeaponId, room.id);
          return;
        }
      }

      // Check for player ship room click (move crew)
      const playerRoom = findRoomAtPoint({ x, y }, playerShip);
      if (playerRoom) {
        if (selectedCrewId) {
          moveCrew(selectedCrewId, playerRoom.id);
        } else {
          // Select crew in this room
          const crewInRoom = playerShip.crew.find(
            c => c.currentRoom === playerRoom.id && c.isPlayer
          );
          if (crewInRoom) {
            selectCrew(crewInRoom.id);
          }
        }
        return;
      }

      // Check for enemy ship click when targeting
      if (targetingWeaponId && enemyShip) {
        const enemyRoom = findRoomAtPoint({ x, y }, enemyShip);
        if (enemyRoom) {
          setWeaponTarget(targetingWeaponId, enemyRoom.id);
        }
      }
    },
    [targetingWeaponId, enemyShip, playerShip, selectedCrewId, setWeaponTarget, moveCrew, selectCrew]
  );

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = (currentTime: number) => {
      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = currentTime;

      if (!paused) {
        updateGame(Math.min(deltaTime, 0.1)); // Cap delta to prevent huge jumps
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, gameOver, paused, updateGame]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = COLORS.SPACE;
      ctx.fillRect(0, 0, RENDER.CANVAS_WIDTH, RENDER.CANVAS_HEIGHT);

      if (!gameStarted) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Press Start to begin combat', RENDER.CANVAS_WIDTH / 2, RENDER.CANVAS_HEIGHT / 2);
        return;
      }

      // Get current weapon target for highlighting
      const currentWeapon = playerShip.weapons.find(w => w.id === targetingWeaponId);
      const targetedRoomId = currentWeapon?.targetRoom || null;

      // Draw player ship
      drawShip(ctx, playerShip);

      // Draw enemy ship if in combat
      if (enemyShip) {
        // When targeting, show hoverable rooms
        if (targetingWeaponId) {
          // Draw with targeting highlight
          drawShip(ctx, enemyShip, null);
          
          // Draw targeting overlay on enemy ship
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(
            enemyShip.position.x,
            enemyShip.position.y,
            4 * RENDER.TILE_SIZE,
            4 * RENDER.TILE_SIZE
          );
        } else {
          drawShip(ctx, enemyShip, targetedRoomId);
        }
      }

      // Draw projectiles
      drawProjectiles(ctx, projectiles);

      // Draw pause overlay
      if (paused && !gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, RENDER.CANVAS_WIDTH, RENDER.CANVAS_HEIGHT);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PAUSED', RENDER.CANVAS_WIDTH / 2, RENDER.CANVAS_HEIGHT / 2);
        ctx.font = '16px sans-serif';
        ctx.fillText('Press SPACE to resume', RENDER.CANVAS_WIDTH / 2, RENDER.CANVAS_HEIGHT / 2 + 40);
      }

      // Draw targeting mode indicator
      if (targetingWeaponId) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('SELECT TARGET ROOM (Click enemy ship)', RENDER.CANVAS_WIDTH / 2, 10);
      }
    };

    render();

    // Set up render loop
    let renderFrame: number;
    const renderLoop = () => {
      render();
      renderFrame = requestAnimationFrame(renderLoop);
    };
    renderFrame = requestAnimationFrame(renderLoop);

    return () => cancelAnimationFrame(renderFrame);
  }, [playerShip, enemyShip, projectiles, paused, gameStarted, gameOver, targetingWeaponId]);

  return (
    <canvas
      ref={canvasRef}
      width={RENDER.CANVAS_WIDTH}
      height={RENDER.CANVAS_HEIGHT}
      onClick={handleCanvasClick}
      className="border-2 border-gray-700 rounded-lg cursor-crosshair"
      style={{ backgroundColor: COLORS.SPACE }}
    />
  );
}

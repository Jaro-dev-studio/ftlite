'use client';

// Full-screen game canvas with FTL-style rendering

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { drawShip } from './ShipRenderer';
import { drawProjectiles } from './CombatRenderer';
import { RENDER, COLORS } from '@/utils/constants';
import { findRoomAtPoint } from '@/utils/helpers';

// Generate static starfield
function generateStars(count: number, width: number, height: number) {
  const stars: { x: number; y: number; size: number; brightness: number }[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      brightness: Math.random() * 0.5 + 0.3,
    });
  }
  return stars;
}

// Draw starfield background
function drawStarfield(
  ctx: CanvasRenderingContext2D,
  stars: { x: number; y: number; size: number; brightness: number }[],
  time: number
) {
  for (const star of stars) {
    const twinkle = Math.sin(time * 0.001 + star.x + star.y) * 0.15 + 0.85;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`;
    ctx.fill();
  }
}

// Draw nebula/space dust
function drawNebula(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Subtle blue nebula
  const gradient1 = ctx.createRadialGradient(width * 0.2, height * 0.5, 50, width * 0.2, height * 0.5, 400);
  gradient1.addColorStop(0, 'rgba(52, 152, 219, 0.03)');
  gradient1.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient1;
  ctx.fillRect(0, 0, width, height);

  // Subtle red/orange nebula
  const gradient2 = ctx.createRadialGradient(width * 0.8, height * 0.6, 30, width * 0.8, height * 0.6, 300);
  gradient2.addColorStop(0, 'rgba(231, 76, 60, 0.025)');
  gradient2.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient2;
  ctx.fillRect(0, 0, width, height);
}

// Draw distant planet
function drawPlanet(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  const glowGradient = ctx.createRadialGradient(x, y, radius * 0.9, x, y, radius * 1.4);
  glowGradient.addColorStop(0, `${color}22`);
  glowGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.4, 0, Math.PI * 2);
  ctx.fill();

  const planetGradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
  planetGradient.addColorStop(0, color);
  planetGradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = planetGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const starsRef = useRef<{ x: number; y: number; size: number; brightness: number }[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [timeCounter, setTimeCounter] = useState(0);

  const {
    playerShip,
    enemyShip,
    projectiles,
    paused,
    gameStarted,
    gameOver,
    targetingWeaponId,
    selectedCrewId,
    missiles,
    updateGame,
    setWeaponTarget,
    fireWeapon,
    moveCrew,
    selectCrew,
    cancelTargeting,
  } = useGameStore();

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize stars when canvas size changes
  useEffect(() => {
    starsRef.current = generateStars(300, canvasSize.width, canvasSize.height);
  }, [canvasSize]);

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;

      // Calculate dynamic ship positions (same as in render)
      const centerY = canvasSize.height / 2;
      const playerX = canvasSize.width * 0.25;
      const enemyX = canvasSize.width * 0.65;

      // Create position-adjusted ships for hit detection
      const playerShipAdjusted = {
        ...playerShip,
        position: { x: playerX, y: centerY - 100 },
      };

      const enemyShipAdjusted = enemyShip ? {
        ...enemyShip,
        position: { x: enemyX, y: centerY - 100 },
      } : null;

      // Calculate crew position offset (from original to current render position)
      const crewOffsetX = playerX - RENDER.PLAYER_SHIP_X;
      const crewOffsetY = (centerY - 100) - RENDER.SHIP_Y;

      // First check if clicking on a crew member (highest priority for selection)
      const clickedCrew = playerShip.crew.find(crew => {
        if (!crew.isPlayer) return false;
        const crewX = crew.position.x + crewOffsetX;
        const crewY = crew.position.y + crewOffsetY;
        const dist = Math.sqrt((x - crewX) ** 2 + (y - crewY) ** 2);
        return dist <= RENDER.CREW_RADIUS + 5; // Add a bit of tolerance
      });

      if (clickedCrew) {
        // If we have a crew selected and clicked on another crew, just select the new one
        // If clicked on currently selected crew, deselect
        if (selectedCrewId === clickedCrew.id) {
          selectCrew(null);
        } else {
          selectCrew(clickedCrew.id);
        }
        return;
      }

      // If targeting, check for enemy ship room click
      if (targetingWeaponId && enemyShipAdjusted) {
        const room = findRoomAtPoint({ x, y }, enemyShipAdjusted);
        if (room) {
          // Set the target
          setWeaponTarget(targetingWeaponId, room.id);
          
          // If weapon is charged, fire immediately
          const weapon = playerShip.weapons.find(w => w.id === targetingWeaponId);
          if (weapon && weapon.powered && weapon.currentCharge >= weapon.chargeTime) {
            // Check if can fire (has missiles if needed)
            const canFire = weapon.missilesCost === 0 || missiles >= weapon.missilesCost;
            if (canFire) {
              // Small delay to ensure target is set before firing
              setTimeout(() => fireWeapon(targetingWeaponId), 0);
            }
          }
          return;
        }
      }

      // Check for player ship room click (move crew if one is selected)
      const playerRoom = findRoomAtPoint({ x, y }, playerShipAdjusted);
      if (playerRoom) {
        if (selectedCrewId) {
          moveCrew(selectedCrewId, playerRoom.id);
        }
        // Don't auto-select crew when clicking room - only direct crew clicks select
        return;
      }

      // Check for enemy ship click when targeting (fallback, should not reach here normally)
      if (targetingWeaponId && enemyShipAdjusted) {
        const enemyRoom = findRoomAtPoint({ x, y }, enemyShipAdjusted);
        if (enemyRoom) {
          setWeaponTarget(targetingWeaponId, enemyRoom.id);
          
          // If weapon is charged, fire immediately
          const weapon = playerShip.weapons.find(w => w.id === targetingWeaponId);
          if (weapon && weapon.powered && weapon.currentCharge >= weapon.chargeTime) {
            const canFire = weapon.missilesCost === 0 || missiles >= weapon.missilesCost;
            if (canFire) {
              setTimeout(() => fireWeapon(targetingWeaponId), 0);
            }
          }
        }
      }
    },
    [targetingWeaponId, enemyShip, playerShip, selectedCrewId, missiles, setWeaponTarget, fireWeapon, moveCrew, selectCrew, canvasSize]
  );

  // Right-click to cancel targeting
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault(); // Always prevent context menu
    
    if (targetingWeaponId) {
      cancelTargeting();
    }
  }, [targetingWeaponId, cancelTargeting]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = (currentTime: number) => {
      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = currentTime;

      if (!paused) {
        updateGame(Math.min(deltaTime, 0.1));
      }

      setTimeCounter(currentTime);
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
      const { width, height } = canvasSize;

      // Clear and draw space background
      ctx.fillStyle = COLORS.SPACE;
      ctx.fillRect(0, 0, width, height);

      // Draw background elements
      drawNebula(ctx, width, height);
      drawStarfield(ctx, starsRef.current, timeCounter);

      // Draw distant planet
      drawPlanet(ctx, width - 200, height - 150, 80, '#8b4513');

      if (!gameStarted) {
        return;
      }

      // Calculate ship positions for center of screen
      const centerY = height / 2;
      const playerX = width * 0.25;
      const enemyX = width * 0.65;

      // Update ship positions for rendering
      const playerShipCopy = {
        ...playerShip,
        position: { x: playerX, y: centerY - 100 },
      };

      const enemyShipCopy = enemyShip ? {
        ...enemyShip,
        position: { x: enemyX, y: centerY - 100 },
      } : null;

      // Get current weapon target
      const currentWeapon = playerShip.weapons.find(w => w.id === targetingWeaponId);
      const targetedRoomId = currentWeapon?.targetRoom || null;

      // Original positions (from store)
      const originalPlayerPos = playerShip.position;
      const originalEnemyPos = enemyShip?.position;

      // Draw player ship with offset
      drawShip(ctx, playerShipCopy, null, false, originalPlayerPos);

      // Draw enemy ship with offset
      if (enemyShipCopy && originalEnemyPos) {
        drawShip(ctx, enemyShipCopy, targetedRoomId, !!targetingWeaponId, originalEnemyPos);
      }

      // Draw projectiles (adjust positions based on source and target ships)
      const playerOffsetX = playerX - RENDER.PLAYER_SHIP_X;
      const playerOffsetY = (centerY - 100) - RENDER.SHIP_Y;
      const enemyOffsetX = enemyX - RENDER.ENEMY_SHIP_X;
      const enemyOffsetY = (centerY - 100) - RENDER.SHIP_Y;

      const adjustedProjectiles = projectiles.map(p => {
        // Start offset based on source ship
        const isPlayerSource = p.sourceShipId === playerShip.id;
        const startOffsetX = isPlayerSource ? playerOffsetX : enemyOffsetX;
        const startOffsetY = isPlayerSource ? playerOffsetY : enemyOffsetY;
        
        // End offset based on target ship
        const isPlayerTarget = p.targetShipId === playerShip.id;
        const endOffsetX = isPlayerTarget ? playerOffsetX : enemyOffsetX;
        const endOffsetY = isPlayerTarget ? playerOffsetY : enemyOffsetY;
        
        // Current position offset - interpolate based on progress
        const currentOffsetX = startOffsetX + (endOffsetX - startOffsetX) * p.progress;
        const currentOffsetY = startOffsetY + (endOffsetY - startOffsetY) * p.progress;
        
        return {
          ...p,
          position: {
            x: p.position.x + currentOffsetX,
            y: p.position.y + currentOffsetY,
          },
          startPosition: {
            x: p.startPosition.x + startOffsetX,
            y: p.startPosition.y + startOffsetY,
          },
          endPosition: {
            x: p.endPosition.x + endOffsetX,
            y: p.endPosition.y + endOffsetY,
          },
        };
      });
      drawProjectiles(ctx, adjustedProjectiles);

      // Targeting mode indicator
      if (targetingWeaponId) {
        const weapon = playerShip.weapons.find(w => w.id === targetingWeaponId);
        const weaponName = weapon?.name || 'Weapon';

        ctx.fillStyle = 'rgba(241, 196, 15, 0.9)';
        ctx.fillRect(width / 2 - 160, 60, 320, 28);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`SELECT TARGET FOR ${weaponName.toUpperCase()}`, width / 2, 74);

        // Draw targeting line
        if (enemyShipCopy) {
          const pCenterX = playerX + 3 * RENDER.TILE_SIZE;
          const pCenterY = centerY - 100 + 2 * RENDER.TILE_SIZE;
          const eCenterX = enemyX + 2 * RENDER.TILE_SIZE;
          const eCenterY = centerY - 100 + 2 * RENDER.TILE_SIZE;

          ctx.strokeStyle = 'rgba(241, 196, 15, 0.3)';
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 5]);
          ctx.beginPath();
          ctx.moveTo(pCenterX, pCenterY);
          ctx.lineTo(eCenterX, eCenterY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    };

    render();

    let renderFrame: number;
    const renderLoop = () => {
      render();
      renderFrame = requestAnimationFrame(renderLoop);
    };
    renderFrame = requestAnimationFrame(renderLoop);

    return () => cancelAnimationFrame(renderFrame);
  }, [playerShip, enemyShip, projectiles, paused, gameStarted, gameOver, targetingWeaponId, timeCounter, canvasSize]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      onClick={handleCanvasClick}
      onContextMenu={handleContextMenu}
      className="absolute inset-0 w-full h-full cursor-crosshair"
      style={{ backgroundColor: COLORS.SPACE }}
    />
  );
}

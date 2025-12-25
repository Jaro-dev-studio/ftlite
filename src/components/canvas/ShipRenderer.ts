// Ship rendering logic for canvas - FTL-style graphics

import { Ship, Room, Door, Crew, SystemType } from '@/utils/types';
import { RENDER, COLORS, BALANCE } from '@/utils/constants';

// Get room accent color based on type
function getRoomAccentColor(room: Room): string {
  switch (room.type) {
    case 'shields':
      return COLORS.SHIELDS;
    case 'weapons':
      return COLORS.WEAPONS;
    case 'engines':
      return COLORS.ENGINES;
    case 'piloting':
      return COLORS.PILOTING;
    case 'medbay':
      return COLORS.MEDBAY;
    case 'oxygen':
      return COLORS.OXYGEN;
    default:
      return COLORS.EMPTY;
  }
}

// Draw system icon (FTL-style symbols)
function drawSystemIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  system: SystemType | null,
  size: number = 20
): void {
  if (!system) return;

  const centerX = x;
  const centerY = y;
  const color = getRoomAccentColor({ type: system } as Room);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (system) {
    case 'shields':
      // Shield icon - curved shield shape
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - size/2);
      ctx.quadraticCurveTo(centerX + size/2, centerY - size/3, centerX + size/2, centerY);
      ctx.quadraticCurveTo(centerX + size/2, centerY + size/2, centerX, centerY + size/2);
      ctx.quadraticCurveTo(centerX - size/2, centerY + size/2, centerX - size/2, centerY);
      ctx.quadraticCurveTo(centerX - size/2, centerY - size/3, centerX, centerY - size/2);
      ctx.stroke();
      break;

    case 'weapons':
      // Weapons icon - crosshair/target
      ctx.beginPath();
      // Outer circle
      ctx.arc(centerX, centerY, size/2 - 2, 0, Math.PI * 2);
      ctx.stroke();
      // Cross lines
      ctx.beginPath();
      ctx.moveTo(centerX - size/2 + 4, centerY);
      ctx.lineTo(centerX - size/4, centerY);
      ctx.moveTo(centerX + size/4, centerY);
      ctx.lineTo(centerX + size/2 - 4, centerY);
      ctx.moveTo(centerX, centerY - size/2 + 4);
      ctx.lineTo(centerX, centerY - size/4);
      ctx.moveTo(centerX, centerY + size/4);
      ctx.lineTo(centerX, centerY + size/2 - 4);
      ctx.stroke();
      // Center dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'engines':
      // Engines icon - propulsion symbol
      ctx.beginPath();
      // Main thruster shape
      ctx.moveTo(centerX - size/3, centerY - size/3);
      ctx.lineTo(centerX + size/3, centerY - size/3);
      ctx.lineTo(centerX + size/4, centerY + size/3);
      ctx.lineTo(centerX - size/4, centerY + size/3);
      ctx.closePath();
      ctx.stroke();
      // Flame lines
      ctx.beginPath();
      ctx.moveTo(centerX - size/6, centerY + size/3);
      ctx.lineTo(centerX - size/6, centerY + size/2);
      ctx.moveTo(centerX, centerY + size/3);
      ctx.lineTo(centerX, centerY + size/2 + 2);
      ctx.moveTo(centerX + size/6, centerY + size/3);
      ctx.lineTo(centerX + size/6, centerY + size/2);
      ctx.stroke();
      break;

    case 'piloting':
      // Piloting icon - steering wheel
      ctx.beginPath();
      ctx.arc(centerX, centerY, size/2 - 3, 0, Math.PI * 2);
      ctx.stroke();
      // Spokes
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI / 2) + Math.PI / 4;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * (size/2 - 3),
          centerY + Math.sin(angle) * (size/2 - 3)
        );
        ctx.stroke();
      }
      // Center
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.restore();
}

// Draw room type icon for non-system rooms
function drawRoomIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  roomType: string,
  size: number = 18
): void {
  const centerX = x;
  const centerY = y;

  ctx.save();
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (roomType) {
    case 'medbay':
      // Medical cross
      ctx.strokeStyle = COLORS.MEDBAY;
      ctx.fillStyle = COLORS.MEDBAY;
      ctx.beginPath();
      ctx.moveTo(centerX - size/6, centerY - size/2);
      ctx.lineTo(centerX + size/6, centerY - size/2);
      ctx.lineTo(centerX + size/6, centerY - size/6);
      ctx.lineTo(centerX + size/2, centerY - size/6);
      ctx.lineTo(centerX + size/2, centerY + size/6);
      ctx.lineTo(centerX + size/6, centerY + size/6);
      ctx.lineTo(centerX + size/6, centerY + size/2);
      ctx.lineTo(centerX - size/6, centerY + size/2);
      ctx.lineTo(centerX - size/6, centerY + size/6);
      ctx.lineTo(centerX - size/2, centerY + size/6);
      ctx.lineTo(centerX - size/2, centerY - size/6);
      ctx.lineTo(centerX - size/6, centerY - size/6);
      ctx.closePath();
      ctx.stroke();
      break;

    case 'oxygen':
      // O2 symbol
      ctx.strokeStyle = COLORS.OXYGEN;
      ctx.fillStyle = COLORS.OXYGEN;
      ctx.font = `bold ${size * 0.7}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('O2', centerX, centerY);
      break;
  }

  ctx.restore();
}

// Draw grid lines within a room
function drawRoomGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  tileSize: number
): void {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;

  const tilesX = Math.floor(width / tileSize);
  const tilesY = Math.floor(height / tileSize);

  // Vertical lines
  for (let i = 1; i < tilesX; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * tileSize, y);
    ctx.lineTo(x + i * tileSize, y + height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let i = 1; i < tilesY; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y + i * tileSize);
    ctx.lineTo(x + width, y + i * tileSize);
    ctx.stroke();
  }
}

// Draw a single room with FTL-style aesthetics
export function drawRoom(
  ctx: CanvasRenderingContext2D,
  room: Room,
  shipX: number,
  shipY: number,
  isTargeted: boolean = false,
  isHovered: boolean = false
): void {
  const x = shipX + room.gridX * RENDER.TILE_SIZE;
  const y = shipY + room.gridY * RENDER.TILE_SIZE;
  const width = room.width * RENDER.TILE_SIZE;
  const height = room.height * RENDER.TILE_SIZE;
  const padding = RENDER.ROOM_PADDING;

  // Room floor - light beige/cream like FTL
  ctx.fillStyle = '#e8e0d0';
  ctx.fillRect(x + padding, y + padding, width - padding * 2, height - padding * 2);

  // Room grid lines (subtle)
  drawRoomGrid(ctx, x + padding, y + padding, width - padding * 2, height - padding * 2, RENDER.TILE_SIZE);

  // Room border - dark gray
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 3;
  ctx.strokeRect(x + padding, y + padding, width - padding * 2, height - padding * 2);

  // Draw manning tile indicator for system rooms
  if (room.system) {
    const manningTileX = room.manningTileIndex % room.width;
    const manningTileY = Math.floor(room.manningTileIndex / room.width);
    const mtX = x + manningTileX * RENDER.TILE_SIZE + padding;
    const mtY = y + manningTileY * RENDER.TILE_SIZE + padding;
    const tileSize = RENDER.TILE_SIZE - padding * 2;
    
    // Subtle highlight for manning tile
    ctx.fillStyle = 'rgba(241, 196, 15, 0.15)';
    ctx.fillRect(mtX, mtY, tileSize, tileSize);
    
    // Small corner brackets to indicate manning position
    ctx.strokeStyle = 'rgba(241, 196, 15, 0.5)';
  ctx.lineWidth = 2;
    const bracketSize = 6;
    
    // Top-left bracket
    ctx.beginPath();
    ctx.moveTo(mtX + bracketSize, mtY);
    ctx.lineTo(mtX, mtY);
    ctx.lineTo(mtX, mtY + bracketSize);
    ctx.stroke();
    
    // Top-right bracket
    ctx.beginPath();
    ctx.moveTo(mtX + tileSize - bracketSize, mtY);
    ctx.lineTo(mtX + tileSize, mtY);
    ctx.lineTo(mtX + tileSize, mtY + bracketSize);
    ctx.stroke();
    
    // Bottom-left bracket
    ctx.beginPath();
    ctx.moveTo(mtX, mtY + tileSize - bracketSize);
    ctx.lineTo(mtX, mtY + tileSize);
    ctx.lineTo(mtX + bracketSize, mtY + tileSize);
    ctx.stroke();
    
    // Bottom-right bracket
    ctx.beginPath();
    ctx.moveTo(mtX + tileSize - bracketSize, mtY + tileSize);
    ctx.lineTo(mtX + tileSize, mtY + tileSize);
    ctx.lineTo(mtX + tileSize, mtY + tileSize - bracketSize);
    ctx.stroke();
  }

  // System/Room icon in center
  const iconX = x + width / 2;
  const iconY = y + height / 2;
  
  if (room.system) {
    drawSystemIcon(ctx, iconX, iconY, room.system, 24);
  } else if (room.type !== 'empty') {
    drawRoomIcon(ctx, iconX, iconY, room.type, 22);
  }

  // Fire visualization (orange/red overlay)
  if (room.fire > 0) {
    ctx.fillStyle = `rgba(255, 100, 0, ${0.3 + room.fire * 0.05})`;
    ctx.fillRect(x + padding, y + padding, width - padding * 2, height - padding * 2);
    
    // Draw fire symbols
    ctx.fillStyle = '#ff4400';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < Math.min(room.fire, 4); i++) {
      const fx = x + padding + 15 + (i % 2) * (width - padding * 2 - 30);
      const fy = y + padding + 15 + Math.floor(i / 2) * (height - padding * 2 - 30);
      ctx.fillText('^', fx, fy);
    }
  }

  // Breach visualization
  if (room.breach) {
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x + padding + 2, y + padding + 2, width - padding * 2 - 4, height - padding * 2 - 4);
    ctx.setLineDash([]);
  }

  // Hover highlight
  if (isHovered) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(x + padding, y + padding, width - padding * 2, height - padding * 2);
  }

  // Target highlight (red pulsing border)
  if (isTargeted) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
    ctx.fillRect(x + padding, y + padding, width - padding * 2, height - padding * 2);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(x + padding, y + padding, width - padding * 2, height - padding * 2);
    ctx.setLineDash([]);

    // Target crosshair
    const centerRoomX = x + width / 2;
    const centerRoomY = y + height / 2;
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerRoomX - 12, centerRoomY);
    ctx.lineTo(centerRoomX - 4, centerRoomY);
    ctx.moveTo(centerRoomX + 4, centerRoomY);
    ctx.lineTo(centerRoomX + 12, centerRoomY);
    ctx.moveTo(centerRoomX, centerRoomY - 12);
    ctx.lineTo(centerRoomX, centerRoomY - 4);
    ctx.moveTo(centerRoomX, centerRoomY + 4);
    ctx.lineTo(centerRoomX, centerRoomY + 12);
    ctx.stroke();
  }
}

// Draw a door with FTL-style appearance (orange when closed)
export function drawDoor(
  ctx: CanvasRenderingContext2D,
  door: Door,
  shipX: number,
  shipY: number
): void {
  const x = shipX + door.position.x * RENDER.TILE_SIZE;
  const y = shipY + door.position.y * RENDER.TILE_SIZE;

  // Door colors - orange when closed (like FTL), gray when open
  const doorColor = door.isOpen ? '#6a6a6a' : '#e67e22';
  const doorBorder = door.isOpen ? '#4a4a4a' : '#d35400';

  ctx.fillStyle = doorColor;
  ctx.strokeStyle = doorBorder;
  ctx.lineWidth = 1;

  if (door.orientation === 'vertical') {
    ctx.fillRect(x - 4, y - RENDER.DOOR_WIDTH / 2 + 2, 8, RENDER.DOOR_WIDTH - 4);
    ctx.strokeRect(x - 4, y - RENDER.DOOR_WIDTH / 2 + 2, 8, RENDER.DOOR_WIDTH - 4);
  } else {
    ctx.fillRect(x - RENDER.DOOR_WIDTH / 2 + 2, y - 4, RENDER.DOOR_WIDTH - 4, 8);
    ctx.strokeRect(x - RENDER.DOOR_WIDTH / 2 + 2, y - 4, RENDER.DOOR_WIDTH - 4, 8);
  }
}

// Draw a crew member - positioned in a specific tile, not room center
export function drawCrew(
  ctx: CanvasRenderingContext2D,
  crew: Crew,
  offsetX: number = 0,
  offsetY: number = 0
): void {
  const x = crew.position.x + offsetX;
  const y = crew.position.y + offsetY;
  const radius = RENDER.CREW_RADIUS;

  // Crew shadow
  ctx.beginPath();
  ctx.ellipse(x, y + 3, radius * 0.7, radius * 0.25, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fill();

  // Crew body - round like FTL
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  
  // Color based on player/enemy
  if (crew.isPlayer) {
    const gradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, radius);
    gradient.addColorStop(0, '#5ddb5d');
    gradient.addColorStop(1, '#2a9d2a');
    ctx.fillStyle = gradient;
  } else {
    const gradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, radius);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#c0392b');
    ctx.fillStyle = gradient;
  }
  ctx.fill();

  // Crew outline
  ctx.strokeStyle = crew.isPlayer ? '#1a7a1a' : '#8b1a1a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Selection ring (yellow glow)
  if (crew.isSelected) {
    ctx.beginPath();
    ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Health bar
  const healthBarWidth = radius * 2.2;
  const healthBarHeight = 4;
  const healthBarY = y - radius - 8;
  const healthBarX = x - healthBarWidth / 2;

  // Background
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

  // Health fill
  const healthPercent = crew.health / crew.maxHealth;
  let healthColor = '#27ae60';
  if (healthPercent < 0.3) healthColor = '#c0392b';
  else if (healthPercent < 0.6) healthColor = '#f39c12';
  
  ctx.fillStyle = healthColor;
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);

  // Health bar border
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1;
  ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

  // Crew initial
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(crew.name.charAt(0), x, y + 1);
}

// Draw elliptical shield bubble around ship (FTL-style)
export function drawShields(
  ctx: CanvasRenderingContext2D,
  ship: Ship
): void {
  if (ship.shieldLayers <= 0 && ship.maxShieldLayers <= 0 && ship.shieldRechargeProgress <= 0) return;

  // Calculate ship bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const room of ship.rooms) {
    minX = Math.min(minX, room.gridX);
    minY = Math.min(minY, room.gridY);
    maxX = Math.max(maxX, room.gridX + room.width);
    maxY = Math.max(maxY, room.gridY + room.height);
  }

  const shipWidth = (maxX - minX) * RENDER.TILE_SIZE;
  const shipHeight = (maxY - minY) * RENDER.TILE_SIZE;
  const centerX = ship.position.x + minX * RENDER.TILE_SIZE + shipWidth / 2;
  const centerY = ship.position.y + minY * RENDER.TILE_SIZE + shipHeight / 2;

  // Draw shield layers as concentric ellipses
  for (let i = 0; i < ship.maxShieldLayers; i++) {
    const radiusX = shipWidth / 2 + 35 + i * 15;
    const radiusY = shipHeight / 2 + 30 + i * 15;
    
    if (i < ship.shieldLayers) {
      // Active shield layer - cyan/blue like FTL
    ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 200, 255, ${0.08 - i * 0.015})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(0, 200, 255, ${0.5 - i * 0.1})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    } else if (i === ship.shieldLayers && ship.shieldRechargeProgress > 0) {
      // Charging shield layer - draw partial arc showing progress
      // Normalize progress: shieldRechargeProgress goes from 0 to SHIELD_RECHARGE_TIME
      const normalizedProgress = ship.shieldRechargeProgress / BALANCE.SHIELD_RECHARGE_TIME;
      const startAngle = -Math.PI / 2; // Start from top
      const endAngle = startAngle + (Math.PI * 2 * normalizedProgress);
      
      // Draw charging arc
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, startAngle, endAngle);
      ctx.strokeStyle = `rgba(0, 200, 255, 0.6)`;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw a subtle glow at the charging point
      if (normalizedProgress > 0 && normalizedProgress < 1) {
        const glowAngle = endAngle;
        const glowX = centerX + radiusX * Math.cos(glowAngle);
        const glowY = centerY + radiusY * Math.sin(glowAngle);
        
        ctx.beginPath();
        ctx.arc(glowX, glowY, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.fill();
      }
    }
  }
}

// Draw ship hull outline/frame
function drawShipFrame(ctx: CanvasRenderingContext2D, ship: Ship): void {
  const rooms = ship.rooms;
  if (rooms.length === 0) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const room of rooms) {
    minX = Math.min(minX, room.gridX);
    minY = Math.min(minY, room.gridY);
    maxX = Math.max(maxX, room.gridX + room.width);
    maxY = Math.max(maxY, room.gridY + room.height);
  }

  const x = ship.position.x + minX * RENDER.TILE_SIZE;
  const y = ship.position.y + minY * RENDER.TILE_SIZE;
  const w = (maxX - minX) * RENDER.TILE_SIZE;
  const h = (maxY - minY) * RENDER.TILE_SIZE;

  // Draw hull plate background (gray metallic)
  ctx.fillStyle = '#5a5a5e';
  ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
  
  // Hull border
  ctx.strokeStyle = '#3a3a3e';
  ctx.lineWidth = 4;
  ctx.strokeRect(x - 6, y - 6, w + 12, h + 12);
}

// Draw entire ship with FTL-style aesthetics
export function drawShip(
  ctx: CanvasRenderingContext2D,
  ship: Ship,
  targetedRoomId: string | null = null,
  isTargetingMode: boolean = false,
  originalPosition?: { x: number; y: number }
): void {
  // Calculate offset if original position is provided (for dynamic positioning)
  const offsetX = originalPosition ? ship.position.x - originalPosition.x : 0;
  const offsetY = originalPosition ? ship.position.y - originalPosition.y : 0;

  // Draw ship hull frame
  drawShipFrame(ctx, ship);

  // Draw shields behind ship
  drawShields(ctx, ship);

  // Draw rooms
  for (const room of ship.rooms) {
    drawRoom(
      ctx,
      room,
      ship.position.x,
      ship.position.y,
      room.id === targetedRoomId,
      isTargetingMode && !ship.isPlayer
    );
  }

  // Draw doors
  for (const door of ship.doors) {
    drawDoor(ctx, door, ship.position.x, ship.position.y);
  }

  // Draw crew with position offset
  for (const crew of ship.crew) {
    drawCrew(ctx, crew, offsetX, offsetY);
  }

  // Ship name plate
  const nameY = ship.position.y - 35;
  const rooms = ship.rooms;
  let minX = Infinity, maxX = -Infinity;
  for (const room of rooms) {
    minX = Math.min(minX, room.gridX);
    maxX = Math.max(maxX, room.gridX + room.width);
  }
  const centerX = ship.position.x + (minX + (maxX - minX) / 2) * RENDER.TILE_SIZE;

  // Name background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.font = 'bold 12px monospace';
  const nameWidth = ctx.measureText(ship.name).width + 16;
  ctx.fillRect(centerX - nameWidth / 2, nameY - 8, nameWidth, 18);

  // Name text
  ctx.fillStyle = ship.isPlayer ? '#4fc3f7' : '#ff7043';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ship.name, centerX, nameY);
}

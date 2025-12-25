// Ship rendering logic for canvas

import { Ship, Room, Door, Crew, SystemType } from '@/utils/types';
import { RENDER, COLORS } from '@/utils/constants';

// Get room color based on type
function getRoomColor(room: Room): string {
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

// Get system icon/label
function getSystemLabel(system: SystemType | null): string {
  switch (system) {
    case 'shields':
      return 'SH';
    case 'weapons':
      return 'WP';
    case 'engines':
      return 'EN';
    case 'piloting':
      return 'PL';
    default:
      return '';
  }
}

// Draw a single room
export function drawRoom(
  ctx: CanvasRenderingContext2D,
  room: Room,
  shipX: number,
  shipY: number,
  isTargeted: boolean = false
): void {
  const x = shipX + room.gridX * RENDER.TILE_SIZE;
  const y = shipY + room.gridY * RENDER.TILE_SIZE;
  const width = room.width * RENDER.TILE_SIZE;
  const height = room.height * RENDER.TILE_SIZE;

  // Room floor
  ctx.fillStyle = COLORS.ROOM_FLOOR;
  ctx.fillRect(x + RENDER.ROOM_PADDING, y + RENDER.ROOM_PADDING, width - RENDER.ROOM_PADDING * 2, height - RENDER.ROOM_PADDING * 2);

  // Room border with system color
  ctx.strokeStyle = getRoomColor(room);
  ctx.lineWidth = 2;
  ctx.strokeRect(x + RENDER.ROOM_PADDING, y + RENDER.ROOM_PADDING, width - RENDER.ROOM_PADDING * 2, height - RENDER.ROOM_PADDING * 2);

  // System label
  if (room.system) {
    ctx.fillStyle = getRoomColor(room);
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(getSystemLabel(room.system), x + width / 2, y + 6);
  }

  // Target highlight
  if (isTargeted) {
    ctx.fillStyle = COLORS.TARGET_HIGHLIGHT;
    ctx.fillRect(x + RENDER.ROOM_PADDING, y + RENDER.ROOM_PADDING, width - RENDER.ROOM_PADDING * 2, height - RENDER.ROOM_PADDING * 2);
    ctx.strokeStyle = COLORS.TARGET_BORDER;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x + RENDER.ROOM_PADDING, y + RENDER.ROOM_PADDING, width - RENDER.ROOM_PADDING * 2, height - RENDER.ROOM_PADDING * 2);
    ctx.setLineDash([]);
  }
}

// Draw a door
export function drawDoor(
  ctx: CanvasRenderingContext2D,
  door: Door,
  shipX: number,
  shipY: number
): void {
  const x = shipX + door.position.x * RENDER.TILE_SIZE;
  const y = shipY + door.position.y * RENDER.TILE_SIZE;

  ctx.fillStyle = door.isOpen ? COLORS.DOOR_OPEN : COLORS.DOOR_CLOSED;

  if (door.orientation === 'vertical') {
    ctx.fillRect(
      x - RENDER.DOOR_THICKNESS / 2,
      y - RENDER.DOOR_WIDTH / 2,
      RENDER.DOOR_THICKNESS,
      RENDER.DOOR_WIDTH
    );
  } else {
    ctx.fillRect(
      x - RENDER.DOOR_WIDTH / 2,
      y - RENDER.DOOR_THICKNESS / 2,
      RENDER.DOOR_WIDTH,
      RENDER.DOOR_THICKNESS
    );
  }
}

// Draw a crew member
export function drawCrew(
  ctx: CanvasRenderingContext2D,
  crew: Crew
): void {
  const { x, y } = crew.position;

  // Crew circle
  ctx.beginPath();
  ctx.arc(x, y, RENDER.CREW_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = crew.isPlayer ? COLORS.CREW_PLAYER : COLORS.CREW_ENEMY;
  ctx.fill();

  // Selection ring
  if (crew.isSelected) {
    ctx.strokeStyle = COLORS.CREW_SELECTED;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Health bar background
  const healthBarWidth = RENDER.CREW_RADIUS * 2;
  const healthBarHeight = 4;
  const healthBarY = y - RENDER.CREW_RADIUS - 8;
  const healthBarX = x - healthBarWidth / 2;

  ctx.fillStyle = COLORS.CREW_HEALTH_BG;
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

  // Health bar fill
  const healthPercent = crew.health / crew.maxHealth;
  ctx.fillStyle = COLORS.CREW_HEALTH_FG;
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);

  // Crew name initial
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(crew.name.charAt(0), x, y);
}

// Draw shield bubble around ship
export function drawShields(
  ctx: CanvasRenderingContext2D,
  ship: Ship
): void {
  if (ship.shieldLayers <= 0) return;

  const shipWidth = 4 * RENDER.TILE_SIZE; // Assuming 4 tiles wide
  const shipHeight = 4 * RENDER.TILE_SIZE; // Assuming 4 tiles tall
  const centerX = ship.position.x + shipWidth / 2;
  const centerY = ship.position.y + shipHeight / 2;
  const baseRadius = Math.max(shipWidth, shipHeight) / 2 + 15;

  for (let i = 0; i < ship.shieldLayers; i++) {
    const radius = baseRadius + i * 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.SHIELD_BORDER;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = COLORS.SHIELD_BUBBLE;
    ctx.fill();
  }
}

// Draw entire ship
export function drawShip(
  ctx: CanvasRenderingContext2D,
  ship: Ship,
  targetedRoomId: string | null = null
): void {
  // Draw shields first (behind ship)
  drawShields(ctx, ship);

  // Draw rooms
  for (const room of ship.rooms) {
    drawRoom(ctx, room, ship.position.x, ship.position.y, room.id === targetedRoomId);
  }

  // Draw doors
  for (const door of ship.doors) {
    drawDoor(ctx, door, ship.position.x, ship.position.y);
  }

  // Draw crew
  for (const crew of ship.crew) {
    drawCrew(ctx, crew);
  }

  // Ship name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(ship.name, ship.position.x + 2 * RENDER.TILE_SIZE, ship.position.y - 10);

  // Hull indicator
  const hullPercent = ship.hull / ship.maxHull;
  let hullColor = COLORS.HULL_HEALTHY;
  if (hullPercent < 0.3) hullColor = COLORS.HULL_CRITICAL;
  else if (hullPercent < 0.6) hullColor = COLORS.HULL_DAMAGED;

  ctx.fillStyle = hullColor;
  ctx.font = '12px sans-serif';
  ctx.fillText(`Hull: ${ship.hull}/${ship.maxHull}`, ship.position.x + 2 * RENDER.TILE_SIZE, ship.position.y - 25);
}

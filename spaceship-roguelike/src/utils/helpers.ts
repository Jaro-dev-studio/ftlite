// Utility helper functions

import { Position, Room, Ship, SystemType } from './types';
import { RENDER, BALANCE } from './constants';

// Generate unique IDs
let idCounter = 0;
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${++idCounter}_${Date.now().toString(36)}`;
}

// Reset ID counter (for testing)
export function resetIdCounter(): void {
  idCounter = 0;
}

// Calculate distance between two points
export function distance(p1: Position, p2: Position): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Linear interpolation
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * Math.max(0, Math.min(1, t));
}

// Lerp for positions
export function lerpPosition(start: Position, end: Position, t: number): Position {
  return {
    x: lerp(start.x, end.x, t),
    y: lerp(start.y, end.y, t),
  };
}

// Clamp a value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Get the center position of a room in pixels
export function getRoomCenter(room: Room, shipX: number, shipY: number): Position {
  return {
    x: shipX + room.gridX * RENDER.TILE_SIZE + (room.width * RENDER.TILE_SIZE) / 2,
    y: shipY + room.gridY * RENDER.TILE_SIZE + (room.height * RENDER.TILE_SIZE) / 2,
  };
}

// Get room bounds in pixels
export function getRoomBounds(room: Room, shipX: number, shipY: number) {
  return {
    x: shipX + room.gridX * RENDER.TILE_SIZE,
    y: shipY + room.gridY * RENDER.TILE_SIZE,
    width: room.width * RENDER.TILE_SIZE,
    height: room.height * RENDER.TILE_SIZE,
  };
}

// Check if a point is inside a room
export function isPointInRoom(point: Position, room: Room, shipX: number, shipY: number): boolean {
  const bounds = getRoomBounds(room, shipX, shipY);
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

// Find which room contains a point
export function findRoomAtPoint(point: Position, ship: Ship): Room | null {
  for (const room of ship.rooms) {
    if (isPointInRoom(point, room, ship.position.x, ship.position.y)) {
      return room;
    }
  }
  return null;
}

// Calculate ship evasion
export function calculateEvasion(ship: Ship): number {
  const engines = ship.systems.engines;
  const piloting = ship.systems.piloting;

  if (!piloting || piloting.powerCurrent === 0) {
    return 0; // Can't evade without piloting
  }

  let evasion = BALANCE.BASE_EVASION;
  evasion += engines.powerCurrent * BALANCE.EVASION_PER_ENGINE_POWER;

  if (engines.manned) {
    evasion += BALANCE.MANNED_EVASION_BONUS;
  }
  if (piloting.manned) {
    evasion += BALANCE.MANNED_PILOTING_BONUS;
  }

  return Math.min(evasion, 100);
}

// Calculate total power used
export function calculatePowerUsed(ship: Ship): number {
  let total = 0;
  for (const systemType of Object.keys(ship.systems) as SystemType[]) {
    total += ship.systems[systemType].powerCurrent;
  }
  // Add weapon power
  for (const weapon of ship.weapons) {
    if (weapon.powered) {
      total += weapon.powerRequired;
    }
  }
  return total;
}

// Check if a hit lands (vs evasion)
export function checkHit(evasion: number): boolean {
  return Math.random() * 100 > evasion;
}

// Get random crew name
const CREW_NAMES = [
  'Alex', 'Casey', 'Jordan', 'Riley', 'Morgan',
  'Charlie', 'Sam', 'Taylor', 'Quinn', 'Avery',
  'Reese', 'Blake', 'Cameron', 'Dakota', 'Finley',
];

export function getRandomCrewName(): string {
  return CREW_NAMES[Math.floor(Math.random() * CREW_NAMES.length)];
}

// Format time as MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

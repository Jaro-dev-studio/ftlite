// Game balance constants

export const BALANCE = {
  // Ship
  PLAYER_HULL: 30,
  PLAYER_REACTOR: 8,
  ENEMY_HULL: 20,
  ENEMY_REACTOR: 6,

  // Shields
  SHIELD_RECHARGE_TIME: 2.0, // seconds per layer
  SHIELD_MAX_LAYERS: 4,

  // Evasion
  BASE_EVASION: 5,
  EVASION_PER_ENGINE_POWER: 5,
  MANNED_EVASION_BONUS: 5,
  MANNED_PILOTING_BONUS: 5,

  // Weapons
  LASER_CHARGE_TIME: 10,
  LASER_DAMAGE: 1,
  LASER_POWER: 1,
  MISSILE_CHARGE_TIME: 15,
  MISSILE_DAMAGE: 2,
  MISSILE_POWER: 1,

  // Crew
  CREW_MOVE_SPEED: 80, // pixels per second
  CREW_REPAIR_SPEED: 10, // HP per second
  CREW_HEALTH: 100,

  // Combat
  SYSTEM_DAMAGE_PER_HIT: 1,
  PROJECTILE_SPEED: 300, // pixels per second
};

// Rendering constants
export const RENDER = {
  TILE_SIZE: 40,
  ROOM_PADDING: 2,
  CREW_RADIUS: 12,
  DOOR_WIDTH: 20,
  DOOR_THICKNESS: 6,
  SHIP_SPACING: 150, // Space between ships
  CANVAS_WIDTH: 900,
  CANVAS_HEIGHT: 400,
  PLAYER_SHIP_X: 100,
  ENEMY_SHIP_X: 550,
  SHIP_Y: 80,
};

// Colors
export const COLORS = {
  // Room types
  SHIELDS: '#4a9eff',
  WEAPONS: '#ff6b6b',
  ENGINES: '#ffd93d',
  PILOTING: '#6bcb77',
  MEDBAY: '#95d5b2',
  OXYGEN: '#a8e6cf',
  EMPTY: '#2a2a2a',

  // Systems (for rendering power bars)
  SYSTEM_POWERED: '#4ade80',
  SYSTEM_UNPOWERED: '#374151',
  SYSTEM_DAMAGED: '#ef4444',

  // UI
  HULL_HEALTHY: '#4ade80',
  HULL_DAMAGED: '#fbbf24',
  HULL_CRITICAL: '#ef4444',
  SHIELD_BUBBLE: 'rgba(74, 158, 255, 0.3)',
  SHIELD_BORDER: '#4a9eff',

  // Crew
  CREW_PLAYER: '#22c55e',
  CREW_ENEMY: '#ef4444',
  CREW_SELECTED: '#fbbf24',
  CREW_HEALTH_BG: '#1f2937',
  CREW_HEALTH_FG: '#22c55e',

  // Projectiles
  PROJECTILE_LASER: '#ef4444',
  PROJECTILE_MISSILE: '#f97316',

  // Background
  SPACE: '#0a0a0f',
  ROOM_FLOOR: '#1a1a2e',
  ROOM_WALL: '#374151',
  DOOR_OPEN: '#4b5563',
  DOOR_CLOSED: '#9ca3af',

  // Targeting
  TARGET_HIGHLIGHT: 'rgba(239, 68, 68, 0.3)',
  TARGET_BORDER: '#ef4444',
};

// System display names
export const SYSTEM_NAMES: Record<string, string> = {
  shields: 'Shields',
  weapons: 'Weapons',
  engines: 'Engines',
  piloting: 'Piloting',
  medbay: 'Medbay',
  oxygen: 'Oxygen',
};

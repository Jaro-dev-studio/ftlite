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
  CREW_MOVE_SPEED: 120, // pixels per second (faster for larger canvas)
  CREW_REPAIR_SPEED: 10, // HP per second
  CREW_HEALTH: 100,

  // Combat
  SYSTEM_DAMAGE_PER_HIT: 1,
  PROJECTILE_SPEED: 450, // pixels per second (faster for larger canvas)
};

// Rendering constants - much larger for FTL-style layout
export const RENDER = {
  TILE_SIZE: 48,
  ROOM_PADDING: 2,
  CREW_RADIUS: 14,
  DOOR_WIDTH: 24,
  DOOR_THICKNESS: 6,
  SHIP_SPACING: 300, // Space between ships
  CANVAS_WIDTH: 1400,
  CANVAS_HEIGHT: 520,
  PLAYER_SHIP_X: 180,
  ENEMY_SHIP_X: 900,
  SHIP_Y: 100,
};

// FTL-inspired color palette
export const COLORS = {
  // Room types - more saturated, FTL-like
  SHIELDS: '#3498db',
  WEAPONS: '#e74c3c',
  ENGINES: '#f39c12',
  PILOTING: '#27ae60',
  MEDBAY: '#9b59b6',
  OXYGEN: '#1abc9c',
  EMPTY: '#34495e',

  // Systems (for rendering power bars)
  SYSTEM_POWERED: '#2ecc71',
  SYSTEM_UNPOWERED: '#2c3e50',
  SYSTEM_DAMAGED: '#c0392b',

  // UI
  HULL_HEALTHY: '#27ae60',
  HULL_DAMAGED: '#f39c12',
  HULL_CRITICAL: '#c0392b',
  SHIELD_BUBBLE: 'rgba(52, 152, 219, 0.15)',
  SHIELD_BORDER: '#3498db',

  // Crew
  CREW_PLAYER: '#27ae60',
  CREW_ENEMY: '#c0392b',
  CREW_SELECTED: '#f1c40f',
  CREW_HEALTH_BG: '#1a1a2e',
  CREW_HEALTH_FG: '#27ae60',

  // Projectiles
  PROJECTILE_LASER: '#e74c3c',
  PROJECTILE_MISSILE: '#e67e22',

  // Background - deep space
  SPACE: '#0a0a12',
  ROOM_FLOOR: '#1a1a2e',
  ROOM_WALL: '#4a4a5e',
  DOOR_OPEN: '#3a3a4e',
  DOOR_CLOSED: '#7a7a8e',

  // Targeting
  TARGET_HIGHLIGHT: 'rgba(231, 76, 60, 0.3)',
  TARGET_BORDER: '#e74c3c',

  // FTL UI colors
  UI_PANEL_BG: '#1a1a1a',
  UI_PANEL_BORDER: '#3a3a3a',
  UI_TEXT_PRIMARY: '#ecf0f1',
  UI_TEXT_SECONDARY: '#95a5a6',
  UI_ACCENT_GREEN: '#27ae60',
  UI_ACCENT_BLUE: '#3498db',
  UI_ACCENT_RED: '#c0392b',
  UI_ACCENT_YELLOW: '#f1c40f',
  UI_ACCENT_ORANGE: '#e67e22',
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

// System icons for FTL-style display
export const SYSTEM_ICONS: Record<string, string> = {
  shields: 'SH',
  weapons: 'WP',
  engines: 'EN',
  piloting: 'PL',
  medbay: 'MD',
  oxygen: 'O2',
};

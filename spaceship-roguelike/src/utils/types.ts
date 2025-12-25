// Core game type definitions

export type SystemType = 'shields' | 'weapons' | 'engines' | 'piloting';
export type CrewTask = 'idle' | 'moving' | 'repairing' | 'fighting' | 'manning';
export type RoomType = 'shields' | 'weapons' | 'engines' | 'piloting' | 'medbay' | 'oxygen' | 'empty';
export type WeaponType = 'laser' | 'missile';
export type ProjectileState = 'flying' | 'hit' | 'miss' | 'destroyed';

export interface Position {
  x: number;
  y: number;
}

export interface CrewSkills {
  piloting: number;
  engines: number;
  shields: number;
  weapons: number;
  repair: number;
  combat: number;
}

export interface Crew {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  currentRoom: string;
  targetRoom: string | null;
  path: string[];
  task: CrewTask;
  skills: CrewSkills;
  position: Position;
  isSelected: boolean;
  isPlayer: boolean;
}

export interface Door {
  id: string;
  room1Id: string;
  room2Id: string;
  isOpen: boolean;
  position: Position;
  orientation: 'horizontal' | 'vertical';
}

export interface Room {
  id: string;
  type: RoomType;
  gridX: number;
  gridY: number;
  width: number;
  height: number;
  system: SystemType | null;
  oxygen: number;
  fire: number;
  breach: boolean;
  crewInRoom: string[];
}

export interface ShipSystem {
  type: SystemType;
  powerCurrent: number;
  powerMax: number;
  health: number;
  maxHealth: number;
  ionDamage: number;
  manned: boolean;
  manningBonus: number;
  roomId: string;
}

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  damage: number;
  chargeTime: number;
  currentCharge: number;
  powered: boolean;
  powerRequired: number;
  targetRoom: string | null;
  targetShipId: string | null;
  missilesCost: number;
}

export interface Projectile {
  id: string;
  weaponType: WeaponType;
  damage: number;
  sourceShipId: string;
  targetShipId: string;
  targetRoomId: string;
  position: Position;
  startPosition: Position;
  endPosition: Position;
  state: ProjectileState;
  progress: number;
  speed: number;
}

export interface Ship {
  id: string;
  name: string;
  hull: number;
  maxHull: number;
  rooms: Room[];
  doors: Door[];
  crew: Crew[];
  systems: Record<SystemType, ShipSystem>;
  reactor: number;
  powerUsed: number;
  weapons: Weapon[];
  isPlayer: boolean;
  shieldLayers: number;
  maxShieldLayers: number;
  shieldRechargeProgress: number;
  evasion: number;
  position: Position;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
}

export interface EventChoice {
  id: string;
  text: string;
  outcome: string;
}

export interface GameState {
  // Meta
  paused: boolean;
  gameSpeed: number;
  gameOver: boolean;
  victory: boolean;
  gameStarted: boolean;

  // Player ship
  playerShip: Ship;

  // Enemy (null when not in combat)
  enemyShip: Ship | null;
  inCombat: boolean;

  // Resources
  scrap: number;
  fuel: number;
  missiles: number;
  droneParts: number;

  // Progression
  currentSector: number;
  currentNode: number;

  // Active event
  currentEvent: GameEvent | null;

  // Projectiles in flight
  projectiles: Projectile[];

  // UI State
  selectedCrewId: string | null;
  targetingWeaponId: string | null;
}

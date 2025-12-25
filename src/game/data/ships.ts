// Ship layout definitions

import { Room, Door, Ship, ShipSystem, SystemType, Weapon, Crew } from '@/utils/types';
import { BALANCE, RENDER } from '@/utils/constants';
import { getRoomTilePosition, calculatePowerUsed, calculateEvasion } from '@/utils/helpers';

// Create default ship systems
function createSystems(rooms: Room[]): Record<SystemType, ShipSystem> {
  const findRoomBySystem = (type: SystemType): string => {
    const room = rooms.find(r => r.system === type);
    return room?.id || '';
  };

  return {
    shields: {
      type: 'shields',
      powerCurrent: 2,
      powerMax: 4,
      health: 4,
      maxHealth: 4,
      ionDamage: 0,
      manned: false,
      manningBonus: 10,
      roomId: findRoomBySystem('shields'),
    },
    weapons: {
      type: 'weapons',
      powerCurrent: 2,
      powerMax: 4,
      health: 4,
      maxHealth: 4,
      ionDamage: 0,
      manned: false,
      manningBonus: 10,
      roomId: findRoomBySystem('weapons'),
    },
    engines: {
      type: 'engines',
      powerCurrent: 1, // Start with 1 power (total: 2+2+1+1=6 systems + 2 weapons = 8)
      powerMax: 4,
      health: 4,
      maxHealth: 4,
      ionDamage: 0,
      manned: false,
      manningBonus: 10,
      roomId: findRoomBySystem('engines'),
    },
    piloting: {
      type: 'piloting',
      powerCurrent: 1,
      powerMax: 2,
      health: 2,
      maxHealth: 2,
      ionDamage: 0,
      manned: false,
      manningBonus: 5,
      roomId: findRoomBySystem('piloting'),
    },
  };
}

// Create player ship with FTL-style layout
export function createPlayerShip(): Ship {
  // Layout similar to FTL Kestrel - horizontal ship layout
  const rooms: Room[] = [
    // Left side - Piloting (front of ship)
    {
      id: 'room_piloting',
      type: 'piloting',
      gridX: 0,
      gridY: 1,
      width: 1,
      height: 2,
      system: 'piloting',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
      manningTileIndex: 0, // Top tile of 1x2 room
    },
    // Shields room (upper left area)
    {
      id: 'room_shields',
      type: 'shields',
      gridX: 1,
      gridY: 0,
      width: 2,
      height: 2,
      system: 'shields',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
      manningTileIndex: 0, // Top-left tile of 2x2 room
    },
    // Weapons room (upper right)
    {
      id: 'room_weapons',
      type: 'weapons',
      gridX: 3,
      gridY: 0,
      width: 2,
      height: 2,
      system: 'weapons',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
      manningTileIndex: 0, // Top-left tile of 2x2 room
    },
    // Medbay (lower left area)
    {
      id: 'room_medbay',
      type: 'medbay',
      gridX: 1,
      gridY: 2,
      width: 2,
      height: 2,
      system: null,
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
      manningTileIndex: 0, // Top-left tile
    },
    // Oxygen room (lower right)
    {
      id: 'room_oxygen',
      type: 'oxygen',
      gridX: 3,
      gridY: 2,
      width: 2,
      height: 2,
      system: null,
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
      manningTileIndex: 0, // Top-left tile
    },
    // Engines (back of ship - right side)
    {
      id: 'room_engines',
      type: 'engines',
      gridX: 5,
      gridY: 1,
      width: 1,
      height: 2,
      system: 'engines',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
      manningTileIndex: 0, // Top tile of 1x2 room
    },
  ];

  // Doors - positions are in tile coordinates, aligned with tile edges
  // For vertical doors: x is the column edge, y is centered on the row
  // For horizontal doors: x is centered on the column, y is the row edge
  const doors: Door[] = [
    // Piloting (0,1-2) to Shields (1-2,0-1) - door at x=1, between piloting's right and shields' left, at row 1
    {
      id: 'door_1',
      room1Id: 'room_piloting',
      room2Id: 'room_shields',
      isOpen: true,
      position: { x: 1, y: 1.5 }, // At tile edge x=1, centered between y=1 and y=2
      orientation: 'vertical',
    },
    // Piloting (0,1-2) to Medbay (1-2,2-3) - door at x=1, between piloting's right and medbay's left, at row 2
    {
      id: 'door_2',
      room1Id: 'room_piloting',
      room2Id: 'room_medbay',
      isOpen: true,
      position: { x: 1, y: 2.5 }, // At tile edge x=1, centered between y=2 and y=3
      orientation: 'vertical',
    },
    // Shields (1-2,0-1) to Medbay (1-2,2-3) - door at y=2, between shields' bottom and medbay's top
    {
      id: 'door_3',
      room1Id: 'room_shields',
      room2Id: 'room_medbay',
      isOpen: true,
      position: { x: 1.5, y: 2 }, // Centered at x=1.5, at tile edge y=2
      orientation: 'horizontal',
    },
    // Shields (1-2,0-1) to Weapons (3-4,0-1) - door at x=3, between shields' right and weapons' left
    {
      id: 'door_4',
      room1Id: 'room_shields',
      room2Id: 'room_weapons',
      isOpen: true,
      position: { x: 3, y: 0.5 }, // At tile edge x=3, centered between y=0 and y=1
      orientation: 'vertical',
    },
    // Medbay (1-2,2-3) to Oxygen (3-4,2-3) - door at x=3, between medbay's right and oxygen's left
    {
      id: 'door_5',
      room1Id: 'room_medbay',
      room2Id: 'room_oxygen',
      isOpen: true,
      position: { x: 3, y: 2.5 }, // At tile edge x=3, centered between y=2 and y=3
      orientation: 'vertical',
    },
    // Weapons (3-4,0-1) to Oxygen (3-4,2-3) - door at y=2, between weapons' bottom and oxygen's top
    {
      id: 'door_6',
      room1Id: 'room_weapons',
      room2Id: 'room_oxygen',
      isOpen: true,
      position: { x: 3.5, y: 2 }, // Centered at x=3.5, at tile edge y=2
      orientation: 'horizontal',
    },
    // Weapons (3-4,0-1) to Engines (5,1-2) - door at x=5, between weapons' right and engines' left
    {
      id: 'door_7',
      room1Id: 'room_weapons',
      room2Id: 'room_engines',
      isOpen: true,
      position: { x: 5, y: 1.5 }, // At tile edge x=5, centered between y=1 and y=2
      orientation: 'vertical',
    },
    // Oxygen (3-4,2-3) to Engines (5,1-2) - door at x=5, between oxygen's right and engines' left
    {
      id: 'door_8',
      room1Id: 'room_oxygen',
      room2Id: 'room_engines',
      isOpen: true,
      position: { x: 5, y: 2.5 }, // At tile edge x=5, centered between y=2 and y=3
      orientation: 'vertical',
    },
  ];

  const weapons: Weapon[] = [
    {
      id: 'weapon_laser_1',
      name: 'Burst Laser II',
      type: 'laser',
      damage: BALANCE.LASER_DAMAGE,
      chargeTime: BALANCE.LASER_CHARGE_TIME,
      currentCharge: 0,
      powered: true,
      powerRequired: BALANCE.LASER_POWER,
      currentPower: BALANCE.LASER_POWER, // Fully powered
      targetRoom: null,
      targetShipId: null,
      missilesCost: 0,
    },
    {
      id: 'weapon_laser_2',
      name: 'Halberd Beam',
      type: 'laser',
      damage: BALANCE.LASER_DAMAGE + 1,
      chargeTime: BALANCE.LASER_CHARGE_TIME * 1.5,
      currentCharge: 0,
      powered: false,
      powerRequired: BALANCE.LASER_POWER * 2,
      currentPower: 0, // Not powered
      targetRoom: null,
      targetShipId: null,
      missilesCost: 0,
    },
    {
      id: 'weapon_missile_1',
      name: 'Artemis',
      type: 'missile',
      damage: BALANCE.MISSILE_DAMAGE,
      chargeTime: BALANCE.MISSILE_CHARGE_TIME,
      currentCharge: 0,
      powered: true,
      powerRequired: BALANCE.MISSILE_POWER,
      currentPower: BALANCE.MISSILE_POWER, // Fully powered
      targetRoom: null,
      targetShipId: null,
      missilesCost: 1,
    },
  ];

  // Crew - each in a specific tile of their room
  // tileIndices: Matt=0 (piloting), Junpeng=0 (shields), Graffin=2 (weapons bottom-left)
  const crewTileIndices = [0, 0, 2];
  const crew: Crew[] = [
    {
      id: 'crew_1',
      name: 'Matt',
      health: BALANCE.CREW_HEALTH,
      maxHealth: BALANCE.CREW_HEALTH,
      currentRoom: 'room_piloting',
      targetRoom: null,
      path: [],
      task: 'manning',
      skills: { piloting: 1, engines: 0, shields: 0, weapons: 0, repair: 0, combat: 0 },
      position: { x: 0, y: 0 }, // Will be set below
      isSelected: false,
      isPlayer: true,
      doorWaypoint: null,
    },
    {
      id: 'crew_2',
      name: 'Junpeng',
      health: BALANCE.CREW_HEALTH,
      maxHealth: BALANCE.CREW_HEALTH,
      currentRoom: 'room_shields',
      targetRoom: null,
      path: [],
      task: 'manning',
      skills: { piloting: 0, engines: 0, shields: 1, weapons: 0, repair: 0, combat: 0 },
      position: { x: 0, y: 0 },
      isSelected: false,
      isPlayer: true,
      doorWaypoint: null,
    },
    {
      id: 'crew_3',
      name: 'Graffin',
      health: BALANCE.CREW_HEALTH,
      maxHealth: BALANCE.CREW_HEALTH,
      currentRoom: 'room_weapons',
      targetRoom: null,
      path: [],
      task: 'manning',
      skills: { piloting: 0, engines: 0, shields: 0, weapons: 1, repair: 0, combat: 1 },
      position: { x: 0, y: 0 },
      isSelected: false,
      isPlayer: true,
      doorWaypoint: null,
    },
  ];

  // Initialize crew positions in specific tiles
  crew.forEach((c, index) => {
    const room = rooms.find(r => r.id === c.currentRoom);
    if (room) {
      const tileIndex = crewTileIndices[index] || 0;
      c.position = getRoomTilePosition(room, RENDER.PLAYER_SHIP_X, RENDER.SHIP_Y, tileIndex);
      room.crewInRoom.push(c.id);
    }
  });

  const systems = createSystems(rooms);

  // Mark initial manning
  systems.piloting.manned = true;
  systems.shields.manned = true;
  systems.weapons.manned = true;

  // Create the ship object
  const ship: Ship = {
    id: 'player_ship',
    name: 'The Kestrel',
    hull: BALANCE.PLAYER_HULL,
    maxHull: BALANCE.PLAYER_HULL,
    rooms,
    doors,
    crew,
    systems,
    reactor: BALANCE.PLAYER_REACTOR,
    powerUsed: 0, // Will be calculated
    weapons,
    isPlayer: true,
    shieldLayers: 1, // Start with 1 shield layer (based on 2 power = 1 layer)
    maxShieldLayers: 1,
    shieldRechargeProgress: 0,
    evasion: 0, // Will be calculated
    position: { x: RENDER.PLAYER_SHIP_X, y: RENDER.SHIP_Y },
  };

  // Calculate actual power used and evasion
  ship.powerUsed = calculatePowerUsed(ship);
  ship.evasion = calculateEvasion(ship);

  return ship;
}

// Create enemy ship - smaller, positioned on the right
export function createEnemyShip(): Ship {
  const rooms: Room[] = [
    // Piloting at top
    {
      id: 'enemy_room_piloting',
      type: 'piloting',
      gridX: 1,
      gridY: 0,
      width: 2,
      height: 1,
      system: 'piloting',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
      manningTileIndex: 0,
    },
    // Weapons left
    {
      id: 'enemy_room_weapons',
      type: 'weapons',
      gridX: 0,
      gridY: 1,
      width: 2,
      height: 2,
      system: 'weapons',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
      manningTileIndex: 0,
    },
    // Shields right
    {
      id: 'enemy_room_shields',
      type: 'shields',
      gridX: 2,
      gridY: 1,
      width: 2,
      height: 2,
      system: 'shields',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
      manningTileIndex: 0,
    },
    // Engines at bottom
    {
      id: 'enemy_room_engines',
      type: 'engines',
      gridX: 1,
      gridY: 3,
      width: 2,
      height: 1,
      system: 'engines',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
      manningTileIndex: 0,
    },
  ];

  // Enemy doors with tile-aligned positions
  // Piloting (1-2,0), Weapons (0-1,1-2), Shields (2-3,1-2), Engines (1-2,3)
  const doors: Door[] = [
    // Piloting (1-2,0) to Weapons (0-1,1-2) - door at y=1, between piloting's bottom and weapons' top
    {
      id: 'enemy_door_1',
      room1Id: 'enemy_room_piloting',
      room2Id: 'enemy_room_weapons',
      isOpen: true,
      position: { x: 1.5, y: 1 }, // Centered at x=1.5, at tile edge y=1
      orientation: 'horizontal',
    },
    // Piloting (1-2,0) to Shields (2-3,1-2) - door at y=1, between piloting's bottom and shields' top
    {
      id: 'enemy_door_2',
      room1Id: 'enemy_room_piloting',
      room2Id: 'enemy_room_shields',
      isOpen: true,
      position: { x: 2.5, y: 1 }, // Centered at x=2.5, at tile edge y=1
      orientation: 'horizontal',
    },
    // Weapons (0-1,1-2) to Shields (2-3,1-2) - door at x=2, between weapons' right and shields' left
    {
      id: 'enemy_door_3',
      room1Id: 'enemy_room_weapons',
      room2Id: 'enemy_room_shields',
      isOpen: true,
      position: { x: 2, y: 1.5 }, // At tile edge x=2, centered between y=1 and y=2
      orientation: 'vertical',
    },
    // Weapons (0-1,1-2) to Engines (1-2,3) - door at y=3, between weapons' bottom and engines' top
    {
      id: 'enemy_door_4',
      room1Id: 'enemy_room_weapons',
      room2Id: 'enemy_room_engines',
      isOpen: true,
      position: { x: 1.5, y: 3 }, // Centered at x=1.5, at tile edge y=3
      orientation: 'horizontal',
    },
    // Shields (2-3,1-2) to Engines (1-2,3) - door at y=3, between shields' bottom and engines' top
    {
      id: 'enemy_door_5',
      room1Id: 'enemy_room_shields',
      room2Id: 'enemy_room_engines',
      isOpen: true,
      position: { x: 2.5, y: 3 }, // Centered at x=2.5, at tile edge y=3
      orientation: 'horizontal',
    },
  ];

  const weapons: Weapon[] = [
    {
      id: 'enemy_weapon_laser',
      name: 'Basic Laser',
      type: 'laser',
      damage: BALANCE.LASER_DAMAGE,
      chargeTime: BALANCE.LASER_CHARGE_TIME * 1.2,
      currentCharge: 0,
      powered: true,
      powerRequired: BALANCE.LASER_POWER,
      currentPower: BALANCE.LASER_POWER,
      targetRoom: null,
      targetShipId: 'player_ship',
      missilesCost: 0,
    },
    {
      id: 'enemy_weapon_laser_2',
      name: 'Ion Blast',
      type: 'laser',
      damage: BALANCE.LASER_DAMAGE,
      chargeTime: BALANCE.LASER_CHARGE_TIME * 1.5,
      currentCharge: 0,
      powered: true,
      powerRequired: BALANCE.LASER_POWER,
      currentPower: BALANCE.LASER_POWER,
      targetRoom: null,
      targetShipId: 'player_ship',
      missilesCost: 0,
    },
  ];

  const crew: Crew[] = [
    {
      id: 'enemy_crew_1',
      name: 'Pirate',
      health: BALANCE.CREW_HEALTH * 0.8,
      maxHealth: BALANCE.CREW_HEALTH * 0.8,
      currentRoom: 'enemy_room_piloting',
      targetRoom: null,
      path: [],
      task: 'manning',
      skills: { piloting: 0, engines: 0, shields: 0, weapons: 0, repair: 0, combat: 0 },
      position: { x: 0, y: 0 },
      isSelected: false,
      isPlayer: false,
      doorWaypoint: null,
    },
    {
      id: 'enemy_crew_2',
      name: 'Pirate',
      health: BALANCE.CREW_HEALTH * 0.8,
      maxHealth: BALANCE.CREW_HEALTH * 0.8,
      currentRoom: 'enemy_room_weapons',
      targetRoom: null,
      path: [],
      task: 'manning',
      skills: { piloting: 0, engines: 0, shields: 0, weapons: 0, repair: 0, combat: 0 },
      position: { x: 0, y: 0 },
      isSelected: false,
      isPlayer: false,
      doorWaypoint: null,
    },
    {
      id: 'enemy_crew_3',
      name: 'Pirate',
      health: BALANCE.CREW_HEALTH * 0.8,
      maxHealth: BALANCE.CREW_HEALTH * 0.8,
      currentRoom: 'enemy_room_shields',
      targetRoom: null,
      path: [],
      task: 'manning',
      skills: { piloting: 0, engines: 0, shields: 0, weapons: 0, repair: 0, combat: 0 },
      position: { x: 0, y: 0 },
      isSelected: false,
      isPlayer: false,
      doorWaypoint: null,
    },
  ];

  // Initialize enemy crew positions
  crew.forEach((c, index) => {
    const room = rooms.find(r => r.id === c.currentRoom);
    if (room) {
      c.position = getRoomTilePosition(room, RENDER.ENEMY_SHIP_X, RENDER.SHIP_Y, index % (room.width * room.height));
      room.crewInRoom.push(c.id);
    }
  });

  const systems = createSystems(rooms);
  systems.shields.powerCurrent = 1;
  systems.engines.powerCurrent = 1;
  systems.piloting.manned = true;
  systems.weapons.manned = true;

  const ship: Ship = {
    id: 'enemy_ship',
    name: 'Rebel Fighter',
    hull: BALANCE.ENEMY_HULL,
    maxHull: BALANCE.ENEMY_HULL,
    rooms,
    doors,
    crew,
    systems,
    reactor: BALANCE.ENEMY_REACTOR,
    powerUsed: 0, // Will be calculated
    weapons,
    isPlayer: false,
    shieldLayers: 0,
    maxShieldLayers: 0,
    shieldRechargeProgress: 0,
    evasion: 0, // Will be calculated
    position: { x: RENDER.ENEMY_SHIP_X, y: RENDER.SHIP_Y },
  };

  // Calculate actual power used and evasion
  ship.powerUsed = calculatePowerUsed(ship);
  ship.evasion = calculateEvasion(ship);
  ship.maxShieldLayers = Math.floor(systems.shields.powerCurrent / 2);
  ship.shieldLayers = ship.maxShieldLayers;

  return ship;
}

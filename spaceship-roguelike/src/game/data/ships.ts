// Ship layout definitions

import { Room, Door, Ship, ShipSystem, SystemType, Weapon, Crew } from '@/utils/types';
import { BALANCE, RENDER } from '@/utils/constants';

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
      powerCurrent: 2,
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

// Create player ship
export function createPlayerShip(): Ship {
  const rooms: Room[] = [
    {
      id: 'room_piloting',
      type: 'piloting',
      gridX: 0,
      gridY: 0,
      width: 2,
      height: 2,
      system: 'piloting',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
    },
    {
      id: 'room_weapons',
      type: 'weapons',
      gridX: 2,
      gridY: 0,
      width: 2,
      height: 2,
      system: 'weapons',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
    },
    {
      id: 'room_shields',
      type: 'shields',
      gridX: 0,
      gridY: 2,
      width: 2,
      height: 2,
      system: 'shields',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
    },
    {
      id: 'room_engines',
      type: 'engines',
      gridX: 2,
      gridY: 2,
      width: 2,
      height: 2,
      system: 'engines',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
    },
  ];

  const doors: Door[] = [
    {
      id: 'door_1',
      room1Id: 'room_piloting',
      room2Id: 'room_weapons',
      isOpen: true,
      position: { x: 2, y: 1 },
      orientation: 'vertical',
    },
    {
      id: 'door_2',
      room1Id: 'room_shields',
      room2Id: 'room_engines',
      isOpen: true,
      position: { x: 2, y: 3 },
      orientation: 'vertical',
    },
    {
      id: 'door_3',
      room1Id: 'room_piloting',
      room2Id: 'room_shields',
      isOpen: true,
      position: { x: 1, y: 2 },
      orientation: 'horizontal',
    },
    {
      id: 'door_4',
      room1Id: 'room_weapons',
      room2Id: 'room_engines',
      isOpen: true,
      position: { x: 3, y: 2 },
      orientation: 'horizontal',
    },
  ];

  const weapons: Weapon[] = [
    {
      id: 'weapon_laser_1',
      name: 'Burst Laser',
      type: 'laser',
      damage: BALANCE.LASER_DAMAGE,
      chargeTime: BALANCE.LASER_CHARGE_TIME,
      currentCharge: 0,
      powered: true,
      powerRequired: BALANCE.LASER_POWER,
      targetRoom: null,
      targetShipId: null,
      missilesCost: 0,
    },
    {
      id: 'weapon_missile_1',
      name: 'Artemis Missile',
      type: 'missile',
      damage: BALANCE.MISSILE_DAMAGE,
      chargeTime: BALANCE.MISSILE_CHARGE_TIME,
      currentCharge: 0,
      powered: true,
      powerRequired: BALANCE.MISSILE_POWER,
      targetRoom: null,
      targetShipId: null,
      missilesCost: 1,
    },
  ];

  const crew: Crew[] = [
    {
      id: 'crew_1',
      name: 'Captain',
      health: BALANCE.CREW_HEALTH,
      maxHealth: BALANCE.CREW_HEALTH,
      currentRoom: 'room_piloting',
      targetRoom: null,
      path: [],
      task: 'manning',
      skills: { piloting: 1, engines: 0, shields: 0, weapons: 0, repair: 0, combat: 0 },
      position: { x: 0, y: 0 }, // Will be calculated
      isSelected: false,
      isPlayer: true,
    },
    {
      id: 'crew_2',
      name: 'Engineer',
      health: BALANCE.CREW_HEALTH,
      maxHealth: BALANCE.CREW_HEALTH,
      currentRoom: 'room_engines',
      targetRoom: null,
      path: [],
      task: 'manning',
      skills: { piloting: 0, engines: 1, shields: 0, weapons: 0, repair: 1, combat: 0 },
      position: { x: 0, y: 0 },
      isSelected: false,
      isPlayer: true,
    },
    {
      id: 'crew_3',
      name: 'Gunner',
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
    },
  ];

  // Initialize crew positions
  crew.forEach(c => {
    const room = rooms.find(r => r.id === c.currentRoom);
    if (room) {
      c.position = {
        x: RENDER.PLAYER_SHIP_X + room.gridX * RENDER.TILE_SIZE + RENDER.TILE_SIZE,
        y: RENDER.SHIP_Y + room.gridY * RENDER.TILE_SIZE + RENDER.TILE_SIZE,
      };
      room.crewInRoom.push(c.id);
    }
  });

  const systems = createSystems(rooms);

  // Mark initial manning
  systems.piloting.manned = true;
  systems.engines.manned = true;
  systems.weapons.manned = true;

  return {
    id: 'player_ship',
    name: 'The Kestrel',
    hull: BALANCE.PLAYER_HULL,
    maxHull: BALANCE.PLAYER_HULL,
    rooms,
    doors,
    crew,
    systems,
    reactor: BALANCE.PLAYER_REACTOR,
    powerUsed: 7, // 2+2+2+1 = 7
    weapons,
    isPlayer: true,
    shieldLayers: 2,
    maxShieldLayers: 4,
    shieldRechargeProgress: 0,
    evasion: 20, // Will be calculated
    position: { x: RENDER.PLAYER_SHIP_X, y: RENDER.SHIP_Y },
  };
}

// Create enemy ship
export function createEnemyShip(): Ship {
  const rooms: Room[] = [
    {
      id: 'enemy_room_piloting',
      type: 'piloting',
      gridX: 0,
      gridY: 0,
      width: 2,
      height: 2,
      system: 'piloting',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
    },
    {
      id: 'enemy_room_weapons',
      type: 'weapons',
      gridX: 2,
      gridY: 0,
      width: 2,
      height: 2,
      system: 'weapons',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
    },
    {
      id: 'enemy_room_shields',
      type: 'shields',
      gridX: 0,
      gridY: 2,
      width: 2,
      height: 2,
      system: 'shields',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
    },
    {
      id: 'enemy_room_engines',
      type: 'engines',
      gridX: 2,
      gridY: 2,
      width: 2,
      height: 2,
      system: 'engines',
      oxygen: 100,
      fire: 0,
      breach: false,
      crewInRoom: [],
    },
  ];

  const doors: Door[] = [
    {
      id: 'enemy_door_1',
      room1Id: 'enemy_room_piloting',
      room2Id: 'enemy_room_weapons',
      isOpen: true,
      position: { x: 2, y: 1 },
      orientation: 'vertical',
    },
    {
      id: 'enemy_door_2',
      room1Id: 'enemy_room_shields',
      room2Id: 'enemy_room_engines',
      isOpen: true,
      position: { x: 2, y: 3 },
      orientation: 'vertical',
    },
  ];

  const weapons: Weapon[] = [
    {
      id: 'enemy_weapon_laser',
      name: 'Basic Laser',
      type: 'laser',
      damage: BALANCE.LASER_DAMAGE,
      chargeTime: BALANCE.LASER_CHARGE_TIME * 1.2, // Slightly slower
      currentCharge: 0,
      powered: true,
      powerRequired: BALANCE.LASER_POWER,
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
    },
  ];

  // Initialize enemy crew positions
  crew.forEach(c => {
    const room = rooms.find(r => r.id === c.currentRoom);
    if (room) {
      c.position = {
        x: RENDER.ENEMY_SHIP_X + room.gridX * RENDER.TILE_SIZE + RENDER.TILE_SIZE,
        y: RENDER.SHIP_Y + room.gridY * RENDER.TILE_SIZE + RENDER.TILE_SIZE,
      };
      room.crewInRoom.push(c.id);
    }
  });

  const systems = createSystems(rooms);
  systems.shields.powerCurrent = 1;
  systems.engines.powerCurrent = 1;
  systems.piloting.manned = true;
  systems.weapons.manned = true;

  return {
    id: 'enemy_ship',
    name: 'Pirate Scout',
    hull: BALANCE.ENEMY_HULL,
    maxHull: BALANCE.ENEMY_HULL,
    rooms,
    doors,
    crew,
    systems,
    reactor: BALANCE.ENEMY_REACTOR,
    powerUsed: 5,
    weapons,
    isPlayer: false,
    shieldLayers: 1,
    maxShieldLayers: 2,
    shieldRechargeProgress: 0,
    evasion: 10,
    position: { x: RENDER.ENEMY_SHIP_X, y: RENDER.SHIP_Y },
  };
}

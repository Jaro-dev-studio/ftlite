// Zustand game state store

import { create } from 'zustand';
import { GameState, Ship, Projectile, SystemType } from '@/utils/types';
import { createPlayerShip, createEnemyShip } from '@/game/data/ships';
import { calculateEvasion, calculatePowerUsed, calculateWeaponPowerUsed, generateId, checkHit, getRoomCenter, getRoomTilePosition, getDoorPixelPosition, findDoorBetweenRooms, isCrewOnManningTile, getManningTilePosition } from '@/utils/helpers';
import { findPathImproved } from '@/game/crew/Pathfinding';
import { BALANCE, RENDER } from '@/utils/constants';
import { canFireWeapon } from '@/game/data/weapons';

interface GameActions {
  // Game flow
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  togglePause: () => void;
  endGame: (victory: boolean) => void;
  resetGame: () => void;

  // Power management
  setPowerLevel: (systemType: SystemType, power: number) => void;
  toggleWeaponPower: (weaponId: string) => void;
  setWeaponPower: (weaponId: string, power: number) => void;

  // Crew management
  selectCrew: (crewId: string | null) => void;
  moveCrew: (crewId: string, targetRoomId: string) => void;
  cycleCrewSelection: () => void;

  // Weapons
  setWeaponTarget: (weaponId: string, targetRoomId: string | null) => void;
  fireWeapon: (weaponId: string) => void;
  startTargeting: (weaponId: string) => void;
  cancelTargeting: () => void;
  toggleAutofire: () => void;

  // Doors
  toggleDoor: (doorId: string) => void;

  // Game loop updates
  updateGame: (deltaTime: number) => void;
}

const initialState: GameState = {
  paused: true,
  gameSpeed: 1,
  gameOver: false,
  victory: false,
  gameStarted: false,
  playerShip: createPlayerShip(),
  enemyShip: null,
  inCombat: false,
  scrap: 0,
  fuel: 10,
  missiles: 8,
  droneParts: 0,
  currentSector: 1,
  currentNode: 0,
  currentEvent: null,
  projectiles: [],
  selectedCrewId: null,
  targetingWeaponId: null,
  autofire: false,
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  startGame: () => {
    const playerShip = createPlayerShip();
    const enemyShip = createEnemyShip();

    // Set random targets for enemy weapons
    if (enemyShip.weapons.length > 0) {
      const targetRoom = playerShip.rooms[Math.floor(Math.random() * playerShip.rooms.length)];
      enemyShip.weapons[0].targetRoom = targetRoom.id;
      enemyShip.weapons[0].targetShipId = playerShip.id;
    }

    set({
      gameStarted: true,
      paused: false,
      gameOver: false,
      victory: false,
      playerShip,
      enemyShip,
      inCombat: true,
      projectiles: [],
      missiles: 8,
    });
  },

  pauseGame: () => set({ paused: true }),
  resumeGame: () => set({ paused: false }),
  togglePause: () => set(state => ({ paused: !state.paused })),

  endGame: (victory: boolean) => {
    set({ gameOver: true, victory, paused: true });
  },

  resetGame: () => {
    set({
      ...initialState,
      playerShip: createPlayerShip(),
    });
  },

  setPowerLevel: (systemType: SystemType, power: number) => {
    set(state => {
      const ship = state.playerShip;
      const system = ship.systems[systemType];
      const maxPower = Math.min(system.powerMax, system.health);
      const newPower = Math.max(0, Math.min(power, maxPower));

      // Calculate if we have enough reactor power
      const currentPowerUsed = calculatePowerUsed(ship);
      const powerDiff = newPower - system.powerCurrent;

      if (currentPowerUsed + powerDiff > ship.reactor) {
        return state; // Not enough power
      }

      let updatedWeapons = [...ship.weapons];

      // Special handling for weapons system - auto-allocate/deallocate to individual weapons
      if (systemType === 'weapons') {
        const currentWeaponPower = calculateWeaponPowerUsed(ship);
        
        if (newPower > currentWeaponPower) {
          // Adding power - auto-allocate to weapons in order
          let powerToAdd = newPower - currentWeaponPower;
          
          for (let i = 0; i < updatedWeapons.length && powerToAdd > 0; i++) {
            const weapon = updatedWeapons[i];
            const canAdd = weapon.powerRequired - weapon.currentPower;
            if (canAdd > 0) {
              const addToThis = Math.min(canAdd, powerToAdd);
              const newWeaponPower = weapon.currentPower + addToThis;
              updatedWeapons[i] = {
                ...weapon,
                currentPower: newWeaponPower,
                powered: newWeaponPower === weapon.powerRequired,
                currentCharge: newWeaponPower === weapon.powerRequired ? weapon.currentCharge : 0,
              };
              powerToAdd -= addToThis;
            }
          }
        } else if (newPower < currentWeaponPower) {
          // Removing power - remove from weapons in reverse order
          let powerToRemove = currentWeaponPower - newPower;
          
          for (let i = updatedWeapons.length - 1; i >= 0 && powerToRemove > 0; i--) {
            const weapon = updatedWeapons[i];
            if (weapon.currentPower > 0) {
              const removeFromThis = Math.min(weapon.currentPower, powerToRemove);
              updatedWeapons[i] = {
                ...weapon,
                currentPower: weapon.currentPower - removeFromThis,
                powered: false,
                currentCharge: 0,
              };
              powerToRemove -= removeFromThis;
            }
          }
        }
      }

      const updatedSystems = {
        ...ship.systems,
        [systemType]: { ...system, powerCurrent: newPower },
      };

      const updatedShip = {
        ...ship,
        systems: updatedSystems,
        weapons: updatedWeapons,
        powerUsed: calculatePowerUsed({ ...ship, systems: updatedSystems }),
        evasion: calculateEvasion({ ...ship, systems: updatedSystems }),
      };

      // Update shield layers based on power
      if (systemType === 'shields') {
        updatedShip.maxShieldLayers = Math.floor(newPower);
        updatedShip.shieldLayers = Math.min(updatedShip.shieldLayers, updatedShip.maxShieldLayers);
      }

      return { playerShip: updatedShip };
    });
  },

  toggleWeaponPower: (weaponId: string) => {
    // Toggle between fully powered and unpowered
    const state = get();
    const ship = state.playerShip;
    const weapon = ship.weapons.find(w => w.id === weaponId);
    if (!weapon) return;

    if (weapon.powered) {
      // Remove all power
      get().setWeaponPower(weaponId, 0);
    } else {
      // Add full power
      get().setWeaponPower(weaponId, weapon.powerRequired);
    }
  },

  setWeaponPower: (weaponId: string, power: number) => {
    set(state => {
      const ship = state.playerShip;
      const weaponIndex = ship.weapons.findIndex(w => w.id === weaponId);
      if (weaponIndex === -1) return state;

      const weapon = ship.weapons[weaponIndex];
      const newPower = Math.max(0, Math.min(power, weapon.powerRequired));
      const powerDiff = newPower - weapon.currentPower;
      
      if (powerDiff === 0) return state;

      const weaponsSystem = ship.systems.weapons;
      const currentWeaponPowerUsed = calculateWeaponPowerUsed(ship);
      const newTotalWeaponPower = currentWeaponPowerUsed + powerDiff;
      
      let newSystemPower = weaponsSystem.powerCurrent;
      
      if (powerDiff > 0) {
        // Adding power to weapon - need to also add to system if needed
        if (newTotalWeaponPower > weaponsSystem.powerCurrent) {
          // Need to increase system power
          const neededSystemPower = newTotalWeaponPower;
          const maxSystemPower = Math.min(weaponsSystem.powerMax, weaponsSystem.health);
          
          if (neededSystemPower > maxSystemPower) {
            return state; // Weapons system can't handle this much power
          }
          
          // Check reactor constraint
        const currentPowerUsed = calculatePowerUsed(ship);
          const systemPowerIncrease = neededSystemPower - weaponsSystem.powerCurrent;
          if (currentPowerUsed + systemPowerIncrease > ship.reactor) {
            return state; // Not enough reactor power
          }
          
          newSystemPower = neededSystemPower;
        }
      } else {
        // Removing power from weapon - also reduce system power to match total
        newSystemPower = newTotalWeaponPower;
      }

      const updatedWeapons = [...ship.weapons];
      updatedWeapons[weaponIndex] = {
        ...weapon,
        currentPower: newPower,
        powered: newPower === weapon.powerRequired,
        currentCharge: newPower === weapon.powerRequired ? weapon.currentCharge : 0,
      };

      const updatedSystems = {
        ...ship.systems,
        weapons: { ...weaponsSystem, powerCurrent: newSystemPower },
      };

      const updatedShip = {
          ...ship,
        systems: updatedSystems,
          weapons: updatedWeapons,
      };

      return {
        playerShip: {
          ...updatedShip,
          powerUsed: calculatePowerUsed(updatedShip),
        },
      };
    });
  },

  selectCrew: (crewId: string | null) => {
    set(state => {
      const updatedCrew = state.playerShip.crew.map(c => ({
        ...c,
        isSelected: c.id === crewId,
      }));
      return {
        selectedCrewId: crewId,
        playerShip: { ...state.playerShip, crew: updatedCrew },
      };
    });
  },

  moveCrew: (crewId: string, targetRoomId: string) => {
    set(state => {
      const ship = state.playerShip;
      const crewIndex = ship.crew.findIndex(c => c.id === crewId);
      if (crewIndex === -1) return state;

      const crew = ship.crew[crewIndex];

      // If crew is stationary and already in target room, do nothing
      if (crew.currentRoom === targetRoomId && crew.task !== 'moving') {
        return state;
      }

      // If crew is moving, we need to figure out the best path
      // They could be anywhere between their currentRoom and their next destination
      let startRoom = crew.currentRoom;
      let newPath: string[] = [];

      if (crew.task === 'moving' && crew.path.length > 0) {
        // Crew is moving toward path[0]
        const nextRoom = crew.path[0];
        
        // Calculate path from current room to target
        const pathFromCurrent = findPathImproved(startRoom, targetRoomId, ship.rooms, ship.doors);
        // Calculate path from next room to target
        const pathFromNext = findPathImproved(nextRoom, targetRoomId, ship.rooms, ship.doors);
        
        // If target is the current room, just go back there
        if (targetRoomId === startRoom) {
          newPath = []; // Empty path means stay in current room - crew will stop when reaching it
        }
        // If target is the next room they're heading to, just continue
        else if (targetRoomId === nextRoom) {
          newPath = [];
        }
        // Otherwise pick the shorter path
        else if (pathFromCurrent.length <= pathFromNext.length || pathFromNext.length === 0) {
          // Go back to current room first, then to target
          newPath = pathFromCurrent.slice(1);
        } else {
          // Continue to next room, then to target
          newPath = [nextRoom, ...pathFromNext.slice(1)];
        }
      } else {
        // Crew is stationary, calculate path normally
        const path = findPathImproved(startRoom, targetRoomId, ship.rooms, ship.doors);
        if (path.length === 0 && startRoom !== targetRoomId) {
        return state; // No valid path
        }
        newPath = path.slice(1);
      }

      const updatedCrew = [...ship.crew];
      updatedCrew[crewIndex] = {
        ...crew,
        targetRoom: targetRoomId,
        path: newPath,
        task: 'moving',
        doorWaypoint: null, // Reset door waypoint - will be set by updateCrew when needed
      };

      return { playerShip: { ...ship, crew: updatedCrew } };
    });
  },

  cycleCrewSelection: () => {
    set(state => {
      const crew = state.playerShip.crew;
      if (crew.length === 0) return state;

      const currentIndex = crew.findIndex(c => c.id === state.selectedCrewId);
      const nextIndex = (currentIndex + 1) % crew.length;
      const nextCrew = crew[nextIndex];

      return {
        selectedCrewId: nextCrew.id,
        playerShip: {
          ...state.playerShip,
          crew: crew.map(c => ({ ...c, isSelected: c.id === nextCrew.id })),
        },
      };
    });
  },

  setWeaponTarget: (weaponId: string, targetRoomId: string | null) => {
    set(state => {
      const ship = state.playerShip;
      const weaponIndex = ship.weapons.findIndex(w => w.id === weaponId);
      if (weaponIndex === -1) return state;

      const updatedWeapons = [...ship.weapons];
      updatedWeapons[weaponIndex] = {
        ...updatedWeapons[weaponIndex],
        targetRoom: targetRoomId,
        targetShipId: state.enemyShip?.id || null,
      };

      return {
        playerShip: { ...ship, weapons: updatedWeapons },
        targetingWeaponId: null,
      };
    });
  },

  fireWeapon: (weaponId: string) => {
    set(state => {
      const ship = state.playerShip;
      const enemy = state.enemyShip;
      if (!enemy) return state;

      const weaponIndex = ship.weapons.findIndex(w => w.id === weaponId);
      if (weaponIndex === -1) return state;

      const weapon = ship.weapons[weaponIndex];

      // Check if we can fire
      if (!canFireWeapon(weapon, state.missiles)) {
        return state;
      }

      // Create projectile
      const targetRoom = enemy.rooms.find(r => r.id === weapon.targetRoom);
      if (!targetRoom) return state;

      const startPos = {
        x: ship.position.x + (ship.rooms[0].width * RENDER.TILE_SIZE * 2),
        y: ship.position.y + (ship.rooms[0].height * RENDER.TILE_SIZE),
      };
      const endPos = getRoomCenter(targetRoom, enemy.position.x, enemy.position.y);

      const projectile: Projectile = {
        id: generateId('proj'),
        weaponType: weapon.type,
        damage: weapon.damage,
        sourceShipId: ship.id,
        targetShipId: enemy.id,
        targetRoomId: weapon.targetRoom!,
        position: { ...startPos },
        startPosition: startPos,
        endPosition: endPos,
        state: 'flying',
        progress: 0,
        speed: BALANCE.PROJECTILE_SPEED,
      };

      // Reset weapon charge and consume missiles
      // If autofire is off, clear target after firing
      const updatedWeapons = [...ship.weapons];
      updatedWeapons[weaponIndex] = {
        ...weapon,
        currentCharge: 0,
        targetRoom: state.autofire ? weapon.targetRoom : null,
        targetShipId: state.autofire ? weapon.targetShipId : null,
      };

      return {
        playerShip: { ...ship, weapons: updatedWeapons },
        missiles: state.missiles - weapon.missilesCost,
        projectiles: [...state.projectiles, projectile],
      };
    });
  },

  startTargeting: (weaponId: string) => {
    set({ targetingWeaponId: weaponId });
  },

  cancelTargeting: () => {
    set({ targetingWeaponId: null });
  },

  toggleAutofire: () => {
    set(state => ({ autofire: !state.autofire }));
  },

  toggleDoor: (doorId: string) => {
    set(state => {
      const ship = state.playerShip;
      const doorIndex = ship.doors.findIndex(d => d.id === doorId);
      if (doorIndex === -1) return state;

      const updatedDoors = [...ship.doors];
      updatedDoors[doorIndex] = {
        ...updatedDoors[doorIndex],
        isOpen: !updatedDoors[doorIndex].isOpen,
      };

      return { playerShip: { ...ship, doors: updatedDoors } };
    });
  },

  updateGame: (deltaTime: number) => {
    const state = get();
    if (state.paused || state.gameOver || !state.gameStarted) return;

    set(currentState => {
      let { playerShip, enemyShip, projectiles } = currentState;
      if (!enemyShip) return currentState;

      // 1. Update weapon charging
      playerShip = updateWeapons(playerShip, deltaTime);
      enemyShip = updateWeapons(enemyShip, deltaTime);

      // 2. Update shield recharge
      playerShip = updateShields(playerShip, deltaTime);
      enemyShip = updateShields(enemyShip, deltaTime);

      // 3. Update crew movement
      playerShip = updateCrew(playerShip, deltaTime);
      enemyShip = updateCrew(enemyShip, deltaTime);

      // 4. Update crew manning status
      playerShip = updateManning(playerShip);
      enemyShip = updateManning(enemyShip);

      // 5. Update evasion
      playerShip = { ...playerShip, evasion: calculateEvasion(playerShip) };
      enemyShip = { ...enemyShip, evasion: calculateEvasion(enemyShip) };

      // 6. Auto-fire player weapons that have targets and are charged
      let missiles = currentState.missiles;
      const autofireResult = processAutofire(playerShip, enemyShip, projectiles, missiles, currentState.autofire);
      playerShip = autofireResult.playerShip;
      projectiles = autofireResult.projectiles;
      missiles -= autofireResult.missilesUsed;

      // 7. Enemy AI - fire weapons
      const enemyFireResult = processEnemyFire(enemyShip, playerShip, projectiles);
      enemyShip = enemyFireResult.ship;
      projectiles = enemyFireResult.projectiles;

      // 8. Update projectiles and handle hits
      const projectileResult = updateProjectiles(projectiles, playerShip, enemyShip, deltaTime);
      projectiles = projectileResult.projectiles;
      playerShip = projectileResult.playerShip;
      enemyShip = projectileResult.enemyShip;

      // 9. Check win/lose conditions
      let gameOver = false;
      let victory = false;

      if (playerShip.hull <= 0) {
        gameOver = true;
        victory = false;
      } else if (enemyShip.hull <= 0) {
        gameOver = true;
        victory = true;
      }

      return {
        playerShip,
        enemyShip,
        projectiles,
        missiles,
        gameOver,
        victory,
        paused: gameOver ? true : currentState.paused,
      };
    });
  },
}));

// Helper functions for game updates

function updateWeapons(ship: Ship, dt: number): Ship {
  const updatedWeapons = ship.weapons.map(weapon => {
    if (!weapon.powered) return weapon;
    if (weapon.currentCharge >= weapon.chargeTime) return weapon;

    return {
      ...weapon,
      currentCharge: Math.min(weapon.currentCharge + dt, weapon.chargeTime),
    };
  });

  return { ...ship, weapons: updatedWeapons };
}

function processAutofire(
  player: Ship,
  enemy: Ship,
  projectiles: Projectile[],
  missiles: number,
  keepTargetAfterFiring: boolean
): { playerShip: Ship; projectiles: Projectile[]; missilesUsed: number } {
  const updatedWeapons = [...player.weapons];
  const newProjectiles = [...projectiles];
  let missilesUsed = 0;

  for (let i = 0; i < updatedWeapons.length; i++) {
    const weapon = updatedWeapons[i];
    
    // Skip if not ready to fire
    if (!weapon.powered) continue;
    if (weapon.currentCharge < weapon.chargeTime) continue;
    if (!weapon.targetRoom || !weapon.targetShipId) continue;
    
    // Check missile cost
    if (weapon.missilesCost > 0 && missiles - missilesUsed < weapon.missilesCost) continue;

    const targetRoom = enemy.rooms.find(r => r.id === weapon.targetRoom);
    if (!targetRoom) continue;

    // Fire the weapon!
    const startPos = {
      x: player.position.x + 50,
      y: player.position.y + 80,
    };
    const endPos = getRoomCenter(targetRoom, enemy.position.x, enemy.position.y);

    const projectile: Projectile = {
      id: generateId('proj'),
      weaponType: weapon.type,
      damage: weapon.damage,
      sourceShipId: player.id,
      targetShipId: enemy.id,
      targetRoomId: weapon.targetRoom,
      position: { ...startPos },
      startPosition: startPos,
      endPosition: endPos,
      state: 'flying',
      progress: 0,
      speed: BALANCE.PROJECTILE_SPEED,
    };

    newProjectiles.push(projectile);
    
    // Reset weapon charge and optionally clear target
    updatedWeapons[i] = { 
      ...weapon, 
      currentCharge: 0,
      // If autofire is off, clear target after firing
      targetRoom: keepTargetAfterFiring ? weapon.targetRoom : null,
      targetShipId: keepTargetAfterFiring ? weapon.targetShipId : null,
    };
    
    // Track missile usage
    if (weapon.missilesCost > 0) {
      missilesUsed += weapon.missilesCost;
    }
  }

  return {
    playerShip: { ...player, weapons: updatedWeapons },
    projectiles: newProjectiles,
    missilesUsed,
  };
}

function updateShields(ship: Ship, dt: number): Ship {
  const shieldSystem = ship.systems.shields;
  if (!shieldSystem || shieldSystem.powerCurrent === 0) return ship;

  const maxLayers = Math.floor(shieldSystem.powerCurrent);
  if (ship.shieldLayers >= maxLayers) {
    return { ...ship, maxShieldLayers: maxLayers };
  }

  const rechargeProgress = ship.shieldRechargeProgress + dt;
  if (rechargeProgress >= BALANCE.SHIELD_RECHARGE_TIME) {
    return {
      ...ship,
      shieldLayers: Math.min(ship.shieldLayers + 1, maxLayers),
      maxShieldLayers: maxLayers,
      shieldRechargeProgress: 0,
    };
  }

  return { ...ship, shieldRechargeProgress: rechargeProgress, maxShieldLayers: maxLayers };
}

function updateCrew(ship: Ship, dt: number): Ship {
  const updatedCrew = ship.crew.map(crew => {
    if (crew.task !== 'moving' || !crew.targetRoom) return crew;

    // Determine the room we're moving toward
    const nextRoom = crew.path.length > 0 ? crew.path[0] : crew.targetRoom;
    
    const targetRoomData = ship.rooms.find(r => r.id === nextRoom);
    if (!targetRoomData) {
      return { ...crew, task: 'idle' as const, targetRoom: null, doorWaypoint: null };
    }

    // If we're moving to a different room, we need to go through a door first
    const isChangingRoom = nextRoom !== crew.currentRoom;
    
    // If changing rooms and no door waypoint set, find and set the door waypoint
    if (isChangingRoom && !crew.doorWaypoint) {
      const door = findDoorBetweenRooms(crew.currentRoom, nextRoom, ship.doors);
      if (door && door.isOpen) {
        const doorPos = getDoorPixelPosition(door, ship.position.x, ship.position.y);
        return {
          ...crew,
          doorWaypoint: doorPos,
        };
      } else {
        // No door or door is closed - can't move
        return { ...crew, task: 'idle' as const, targetRoom: null, path: [], doorWaypoint: null };
      }
    }

    // Determine target position: door waypoint or tile in room
    let targetPos: { x: number; y: number };
    let isMovingToDoor = false;

    if (crew.doorWaypoint) {
      // Move to door first
      targetPos = crew.doorWaypoint;
      isMovingToDoor = true;
    } else {
      // Move to tile in current target room
      // Find an available tile in the target room (not occupied by other crew)
      const totalTiles = targetRoomData.width * targetRoomData.height;
      const occupiedTiles = new Set<number>();
      
      // Check which tiles are occupied by other crew in this room
      ship.crew.forEach(c => {
        if (c.id !== crew.id && c.currentRoom === nextRoom) {
          const tileX = Math.floor((c.position.x - ship.position.x) / RENDER.TILE_SIZE - targetRoomData.gridX);
          const tileY = Math.floor((c.position.y - ship.position.y) / RENDER.TILE_SIZE - targetRoomData.gridY);
          const tileIndex = tileY * targetRoomData.width + tileX;
          if (tileIndex >= 0 && tileIndex < totalTiles) {
            occupiedTiles.add(tileIndex);
          }
        }
      });

      // Prefer manning tile if room has a system and manning tile is available
      let availableTile = 0;
      if (targetRoomData.system !== null && !occupiedTiles.has(targetRoomData.manningTileIndex)) {
        // Go to manning tile if available
        availableTile = targetRoomData.manningTileIndex;
      } else {
        // Find first available tile
        for (let i = 0; i < totalTiles; i++) {
          if (!occupiedTiles.has(i)) {
            availableTile = i;
            break;
          }
        }
      }

      targetPos = getRoomTilePosition(targetRoomData, ship.position.x, ship.position.y, availableTile);
    }

    const dx = targetPos.x - crew.position.x;
    const dy = targetPos.y - crew.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      if (isMovingToDoor) {
        // Reached the door, now we can enter the next room
        // Clear door waypoint and update current room
      const oldRoom = ship.rooms.find(r => r.id === crew.currentRoom);
      if (oldRoom) {
        oldRoom.crewInRoom = oldRoom.crewInRoom.filter(id => id !== crew.id);
      }
        if (!targetRoomData.crewInRoom.includes(crew.id)) {
      targetRoomData.crewInRoom.push(crew.id);
        }

        const newPath = crew.path.length > 0 ? crew.path.slice(1) : [];

      return {
        ...crew,
          currentRoom: nextRoom,
        path: newPath,
          doorWaypoint: null, // Clear door waypoint - will set new one if needed
        position: targetPos,
      };
      } else {
        // Reached the tile in the room
        const newPath = crew.path.length > 0 ? crew.path.slice(1) : [];
        const reachedFinalDestination = nextRoom === crew.targetRoom && newPath.length === 0;

        return {
          ...crew,
          currentRoom: nextRoom,
          path: newPath,
          task: reachedFinalDestination ? 'idle' as const : 'moving' as const,
          targetRoom: reachedFinalDestination ? null : crew.targetRoom,
          position: targetPos,
          doorWaypoint: null,
        };
      }
    }

    // Move towards target position - cardinal directions only (no diagonal)
    const moveSpeed = BALANCE.CREW_MOVE_SPEED * dt;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    
    let moveX = 0;
    let moveY = 0;
    
    // Move in the direction with greater distance first (cardinal only)
    if (absDx > absDy) {
      // Move horizontally
      moveX = Math.sign(dx) * Math.min(moveSpeed, absDx);
    } else {
      // Move vertically
      moveY = Math.sign(dy) * Math.min(moveSpeed, absDy);
    }

    return {
      ...crew,
      position: {
        x: crew.position.x + moveX,
        y: crew.position.y + moveY,
      },
    };
  });

  return { ...ship, crew: updatedCrew };
}

function updateManning(ship: Ship): Ship {
  const updatedSystems = { ...ship.systems };
  const updatedCrew = [...ship.crew];

  // First, reset all manning tasks to idle (except moving crew)
  updatedCrew.forEach((crew, index) => {
    if (crew.task === 'manning') {
      updatedCrew[index] = { ...crew, task: 'idle' as const };
    }
  });

  // Then check manning for each system room
  for (const systemType of Object.keys(updatedSystems) as SystemType[]) {
    const system = updatedSystems[systemType];
    const room = ship.rooms.find(r => r.id === system.roomId);
    if (!room) continue;

    // Find crew members in this room
    const crewInRoom = updatedCrew.filter(crew => 
      room.crewInRoom.includes(crew.id) && 
      crew.isPlayer === ship.isPlayer
    );

    // Find crew member on the manning tile
    const manningCrewIndex = updatedCrew.findIndex(crew => {
      if (!room.crewInRoom.includes(crew.id)) return false;
      if (crew.task === 'moving') return false;
      if (crew.isPlayer !== ship.isPlayer) return false;
      
      // Check if crew is on the manning tile
      return isCrewOnManningTile(crew.position, room, ship.position.x, ship.position.y);
    });

    if (manningCrewIndex !== -1) {
      // Crew is on manning tile - mark as manning
      updatedCrew[manningCrewIndex] = { 
        ...updatedCrew[manningCrewIndex], 
        task: 'manning' as const 
      };
      updatedSystems[systemType] = { ...system, manned: true };
    } else {
      // No one on manning tile - find idle crew in room to move to manning tile
      updatedSystems[systemType] = { ...system, manned: false };
      
      // Find an idle crew member in the room to auto-move to manning tile
      const idleCrewIndex = updatedCrew.findIndex(crew =>
        room.crewInRoom.includes(crew.id) &&
        crew.task === 'idle' &&
        crew.isPlayer === ship.isPlayer &&
        !isCrewOnManningTile(crew.position, room, ship.position.x, ship.position.y)
      );

      if (idleCrewIndex !== -1) {
        // Move this crew to the manning tile position
        const manningPos = getManningTilePosition(room, ship.position.x, ship.position.y);
        updatedCrew[idleCrewIndex] = {
          ...updatedCrew[idleCrewIndex],
          task: 'moving' as const,
          targetRoom: room.id,
          path: [],
          doorWaypoint: null,
        };
        // Set their position target - they'll move to manning tile
      }
    }
  }

  return { ...ship, systems: updatedSystems, crew: updatedCrew };
}

function processEnemyFire(
  enemy: Ship,
  player: Ship,
  projectiles: Projectile[]
): { ship: Ship; projectiles: Projectile[] } {
  const updatedWeapons = [...enemy.weapons];
  const newProjectiles = [...projectiles];

  for (let i = 0; i < updatedWeapons.length; i++) {
    const weapon = updatedWeapons[i];
    if (!weapon.powered || weapon.currentCharge < weapon.chargeTime) continue;
    if (!weapon.targetRoom) {
      // Pick random room to target
      const targetRoom = player.rooms[Math.floor(Math.random() * player.rooms.length)];
      weapon.targetRoom = targetRoom.id;
      weapon.targetShipId = player.id;
    }

    const targetRoom = player.rooms.find(r => r.id === weapon.targetRoom);
    if (!targetRoom) continue;

    // Fire!
    const startPos = {
      x: enemy.position.x,
      y: enemy.position.y + RENDER.TILE_SIZE * 2,
    };
    const endPos = getRoomCenter(targetRoom, player.position.x, player.position.y);

    const projectile: Projectile = {
      id: generateId('enemy_proj'),
      weaponType: weapon.type,
      damage: weapon.damage,
      sourceShipId: enemy.id,
      targetShipId: player.id,
      targetRoomId: weapon.targetRoom!,
      position: { ...startPos },
      startPosition: startPos,
      endPosition: endPos,
      state: 'flying',
      progress: 0,
      speed: BALANCE.PROJECTILE_SPEED,
    };

    newProjectiles.push(projectile);
    updatedWeapons[i] = { ...weapon, currentCharge: 0 };
  }

  return {
    ship: { ...enemy, weapons: updatedWeapons },
    projectiles: newProjectiles,
  };
}

function updateProjectiles(
  projectiles: Projectile[],
  playerShip: Ship,
  enemyShip: Ship,
  dt: number
): { projectiles: Projectile[]; playerShip: Ship; enemyShip: Ship } {
  let updatedPlayer = { ...playerShip };
  let updatedEnemy = { ...enemyShip };
  const remainingProjectiles: Projectile[] = [];

  for (const proj of projectiles) {
    if (proj.state !== 'flying') continue;

    // Update position
    const dx = proj.endPosition.x - proj.startPosition.x;
    const dy = proj.endPosition.y - proj.startPosition.y;
    const totalDist = Math.sqrt(dx * dx + dy * dy);
    const progressInc = (proj.speed * dt) / totalDist;
    const newProgress = proj.progress + progressInc;

      const targetShip = proj.targetShipId === playerShip.id ? updatedPlayer : updatedEnemy;

    // Calculate shield intersection point (approximately 75% of the way there for visual effect)
    // Shields form an ellipse around the ship, projectiles should stop at the shield edge
    const shieldStopProgress = 0.85; // Stop at shield boundary (before reaching room center)

    // Check if projectile should be stopped by shields
    if (proj.weaponType !== 'missile' && targetShip.shieldLayers > 0 && newProgress >= shieldStopProgress) {
      // Blocked by shields - projectile stops at shield boundary
        if (proj.targetShipId === playerShip.id) {
          updatedPlayer = { ...updatedPlayer, shieldLayers: updatedPlayer.shieldLayers - 1 };
        } else {
          updatedEnemy = { ...updatedEnemy, shieldLayers: updatedEnemy.shieldLayers - 1 };
        }
      continue; // Remove projectile - it stopped at shields
    }

    if (newProgress >= 1) {
      // Projectile reached target room

      // Check evasion (missiles ignore evasion for simplicity in MVP)
      const evaded = proj.weaponType !== 'missile' && !checkHit(targetShip.evasion);

      if (evaded) {
        // Missed - projectile disappears at target
        continue; // Remove projectile
      }

      // Shields already checked above, so if we get here, projectile hits the room

      // Deal damage
      const targetRoom = targetShip.rooms.find(r => r.id === proj.targetRoomId);
      if (targetRoom && targetRoom.system) {
        const system = targetShip.systems[targetRoom.system];
        if (system) {
          const newHealth = Math.max(0, system.health - BALANCE.SYSTEM_DAMAGE_PER_HIT);
          const newPower = Math.min(system.powerCurrent, newHealth);

          if (proj.targetShipId === playerShip.id) {
            updatedPlayer = {
              ...updatedPlayer,
              hull: Math.max(0, updatedPlayer.hull - proj.damage),
              systems: {
                ...updatedPlayer.systems,
                [targetRoom.system]: { ...system, health: newHealth, powerCurrent: newPower },
              },
            };
          } else {
            updatedEnemy = {
              ...updatedEnemy,
              hull: Math.max(0, updatedEnemy.hull - proj.damage),
              systems: {
                ...updatedEnemy.systems,
                [targetRoom.system]: { ...system, health: newHealth, powerCurrent: newPower },
              },
            };
          }
        }
      } else {
        // Room without system, just hull damage
        if (proj.targetShipId === playerShip.id) {
          updatedPlayer = { ...updatedPlayer, hull: Math.max(0, updatedPlayer.hull - proj.damage) };
        } else {
          updatedEnemy = { ...updatedEnemy, hull: Math.max(0, updatedEnemy.hull - proj.damage) };
        }
      }

      continue; // Remove projectile
    }

    // Update projectile position
    remainingProjectiles.push({
      ...proj,
      progress: newProgress,
      position: {
        x: proj.startPosition.x + dx * newProgress,
        y: proj.startPosition.y + dy * newProgress,
      },
    });
  }

  return {
    projectiles: remainingProjectiles,
    playerShip: updatedPlayer,
    enemyShip: updatedEnemy,
  };
}


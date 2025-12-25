// Zustand game state store

import { create } from 'zustand';
import { GameState, Ship, Projectile, SystemType } from '@/utils/types';
import { createPlayerShip, createEnemyShip } from '@/game/data/ships';
import { calculateEvasion, calculatePowerUsed, generateId, checkHit, getRoomCenter } from '@/utils/helpers';
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

  // Crew management
  selectCrew: (crewId: string | null) => void;
  moveCrew: (crewId: string, targetRoomId: string) => void;
  cycleCrewSelection: () => void;

  // Weapons
  setWeaponTarget: (weaponId: string, targetRoomId: string | null) => void;
  fireWeapon: (weaponId: string) => void;
  startTargeting: (weaponId: string) => void;
  cancelTargeting: () => void;

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

      const updatedSystems = {
        ...ship.systems,
        [systemType]: { ...system, powerCurrent: newPower },
      };

      const updatedShip = {
        ...ship,
        systems: updatedSystems,
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
    set(state => {
      const ship = state.playerShip;
      const weaponIndex = ship.weapons.findIndex(w => w.id === weaponId);
      if (weaponIndex === -1) return state;

      const weapon = ship.weapons[weaponIndex];
      const newPowered = !weapon.powered;

      // Check if we have power to enable it
      if (newPowered) {
        const currentPowerUsed = calculatePowerUsed(ship);
        if (currentPowerUsed + weapon.powerRequired > ship.reactor) {
          return state; // Not enough power
        }
      }

      const updatedWeapons = [...ship.weapons];
      updatedWeapons[weaponIndex] = {
        ...weapon,
        powered: newPowered,
        currentCharge: newPowered ? weapon.currentCharge : 0,
      };

      return {
        playerShip: {
          ...ship,
          weapons: updatedWeapons,
          powerUsed: calculatePowerUsed({ ...ship, weapons: updatedWeapons }),
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

      // Find path
      const path = findPathImproved(crew.currentRoom, targetRoomId, ship.rooms, ship.doors);
      if (path.length === 0 && crew.currentRoom !== targetRoomId) {
        return state; // No valid path
      }

      const updatedCrew = [...ship.crew];
      updatedCrew[crewIndex] = {
        ...crew,
        targetRoom: targetRoomId,
        path: path.slice(1), // Remove current room from path
        task: 'moving',
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
      const updatedWeapons = [...ship.weapons];
      updatedWeapons[weaponIndex] = {
        ...weapon,
        currentCharge: 0,
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

      // 6. Enemy AI - fire weapons
      const enemyFireResult = processEnemyFire(enemyShip, playerShip, projectiles);
      enemyShip = enemyFireResult.ship;
      projectiles = enemyFireResult.projectiles;

      // 7. Update projectiles and handle hits
      const projectileResult = updateProjectiles(projectiles, playerShip, enemyShip, deltaTime);
      projectiles = projectileResult.projectiles;
      playerShip = projectileResult.playerShip;
      enemyShip = projectileResult.enemyShip;

      // 8. Check win/lose conditions
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
    if (crew.path.length === 0 && crew.currentRoom === crew.targetRoom) {
      // Arrived at destination
      return { ...crew, task: 'idle' as const, targetRoom: null };
    }

    // Get next room in path
    const nextRoom = crew.path[0];
    if (!nextRoom) {
      return { ...crew, task: 'idle' as const, targetRoom: null };
    }

    const targetRoomData = ship.rooms.find(r => r.id === nextRoom);
    if (!targetRoomData) return crew;

    const targetPos = getRoomCenter(targetRoomData, ship.position.x, ship.position.y);
    const dx = targetPos.x - crew.position.x;
    const dy = targetPos.y - crew.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      // Reached next room
      const newPath = crew.path.slice(1);
      const newRoom = nextRoom;

      // Update room crew lists
      const oldRoom = ship.rooms.find(r => r.id === crew.currentRoom);
      if (oldRoom) {
        oldRoom.crewInRoom = oldRoom.crewInRoom.filter(id => id !== crew.id);
      }
      targetRoomData.crewInRoom.push(crew.id);

      return {
        ...crew,
        currentRoom: newRoom,
        path: newPath,
        task: newPath.length === 0 ? 'idle' as const : 'moving' as const,
        targetRoom: newPath.length === 0 ? null : crew.targetRoom,
        position: targetPos,
      };
    }

    // Move towards next room
    const moveSpeed = BALANCE.CREW_MOVE_SPEED * dt;
    const moveX = (dx / dist) * moveSpeed;
    const moveY = (dy / dist) * moveSpeed;

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

  for (const systemType of Object.keys(updatedSystems) as SystemType[]) {
    const system = updatedSystems[systemType];
    const room = ship.rooms.find(r => r.id === system.roomId);
    if (!room) continue;

    const hasCrew = room.crewInRoom.some(crewId => {
      const crew = ship.crew.find(c => c.id === crewId);
      return crew && crew.task !== 'moving';
    });

    updatedSystems[systemType] = { ...system, manned: hasCrew };
  }

  return { ...ship, systems: updatedSystems };
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

    if (newProgress >= 1) {
      // Projectile reached target
      const targetShip = proj.targetShipId === playerShip.id ? updatedPlayer : updatedEnemy;

      // Check evasion (missiles ignore evasion for simplicity in MVP)
      const evaded = proj.weaponType !== 'missile' && !checkHit(targetShip.evasion);

      if (evaded) {
        // Missed
        continue; // Remove projectile
      }

      // Check shields (missiles ignore shields)
      if (proj.weaponType !== 'missile' && targetShip.shieldLayers > 0) {
        // Blocked by shields
        if (proj.targetShipId === playerShip.id) {
          updatedPlayer = { ...updatedPlayer, shieldLayers: updatedPlayer.shieldLayers - 1 };
        } else {
          updatedEnemy = { ...updatedEnemy, shieldLayers: updatedEnemy.shieldLayers - 1 };
        }
        continue; // Remove projectile
      }

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

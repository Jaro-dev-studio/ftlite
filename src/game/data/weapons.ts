// Weapon definitions

import { WeaponType } from '@/utils/types';
import { BALANCE } from '@/utils/constants';

export interface WeaponDefinition {
  name: string;
  type: WeaponType;
  damage: number;
  chargeTime: number;
  powerRequired: number;
  missilesCost: number;
  description: string;
}

export const WEAPON_DEFINITIONS: Record<string, WeaponDefinition> = {
  burst_laser: {
    name: 'Burst Laser',
    type: 'laser',
    damage: BALANCE.LASER_DAMAGE,
    chargeTime: BALANCE.LASER_CHARGE_TIME,
    powerRequired: BALANCE.LASER_POWER,
    missilesCost: 0,
    description: 'A rapid-fire laser that deals 1 damage. Blocked by shields.',
  },
  artemis_missile: {
    name: 'Artemis Missile',
    type: 'missile',
    damage: BALANCE.MISSILE_DAMAGE,
    chargeTime: BALANCE.MISSILE_CHARGE_TIME,
    powerRequired: BALANCE.MISSILE_POWER,
    missilesCost: 1,
    description: 'A slow but powerful missile that ignores shields. Uses 1 missile.',
  },
  basic_laser: {
    name: 'Basic Laser',
    type: 'laser',
    damage: BALANCE.LASER_DAMAGE,
    chargeTime: BALANCE.LASER_CHARGE_TIME * 1.2,
    powerRequired: BALANCE.LASER_POWER,
    missilesCost: 0,
    description: 'A standard laser weapon.',
  },
};

// Check if weapon can fire (has target, is charged, has ammo if needed)
export function canFireWeapon(
  weapon: { currentCharge: number; chargeTime: number; targetRoom: string | null; missilesCost: number; powered: boolean },
  missiles: number
): boolean {
  if (!weapon.powered) return false;
  if (weapon.currentCharge < weapon.chargeTime) return false;
  if (!weapon.targetRoom) return false;
  if (weapon.missilesCost > 0 && missiles < weapon.missilesCost) return false;
  return true;
}

// Get charge percentage
export function getChargePercent(weapon: { currentCharge: number; chargeTime: number }): number {
  return Math.min(100, (weapon.currentCharge / weapon.chargeTime) * 100);
}

'use client';

// Weapons panel with charge bars and fire buttons

import React from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Weapon } from '@/utils/types';
import { canFireWeapon, getChargePercent } from '@/game/data/weapons';

interface WeaponRowProps {
  weapon: Weapon;
}

function WeaponRow({ weapon }: WeaponRowProps) {
  const {
    missiles,
    fireWeapon,
    startTargeting,
    toggleWeaponPower,
    targetingWeaponId,
    enemyShip,
  } = useGameStore();

  const chargePercent = getChargePercent(weapon);
  const isCharged = chargePercent >= 100;
  const canFire = canFireWeapon(weapon, missiles);
  const isTargeting = targetingWeaponId === weapon.id;
  const hasTarget = weapon.targetRoom !== null;

  const handleFireClick = () => {
    if (!hasTarget) {
      startTargeting(weapon.id);
    } else if (canFire) {
      fireWeapon(weapon.id);
    }
  };

  const targetRoom = enemyShip?.rooms.find(r => r.id === weapon.targetRoom);
  const targetName = targetRoom?.type || 'None';

  return (
    <div className={`flex items-center gap-2 py-2 px-2 rounded ${isTargeting ? 'bg-yellow-900/30' : ''}`}>
      {/* Power toggle */}
      <button
        onClick={() => toggleWeaponPower(weapon.id)}
        className={`w-6 h-6 rounded text-xs font-bold ${
          weapon.powered
            ? 'bg-green-600 text-white'
            : 'bg-gray-700 text-gray-400'
        }`}
        title={weapon.powered ? 'Powered' : 'Unpowered'}
      >
        {weapon.powered ? 'ON' : 'OFF'}
      </button>

      {/* Weapon info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">{weapon.name}</span>
          <span className="text-gray-500 text-xs">
            {weapon.type === 'missile' ? `(${weapon.missilesCost} missile)` : ''}
          </span>
        </div>
        
        {/* Charge bar */}
        <div className="w-full h-2 bg-gray-700 rounded mt-1 overflow-hidden">
          <div
            className={`h-full transition-all ${
              isCharged ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${weapon.powered ? chargePercent : 0}%` }}
          />
        </div>
      </div>

      {/* Target indicator */}
      <div className="text-xs text-gray-400 w-16 text-center">
        {hasTarget ? (
          <span className="text-orange-400">{targetName}</span>
        ) : (
          <span className="text-gray-600">No target</span>
        )}
      </div>

      {/* Fire/Target button */}
      <button
        onClick={handleFireClick}
        disabled={!weapon.powered}
        className={`px-3 py-1 rounded text-sm font-bold transition-all ${
          !weapon.powered
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : isTargeting
            ? 'bg-yellow-600 text-white animate-pulse'
            : !hasTarget
            ? 'bg-blue-600 hover:bg-blue-500 text-white'
            : canFire
            ? 'bg-red-600 hover:bg-red-500 text-white'
            : 'bg-gray-600 text-gray-300'
        }`}
      >
        {isTargeting ? 'Targeting...' : !hasTarget ? 'Target' : isCharged ? 'FIRE' : 'Charging'}
      </button>
    </div>
  );
}

export function WeaponsPanel() {
  const { playerShip, targetingWeaponId, cancelTargeting } = useGameStore();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold text-sm">WEAPONS</h3>
        {targetingWeaponId && (
          <button
            onClick={cancelTargeting}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Cancel targeting
          </button>
        )}
      </div>

      <div className="space-y-1">
        {playerShip.weapons.map(weapon => (
          <WeaponRow key={weapon.id} weapon={weapon} />
        ))}
      </div>
    </div>
  );
}

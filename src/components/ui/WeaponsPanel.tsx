'use client';

// FTL-style weapons panel with individual weapon slots

import React from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Weapon } from '@/utils/types';
import { canFireWeapon, getChargePercent } from '@/game/data/weapons';

interface WeaponSlotProps {
  weapon: Weapon;
  index: number;
}

function WeaponSlot({ weapon, index }: WeaponSlotProps) {
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
    if (!weapon.powered) return;
    if (!hasTarget) {
      startTargeting(weapon.id);
    } else if (canFire) {
      fireWeapon(weapon.id);
    }
  };

  const targetRoom = enemyShip?.rooms.find(r => r.id === weapon.targetRoom);
  const targetName = targetRoom?.type || null;

  // Determine slot state
  let slotClass = 'weapon-slot';
  if (isTargeting) slotClass += ' targeting';
  else if (!weapon.powered) slotClass += '';
  else if (isCharged && hasTarget) slotClass += ' ready';
  else if (weapon.powered) slotClass += ' charging';

  return (
    <div className={slotClass}>
      {/* Weapon Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#ecf0f1] font-bold text-xs tracking-wide truncate">
          {weapon.name}
        </span>
        <span className="text-[#95a5a6] text-[10px]">
          [{index + 1}]
        </span>
      </div>

      {/* Charge Bar */}
      <div className="charge-bar mb-2">
        <div
          className={`charge-bar-fill ${isCharged ? 'ready' : 'charging'}`}
          style={{ width: weapon.powered ? `${chargePercent}%` : '0%' }}
        />
      </div>

      {/* Power Toggle and Fire Button Row */}
      <div className="flex items-center gap-2">
        {/* Power Toggle */}
      <button
        onClick={() => toggleWeaponPower(weapon.id)}
          className={`w-8 h-8 rounded text-[10px] font-bold transition-all ${
          weapon.powered
              ? 'bg-[#27ae60] text-white border border-[#2ecc71]'
              : 'bg-[#1a1a1a] text-[#5a5a5a] border border-[#3a3a3a]'
        }`}
        title={weapon.powered ? 'Powered' : 'Unpowered'}
      >
        {weapon.powered ? 'ON' : 'OFF'}
      </button>

        {/* Fire/Target Button */}
        <button
          onClick={handleFireClick}
          disabled={!weapon.powered}
          className={`flex-1 h-8 rounded text-[10px] font-bold uppercase transition-all ${
            !weapon.powered
              ? 'bg-[#1a1a1a] text-[#4a4a4a] cursor-not-allowed'
              : isTargeting
              ? 'bg-[#f1c40f] text-[#000] animate-pulse'
              : !hasTarget
              ? 'bg-[#3498db] hover:bg-[#5dade2] text-white'
              : isCharged
              ? 'bg-[#c0392b] hover:bg-[#e74c3c] text-white'
              : 'bg-[#2a2a2a] text-[#7a7a7a]'
          }`}
        >
          {isTargeting ? 'SELECT' : !hasTarget ? 'TARGET' : isCharged ? 'FIRE' : `${Math.floor(chargePercent)}%`}
        </button>
      </div>

      {/* Target Indicator */}
      {hasTarget && (
        <div className="mt-2 text-center">
          <span className="text-[10px] text-[#e74c3c] uppercase tracking-wide">
            {targetName}
          </span>
        </div>
      )}

      {/* Missile Cost Indicator */}
      {weapon.missilesCost > 0 && (
        <div className="mt-1 text-center">
          <span className="text-[9px] text-[#e67e22]">
            {weapon.missilesCost} missile
          </span>
        </div>
      )}
    </div>
  );
}

export function WeaponsPanel() {
  const { playerShip, targetingWeaponId, cancelTargeting, autofire, toggleAutofire } = useGameStore();

  return (
    <div className="flex items-start gap-3">
      {/* Weapons Label */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[#c0392b] font-bold text-xs tracking-wider writing-mode-vertical">
          WEAPONS
        </span>
        {targetingWeaponId && (
          <button
            onClick={cancelTargeting}
            className="text-[9px] text-[#c0392b] hover:text-[#e74c3c] underline"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Weapon Slots */}
      <div className="flex gap-2">
        {playerShip.weapons.map((weapon, index) => (
          <WeaponSlot key={weapon.id} weapon={weapon} index={index} />
        ))}
      </div>

      {/* Autofire Toggle */}
      <div className="flex flex-col items-center gap-1 ml-2">
        <button 
          onClick={toggleAutofire}
          className={`text-[9px] px-2 py-1 rounded font-bold transition-all ${
            autofire
              ? 'bg-[#27ae60] text-white border border-[#2ecc71]'
              : 'bg-[#2a2a2a] text-[#8a8a8a] border border-[#3a3a3a] hover:bg-[#3a3a3a]'
          }`}
        >
          AUTOFIRE {autofire ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
}

'use client';

// FTL-style HUD overlay - all UI elements positioned absolutely over the game canvas

import React, { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { SystemType } from '@/utils/types';
import { COLORS } from '@/utils/constants';
import { canFireWeapon, getChargePercent } from '@/game/data/weapons';

// System colors matching FTL
const SYSTEM_COLORS: Record<SystemType, string> = {
  shields: '#3498db',
  weapons: '#e74c3c',
  engines: '#f39c12',
  piloting: '#27ae60',
};

// System full names for tooltips
const SYSTEM_NAMES: Record<SystemType, string> = {
  shields: 'Shields',
  weapons: 'Weapons',
  engines: 'Engines',
  piloting: 'Piloting',
};

export function HUD() {
  const {
    playerShip,
    enemyShip,
    paused,
    missiles,
    fuel,
    scrap,
    togglePause,
    gameStarted,
    selectedCrewId,
    selectCrew,
    cycleCrewSelection,
    targetingWeaponId,
    startTargeting,
    cancelTargeting,
    fireWeapon,
    toggleWeaponPower,
    setWeaponPower,
    setPowerLevel,
    autofire,
    toggleAutofire,
  } = useGameStore();

  const [hoveredSystem, setHoveredSystem] = useState<SystemType | null>(null);

  if (!gameStarted) return null;

  const hullPercent = (playerShip.hull / playerShip.maxHull) * 100;
  const isCritical = hullPercent < 30;
  const isDamaged = hullPercent < 60;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* ===== TOP BAR ===== */}
      <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between pointer-events-auto">
        {/* Left: Hull + Shields + Resources */}
        <div className="flex items-center gap-4">
          {/* Hull */}
          <div className="flex items-center gap-2 bg-black/70 px-3 py-2 rounded border border-[#c0392b]/50">
            <span className="text-[#c0392b] font-bold text-xs">HULL</span>
            <div className="flex gap-[1px]">
              {Array.from({ length: playerShip.maxHull }).map((_, i) => (
                <div
                  key={i}
                  className={`w-[6px] h-[16px] ${
                    i < playerShip.hull
                      ? isCritical
                        ? 'bg-[#c0392b]'
                        : isDamaged
                        ? 'bg-[#f39c12]'
                        : 'bg-[#27ae60]'
                      : 'bg-[#2a2a2a]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Shields */}
          <div className="flex items-center gap-2 bg-black/70 px-3 py-2 rounded border border-[#3498db]/50">
            <span className="text-[#3498db] font-bold text-xs">SHIELDS</span>
            <div className="flex gap-1">
              {Array.from({ length: playerShip.maxShieldLayers }).map((_, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-full border-2 ${
                    i < playerShip.shieldLayers
                      ? 'bg-[#3498db] border-[#5dade2]'
                      : 'bg-transparent border-[#3a3a4a]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="flex items-center gap-4 bg-black/70 px-3 py-2 rounded">
            <div className="flex items-center gap-1">
              <span className="text-[#1abc9c] text-[10px] font-bold">SCRAP</span>
              <span className="text-white font-bold">{scrap}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#e67e22] text-[10px] font-bold">MISSILES</span>
              <span className="text-white font-bold">{missiles}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#f1c40f] text-[10px] font-bold">FUEL</span>
              <span className="text-white font-bold">{fuel}</span>
            </div>
          </div>
        </div>

        {/* Center: FTL Drive + Ship */}
        <div className="flex items-center gap-2">
          <div className="bg-black/70 px-4 py-2 rounded flex items-center gap-3 border border-[#3498db]/30">
            <span className="text-[#8a8a8a] text-xs">FTL Drive</span>
            <span className="text-[#3498db] text-sm font-bold">READY!</span>
          </div>
          <button className="bg-[#27ae60] hover:bg-[#2ecc71] px-5 py-2 rounded text-white font-bold text-sm transition-colors">
            JUMP
          </button>
          <button className="bg-[#3a3a4a] hover:bg-[#4a4a5a] px-4 py-2 rounded text-white font-bold text-sm transition-colors border border-[#5a5a5a]">
            SHIP
          </button>
        </div>

        {/* Right: Pause */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePause}
            className={`px-5 py-2 rounded font-bold text-sm transition-colors ${
              paused
                ? 'bg-[#27ae60] text-white'
                : 'bg-[#3a3a4a] hover:bg-[#4a4a5a] text-white border border-[#5a5a5a]'
            }`}
          >
            {paused ? 'RESUME' : 'PAUSE'}
          </button>
          <span className="text-[#5a5a5a] text-xs">[SPACE]</span>
        </div>
      </div>

      {/* ===== LEFT SIDE: Crew + Stats ===== */}
      <div className="absolute top-20 left-3 flex flex-col gap-2 pointer-events-auto">
        {/* Evade & Oxygen */}
        <div className="bg-black/70 rounded px-3 py-2 space-y-1 border border-[#3a3a3a]">
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="text-[#f39c12] font-bold">EVADE</span>
            <span className="text-[#f39c12]">{playerShip.evasion}%</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="text-[#1abc9c] font-bold">OXYGEN</span>
            <span className="text-[#1abc9c]">100%</span>
          </div>
        </div>

        {/* Crew List */}
        <div className="bg-black/70 rounded p-2 space-y-1 border border-[#3a3a3a]">
          {playerShip.crew.filter(c => c.isPlayer).map(crew => {
            const isSelected = selectedCrewId === crew.id;
            const healthPercent = (crew.health / crew.maxHealth) * 100;
            
            return (
              <button
                key={crew.id}
                onClick={() => selectCrew(isSelected ? null : crew.id)}
                className={`w-full flex items-center gap-2 p-1.5 rounded transition-colors ${
                  isSelected ? 'bg-[#f1c40f]/20 border border-[#f1c40f]' : 'hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white ${
                  crew.isPlayer ? 'bg-[#27ae60]' : 'bg-[#c0392b]'
                }`}>
                  {crew.name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white text-xs font-bold">{crew.name}</div>
                  <div className="w-full h-2 bg-[#1a1a1a] rounded mt-0.5">
                    <div
                      className={`h-full rounded ${
                        healthPercent < 30 ? 'bg-[#c0392b]' : healthPercent < 60 ? 'bg-[#f39c12]' : 'bg-[#27ae60]'
                      }`}
                      style={{ width: `${healthPercent}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
          <button
            onClick={cycleCrewSelection}
            className="w-full mt-1 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded px-3 py-1.5 text-xs text-[#8a8a8a] font-bold transition-colors"
          >
            CYCLE [TAB]
          </button>
        </div>
      </div>

      {/* ===== RIGHT SIDE: Target Panel ===== */}
      <div className="absolute top-20 right-3 w-52 pointer-events-auto">
        <div className="bg-[#1a0808]/90 rounded border-2 border-[#5a2020]">
          <div className="bg-[#3a1010] px-3 py-2 rounded-t border-b border-[#5a2020]">
            <span className="text-[#ff6b6b] font-bold text-sm tracking-wider">TARGET</span>
          </div>

          {enemyShip ? (
            <div className="p-3 space-y-3">
              {/* Hull */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#27ae60] text-[10px] font-bold">HULL</span>
                </div>
                <div className="h-3 bg-[#1a1a1a] rounded overflow-hidden border border-[#2a2a2a]">
                  <div
                    className="h-full bg-[#27ae60]"
                    style={{ width: `${(enemyShip.hull / enemyShip.maxHull) * 100}%` }}
                  />
                </div>
              </div>

              {/* Shields */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#3498db] text-[10px] font-bold">SHIELDS</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: enemyShip.maxShieldLayers }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border-2 ${
                        i < enemyShip.shieldLayers
                          ? 'bg-[#3498db] border-[#5dade2]'
                          : 'bg-transparent border-[#3a3a4a]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="text-xs text-[#8a8a8a] pt-2 border-t border-[#3a1515]">
                <div>Class: <span className="text-[#ecf0f1]">{enemyShip.name}</span></div>
                <div>Status: <span className="text-[#ff6b6b]">Hostile</span></div>
              </div>

              {/* System icons */}
              <div className="flex justify-center gap-2 pt-2">
                {(['shields', 'weapons', 'engines', 'piloting'] as SystemType[]).map(sysKey => {
                  const system = enemyShip.systems[sysKey];
                  const healthPercent = system.health / system.maxHealth;
                  const color = SYSTEM_COLORS[sysKey];
                  
                  return (
                    <div
                      key={sysKey}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white border-2"
                      style={{
                        backgroundColor: healthPercent > 0.5 ? `${color}44` : healthPercent > 0 ? '#c0392b44' : '#4a4a4a44',
                        borderColor: healthPercent > 0.5 ? color : healthPercent > 0 ? '#c0392b' : '#4a4a4a',
                      }}
                      title={SYSTEM_NAMES[sysKey]}
                    >
                      {sysKey.charAt(0).toUpperCase()}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-[#4a4a4a] text-sm">No target</div>
          )}
        </div>
      </div>

      {/* ===== BOTTOM BAR: Systems + Weapons ===== */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
        <div className="flex items-end justify-between p-3 gap-4">
          
          {/* LEFT: Reactor Power Bar (vertical) */}
          <div className="flex items-end gap-3">
            <div className="flex flex-col-reverse gap-[2px] bg-black/70 p-2 rounded border border-[#3a3a3a]">
              {Array.from({ length: playerShip.reactor }).map((_, i) => {
                const remainingPower = playerShip.reactor - playerShip.powerUsed;
                return (
                  <div
                    key={i}
                    className={`w-4 h-3 rounded-sm ${
                      i < remainingPower ? 'bg-[#f1c40f]' : 'bg-[#2a2a2a]'
                    }`}
                  />
                );
              })}
            </div>

            {/* System Icons - FTL style horizontal */}
            <div className="flex gap-2">
              {(['shields', 'weapons', 'engines', 'piloting'] as SystemType[]).map(sysType => {
                const system = playerShip.systems[sysType];
                const color = SYSTEM_COLORS[sysType];
                const maxPower = Math.min(system.powerMax, system.health);
                const isHovered = hoveredSystem === sysType;

                const handleAddPower = () => {
                  if (system.powerCurrent < maxPower) {
                    setPowerLevel(sysType, system.powerCurrent + 1);
                  }
                };

                const handleRemovePower = (e: React.MouseEvent) => {
                  e.preventDefault(); // Prevent context menu
                  if (system.powerCurrent > 0) {
                    setPowerLevel(sysType, system.powerCurrent - 1);
                  }
                };

                const handleSetPower = (level: number) => {
                  const clampedLevel = Math.min(level, maxPower);
                  setPowerLevel(sysType, clampedLevel);
                };

                return (
                  <div 
                    key={sysType} 
                    className="flex flex-col items-center gap-1 relative"
                    onMouseEnter={() => setHoveredSystem(sysType)}
                    onMouseLeave={() => setHoveredSystem(null)}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-2 px-2 py-1 bg-black/90 rounded text-white text-xs whitespace-nowrap border border-[#4a4a4a] z-20">
                        {SYSTEM_NAMES[sysType]} ({system.powerCurrent}/{maxPower})
                        {system.manned && <span className="text-[#f1c40f] ml-1">(Manned)</span>}
                      </div>
                    )}

                    {/* Large circular icon */}
                    <button
                      onClick={handleAddPower}
                      onContextMenu={handleRemovePower}
                      className="relative w-14 h-14 rounded-full border-4 transition-all hover:scale-105 cursor-pointer"
                      style={{
                        borderColor: system.health === 0 ? '#c0392b' : color,
                        backgroundColor: system.powerCurrent > 0 ? `${color}33` : '#1a1a1a',
                        boxShadow: system.powerCurrent > 0 ? `0 0 15px ${color}44` : 'none',
                      }}
                    >
                      {/* System icon */}
                      <SystemIcon type={sysType} color={system.powerCurrent > 0 ? '#fff' : '#5a5a5a'} />
                      
                      {/* Damage indicator */}
                      {system.health < system.maxHealth && system.health > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#c0392b] rounded-full flex items-center justify-center animate-pulse">
                          <span className="text-white text-[8px] font-bold">!</span>
                        </div>
                      )}
                      
                      {/* Manning indicator */}
                      {system.manned && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#f1c40f] rounded-full" />
                      )}
                    </button>

                    {/* Power bars below icon - clickable */}
                    <div className="flex gap-[2px]">
                      {Array.from({ length: system.powerMax }).map((_, i) => {
                        const barLevel = i + 1;
                        const isDamaged = i >= system.health;
                        const isPowered = i < system.powerCurrent;
                        
                        return (
                          <button
                            key={i}
                            onClick={() => handleSetPower(barLevel)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              // Right click on bar sets power to level below this bar
                              handleSetPower(i);
                            }}
                            disabled={isDamaged}
                            className={`w-3 h-4 rounded-sm transition-all ${isDamaged ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                            style={{
                              backgroundColor: isDamaged 
                                ? '#4a2020' 
                                : isPowered 
                                ? color 
                                : '#2a2a2a',
                              boxShadow: isPowered && !isDamaged
                                ? `0 0 4px ${color}` 
                                : 'none',
                            }}
                            title={isDamaged ? 'Damaged' : `Set power to ${barLevel}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CENTER: Weapons Panel */}
          <div className="flex-1 flex justify-center">
            <div className="bg-black/70 rounded border border-[#3a3a3a] p-3">
              <div className="flex items-center gap-3">
                <span className="text-[#c0392b] text-xs font-bold tracking-wider">WEAPONS</span>
                
                {playerShip.weapons.map((weapon, idx) => {
                  const chargePercent = getChargePercent(weapon);
                  const isCharged = chargePercent >= 100;
                  const canFire = canFireWeapon(weapon, missiles);
                  const isTargeting = targetingWeaponId === weapon.id;
                  const hasTarget = weapon.targetRoom !== null;

                  // Handle clicking on the weapon card itself
                  const handleWeaponClick = (e: React.MouseEvent) => {
                    // Don't trigger if clicking on buttons inside
                    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
                    if (!weapon.powered) return;
                    startTargeting(weapon.id);
                  };

                  return (
                    <div
                      key={weapon.id}
                      onClick={handleWeaponClick}
                      className={`bg-[#1a1a1a] rounded border-2 p-2 min-w-[100px] transition-all cursor-pointer ${
                        isTargeting
                          ? 'border-[#f1c40f] shadow-[0_0_10px_rgba(241,196,15,0.3)]'
                          : weapon.powered && isCharged
                          ? 'border-[#27ae60] hover:border-[#2ecc71]'
                          : weapon.powered
                          ? 'border-[#3a3a3a] hover:border-[#5a5a5a]'
                          : 'border-[#2a2a2a]'
                      }`}
                    >
                      {/* Weapon name and hotkey */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-xs font-bold truncate">{weapon.name}</span>
                        <span className="text-[#5a5a5a] text-[10px]">[{idx + 1}]</span>
                      </div>

                      {/* Power bars */}
                      <div className="flex gap-[2px] mb-2">
                        {Array.from({ length: weapon.powerRequired }).map((_, i) => {
                          const isPowered = i < weapon.currentPower;
                          return (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Click toggles power up to this bar
                                const newPower = isPowered && weapon.currentPower === i + 1 
                                  ? i // Remove this bar (set to level below)
                                  : i + 1; // Set power to this level
                                setWeaponPower(weapon.id, newPower);
                              }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Right click sets power to level below this bar
                                setWeaponPower(weapon.id, i);
                              }}
                              className={`flex-1 h-4 rounded-sm transition-all cursor-pointer hover:opacity-80 ${
                                isPowered ? 'bg-[#c0392b]' : 'bg-[#2a2a2a]'
                              }`}
                              style={{
                                boxShadow: isPowered ? '0 0 4px #c0392b' : 'none',
                              }}
                            />
                          );
                        })}
                      </div>

                      {/* Charge bar */}
                      <div className="h-2 bg-[#0a0a0a] rounded mb-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${isCharged ? 'bg-[#27ae60]' : 'bg-[#3498db]'}`}
                          style={{ width: weapon.powered ? `${chargePercent}%` : '0%' }}
                        />
                      </div>

                      {/* Status/Action text */}
                      <div className="text-center">
                        {isTargeting ? (
                          <span className="text-[10px] text-[#f1c40f] font-bold animate-pulse">SELECT TARGET</span>
                        ) : !weapon.powered ? (
                          <span className="text-[10px] text-[#5a5a5a]">UNPOWERED</span>
                        ) : !hasTarget ? (
                          <span className="text-[10px] text-[#3498db]">NO TARGET</span>
                        ) : isCharged ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (canFire) fireWeapon(weapon.id);
                            }}
                            className="text-[10px] text-[#c0392b] font-bold hover:text-[#e74c3c]"
                          >
                            FIRE!
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#5a5a5a]">{Math.floor(chargePercent)}%</span>
                        )}
                      </div>

                      {/* Target info */}
                      {hasTarget && (
                        <div className="mt-1 text-center text-[9px] text-[#e74c3c] uppercase">
                          {enemyShip?.rooms.find(r => r.id === weapon.targetRoom)?.type}
                        </div>
                      )}
                      {weapon.missilesCost > 0 && (
                        <div className="text-center text-[9px] text-[#e67e22]">
                          {weapon.missilesCost} missile
                        </div>
                      )}
                    </div>
                  );
                })}

                <button 
                  onClick={toggleAutofire}
                  className={`px-4 py-3 rounded text-xs font-bold border transition-all ${
                    autofire
                      ? 'bg-[#27ae60] text-white border-[#2ecc71] shadow-[0_0_10px_rgba(46,204,113,0.3)]'
                      : 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#8a8a8a] border-[#3a3a3a]'
                  }`}
                >
                  AUTOFIRE
                  <div className={`text-[9px] mt-1 ${autofire ? 'text-white' : 'text-[#5a5a5a]'}`}>
                    {autofire ? 'ON' : 'OFF'}
                  </div>
                </button>
              </div>

            </div>
          </div>

          {/* RIGHT: Subsystems */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[#5a5a5a] text-[10px] font-bold">SUBSYSTEMS</span>
            <div className="flex gap-1">
              {['PL', 'SN', 'DR'].map(sys => (
                <div
                  key={sys}
                  className="w-10 h-10 bg-[#1a1a1a] rounded-full border-2 border-[#2a2a2a] flex items-center justify-center text-xs text-[#4a4a4a] font-bold"
                >
                  {sys}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM: Controls hint ===== */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-4 text-[9px] text-[#3a3a4a] pointer-events-none">
        <span><kbd className="text-[#5a5a5a]">SPACE</kbd> Pause</span>
        <span><kbd className="text-[#5a5a5a]">TAB</kbd> Cycle Crew</span>
        <span><kbd className="text-[#5a5a5a]">1-4</kbd> Fire Weapons</span>
        <span><kbd className="text-[#5a5a5a]">CLICK</kbd> Select/Move/Target</span>
      </div>

      {/* ===== PAUSE OVERLAY ===== */}
      {paused && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-[#f1c40f] text-5xl font-bold mb-2">PAUSED</div>
            <div className="text-[#8a8a8a] text-lg">Press SPACE to resume</div>
          </div>
        </div>
      )}
    </div>
  );
}

// System icon SVG components
function SystemIcon({ type, color }: { type: SystemType; color: string }) {
  const size = 28;
  
  switch (type) {
    case 'shields':
      return (
        <svg className="absolute inset-0 m-auto" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
        </svg>
      );
    case 'weapons':
      return (
        <svg className="absolute inset-0 m-auto" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="3" x2="12" y2="8" />
          <line x1="12" y1="16" x2="12" y2="21" />
          <line x1="3" y1="12" x2="8" y2="12" />
          <line x1="16" y1="12" x2="21" y2="12" />
          <circle cx="12" cy="12" r="2" fill={color} />
        </svg>
      );
    case 'engines':
      return (
        <svg className="absolute inset-0 m-auto" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M6 4h12l-2 8h-8L6 4z" />
          <path d="M8 12v4M12 12v6M16 12v4" />
          <path d="M7 20h10" />
        </svg>
      );
    case 'piloting':
      return (
        <svg className="absolute inset-0 m-auto" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2" fill={color} />
          <line x1="12" y1="4" x2="12" y2="8" />
          <line x1="12" y1="16" x2="12" y2="20" />
          <line x1="4" y1="12" x2="8" y2="12" />
          <line x1="16" y1="12" x2="20" y2="12" />
        </svg>
      );
  }
}

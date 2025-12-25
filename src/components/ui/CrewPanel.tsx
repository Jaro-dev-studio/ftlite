'use client';

// FTL-style crew panel (left sidebar)

import React from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Crew } from '@/utils/types';

interface CrewRowProps {
  crew: Crew;
}

function CrewRow({ crew }: CrewRowProps) {
  const { selectCrew, selectedCrewId, playerShip } = useGameStore();

  const isSelected = selectedCrewId === crew.id;
  const healthPercent = (crew.health / crew.maxHealth) * 100;
  const room = playerShip.rooms.find(r => r.id === crew.currentRoom);
  const roomName = room?.type || 'Unknown';

  const isCritical = healthPercent < 30;
  const isDamaged = healthPercent < 60 && !isCritical;

  return (
    <button
      onClick={() => selectCrew(isSelected ? null : crew.id)}
      className={`crew-item w-full ${isSelected ? 'selected' : ''}`}
    >
      {/* Crew Icon */}
      <div
        className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
          crew.isPlayer ? 'bg-[#27ae60]' : 'bg-[#c0392b]'
        }`}
        style={{
          boxShadow: isSelected ? '0 0 8px rgba(241, 196, 15, 0.5)' : 'none',
        }}
      >
        {crew.name.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        {/* Crew Name */}
        <div className="flex items-center justify-between">
          <span className="text-[#ecf0f1] text-xs font-bold truncate">
            {crew.name}
          </span>
        </div>

        {/* Health Bar */}
        <div className="crew-health-bar mt-1">
          <div
            className={`crew-health-fill ${isCritical ? 'critical' : isDamaged ? 'damaged' : ''}`}
            style={{ width: `${healthPercent}%` }}
          />
        </div>
      </div>
    </button>
  );
}

export function CrewPanel() {
  const { playerShip, selectedCrewId, cycleCrewSelection } = useGameStore();

  const playerCrew = playerShip.crew.filter(c => c.isPlayer);

  return (
    <div className="w-44">
      {/* Crew List */}
      <div className="space-y-1">
        {playerCrew.map(crew => (
          <CrewRow key={crew.id} crew={crew} />
        ))}
      </div>

      {/* Selection Hint */}
      {selectedCrewId && (
        <div className="mt-2 px-2 py-1 bg-[#1a1a1a] rounded text-[9px] text-[#f1c40f] text-center">
          Click room to move crew
        </div>
      )}

      {/* Cycle Button */}
      <button
        onClick={cycleCrewSelection}
        className="mt-2 w-full ftl-button text-[9px] py-1"
      >
        CYCLE [TAB]
      </button>
    </div>
  );
}

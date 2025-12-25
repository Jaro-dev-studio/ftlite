'use client';

// Crew panel showing crew list and status

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

  return (
    <button
      onClick={() => selectCrew(isSelected ? null : crew.id)}
      className={`w-full text-left p-2 rounded transition-colors ${
        isSelected
          ? 'bg-yellow-900/50 border border-yellow-600'
          : 'bg-gray-700/50 hover:bg-gray-700 border border-transparent'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Crew icon */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              crew.isPlayer ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {crew.name.charAt(0)}
          </div>
          
          <div>
            <div className="text-white text-sm font-medium">{crew.name}</div>
            <div className="text-gray-400 text-xs capitalize">
              {roomName} - {crew.task}
            </div>
          </div>
        </div>

        {/* Health bar */}
        <div className="flex flex-col items-end">
          <div className="w-16 h-2 bg-gray-700 rounded overflow-hidden">
            <div
              className={`h-full ${
                healthPercent > 50 ? 'bg-green-500' : healthPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 mt-0.5">
            {Math.ceil(crew.health)}/{crew.maxHealth}
          </span>
        </div>
      </div>
    </button>
  );
}

export function CrewPanel() {
  const { playerShip, selectedCrewId, cycleCrewSelection } = useGameStore();

  const playerCrew = playerShip.crew.filter(c => c.isPlayer);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold text-sm">CREW</h3>
        <button
          onClick={cycleCrewSelection}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          Cycle (Tab)
        </button>
      </div>

      <div className="space-y-1">
        {playerCrew.map(crew => (
          <CrewRow key={crew.id} crew={crew} />
        ))}
      </div>

      {selectedCrewId && (
        <div className="mt-2 p-2 bg-gray-700/50 rounded text-xs text-gray-300">
          Click a room to move selected crew member
        </div>
      )}
    </div>
  );
}

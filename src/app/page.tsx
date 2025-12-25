'use client';

// Main menu page

import React from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      {/* Starfield background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-bold text-white mb-2">
          STARSHIP
        </h1>
        <h2 className="text-2xl text-blue-400 mb-8">
          Roguelike Combat
        </h2>

        <p className="text-gray-400 max-w-md mx-auto mb-12">
          Command your starship in tactical real-time combat. Manage power systems,
          direct your crew, and destroy the enemy before they destroy you.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/game')}
            className="block w-64 mx-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold rounded-lg transition-all hover:scale-105"
          >
            Start Game
          </button>

          <button
            disabled
            className="block w-64 mx-auto px-8 py-4 bg-gray-700 text-gray-500 text-xl font-bold rounded-lg cursor-not-allowed"
          >
            Continue (Coming Soon)
          </button>
        </div>

        {/* Game features */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl mb-2">&#9889;</div>
            <h3 className="text-white font-bold mb-1">Power Systems</h3>
            <p className="text-gray-500 text-sm">
              Allocate reactor power between shields, weapons, and engines
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">&#128100;</div>
            <h3 className="text-white font-bold mb-1">Crew Management</h3>
            <p className="text-gray-500 text-sm">
              Command your crew to man stations and repair damage
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">&#128296;</div>
            <h3 className="text-white font-bold mb-1">Tactical Combat</h3>
            <p className="text-gray-500 text-sm">
              Target enemy systems with lasers and missiles
            </p>
          </div>
        </div>

        {/* Controls reminder */}
        <div className="mt-12 text-gray-600 text-sm">
          <p>Controls: Space to pause | Tab to cycle crew | 1-4 for weapons | Click to interact</p>
        </div>
      </div>

      <style jsx>{`
        .stars {
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
        }
        .stars::before,
        .stars::after {
          content: '';
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          box-shadow:
            100px 50px white,
            200px 150px white,
            300px 100px white,
            400px 200px white,
            500px 50px white,
            600px 180px white,
            700px 80px white,
            800px 220px white,
            150px 300px white,
            250px 400px white,
            350px 350px white,
            450px 450px white,
            550px 320px white,
            650px 420px white,
            750px 380px white,
            50px 480px white,
            180px 520px white,
            320px 560px white,
            480px 500px white,
            620px 540px white,
            780px 580px white,
            90px 620px white,
            230px 680px white,
            380px 640px white,
            520px 700px white,
            670px 660px white,
            820px 720px white;
          animation: twinkle 4s infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

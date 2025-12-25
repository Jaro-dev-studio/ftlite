# Starship Roguelike

An FTL-style spaceship combat roguelike game built with Next.js, TypeScript, and HTML5 Canvas.

## Features

- **Real-time Combat with Pause**: Space bar to pause/unpause, plan your strategy
- **Power Management**: Allocate reactor power between shields, weapons, engines, and piloting
- **Crew Management**: Select and move crew members to man stations and repair systems
- **Weapon Targeting**: Target specific enemy rooms with lasers and missiles
- **Shield System**: Shields block laser damage and recharge over time
- **Evasion System**: Engine power increases dodge chance for incoming fire

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Game Rendering**: HTML5 Canvas (vanilla)
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

## Controls

| Key/Action | Description |
|------------|-------------|
| **Space** | Pause/Unpause game |
| **Tab** | Cycle crew selection |
| **1-4** | Fire weapons (when charged and targeted) |
| **Click canvas** | Select crew / Move crew to room |
| **Click enemy room** | Set weapon target (when in targeting mode) |
| **Escape** | Cancel targeting |

## Game Mechanics

### Power Systems

- **Reactor**: Provides total power (8 bars for player)
- **Shields**: Each power bar = 1 shield layer (blocks 1 damage)
- **Weapons**: Powers weapon charging
- **Engines**: Each power bar = +5% evasion
- **Piloting**: Required for any evasion; manned bonus +5%

### Weapons

| Weapon | Damage | Charge Time | Notes |
|--------|--------|-------------|-------|
| Burst Laser | 1 | 10s | Blocked by shields |
| Artemis Missile | 2 | 15s | Ignores shields, uses 1 missile |

### Combat

1. Click a weapon's "Target" button to enter targeting mode
2. Click an enemy room to set the target
3. Wait for the weapon to charge (progress bar)
4. Click "FIRE" or press the weapon hotkey (1-4)
5. Projectile fires; enemy can evade if they have engine power

### Crew

- Crew in system rooms provide "manned" bonus (+5% evasion for engines/piloting)
- Click a crew member to select them
- Click a room on your ship to move them there
- Crew use A* pathfinding through doors

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── page.tsx           # Main menu
│   └── game/page.tsx      # Game screen
├── components/
│   ├── canvas/            # Canvas rendering
│   │   ├── GameCanvas.tsx
│   │   ├── ShipRenderer.ts
│   │   └── CombatRenderer.ts
│   └── ui/                # React UI components
│       ├── TopBar.tsx
│       ├── SystemsPanel.tsx
│       ├── WeaponsPanel.tsx
│       ├── CrewPanel.tsx
│       └── GameOverScreen.tsx
├── game/
│   ├── crew/
│   │   └── Pathfinding.ts # A* pathfinding
│   └── data/
│       ├── ships.ts       # Ship definitions
│       └── weapons.ts     # Weapon definitions
├── stores/
│   └── gameStore.ts       # Zustand game state
├── hooks/
│   └── useKeyboard.ts     # Keyboard controls
└── utils/
    ├── types.ts           # TypeScript interfaces
    ├── constants.ts       # Game balance values
    └── helpers.ts         # Utility functions
```

## Future Features (Post-MVP)

- Sector map with multiple nodes
- Events and choices
- Shop and upgrades
- Multiple ship layouts
- Drones system
- Teleporter and hacking
- Fire and breach mechanics
- Crew skill leveling
- Save/load functionality
- Sound effects

## License

MIT

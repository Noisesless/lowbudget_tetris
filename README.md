# Tetris Game

A modern, visually stunning Tetris game built with Taro 4.x, React 18, and TypeScript. Features a dark arcade-style UI with realistic 3D block effects and smooth gameplay.

## Features

- **Classic Tetris Gameplay**: All 7 standard tetrominoes (I, J, L, O, S, T, Z)
- **Level System**: Speed increases every 10 lines cleared (Level 1-20+)
- **Scoring System**:
  - 1 line = 100 points x level
  - 2 lines = 300 points x level
  - 3 lines = 500 points x level
  - 4 lines = 800 points x level
- **3D Block Effects**: Realistic blocks with highlights, shadows, and neon glow
- **Next Piece Preview**: See what's coming next
- **Level Progress Bar**: Visual indicator of progress to next level
- **Multiple Controls**: Keyboard, mouse, and touch support
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Taro | 4.1.9 | Cross-platform framework |
| React | 18.0.0 | UI library |
| TypeScript | 5.1.0 | Type safety |
| SCSS | - | CSS Modules with variables |
| Zustand | 4.5.0 | State management (available) |

## Project Structure

```
tetris_test/
├── config/                    # Build configuration
│   ├── dev.ts                 # Development config
│   ├── index.ts               # Shared config
│   └── prod.ts                # Production config
├── src/
│   ├── hooks/
│   │   └── useTetris.ts       # Custom game logic hook
│   ├── pages/
│   │   └── index/
│   │       ├── index.tsx      # Main game component
│   │       ├── index.module.scss
│   │       └── index.config.ts
│   ├── styles/
│   │   ├── theme.scss         # Color variables & Tetris block colors
│   │   └── variables.scss     # Global SCSS variables & mixins
│   ├── types/
│   │   └── tetris.ts          # TypeScript interfaces & game config
│   ├── app.tsx                # App entry
│   ├── app.config.ts          # App configuration
│   ├── app.scss               # Global styles
│   └── index.html             # HTML template
├── package.json
└── tsconfig.json
```

## Game Mechanics

### Tetromino Shapes

| Shape | Name | Color | Description |
|-------|------|-------|-------------|
| I | I-piece | Cyan | Straight line (4 blocks) |
| J | J-piece | Blue | L-shape (3 blocks) |
| L | L-piece | Orange | Reverse L-shape (3 blocks) |
| O | O-piece | Yellow | Square (2x2 blocks) |
| S | S-piece | Green | S-shape (4 blocks) |
| T | T-piece | Purple | T-shape (4 blocks) |
| Z | Z-piece | Red | Z-shape (4 blocks) |

### Controls

| Input | Action |
|-------|--------|
| Arrow Left / A | Move piece left |
| Arrow Right / D | Move piece right |
| Arrow Down / S | Soft drop (move down faster) |
| Arrow Up / W | Rotate piece clockwise |
| Space | Hard drop (instant drop) |
| P / Escape | Pause/Resume game |

### Game Rules

1. Pieces fall from the top of the board
2. Complete horizontal lines are cleared
3. Clearing 10 lines advances to the next level
4. Each level increases the falling speed
5. Game ends when pieces stack to the top
6. Score is multiplied by the current level

### Speed Progression

| Level | Speed (ms per drop) |
|-------|---------------------|
| 1 | 800ms |
| 5 | ~387ms |
| 10 | ~147ms |
| 15 | ~71ms |
| 20+ | 100ms (max speed) |

Speed decreases by 15% per level using the formula:
```
speed = max(100, 800 * 0.85^(level - 1))
```

## Development

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
# Development mode with hot reload (H5)
npm run dev:h5

# Development mode (WeChat Mini Program)
npm run dev:weapp

# Development mode (Alipay)
npm run dev:alipay

# Development mode (ByteDance)
npm run dev:tt
```

### Build

```bash
# Build for production (H5)
npm run build:h5

# Build for production (WeChat Mini Program)
npm run build:weapp

# Build for other platforms
npm run build:alipay    # Alipay
npm run build:swan      # Baidu
npm run build:tt        # ByteDance
npm run build:rn        # React Native
```

### Linting

```bash
npm run lint        # ESLint
npm run stylelint   # StyleLint
```

## Architecture

### Game Loop

The game uses `requestAnimationFrame` for smooth rendering:

1. Track time since last drop
2. When time exceeds current speed, move piece down
3. Check for collisions
4. Lock piece and clear lines if stuck
5. Spawn new piece

### State Management

Game state is managed through React hooks:

```typescript
interface GameState {
  board: (TetrominoType | null)[][];   // 10x20 grid
  currentPiece: Tetromino | null;      // Active falling piece
  nextPiece: TetrominoType;            // Next piece preview
  score: number;                       // Current score
  level: number;                       // Current level
  lines: number;                       // Total lines cleared
  isPlaying: boolean;                  // Game in progress
  isPaused: boolean;                   // Game paused
  isGameOver: boolean;                 // Game over
}
```

### Rotation System

Uses a simple wall kick system:
1. Try current position
2. Try shifting left/right by 1-2 units
3. If no valid position, rotation fails

## Visual Design

### Color Palette

| Element | Color |
|---------|-------|
| Background | `#0a0a1a` - `#1a1a2e` gradient |
| I-piece | Cyan `#00e5ff` |
| J-piece | Blue `#448aff` |
| L-piece | Orange `#ffab40` |
| O-piece | Yellow `#ffff00` |
| S-piece | Green `#69f0ae` |
| T-piece | Purple `#ea80fc` |
| Z-piece | Red `#ff5252` |

### 3D Block Effect

Each block uses CSS pseudo-elements for a 3D appearance:
- `::before`: Top highlight (white gradient)
- `::after`: Bottom shadow (black gradient)
- Box shadow: Colored neon glow

## Troubleshooting

### Common Issues

1. **Modules not found**: Run `npm install`
2. **Port already in use**: Kill the process on the port or wait
3. **TypeScript errors**: Check `tsconfig.json` settings
4. **SCSS variable not defined**: Ensure `@use '@/styles/variables.scss' as *;` is at the top of SCSS files

### Build Errors

If you encounter webpack or Taro CLI errors:
```bash
rm -rf node_modules
npm install
```

## Future Enhancements

- [ ] Ghost piece (shadow showing where piece will land)
- [ ] Hold piece feature
- [ ] High score leaderboard (local storage)
- [ ] Sound effects
- [ ] Animations for line clears
- [ ] Difficulty presets (easy, medium, hard)
- [ ] Time attack mode
- [ ] Multiplayer mode

## License

Private project - Built with Taro Template

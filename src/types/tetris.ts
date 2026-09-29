// Tetris 方块类型定义

// 7种标准 Tetromino
export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

// 方块在网格中的位置
export interface Position {
  x: number;
  y: number;
}

// 方块形状定义 (4个旋转状态)
export interface Tetromino {
  type: TetrominoType;
  shape: number[][][]; // [rotation][row][col]
  position: Position;
  rotation: number; // current rotation state (0-3)
}

// 游戏状态
export interface GameState {
  board: (TetrominoType | null)[][];
  currentPiece: Tetromino | null;
  nextPiece: TetrominoType;
  score: number;
  level: number;
  lines: number;
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
}

// 方块颜色配置
export interface TetrominoColors {
  top: string;
  main: string;
  bottom: string;
  glow: string;
}

// 方块颜色映射
export const TETROMINO_COLORS: Record<TetrominoType, TetrominoColors> = {
  I: {
    top: '#00e5ff',
    main: '#00b8d4',
    bottom: '#00838f',
    glow: 'rgba(0, 229, 255, 0.4)',
  },
  J: {
    top: '#448aff',
    main: '#2962ff',
    bottom: '#002984',
    glow: 'rgba(68, 138, 255, 0.4)',
  },
  L: {
    top: '#ffab40',
    main: '#ff9100',
    bottom: '#e65100',
    glow: 'rgba(255, 171, 64, 0.4)',
  },
  O: {
    top: '#ffff00',
    main: '#ffea00',
    bottom: '#ffd600',
    glow: 'rgba(255, 234, 0, 0.4)',
  },
  S: {
    top: '#69f0ae',
    main: '#00e676',
    bottom: '#00c853',
    glow: 'rgba(105, 240, 174, 0.4)',
  },
  T: {
    top: '#ea80fc',
    main: '#d500f9',
    bottom: '#aa00ff',
    glow: 'rgba(234, 128, 252, 0.4)',
  },
  Z: {
    top: '#ff5252',
    main: '#ff1744',
    bottom: '#d50000',
    glow: 'rgba(255, 82, 82, 0.4)',
  },
};

// 标准 Tetromino 形状定义
export const TETROMINO_SHAPES: Record<TetrominoType, number[][][]> = {
  I: [
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
    [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
    [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]],
  ],
  J: [
    [[1,0,0], [1,1,1], [0,0,0]],
    [[0,1,1], [0,1,0], [0,1,0]],
    [[0,0,0], [1,1,1], [0,0,1]],
    [[0,1,0], [0,1,0], [1,1,0]],
  ],
  L: [
    [[0,0,1], [1,1,1], [0,0,0]],
    [[0,1,0], [0,1,0], [0,1,1]],
    [[0,0,0], [1,1,1], [1,0,0]],
    [[1,1,0], [0,1,0], [0,1,0]],
  ],
  O: [
    [[1,1], [1,1]],
    [[1,1], [1,1]],
    [[1,1], [1,1]],
    [[1,1], [1,1]],
  ],
  S: [
    [[0,1,1], [1,1,0], [0,0,0]],
    [[0,1,0], [0,1,1], [0,0,1]],
    [[0,0,0], [0,1,1], [1,1,0]],
    [[1,0,0], [1,1,0], [0,1,0]],
  ],
  T: [
    [[0,1,0], [1,1,1], [0,0,0]],
    [[0,1,0], [0,1,1], [0,1,0]],
    [[0,0,0], [1,1,1], [0,1,0]],
    [[0,1,0], [1,1,0], [0,1,0]],
  ],
  Z: [
    [[1,1,0], [0,1,1], [0,0,0]],
    [[0,0,1], [0,1,1], [0,1,0]],
    [[0,0,0], [1,1,0], [0,1,1]],
    [[0,1,0], [1,1,0], [1,0,0]],
  ],
};

// 游戏配置
export const GAME_CONFIG = {
  BOARD_WIDTH: 10,
  BOARD_HEIGHT: 20,
  INITIAL_SPEED: 800,     // 初始下落速度 (ms)
  MIN_SPEED: 100,         // 最快速度
  SPEED_FACTOR: 0.85,     // 每级速度系数
  POINTS: {
    1: 100,
    2: 300,
    3: 500,
    4: 800,
  },
} as const;

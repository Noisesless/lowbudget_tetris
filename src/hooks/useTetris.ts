import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GAME_CONFIG,
  TETROMINO_SHAPES,
  type GameState,
  type TetrominoType,
  type Position,
  type Tetromino,
} from '@/types/tetris';

// Generate random piece type
function randomPiece(): TetrominoType {
  const pieces: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  return pieces[Math.floor(Math.random() * pieces.length)];
}

// Create new piece
function createPiece(type: TetrominoType): Tetromino {
  return {
    type,
    shape: TETROMINO_SHAPES[type],
    position: {
      x: Math.floor(GAME_CONFIG.BOARD_WIDTH / 2) - Math.ceil(TETROMINO_SHAPES[type][0][0].length / 2),
      y: 0,
    },
    rotation: 0,
  };
}

// Create empty board
function createBoard(): (TetrominoType | null)[][] {
  return Array.from({ length: GAME_CONFIG.BOARD_HEIGHT }, () =>
    Array(GAME_CONFIG.BOARD_WIDTH).fill(null)
  );
}

// Check collision
function checkCollision(
  board: (TetrominoType | null)[][],
  piece: Tetromino,
  rotation: number,
  offsetX: number,
  offsetY: number
): boolean {
  const shape = piece.shape[rotation];
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newX = piece.position.x + col + offsetX;
        const newY = piece.position.y + row + offsetY;

        if (newX < 0 || newX >= GAME_CONFIG.BOARD_WIDTH || newY >= GAME_CONFIG.BOARD_HEIGHT) {
          return true;
        }

        if (newY >= 0 && board[newY][newX] !== null) {
          return true;
        }
      }
    }
  }
  return false;
}

// Lock piece to board
function lockPiece(board: (TetrominoType | null)[][], piece: Tetromino): (TetrominoType | null)[][] {
  const newBoard = board.map((row) => [...row]);
  const shape = piece.shape[piece.rotation];

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardY = piece.position.y + row;
        const boardX = piece.position.x + col;
        if (boardY >= 0 && boardY < GAME_CONFIG.BOARD_HEIGHT && boardX >= 0 && boardX < GAME_CONFIG.BOARD_WIDTH) {
          newBoard[boardY][boardX] = piece.type;
        }
      }
    }
  }
  return newBoard;
}

// Clear completed lines
function clearLines(board: (TetrominoType | null)[][]): { newBoard: (TetrominoType | null)[][]; linesCleared: number } {
  const newBoard = board.filter((row) => row.some((cell) => cell === null));
  const linesCleared = GAME_CONFIG.BOARD_HEIGHT - newBoard.length;

  while (newBoard.length < GAME_CONFIG.BOARD_HEIGHT) {
    newBoard.unshift(Array(GAME_CONFIG.BOARD_WIDTH).fill(null));
  }

  return { newBoard, linesCleared };
}

// Calculate drop speed by level
function getDropSpeed(level: number): number {
  return Math.max(GAME_CONFIG.MIN_SPEED, GAME_CONFIG.INITIAL_SPEED * Math.pow(GAME_CONFIG.SPEED_FACTOR, level - 1));
}

// Calculate points
function calculatePoints(lines: number, level: number): number {
  const basePoints = GAME_CONFIG.POINTS[lines as keyof typeof GAME_CONFIG.POINTS] || 0;
  return basePoints * level;
}

export function useTetris() {
  const [gameState, setGameState] = useState<GameState>({
    board: createBoard(),
    currentPiece: null,
    nextPiece: randomPiece(),
    score: 0,
    level: 1,
    lines: 0,
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
  });

  const gameLoopRef = useRef<number | null>(null);
  const lastDropRef = useRef<number>(0);

  // Spawn new piece
  const spawnPiece = useCallback(() => {
    setGameState((prev) => {
      const newPiece = createPiece(prev.nextPiece);
      const nextType = randomPiece();

      // Check if game over on spawn
      if (checkCollision(prev.board, newPiece, newPiece.rotation, 0, 0)) {
        return { ...prev, currentPiece: newPiece, isGameOver: true, isPlaying: false };
      }

      return { ...prev, currentPiece: newPiece, nextPiece: nextType };
    });
  }, []);

  // Start game
  const startGame = useCallback(() => {
    const newBoard = createBoard();
    const firstPiece = createPiece(randomPiece());
    const nextType = randomPiece();

    setGameState({
      board: newBoard,
      currentPiece: firstPiece,
      nextPiece: nextType,
      score: 0,
      level: 1,
      lines: 0,
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
    });
    lastDropRef.current = Date.now();
  }, []);

  // Move piece (left, right, down)
  const movePiece = useCallback((offsetX: number, offsetY: number) => {
    setGameState((prev) => {
      if (!prev.currentPiece || !prev.isPlaying || prev.isPaused || prev.isGameOver) return prev;

      const { currentPiece, board } = prev;
      const rot = currentPiece.rotation;

      if (!checkCollision(board, currentPiece, rot, offsetX, offsetY)) {
        const newPiece = {
          ...currentPiece,
          position: {
            x: currentPiece.position.x + offsetX,
            y: currentPiece.position.y + offsetY,
          },
        };
        return { ...prev, currentPiece: newPiece };
      }
      return prev;
    });
  }, []);

  // Rotate piece
  const rotatePiece = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || !prev.isPlaying || prev.isPaused || prev.isGameOver) return prev;

      const { currentPiece, board } = prev;
      const newRotation = (currentPiece.rotation + 1) % currentPiece.shape.length;

      // Wall kick offsets to try
      const kicks = [0, -1, 1, -2, 2];
      for (const kick of kicks) {
        if (!checkCollision(board, currentPiece, newRotation, kick, 0)) {
          const newPiece = {
            ...currentPiece,
            rotation: newRotation,
            position: {
              x: currentPiece.position.x + kick,
              y: currentPiece.position.y,
            },
          };
          return { ...prev, currentPiece: newPiece };
        }
      }
      return prev;
    });
  }, []);

  // Hard drop (instant)
  const hardDrop = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || !prev.isPlaying || prev.isPaused || prev.isGameOver) return prev;

      let dropDistance = 0;
      while (!checkCollision(prev.board, prev.currentPiece, prev.currentPiece.rotation, 0, dropDistance + 1)) {
        dropDistance++;
      }

      const droppedPiece = {
        ...prev.currentPiece,
        position: {
          x: prev.currentPiece.position.x,
          y: prev.currentPiece.position.y + dropDistance,
        },
      };

      const lockedBoard = lockPiece(prev.board, droppedPiece);
      const { newBoard: clearedBoard, linesCleared } = clearLines(lockedBoard);

      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;
      const points = calculatePoints(linesCleared, prev.level);

      const result = {
        ...prev,
        board: clearedBoard,
        currentPiece: null,
        score: prev.score + points,
        level: newLevel,
        lines: newLines,
      };

      // Spawn next piece after a brief delay
      setTimeout(() => spawnPiece(), 0);

      return result;
    });
  }, [spawnPiece]);

  // Auto drop (gravity)
  const drop = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || !prev.isPlaying || prev.isPaused || prev.isGameOver) return prev;

      const { currentPiece, board } = prev;
      const rot = currentPiece.rotation;

      if (checkCollision(board, currentPiece, rot, 0, 1)) {
        // Lock piece
        const lockedBoard = lockPiece(board, currentPiece);
        const { newBoard: clearedBoard, linesCleared } = clearLines(lockedBoard);

        const newLines = prev.lines + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;
        const points = calculatePoints(linesCleared, prev.level);

        const result = {
          ...prev,
          board: clearedBoard,
          currentPiece: null,
          score: prev.score + points,
          level: newLevel,
          lines: newLines,
        };

        // Spawn next piece after a brief delay
        setTimeout(() => spawnPiece(), 0);

        return result;
      }

      // Move down
      return {
        ...prev,
        currentPiece: {
          ...currentPiece,
          position: {
            x: currentPiece.position.x,
            y: currentPiece.position.y + 1,
          },
        },
      };
    });
  }, [spawnPiece]);

  // Toggle pause
  const togglePause = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  // Game loop with requestAnimationFrame
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const gameLoop = () => {
      const speed = getDropSpeed(gameState.level);
      const now = Date.now();

      if (now - lastDropRef.current >= speed) {
        drop();
        lastDropRef.current = now;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameState.level, drop]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
        case 's':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case 'w':
          e.preventDefault();
          rotatePiece();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'Escape':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, movePiece, rotatePiece, hardDrop, togglePause]);

  // Touch controls for mobile
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: any) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, []);

  const handleTouchEnd = useCallback((e: any) => {
    if (!touchStartRef.current || !gameState.isPlaying) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    const minSwipe = 30;

    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe && dt < 200) {
      // Tap = rotate
      rotatePiece();
    } else if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (dx > minSwipe) movePiece(1, 0);
      else if (dx < -minSwipe) movePiece(-1, 0);
    } else {
      // Vertical swipe
      if (dy > minSwipe) {
        if (dy > minSwipe * 3) hardDrop();
        else movePiece(0, 1);
      }
    }

    touchStartRef.current = null;
  }, [gameState.isPlaying, movePiece, rotatePiece, hardDrop]);

  return {
    gameState,
    startGame,
    movePiece,
    rotatePiece,
    hardDrop,
    togglePause,
    handleTouchStart,
    handleTouchEnd,
  };
}

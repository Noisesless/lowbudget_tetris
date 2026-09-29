import React, { useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import { useTetris } from '@/hooks/useTetris'
import { TETROMINO_SHAPES, TETROMINO_COLORS, type TetrominoType } from '@/types/tetris'
import styles from './index.module.scss'

// Get block color for a piece type
function getBlockColor(type: TetrominoType) {
  return TETROMINO_COLORS[type]
}

// Render a single board cell
function Cell({ type, isGhost }: { type: TetrominoType | null; isGhost?: boolean }) {
  if (!type) {
    return <View className={styles.cell + ' ' + styles.cellEmpty} />
  }

  const colors = getBlockColor(type)
  const opacity = isGhost ? 0.3 : 1

  return (
    <View
      className={styles.cell}
      style={{ opacity }}
    >
      <View
        className={styles.block}
        style={{
          background: `linear-gradient(180deg, ${colors.top} 0%, ${colors.main} 60%, ${colors.bottom} 100%)`,
          boxShadow: isGhost ? 'none' : `0 0 12px ${colors.glow}, inset 0 -4px 8px rgba(0,0,0,0.2)`,
        }}
      />
    </View>
  )
}

// Render next piece preview
function NextPiecePreview({ type }: { type: TetrominoType }) {
  const shape = TETROMINO_SHAPES[type][0]
  const colors = getBlockColor(type)
  const rows = shape.length
  const cols = shape[0].length

  return (
    <View className={styles.previewGrid} style={{
      gridTemplateColumns: `repeat(${cols}, 28px)`,
      gridTemplateRows: `repeat(${rows}, 28px)`,
    }}>
      {shape.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <View
            key={`${rowIndex}-${colIndex}`}
            className={`${styles.previewCell} ${cell ? styles.previewCellFilled : ''}`}
            style={cell ? {
              background: `linear-gradient(180deg, ${colors.top} 0%, ${colors.main} 60%, ${colors.bottom} 100%)`,
              boxShadow: `0 0 8px ${colors.glow}`,
            } : {}}
          />
        ))
      )}
    </View>
  )
}

const TetrisPage: React.FC = () => {
  const {
    gameState,
    startGame,
    movePiece,
    rotatePiece,
    hardDrop,
    togglePause,
  } = useTetris()

  const {
    board,
    currentPiece,
    nextPiece,
    score,
    level,
    lines,
    isPlaying,
    isPaused,
    isGameOver,
  } = gameState

  // Calculate level progress (lines to next level)
  const linesInLevel = lines % 10
  const levelProgress = (linesInLevel / 10) * 100

  // Render board with current piece
  const renderBoard = useCallback(() => {
    const displayBoard = board.map((row) => [...row])

    // Draw current piece with correct rotation
    if (currentPiece) {
      const shape = currentPiece.shape[currentPiece.rotation]
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            const boardY = currentPiece.position.y + row
            const boardX = currentPiece.position.x + col
            if (boardY >= 0 && boardY < displayBoard.length && boardX >= 0 && boardX < displayBoard[0].length) {
              displayBoard[boardY][boardX] = currentPiece.type
            }
          }
        }
      }
    }

    return displayBoard.flatMap((row, rowIndex) =>
      row.map((cell, colIndex) => (
        <Cell key={`${rowIndex}-${colIndex}`} type={cell} />
      ))
    )
  }, [board, currentPiece])

  return (
    <View className={styles.gameContainer}>
      {/* Title */}
      <Text className={styles.gameTitle}>TETRIS</Text>

      {/* Main Game Area */}
      <View className={styles.gameArea}>
        {/* Game Board */}
        <View className={styles.boardWrapper}>
          <View className={styles.board}>
            {renderBoard()}
          </View>

          {/* Start Screen */}
          {!isPlaying && !isGameOver && (
            <View className={styles.startOverlay}>
              <Text className={styles.startTitle}>TETRIS</Text>
              <Text className={styles.startSubtitle}>
                Arrow Keys / WASD to move
                <br />
                Up / W to rotate
                <br />
                Space to hard drop
                <br />
                P / Esc to pause
              </Text>
              <View className={styles.startBtn} onClick={startGame}>
                <Text>START GAME</Text>
              </View>
            </View>
          )}

          {/* Pause Screen */}
          {isPaused && (
            <View className={styles.pauseOverlay}>
              <Text className={styles.pauseTitle}>PAUSED</Text>
              <View className={styles.resumeBtn} onClick={togglePause}>
                <Text>RESUME</Text>
              </View>
            </View>
          )}

          {/* Game Over Screen */}
          {isGameOver && (
            <View className={styles.gameOverOverlay}>
              <Text className={styles.gameOverTitle}>GAME OVER</Text>
              <Text className={styles.gameOverScore}>FINAL SCORE</Text>
              <Text className={styles.gameOverValue}>{score.toLocaleString()}</Text>
              <View className={styles.retryBtn} onClick={startGame}>
                <Text>PLAY AGAIN</Text>
              </View>
            </View>
          )}
        </View>

        {/* Side Panel */}
        {isPlaying && (
          <View className={styles.sidePanel}>
            {/* Score */}
            <View className={styles.infoCard}>
              <Text className={styles.infoLabel}>Score</Text>
              <Text className={styles.infoValue + ' ' + styles.scoreValue}>{score.toLocaleString()}</Text>
            </View>

            {/* Level */}
            <View className={styles.infoCard}>
              <Text className={styles.infoLabel}>Level</Text>
              <Text className={styles.infoValue + ' ' + styles.levelValue}>{level}</Text>
              <View className={styles.levelProgress}>
                <View className={styles.levelProgressBar} style={{ width: `${levelProgress}%` }} />
              </View>
            </View>

            {/* Lines */}
            <View className={styles.infoCard}>
              <Text className={styles.infoLabel}>Lines</Text>
              <Text className={styles.infoValue + ' ' + styles.linesValue}>{lines}</Text>
            </View>

            {/* Next Piece */}
            <View className={styles.infoCard}>
              <Text className={styles.infoLabel}>Next</Text>
              <View className={styles.previewContainer}>
                <NextPiecePreview type={nextPiece} />
              </View>
            </View>

            {/* Pause Button */}
            <View className={styles.controls}>
              <View className={styles.controlBtn + ' ' + styles.controlBtnPrimary} onClick={togglePause}>
                <Text>{isPaused ? 'RESUME' : 'PAUSE'}</Text>
              </View>
            </View>

            {/* Keyboard Hints */}
            <View className={styles.keyboardHints}>
              <View className={styles.hintRow}>
                <View className={styles.key}><Text>←</Text></View>
                <View className={styles.key}><Text>→</Text></View>
                <View className={styles.hintText}>Move</View>
              </View>
              <View className={styles.hintRow}>
                <View className={styles.key}><Text>↑</Text></View>
                <View className={styles.hintText}>Rotate</View>
              </View>
              <View className={styles.hintRow}>
                <View className={styles.key}><Text>↓</Text></View>
                <View className={styles.hintText}>Soft Drop</View>
              </View>
              <View className={styles.hintRow}>
                <View className={styles.key}><Text>Space</Text></View>
                <View className={styles.hintText}>Hard Drop</View>
              </View>
              <View className={styles.hintRow}>
                <View className={styles.key}><Text>P</Text></View>
                <View className={styles.key}><Text>Esc</Text></View>
                <View className={styles.hintText}>Pause</View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

export default TetrisPage

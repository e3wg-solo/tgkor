
import React, { useState } from 'react';
import { GameState, Position, Wall } from '../types/game';
import { isValidMove, isValidWallPlacement, getValidMoves } from '../utils/gameLogic';

interface GameBoardProps {
  gameState: GameState;
  currentUserId: string;
  onMovePawn: (position: Position) => void;
  onPlaceWall: (wall: Wall) => void;
  selectedAction: 'move' | 'wall';
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentUserId,
  onMovePawn,
  onPlaceWall,
  selectedAction
}) => {
  const [wallOrientation, setWallOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [previewWall, setPreviewWall] = useState<Wall | null>(null);
  
  const isCurrentPlayerTurn = gameState.currentTurn === currentUserId;
  const currentPlayer = gameState.player1.id === currentUserId ? gameState.player1 : gameState.player2;
  const otherPlayer = gameState.player1.id === currentUserId ? gameState.player2 : gameState.player1;
  
  // Calculate valid moves for highlighting
  const validMoves = isCurrentPlayerTurn && selectedAction === 'move' && currentPlayer
    ? getValidMoves(gameState, currentUserId)
    : [];
  
  const handleCellClick = (row: number, col: number) => {
    if (!isCurrentPlayerTurn || gameState.status !== 'active') return;
    
    if (selectedAction === 'move') {
      const position: Position = { row, col };
      if (isValidMove(gameState, currentUserId, position)) {
        onMovePawn(position);
      }
    } else if (selectedAction === 'wall' && currentPlayer && currentPlayer.wallsLeft > 0) {
      const wall: Wall = {
        id: `wall-${Date.now()}`,
        position: { row, col },
        orientation: wallOrientation
      };
      
      if (isValidWallPlacement(gameState, currentUserId, wall)) {
        onPlaceWall(wall);
        setPreviewWall(null);
      }
    }
  };
  
  const handleWallPreview = (row: number, col: number) => {
    if (!isCurrentPlayerTurn || selectedAction !== 'wall' || !currentPlayer || currentPlayer.wallsLeft <= 0) {
      setPreviewWall(null);
      return;
    }
    
    const wall: Wall = {
      id: 'preview',
      position: { row, col },
      orientation: wallOrientation
    };
    
    setPreviewWall(isValidWallPlacement(gameState, currentUserId, wall) ? wall : null);
  };
  
  const renderWall = (wall: Wall, isPreview = false) => {
    const { row, col } = wall.position;
    
    if (wall.orientation === 'horizontal') {
      return (
        <div
          key={wall.id}
          className={`game-wall horizontal-wall ${isPreview ? 'game-wall-preview' : ''}`}
          style={{
            top: `${row * 40}px`,
            left: `${col * 40 - 3}px`,
          }}
        />
      );
    } else {
      return (
        <div
          key={wall.id}
          className={`game-wall vertical-wall ${isPreview ? 'game-wall-preview' : ''}`}
          style={{
            top: `${row * 40 - 3}px`,
            left: `${col * 40}px`,
          }}
        />
      );
    }
  };

  const isCellHighlighted = (row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Game controls */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => {}} // Using the selectedAction from props now, so no need to manage it here
          className={`px-4 py-2 rounded-lg ${selectedAction === 'move' 
            ? 'bg-game-primary text-white' 
            : 'bg-muted hover:bg-muted/80'}`}
          disabled={!isCurrentPlayerTurn}
        >
          Move Pawn
        </button>
        <button
          onClick={() => {}} // Using the selectedAction from props now, so no need to manage it here
          className={`px-4 py-2 rounded-lg ${selectedAction === 'wall' 
            ? 'bg-game-primary text-white' 
            : 'bg-muted hover:bg-muted/80'}`}
          disabled={!isCurrentPlayerTurn || (currentPlayer && currentPlayer.wallsLeft <= 0)}
        >
          Place Wall
        </button>
        {selectedAction === 'wall' && (
          <div className="flex gap-2">
            <button
              onClick={() => setWallOrientation('horizontal')}
              className={`px-4 py-2 rounded-lg ${wallOrientation === 'horizontal' 
                ? 'bg-game-secondary text-white' 
                : 'bg-muted hover:bg-muted/80'}`}
            >
              Horizontal
            </button>
            <button
              onClick={() => setWallOrientation('vertical')}
              className={`px-4 py-2 rounded-lg ${wallOrientation === 'vertical' 
                ? 'bg-game-secondary text-white' 
                : 'bg-muted hover:bg-muted/80'}`}
            >
              Vertical
            </button>
          </div>
        )}
      </div>
      
      {/* Game board */}
      <div className="relative bg-game-board border border-gray-300 w-[360px] h-[360px]">
        {/* Grid cells */}
        {Array(9).fill(0).map((_, row) => (
          <div key={`row-${row}`} className="flex">
            {Array(9).fill(0).map((_, col) => (
              <div
                key={`cell-${row}-${col}`}
                className={`game-board-cell ${isCellHighlighted(row, col) ? 'bg-accent/50' : ''}`}
                onClick={() => handleCellClick(row, col)}
                onMouseEnter={() => handleWallPreview(row, col)}
                onMouseLeave={() => setPreviewWall(null)}
              >
                <span className="text-xs text-gray-400">{`${row},${col}`}</span>
              </div>
            ))}
          </div>
        ))}
        
        {/* Render walls */}
        {gameState.walls.map(wall => renderWall(wall))}
        
        {/* Render preview wall if valid */}
        {previewWall && renderWall(previewWall, true)}
        
        {/* Player pawns */}
        {gameState.player1 && (
          <div
            className="player-pawn bg-game-player1"
            style={{
              top: `${gameState.player1.position.row * 40 + 7}px`,
              left: `${gameState.player1.position.col * 40 + 7}px`,
            }}
          />
        )}
        
        {gameState.player2 && (
          <div
            className="player-pawn bg-game-player2"
            style={{
              top: `${gameState.player2.position.row * 40 + 7}px`,
              left: `${gameState.player2.position.col * 40 + 7}px`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default GameBoard;

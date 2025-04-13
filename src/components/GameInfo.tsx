
import React from 'react';
import { GameState } from '../types/game';

interface GameInfoProps {
  gameState: GameState;
  currentUserId: string;
  selectedAction?: 'move' | 'wall';
}

const GameInfo: React.FC<GameInfoProps> = ({ gameState, currentUserId, selectedAction = 'move' }) => {
  const isCurrentPlayerTurn = gameState.currentTurn === currentUserId;
  const currentPlayer = gameState.player1.id === currentUserId ? gameState.player1 : gameState.player2;
  const otherPlayer = gameState.player1.id === currentUserId ? gameState.player2 : gameState.player1;
  
  return (
    <div className="bg-card rounded-lg p-4 shadow-md w-full max-w-md mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">
          {gameState.status === 'waiting' && 'Waiting for player to join...'}
          {gameState.status === 'active' && isCurrentPlayerTurn && 'Your turn'}
          {gameState.status === 'active' && !isCurrentPlayerTurn && 'Opponent\'s turn'}
          {gameState.status === 'finished' && gameState.winner === currentUserId && 'You won!'}
          {gameState.status === 'finished' && gameState.winner !== currentUserId && 'You lost!'}
        </h2>
      </div>
      
      <div className="flex justify-between mb-2">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-game-player1 mr-2"></div>
          <span className="font-medium">
            {gameState.player1.username} 
            {gameState.player1.id === currentUserId && " (You)"}
          </span>
        </div>
        <div>
          Walls left: <span className="font-bold">{gameState.player1.wallsLeft}</span>
        </div>
      </div>
      
      {gameState.player2 && (
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-game-player2 mr-2"></div>
            <span className="font-medium">
              {gameState.player2.username}
              {gameState.player2.id === currentUserId && " (You)"}
            </span>
          </div>
          <div>
            Walls left: <span className="font-bold">{gameState.player2.wallsLeft}</span>
          </div>
        </div>
      )}
      
      {gameState.status === 'active' && (
        <div className="mt-4 p-2 bg-muted rounded text-center">
          {isCurrentPlayerTurn ? (
            <>
              <p className="font-bold text-primary">Your turn</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedAction === 'move' 
                  ? "Click on a highlighted cell to move your pawn" 
                  : "Click on the board to place a wall"}
              </p>
            </>
          ) : (
            <p className="font-bold text-muted-foreground">Waiting for opponent's move</p>
          )}
        </div>
      )}
      
      {gameState.status === 'finished' && (
        <div className="mt-4 p-3 bg-accent rounded text-center">
          <p className="text-lg font-bold">
            {gameState.winner === currentUserId 
              ? "Congratulations! You won!" 
              : "Game over. You lost."}
          </p>
          <button 
            className="mt-2 bg-primary text-white px-4 py-1 rounded-lg hover:bg-primary/80"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default GameInfo;

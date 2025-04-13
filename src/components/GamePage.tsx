import React, { useReducer, useState, useEffect } from 'react';
import { Position, Wall } from '../types/game';
import { gameReducer } from '../reducers/gameReducer';
import { initializeGameState } from '../utils/gameLogic';
import GameBoard from './GameBoard';
import GameInfo from './GameInfo';
import { shareTelegramGame, showTelegramAlert } from '../utils/telegram';
import { 
  movePawn, 
  placeWall, 
  subscribeToGame,
  subscribeToWalls,
  subscribeToMoves 
} from '../lib/supabase';

interface GamePageProps {
  gameId?: string;
  gameData: any;
  userId: string;
  username: string;
  onBack: () => void;
}

const GamePage: React.FC<GamePageProps> = ({ 
  gameId, 
  gameData, 
  userId, 
  username, 
  onBack 
}) => {
  const initialState = gameData || 
    (gameId ? null : initializeGameState(userId, username));
  
  const [gameState, setGameState] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'move' | 'wall'>('move');
  const [loading, setLoading] = useState(false);
  
  // Subscribe to game updates
  useEffect(() => {
    if (!gameId || !gameState) return;
    
    // Subscribe to game updates
    const gameSubscription = subscribeToGame(gameId, (payload) => {
      // Update game state with new data
      console.log('Game update received:', payload);
      if (payload.new) {
        setGameState(prevState => ({
          ...prevState,
          ...payload.new
        }));
      }
    });
    
    // Subscribe to wall updates
    const wallSubscription = subscribeToWalls(gameState.game_id, (payload) => {
      console.log('Wall update received:', payload);
      if (payload.new) {
        const newWall = payload.new;
        setGameState(prevState => ({
          ...prevState,
          walls: [...(prevState.walls || []), {
            id: newWall.id,
            position: { row: newWall.row_pos, col: newWall.col_pos },
            orientation: newWall.orientation
          }]
        }));
      }
    });
    
    // Subscribe to move updates
    const moveSubscription = subscribeToMoves(gameState.game_id, (payload) => {
      console.log('Move update received:', payload);
      if (payload.new) {
        const newMove = payload.new;
        const player = newMove.player_id === gameState.player1_id ? 'player1' : 'player2';
        
        setGameState(prevState => ({
          ...prevState,
          [player + '_position']: { 
            row: newMove.row_to, 
            col: newMove.col_to 
          }
        }));
      }
    });
    
    return () => {
      // Clean up subscriptions
      gameSubscription.unsubscribe();
      wallSubscription.unsubscribe();
      moveSubscription.unsubscribe();
    };
  }, [gameId, gameState?.game_id]);
  
  const handleMovePawn = async (position: Position) => {
    if (!gameState || gameState.current_turn !== userId) {
      setError("Not your turn");
      return;
    }
    
    try {
      setLoading(true);
      
      // Get current position
      const currentPosition = gameState.player1_id === userId 
        ? gameState.player1_position 
        : gameState.player2_position;
      
      if (!currentPosition) throw new Error("Current position not found");
      
      await movePawn(
        gameState.game_id,
        userId,
        currentPosition.row,
        currentPosition.col,
        position.row,
        position.col
      );
      
      // Note: We don't need to update state here because we're subscribed to changes
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const handlePlaceWall = async (wall: Wall) => {
    if (!gameState || gameState.current_turn !== userId) {
      setError("Not your turn");
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if player has walls left
      const wallsUsed = gameState.player1_id === userId 
        ? gameState.player1_walls_used 
        : gameState.player2_walls_used;
      
      if (wallsUsed >= 10) {
        throw new Error("No walls left");
      }
      
      await placeWall(
        gameState.game_id,
        userId,
        wall.position.row,
        wall.position.col,
        wall.orientation
      );
      
      // Switch back to move action after placing wall
      setSelectedAction('move');
      
      // Note: We don't need to update state here because we're subscribed to changes
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const copyGameId = () => {
    if (gameId) {
      navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const shareGameLink = () => {
    if (gameId) {
      shareTelegramGame(gameId);
    }
  };
  
  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const isMyTurn = gameState.current_turn === userId;
  const gameStatus = gameState.status;
  const player1Position = gameState.player1_position || { row: 0, col: 4 };
  const player2Position = gameState.player2_position || { row: 8, col: 4 };
  
  // Convert database game state to the format expected by GameBoard
  const boardGameState = {
    id: gameState.game_uuid,
    status: gameState.status,
    currentTurn: gameState.current_turn,
    winner: gameState.winner_id,
    player1: {
      id: gameState.player1_id,
      username: gameState.player1_username || 'Player 1',
      position: player1Position,
      wallsLeft: 10 - (gameState.player1_walls_used || 0)
    },
    player2: gameState.player2_id ? {
      id: gameState.player2_id,
      username: gameState.player2_username || 'Player 2',
      position: player2Position,
      wallsLeft: 10 - (gameState.player2_walls_used || 0)
    } : null,
    walls: Array.isArray(gameState.walls) ? gameState.walls : []
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-sm font-medium hover:underline"
        >
          ← Back to Home
        </button>
        
        <div className="flex items-center">
          <span className="mr-2 text-sm text-muted-foreground">Game ID:</span>
          <code className="bg-muted px-2 py-1 rounded text-sm">{gameId?.substring(0, 8)}</code>
          <button 
            onClick={copyGameId}
            className="ml-2 p-1 hover:bg-muted rounded"
            aria-label="Copy game ID"
          >
            {copied ? '✓' : '📋'}
          </button>
          <button
            onClick={shareGameLink}
            className="ml-2 p-1 hover:bg-muted rounded"
            aria-label="Share game"
          >
            📤
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-2 rounded mb-4 text-center">
          {error}
          <button 
            className="ml-2 underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {isMyTurn && gameStatus === 'active' && (
        <div className="mb-4 flex justify-center">
          <div className="inline-flex bg-muted rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedAction === 'move' ? 'bg-background shadow' : 'hover:bg-background/50'
              }`}
              onClick={() => setSelectedAction('move')}
            >
              Move Pawn
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedAction === 'wall' ? 'bg-background shadow' : 'hover:bg-background/50'
              }`}
              onClick={() => setSelectedAction('wall')}
              disabled={(gameState.player1_id === userId && gameState.player1_walls_used >= 10) || 
                       (gameState.player2_id === userId && gameState.player2_walls_used >= 10)}
            >
              Place Wall
            </button>
          </div>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
        <div className="w-full lg:w-auto">
          <GameBoard 
            gameState={boardGameState} 
            currentUserId={userId}
            onMovePawn={handleMovePawn}
            onPlaceWall={handlePlaceWall}
            selectedAction={selectedAction}
          />
        </div>
        
        <div className="w-full lg:w-1/3">
          <GameInfo 
            gameState={boardGameState} 
            currentUserId={userId}
            selectedAction={selectedAction}
          />
          
          {gameStatus === 'waiting' && (
            <div className="mt-4 bg-muted p-4 rounded-lg">
              <p className="text-center mb-2">Share this Game ID with your opponent:</p>
              <div className="flex">
                <code className="bg-card flex-1 px-3 py-2 rounded-l text-sm overflow-hidden text-ellipsis">
                  {gameId}
                </code>
                <button 
                  onClick={copyGameId}
                  className="bg-primary text-primary-foreground px-3 py-2 rounded-r"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="mt-2">
                <button
                  onClick={shareGameLink}
                  className="w-full bg-primary/80 text-primary-foreground px-3 py-2 rounded"
                >
                  Share via Telegram
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePage;

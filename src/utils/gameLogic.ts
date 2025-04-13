
import { GameState, Position, Wall, Player } from '../types/game';

// Check if a move is valid for a player
export const isValidMove = (
  gameState: GameState, 
  playerId: string, 
  position: Position
): boolean => {
  // Get the current player
  const player = playerId === gameState.player1.id ? gameState.player1 : gameState.player2;
  
  if (!player) return false;
  
  const { row, col } = position;
  const currentPos = player.position;
  
  // Check if the move is out of bounds
  if (row < 0 || row > 8 || col < 0 || col > 8) return false;
  
  // Check if the position is already occupied by another player
  const otherPlayer = playerId === gameState.player1.id ? gameState.player2 : gameState.player1;
  if (otherPlayer && otherPlayer.position.row === row && otherPlayer.position.col === col) return false;
  
  // Check if the move is only one step in any direction (up, down, left, right)
  const rowDiff = Math.abs(row - currentPos.row);
  const colDiff = Math.abs(col - currentPos.col);
  
  if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) return false;
  
  // Check if there's a wall blocking the move
  const walls = gameState.walls;
  
  // Check horizontal walls
  if (currentPos.row < row) {
    // Moving down
    if (walls.some(wall => 
      wall.orientation === "horizontal" && 
      wall.position.row === currentPos.row + 1 && 
      (wall.position.col === currentPos.col || wall.position.col === currentPos.col - 1))) {
      return false;
    }
  } else if (currentPos.row > row) {
    // Moving up
    if (walls.some(wall => 
      wall.orientation === "horizontal" && 
      wall.position.row === currentPos.row && 
      (wall.position.col === currentPos.col || wall.position.col === currentPos.col - 1))) {
      return false;
    }
  } else if (currentPos.col < col) {
    // Moving right
    if (walls.some(wall => 
      wall.orientation === "vertical" && 
      wall.position.col === currentPos.col + 1 && 
      (wall.position.row === currentPos.row || wall.position.row === currentPos.row - 1))) {
      return false;
    }
  } else if (currentPos.col > col) {
    // Moving left
    if (walls.some(wall => 
      wall.orientation === "vertical" && 
      wall.position.col === currentPos.col && 
      (wall.position.row === currentPos.row || wall.position.row === currentPos.row - 1))) {
      return false;
    }
  }
  
  return true;
};

// Check if a wall placement is valid
export const isValidWallPlacement = (
  gameState: GameState, 
  playerId: string, 
  wall: Wall
): boolean => {
  // Get the current player
  const player = playerId === gameState.player1.id ? gameState.player1 : gameState.player2;
  
  if (!player) return false;
  
  // Check if player has walls left
  if (player.wallsLeft <= 0) return false;
  
  const { row, col } = wall.position;
  const orientation = wall.orientation;
  
  // Check if the wall is out of bounds
  if (row < 0 || (orientation === "horizontal" && row > 8) || (orientation === "vertical" && row > 7)) return false;
  if (col < 0 || (orientation === "horizontal" && col > 7) || (orientation === "vertical" && col > 8)) return false;
  
  // Check if there's already a wall at the same position with same orientation
  if (gameState.walls.some(w => 
    w.position.row === row && 
    w.position.col === col && 
    w.orientation === orientation)) {
    return false;
  }
  
  // Check if there's an intersecting wall
  if (orientation === "horizontal") {
    if (gameState.walls.some(w => 
      w.orientation === "vertical" && 
      w.position.row <= row && 
      w.position.row + 1 >= row && 
      w.position.col === col + 1)) {
      return false;
    }
  } else {
    if (gameState.walls.some(w => 
      w.orientation === "horizontal" && 
      w.position.col <= col && 
      w.position.col + 1 >= col && 
      w.position.row === row + 1)) {
      return false;
    }
  }
  
  // TODO: Implement path checking to ensure players are not completely blocked
  // This would require a pathfinding algorithm which is complex for this initial version
  
  return true;
};

// Check if a player has won
export const checkWinCondition = (gameState: GameState): string | null => {
  // Player 1 wins by reaching the bottom row (row 8)
  if (gameState.player1 && gameState.player1.position.row === 8) {
    return gameState.player1.id;
  }
  
  // Player 2 wins by reaching the top row (row 0)
  if (gameState.player2 && gameState.player2.position.row === 0) {
    return gameState.player2.id;
  }
  
  return null;
};

// Initialize a new game state
export const initializeGameState = (player1Id: string, player1Name: string): GameState => {
  return {
    id: crypto.randomUUID(),
    status: "waiting",
    createdAt: new Date().toISOString(),
    player1: {
      id: player1Id,
      username: player1Name,
      wallsLeft: 10,
      position: { row: 0, col: 4 } // Start at the middle of top row
    },
    player2: null,
    currentTurn: null,
    winner: null,
    walls: []
  };
};

// Join a game as the second player
export const joinGame = (gameState: GameState, player2Id: string, player2Name: string): GameState => {
  if (!gameState || gameState.player2 || gameState.status !== "waiting") {
    throw new Error("Game is not available for joining");
  }
  
  return {
    ...gameState,
    status: "active",
    player2: {
      id: player2Id,
      username: player2Name,
      wallsLeft: 10,
      position: { row: 8, col: 4 } // Start at the middle of bottom row
    },
    currentTurn: gameState.player1.id // Player 1 goes first
  };
};

// Move a player to a new position
export const movePlayer = (gameState: GameState, playerId: string, position: Position): GameState => {
  if (gameState.status !== "active" || gameState.currentTurn !== playerId) {
    throw new Error("Not your turn or game is not active");
  }
  
  if (!isValidMove(gameState, playerId, position)) {
    throw new Error("Invalid move");
  }
  
  const updatedGameState = { ...gameState };
  
  if (playerId === gameState.player1.id) {
    updatedGameState.player1 = {
      ...gameState.player1,
      position
    };
  } else if (gameState.player2 && playerId === gameState.player2.id) {
    updatedGameState.player2 = {
      ...gameState.player2,
      position
    };
  }
  
  // Check win condition after move
  const winner = checkWinCondition(updatedGameState);
  if (winner) {
    updatedGameState.status = "finished";
    updatedGameState.winner = winner;
    updatedGameState.currentTurn = null;
  } else {
    // Switch turns
    updatedGameState.currentTurn = playerId === gameState.player1.id 
      ? (gameState.player2?.id || null) 
      : gameState.player1.id;
  }
  
  return updatedGameState;
};

// Place a wall on the board
export const placeWall = (gameState: GameState, playerId: string, wall: Wall): GameState => {
  if (gameState.status !== "active" || gameState.currentTurn !== playerId) {
    throw new Error("Not your turn or game is not active");
  }
  
  if (!isValidWallPlacement(gameState, playerId, wall)) {
    throw new Error("Invalid wall placement");
  }
  
  const updatedGameState = { ...gameState };
  
  // Update player's remaining walls
  if (playerId === gameState.player1.id) {
    updatedGameState.player1 = {
      ...gameState.player1,
      wallsLeft: gameState.player1.wallsLeft - 1
    };
  } else if (gameState.player2 && playerId === gameState.player2.id) {
    updatedGameState.player2 = {
      ...gameState.player2,
      wallsLeft: gameState.player2.wallsLeft - 1
    };
  }
  
  // Add the wall to the game state
  updatedGameState.walls = [...gameState.walls, wall];
  
  // Switch turns
  updatedGameState.currentTurn = playerId === gameState.player1.id 
    ? (gameState.player2?.id || null) 
    : gameState.player1.id;
  
  return updatedGameState;
};

// Get all valid moves for a player
export const getValidMoves = (gameState: GameState, playerId: string): Position[] => {
  const player = playerId === gameState.player1.id ? gameState.player1 : gameState.player2;
  if (!player) return [];
  
  const { row, col } = player.position;
  const potentialMoves: Position[] = [
    { row: row - 1, col }, // Up
    { row: row + 1, col }, // Down
    { row, col: col - 1 }, // Left
    { row, col: col + 1 }, // Right
  ];
  
  return potentialMoves.filter(move => isValidMove(gameState, playerId, move));
};


import { GameState, GameAction, Wall, Position, GameStatus } from '../types/game';
import { movePlayer, placeWall, joinGame } from '../utils/gameLogic';

export const gameReducer = (state: GameState | null, action: GameAction): GameState => {
  // Handle JOIN_GAME with null state as a special case
  if (!state && action.type === "JOIN_GAME") {
    // For joining a game when state is null, we need to initialize with the host's game
    const initialState: GameState = {
      id: crypto.randomUUID(),
      status: "waiting" as GameStatus,
      createdAt: new Date().toISOString(),
      player1: {
        id: "host-id", // This would be replaced with actual host ID in real app
        username: "Host Player",
        wallsLeft: 10,
        position: { row: 0, col: 4 }
      },
      player2: null,
      currentTurn: null,
      winner: null,
      walls: []
    };
    
    return joinGame(initialState, action.player.id, action.player.username);
  }
  
  if (!state) {
    throw new Error("Game state is null or undefined");
  }

  switch (action.type) {
    case "JOIN_GAME":
      return joinGame(state, action.player.id, action.player.username);
      
    case "MOVE_PLAYER":
      return movePlayer(state, action.playerId, action.position);
      
    case "PLACE_WALL":
      return placeWall(state, action.playerId, action.wall);
      
    case "END_TURN":
      if (state.status !== "active") return state;
      
      return {
        ...state,
        currentTurn: state.currentTurn === state.player1.id 
          ? (state.player2?.id || null) 
          : state.player1.id
      };
      
    case "GAME_OVER":
      return {
        ...state,
        status: "finished",
        winner: action.winnerId,
        currentTurn: null
      };
      
    default:
      return state;
  }
};

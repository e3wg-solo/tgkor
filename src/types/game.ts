
export type Player = {
  id: string;
  username: string;
  telegramId?: string;
  rating?: number;
  wins?: number;
  losses?: number;
  wallsLeft: number;
  position: Position;
};

export type Position = {
  row: number;
  col: number;
};

export type Wall = {
  id: string;
  position: Position;
  orientation: "horizontal" | "vertical";
};

export type MoveType = "move" | "wall";

export type Move = {
  id: string;
  gameId: string;
  playerId: string;
  type: MoveType;
  data: Position | Wall;
  timestamp: string;
};

export type GameStatus = "waiting" | "active" | "finished";

export type GameState = {
  id: string;
  status: GameStatus;
  createdAt: string;
  player1: Player;
  player2: Player | null;
  currentTurn: string | null;
  winner: string | null;
  walls: Wall[];
};

export type GameAction = 
  | { type: "JOIN_GAME"; player: Player }
  | { type: "MOVE_PLAYER"; playerId: string; position: Position }
  | { type: "PLACE_WALL"; playerId: string; wall: Wall }
  | { type: "END_TURN" }
  | { type: "GAME_OVER"; winnerId: string };

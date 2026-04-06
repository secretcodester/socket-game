// Socket.IO Event Types
export interface PlayerData {
  id: string;
  name: string;
  role: 'host' | 'controller';
  score?: number;
  position?: { x: number; y: number };
  ready?: boolean;
}

export interface GameState {
  host: PlayerData | null;
  players: Record<string, PlayerData>;
  gameActive: boolean;
  gameSelected: string;
}

export interface PlayerMoveData {
  playerId: string;
  position: { x: number; y: number };
}

export interface JoinPayload {
  name: string;
  role: 'host' | 'controller';
}

export interface ErrorPayload {
  message: string;
}

// Socket.io events with specific types
export interface ServerToClientEvents {
  playerJoined: (players: Record<string, PlayerData>) => void;
  playerMoved: (data: PlayerMoveData) => void;
  gameStarted: (state: GameState) => void;
  gameEnded: (state: GameState) => void;
  error: (error: ErrorPayload) => void;
  playerDisconnected: (playerId: string) => void;
}

export interface ClientToServerEvents {
  join: (playerData: JoinPayload) => void;
  move: (position: { x: number; y: number }) => void;
  startGame: () => void;
  resetGame: () => void;
  playerReady: (ready: boolean) => void;
}
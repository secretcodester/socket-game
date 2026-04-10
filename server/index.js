import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Serve static files from client build
app.use(express.static(path.join(__dirname, '../client/build')));

// Rooms storage
const rooms = {};
const socketRooms = {};

// Function to generate unique 6-digit room code
function generateRoomCode() {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms[code]);
  return code;
}

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Player joins the game
  socket.on('join', (playerData) => {
    const { name, role, roomCode: providedRoomCode } = playerData;
    
    if (role === 'host') {
      // Create new room for host
      const roomCode = generateRoomCode();

      rooms[roomCode] = {
        host: socket.id,
        players: {},
        gameActive: false
      };
      
      socketRooms[socket.id] = roomCode;
      socket.join(roomCode);
      socket.emit('roomCreated', { roomCode });
      console.log(`Host created room ${roomCode}: ${name}`);
    } else {
      // Join existing room as controller
      const roomCode = providedRoomCode;

      if (!rooms[roomCode]) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      rooms[roomCode].players[socket.id] = { id: socket.id, name, role, score: 0, position: { x: 0, y: 0 } };
      socketRooms[socket.id] = roomCode;
      socket.join(roomCode);
      io.to(roomCode).emit('playerJoined', rooms[roomCode].players);
      socket.emit('gameState', rooms[roomCode]);
      console.log(`Controller joined room ${roomCode}: ${name}`);
    }
  });

  // Handle player movement
  socket.on('playerMove', (position) => {
    const roomCode = socketRooms[socket.id];
    
    if (!roomCode || !rooms[roomCode] || !rooms[roomCode].players[socket.id]) return;
    
    rooms[roomCode].players[socket.id].position = position;
    io.to(roomCode).emit('playerMoved', {
      playerId: socket.id,
      position: position
    });
  });

  // Handle player actions
  socket.on('playerAction', (action) => {
    const roomCode = socketRooms[socket.id];

    if (!roomCode || !rooms[roomCode] || !rooms[roomCode].players[socket.id]) return

    // Broadcast action to all players in the room
    io.to(roomCode).emit('playerAction', {
      playerId: socket.id,
      action: action
    });
  });

  // Start game (only host can do this)
  socket.on('startGame', () => {
    const roomCode = socketRooms[socket.id];
    
    if (!roomCode || !rooms[roomCode] || socket.id !== rooms[roomCode].host) return;
    
    rooms[roomCode].gameActive = true;
    io.to(roomCode).emit('gameStarted', rooms[roomCode]);
    console.log(`Game started in room ${roomCode} by host`);
  });

  // Reset game (only host can do this)
  socket.on('resetGame', () => {
    const roomCode = socketRooms[socket.id];
    
    if (!roomCode || !rooms[roomCode] || socket.id !== rooms[roomCode].host) return;
    
    // Reset all player positions and scores
    Object.keys(rooms[roomCode].players).forEach(key => {
      rooms[roomCode].players[key].score = 0;
      rooms[roomCode].players[key].position = { x: 0, y: 0 };
    });
    rooms[roomCode].gameActive = false;
    io.to(roomCode).emit('gameReset', rooms[roomCode]);
    console.log(`Game reset in room ${roomCode} by host`);
  });

  // Player disconnects
  socket.on('disconnect', () => {
    const roomCode = socketRooms[socket.id];
    if (roomCode && rooms[roomCode]) {
      if (socket.id === rooms[roomCode].host) {
        console.log(`Host disconnected from room ${roomCode}: ${socket.id}`);
        delete rooms[roomCode];
      } else {
        delete rooms[roomCode].players[socket.id];
        io.to(roomCode).emit('playerLeave', rooms[roomCode].players);
      }
    }
    delete socketRooms[socket.id];
    console.log(`Player disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🎮 Game server running on http://localhost:${PORT}`);
  console.log(`   Host: http://localhost:${PORT}?role=host`);
  console.log(`   Controllers on mobile: http://<your-ip>:${PORT}?role=controller`);
});

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Serve static files from client build
app.use(express.static(path.join(__dirname, '../client/build')));

// Game state
const gameState = {
  players: {},
  gameActive: false
};

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Player joins the game
  socket.on('join', (playerData) => {
    gameState.players[socket.id] = {
      id: socket.id,
      name: playerData.name,
      score: 0,
      position: { x: 0, y: 0 }
    };
    
    io.emit('playerJoined', gameState.players);
    socket.emit('gameState', gameState);
  });

  // Handle player movement or actions
  socket.on('playerMove', (position) => {
    if (gameState.players[socket.id]) {
      gameState.players[socket.id].position = position;
      io.emit('playerMoved', {
        playerId: socket.id,
        position: position
      });
    }
  });

  // Handle player actions (game specific)
  socket.on('playerAction', (action) => {
    io.emit('playerAction', {
      playerId: socket.id,
      action: action
    });
  });

  // Start game
  socket.on('startGame', () => {
    gameState.gameActive = true;
    io.emit('gameStarted', gameState);
  });

  // Reset game
  socket.on('resetGame', () => {
    Object.keys(gameState.players).forEach(key => {
      gameState.players[key].score = 0;
      gameState.players[key].position = { x: 0, y: 0 };
    });
    gameState.gameActive = false;
    io.emit('gameReset', gameState);
  });

  // Player disconnects
  socket.on('disconnect', () => {
    delete gameState.players[socket.id];
    console.log(`Player disconnected: ${socket.id}`);
    io.emit('playerLeft', gameState.players);
  });
});

server.listen(PORT, () => {
  console.log(`🎮 Game server running on http://localhost:${PORT}`);
});

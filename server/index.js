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
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Serve static files from client build
app.use(express.static(path.join(__dirname, '../client/build')));

// Rooms storage
const rooms = {};
const socketRooms = {};

// Game items storage
const gameItems = {};

// Function to generate unique 6-digit room code
function generateRoomCode() {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms[code]);
  return code;
}

const MAX_ITEMS = 5; // Max items per room

// Function to spawn a new item in a room
function spawnItem(roomCode) {
  if (!gameItems[roomCode]) {
    gameItems[roomCode] = [];
  }
  
  if (gameItems[roomCode].length < MAX_ITEMS) {
    const item = {
      id: Date.now() + Math.random(),
      x: Math.random() * 600 - 300, // -300 to 300 (within screen bounds)
      y: Math.random() * 400 - 200, // -200 to 200
      type: 'coin',
      value: 10
    };
    gameItems[roomCode].push(item);
    io.to(roomCode).emit('itemSpawned', item);
  }
}

// Function to check item collection
function checkItemCollection(roomCode) {
  if (!rooms[roomCode] || !gameItems[roomCode]) return;
  
  Object.keys(rooms[roomCode].players).forEach(playerId => {
    const player = rooms[roomCode].players[playerId];
    
    // Apply speed boost effect
    const speedMultiplier = player.speedBoostActive ? 2 : 1;
    
    if (player.velocity.x !== 0 || player.velocity.y !== 0) {
      player.position.x += player.velocity.x * speedMultiplier;
      player.position.y += player.velocity.y * speedMultiplier;
      
      // Keep players on screen (canvas is 1000x650, centered at 400,300)
      player.position.x = Math.max(-375, Math.min(575, player.position.x));
      player.position.y = Math.max(-275, Math.min(275, player.position.y));
    }
    
    gameItems[roomCode].forEach((item, index) => {
      const distance = Math.sqrt(
        Math.pow(player.position.x - item.x, 2) + 
        Math.pow(player.position.y - item.y, 2)
      );
      
      if (distance < 30) { // Collection radius
        // Award points
        player.score += item.value;
        
        // Remove item
        gameItems[roomCode].splice(index, 1);
        
        // Broadcast collection
        io.to(roomCode).emit('itemCollected', {
          playerId,
          itemId: item.id,
          newScore: player.score
        });
        
        // Spawn new item after a delay
        setTimeout(() => spawnItem(roomCode), 2000);
      }
    });
  });
}

// Game loop to update player positions
setInterval(() => {
  Object.keys(rooms).forEach(roomCode => {
    const room = rooms[roomCode];
    let positionChanged = false;
    
    Object.keys(room.players).forEach(playerId => {
      const player = room.players[playerId];
      
      // Check if speed boost has expired
      if (player.speedBoostActive && Date.now() > player.speedBoostEndTime) {
        player.speedBoostActive = false;
        io.to(roomCode).emit('playerAction', {
          playerId,
          action: 'speedBoostEnd'
        });
      }
      
      if (player.velocity.x !== 0 || player.velocity.y !== 0) {
        // Apply speed boost effect
        const speedMultiplier = player.speedBoostActive ? 2 : 1;
        player.position.x += player.velocity.x * speedMultiplier;
        player.position.y += player.velocity.y * speedMultiplier;
        
        player.position.x = Math.max(-375, Math.min(575, player.position.x));
        player.position.y = Math.max(-275, Math.min(275, player.position.y));
        
        positionChanged = true;
      }
    });
    
    if (positionChanged) {
      io.to(roomCode).emit('playerMoved', room.players);
    }
    
    // Check for item collection
    checkItemCollection(roomCode);
  });
}, 16); // ~60fps

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

      rooms[roomCode].players[socket.id] = { id: socket.id, name, role, score: 0, position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, speedBoostActive: false, speedBoostEndTime: 0 };
      socketRooms[socket.id] = roomCode;
      socket.join(roomCode);
      io.to(roomCode).emit('playerJoined', rooms[roomCode].players);
      socket.emit('gameState', rooms[roomCode]);
      console.log(`Controller joined room ${roomCode}: ${name}`);
    }
  });

  // Handle player movement
  socket.on('playerMove', (velocity) => {
    const roomCode = socketRooms[socket.id];
    
    if (!roomCode || !rooms[roomCode] || !rooms[roomCode].players[socket.id]) return;
    
    rooms[roomCode].players[socket.id].velocity = velocity;
  });

  // Handle player actions
  socket.on('playerAction', (action) => {
    const roomCode = socketRooms[socket.id];

    if (!roomCode || !rooms[roomCode] || !rooms[roomCode].players[socket.id]) return;

    const player = rooms[roomCode].players[socket.id];
    
    if (action === 'speedBoost' && !player.speedBoostActive) {
      // Activate speed boost for 5 seconds
      player.speedBoostActive = true;
      player.speedBoostEndTime = Date.now() + 5000;
      
      // Broadcast speed boost activation
      io.to(roomCode).emit('playerAction', {
        playerId: socket.id,
        action: 'speedBoost',
        duration: 5000
      });
      
      // Deactivate after duration
      setTimeout(() => {
        if (rooms[roomCode] && rooms[roomCode].players[socket.id]) {
          rooms[roomCode].players[socket.id].speedBoostActive = false;
          io.to(roomCode).emit('playerAction', {
            playerId: socket.id,
            action: 'speedBoostEnd'
          });
        }
      }, 5000);
    }
  });

  // Start game (only host can do this)
  socket.on('startGame', () => {
    const roomCode = socketRooms[socket.id];
    
    if (!roomCode || !rooms[roomCode] || socket.id !== rooms[roomCode].host) return;
    
    rooms[roomCode].gameActive = true;
    
    // Initialize game items for this room
    gameItems[roomCode] = [];
    
    // Spawn initial items
    for (let i = 0; i < MAX_ITEMS; i++) {
      setTimeout(() => spawnItem(roomCode), i * 500);
    }
    
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
      rooms[roomCode].players[key].velocity = { x: 0, y: 0 };
      rooms[roomCode].players[key].speedBoostActive = false;
      rooms[roomCode].players[key].speedBoostEndTime = 0;
    });
    rooms[roomCode].gameActive = false;
    
    // Clear game items
    delete gameItems[roomCode];
    
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

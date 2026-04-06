# Socket Game 🎮

A real-time multiplayer couch game built with Node.js, Socket.IO, and React. Perfect for local multiplayer gaming from phones and computers.

## Project Structure

```
socket-game/
├── server/           # Node.js + Socket.IO backend (TypeScript)
│   ├── index.ts     # Main server file
│   ├── tsconfig.json
│   └── package.json
├── client/           # React frontend (TypeScript)
│   ├── public/
│   ├── src/
│   │   ├── components/   # Game components
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── types/
│   ├── tsconfig.json
│   └── package.json
└── README.md
```

## Features

- ✨ Real-time multiplayer gameplay using WebSockets
- 📱 Mobile-friendly responsive design
- 🎯 Player movement and actions
- 🏆 Score tracking
- 🎨 Beautiful gradient UI with canvas-based game rendering
- 🔄 Game state synchronization across all players
- 🛡️ TypeScript for type safety and better development experience

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation & Running

#### 1. Backend Setup

```bash
cd server
npm install
npm run build  # Compile TypeScript to JavaScript
npm start      # Run the compiled server
```

For development with hot-reload:
```bash
npm run dev    # Runs with ts-node and nodemon
```

The server will run on `http://localhost:3001`

#### 2. Frontend Setup (in a new terminal)

```bash
cd client
npm install
npm start
```

The frontend will run on `http://localhost:3000`

### Development

For development with hot-reload:

**Server:**
```bash
cd server
npm run dev  # TypeScript with auto-reload
```

**Client:**
```bash
cd client
npm start  # React development server with TypeScript
```

## How to Play

1. **Join**: Enter your player name and click "Join Game"
2. **Wait**: Wait for the game host to start the game
3. **Play**: Click on the game canvas to move your character
4. **Score**: Earn points through player actions
5. **End**: Click "End Game" when finished

## Game Architecture

### Server (Socket.IO Events)

- `join` - Player joins the game
- `playerMove` - Player moves to a new position
- `playerAction` - Player performs an action (click, etc.)
- `startGame` - Host starts the game
- `resetGame` - End the current game
- `disconnect` - Player disconnects

### Client

- `GameLobby` - Join screen
- `GameCanvas` - Main game arena with canvas rendering
- `App` - Main component managing socket connections

## Customization

### Adding Game Mechanics

Edit `server/index.js` to add new game logic:
- Collision detection
- Score calculation
- Power-ups
- Different game modes

Edit `client/src/components/GameCanvas.js` to:
- Change visual rendering
- Add new UI elements
- Implement different game mechanics

### Broadcasting Events

Add new socket events to sync state:

```javascript
// Server
socket.on('customEvent', (data) => {
  io.emit('customEventUpdate', data);
});

// Client
socket.on('customEventUpdate', (data) => {
  // Handle update
});
```

## Deployment

### Building for Production

```bash
cd client
npm run build
```

The build folder can be served by the Express server in production.

### Environment Variables

Create a `.env` file in the client directory:

```
REACT_APP_SOCKET_URL=https://your-server.com
```

## Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: React, Socket.IO Client
- **Styling**: CSS3
- **Rendering**: HTML5 Canvas

## Contributing

Feel free to fork and submit pull requests for new features and improvements!

## License

MIT License - feel free to use this for your projects!

---

Made with ❤️ for local multiplayer gaming fun!

A real-time socket-based game application.

## Getting Started

To get started with this project, clone the repository and follow the setup instructions.

## Installation

```bash
npm install
```

## Running

```bash
npm start
```

## License

MIT

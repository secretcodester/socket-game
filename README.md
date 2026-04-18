# Socket Game 🎮

A real-time multiplayer couch game built with Node.js, Socket.IO, and React. Perfect for local multiplayer gaming from phones and computers.

## Project Structure

```
socket-game/
├── server/           # Node.js + Socket.IO backend
│   ├── index.js     # Main server file
│   └── package.json
├── client/           # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/   # Game components
│   │   ├── App.js
│   │   └── index.js
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

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation & Running

#### 1. Backend Setup

```bash
cd server
npm install
npm start  # or npm run dev for development with auto-reload
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
npm install nodemon --save-dev
npm run dev
```

**Client:**
```bash
cd client
npm install
npm start
```

## How to Play

1. **Join**: Enter your player name and click "Join Game"
2. **Wait**: Wait for the game host to start the game
3. **Play**: Click on the game canvas to move your character
4. **Score**: Earn points through player actions
5. **End**: Click "End Game" when finished

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

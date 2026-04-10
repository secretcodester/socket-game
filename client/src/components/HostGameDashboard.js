import React, { useEffect, useRef } from 'react';
import './HostGameDashboard.css';

export const HostGameDashboard = ({ players, roomCode, onReset }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#16213e';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw players (as observers, host doesn't control)
      Object.values(players).forEach((player, index) => {
        const x = (player.position?.x || 0) + 200 + index * 60;
        const y = (player.position?.y || 0) + 200;

        // Draw player circle
        ctx.fillStyle = '#667eea';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();

        // Draw border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, x, y + 40);

        // Draw score
        ctx.font = '12px Arial';
        ctx.fillStyle = '#bbb';
        ctx.fillText(`Score: ${player.score || 0}`, x, y + 56);
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [players]);

  return (
    <div className="host-dashboard">
      <div className="dashboard-header">
        <h1>🎮 Game in Progress</h1>
        <div className="header-info">
          <span className="room-code">Room: {roomCode}</span>
          <span className="player-count">Active Players: {Object.keys(players).length}</span>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="game-view">
          <canvas
            ref={canvasRef}
            width={1000}
            height={650}
            className="game-canvas"
          />
        </div>

        <div className="scoreboard">
          <h2>Leaderboard</h2>
          <div className="leaderboard-list">
            {Object.values(players).length > 0 ? (
              Object.values(players)
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map((player, index) => (
                  <div key={player.id} className="leaderboard-entry">
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{player.name}</span>
                    <span className="score">{player.score || 0}</span>
                  </div>
                ))
            ) : (
              <div className="no-players">No active players</div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <button className="reset-button" onClick={onReset}>
          End Game
        </button>
      </div>
    </div>
  );
}

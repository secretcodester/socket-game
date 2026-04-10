import React, { useEffect, useRef } from 'react';
import './HostGameDashboard.css';

export const HostGameDashboard = ({ players, roomCode, gameItems, speedBoosts, onReset }) => {
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
      Object.values(players).forEach((player) => {
        const x = 400 + (player.position?.x || 0);
        const y = 300 + (player.position?.y || 0);
        const isSpeedBoosting = speedBoosts[player.id]?.active;

        // Draw player circle
        ctx.fillStyle = isSpeedBoosting ? '#ff6b35' : '#667eea'; // Orange for speed boost
        ctx.beginPath();
        ctx.arc(x, y, isSpeedBoosting ? 30 : 25, 0, Math.PI * 2); // Slightly larger when boosting
        ctx.fill();

        // Draw border
        ctx.strokeStyle = isSpeedBoosting ? '#fff' : '#fff';
        ctx.lineWidth = isSpeedBoosting ? 3 : 2;
        ctx.stroke();

        // Draw speed boost effect
        if (isSpeedBoosting) {
          ctx.strokeStyle = '#ff6b35';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 35, 0, Math.PI * 2);
          ctx.stroke();
          
          // Draw speed lines
          ctx.strokeStyle = '#ff6b35';
          ctx.lineWidth = 2;
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const startX = x + Math.cos(angle) * 30;
            const startY = y + Math.sin(angle) * 30;
            const endX = x + Math.cos(angle) * 40;
            const endY = y + Math.sin(angle) * 40;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }
        }

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

      // Draw game items
      gameItems.forEach((item) => {
        const x = 400 + item.x;
        const y = 300 + item.y;

        // Draw coin/item
        ctx.fillStyle = '#ffd700'; // Gold color
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Draw border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw sparkle effect
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x - 5, y - 5, 3, 0, Math.PI * 2);
        ctx.arc(x + 5, y - 5, 3, 0, Math.PI * 2);
        ctx.arc(x - 5, y + 5, 3, 0, Math.PI * 2);
        ctx.arc(x + 5, y + 5, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [players, gameItems]);

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

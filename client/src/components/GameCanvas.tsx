import React, { useEffect, useRef } from 'react';
import './GameCanvas.css';

export const GameCanvas = ({ players, myId, onReset, isHost }) => {
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

      // Draw players
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
  }, [players, myId]);

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>🎮 Game in Progress</h1>
        <span className="player-count">Players: {Object.keys(players).length}</span>
      </div>
      
      <canvas
        ref={canvasRef}
        width={1000}
        height={700}
        className="game-canvas"
      />

      <div className="game-footer">
        <div className="controls-info">
          <p>Players are controlling their characters from their phones</p>
        </div>
        {isHost && (
          <button className="reset-button" onClick={onReset}>
            End Game
          </button>
        )}
      </div>
    </div>
  );
}

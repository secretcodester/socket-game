import React, { useEffect, useRef, useState } from 'react';
import './GameCanvas.css';

function GameCanvas({ players, myId, onMove, onAction, onReset }) {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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
        const x = (player.position?.x || 0) + 100 + index * 60;
        const y = (player.position?.y || 0) + 100;

        // Draw player circle
        const isMe = player.id === myId;
        ctx.fillStyle = isMe ? '#667eea' : '#764ba2';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();

        // Draw border
        ctx.strokeStyle = isMe ? '#fff' : '#e0e0e0';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, x, y + 35);

        // Draw score
        ctx.font = '11px Arial';
        ctx.fillStyle = '#999';
        ctx.fillText(`Score: ${player.score || 0}`, x, y + 50);
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

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 100;
    const y = e.clientY - rect.top - 100;

    onMove({ x, y });
    onAction('click');
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>🎮 Game in Progress</h1>
        <span className="player-count">Players: {Object.keys(players).length}</span>
      </div>
      
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        className="game-canvas"
      />

      <div className="game-footer">
        <div className="controls-info">
          <p>Click on the canvas to move your character</p>
        </div>
        <button className="reset-button" onClick={onReset}>
          End Game
        </button>
      </div>
    </div>
  );
}

export default GameCanvas;

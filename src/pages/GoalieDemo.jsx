// GoalieDemo.jsx - Samostatná demo stránka pro zobrazení brankáře
import React, { useEffect, useRef, useState } from 'react';
import { Goalie, drawGoalie, GoalieController } from '../components/Goalie';

// Jednoduchá kamera (stejná jako v Rink.jsx)
class Camera {
  constructor(distance = 300, angleX = 30, angleY = 0, fov = 400) {
    this.distance = distance;
    this.angleX = angleX;
    this.angleY = angleY;
    this.fov = fov;
    this.centerX = 0;
    this.centerY = 0;
    this.centerZ = 0;
  }

  project(x, y, z, canvasWidth, canvasHeight) {
    let tx = x - this.centerX;
    let ty = y - this.centerY;
    let tz = z - this.centerZ;

    const radX = (this.angleX * Math.PI) / 180;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const ty2 = ty * cosX - tz * sinX;
    const tz2 = ty * sinX + tz * cosX;
    ty = ty2;
    tz = tz2;

    const radY = (this.angleY * Math.PI) / 180;
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);
    const tx2 = tx * cosY + tz * sinY;
    const tz3 = -tx * sinY + tz * cosY;
    tx = tx2;
    tz = tz3;

    const scale = this.fov / (this.fov + tz + this.distance);
    const projX = tx * scale + canvasWidth / 2;
    const projY = ty * scale + canvasHeight / 2;

    return { x: projX, y: projY, z: tz, scale };
  }
}

export default function GoalieDemo() {
  const canvasRef = useRef(null);
  const [goalie] = useState(() => new Goalie(400, 300, 30));
  const goalieControllerRef = useRef(null);
  const [camera] = useState(() => new Camera(300, 30, 0, 400));
  const [showDebug, setShowDebug] = useState(true);

  useEffect(() => {
    // Inicializace controlleru
    goalieControllerRef.current = new GoalieController(goalie);

    return () => {
      if (goalieControllerRef.current) {
        goalieControllerRef.current.cleanup();
      }
    };
  }, [goalie]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let animationFrameId;

    const animate = () => {
      // Clear
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, height);

      // Update brankáře
      if (goalieControllerRef.current) {
        goalieControllerRef.current.update();
      }

      // Nakresli jednoduchý led
      ctx.fillStyle = '#b8e6f5';
      ctx.fillRect(0, height * 0.6, width, height * 0.4);

      // Střední čára
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.6);
      ctx.lineTo(width, height * 0.6);
      ctx.stroke();

      // Vykresli brankáře
      drawGoalie(ctx, goalie, camera, width, height, showDebug);

      // Info panel
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 280, 180);
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 280, 180);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('🥅 BRANKÁŘ DEMO', 20, 35);

      ctx.font = '14px Arial';
      ctx.fillStyle = '#00ff88';
      ctx.fillText(`Pozice: (${Math.round(goalie.x)}, ${Math.round(goalie.y)})`, 20, 60);
      ctx.fillText(`Číslo: #${goalie.number}`, 20, 80);
      ctx.fillText(`Stav: ${goalie.stance}`, 20, 100);

      ctx.fillStyle = '#ffff00';
      ctx.font = '12px Arial';
      ctx.fillText('A/D - Pohyb do stran', 20, 125);
      ctx.fillText('W/S - Vpřed/Vzad', 20, 140);
      ctx.fillText('Q/E - Záchrana L/R', 20, 155);
      ctx.fillText('MEZERNÍK - Motýlek', 20, 170);

      // Stance indicator
      if (goalie.stance !== 'ready') {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(goalie.stance.toUpperCase(), width / 2, 100);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [goalie, camera, showDebug]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0f0f1e 0%, #1a1a2e 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '2px solid #00ff88'
      }}>
        <h1 style={{
          color: '#00ff88',
          margin: '0 0 10px 0',
          fontSize: '32px',
          textAlign: 'center'
        }}>
          🥅 Hokejový Brankář - Demo
        </h1>
        <p style={{
          color: '#ffffff',
          margin: 0,
          textAlign: 'center'
        }}>
          Testovací stránka pro 3D brankáře
        </p>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          border: '4px solid #00ff88',
          borderRadius: '10px',
          boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)'
        }}
      />

      <div style={{
        marginTop: '20px',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => setShowDebug(!showDebug)}
          style={{
            padding: '10px 20px',
            background: showDebug ? '#00ff88' : '#666',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {showDebug ? '✓ Debug Mode' : '○ Debug Mode'}
        </button>
        
        <button
          onClick={() => {
            goalie.x = 400;
            goalie.y = 300;
            goalie.resetStance();
          }}
          style={{
            padding: '10px 20px',
            background: '#ff6600',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ↺ Reset Pozice
        </button>

        <button
          onClick={() => goalie.saveLeft()}
          style={{
            padding: '10px 20px',
            background: '#ff0000',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Zákrok Vlevo
        </button>

        <button
          onClick={() => goalie.saveRight()}
          style={{
            padding: '10px 20px',
            background: '#ff0000',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Zákrok Vpravo →
        </button>

        <button
          onClick={() => goalie.butterfly()}
          style={{
            padding: '10px 20px',
            background: '#9900ff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🦋 Motýlek
        </button>
      </div>

      <div style={{
        marginTop: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '10px',
        maxWidth: '600px',
        color: '#ccc',
        fontSize: '14px',
        border: '1px solid #444'
      }}>
        <h3 style={{ color: '#00ff88', margin: '0 0 10px 0' }}>📝 Poznámky:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Brankář má větší postavu kvůli výstroji</li>
          <li>Bílé betony (chrániče nohou)</li>
          <li>Hnědá lapačka (catching glove) na levé ruce</li>
          <li>Bílá vyrážečka (blocker) na pravé ruce</li>
          <li>Širší brankářská hokejka</li>
          <li>Animace zákroků a motýlku</li>
        </ul>
      </div>
    </div>
  );
}

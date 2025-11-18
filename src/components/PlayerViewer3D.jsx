// PlayerViewer3D_WORKING.jsx - Funkční verze stejná jako demo
import React, { useRef, useEffect, useState } from 'react';
import { Player } from './Player';

// 3D Camera - STEJNÁ JAKO V DEMO!
class Camera {
  constructor(distance = 1200, angleX = 30, angleY = 0, fov = 600) {
    this.distance = distance;
    this.angleX = angleX;
    this.angleY = angleY;
    this.fov = fov;
    this.centerX = 0;
    this.centerY = 0;
    this.centerZ = 0;
  }

  project(x, y, z, canvasWidth, canvasHeight) {
    // Střed kamery
    let tx = x - this.centerX;
    let ty = y - this.centerY;
    let tz = z - this.centerZ;

    // Rotace kolem Y osy (horizontální otáčení)
    const radY = (this.angleY * Math.PI) / 180;
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);
    const tx2 = tx * cosY + tz * sinY;
    const tz2 = -tx * sinY + tz * cosY;
    tx = tx2;
    tz = tz2;

    // Rotace kolem X osy (vertikální naklánění) 
    const radX = (this.angleX * Math.PI) / 180;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const ty2 = ty * cosX - tz * sinX;
    const tz3 = ty * sinX + tz * cosX;
    ty = ty2;
    tz = tz3;

    // Projekce
    const scale = this.fov / (this.fov + tz + this.distance);
    const projX = tx * scale + canvasWidth / 2;
    const projY = ty * scale + canvasHeight / 2;

    return { x: projX, y: projY, z: tz, scale };
  }
}

export default function PlayerViewer3D({ 
  width = 700, 
  height = 600,
  playerNumber = 99,
  teamColor = '#ff0000'
}) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  
  // Nastavení kamery - BLIŽŠÍ POHLED!
  const [cameraDistance, setCameraDistance] = useState(250); // BLÍŽE než v demo (bylo 400)
  const [cameraAngleX, setCameraAngleX] = useState(90); // Začínáme Z BOKU
  const [cameraAngleY, setCameraAngleY] = useState(0);
  const [cameraFov, setCameraFov] = useState(500); // Větší FOV = větší objekty
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragAngles, setDragAngles] = useState({ x: 90, y: 0 });
  
  const playerRef = useRef(null);
  const animationRef = useRef(null);

  // Vytvořit hráče
  useEffect(() => {
    playerRef.current = new Player(0, 0, playerNumber, teamColor);
    playerRef.current.rotation = 0;
  }, [playerNumber, teamColor]);

  // Plynulý přechod mezi pohledy
  const smoothTransition = (targetAngleX, targetAngleY, targetDistance, duration = 800) => {
    const startAngleX = cameraAngleX;
    const startAngleY = cameraAngleY;
    const startDistance = cameraDistance;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setCameraAngleX(startAngleX + (targetAngleX - startAngleX) * eased);
      setCameraAngleY(startAngleY + (targetAngleY - startAngleY) * eased);
      setCameraDistance(startDistance + (targetDistance - startDistance) * eased);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  // Auto-rotace
  useEffect(() => {
    if (!autoRotate) return;
    
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
      if (!isDragging) {
        setCameraAngleY(prev => (prev + 0.5) % 360);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  // Ovládání myší
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setAutoRotate(false);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragAngles({ x: cameraAngleX, y: cameraAngleY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setCameraAngleY(dragAngles.y + deltaX * 0.5);
    const newAngleX = Math.max(0, Math.min(90, dragAngles.x - deltaY * 0.3));
    setCameraAngleX(newAngleX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 20 : -20;
    setCameraDistance(prev => Math.max(100, Math.min(1000, prev + delta)));
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  // HLAVNÍ RENDER LOOP - STEJNÝ JAKO V DEMO!
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !playerRef.current) return;

    const ctx = canvas.getContext('2d');
    const player = playerRef.current;

    const animate = () => {
      // Vyčistit canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);
      
      // Gradient pozadí
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
      gradient.addColorStop(0, '#1e293b');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Vytvořit kameru - STEJNÉ NASTAVENÍ JAKO V DEMO!
      const camera = new Camera(cameraDistance, cameraAngleX, cameraAngleY, cameraFov);
      camera.centerX = 0;
      camera.centerY = 0;
      camera.centerZ = -30; // Ve výšce těla

      // NAKRESLIT LED (z=0)
      const iceSize = 200;
      const iceCorners = [
        { x: -iceSize, y: -iceSize, z: 0 },
        { x: iceSize, y: -iceSize, z: 0 },
        { x: iceSize, y: iceSize, z: 0 },
        { x: -iceSize, y: iceSize, z: 0 }
      ];
      
      ctx.strokeStyle = 'rgba(100, 150, 200, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const p0 = camera.project(iceCorners[0].x, iceCorners[0].y, iceCorners[0].z, width, height);
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < iceCorners.length; i++) {
        const p = camera.project(iceCorners[i].x, iceCorners[i].y, iceCorners[i].z, width, height);
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(200, 230, 255, 0.1)';
      ctx.fill();
      
      // Mřížka na ledě
      ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        // Podélné čáry
        const start1 = camera.project(i * 50, -iceSize, 0, width, height);
        const end1 = camera.project(i * 50, iceSize, 0, width, height);
        ctx.beginPath();
        ctx.moveTo(start1.x, start1.y);
        ctx.lineTo(end1.x, end1.y);
        ctx.stroke();
        
        // Příčné čáry
        const start2 = camera.project(-iceSize, i * 50, 0, width, height);
        const end2 = camera.project(iceSize, i * 50, 0, width, height);
        ctx.beginPath();
        ctx.moveTo(start2.x, start2.y);
        ctx.lineTo(end2.x, end2.y);
        ctx.stroke();
      }
      
      // Červená střední čára
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.lineWidth = 3;
      const redStart = camera.project(-iceSize, 0, 0, width, height);
      const redEnd = camera.project(iceSize, 0, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(redStart.x, redStart.y);
      ctx.lineTo(redEnd.x, redEnd.y);
      ctx.stroke();

      // HRÁČ - PŘESNĚ JAKO V DEMO!
      const playerX = 0;
      const playerY = 0;
      
      // Animace
      const legPhase = Date.now() * 0.003;
      const legSwing = Math.sin(legPhase) * 10;
      const bodySwing = Math.sin(Date.now() * 0.002) * 2;
      
      // Rotace hráče
      const rotRad = (rotation * Math.PI) / 180;
      const rotatePoint = (x, y) => {
        const dx = x - playerX;
        const dy = y - playerY;
        return {
          x: playerX + (dx * Math.cos(rotRad) - dy * Math.sin(rotRad)),
          y: playerY + (dx * Math.sin(rotRad) + dy * Math.cos(rotRad))
        };
      };
      
      // Pozice částí těla
      const leftPos = rotatePoint(playerX - 15, playerY + legSwing);
      const rightPos = rotatePoint(playerX + 15, playerY - legSwing);
      
      // ČÁSTI TĚLA S FIXNÍMI VÝŠKAMI - PŘESNĚ JAKO V DEMO!
      const bodyParts = [
        { name: 'Brusle L', x: leftPos.x, y: leftPos.y, z: 0, color: '#333', size: 25 },
        { name: 'Brusle P', x: rightPos.x, y: rightPos.y, z: 0, color: '#333', size: 25 },
        { name: 'Noha L dolní', x: leftPos.x, y: leftPos.y, z: -15, color: '#1e3a5f', size: 20 },
        { name: 'Noha P dolní', x: rightPos.x, y: rightPos.y, z: -15, color: '#1e3a5f', size: 20 },
        { name: 'Tělo', x: playerX, y: playerY + bodySwing, z: -35, color: teamColor, size: 40 },
        { name: 'Hlava', x: playerX, y: playerY, z: -55, color: player.lighten(teamColor, 1.2), size: 30 }
      ];
      
      // Stín
      const shadowP = camera.project(playerX, playerY + 5, 1, width, height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(shadowP.x, shadowP.y, 50 * shadowP.scale, 25 * shadowP.scale, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // SPOJIT ČÁSTI TĚLA ČARAMI - JAKO V DEMO!
      // Levá noha
      const leftFoot = camera.project(leftPos.x, leftPos.y, 0, width, height);
      const leftKnee = camera.project(leftPos.x, leftPos.y, -15, width, height);
      const leftHip = camera.project(playerX - 10, playerY, -30, width, height);
      
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 10 * leftFoot.scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(leftFoot.x, leftFoot.y);
      ctx.lineTo(leftKnee.x, leftKnee.y);
      ctx.lineTo(leftHip.x, leftHip.y);
      ctx.stroke();
      
      // Pravá noha
      const rightFoot = camera.project(rightPos.x, rightPos.y, 0, width, height);
      const rightKnee = camera.project(rightPos.x, rightPos.y, -15, width, height);
      const rightHip = camera.project(playerX + 10, playerY, -30, width, height);
      
      ctx.beginPath();
      ctx.moveTo(rightFoot.x, rightFoot.y);
      ctx.lineTo(rightKnee.x, rightKnee.y);
      ctx.lineTo(rightHip.x, rightHip.y);
      ctx.stroke();
      
      // Tělo k hlavě
      const body = camera.project(playerX, playerY + bodySwing, -35, width, height);
      const head = camera.project(playerX, playerY, -55, width, height);
      
      ctx.strokeStyle = player.darken(teamColor, 0.7);
      ctx.lineWidth = 12 * body.scale;
      ctx.beginPath();
      ctx.moveTo(body.x, body.y);
      ctx.lineTo(head.x, head.y);
      ctx.stroke();
      
      // NAKRESLIT ČÁSTI TĚLA
      const projectedParts = bodyParts.map(part => {
        const p = camera.project(part.x, part.y, part.z, width, height);
        return { ...part, projected: p };
      });
      
      // Seřadit podle vzdálenosti
      projectedParts.sort((a, b) => a.projected.z - b.projected.z);
      
      // Vykreslit části
      projectedParts.forEach(part => {
        const p = part.projected;
        const size = part.size * p.scale;
        
        if (part.name.includes('Brusle')) {
          // Brusle
          ctx.fillStyle = part.color;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y - 5 * p.scale, size * 0.8, size * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2 * p.scale;
          ctx.stroke();
          
          // Čepel
          ctx.strokeStyle = '#c0c0c0';
          ctx.lineWidth = 4 * p.scale;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x - size * 0.7, p.y);
          ctx.lineTo(p.x + size * 0.7, p.y);
          ctx.stroke();
          
        } else if (part.name === 'Tělo') {
          // Tělo s dresem
          ctx.save();
          ctx.translate(p.x, p.y);
          
          const grad = ctx.createRadialGradient(-size * 0.3, -size * 0.3, 0, 0, 0, size);
          grad.addColorStop(0, player.lighten(part.color, 1.5));
          grad.addColorStop(0.4, player.lighten(part.color, 1.2));
          grad.addColorStop(0.7, part.color);
          grad.addColorStop(1, player.darken(part.color, 0.6));
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(0, 0, size, size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = player.darken(part.color, 0.4);
          ctx.lineWidth = 3 * p.scale;
          ctx.stroke();
          
          // Číslo
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${size * 0.6}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 4 * p.scale;
          ctx.strokeText(playerNumber, 0, 0);
          ctx.fillText(playerNumber, 0, 0);
          
          ctx.restore();
          
        } else if (part.name === 'Hlava') {
          // Helma
          ctx.save();
          ctx.translate(p.x, p.y);
          
          const grad = ctx.createRadialGradient(-size * 0.25, -size * 0.25, 0, 0, 0, size);
          grad.addColorStop(0, player.lighten(teamColor, 1.7));
          grad.addColorStop(0.3, player.lighten(teamColor, 1.4));
          grad.addColorStop(0.7, player.lighten(teamColor, 1.1));
          grad.addColorStop(1, teamColor);
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = player.darken(teamColor, 0.4);
          ctx.lineWidth = 3 * p.scale;
          ctx.stroke();
          
          // Odlesk
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.ellipse(-size * 0.3, -size * 0.3, size * 0.4, size * 0.3, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Mřížka
          ctx.strokeStyle = 'rgba(60, 60, 60, 0.7)';
          ctx.lineWidth = 2 * p.scale;
          for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(i * size * 0.2, size * 0.1);
            ctx.lineTo(i * size * 0.18, size * 0.5);
            ctx.stroke();
          }
          
          ctx.restore();
          
        } else {
          // Ostatní části (nohy)
          ctx.fillStyle = part.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = player.darken(part.color, 0.5);
          ctx.lineWidth = 2 * p.scale;
          ctx.stroke();
        }
      });
      
      // UI Text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(`#${playerNumber}`, width / 2, 50);
      
      ctx.font = '20px Arial';
      ctx.fillStyle = player.lighten(teamColor, 1.3);
      ctx.fillText('HOKEJOVÝ TÝM', width / 2, 80);
      ctx.shadowBlur = 0;
      
      // Debug info
      ctx.font = '12px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'left';
      ctx.fillText(`Kamera: X=${Math.round(cameraAngleX)}° Y=${Math.round(cameraAngleY)}° Vzdálenost=${cameraDistance}`, 10, height - 20);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, rotation, playerNumber, teamColor, cameraDistance, cameraAngleX, cameraAngleY, cameraFov]);

  return (
    <div className="relative bg-gray-900 p-4 rounded-2xl">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-xl border-2 border-blue-500/30 shadow-2xl cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ touchAction: 'none' }}
      />
      
      <div className="mt-4 space-y-4">
        {/* Hlavní tlačítka */}
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              autoRotate ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {autoRotate ? '⏸️ Zastavit' : '▶️ Spustit'} auto-rotaci
          </button>
          
          <button
            onClick={() => {
              setRotation(0);
              setCameraAngleX(90);
              setCameraAngleY(0);
              setCameraDistance(250);
            }}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold"
          >
            🔄 Reset
          </button>
        </div>

        {/* Rychlé pohledy */}
        <div className="flex gap-2 justify-center flex-wrap">
          <button onClick={() => smoothTransition(0, cameraAngleY, 300, 800)} 
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-bold">
            🔼 Shora
          </button>
          <button onClick={() => smoothTransition(90, cameraAngleY, 250, 800)} 
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-bold">
            ➡️ Z boku
          </button>
          <button onClick={() => smoothTransition(45, 45, 280, 800)} 
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-bold">
            📐 3D pohled
          </button>
        </div>

        {/* Posuvníky */}
        <div className="space-y-3 bg-gray-800 p-3 rounded-lg">
          <div>
            <label className="text-gray-300 text-sm font-bold block mb-1">
              ↕️ Výška pohledu: {Math.round(cameraAngleX)}°
            </label>
            <input
              type="range"
              min="0"
              max="90"
              value={cameraAngleX}
              onChange={(e) => setCameraAngleX(Number(e.target.value))}
              className="w-full accent-green-500"
            />
            <div className="text-xs text-gray-500">0° = shora, 90° = z boku</div>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-bold block mb-1">
              ↔️ Rotace kolem: {Math.round(cameraAngleY % 360)}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={cameraAngleY % 360}
              onChange={(e) => setCameraAngleY(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm font-bold block mb-1">
              🔍 Vzdálenost: {cameraDistance}
            </label>
            <input
              type="range"
              min="100"
              max="1000"
              value={cameraDistance}
              onChange={(e) => setCameraDistance(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm font-bold block mb-1">
              🔄 Rotace hráče: {rotation}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 space-y-1">
          <p className="text-green-400 font-bold">✅ FUNGUJE STEJNĚ JAKO DEMO!</p>
          <p>🖱️ Táhni myší = otáčení | Kolečko = zoom</p>
        </div>
      </div>
    </div>
  );
}
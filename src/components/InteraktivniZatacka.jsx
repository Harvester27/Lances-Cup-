import React, { useState } from 'react';

export default function InteraktivniZatacka() {
  const centerX = 300;
  const centerY = 300;
  const scale = 8;
  
  const innerRadius = 5 * scale;
  const outerRadius = 15 * scale;
  const rotY = 0;
  
  // Zatáčka - 4 rohové body
  const innerStart = {
    x: centerX + Math.cos(rotY) * innerRadius,
    y: centerY - Math.sin(rotY) * innerRadius
  };
  const innerEnd = {
    x: centerX + Math.cos(rotY + Math.PI/2) * innerRadius,
    y: centerY - Math.sin(rotY + Math.PI/2) * innerRadius
  };
  const outerStart = {
    x: centerX + Math.cos(rotY) * outerRadius,
    y: centerY - Math.sin(rotY) * outerRadius
  };
  const outerEnd = {
    x: centerX + Math.cos(rotY + Math.PI/2) * outerRadius,
    y: centerY - Math.sin(rotY + Math.PI/2) * outerEnd
  };
  
  // Stavové proměnné pro pozice rovných částí
  const [track1Pos, setTrack1Pos] = useState({ x: centerX + 30 * scale, y: centerY });
  const [track2Pos, setTrack2Pos] = useState({ x: centerX, y: centerY - 30 * scale });
  const [dragging, setDragging] = useState(null);
  
  const track1Width = 10 * scale;
  const track1Length = 10 * scale;
  const track2Width = 10 * scale;
  const track2Length = 10 * scale;
  
  const handleMouseDown = (trackId) => (e) => {
    setDragging(trackId);
  };
  
  const handleMouseMove = (e) => {
    if (!dragging) return;
    
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    
    if (dragging === 'track1') {
      setTrack1Pos({ x: svgP.x, y: svgP.y });
    } else if (dragging === 'track2') {
      setTrack2Pos({ x: svgP.x, y: svgP.y });
    }
  };
  
  const handleMouseUp = () => {
    setDragging(null);
  };

  return (
    <div className="bg-slate-900 min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-white text-3xl font-bold mb-4">🖱️ INTERAKTIVNÍ - Táhni rovné části myší!</h1>
        
        <svg 
          width="700" 
          height="700" 
          className="bg-slate-800 rounded-lg border-2 border-blue-500 cursor-move"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Mřížka */}
          {[...Array(15)].map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i * 50} y1="0" x2={i * 50} y2="700" stroke="#334155" strokeWidth="1" />
              <line x1="0" y1={i * 50} x2="700" y2={i * 50} stroke="#334155" strokeWidth="1" />
            </React.Fragment>
          ))}
          
          {/* ZATÁČKA */}
          <path
            d={`
              M ${innerStart.x} ${innerStart.y}
              L ${outerStart.x} ${outerStart.y}
              A ${outerRadius} ${outerRadius} 0 0 0 ${outerEnd.x} ${outerEnd.y}
              L ${innerEnd.x} ${innerEnd.y}
              A ${innerRadius} ${innerRadius} 0 0 1 ${innerStart.x} ${innerStart.y}
            `}
            fill="rgba(185, 68, 46, 0.5)"
            stroke="#3b82f6"
            strokeWidth="3"
          />
          
          {/* KONCE ZATÁČKY */}
          <line 
            x1={innerStart.x} 
            y1={innerStart.y}
            x2={outerStart.x}
            y2={outerStart.y}
            stroke="#00ffff"
            strokeWidth="6"
          />
          <text 
            x={(innerStart.x + outerStart.x) / 2 + 15} 
            y={(innerStart.y + outerStart.y) / 2} 
            fill="#00ffff" 
            fontSize="16" 
            fontWeight="bold"
          >
            ZAČÁTEK ZATÁČKY
          </text>
          
          <line 
            x1={innerEnd.x} 
            y1={innerEnd.y}
            x2={outerEnd.x}
            y2={outerEnd.y}
            stroke="#ff00ff"
            strokeWidth="6"
          />
          <text 
            x={(innerEnd.x + outerEnd.x) / 2 - 140} 
            y={(innerEnd.y + outerEnd.y) / 2 + 20} 
            fill="#ff00ff" 
            fontSize="16" 
            fontWeight="bold"
          >
            KONEC ZATÁČKY
          </text>
          
          {/* Střed zatáčky */}
          <circle cx={centerX} cy={centerY} r="6" fill="#ef4444" />
          <text x={centerX + 10} y={centerY - 10} fill="#ef4444" fontSize="16" fontWeight="bold">STŘED</text>
          
          {/* 4 rohové body */}
          <circle cx={innerStart.x} cy={innerStart.y} r="8" fill="#22c55e" stroke="white" strokeWidth="2" />
          <circle cx={innerEnd.x} cy={innerEnd.y} r="8" fill="#22c55e" stroke="white" strokeWidth="2" />
          <circle cx={outerStart.x} cy={outerStart.y} r="8" fill="#eab308" stroke="white" strokeWidth="2" />
          <circle cx={outerEnd.x} cy={outerEnd.y} r="8" fill="#eab308" stroke="white" strokeWidth="2" />
          
          {/* ROVNÁ ČÁST 1 - POHYBLIVÁ */}
          <g 
            onMouseDown={handleMouseDown('track1')}
            style={{ cursor: dragging === 'track1' ? 'grabbing' : 'grab' }}
          >
            <rect
              x={track1Pos.x - track1Length/2}
              y={track1Pos.y - track1Width/2}
              width={track1Length}
              height={track1Width}
              fill="rgba(185, 68, 46, 0.5)"
              stroke="#10b981"
              strokeWidth="4"
            />
            
            <line 
              x1={track1Pos.x - track1Length/2} 
              y1={track1Pos.y - track1Width/2}
              x2={track1Pos.x - track1Length/2}
              y2={track1Pos.y + track1Width/2}
              stroke="#fbbf24"
              strokeWidth="4"
            />
            <text x={track1Pos.x - track1Length/2 - 80} y={track1Pos.y} fill="#fbbf24" fontSize="14" fontWeight="bold">KONEC 2</text>
            
            <line 
              x1={track1Pos.x + track1Length/2} 
              y1={track1Pos.y - track1Width/2}
              x2={track1Pos.x + track1Length/2}
              y2={track1Pos.y + track1Width/2}
              stroke="#fbbf24"
              strokeWidth="4"
            />
            <text x={track1Pos.x + track1Length/2 + 10} y={track1Pos.y} fill="#fbbf24" fontSize="14" fontWeight="bold">KONEC 1</text>
          </g>
          
          {/* ROVNÁ ČÁST 2 - POHYBLIVÁ */}
          <g 
            onMouseDown={handleMouseDown('track2')}
            style={{ cursor: dragging === 'track2' ? 'grabbing' : 'grab' }}
          >
            <rect
              x={track2Pos.x - track2Width/2}
              y={track2Pos.y - track2Length/2}
              width={track2Width}
              height={track2Length}
              fill="rgba(185, 68, 46, 0.5)"
              stroke="#8b5cf6"
              strokeWidth="4"
            />
            
            <line 
              x1={track2Pos.x - track2Width/2} 
              y1={track2Pos.y - track2Length/2}
              x2={track2Pos.x + track2Width/2}
              y2={track2Pos.y - track2Length/2}
              stroke="#f97316"
              strokeWidth="4"
            />
            <text x={track2Pos.x - 35} y={track2Pos.y - track2Length/2 - 10} fill="#f97316" fontSize="14" fontWeight="bold">KONEC 2</text>
            
            <line 
              x1={track2Pos.x - track2Width/2} 
              y1={track2Pos.y + track2Length/2}
              x2={track2Pos.x + track2Width/2}
              y2={track2Pos.y + track2Length/2}
              stroke="#f97316"
              strokeWidth="4"
            />
            <text x={track2Pos.x - 35} y={track2Pos.y + track2Length/2 + 20} fill="#f97316" fontSize="14" fontWeight="bold">KONEC 1</text>
          </g>
        </svg>
        
        <div className="mt-8 bg-slate-800 p-6 rounded-lg border border-green-500">
          <h2 className="text-2xl font-bold text-green-400 mb-4">🖱️ INSTRUKCE</h2>
          <div className="space-y-3 text-white text-lg">
            <p>✅ Chyť myší zelený nebo fialový čtverec a táhni ho!</p>
            <p>✅ Dej oranžový KONEC 2 přesně na magenta čáru (KONEC ZATÁČKY)</p>
            <p>✅ Pak mi řekni jak to má být!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

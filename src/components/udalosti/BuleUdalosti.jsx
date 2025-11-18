import React, { useState, useEffect } from 'react';

export function BuleUdalosti({ 
  lancersCenter, 
  mostCenter, 
  lancersStrength, 
  mostStrength,
  lancersRoll,
  mostRoll,
  winner,
  zoneType = 'neutral', // 'neutral' (střed), 'offensive_lancers', 'offensive_most'
  timeSpeed = 1
}) {
  const [animationPhase, setAnimationPhase] = useState('start'); // start -> clash -> result

  useEffect(() => {
    // Fáze 1: Start (0-0.5s)
    const timer1 = setTimeout(() => {
      setAnimationPhase('clash');
    }, 500 / timeSpeed);

    // Fáze 2: Clash (0.5-2s)
    const timer2 = setTimeout(() => {
      setAnimationPhase('result');
    }, 2000 / timeSpeed);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []); // Prázdný array - spustí se jen při mount // Prázdný array - animace se spustí jen jednou!

  const lancersWon = winner === 'lancers';
  const winChance = (skill) => {
    const total = lancersStrength + mostStrength;
    return ((skill / total) * 100).toFixed(0);
  };

  // Název vhazování podle zóny
  const getZoneName = () => {
    if (zoneType === 'neutral') return 'VHAZOVÁNÍ - STŘED HŘIŠTĚ';
    if (zoneType === 'offensive_lancers') return 'VHAZOVÁNÍ - ÚTOČNÉ PÁSMO LANCERS';
    if (zoneType === 'offensive_most') return 'VHAZOVÁNÍ - ÚTOČNÉ PÁSMO MOST';
    return 'VHAZOVÁNÍ';
  };

  // Gradient podle zóny
  const getGradient = () => {
    if (zoneType === 'offensive_lancers') return 'from-blue-900/30 via-slate-900/40 to-blue-800/30';
    if (zoneType === 'offensive_most') return 'from-gray-900/30 via-slate-900/40 to-gray-800/30';
    return 'from-blue-900/20 via-slate-900/40 to-red-900/20';
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-purple-400 text-lg">🏒</div>
        <div className="text-white font-bold text-sm">{getZoneName()}</div>
      </div>

      {/* Hlavní arena */}
      <div className={`bg-gradient-to-r ${getGradient()} rounded-lg p-4 border border-slate-700`}>
        <div className="flex items-center justify-between gap-4">
          {/* Lancers hráč */}
          <div className={`flex-1 transition-all duration-500 ${
            animationPhase === 'result' && lancersWon 
              ? 'scale-110 -translate-x-2' 
              : animationPhase === 'result' && !lancersWon 
              ? 'opacity-50 scale-95' 
              : ''
          }`}>
            <div className={`bg-blue-900/60 rounded-lg p-3 border-2 ${
              animationPhase === 'result' && lancersWon 
                ? 'border-emerald-400 shadow-lg shadow-emerald-400/50' 
                : 'border-blue-500/50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src={lancersCenter?.photo || '/Images/Fotky/Lancers/default.png'} 
                  alt={lancersCenter?.name}
                  className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover"
                />
                <div>
                  <div className="text-white font-bold text-xs">{lancersCenter?.name || 'Neznámý'}</div>
                  <div className="text-blue-300 text-[10px]">Lancers</div>
                </div>
              </div>
              
              {/* Síla */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Síla:</span>
                  <span className="text-yellow-400 font-bold">{lancersStrength.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Šance:</span>
                  <span className="text-cyan-400 font-bold">{winChance(lancersStrength)}%</span>
                </div>
                {animationPhase === 'result' && (
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-blue-500/30">
                    <span className="text-gray-400">Hod:</span>
                    <span className="text-purple-400 font-bold">{lancersRoll.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Puk uprostřed */}
          <div className="flex-shrink-0 relative">
            <div className={`text-5xl transition-all duration-500 ${
              animationPhase === 'start' 
                ? 'animate-pulse' 
                : animationPhase === 'clash' 
                ? 'animate-shake' 
                : lancersWon 
                ? '-translate-x-8 opacity-0' 
                : 'translate-x-8 opacity-0'
            }`}>
              🏒
            </div>
            
            {/* Clash efekt */}
            {animationPhase === 'clash' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl animate-ping">💥</div>
              </div>
            )}
          </div>

          {/* Most hráč */}
          <div className={`flex-1 transition-all duration-500 ${
            animationPhase === 'result' && !lancersWon 
              ? 'scale-110 translate-x-2' 
              : animationPhase === 'result' && lancersWon 
              ? 'opacity-50 scale-95' 
              : ''
          }`}>
            <div className={`bg-gray-900/60 rounded-lg p-3 border-2 ${
              animationPhase === 'result' && !lancersWon 
                ? 'border-emerald-400 shadow-lg shadow-emerald-400/50' 
                : 'border-gray-500/50'
            }`}>
              <div className="flex items-center gap-2 mb-2 justify-end">
                <div>
                  <div className="text-white font-bold text-xs text-right">{mostCenter?.name || 'Neznámý'}</div>
                  <div className="text-gray-300 text-[10px] text-right">Most</div>
                </div>
                <img 
                  src={mostCenter?.photo || '/Images/Fotky/Krysaci/default.png'} 
                  alt={mostCenter?.name}
                  className="w-12 h-12 rounded-full border-2 border-gray-500 object-cover"
                />
              </div>
              
              {/* Síla */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-yellow-400 font-bold">{mostStrength.toFixed(1)}</span>
                  <span className="text-gray-400">Síla:</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-cyan-400 font-bold">{winChance(mostStrength)}%</span>
                  <span className="text-gray-400">Šance:</span>
                </div>
                {animationPhase === 'result' && (
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-gray-500/30">
                    <span className="text-purple-400 font-bold">{mostRoll.toFixed(2)}</span>
                    <span className="text-gray-400">Hod:</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Výsledek */}
        {animationPhase === 'result' && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className={`text-center font-bold text-sm flex items-center justify-center gap-2 ${
              lancersWon ? 'text-emerald-400' : 'text-emerald-400'
            }`}>
              <span>✅</span>
              <span>
                VYHRÁL: {lancersWon ? lancersCenter?.name : mostCenter?.name} (
                {lancersWon ? `#${lancersCenter?.number}` : `#${mostCenter?.number}`})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CSS animace */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-3px, -3px) rotate(-5deg); }
          20% { transform: translate(3px, 3px) rotate(5deg); }
          30% { transform: translate(-3px, 3px) rotate(-5deg); }
          40% { transform: translate(3px, -3px) rotate(5deg); }
          50% { transform: translate(-3px, -3px) rotate(-5deg); }
          60% { transform: translate(3px, 3px) rotate(5deg); }
          70% { transform: translate(-3px, 3px) rotate(-5deg); }
          80% { transform: translate(3px, -3px) rotate(5deg); }
          90% { transform: translate(-2px, -2px) rotate(-3deg); }
        }
        
        .animate-shake {
          animation: shake 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

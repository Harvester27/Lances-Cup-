import React, { useState, useEffect } from 'react';

export function ObrannePasmo({ 
  defender,  // {name, number, team} - hráč co získal puk
  team,      // 'lancers' nebo 'most' - bránící tým
  timeSpeed = 1
}) {
  const [animationPhase, setAnimationPhase] = useState('start'); // start -> transition

  useEffect(() => {
    // Fáze 1: Start (0-1s)
    const timer1 = setTimeout(() => {
      setAnimationPhase('transition');
    }, 1000 / timeSpeed);

    return () => {
      clearTimeout(timer1);
    };
  }, []);

  const teamEmoji = team === 'lancers' ? '🏒' : '🐀';
  const teamColor = team === 'lancers' ? 'blue' : 'gray';
  const teamName = team === 'lancers' ? 'Lancers' : 'Most';
  const teamBg = teamColor === 'blue' ? 'bg-blue-600' : 'bg-gray-600';
  const teamGradient = teamColor === 'blue' 
    ? 'from-blue-900/20 via-blue-800/30 to-blue-900/20' 
    : 'from-gray-900/20 via-gray-800/30 to-gray-900/20';

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="text-cyan-400 text-lg">🛡️</div>
        <div className="text-white font-bold text-sm">OBRANNÉ PÁSMO</div>
      </div>

      {/* Hlavní karta */}
      <div className={`bg-gradient-to-r ${teamGradient} rounded-lg p-4 border border-slate-700`}>
        <div className="flex items-center justify-between gap-4">
          {/* Info o obránci */}
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-12 h-12 ${teamBg} rounded flex items-center justify-center text-white font-bold text-lg transition-all duration-500 ${
              animationPhase === 'transition' ? 'scale-110 ring-4 ring-emerald-400/50' : ''
            }`}>
              {defender.number}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-bold text-sm">{defender.name}</span>
                <span className={`text-xs ${teamColor === 'blue' ? 'text-blue-300' : 'text-gray-300'}`}>({teamName})</span>
              </div>
              
              {/* Text akce */}
              {animationPhase === 'start' && (
                <div className="text-gray-300 text-xs">
                  <span className="text-emerald-400">✓</span> Získává puk
                </div>
              )}
              {animationPhase === 'transition' && (
                <div className="text-emerald-300 text-xs font-bold">
                  <span className="text-cyan-400">➡️</span> Hezkou rozehrávkou se dostávají do středního pásma
                </div>
              )}
            </div>
          </div>

          {/* Animace puku */}
          <div className="flex-shrink-0 relative w-16 h-16 flex items-center justify-center">
            {animationPhase === 'start' && (
              <div className="text-4xl">
                🏒
              </div>
            )}
            {animationPhase === 'transition' && (
              <div className="text-4xl animate-bounce">
                ➡️🏒
              </div>
            )}
          </div>

          {/* Emoji týmu */}
          <div className={`text-4xl flex-shrink-0 transition-all duration-500 ${
            animationPhase === 'transition' ? 'scale-125' : ''
          }`}>
            {teamEmoji}
          </div>
        </div>
      </div>
    </div>
  );
}

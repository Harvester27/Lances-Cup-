import React, { useState, useEffect } from 'react';

export function UtocnePasmoNikdonemapuk({ 
  defender,     // {name, number, team, speed}
  attacker,     // {name, number, team, speed}
  battleResult,  // {winner, winType, attackerSpeed, defenderSpeed, speedDiff, attackerRoll, defenderRoll}
  timeSpeed = 1
}) {
  const [animationPhase, setAnimationPhase] = useState('start'); // start -> battle -> result

  useEffect(() => {
    // Fáze 1: Start (0-0.5s)
    const timer1 = setTimeout(() => {
      setAnimationPhase('battle');
    }, 500 / timeSpeed);

    // Fáze 2: Battle (0.5-2s)
    const timer2 = setTimeout(() => {
      setAnimationPhase('result');
    }, 2000 / timeSpeed);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []); // Prázdný array - spustí se jen při mount

  const defenderColor = defender.team === 'lancers' ? 'blue' : 'gray';
  const attackerColor = attacker.team === 'lancers' ? 'blue' : 'gray';
  
  const defenderBg = defenderColor === 'blue' ? 'bg-blue-600' : 'bg-gray-600';
  const attackerBg = attackerColor === 'blue' ? 'bg-blue-600' : 'bg-gray-600';
  
  const defenderTeamName = defender.team === 'lancers' ? 'Lancers' : 'Most';
  const attackerTeamName = attacker.team === 'lancers' ? 'Lancers' : 'Most';

  const isAttackerWinner = battleResult?.winner === 'attacker';
  const isDefenderWinner = battleResult?.winner === 'defender';

  const winChance = (speed) => {
    const total = (battleResult?.attackerSpeed || 0) + (battleResult?.defenderSpeed || 0);
    if (total === 0) return '0';
    return ((speed / total) * 100).toFixed(0);
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="text-orange-400 text-lg">🥊</div>
        <div className="text-white font-bold text-sm">ÚTOČNÉ PÁSMO - SOUBOJ O PUK</div>
      </div>

      {/* Hlavní arena */}
      <div className="bg-gradient-to-r from-orange-900/20 via-red-800/30 to-orange-900/20 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center justify-between gap-4">
          {/* Obránce */}
          <div className={`flex-1 transition-all duration-500 ${
            animationPhase === 'result' && isDefenderWinner 
              ? 'scale-110 -translate-x-2' 
              : animationPhase === 'result' && isAttackerWinner 
              ? 'opacity-50 scale-95' 
              : ''
          }`}>
            <div className={`${defenderColor === 'blue' ? 'bg-blue-900/60' : 'bg-gray-900/60'} rounded-lg p-3 border-2 ${
              animationPhase === 'result' && isDefenderWinner 
                ? 'border-emerald-400 shadow-lg shadow-emerald-400/50' 
                : defenderColor === 'blue' ? 'border-blue-500/50' : 'border-gray-500/50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 ${defenderBg} rounded flex items-center justify-center text-white font-bold text-sm`}>
                  {defender.number}
                </div>
                <div>
                  <div className="text-white font-bold text-xs">{defender.name}</div>
                  <div className={`${defenderColor === 'blue' ? 'text-blue-300' : 'text-gray-300'} text-[10px]`}>{defenderTeamName} (D)</div>
                </div>
              </div>
              
              {/* Síla */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Rychlost:</span>
                  <span className="text-yellow-400 font-bold">{battleResult?.defenderSpeed?.toFixed(1) || defender.speed?.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Šance:</span>
                  <span className="text-cyan-400 font-bold">{winChance(battleResult?.defenderSpeed || 0)}%</span>
                </div>
                {animationPhase === 'result' && battleResult?.defenderRoll && (
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-blue-500/30">
                    <span className="text-gray-400">Hod:</span>
                    <span className="text-purple-400 font-bold">{battleResult.defenderRoll.toFixed(2)}</span>
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
                : animationPhase === 'battle' 
                ? 'animate-shake' 
                : isDefenderWinner 
                ? '-translate-x-8 opacity-0' 
                : 'translate-x-8 opacity-0'
            }`}>
              🏒
            </div>
            
            {/* Battle efekt */}
            {animationPhase === 'battle' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl animate-ping">💥</div>
              </div>
            )}
          </div>

          {/* Útočník */}
          <div className={`flex-1 transition-all duration-500 ${
            animationPhase === 'result' && isAttackerWinner 
              ? 'scale-110 translate-x-2' 
              : animationPhase === 'result' && isDefenderWinner 
              ? 'opacity-50 scale-95' 
              : ''
          }`}>
            <div className={`${attackerColor === 'blue' ? 'bg-blue-900/60' : 'bg-gray-900/60'} rounded-lg p-3 border-2 ${
              animationPhase === 'result' && isAttackerWinner 
                ? 'border-emerald-400 shadow-lg shadow-emerald-400/50' 
                : attackerColor === 'blue' ? 'border-blue-500/50' : 'border-gray-500/50'
            }`}>
              <div className="flex items-center gap-2 mb-2 justify-end">
                <div>
                  <div className="text-white font-bold text-xs text-right">{attacker.name}</div>
                  <div className={`${attackerColor === 'blue' ? 'text-blue-300' : 'text-gray-300'} text-[10px] text-right`}>{attackerTeamName} (F)</div>
                </div>
                <div className={`w-8 h-8 ${attackerBg} rounded flex items-center justify-center text-white font-bold text-sm`}>
                  {attacker.number}
                </div>
              </div>
              
              {/* Síla */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-yellow-400 font-bold">{battleResult?.attackerSpeed?.toFixed(1) || attacker.speed?.toFixed(1)}</span>
                  <span className="text-gray-400">Rychlost:</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-cyan-400 font-bold">{winChance(battleResult?.attackerSpeed || 0)}%</span>
                  <span className="text-gray-400">Šance:</span>
                </div>
                {animationPhase === 'result' && battleResult?.attackerRoll && (
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-gray-500/30">
                    <span className="text-purple-400 font-bold">{battleResult.attackerRoll.toFixed(2)}</span>
                    <span className="text-gray-400">Hod:</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Výsledek */}
        {animationPhase === 'result' && battleResult && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className={`text-center font-bold text-sm flex items-center justify-center gap-2 ${
              isAttackerWinner || isDefenderWinner ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {battleResult.winType === 'clear' ? (
                <>
                  <span>✅</span>
                  <span>
                    U puku je dříve {isAttackerWinner ? attacker.name : defender.name} (
                    {isAttackerWinner ? `#${attacker.number}` : `#${defender.number}`})
                  </span>
                </>
              ) : (
                <>
                  <span>🍀</span>
                  <span>
                    K puku dojeli hráči ve stejný čas, ale puk se odrazil se štěstím k {isAttackerWinner ? attacker.name : defender.name} (
                    {isAttackerWinner ? `#${attacker.number}` : `#${defender.number}`})
                  </span>
                </>
              )}
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

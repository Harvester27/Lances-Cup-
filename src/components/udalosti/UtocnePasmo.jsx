import React, { useState, useEffect } from 'react';

export function UtocnePasmo({ 
  shooter,     // {name, number, position, team, shooting, strength}
  goalie,      // {name, number, team, reflexes, positioning, glove, blocker}
  team,        // 'lancers' nebo 'most'
  shotResult,   // {isGoal, saveType, attackPower, goaliePower, attackRoll, goalieRoll}
  timeSpeed = 1
}) {
  const [animationPhase, setAnimationPhase] = useState('setup'); // setup -> aim -> shoot -> result

  useEffect(() => {
    // Fáze 1: Setup (0-0.8s)
    const timer1 = setTimeout(() => {
      setAnimationPhase('aim');
    }, 800 / timeSpeed);

    // Fáze 2: Aim (0.8-1.5s)
    const timer2 = setTimeout(() => {
      setAnimationPhase('shoot');
    }, 1500 / timeSpeed);

    // Fáze 3: Result (1.5-3s)
    const timer3 = setTimeout(() => {
      setAnimationPhase('result');
    }, 1600 / timeSpeed);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const teamEmoji = team === 'lancers' ? '🏒' : '🐀';
  const teamColor = team === 'lancers' ? 'blue' : 'gray';
  const teamName = team === 'lancers' ? 'Lancers' : 'Most';
  const teamBg = teamColor === 'blue' ? 'bg-blue-600' : 'bg-gray-600';
  const teamGradient = teamColor === 'blue' 
    ? 'from-blue-900/20 via-blue-800/30 to-blue-900/20' 
    : 'from-gray-900/20 via-gray-800/30 to-gray-900/20';
  
  const goalieTeam = goalie.team === 'lancers' ? 'Lancers' : 'Most';
  const goalieColor = goalie.team === 'lancers' ? 'blue' : 'gray';
  const goalieBg = goalieColor === 'blue' ? 'bg-blue-600' : 'bg-gray-600';

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="text-yellow-400 text-lg">⚡</div>
        <div className="text-white font-bold text-sm">ÚTOČNÉ PÁSMO - STŘELA</div>
      </div>

      {/* Hlavní karta */}
      <div className={`bg-gradient-to-r ${teamGradient} rounded-lg p-4 border border-slate-700`}>
        {/* Střelec vs Brankář */}
        <div className="flex items-center justify-between gap-4 mb-3">
          {/* Info o střelci */}
          <div className={`flex-1 transition-all duration-500 ${
            animationPhase === 'result' && shotResult?.isGoal 
              ? 'scale-110 -translate-x-2' 
              : animationPhase === 'result' && !shotResult?.isGoal 
              ? 'opacity-50 scale-95' 
              : ''
          }`}>
            <div className={`${teamColor === 'blue' ? 'bg-blue-900/60' : 'bg-gray-900/60'} rounded-lg p-3 border-2 ${
              animationPhase === 'result' && shotResult?.isGoal 
                ? 'border-emerald-400 shadow-lg shadow-emerald-400/50' 
                : teamColor === 'blue' ? 'border-blue-500/50' : 'border-gray-500/50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 ${teamBg} rounded flex items-center justify-center text-white font-bold text-sm`}>
                  {shooter.number}
                </div>
                <div>
                  <div className="text-white font-bold text-xs">{shooter.name}</div>
                  <div className={`${teamColor === 'blue' ? 'text-blue-300' : 'text-gray-300'} text-[10px]`}>{teamName} {shooter.position && `(${shooter.position})`}</div>
                </div>
              </div>
              
              {/* Statistiky střelce */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Střela:</span>
                  <span className="text-yellow-400 font-bold">{shooter.shooting}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Síla:</span>
                  <span className="text-orange-400 font-bold">{shooter.strength}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-blue-500/30">
                  <span className="text-gray-400">Celkem:</span>
                  <span className="text-cyan-400 font-bold">{shotResult?.attackPower?.toFixed(1)}</span>
                </div>
                {animationPhase === 'result' && shotResult && (
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-blue-500/30">
                    <span className="text-gray-400">Hod:</span>
                    <span className="text-purple-400 font-bold">{shotResult.attackRoll.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Animace puku */}
          <div className="flex-shrink-0 relative">
            <div className={`text-5xl transition-all duration-500 ${
              animationPhase === 'setup' 
                ? 'animate-pulse' 
                : animationPhase === 'aim'
                ? 'animate-bounce'
                : animationPhase === 'shoot' 
                ? 'animate-spin' 
                : shotResult?.isGoal 
                ? '-translate-x-8 opacity-0' 
                : 'translate-x-8 opacity-0'
            }`}>
              🏒
            </div>
            
            {/* Střelba efekt */}
            {animationPhase === 'shoot' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl animate-ping">💥</div>
              </div>
            )}
            
            {/* Výsledek efekt */}
            {animationPhase === 'result' && shotResult?.isGoal && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-5xl animate-bounce">🚨</div>
              </div>
            )}
          </div>

          {/* Brankář */}
          <div className={`flex-1 transition-all duration-500 ${
            animationPhase === 'result' && !shotResult?.isGoal 
              ? 'scale-110 translate-x-2' 
              : animationPhase === 'result' && shotResult?.isGoal 
              ? 'opacity-50 scale-95' 
              : ''
          }`}>
            <div className={`${goalieColor === 'blue' ? 'bg-blue-900/60' : 'bg-gray-900/60'} rounded-lg p-3 border-2 ${
              animationPhase === 'result' && !shotResult?.isGoal 
                ? 'border-emerald-400 shadow-lg shadow-emerald-400/50' 
                : goalieColor === 'blue' ? 'border-blue-500/50' : 'border-gray-500/50'
            }`}>
              <div className="flex items-center gap-2 mb-2 justify-end">
                <div className="text-right">
                  <div className="text-white font-bold text-xs text-right">{goalie.name}</div>
                  <div className={`${goalieColor === 'blue' ? 'text-blue-300' : 'text-gray-300'} text-[10px] text-right`}>{goalieTeam} (G)</div>
                </div>
                <div className={`w-8 h-8 ${goalieBg} rounded flex items-center justify-center text-white font-bold text-sm`}>
                  {goalie.number}
                </div>
              </div>
              
              {/* Statistiky brankáře */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-yellow-400 font-bold">{goalie.reflexes}</span>
                  <span className="text-gray-400">Reflexy:</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-orange-400 font-bold">{goalie.positioning}</span>
                  <span className="text-gray-400">Postavení:</span>
                </div>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-gray-500/30">
                  <span className="text-cyan-400 font-bold">{shotResult?.goaliePower?.toFixed(1)}</span>
                  <span className="text-gray-400">Celkem:</span>
                </div>
                {animationPhase === 'result' && shotResult && (
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-gray-500/30">
                    <span className="text-purple-400 font-bold">{shotResult.goalieRoll.toFixed(2)}</span>
                    <span className="text-gray-400">Hod:</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Výsledek */}
        {animationPhase === 'result' && shotResult && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            {shotResult.isGoal ? (
              <div className="text-center font-bold text-sm flex items-center justify-center gap-2 text-emerald-400">
                <span>🚨</span>
                <span>GÓÓÓÓÓL! {shooter.name} #{shooter.number}</span>
              </div>
            ) : (
              <div className="text-center font-bold text-sm flex items-center justify-center gap-2 text-cyan-400">
                {shotResult.saveType === 'cover' && (
                  <><span>🧤</span><span>Brankář {goalie.name} chytí a přikryje!</span></>
                )}
                {shotResult.saveType === 'corner' && (
                  <><span>↗️</span><span>Brankář {goalie.name} vyrazí do rohu!</span></>
                )}
                {shotResult.saveType === 'rebound' && (
                  <><span>⬇️</span><span>Brankář {goalie.name} vyrazí před sebe!</span></>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

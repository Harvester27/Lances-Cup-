import React from 'react';

export function StredniPasmoUdalosti({ 
  attacker,  // {name, number, position, team}
  team,      // 'lancers' nebo 'most'
  timeSpeed = 1  // Pro konzistenci s ostatními komponentami
}) {
  const teamEmoji = team === 'lancers' ? '🏒' : '🐀';
  const teamColor = team === 'lancers' ? 'text-blue-400' : 'text-gray-400';
  const teamName = team === 'lancers' ? 'Lancers' : 'Most';

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="text-emerald-400 text-lg">🏒</div>
        <div className="text-white font-bold text-sm">STŘEDNÍ PÁSMO</div>
      </div>

      {/* Hlavní karta */}
      <div className={`bg-gradient-to-r ${
        team === 'lancers' 
          ? 'from-blue-900/20 via-blue-800/30 to-blue-900/20' 
          : 'from-gray-900/20 via-gray-800/30 to-gray-900/20'
      } rounded-lg p-3 border border-slate-700`}>
        <div className="flex items-center gap-3">
          {/* Číslo hráče */}
          <div className={`w-10 h-10 rounded flex items-center justify-center font-bold text-white flex-shrink-0 ${
            team === 'lancers' ? 'bg-blue-600' : 'bg-gray-600'
          }`}>
            {attacker.number}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-bold text-sm">{attacker.name}</span>
              <span className={`text-xs ${teamColor}`}>({teamName})</span>
              {attacker.position && (
                <span className="bg-purple-900/40 border border-purple-500/30 rounded px-1.5 py-0.5 text-[9px] font-bold text-purple-300">
                  {attacker.position}
                </span>
              )}
            </div>
            
            {/* Akce */}
            <div className="text-gray-300 text-xs flex items-center gap-2">
              <span className="text-amber-400 text-lg">➡️</span>
              <span>nahazuje puk do útočného pásma</span>
            </div>
          </div>

          {/* Emoji týmu */}
          <div className="text-3xl flex-shrink-0">
            {teamEmoji}
          </div>
        </div>
      </div>
    </div>
  );
}

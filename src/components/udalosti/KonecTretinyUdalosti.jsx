import React from 'react';

export function KonecTretinyUdalosti({ periodEnding }) {
  // Nastavení textu podle toho, která třetina končí
  const getText = () => {
    if (periodEnding === 3) {
      return {
        title: 'KONEC ZÁPASU',
        emoji: '🏁',
        color: 'text-yellow-400',
        bgGradient: 'from-yellow-900/30 via-amber-800/40 to-yellow-900/30',
        borderColor: 'border-yellow-500'
      };
    } else {
      return {
        title: `KONČÍ ${periodEnding}. TŘETINA`,
        emoji: '⏸️',
        color: 'text-purple-400',
        bgGradient: 'from-purple-900/30 via-indigo-800/40 to-purple-900/30',
        borderColor: 'border-purple-500'
      };
    }
  };

  const config = getText();

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`${config.color} text-2xl animate-pulse`}>{config.emoji}</div>
        <div className={`${config.color} font-black text-lg tracking-wider`}>
          {config.title}
        </div>
      </div>

      {/* Hlavní karta */}
      <div className={`bg-gradient-to-r ${config.bgGradient} rounded-lg p-6 border-2 ${config.borderColor} shadow-xl`}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">
            {config.emoji}
          </div>
          
          <div className={`${config.color} font-black text-2xl mb-3`}>
            {config.title}
          </div>
          
          {periodEnding === 3 ? (
            <div className="text-white text-sm font-semibold">
              Děkujeme za sledování! 🏒
            </div>
          ) : (
            <div className="text-gray-300 text-sm">
              Hráči odcházejí do kabin
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

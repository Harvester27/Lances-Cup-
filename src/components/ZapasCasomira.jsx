import React from 'react';
import { Play, Pause } from 'lucide-react';

export function ZapasCasomira({ 
  lancersScore, 
  mostScore, 
  gameTime, 
  period, 
  isRunning, 
  timeSpeed, 
  onTogglePlay, 
  onCycleSpeed,
  lancersPenalties,
  mostPenalties,
  formatTime
}) {
  const periodNames = { 1: '1. TŘETINA', 2: '2. TŘETINA', 3: '3. TŘETINA' };

  return (
    <div className="bg-gradient-to-r from-blue-900/80 via-slate-900/80 to-red-900/80 border-b-2 border-purple-500/50 backdrop-blur-xl shadow-2xl flex-shrink-0">
      <div className="px-4 py-3">
        <div className="flex gap-4 items-center justify-center">
          <div className="flex items-center gap-4 flex-shrink-0">
            <img src="/Images/Loga/LancersWhite.png" alt="Lancers" className="w-24 h-24 drop-shadow-2xl" />
            <div>
              <div className="text-white font-bold text-lg">Litvínov Lancers</div>
              <div className="text-7xl font-black text-blue-400 leading-none">{lancersScore}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1 w-32">
              {lancersPenalties.length === 0 && <div className="text-gray-600 text-[10px] py-1 text-center">Bez trestů</div>}
            </div>

            <div className="flex-shrink-0">
              <div className="bg-slate-800/90 rounded-xl border-2 border-slate-600 px-6 py-3">
                <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider text-center">{periodNames[period]}</div>
                <div className={`text-6xl font-black text-center mb-3 ${gameTime <= 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{formatTime(gameTime)}</div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={onTogglePlay}
                    className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${isRunning ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                  >
                    {isRunning ? (<><Pause size={16} /><span className="text-sm">Pauza</span></>) : (<><Play size={16} /><span className="text-sm">Start</span></>)}
                  </button>
                  <button onClick={onCycleSpeed} className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-sm">{timeSpeed}x</button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 w-32">
              {mostPenalties.length === 0 && <div className="text-gray-600 text-[10px] py-1 text-center">Bez trestů</div>}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <div className="text-white font-bold text-lg">Krysáci Most</div>
              <div className="text-7xl font-black text-gray-400 leading-none">{mostScore}</div>
            </div>
            <div className="text-8xl">🐀</div>
          </div>
        </div>
      </div>
    </div>
  );
}

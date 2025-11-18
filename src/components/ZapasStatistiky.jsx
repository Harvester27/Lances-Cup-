import React, { useState } from 'react';
import { BarChart3, Clock } from 'lucide-react';
import { CentralaUdalosti } from './udalosti/CentralaUdalosti';

export function ZapasStatistiky({ stats, gameTime, period, lastFaceoff, onIcePlayers, onPuckStatusChange, onShot, onFaceoff, onCheckShift }) {
  const [activeTab, setActiveTab] = useState('statistiky');
  const [activePeriodTab, setActivePeriodTab] = useState('active'); // 'active', '1', '2', '3'

  return (
    <div className="bg-slate-800/90 rounded-xl border-2 border-slate-600 p-4 h-full flex flex-col">
      {/* Záložky */}
      <div className="flex gap-2 mb-3 pb-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('statistiky')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'statistiky'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
          }`}
        >
          <BarChart3 size={16} />
          <span className="text-xs font-bold">STATISTIKY</span>
        </button>
        <button
          onClick={() => setActiveTab('udalosti')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'udalosti'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
          }`}
        >
          <Clock size={16} />
          <span className="text-xs font-bold">UDÁLOSTI</span>
        </button>
      </div>

      {/* Sub-záložky pro třetiny - zobrazí se jen když je aktivní tab "udalosti" */}
      {activeTab === 'udalosti' && (
        <div className="flex gap-1.5 mb-3 pb-2 border-b border-slate-700/50">
          <button
            onClick={() => setActivePeriodTab('active')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
              activePeriodTab === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700/30 text-gray-400 hover:bg-slate-700/50'
            }`}
          >
            AKTIVNÍ
          </button>
          <button
            onClick={() => setActivePeriodTab('1')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
              activePeriodTab === '1'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700/30 text-gray-400 hover:bg-slate-700/50'
            }`}
          >
            1. TŘETINA
          </button>
          <button
            onClick={() => setActivePeriodTab('2')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
              activePeriodTab === '2'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700/30 text-gray-400 hover:bg-slate-700/50'
            }`}
          >
            2. TŘETINA
          </button>
          <button
            onClick={() => setActivePeriodTab('3')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
              activePeriodTab === '3'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700/30 text-gray-400 hover:bg-slate-700/50'
            }`}
          >
            3. TŘETINA
          </button>
        </div>
      )}

      {/* Obsah */}
      <div className="flex-1 overflow-auto">
        {/* Statistiky - zobrazit jen když je aktivní */}
        <div className={activeTab === 'statistiky' ? 'block space-y-3' : 'hidden'}>
          <div className="bg-slate-900/60 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1 text-center">Střely na bránu</div>
            <div className="flex items-center justify-between">
              <span className="text-blue-400 text-2xl font-black">{stats.lancers.shots}</span>
              <span className="text-gray-600 text-xl">🎯</span>
              <span className="text-gray-400 text-2xl font-black">{stats.most.shots}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1 text-center">Vyhraná vhazování</div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <span className="text-blue-400 text-2xl font-black">{stats.lancers.faceoffsWon}/{stats.lancers.faceoffsTotal}</span>
                <div className="text-[10px] text-blue-300">{stats.lancers.faceoffsTotal > 0 ? `${Math.round((stats.lancers.faceoffsWon / stats.lancers.faceoffsTotal) * 100)}%` : '0%'}</div>
              </div>
              <span className="text-gray-600 text-xl">💪</span>
              <div className="text-center">
                <span className="text-gray-400 text-2xl font-black">{stats.most.faceoffsWon}/{stats.most.faceoffsTotal}</span>
                <div className="text-[10px] text-gray-300">{stats.most.faceoffsTotal > 0 ? `${Math.round((stats.most.faceoffsWon / stats.most.faceoffsTotal) * 100)}%` : '0%'}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1 text-center">Vyloučení</div>
            <div className="flex items-center justify-between">
              <span className="text-blue-400 text-2xl font-black">{stats.lancers.penalties}</span>
              <span className="text-gray-600 text-xl">🚫</span>
              <span className="text-gray-400 text-2xl font-black">{stats.most.penalties}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1 text-center">Góly v přesilovce</div>
            <div className="flex items-center justify-between">
              <div className="text-center"><span className="text-blue-400 text-2xl font-black">{stats.lancers.powerPlayGoals}/{stats.lancers.powerPlayOpportunities}</span></div>
              <span className="text-gray-600 text-xl">⚡</span>
              <div className="text-center"><span className="text-gray-400 text-2xl font-black">{stats.most.powerPlayGoals}/{stats.most.powerPlayOpportunities}</span></div>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1 text-center">Ubráněná oslabení</div>
            <div className="flex items-center justify-between">
              <div className="text-center"><span className="text-blue-400 text-2xl font-black">{stats.lancers.penaltyKills}/{stats.lancers.penaltyKillOpportunities}</span></div>
              <span className="text-gray-600 text-xl">🛡️</span>
              <div className="text-center"><span className="text-gray-400 text-2xl font-black">{stats.most.penaltyKills}/{stats.most.penaltyKillOpportunities}</span></div>
            </div>
          </div>
        </div>

        {/* Události - běží vždy na pozadí, jen se skrývají */}
        <div className={activeTab === 'udalosti' ? 'block' : 'hidden'}>
          <CentralaUdalosti 
            gameTime={gameTime} 
            period={period} 
            lastFaceoff={lastFaceoff}
            onIcePlayers={onIcePlayers}
            onPuckStatusChange={onPuckStatusChange}
            onShot={onShot}
            onFaceoff={onFaceoff}
            onCheckShift={onCheckShift}
            activePeriodTab={activePeriodTab}
          />
        </div>
      </div>
    </div>
  );
}

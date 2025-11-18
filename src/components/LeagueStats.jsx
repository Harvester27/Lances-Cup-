import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Target, TrendingUp, Clock, AlertTriangle, Medal, ArrowUpDown } from 'lucide-react';
import { teamsData } from './teamsData';
import PlayerHeaderBar from './PlayerHeaderBar';

export default function LeagueStats() {
  const navigate = useNavigate();
  const [allPlayers, setAllPlayers] = useState([]);
  const [sortBy, setSortBy] = useState('points'); // 'goals', 'assists', 'points', 'games', 'pim'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [filterPosition, setFilterPosition] = useState('all'); // 'all', 'forwards', 'defenders', 'goalies'

  useEffect(() => {
    // Načíst všechny hráče ze všech týmů
    const players = [];
    
    Object.entries(teamsData).forEach(([teamId, team]) => {
      team.roster.forEach(player => {
        players.push({
          ...player,
          teamId: team.id,
          teamName: team.name,
          teamEmoji: team.emoji,
          // Statistiky - zatím všichni mají 0
          stats: player.stats || {
            games: 0,
            goals: 0,
            assists: 0,
            points: 0,
            pim: 0 // penalty minutes (trestné minuty)
          }
        });
      });
    });

    setAllPlayers(players);
  }, []);

  // Filtrování podle pozice
  const filteredPlayers = filterPosition === 'all' 
    ? allPlayers 
    : allPlayers.filter(p => p.category === filterPosition);

  // Řazení
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    let aValue = a.stats[sortBy];
    let bValue = b.stats[sortBy];

    if (sortOrder === 'desc') {
      return bValue - aValue;
    } else {
      return aValue - bValue;
    }
  });

  // Změna řazení
  const handleSort = (field) => {
    if (sortBy === field) {
      // Pokud už řadíme podle tohoto pole, změň pořadí
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      // Nové pole, defaultně descending
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Ikona pro směr řazení
  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return (
      <ArrowUpDown 
        size={16} 
        className={`ml-1 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
      />
    );
  };

  // Kategorie pro filtrování
  const positionFilters = [
    { id: 'all', label: 'Všichni', count: allPlayers.length },
    { id: 'forwards', label: 'Útočníci', count: allPlayers.filter(p => p.category === 'forwards').length },
    { id: 'defenders', label: 'Obránci', count: allPlayers.filter(p => p.category === 'defenders').length },
    { id: 'goalies', label: 'Brankáři', count: allPlayers.filter(p => p.category === 'goalies').length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* HORNÍ LIŠTA */}
      <PlayerHeaderBar>
        {/* Info badge */}
        <div className="bg-blue-900/30 border border-blue-500/30 text-blue-300 px-6 py-3 rounded-lg">
          <div className="text-sm text-blue-400">Celkem hráčů</div>
          <div className="font-bold text-2xl">{allPlayers.length}</div>
        </div>
      </PlayerHeaderBar>

      {/* NADPIS STRÁNKY */}
      <div className="bg-slate-900/50 border-b border-slate-700">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/game')}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Trophy className="text-yellow-400" size={32} />
                STATISTIKY FOFR LIGY
              </h1>
              <p className="text-gray-400 text-sm mt-1">Všichni hráči • Sezóna 2024/25</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* FILTRY PODLE POZICE */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {positionFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterPosition(filter.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                transition-all duration-200 whitespace-nowrap
                ${filterPosition === filter.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50 hover:text-white'
                }
              `}
            >
              <span>{filter.label}</span>
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${filterPosition === filter.id ? 'bg-white/20' : 'bg-slate-700'}
              `}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* INFO BOX */}
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-1" size={20} />
          <div>
            <p className="text-yellow-200 text-sm">
              <strong>Nová sezóna:</strong> Statistiky všech hráčů jsou zatím vynulované. 
              Body se začnou připisovat po prvních odehraných zápasech!
            </p>
          </div>
        </div>

        {/* TABULKA STATISTIK */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
          {/* Hlavička tabulky */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-12 gap-2 px-4 py-4 text-sm font-bold text-gray-400 uppercase tracking-wider">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-3">Hráč</div>
                <div className="col-span-2">Tým</div>
                
                {/* Klikatelné hlavičky pro řazení */}
                <button 
                  onClick={() => handleSort('games')}
                  className="col-span-1 text-center hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                >
                  Z {getSortIcon('games')}
                </button>
                <button 
                  onClick={() => handleSort('goals')}
                  className="col-span-1 text-center hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                >
                  G {getSortIcon('goals')}
                </button>
                <button 
                  onClick={() => handleSort('assists')}
                  className="col-span-1 text-center hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                >
                  A {getSortIcon('assists')}
                </button>
                <button 
                  onClick={() => handleSort('points')}
                  className="col-span-1 text-center hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                >
                  B {getSortIcon('points')}
                </button>
                <button 
                  onClick={() => handleSort('pim')}
                  className="col-span-2 text-center hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                >
                  TM {getSortIcon('pim')}
                </button>
              </div>
            </div>
          </div>

          {/* Řádky hráčů */}
          <div className="divide-y divide-slate-700 overflow-x-auto">
            <div className="min-w-[800px]">
              {sortedPlayers.map((player, index) => (
                <div
                  key={`${player.teamId}-${player.id}`}
                  className={`
                    grid grid-cols-12 gap-2 px-4 py-4
                    transition-all duration-200 hover:bg-slate-700/50
                    ${index < 3 ? 'bg-yellow-900/10' : ''}
                  `}
                >
                  {/* Pozice */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${index === 0 
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' 
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                        : index === 2
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                        : 'bg-slate-700 text-gray-300'
                      }
                    `}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Jméno hráče */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-white text-sm">
                      {player.number}
                    </div>
                    <div>
                      <div className="text-white font-bold">{player.name}</div>
                      <div className="text-gray-400 text-xs">{player.position}</div>
                    </div>
                  </div>

                  {/* Tým */}
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-2xl">{player.teamEmoji}</span>
                    <span className="text-gray-300 text-sm">{player.teamName.split(' ')[1]}</span>
                  </div>

                  {/* Statistiky */}
                  <div className="col-span-1 flex items-center justify-center text-gray-300 font-medium">
                    {player.stats.games}
                  </div>
                  <div className="col-span-1 flex items-center justify-center text-green-400 font-bold">
                    {player.stats.goals}
                  </div>
                  <div className="col-span-1 flex items-center justify-center text-blue-400 font-bold">
                    {player.stats.assists}
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white font-bold px-2 py-1 rounded">
                      {player.stats.points}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-center text-red-400 font-medium">
                    {player.stats.pim}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-8 bg-slate-800/30 border border-slate-700 rounded-lg p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Medal className="text-yellow-400" size={20} />
            Vysvětlivky
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="text-gray-400 mb-1">Z</div>
              <div className="text-white font-medium">Zápasy</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">G</div>
              <div className="text-green-400 font-medium">Góly</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">A</div>
              <div className="text-blue-400 font-medium">Asistence</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">B</div>
              <div className="text-purple-400 font-medium">Body (G+A)</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">TM</div>
              <div className="text-red-400 font-medium">Trestné minuty</div>
            </div>
          </div>
        </div>

        {/* Info o řazení */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>
            Klikni na hlavičku sloupce (Z, G, A, B, TM) pro změnu řazení • 
            Zobrazeno {sortedPlayers.length} hráčů
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, ChevronRight, Target, Calendar } from 'lucide-react';
import PlayerHeaderBar from './PlayerHeaderBar';

export default function LeagueTable() {
  const navigate = useNavigate();
  const [hoveredTeam, setHoveredTeam] = useState(null);

  // Tabulka týmů - FOFR LIGA 2024/25 - ZAČÁTEK SEZÓNY (všichni na 0)
  const leagueStandings = [
    {
      position: 1,
      teamId: 'lancers',
      teamName: 'Litvínov Lancers',
      teamLogo: '/Images/Loga/LancersWhite.png',
      teamEmoji: '🐎',
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      form: ['-', '-', '-', '-', '-'],
      isPlayerTeam: true
    },
    {
      position: 2,
      teamId: 'chomutov',
      teamName: 'Buldoci Chomutov',
      teamEmoji: '🐕',
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      form: ['-', '-', '-', '-', '-']
    },
    {
      position: 3,
      teamId: 'most',
      teamName: 'Krysáci Most',
      teamEmoji: '🐀',
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      form: ['-', '-', '-', '-', '-']
    },
    {
      position: 4,
      teamId: 'teplice',
      teamName: 'Sevečani Teplice',
      teamEmoji: '🧊',
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      form: ['-', '-', '-', '-', '-']
    },
    {
      position: 5,
      teamId: 'bilina',
      teamName: 'Zeleňáči Bílina',
      teamEmoji: '🟢',
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      form: ['-', '-', '-', '-', '-']
    },
    {
      position: 6,
      teamId: 'litvinov-oboj',
      teamName: 'Obojživelníci Litvínov',
      teamEmoji: '🐸',
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      form: ['-', '-', '-', '-', '-']
    },
    {
      position: 7,
      teamId: 'duchcov',
      teamName: 'Mazáci Duchcov',
      teamEmoji: '🦊',
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      form: ['-', '-', '-', '-', '-']
    },
    {
      position: 8,
      teamId: 'louny',
      teamName: 'Brejlouni Louny',
      teamEmoji: '👓',
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      form: ['-', '-', '-', '-', '-']
    }
  ];

  const getFormColor = (result) => {
    switch(result) {
      case 'W': return 'bg-green-500';
      case 'D': return 'bg-yellow-500';
      case 'L': return 'bg-red-500';
      default: return 'bg-gray-600';
    }
  };

  const getFormText = (result) => {
    switch(result) {
      case 'W': return 'V';
      case 'D': return 'R';
      case 'L': return 'P';
      default: return '-';
    }
  };

  const handleTeamClick = (teamId) => {
    if (teamId === 'lancers') {
      navigate('/lancers-soupiska');
    } else {
      navigate(`/team-roster/${teamId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* HORNÍ LIŠTA */}
      <PlayerHeaderBar />

      {/* NADPIS STRÁNKY */}
      <div className="bg-slate-900/50 border-b border-slate-700">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/game')}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="text-yellow-400" size={24} />
                  FOFR LIGA
                </h1>
                <p className="text-gray-400 text-xs">Sezóna 2024/25 • 8 týmů</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Tlačítko ROZLOSOVÁNÍ */}
              <button
                onClick={() => navigate('/rozlosovani')}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600
                         text-white px-4 py-2 rounded-lg border-2 border-orange-400 shadow-lg
                         transition-all duration-200 hover:scale-105"
              >
                <Calendar size={16} />
                <span className="font-bold text-sm">ROZLOSOVÁNÍ</span>
              </button>

              {/* Info o tvém týmu */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg border-2 border-blue-400 shadow-lg">
                <div className="text-xs text-blue-200">Tvůj tým</div>
                <div className="font-bold flex items-center gap-2">
                  <img src="/Images/Loga/LancersWhite.png" alt="Lancers" className="w-5 h-5 object-contain" />
                  <span className="text-sm">Litvínov Lancers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABULKA */}
      <div className="container mx-auto px-6 py-3">
        {/* INFO BOX - odstraněno pro kompaktnější zobrazení */}

        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
          {/* Hlavička */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
            <div className="grid grid-cols-12 gap-4 px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4">Tým</div>
              <div className="col-span-1 text-center">Z</div>
              <div className="col-span-1 text-center">V</div>
              <div className="col-span-1 text-center">R</div>
              <div className="col-span-1 text-center">P</div>
              <div className="col-span-1 text-center">Skóre</div>
              <div className="col-span-1 text-center">B</div>
              <div className="col-span-1 text-center">Forma</div>
            </div>
          </div>

          {/* Řádky */}
          <div className="divide-y divide-slate-700">
            {leagueStandings.map((team) => (
              <button
                key={team.teamId}
                onClick={() => handleTeamClick(team.teamId)}
                onMouseEnter={() => setHoveredTeam(team.teamId)}
                onMouseLeave={() => setHoveredTeam(null)}
                className={`
                  w-full grid grid-cols-12 gap-4 px-6 py-3 text-left
                  transition-all duration-200
                  ${hoveredTeam === team.teamId ? 'bg-slate-700/50 scale-[1.01]' : 'bg-transparent hover:bg-slate-700/30'}
                  ${team.isPlayerTeam ? 'border-l-4 border-l-blue-500' : ''}
                `}
              >
                <div className="col-span-1 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs bg-slate-700 text-gray-300">
                    {team.position}
                  </div>
                </div>

                <div className="col-span-4 flex items-center gap-2">
                  {team.isPlayerTeam && team.teamLogo ? (
                    <img src={team.teamLogo} alt={team.teamName} className="w-8 h-8 object-contain" />
                  ) : (
                    <div className="text-2xl">{team.teamEmoji}</div>
                  )}
                  <div>
                    <div className={`font-bold text-base ${team.isPlayerTeam ? 'text-blue-300' : 'text-white'}`}>
                      {team.teamName}
                    </div>
                    {team.isPlayerTeam && (
                      <div className="text-xs text-blue-400 font-medium">⭐ Tvůj tým</div>
                    )}
                  </div>
                </div>

                <div className="col-span-1 flex items-center justify-center text-gray-400 font-medium">{team.gamesPlayed}</div>
                <div className="col-span-1 flex items-center justify-center text-gray-500 font-bold">{team.wins}</div>
                <div className="col-span-1 flex items-center justify-center text-gray-500 font-bold">{team.draws}</div>
                <div className="col-span-1 flex items-center justify-center text-gray-500 font-bold">{team.losses}</div>
                <div className="col-span-1 flex items-center justify-center text-gray-400 font-medium">
                  <span className="text-gray-500">{team.goalsFor}:{team.goalsAgainst}</span>
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <div className="bg-gray-700 text-gray-400 font-bold px-2 py-0.5 rounded-lg text-sm">{team.points}</div>
                </div>
                <div className="col-span-1 flex items-center justify-center gap-1">
                  {team.form.map((result, idx) => (
                    <div key={idx} className={`w-5 h-5 ${getFormColor(result)} rounded text-white text-xs font-bold flex items-center justify-center`}>
                      {getFormText(result)}
                    </div>
                  ))}
                  <ChevronRight size={16} className={`ml-1 transition-transform ${hoveredTeam === team.teamId ? 'translate-x-1' : ''}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-3 flex items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded"></div><span>Výhra (V)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded"></div><span>Remíza (R)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded"></div><span>Prohra (P)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-600 rounded"></div><span>Neodehráno (-)</span></div>
        </div>

        {/* Tip box odstraněn pro kompaktnější zobrazení */}
      </div>
    </div>
  );
}

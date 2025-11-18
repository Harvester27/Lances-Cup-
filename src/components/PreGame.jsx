import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Trophy, Shield, Zap, ChevronLeft, ChevronRight, User, Star } from 'lucide-react';
import { teamsData } from './teamsData';

export default function PreGame() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [showPositionDialog, setShowPositionDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [userPlayer, setUserPlayer] = useState(null);
  const [lancersLineup, setLancersLineup] = useState(null);
  const [mostLineup, setMostLineup] = useState(null);
  const totalPages = 3;

  useEffect(() => {
    const playerDataStr = sessionStorage.getItem('playerData');
    if (playerDataStr) {
      const playerData = JSON.parse(playerDataStr);
      const savedPosition = sessionStorage.getItem('playerPosition');
      
      if (!savedPosition) {
        setShowPositionDialog(true);
      } else {
        createUserPlayer(playerData, savedPosition);
      }
    }
  }, []);

  useEffect(() => {
    if (userPlayer) {
      const lancersLineupSelected = selectLineup(teamsData.lancers.roster, userPlayer);
      const mostLineupSelected = selectLineup(teamsData.most.roster, null);
      
      setLancersLineup(lancersLineupSelected);
      setMostLineup(mostLineupSelected);
    }
  }, [userPlayer]);

  const createUserPlayer = (playerData, position) => {
    const category = position === 'defender' ? 'defenders' : 'forwards';
    const positionName = position === 'defender' ? 'Obránce' : 'Útočník';
    
    const player = {
      id: 999,
      name: `${playerData.firstName} ${playerData.lastName}`,
      number: 99,
      position: positionName,
      age: 25,
      height: 180,
      weight: 80,
      nationality: '🇨🇿',
      category: category,
      isUserPlayer: true,
      attributes: {
        speed: playerData.skills?.speed || 5,
        acceleration: playerData.skills?.acceleration || 5,
        skatingTechnique: playerData.skills?.skatingTechnique || 5,
        braking: playerData.skills?.braking || 5,
        stability: playerData.skills?.stability || 5,
        stamina: playerData.skills?.stamina || 5,
        strength: playerData.skills?.strength || 5,
        shooting: playerData.skills?.shooting || 5,
        passing: playerData.skills?.passing || 5,
        puckControl: playerData.skills?.puckControl || 5,
        stealing: playerData.skills?.stealing || 5,
        checking: playerData.skills?.checking || 5,
        attendance: 100
      },
      overall: calculatePlayerOverall(playerData.skills)
    };
    
    setUserPlayer(player);
    setSelectedPosition(position);
  };

  const handlePositionSelect = (position) => {
    const playerDataStr = sessionStorage.getItem('playerData');
    if (playerDataStr) {
      const playerData = JSON.parse(playerDataStr);
      sessionStorage.setItem('playerPosition', position);
      createUserPlayer(playerData, position);
      setShowPositionDialog(false);
    }
  };

  const calculatePlayerOverall = (skills) => {
    if (!skills) return 5;
    const values = Object.values(skills).filter(v => typeof v === 'number');
    if (values.length === 0) return 5;
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.round(avg * 10) / 10;
  };

  const simulateAttendance = (roster, userPlayer) => {
    const attendingPlayers = roster.filter(player => {
      const attendanceChance = player.attributes?.attendance || 70;
      return Math.random() * 100 < attendanceChance;
    });

    if (userPlayer) {
      attendingPlayers.push(userPlayer);
    }

    return attendingPlayers;
  };

  // Funkce pro přiřazení specifických pozic (C/LW/RW pro útočníky, LD/RD pro obránce)
  const assignSpecificPositions = (players, type) => {
    if (type === 'defenders') {
      // Pro obránce: náhodně přiřadíme LD a RD
      const positions = [];
      const count = players.length;
      
      // Vytvoříme pole pozic (půl LD, půl RD)
      for (let i = 0; i < Math.ceil(count / 2); i++) positions.push('LD');
      for (let i = 0; i < Math.floor(count / 2); i++) positions.push('RD');
      
      // Zamícháme pozice
      positions.sort(() => Math.random() - 0.5);
      
      // Přiřadíme
      return players.map((player, idx) => ({
        ...player,
        specificPosition: positions[idx] || 'LD'
      }));
      
    } else if (type === 'forwards') {
      // Pro útočníky: náhodně přiřadíme C, LW, RW
      const positions = [];
      const count = players.length;
      
      // Vytvoříme pole pozic (třetina každé pozice)
      for (let i = 0; i < Math.ceil(count / 3); i++) positions.push('C');
      for (let i = 0; i < Math.ceil(count / 3); i++) positions.push('LW');
      for (let i = 0; i < Math.ceil(count / 3); i++) positions.push('RW');
      
      // Ořežeme na správný počet a zamícháme
      positions.length = count;
      positions.sort(() => Math.random() - 0.5);
      
      // Přiřadíme
      return players.map((player, idx) => ({
        ...player,
        specificPosition: positions[idx] || 'C'
      }));
    }
    
    return players;
  };

  const selectLineup = (roster, userPlayer) => {
    const attendingPlayers = simulateAttendance(roster, userPlayer);

    // Prostě jen rozdělíme hráče podle kategorií - žádné řazení!
    const goalies = attendingPlayers.filter(p => p.category === 'goalies');
    const defenders = attendingPlayers.filter(p => p.category === 'defenders');
    const forwards = attendingPlayers.filter(p => p.category === 'forwards');

    // Vybereme prostě ty co přišli - max 4 obránce a 6 útočníků
    let selectedDefenders = [];
    let selectedForwards = [];

    if (userPlayer && userPlayer.category === 'defenders') {
      // UserPlayer je obránce - je v sestavě + další co přišli
      const otherDefenders = defenders.filter(p => !p.isUserPlayer);
      selectedDefenders = [userPlayer, ...otherDefenders.slice(0, 3)];
      selectedForwards = forwards.slice(0, 6);
    } else if (userPlayer && userPlayer.category === 'forwards') {
      // UserPlayer je útočník - je v sestavě + další co přišli
      const otherForwards = forwards.filter(p => !p.isUserPlayer);
      selectedForwards = [userPlayer, ...otherForwards.slice(0, 5)];
      selectedDefenders = defenders.slice(0, 4);
    } else {
      // Žádný userPlayer (soupeř) - prostě vezmeme co přišlo
      selectedDefenders = defenders.slice(0, 4);
      selectedForwards = forwards.slice(0, 6);
    }

    // NOVÉ: Přiřadíme specifické pozice
    selectedDefenders = assignSpecificPositions(selectedDefenders, 'defenders');
    selectedForwards = assignSpecificPositions(selectedForwards, 'forwards');

    const lineup = {
      goalie: goalies[0] || null,
      defenders: selectedDefenders,
      forwards: selectedForwards
    };

    return lineup;
  };

  const calculateLineupRating = (lineup) => {
    if (!lineup) return 5;
    const players = [lineup.goalie, ...lineup.defenders, ...lineup.forwards].filter(p => p);
    if (players.length === 0) return 5;
    const ratings = players.map(p => p.overall || 5);
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    return Math.round(avg * 10) / 10;
  };

  const lancersLineupRating = lancersLineup ? calculateLineupRating(lancersLineup) : 5;
  const mostLineupRating = mostLineup ? calculateLineupRating(mostLineup) : 5;

  // VÝPOČET RELATIVNÍHO POŘADÍ HRÁČŮ PRO ZVÝRAZNĚNÍ
  const getSortedPlayers = () => {
    if (!lancersLineup || !mostLineup) return [];
    
    // Sebereme všechny hráče z obou týmů
    const allPlayers = [
      lancersLineup.goalie,
      ...lancersLineup.defenders,
      ...lancersLineup.forwards,
      mostLineup.goalie,
      ...mostLineup.defenders,
      ...mostLineup.forwards
    ].filter(p => p); // Odfiltrujeme null hodnoty
    
    // Seřadíme podle overall (od nejvyššího k nejnižšímu)
    return [...allPlayers].sort((a, b) => (b.overall || 0) - (a.overall || 0));
  };

  const sortedPlayers = getSortedPlayers();

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  // DIALOG NA VÝBĚR POZICE
  if (showPositionDialog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-slate-800 rounded-3xl border-2 border-blue-500 p-8 max-w-2xl w-full shadow-2xl">
          <div className="text-center mb-8">
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-2">Vítej v týmu! 🏒</h2>
            <p className="text-gray-300 text-lg">Na jaké pozici chceš hrát?</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* OBRÁNCE */}
            <button
              onClick={() => handlePositionSelect('defender')}
              className="group relative bg-gradient-to-br from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600
                       border-4 border-blue-500 rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute top-4 right-4 text-6xl opacity-20 group-hover:opacity-40 transition-opacity">
                🛡️
              </div>
              <Shield className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Obránce</h3>
              <p className="text-blue-200 text-sm mb-4">Tvrdá hra, blokování střel, silná obrana</p>
              <div className="bg-blue-950/50 rounded-lg p-3 text-xs text-blue-300">
                <div className="font-bold mb-1">Klíčové dovednosti:</div>
                <div>Síla • Checking • Stabilita</div>
              </div>
            </button>

            {/* ÚTOČNÍK */}
            <button
              onClick={() => handlePositionSelect('forward')}
              className="group relative bg-gradient-to-br from-red-900 to-red-700 hover:from-red-800 hover:to-red-600
                       border-4 border-red-500 rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute top-4 right-4 text-6xl opacity-20 group-hover:opacity-40 transition-opacity">
                ⚡
              </div>
              <Zap className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Útočník</h3>
              <p className="text-red-200 text-sm mb-4">Rychlost, góly, útočná hra</p>
              <div className="bg-red-950/50 rounded-lg p-3 text-xs text-red-300">
                <div className="font-bold mb-1">Klíčové dovednosti:</div>
                <div>Rychlost • Střela • Ovládání puku</div>
              </div>
            </button>
          </div>

          <p className="text-gray-400 text-center text-sm mt-6">
            Pozici můžeš změnit později v nastavení
          </p>
        </div>
      </div>
    );
  }

  if (!lancersLineup || !mostLineup || !userPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Sestavuji tým... 🏒</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      {/* HLAVIČKA */}
      <div className="bg-slate-900/80 border-b border-slate-700 shadow-xl">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/game')}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trophy className="text-yellow-400" size={22} />
                  PŘED ZÁPASEM
                </h1>
                <p className="text-gray-400 text-xs">3. kolo FOFR LIGY • Neděle 8. září • 20:00</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentPage ? 'bg-blue-500 w-8' : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            <div className="text-gray-400 text-sm">
              Stránka {currentPage + 1} / {totalPages}
            </div>
          </div>
        </div>
      </div>

      {/* OBSAH */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden py-2">
        {currentPage > 0 && (
          <button onClick={prevPage} className="absolute left-4 z-10 bg-slate-800/80 hover:bg-slate-700 border-2 border-slate-600 rounded-full p-3 transition-all hover:scale-110 shadow-xl">
            <ChevronLeft size={28} className="text-white" />
          </button>
        )}

        {currentPage < totalPages - 1 && (
          <button onClick={nextPage} className="absolute right-4 z-10 bg-slate-800/80 hover:bg-slate-700 border-2 border-slate-600 rounded-full p-3 transition-all hover:scale-110 shadow-xl">
            <ChevronRight size={28} className="text-white" />
          </button>
        )}

        <div className="container mx-auto px-6 py-2 h-full flex items-center">
          {/* STRÁNKA 1 - SESTAVY */}
          {currentPage === 0 && (
            <div className="w-full max-w-[1600px] mx-auto animate-fade-in space-y-3">
              {/* KOMPAKTNÍ HEADER SE ZÁPASEM */}
              <div className="bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-red-900/50 rounded-xl border-2 border-purple-500/40 p-4 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between gap-8">
                  {/* LANCERS */}
                  <div className="flex items-center gap-3 flex-1">
                    <img src="/Images/Loga/LancersWhite.png" alt="Lancers" className="w-14 h-14 drop-shadow-xl" />
                    <div>
                      <h3 className="text-xl font-bold text-white">Litvínov Lancers</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-blue-200 text-xs">Rating:</span>
                        <span className="text-white font-bold text-lg">{lancersLineupRating}</span>
                        <span className="text-gray-400 text-xs">• {lancersLineup.defenders.length}D + {lancersLineup.forwards.length}F</span>
                      </div>
                    </div>
                  </div>

                  {/* VERSUS */}
                  <div className="text-center px-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 blur-lg opacity-50"></div>
                      <div className="relative bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-xl w-16 h-16 flex items-center justify-center shadow-xl border-2 border-yellow-300/50">
                        <span className="text-white font-black text-xl">VS</span>
                      </div>
                    </div>
                  </div>

                  {/* MOST */}
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="text-right">
                      <h3 className="text-xl font-bold text-white">Krysáci Most</h3>
                      <div className="flex items-center gap-2 mt-1 justify-end">
                        <span className="text-gray-400 text-xs">{mostLineup.defenders.length}D + {mostLineup.forwards.length}F •</span>
                        <span className="text-white font-bold text-lg">{mostLineupRating}</span>
                        <span className="text-gray-200 text-xs">:Rating</span>
                      </div>
                    </div>
                    <div className="text-5xl drop-shadow-xl">🐀</div>
                  </div>
                </div>
              </div>

              {/* SESTAVY V KOMPAKTNÍM LAYOUTU */}
              <div className="grid grid-cols-2 gap-3">
                {/* LANCERS SESTAVA */}
                <TeamLineup 
                  team="lancers"
                  lineup={lancersLineup}
                  rating={lancersLineupRating}
                  logo="/Images/Loga/LancersWhite.png"
                  name="Litvínov Lancers"
                  color="blue"
                  sortedPlayers={sortedPlayers}
                />

                {/* MOST SESTAVA */}
                <TeamLineup 
                  team="most"
                  lineup={mostLineup}
                  rating={mostLineupRating}
                  emoji="🐀"
                  name="Krysáci Most"
                  color="gray"
                  sortedPlayers={sortedPlayers}
                />
              </div>
            </div>
          )}

          {/* STRÁNKA 2 - POROVNÁNÍ */}
          {currentPage === 1 && (
            <div className="w-full max-w-4xl mx-auto animate-fade-in flex items-center">
              <div className="w-full bg-gradient-to-r from-blue-900/60 to-purple-900/60 rounded-2xl border border-blue-500/50 p-8 shadow-2xl">
                <h2 className="text-4xl font-bold text-white text-center mb-8">Porovnání týmů</h2>
                
                <div className="grid grid-cols-3 gap-8 items-center mb-8">
                  <div className="text-center">
                    <img src="/Images/Loga/LancersWhite.png" alt="Lancers" className="w-24 h-24 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white">Lancers</h3>
                    <div className="text-5xl font-bold text-blue-400 mt-2">{lancersLineupRating}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-6xl font-bold text-gray-400 mb-4">VS</div>
                    <div className="text-4xl font-bold text-green-400">
                      {Math.round((lancersLineupRating / (lancersLineupRating + mostLineupRating)) * 100)}%
                    </div>
                    <p className="text-gray-300 text-sm mt-2">Šance na výhru</p>
                  </div>

                  <div className="text-center">
                    <div className="text-8xl mb-4">🐀</div>
                    <h3 className="text-2xl font-bold text-white">Most</h3>
                    <div className="text-5xl font-bold text-gray-400 mt-2">{mostLineupRating}</div>
                  </div>
                </div>

                {userPlayer && (
                  <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500 rounded-xl p-6 text-center">
                    <Star className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">⭐ Ty hraješ!</h3>
                    <p className="text-yellow-300 text-lg">
                      {userPlayer.name} • #{userPlayer.number} • {userPlayer.position}
                    </p>
                    <div className="text-yellow-200 text-sm mt-2">
                      Overall: <span className="font-bold text-lg">{userPlayer.overall}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STRÁNKA 3 - START */}
          {currentPage === 2 && (
            <div className="w-full max-w-3xl mx-auto text-center animate-fade-in flex items-center flex-col justify-center">
              <Trophy className="w-32 h-32 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-5xl font-bold text-white mb-4">Připraven?</h2>
              <p className="text-gray-400 text-xl mb-8">Čas ukázat, co umíš!</p>

              <button
                onClick={() => {
                  // Uložit sestavy do sessionStorage pro Zapas.jsx
                  sessionStorage.setItem('lancersLineup', JSON.stringify(lancersLineup));
                  sessionStorage.setItem('mostLineup', JSON.stringify(mostLineup));
                  navigate('/zapas');
                }}
                className="inline-flex items-center gap-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600
                         text-white px-16 py-6 rounded-2xl border-4 border-green-400 shadow-2xl
                         transition-all duration-200 hover:scale-110 font-bold text-2xl"
              >
                <Play size={40} />
                <span>ZAČÍT ZÁPAS!</span>
                <Zap size={40} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SPODNÍ NAVIGACE */}
      <div className="bg-slate-900/80 border-t border-slate-700 py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed
                       text-white rounded-lg transition-all disabled:opacity-50"
            >
              <ChevronLeft size={20} />
              <span>Předchozí</span>
            </button>

            <div className="text-gray-400">
              {currentPage === 0 && 'Sestavy týmů'}
              {currentPage === 1 && 'Porovnání'}
              {currentPage === 2 && 'Start zápasu'}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed
                       text-white rounded-lg transition-all disabled:opacity-50"
            >
              <span>Další</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// KOMPONENTA PRO CELOU SESTAVU TÝMU - KOMPAKTNÍ VERZE PRO JEDNU OBRAZOVKU!
function TeamLineup({ team, lineup, rating, logo, emoji, name, color, sortedPlayers }) {
  const colorClasses = {
    blue: {
      border: 'border-blue-500/50',
      bg: 'bg-gradient-to-br from-blue-950/80 to-slate-900/80',
      headerBg: 'bg-gradient-to-r from-blue-900/80 to-blue-800/80',
      text: 'text-blue-300',
      badge: 'bg-blue-500/30 border-blue-400/50',
      glow: 'shadow-blue-500/20'
    },
    gray: {
      border: 'border-gray-500/50',
      bg: 'bg-gradient-to-br from-gray-950/80 to-slate-900/80',
      headerBg: 'bg-gradient-to-r from-gray-800/80 to-gray-700/80',
      text: 'text-gray-300',
      badge: 'bg-gray-500/30 border-gray-400/50',
      glow: 'shadow-gray-500/20'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`${classes.bg} ${classes.glow} rounded-xl border-2 ${classes.border} p-3 backdrop-blur-xl shadow-xl`}>
      {/* KOMPAKTNÍ HLAVIČKA */}
      <div className={`${classes.headerBg} rounded-lg border ${classes.border} p-2 mb-3 backdrop-blur-sm`}>
        <div className="flex items-center gap-2">
          {logo && <img src={logo} alt={name} className="w-10 h-10 drop-shadow-lg" />}
          {emoji && <div className="text-4xl drop-shadow-lg">{emoji}</div>}
          <div className="flex-1">
            <h3 className="text-white font-bold text-base leading-tight">{name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Trophy size={10} className={classes.text} />
              <span className={`${classes.text} text-xs`}>{rating}</span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-400 text-xs">{lineup.defenders.length + lineup.forwards.length + (lineup.goalie ? 1 : 0)} hráčů</span>
            </div>
          </div>
        </div>
      </div>

      {/* BRANKÁŘ - KOMPAKTNÍ */}
      {lineup.goalie && (
        <div className="mb-2">
          <div className={`flex items-center gap-1 mb-1 ${classes.badge} border rounded px-2 py-0.5 w-fit`}>
            <span className="text-sm">🧤</span>
            <span className="text-white font-bold text-[10px] uppercase">Brankář</span>
          </div>
          <PlayerCard player={lineup.goalie} color={color} sortedPlayers={sortedPlayers} />
        </div>
      )}

      {/* OBRÁNCI - KOMPAKTNÍ */}
      <div className="mb-2">
        <div className={`flex items-center gap-1 mb-1 ${classes.badge} border rounded px-2 py-0.5 w-fit`}>
          <Shield size={10} className="text-white" />
          <span className="text-white font-bold text-[10px] uppercase">Obránci ({lineup.defenders.length})</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {lineup.defenders.map((player, idx) => (
            <PlayerCard key={idx} player={player} color={color} sortedPlayers={sortedPlayers} />
          ))}
        </div>
      </div>

      {/* ÚTOČNÍCI - KOMPAKTNÍ */}
      <div>
        <div className={`flex items-center gap-1 mb-1 ${classes.badge} border rounded px-2 py-0.5 w-fit`}>
          <Zap size={10} className="text-white" />
          <span className="text-white font-bold text-[10px] uppercase">Útočníci ({lineup.forwards.length})</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {lineup.forwards.map((player, idx) => (
            <PlayerCard key={idx} player={player} color={color} sortedPlayers={sortedPlayers} />
          ))}
        </div>
      </div>
    </div>
  );
}

// KOMPONENTA PRO KARTU HRÁČE - KOMPAKTNÍ PRO JEDNU OBRAZOVKU!
function PlayerCard({ player, color, sortedPlayers }) {
  // NOVÁ LOGIKA - barva podle relativního pořadí v zápase
  // Zvýrazněno celkem 12 hráčů: 3 zelené + 3 světle zelené + 3 žluté + 3 červené
  const getRatingColorByRank = (player) => {
    // Najdeme pozici aktuálního hráče v seřazeném seznamu
    const rank = sortedPlayers.findIndex(p => 
      p.name === player.name && p.overall === player.overall
    ) + 1; // +1 protože findIndex vrací 0-based index
    
    const totalPlayers = sortedPlayers.length;
    
    // TOP 3 hráči (1-3) = intenzivní zelená
    if (rank <= 3) return 'text-emerald-400 bg-emerald-500/30 border-emerald-400/50';
    
    // 4.-6. místo = světlejší zelená
    if (rank <= 6) return 'text-green-400 bg-green-500/20 border-green-400/40';
    
    // POSLEDNÍ 3 hráči = červená (nejhorší v zápase!)
    if (rank > totalPlayers - 3) return 'text-red-400 bg-red-500/20 border-red-400/30';
    
    // 3 PŘED ČERVENOU = žlutá (varování - skoro nejhorší)
    if (rank > totalPlayers - 6) return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
    
    // Zbytek (7. až předposlední 7.) = normální bez zvýraznění
    return 'text-slate-400 bg-slate-500/10 border-slate-400/20';
  };

  const colorClasses = {
    blue: {
      dres: 'bg-gradient-to-br from-blue-600 to-blue-700',
      border: 'border-blue-400/20',
      hover: 'hover:border-blue-400/50'
    },
    gray: {
      dres: 'bg-gradient-to-br from-gray-600 to-gray-700',
      border: 'border-gray-400/20',
      hover: 'hover:border-gray-400/50'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`
      relative bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 border transition-all duration-200 hover:scale-105
      ${player.isUserPlayer 
        ? 'border-yellow-500 bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/10 ring-1 ring-yellow-400/60 shadow-lg shadow-yellow-500/20' 
        : `${classes.border} ${classes.hover} hover:shadow-md`
      }
    `}>
      {/* HVĚZDIČKA PRO TVÉHO HRÁČE - MENŠÍ */}
      {player.isUserPlayer && (
        <div className="absolute -top-1 -right-1 z-20">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 blur-sm"></div>
            <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full p-1 shadow-lg border border-yellow-300">
              <Star size={10} className="text-white fill-white" />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* AVATAR/FOTKA - MENŠÍ */}
        <div className={`
          relative w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0
          shadow-md border border-white/10 overflow-hidden
          ${player.isUserPlayer 
            ? 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 text-white' 
            : `${classes.dres} text-white`
          }
        `}>
          {/* Fotka hráče - pokud existuje */}
          {player.photo ? (
            <img 
              src={player.photo} 
              alt={player.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Pokud se fotka nenačte, zobraz iniciály
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
          ) : null}
          
          {/* Iniciály - fallback když není fotka nebo se nenačetla */}
          <div className={`text-[10px] font-black ${player.photo ? 'hidden' : ''}`}>
            {player.name.split(' ').map(n => n[0]).join('')}
          </div>
          
          {/* ČÍSLO NA DRESU - MENŠÍ */}
          <div className={`
            absolute -bottom-0.5 -right-0.5 rounded px-1 text-[9px] font-black border
            ${player.isUserPlayer 
              ? 'bg-yellow-600 text-white border-yellow-400' 
              : 'bg-slate-900 text-white border-slate-700'
            }
          `}>
            {player.number}
          </div>
        </div>

        {/* INFO O HRÁČI - KOMPAKTNÍ */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-[11px] leading-tight truncate mb-0.5
            ${player.isUserPlayer ? 'text-yellow-300' : 'text-white'}
          `}>
            {player.name}
          </h4>
          
          {/* RATING + INFO */}
          <div className="flex items-center gap-1">
            <div className={`
              px-1.5 py-0.5 rounded border font-bold text-[10px]
              ${getRatingColorByRank(player)}
            `}>
              {player.overall}
            </div>
            
            {/* SPECIFICKÁ POZICE */}
            {player.specificPosition && (
              <div className="bg-blue-900/40 border border-blue-500/30 rounded px-1 py-0.5">
                <span className="text-blue-300 text-[9px] font-bold">{player.specificPosition}</span>
              </div>
            )}
            
            <span className="text-gray-400 text-[9px]">{player.age}let</span>

            {player.isUserPlayer && (
              <div className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border border-yellow-400/50 rounded px-1 py-0.5">
                <span className="text-yellow-300 text-[9px] font-bold">TY</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

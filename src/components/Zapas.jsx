import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { TeamRoster } from './ZapasSoupisky';
import { ZapasCasomira } from './ZapasCasomira';
import { ZapasStatistiky } from './ZapasStatistiky';
import { PuckStatusWindow } from './udalosti/CentralaUdalosti';

export default function Zapas() {
  const navigate = useNavigate();

  // Sestavy z sessionStorage (beze změny)
  const [lancersLineup] = useState(() => {
    const saved = sessionStorage.getItem('lancersLineup');
    return saved ? JSON.parse(saved) : null;
  });
  const [mostLineup] = useState(() => {
    const saved = sessionStorage.getItem('mostLineup');
    return saved ? JSON.parse(saved) : null;
  });

  // Pomocné
  const getSortedPlayers = () => {
    if (!lancersLineup || !mostLineup) return [];
    const all = [
      lancersLineup.goalie,
      ...lancersLineup.defenders,
      ...lancersLineup.forwards,
      mostLineup.goalie,
      ...mostLineup.defenders,
      ...mostLineup.forwards
    ].filter(Boolean);
    return [...all].sort((a,b) => (b.overall||0) - (a.overall||0));
  };
  const sortedPlayers = getSortedPlayers();

  // Čas a perioda
  const [gameTime, setGameTime] = useState(1200);
  const [period, setPeriod] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(1);

  // Skóre + statistiky (ponecháno)
  const [lancersScore, setLancersScore] = useState(0);
  const [mostScore, setMostScore] = useState(0);
  const [stats, setStats] = useState({
    lancers: { shots: 0, penalties: 0, faceoffsWon: 0, faceoffsTotal: 0, powerPlayGoals: 0, shortHandedGoals: 0, powerPlayOpportunities: 0, penaltyKills: 0, penaltyKillOpportunities: 0 },
    most:    { shots: 0, penalties: 0, faceoffsWon: 0, faceoffsTotal: 0, powerPlayGoals: 0, shortHandedGoals: 0, powerPlayOpportunities: 0, penaltyKills: 0, penaltyKillOpportunities: 0 }
  });
  const [lancersPenalties, setLancersPenalties] = useState([]);
  const [mostPenalties, setMostPenalties] = useState([]);

  // Hráči na ledě (ponecháno chování i UI)
  const [onIcePlayers, setOnIcePlayers] = useState({
    lancers: { defenders: [], forwards: [], goalie: null },
    most: { defenders: [], forwards: [], goalie: null }
  });

  // TOI + per-player stats (ponecháno)
  const [playerCurrentIceTime, setPlayerCurrentIceTime] = useState({});
  const [playerTotalIceTime, setPlayerTotalIceTime] = useState({});
  const [playerGameStats, setPlayerGameStats] = useState({});

  const [nextFaceoffTimer, setNextFaceoffTimer] = useState(null);
  const [lastFaceoff, setLastFaceoff] = useState(null);
  const [puckStatus, setPuckStatus] = useState({ team: null, zone: null, hasPuck: false });

  // První nasazení hráčů (beze změny principu)
  useEffect(() => {
    if (lancersLineup && mostLineup && onIcePlayers.lancers.defenders.length === 0) {
      initializeFirstShift();
    }
  }, [lancersLineup, mostLineup]);

  // Čas pro naplánované vhazování (po gólu)
  useEffect(() => {
    if (!isRunning || nextFaceoffTimer === null) return;
    if (gameTime <= nextFaceoffTimer) {
      setNextFaceoffTimer(null);
      performFaceoff();
    }
  }, [isRunning, nextFaceoffTimer, gameTime]);

  // Hlavní ticker
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setGameTime(prev => {
        const newTime = prev - 1; // Vždy odečítáme jen 1 sekundu
        
        // Pokud jsme těsně před koncem třetiny nebo přesáhli
        if (newTime <= 0) {
          // Zastaví časomíru
          setIsRunning(false);
          return 0; // Nastaví na 0, aby se zobrazil konec třetiny
        }
        return newTime;
      });

      // Přičítání TOI hráčům na ledě (vždy jen 1 sekundu)
      setPlayerCurrentIceTime(prev => accumulateIceTime(prev, onIcePlayers, lancersLineup, mostLineup, 1));
      setPlayerTotalIceTime(prev => accumulateIceTime(prev, onIcePlayers, lancersLineup, mostLineup, 1));

      // TODO: Zde bude později implementace střelby a útoků
    }, 1000 / timeSpeed); // Interval běží rychleji podle timeSpeed
    return () => clearInterval(interval);
  }, [isRunning, timeSpeed, period, onIcePlayers, lancersLineup, mostLineup, lancersScore, mostScore]);

  // Automatické buly při začátku nové třetiny (v čase XX:01)
  useEffect(() => {
    if (period > 1 && gameTime === 1199) {
      // Když začíná 2. nebo 3. třetina, spusť úvodní buly
      // gameTime 1199 odpovídá času 20:01 nebo 40:01
      performFaceoff();
      
      // Automaticky spusť časomíru po 3 vteřinách
      setTimeout(() => {
        setIsRunning(true);
      }, 3000);
    }
  }, [period, gameTime]);

  // Přechod mezi třetinami
  useEffect(() => {
    if (gameTime === 0 && period < 3 && !isRunning) {
      // Počkej 2 sekundy (aby se zobrazil konec třetiny) a pak změň třetinu
      const timer = setTimeout(() => {
        setPeriod(p => p + 1);
        setGameTime(1199); // Nastavit na 1199 pro matchTime XX:01
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [gameTime, period, isRunning]);

  // Helpers ────────────────────────────────────────────────────────────────────

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  function initializeFirstShift() {
    const initShift = (lineup) => {
      // Vybereme hráče podle specifických pozic
      const ld = lineup.defenders.find(p => p.specificPosition === 'LD') || lineup.defenders[0];
      const rd = lineup.defenders.find(p => p.specificPosition === 'RD') || lineup.defenders[1];
      const c = lineup.forwards.find(p => p.specificPosition === 'C') || lineup.forwards[0];
      const lw = lineup.forwards.find(p => p.specificPosition === 'LW') || lineup.forwards[1];
      const rw = lineup.forwards.find(p => p.specificPosition === 'RW') || lineup.forwards[2];
      
      return {
        goalie: lineup.goalie,
        defenders: [ld, rd].filter(Boolean),
        forwards: [c, lw, rw].filter(Boolean)
      };
    };

    const lancersShift = initShift(lancersLineup);
    const mostShift = initShift(mostLineup);

    setOnIcePlayers({ lancers: lancersShift, most: mostShift });

    // Init TOI keys + player stats (sanity)
    const initTimes = {};
    const initStats = {};

    if (lancersLineup.goalie) {
      initTimes['lancers-goalie'] = 0;
      initStats['lancers-goalie'] = { saves: 0, shotsAgainst: 0 };
    }
    lancersLineup.defenders.forEach((_, idx) => {
      initTimes[`lancers-defender-${idx}`] = 0;
      initStats[`lancers-defender-${idx}`] = { shots: 0, goals: 0, assists: 0 };
    });
    lancersLineup.forwards.forEach((_, idx) => {
      initTimes[`lancers-forward-${idx}`] = 0;
      initStats[`lancers-forward-${idx}`] = { shots: 0, goals: 0, assists: 0 };
    });

    if (mostLineup.goalie) {
      initTimes['most-goalie'] = 0;
      initStats['most-goalie'] = { saves: 0, shotsAgainst: 0 };
    }
    mostLineup.defenders.forEach((_, idx) => {
      initTimes[`most-defender-${idx}`] = 0;
      initStats[`most-defender-${idx}`] = { shots: 0, goals: 0, assists: 0 };
    });
    mostLineup.forwards.forEach((_, idx) => {
      initTimes[`most-forward-${idx}`] = 0;
      initStats[`most-forward-${idx}`] = { shots: 0, goals: 0, assists: 0 };
    });

    setPlayerCurrentIceTime({ ...initTimes });
    setPlayerTotalIceTime({ ...initTimes });
    setPlayerGameStats({ ...initStats });
  }

  function accumulateIceTime(prev, onIce, lLineup, mLineup, add) {
    const next = { ...prev };
    const updateTeam = (teamKey, team, lineup) => {
      if (team.goalie && lineup.goalie) {
        const k = `${teamKey}-goalie`; next[k] = (next[k] || 0) + add;
      }
      team.defenders.forEach(d => {
        const idx = lineup.defenders.findIndex(p => p && d && p.name === d.name && p.number === d.number);
        if (idx !== -1) {
          const k = `${teamKey}-defender-${idx}`; next[k] = (next[k] || 0) + add;
        }
      });
      team.forwards.forEach(f => {
        const idx = lineup.forwards.findIndex(p => p && f && p.name === f.name && p.number === f.number);
        if (idx !== -1) {
          const k = `${teamKey}-forward-${idx}`; next[k] = (next[k] || 0) + add;
        }
      });
    };
    updateTeam('lancers', onIce.lancers, lLineup);
    updateTeam('most', onIce.most, mLineup);
    return next;
  }

  function scheduleNextFaceoff(customDelay = 3) {
    const t = Math.max(0, gameTime - customDelay);
    setNextFaceoffTimer(t);
  }

  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // Callback pro změnu puckStatus z CentralaUdalosti
  const handlePuckStatusChange = (newStatus) => {
    setPuckStatus(newStatus);
  };

  // Callback pro zastavení časomíry (když hráč musí volit)
  const handlePauseGame = () => {
    setIsRunning(false);
  };

  // Callback pro obnovení časomíry (po volbě hráče)
  const handleResumeGame = () => {
    setIsRunning(true);
  };

  // Callback pro aktualizaci statistik střel
  const handleShot = (shooterInfo, goalieInfo, isGoal) => {
    const { team: shooterTeam, name: shooterName, number: shooterNumber } = shooterInfo;
    const { team: goalieTeam, name: goalieName, number: goalieNumber } = goalieInfo;
    
    // Aktualizuj team statistiky
    setStats(prev => ({
      ...prev,
      [shooterTeam]: { ...prev[shooterTeam], shots: prev[shooterTeam].shots + 1 }
    }));
    
    if (isGoal) {
      if (shooterTeam === 'lancers') {
        setLancersScore(prev => prev + 1);
      } else {
        setMostScore(prev => prev + 1);
      }
    }
    
    // Aktualizuj statistiky střelce
    const shooterLineup = shooterTeam === 'lancers' ? lancersLineup : mostLineup;
    if (shooterLineup) {
      const shooterIdx = shooterLineup.forwards.findIndex(p => p.name === shooterName && p.number === shooterNumber);
      if (shooterIdx !== -1) {
        const shooterKey = `${shooterTeam}-forward-${shooterIdx}`;
        setPlayerGameStats(prev => ({
          ...prev,
          [shooterKey]: {
            ...prev[shooterKey],
            shots: (prev[shooterKey]?.shots || 0) + 1,
            goals: (prev[shooterKey]?.goals || 0) + (isGoal ? 1 : 0)
          }
        }));
      }
    }
    
    // Aktualizuj statistiky brankáře
    const goalieKey = `${goalieTeam}-goalie`;
    setPlayerGameStats(prev => ({
      ...prev,
      [goalieKey]: {
        ...prev[goalieKey],
        shotsAgainst: (prev[goalieKey]?.shotsAgainst || 0) + 1,
        saves: (prev[goalieKey]?.saves || 0) + (isGoal ? 0 : 1)
      }
    }));
  };

  // Callback pro aktualizaci statistik vhazování
  const handleFaceoff = (winner) => {
    setStats(prev => ({
      lancers: { 
        ...prev.lancers, 
        faceoffsTotal: prev.lancers.faceoffsTotal + 1,
        faceoffsWon: prev.lancers.faceoffsWon + (winner === 'lancers' ? 1 : 0)
      },
      most: { 
        ...prev.most, 
        faceoffsTotal: prev.most.faceoffsTotal + 1,
        faceoffsWon: prev.most.faceoffsWon + (winner === 'most' ? 1 : 0)
      }
    }));
  };

  // Callback pro kontrolu střídání před vhazováním
  const handleCheckShift = () => {
    checkAndPerformShift();
  };

  // ── Faceoff (jen na začátku a po gólu)
  function performFaceoff() {
    if (!lancersLineup || !mostLineup) return;
    
    // Před buly zkontroluj a případně střídej
    checkAndPerformShift();
    
    const lf = onIcePlayers.lancers.forwards;
    const mf = onIcePlayers.most.forwards;
    if (lf.length === 0 || mf.length === 0) return;

    const lCenter = lf.find(p => p.specificPosition === 'C') || pickRandom(lf);
    const mCenter = mf.find(p => p.specificPosition === 'C') || pickRandom(mf);

    const roll = () => 0.8 + Math.random() * 0.4;
    const attr = (p) => (p?.attributes?.stealing || 5) + (p?.attributes?.puckControl || 5) + (p?.attributes?.strength || 5);
    const lTotal = attr(lCenter) * roll();
    const mTotal = attr(mCenter) * roll();
    const winner = lTotal >= mTotal ? 'lancers' : 'most';

    // Uložení informací o buly pro zobrazení události
    setLastFaceoff({
      lancersCenter: lCenter,
      mostCenter: mCenter,
      lancersStrength: attr(lCenter),
      mostStrength: attr(mCenter),
      lancersRoll: lTotal,
      mostRoll: mTotal,
      winner,
      timestamp: Date.now()
    });

    // Nastavení puckStatus - po buly má tým puk ve středním pásmu
    setPuckStatus({
      team: winner,
      zone: 'neutral',
      hasPuck: true
    });

    // statistika buly
    setStats(prev => ({
      lancers: { ...prev.lancers, faceoffsTotal: prev.lancers.faceoffsTotal + 1, faceoffsWon: prev.lancers.faceoffsWon + (winner === 'lancers' ? 1 : 0) },
      most: { ...prev.most, faceoffsTotal: prev.most.faceoffsTotal + 1, faceoffsWon: prev.most.faceoffsWon + (winner === 'most' ? 1 : 0) }
    }));
  }

  // ── Sekvence útoku - PŘIPRAVENO PRO BUDOUCÍ IMPLEMENTACI
  // TODO: Zde bude logika střelby, gólů a statistik
  
  // ── Střídání před buly (pokud někdo kromě brankáře > 30s)
  function checkAndPerformShift() {
    if (!lancersLineup || !mostLineup) return;

    // Kontrola: má někdo (ne brankář) ≥ 30 sekund?
    let needsShift = false;
    for (const key in playerCurrentIceTime) {
      if (!key.endsWith('-goalie') && playerCurrentIceTime[key] >= 30) {
        needsShift = true;
        break;
      }
    }

    if (!needsShift) return; // Žádné střídání není potřeba

    // Ulož staré sestavy
    const oldOnIce = {
      lancers: { ...onIcePlayers.lancers },
      most: { ...onIcePlayers.most }
    };

    // Chytré střídání - unavený za čerstvého
    const performSmartShift = (lineup, teamKey, currentOnIce) => {
      const TIRED_THRESHOLD = 30; // Minimální čas pro střídání
      
      // Helper: získej čas hráče
      const getPlayerTime = (player, position) => {
        const allPlayers = position === 'defender' ? lineup.defenders : lineup.forwards;
        const idx = allPlayers.findIndex(p => p.name === player.name && p.number === player.number);
        if (idx === -1) return 0;
        return playerCurrentIceTime[`${teamKey}-${position}-${idx}`] || 0;
      };

      // OBRÁNCI
      const allDefenders = lineup.defenders;
      const onIceDefenders = currentOnIce.defenders || [];
      const benchDefenders = allDefenders.filter(d => 
        !onIceDefenders.some(oi => oi.name === d.name && oi.number === d.number)
      );

      let newDefenders = [...onIceDefenders];
      
      // Pokud je někdo na střídačce, vyměň unavené (≥30s) za čerstvé
      if (benchDefenders.length > 0 && onIceDefenders.length > 0) {
        // Najdi UNAVENÉ obránce na ledě (≥30s)
        const tiredDefenders = onIceDefenders
          .filter(p => getPlayerTime(p, 'defender') >= TIRED_THRESHOLD)
          .sort((a, b) => getPlayerTime(b, 'defender') - getPlayerTime(a, 'defender'));
        
        if (tiredDefenders.length > 0) {
          // Seřaď střídačku podle čerstvosti
          const benchSorted = [...benchDefenders].sort((a, b) => 
            getPlayerTime(a, 'defender') - getPlayerTime(b, 'defender')
          );
          
          // Vyměň unavené za čerstvé
          const shiftsCount = Math.min(tiredDefenders.length, benchSorted.length);
          for (let i = 0; i < shiftsCount; i++) {
            const tired = tiredDefenders[i];
            const fresh = benchSorted[i];
            
            const tiredIdx = newDefenders.findIndex(p => p.name === tired.name && p.number === tired.number);
            if (tiredIdx !== -1) {
              newDefenders[tiredIdx] = fresh;
            }
          }
        }
      }

      // ÚTOČNÍCI
      const allForwards = lineup.forwards;
      const onIceForwards = currentOnIce.forwards || [];
      const benchForwards = allForwards.filter(f => 
        !onIceForwards.some(oi => oi.name === f.name && oi.number === f.number)
      );

      let newForwards = [...onIceForwards];
      
      // Pokud je někdo na střídačce, vyměň unavené (≥30s) za čerstvé
      if (benchForwards.length > 0 && onIceForwards.length > 0) {
        // Najdi UNAVENÉ útočníky na ledě (≥30s)
        const tiredForwards = onIceForwards
          .filter(p => getPlayerTime(p, 'forward') >= TIRED_THRESHOLD)
          .sort((a, b) => getPlayerTime(b, 'forward') - getPlayerTime(a, 'forward'));
        
        if (tiredForwards.length > 0) {
          // Seřaď střídačku podle čerstvosti
          const benchSorted = [...benchForwards].sort((a, b) => 
            getPlayerTime(a, 'forward') - getPlayerTime(b, 'forward')
          );
          
          // Vyměň unavené za čerstvé
          const shiftsCount = Math.min(tiredForwards.length, benchSorted.length);
          for (let i = 0; i < shiftsCount; i++) {
            const tired = tiredForwards[i];
            const fresh = benchSorted[i];
            
            const tiredIdx = newForwards.findIndex(p => p.name === tired.name && p.number === tired.number);
            if (tiredIdx !== -1) {
              newForwards[tiredIdx] = fresh;
            }
          }
        }
      }

      return {
        goalie: lineup.goalie,
        defenders: newDefenders,
        forwards: newForwards
      };
    };

    const newOnIce = {
      lancers: performSmartShift(lancersLineup, 'lancers', oldOnIce.lancers),
      most: performSmartShift(mostLineup, 'most', oldOnIce.most)
    };

    // Nastav nové sestavy
    setOnIcePlayers(newOnIce);

    // Reset časů JEN pro hráče, kteří OPRAVDU vystřídali
    setPlayerCurrentIceTime(prev => {
      const updated = { ...prev };
      
      // Funkce pro kontrolu, jestli hráč zůstal na ledě
      const isStillOnIce = (player, teamKey, category, newTeam) => {
        if (!player) return false;
        
        if (category === 'goalie') {
          return newTeam.goalie?.name === player.name && newTeam.goalie?.number === player.number;
        }
        
        const newPlayers = category === 'defender' ? newTeam.defenders : newTeam.forwards;
        return newPlayers.some(p => p.name === player.name && p.number === player.number);
      };
      
      // Projdi oba týmy
      ['lancers', 'most'].forEach(teamKey => {
        const lineup = teamKey === 'lancers' ? lancersLineup : mostLineup;
        const oldTeam = oldOnIce[teamKey];
        const newTeam = newOnIce[teamKey];
        
        // Brankář - nikdy neresetujeme (zůstává pořád)
        
        // Obránci
        lineup.defenders.forEach((player, idx) => {
          const key = `${teamKey}-defender-${idx}`;
          const wasOnIce = oldTeam.defenders.some(p => p?.name === player.name && p?.number === player.number);
          const stillOnIce = isStillOnIce(player, teamKey, 'defender', newTeam);
          
          // Reset jen pokud BYL na ledě a UŽ NENÍ
          if (wasOnIce && !stillOnIce) {
            updated[key] = 0;
          }
        });
        
        // Útočníci
        lineup.forwards.forEach((player, idx) => {
          const key = `${teamKey}-forward-${idx}`;
          const wasOnIce = oldTeam.forwards.some(p => p?.name === player.name && p?.number === player.number);
          const stillOnIce = isStillOnIce(player, teamKey, 'forward', newTeam);
          
          // Reset jen pokud BYL na ledě a UŽ NENÍ
          if (wasOnIce && !stillOnIce) {
            updated[key] = 0;
          }
        });
      });
      
      return updated;
    });
  }

  // UI helpers
  const cycleSpeed = () => {
    const speeds = [1,2,4,8,16];
    const idx = speeds.indexOf(timeSpeed);
    setTimeSpeed(speeds[(idx + 1) % speeds.length]);
  };

  if (!lancersLineup || !mostLineup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Načítám zápas... 🏒</div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      {/* HLAVIČKA */}
      <div className="bg-slate-900/80 border-b border-slate-700 shadow-xl flex-shrink-0">
        <div className="px-6 py-2">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/pregame')} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft size={16} className="text-white" />
              <span className="text-white font-semibold text-sm">Zpět</span>
            </button>
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400" size={20} />
              <h1 className="text-lg font-bold text-white">ZÁPAS</h1>
              <span className="text-gray-400 text-xs">• 3. kolo FOFR LIGY</span>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* ČASOMÍRA */}
      <ZapasCasomira
        lancersScore={lancersScore}
        mostScore={mostScore}
        gameTime={gameTime}
        period={period}
        isRunning={isRunning}
        timeSpeed={timeSpeed}
        onTogglePlay={() => {
          if (!isRunning) { performFaceoff(); }
          setIsRunning(!isRunning);
        }}
        onCycleSpeed={cycleSpeed}
        lancersPenalties={lancersPenalties}
        mostPenalties={mostPenalties}
        formatTime={formatTime}
      />

      {/* OBSAH */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col gap-4">
        <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden min-h-0">
          {/* Levý tým */}
          <div className="flex flex-col overflow-hidden h-full">
            <TeamRoster
              lineup={lancersLineup}
              name="Litvínov Lancers"
              logo="/Images/Loga/LancersWhite.png"
              color="blue"
              sortedPlayers={sortedPlayers}
              teamKey="lancers"
              onIcePlayers={onIcePlayers}
              playerCurrentIceTime={playerCurrentIceTime}
              playerTotalIceTime={playerTotalIceTime}
              playerGameStats={playerGameStats}
            />
          </div>

          {/* Střed - Statistiky */}
          <div className="flex flex-col gap-4 overflow-hidden h-full">
            <ZapasStatistiky
              stats={stats}
              gameTime={gameTime}
              period={period}
              lastFaceoff={lastFaceoff}
              onIcePlayers={onIcePlayers}
              onPuckStatusChange={handlePuckStatusChange}
              onShot={handleShot}
              onFaceoff={handleFaceoff}
              onCheckShift={handleCheckShift}
              onPauseGame={handlePauseGame}
              onResumeGame={handleResumeGame}
              timeSpeed={timeSpeed}
            />
          </div>

          {/* Pravý tým */}
          <div className="flex flex-col overflow-hidden h-full">
            <TeamRoster
              lineup={mostLineup}
              name="Krysáci Most"
              emoji="🐀"
              color="gray"
              sortedPlayers={sortedPlayers}
              teamKey="most"
              onIcePlayers={onIcePlayers}
              playerCurrentIceTime={playerCurrentIceTime}
              playerTotalIceTime={playerTotalIceTime}
              playerGameStats={playerGameStats}
            />
          </div>
        </div>

        {/* Spodní 6 oken */}
        <div className="h-24 flex-shrink-0">
          <div className="grid grid-cols-6 gap-4 h-full">
            {/* OKNO 1 - Puk Status */}
            <PuckStatusWindow puckStatus={puckStatus} />
            
            {/* Zbylá okna 2-6 */}
            {[2,3,4,5,6].map(num => (
              <div key={num} className="bg-slate-800/90 rounded-xl border-2 border-slate-600 p-3 flex items-center justify-center">
                <div className="text-center"><p className="text-gray-400 text-xs font-semibold">Okno {num}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

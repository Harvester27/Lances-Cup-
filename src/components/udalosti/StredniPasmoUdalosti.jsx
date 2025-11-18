import React, { useState, useEffect } from 'react';

export function StredniPasmoUdalosti({
  attacker,        // {name, number, position, team, isUserPlayer, speed, puckControl, ...}
  opponentLineup,  // Sestava soupeře (pro výběr obránce)
  team,            // 'lancers' nebo 'most'
  timeSpeed = 1,
  onPlayerChoice,  // Callback pro volbu hráče: (action, result) => void
                   // action: 'dump' | 'deke'
                   // result: { success: boolean, defender: {...}, stats: {...} }
  onPauseGame,     // Callback pro zastavení časomíry
  onResumeGame     // Callback pro obnovení časomíry
}) {
  const [phase, setPhase] = useState('waiting'); // 'waiting' | 'player_choice' | 'deking' | 'dump' | 'success' | 'failure'
  const [selectedAction, setSelectedAction] = useState(null);
  const [dekeResult, setDekeResult] = useState(null); // { success: bool, defender: {...}, playerRoll, defenderRoll }

  const teamEmoji = team === 'lancers' ? '🏒' : '🐀';
  const teamColor = team === 'lancers' ? 'text-blue-400' : 'text-gray-400';
  const teamName = team === 'lancers' ? 'Lancers' : 'Most';
  const teamBg = team === 'lancers' ? 'bg-blue-600' : 'bg-gray-600';

  // Při načtení komponenty rozhodněte, jestli hráč může vybírat
  useEffect(() => {
    if (attacker.isUserPlayer) {
      // Hráč ovládá tohoto útočníka - zobrazíme volbu
      setPhase('player_choice');
      // ZASTAVIT ČASOMÍRU - hráč musí volit!
      if (onPauseGame) {
        onPauseGame();
      }
    } else {
      // AI hráč - automaticky nahází puk
      setPhase('dump');
      // Po krátké pauze zavřeme událost
      const timer = setTimeout(() => {
        if (onPlayerChoice) {
          onPlayerChoice('dump', { success: true });
        }
      }, 1500 / timeSpeed);
      return () => clearTimeout(timer);
    }
  }, []);

  // Vyber náhodného útočníka soupeře (křídlo nebo centr)
  const getRandomOpponentForward = () => {
    if (!opponentLineup || !opponentLineup.forwards) {
      return {
        name: 'Obránce',
        number: 99,
        speed: 70,
        puckControl: 70,
        takeaway: 70
      };
    }

    // Filtruj jen křídla a centra
    const eligibleForwards = opponentLineup.forwards.filter(p =>
      p.specificPosition === 'LW' ||
      p.specificPosition === 'C' ||
      p.specificPosition === 'RW'
    );

    if (eligibleForwards.length === 0) {
      // Pokud nejsou k dispozici, vezmi libovolného útočníka
      const randomIndex = Math.floor(Math.random() * opponentLineup.forwards.length);
      return opponentLineup.forwards[randomIndex];
    }

    const randomIndex = Math.floor(Math.random() * eligibleForwards.length);
    return eligibleForwards[randomIndex];
  };

  // Náhodně vyber typ souboje
  const getDekeChallenge = () => {
    const challenges = [
      { type: 'speed', playerStat: 'speed', defenderStat: 'speed', label: 'RYCHLOST vs RYCHLOST' },
      { type: 'control', playerStat: 'puckControl', defenderStat: 'takeaway', label: 'OVLÁDÁNÍ PUKU vs ODEBÍRÁNÍ' },
      { type: 'agility', playerStat: 'agility', defenderStat: 'agility', label: 'OBRATNOST vs OBRATNOST' },
      { type: 'technique', playerStat: 'technique', defenderStat: 'defense', label: 'TECHNIKA vs OBRANA' },
    ];
    return challenges[Math.floor(Math.random() * challenges.length)];
  };

  // Provedení akce "Obehrát"
  const handleDeke = () => {
    setSelectedAction('deke');
    setPhase('deking');

    // OBNOVIT ČASOMÍRU - hráč se rozhodl!
    if (onResumeGame) {
      onResumeGame();
    }

    const defender = getRandomOpponentForward();
    const challenge = getDekeChallenge();

    // Získej hodnoty statistik (s fallbackem)
    const playerStat = attacker.attributes?.[challenge.playerStat] || attacker[challenge.playerStat] || 70;
    const defenderStat = defender.attributes?.[challenge.defenderStat] || defender[challenge.defenderStat] || 70;

    // Hod kostkou (náhodné číslo 0-100)
    const playerRoll = Math.random() * 100;
    const defenderRoll = Math.random() * 100;

    // Celková síla
    const playerTotal = playerStat + playerRoll;
    const defenderTotal = defenderStat + defenderRoll;

    const success = playerTotal > defenderTotal;

    const result = {
      success,
      defender,
      challenge: challenge.label,
      playerStat,
      defenderStat,
      playerRoll,
      defenderRoll,
      playerTotal,
      defenderTotal
    };

    setDekeResult(result);

    // Po animaci zavři událost
    setTimeout(() => {
      setPhase(success ? 'success' : 'failure');

      // Callback
      setTimeout(() => {
        if (onPlayerChoice) {
          onPlayerChoice('deke', result);
        }
      }, 2000 / timeSpeed);
    }, 2000 / timeSpeed);
  };

  // Provedení akce "Nahodit puk"
  const handleDump = () => {
    setSelectedAction('dump');
    setPhase('dump');

    // OBNOVIT ČASOMÍRU - hráč se rozhodl!
    if (onResumeGame) {
      onResumeGame();
    }

    // Po krátké pauze zavři událost
    setTimeout(() => {
      if (onPlayerChoice) {
        onPlayerChoice('dump', { success: true });
      }
    }, 1500 / timeSpeed);
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="text-emerald-400 text-lg">🏒</div>
        <div className="text-white font-bold text-sm">STŘEDNÍ PÁSMO</div>
        {attacker.isUserPlayer && phase === 'player_choice' && (
          <div className="ml-auto">
            <span className="bg-yellow-500/20 border border-yellow-500/50 rounded px-2 py-1 text-xs font-bold text-yellow-300 animate-pulse">
              ⭐ VAŠE VOLBA
            </span>
          </div>
        )}
      </div>

      {/* Hlavní karta */}
      <div className={`bg-gradient-to-r ${
        team === 'lancers'
          ? 'from-blue-900/20 via-blue-800/30 to-blue-900/20'
          : 'from-gray-900/20 via-gray-800/30 to-gray-900/20'
      } rounded-lg p-3 border border-slate-700`}>

        {/* Info o hráči */}
        <div className="flex items-center gap-3 mb-3">
          {/* Číslo hráče */}
          <div className={`w-10 h-10 rounded flex items-center justify-center font-bold text-white flex-shrink-0 ${
            attacker.isUserPlayer ? 'bg-yellow-600 ring-2 ring-yellow-400' : teamBg
          }`}>
            {attacker.number}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-bold text-sm ${attacker.isUserPlayer ? 'text-yellow-300' : 'text-white'}`}>
                {attacker.name}
              </span>
              <span className={`text-xs ${teamColor}`}>({teamName})</span>
              {attacker.position && (
                <span className="bg-purple-900/40 border border-purple-500/30 rounded px-1.5 py-0.5 text-[9px] font-bold text-purple-300">
                  {attacker.position}
                </span>
              )}
              {attacker.isUserPlayer && (
                <span className="text-yellow-400 text-sm">⭐</span>
              )}
            </div>
          </div>

          {/* Emoji týmu */}
          <div className="text-3xl flex-shrink-0">
            {teamEmoji}
          </div>
        </div>

        {/* FÁZE: Volba hráče */}
        {phase === 'player_choice' && (
          <div className="space-y-3 mt-4">
            <div className="text-center text-gray-300 text-sm mb-3">
              Co chcete udělat s pukem?
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDump}
                className="flex-1 bg-slate-700 hover:bg-slate-600 border-2 border-slate-500 rounded-lg p-3 transition-all hover:scale-105"
              >
                <div className="text-2xl mb-1">🏒</div>
                <div className="text-white font-bold text-sm">Nahodit puk</div>
                <div className="text-gray-400 text-xs mt-1">Bezpečná volba</div>
              </button>

              <button
                onClick={handleDeke}
                className="flex-1 bg-amber-900/50 hover:bg-amber-800/50 border-2 border-amber-500/50 rounded-lg p-3 transition-all hover:scale-105"
              >
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-white font-bold text-sm">Obehrát soupeře</div>
                <div className="text-amber-400 text-xs mt-1">Riskantní, ale šance na útok!</div>
              </button>
            </div>
          </div>
        )}

        {/* FÁZE: Nahození puku */}
        {phase === 'dump' && (
          <div className="text-gray-300 text-xs flex items-center gap-2">
            <span className="text-amber-400 text-lg">➡️</span>
            <span>nahazuje puk do útočného pásma</span>
          </div>
        )}

        {/* FÁZE: Obehrávání */}
        {(phase === 'deking' || phase === 'success' || phase === 'failure') && dekeResult && (
          <div className="space-y-3">
            {/* Souboj */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
              <div className="text-center text-xs text-purple-400 font-bold mb-3">
                {dekeResult.challenge}
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Útočník */}
                <div className="flex-1">
                  <div className={`rounded-lg p-2 border-2 ${
                    phase === 'success' ? 'border-emerald-400 bg-emerald-900/30' : 'border-blue-500/50 bg-blue-900/30'
                  }`}>
                    <div className="text-white font-bold text-xs mb-1">{attacker.name}</div>
                    <div className="text-[10px] space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Stat:</span>
                        <span className="text-yellow-400 font-bold">{dekeResult.playerStat}</span>
                      </div>
                      {phase !== 'deking' && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Hod:</span>
                          <span className="text-purple-400 font-bold">{dekeResult.playerRoll.toFixed(1)}</span>
                        </div>
                      )}
                      {phase !== 'deking' && (
                        <div className="flex justify-between border-t border-slate-600 pt-0.5">
                          <span className="text-gray-400">Celkem:</span>
                          <span className="text-cyan-400 font-bold">{dekeResult.playerTotal.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* VS */}
                <div className="text-2xl flex-shrink-0">
                  {phase === 'deking' ? '⚔️' : (phase === 'success' ? '✅' : '❌')}
                </div>

                {/* Obránce */}
                <div className="flex-1">
                  <div className={`rounded-lg p-2 border-2 ${
                    phase === 'failure' ? 'border-red-400 bg-red-900/30' : 'border-gray-500/50 bg-gray-900/30'
                  }`}>
                    <div className="text-white font-bold text-xs mb-1 text-right">{dekeResult.defender.name}</div>
                    <div className="text-[10px] space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-yellow-400 font-bold">{dekeResult.defenderStat}</span>
                        <span className="text-gray-400">Stat:</span>
                      </div>
                      {phase !== 'deking' && (
                        <div className="flex justify-between">
                          <span className="text-purple-400 font-bold">{dekeResult.defenderRoll.toFixed(1)}</span>
                          <span className="text-gray-400">Hod:</span>
                        </div>
                      )}
                      {phase !== 'deking' && (
                        <div className="flex justify-between border-t border-slate-600 pt-0.5">
                          <span className="text-cyan-400 font-bold">{dekeResult.defenderTotal.toFixed(1)}</span>
                          <span className="text-gray-400">Celkem:</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Výsledek */}
            {phase === 'success' && (
              <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-2 text-center">
                <div className="text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
                  <span>🎉</span>
                  <span>ÚSPĚCH! {attacker.name} obešel {dekeResult.defender.name}!</span>
                </div>
                <div className="text-emerald-300 text-xs mt-1">Pokračují v útočném pásmu!</div>
              </div>
            )}

            {phase === 'failure' && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-2 text-center">
                <div className="text-red-400 font-bold text-sm flex items-center justify-center gap-2">
                  <span>😞</span>
                  <span>{dekeResult.defender.name} zastavil {attacker.name}!</span>
                </div>
                <div className="text-red-300 text-xs mt-1">Soupeř získal puk ve středním pásmu!</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

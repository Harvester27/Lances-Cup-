import React from 'react';

export function TeamRoster({ lineup, name, logo, emoji, color, sortedPlayers, teamKey, onIcePlayers, playerCurrentIceTime, playerTotalIceTime, playerGameStats }) {
  const classes = {
    bg: color === 'blue' ? 'bg-blue-900/30' : 'bg-gray-900/30',
    border: color === 'blue' ? 'border-blue-500/50' : 'border-gray-500/50',
    badge: color === 'blue' ? 'bg-blue-900/50 border-blue-500/50' : 'bg-gray-900/50 border-gray-500/50',
    text: color === 'blue' ? 'text-blue-300' : 'text-gray-300'
  };

  const calculateTeamOverall = () => {
    const all = [ lineup.goalie, ...lineup.defenders, ...lineup.forwards ].filter(Boolean);
    const sum = all.reduce((acc, p) => acc + (p.overall || 0), 0);
    return (sum / all.length).toFixed(1);
  };

  const calculateOnIceOverall = () => {
    const team = onIcePlayers[teamKey];
    const onIce = [team.goalie, ...team.defenders, ...team.forwards].filter(Boolean);
    if (onIce.length === 0) return '0.0';
    const sum = onIce.reduce((acc, p) => acc + (p.overall || 0), 0);
    return (sum / onIce.length).toFixed(1);
  };

  return (
    <div className={`${classes.bg} rounded-xl border-2 ${classes.border} p-3 h-full flex flex-col overflow-hidden`}>
      <div className="mb-2 pb-2 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          {logo && <img src={logo} alt={name} className="w-6 h-6" />}
          {emoji && <div className="text-2xl">{emoji}</div>}
          <h3 className="text-white font-bold text-sm">{name}</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1"><span className="text-gray-400">TÝM:</span><span className={`font-bold ${classes.text}`}>{calculateTeamOverall()}</span></div>
          <div className="flex items-center gap-1"><span className="text-gray-400">LED:</span><span className="font-bold text-emerald-400">{calculateOnIceOverall()}</span></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {lineup.goalie && (
          <div>
            <div className={`${classes.badge} border rounded px-1.5 py-0.5 mb-1 w-fit`}><span className="text-white font-bold text-[9px]">🥅 G</span></div>
            <PlayerItem player={lineup.goalie} color={color} sortedPlayers={sortedPlayers} teamKey={teamKey} onIcePlayers={onIcePlayers} playerCurrentIceTime={playerCurrentIceTime} playerTotalIceTime={playerTotalIceTime} playerGameStats={playerGameStats} playerIndex={0} playerCategory="goalie" />
          </div>
        )}

        <div>
          <div className={`${classes.badge} border rounded px-1.5 py-0.5 mb-1 w-fit`}><span className="text-white font-bold text-[9px]">🛡️ D ({lineup.defenders.length})</span></div>
          <div className="space-y-0.5">
            {lineup.defenders.map((player, idx) => (
              <PlayerItem key={idx} player={player} color={color} sortedPlayers={sortedPlayers} teamKey={teamKey} onIcePlayers={onIcePlayers} playerCurrentIceTime={playerCurrentIceTime} playerTotalIceTime={playerTotalIceTime} playerGameStats={playerGameStats} playerIndex={idx} playerCategory="defender" />
            ))}
          </div>
        </div>

        <div>
          <div className={`${classes.badge} border rounded px-1.5 py-0.5 mb-1 w-fit`}><span className="text-white font-bold text-[9px]">⚡ F ({lineup.forwards.length})</span></div>
          <div className="space-y-0.5">
            {lineup.forwards.map((player, idx) => (
              <PlayerItem key={idx} player={player} color={color} sortedPlayers={sortedPlayers} teamKey={teamKey} onIcePlayers={onIcePlayers} playerCurrentIceTime={playerCurrentIceTime} playerTotalIceTime={playerTotalIceTime} playerGameStats={playerGameStats} playerIndex={idx} playerCategory="forward" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerItem({ player, sortedPlayers, teamKey, onIcePlayers, playerCurrentIceTime, playerTotalIceTime, playerGameStats, playerIndex, playerCategory }) {
  const getRatingColorByRank = (player) => {
    if (!sortedPlayers?.length) return 'text-gray-400';
    const rank = sortedPlayers.findIndex(p => p.name === player.name && p.overall === player.overall) + 1;
    const total = sortedPlayers.length;
    if (rank <= 3) return 'text-emerald-400';
    if (rank <= 6) return 'text-green-400';
    if (rank > total - 3) return 'text-red-400';
    if (rank > total - 6) return 'text-yellow-400';
    return 'text-slate-400';
  };

  const isOnIce = (() => {
    const team = onIcePlayers[teamKey] || {};
    if (team.goalie && team.goalie.name === player.name && team.goalie.number === player.number) return true;
    if ((team.defenders||[]).some(p => p.name === player.name && p.number === player.number)) return true;
    if ((team.forwards||[]).some(p => p.name === player.name && p.number === player.number)) return true;
    return false;
  })();

  const formatTime = (s) => {
    if (!s) return '0:00';
    const m = Math.floor(s/60);
    const sec = Math.floor(s%60);
    return `${m}:${sec.toString().padStart(2,'0')}`;
  };

  const playerKey = (playerCategory === 'goalie') ? `${teamKey}-goalie`
    : (playerCategory === 'defender') ? `${teamKey}-defender-${playerIndex}`
    : `${teamKey}-forward-${playerIndex}`;

  const currentTime = playerCurrentIceTime?.[playerKey] || 0;
  const totalTime = playerTotalIceTime?.[playerKey] || 0;
  const pStats = playerGameStats?.[playerKey];

  return (
    <div className={`bg-slate-900/60 rounded px-1.5 py-0.5 flex items-center gap-2 text-[11px] ${player.isUserPlayer ? 'border border-yellow-500 bg-yellow-500/10' : ''}`}>
      {/* Číslo - fixní šířka */}
      <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${player.isUserPlayer ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-white'}`}>{player.number}</div>
      
      {/* Ikona bruslí - vždy přítomná, fixní šířka */}
      <div className="w-5 flex items-center justify-center flex-shrink-0">
        {isOnIce ? (
          <span className="text-emerald-400 text-sm">⛸️</span>
        ) : (
          <span className="text-gray-600 text-xs">◯</span>
        )}
      </div>
      
      {/* Jméno + pozice - fixní šířka */}
      <div className="w-36 flex items-center gap-1 flex-shrink-0">
        <span className={`font-semibold truncate ${player.isUserPlayer ? 'text-yellow-300' : 'text-white'}`}>{player.name}</span>
        {player.specificPosition && (
          <span className="bg-blue-900/40 border border-blue-500/30 rounded px-1 py-0.5 text-[8px] font-bold text-blue-300 flex-shrink-0">{player.specificPosition}</span>
        )}
      </div>

      {/* Čas - fixní šířka */}
      <div className="w-20 text-[9px] flex-shrink-0">
        {(isOnIce || totalTime > 0) ? (
          <div className="flex items-center gap-1">
            {isOnIce && (<><span className="text-emerald-300 font-bold">{formatTime(currentTime)}</span><span className="text-gray-500">/</span></>)}
            <span className="text-gray-400">{formatTime(totalTime)}</span>
          </div>
        ) : (
          <span className="text-gray-600">-</span>
        )}
      </div>
      
      {/* Statistiky - fixní šířka podle typu hráče */}
      {playerCategory === 'goalie' ? (
        <div className="flex items-center gap-2 text-[9px] flex-shrink-0 w-44">
          <span className="text-blue-300 w-10">🧤{pStats?.saves || 0}</span>
          <span className="text-purple-300 w-14">📊{pStats?.shotsAgainst > 0 ? ((pStats.saves / pStats.shotsAgainst) * 100).toFixed(1) : '0.0'}%</span>
          <span className="text-amber-300 w-10">⭐{(pStats?.rating || 0).toFixed(1)}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[9px] flex-shrink-0">
          <span className="text-yellow-300 w-6">⚽{pStats?.goals || 0}</span>
          <span className="text-green-300 w-6">🅰️{pStats?.assists || 0}</span>
          <span className="text-red-300 w-6">🚫{pStats?.pim || 0}</span>
          <span className="text-cyan-300 w-6">📈{(pStats?.goals || 0) + (pStats?.assists || 0)}</span>
          <span className="text-orange-300 w-6">🎯{pStats?.shots || 0}</span>
          <span className="text-indigo-300 w-12">💯{pStats?.shots > 0 ? ((pStats.goals / pStats.shots) * 100).toFixed(1) : '0.0'}%</span>
          <span className="text-amber-300 w-10">⭐{(pStats?.rating || 0).toFixed(1)}</span>
        </div>
      )}

      {/* Overall - na konci */}
      <div className="flex-1"></div>
      <div className={`font-bold flex-shrink-0 ${getRatingColorByRank(player)}`}>{player.overall}</div>
      {player.isUserPlayer && <div className="flex-shrink-0"><span className="text-yellow-400 text-sm">⭐</span></div>}
    </div>
  );
}

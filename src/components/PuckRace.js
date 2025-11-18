// ═══════════════════════════════════════════════════════════════════════════════
// 🏒 PUCK RACE - SOUBOJ O VOLNÝ PUK 🏒
// ═══════════════════════════════════════════════════════════════════════════════
//
// Vypočítá kdo se dostane k volnému puku první po nahození do útočného pásma
// Útočníci (3) týmu co nahazoval vs Obránci (2) soupeře
// Používá SKA (skating) + SPEED + ACCELERATION
//
// ═══════════════════════════════════════════════════════════════════════════════

// ZÓNY
const ZONES = {
  DEFENSIVE: 'defensive',
  NEUTRAL: 'neutral',
  OFFENSIVE: 'offensive'
};

const ZONE_NAMES = {
  defensive: 'obranné pásmo',
  neutral: 'střední pásmo',
  offensive: 'útočné pásmo'
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🏁 VÝPOČET SOUBOJE O PUK
// ═══════════════════════════════════════════════════════════════════════════════

export const calculatePuckRace = ({
  attackingTeam,      // Tým co puk nahazoval
  opposingTeam,       // Soupeřův tým
  onIcePlayers,       // Hráči na ledě
  currentZone,        // Aktuální zóna (offensive)
  gameTime,           // Čas
  period              // Třetina
}) => {
  // Útočníci týmu co nahazoval puk (řítí se za ním)
  const attackingPlayers = onIcePlayers[attackingTeam].forwards;
  
  // Obránci soupeře (brání v obranném pásmu)
  const opposingPlayers = onIcePlayers[opposingTeam].defenders;

  console.log('🏁 PuckRace: Výpočet souboje o puk', {
    attackingTeam,
    attackingForwards: attackingPlayers.length,
    opposingTeam,
    opposingDefenders: opposingPlayers.length,
    zone: currentZone
  });

  // Vypočítáme sílu každého hráče pro race (SKA + SPEED + ACCELERATION)
  const calculateRaceStrength = (player) => {
    const skating = player.attributes.skating || 5;
    const speed = player.attributes.speed || 5;
    const acceleration = player.attributes.acceleration || 5;
    
    return {
      player,
      strength: skating + speed + acceleration,
      details: { skating, speed, acceleration }
    };
  };

  // Vypočítáme síly všech útočníků
  const attackingStrengths = attackingPlayers.map(calculateRaceStrength);
  const opposingStrengths = opposingPlayers.map(calculateRaceStrength);

  // Seřadíme od nejsilnějšího
  attackingStrengths.sort((a, b) => b.strength - a.strength);
  opposingStrengths.sort((a, b) => b.strength - a.strength);

  console.log('🏁 PuckRace: Síly hráčů', {
    attackingTop: attackingStrengths[0],
    opposingTop: opposingStrengths[0]
  });

  // Vezmeme nejrychlejší hráče z každého týmu
  const attackingBest = attackingStrengths[0];
  const opposingBest = opposingStrengths[0];

  // Celková síla = součet všech útočníků vs všech obránců
  const attackingTotal = attackingStrengths.reduce((sum, p) => sum + p.strength, 0);
  const opposingTotal = opposingStrengths.reduce((sum, p) => sum + p.strength, 0);

  // Výpočet šance (50-50 base + modifikace podle síly)
  const totalStrength = attackingTotal + opposingTotal;
  const attackingChance = (attackingTotal / totalStrength) * 100;
  
  // Hod kostkou
  const roll = Math.random() * 100;
  const attackingWins = roll < attackingChance;

  const winner = attackingWins ? attackingBest : opposingBest;
  const winnerTeam = attackingWins ? attackingTeam : opposingTeam;

  console.log('🏁 PuckRace: Výsledek', {
    winner: winner.player.name,
    team: winnerTeam,
    attackingChance: attackingChance.toFixed(1),
    roll: roll.toFixed(1)
  });

  // Vytvoříme detailní popis výpočtu
  const calcDetails = `
⚡ SOUBOJ O PUK:
${attackingTeam === 'lancers' ? '🔵' : '⚫'} ${attackingTeam.toUpperCase()} Útočníci (${attackingStrengths.length}):
${attackingStrengths.map(p => 
  `  ${p.player.name}: ⛸️${p.details.skating} + 🏃${p.details.speed} + ⚡${p.details.acceleration} = ${p.strength}`
).join('\n')}
Celkem: ${attackingTotal}

${opposingTeam === 'lancers' ? '🔵' : '⚫'} ${opposingTeam.toUpperCase()} Obránci (${opposingStrengths.length}):
${opposingStrengths.map(p => 
  `  ${p.player.name}: ⛸️${p.details.skating} + 🏃${p.details.speed} + ⚡${p.details.acceleration} = ${p.strength}`
).join('\n')}
Celkem: ${opposingTotal}

🎲 Šance ${attackingTeam}: ${Math.round(attackingChance)}% | Hod: ${Math.round(roll)}`;

  // Vytvoříme událost s výsledkem
  const event = {
    type: 'puck_race_result',
    team: winnerTeam,
    gameTime: gameTime,
    period: period,
    description: `⚔️ SOUBOJ O VOLNÝ PUK!
${calcDetails}
${attackingWins ? '✅' : '❌'} ${winner.player.name} se dostal k puku první! 🏁`,
    player: winner.player.name,
    zone: currentZone,
    zoneName: ZONE_NAMES[currentZone],
    eventCode: 'PUCK-RACE-RESULT'
  };

  return {
    winner: winner.player,
    winnerTeam: winnerTeam,
    event: event,
    winnerIsForward: attackingWins // true = útočník vyhrál, false = obránce vyhrál
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTY
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  calculatePuckRace,
  ZONES,
  ZONE_NAMES
};

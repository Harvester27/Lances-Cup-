// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 JAK POUŽÍT DECISION SYSTÉM V ZAPAS.JSX
// ═══════════════════════════════════════════════════════════════════════════════
//
// Tento soubor obsahuje příklady jak integrovat NeutralZoneDecisions.js do Zapas.jsx
//
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// 1. IMPORT NA ZAČÁTKU SOUBORU
// ═══════════════════════════════════════════════════════════════════════════════

import { 
  selectRandomVariant, 
  createDecisionEvent,
  executeDecisionAction 
} from './NeutralZoneDecisions';

// ═══════════════════════════════════════════════════════════════════════════════
// 2. PŘIDÁNÍ STAVU PRO ČEKAJÍCÍ DECISION (v komponentě Zapas)
// ═══════════════════════════════════════════════════════════════════════════════

const [pendingDecision, setPendingDecision] = useState(null);
// pendingDecision bude obsahovat decision event když hráč musí rozhodnout

// ═══════════════════════════════════════════════════════════════════════════════
// 3. NAHRAZENÍ STÁVAJÍCÍ DECISION LOGIKY V performFaceoff()
// ═══════════════════════════════════════════════════════════════════════════════

// MÍSTO tohoto kódu (řádky cca 591-623):
/*
const optionsDescription = `${randomDefender.name} má puk ve středním pásmu a rozhoduje se:
      
🎯 Možnosti:
1️⃣ Přihrát volnému levému křídlu (${leftWingName})
2️⃣ Nahrát druhému obránci (${otherDefenderName})
3️⃣ Podržet puk a vést útok sám

⏳ Rozhodování...`;

const randomDelay = 3 + Math.floor(Math.random() * 8);

const optionsEvent = {
  type: 'player_decision',
  team: winner,
  gameTime: gameTime - 2 - randomDelay,
  period: period,
  description: optionsDescription,
  player: randomDefender.name,
  zone: ZONES.NEUTRAL,
  zoneName: ZONE_NAMES.neutral
};

setEvents(prev => [...prev, optionsEvent]);
*/

// POUŽIJ TOTO:
const randomDelay = 3 + Math.floor(Math.random() * 8);

// Vyber náhodnou variantu decision
const selectedVariant = selectRandomVariant();

// Vytvoř decision event
const decisionEvent = createDecisionEvent({
  variant: selectedVariant,
  puckCarrier: randomDefender,
  team: winner,
  opposingTeam: winner === 'lancers' ? 'most' : 'lancers',
  onIcePlayers: onIcePlayers,
  gameTime: gameTime - 2 - randomDelay,
  period: period
});

// Přidej událost do seznamu
setEvents(prev => [...prev, decisionEvent]);

// Ulož pending decision pro pozdější vyhodnocení
setPendingDecision(decisionEvent);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. AUTOMATICKÉ VYHODNOCENÍ PO TIMEOUTU (nebo po kliknutí hráče)
// ═══════════════════════════════════════════════════════════════════════════════

// Přidej useEffect který po 10 sekundách automaticky vybere akci:

useEffect(() => {
  if (!pendingDecision) return;
  
  // Timeout - po 10 sekundách se automaticky vybere nejbezpečnější možnost
  const timeoutId = setTimeout(() => {
    handleDecisionChoice(0); // Vybere první možnost (obvykle bezpečná přihrávka)
  }, 10000); // 10 sekund
  
  return () => clearTimeout(timeoutId);
}, [pendingDecision]);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. FUNKCE PRO VYHODNOCENÍ ROZHODNUTÍ
// ═══════════════════════════════════════════════════════════════════════════════

const handleDecisionChoice = (optionIndex) => {
  if (!pendingDecision) return;
  
  // Vyhodnotit zvolenou akci
  const result = executeDecisionAction({
    decisionEvent: pendingDecision,
    chosenOptionIndex: optionIndex,
    gameTime: gameTime,
    period: period,
    team: pendingDecision.team,
    opposingTeam: pendingDecision.team === 'lancers' ? 'most' : 'lancers'
  });
  
  // Přidat výsledné události
  setEvents(prev => [...prev, ...result.results]);
  
  // Aktualizovat držitele puku
  if (result.newPuckCarrier) {
    setPuckCarrier(result.newPuckCarrier);
  }
  
  // Aktualizovat zónu
  if (result.newZone) {
    setCurrentZone(result.newZone);
  }
  
  // Pokud došlo ke změně držení puku
  if (result.possessionChange) {
    setAttackingTeam(pendingDecision.team === 'lancers' ? 'most' : 'lancers');
  }
  
  // Vyčistit pending decision
  setPendingDecision(null);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. TLAČÍTKA PRO VÝBĚR MOŽNOSTÍ (v JSX části)
// ═══════════════════════════════════════════════════════════════════════════════

// Někam do JSX přidej (např. nad nebo vedle ZapasUdalosti):
{pendingDecision && (
  <div className="bg-yellow-900/80 border-2 border-yellow-500 rounded-xl p-4 mb-4">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-2xl">⚠️</span>
      <h3 className="text-xl font-bold text-yellow-300">
        ROZHODNUTÍ HRÁČE!
      </h3>
    </div>
    
    <p className="text-white mb-4">
      {pendingDecision.puckCarrier.name} má puk! Co udělá?
    </p>
    
    <div className="space-y-2">
      {pendingDecision.optionsWithPlayers.map((option, idx) => (
        <button
          key={idx}
          onClick={() => handleDecisionChoice(idx)}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg p-3 text-left transition-all hover:scale-[1.02]"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{option.icon}</span>
            <div className="flex-1">
              <div className="text-white font-semibold mb-1">
                {option.description}
                {option.targetPlayer && ` (${option.targetPlayer.name})`}
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                {option.calculatedSuccess ? (
                  <>
                    <span className={`font-bold ${
                      option.calculatedSuccess.successRate >= 70 ? 'text-green-400' :
                      option.calculatedSuccess.successRate >= 50 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {option.calculatedSuccess.successRate}% šance
                    </span>
                    {option.risk && (
                      <span className="text-red-400">⚠️ {option.risk}</span>
                    )}
                  </>
                ) : (
                  <span className="text-green-400 font-bold">
                    ✅ {option.successRate}% (bezpečné)
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
    
    <div className="mt-3 text-xs text-gray-400 text-center">
      Automaticky se vybere nejbezpečnější možnost za 10 sekund...
    </div>
  </div>
)}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. VOLITELNÉ - PAUZA HRY BĚHEM ROZHODOVÁNÍ
// ═══════════════════════════════════════════════════════════════════════════════

// Pokud chceš aby se hra zastavila během rozhodování, přidej do useEffect pro časomíru:

useEffect(() => {
  let interval;
  // Přidej podmínku: !pendingDecision
  if (isRunning && gameTime > 0 && !pendingDecision) {
    interval = setInterval(() => {
      // ... zbytek kódu pro časomíru
    }, 1000);
  }
  return () => clearInterval(interval);
}, [isRunning, gameTime, timeSpeed, pendingDecision]); // Přidej pendingDecision do závislostí

// ═══════════════════════════════════════════════════════════════════════════════
// 8. VOLITELNÉ - OMEZENÍ POČTU DECISIONS ZA ZÁPAS
// ═══════════════════════════════════════════════════════════════════════════════

const [decisionsCount, setDecisionsCount] = useState(0);
const MAX_DECISIONS_PER_GAME = 10;

// V místě kde vytváříš decision event:
if (decisionsCount < MAX_DECISIONS_PER_GAME) {
  const decisionEvent = createDecisionEvent({...});
  setEvents(prev => [...prev, decisionEvent]);
  setPendingDecision(decisionEvent);
  setDecisionsCount(prev => prev + 1);
} else {
  // Přeskoč decision, udělej automaticky bezpečnou přihrávku
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOTOVO! 🎉
// ═══════════════════════════════════════════════════════════════════════════════
//
// Máš teď plně funkční decision systém s:
// ✅ 4 náhodnými variantami
// ✅ Výpočtem úspěšnosti podle atributů
// ✅ Použitím jen hráčů co jsou na ledě
// ✅ Interaktivními tlačítky
// ✅ Automatickým timeoutem
// ✅ Detailními popisy s výpočty
//
// ═══════════════════════════════════════════════════════════════════════════════

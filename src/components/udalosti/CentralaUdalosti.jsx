import React, { useState, useEffect } from 'react';
import { ZacatekZapasuUdalosti } from './ZacatekZapasuUdalosti';
import { KonecTretinyUdalosti } from './KonecTretinyUdalosti';
import { BuleUdalosti } from './BuleUdalosti';
import { StredniPasmoUdalosti } from './StredniPasmoUdalosti';
import { UtocnePasmoNikdonemapuk } from './UtocnePasmoNikdonemapuk';
import { UtocnePasmo } from './UtocnePasmo';
import { ObrannePasmo } from './ObrannePasmo';

export function CentralaUdalosti({ gameTime, period, lastFaceoff, onIcePlayers, onPuckStatusChange, onShot, onFaceoff, onCheckShift, onPauseGame, onResumeGame, timeSpeed = 1, activePeriodTab = 'active' }) {
  // NOVÝ SYSTÉM - události rozdělené podle třetin
  const [udalostiTretina1, setUdalostiTretina1] = useState([]);
  const [udalostiTretina2, setUdalostiTretina2] = useState([]);
  const [udalostiTretina3, setUdalostiTretina3] = useState([]);
  
  // Pagination - kolik událostí zobrazit
  const [zobrazitPocet1, setZobrazitPocet1] = useState(30);
  const [zobrazitPocet2, setZobrazitPocet2] = useState(30);
  const [zobrazitPocet3, setZobrazitPocet3] = useState(30);
  
  const [nextEventTime, setNextEventTime] = useState(null);
  const [nextEventType, setNextEventType] = useState(null); // 'stredni_pasmo', 'souboj_o_puk', 'po_souboji', 'vhazovani_utocne_pasmo', 'po_vhazovani_utocne_pasmo', 'vhazovani_stred', 'po_vhazovani_stred'
  const [lastAttackingTeam, setLastAttackingTeam] = useState(null); // Pamatujeme si útočící tým
  const [battleResult, setBattleResult] = useState(null); // Výsledek souboje o puk
  const [faceoffResult, setFaceoffResult] = useState(null); // Výsledek vhazování v útočném pásmu
  const [centerFaceoffResult, setCenterFaceoffResult] = useState(null); // Výsledek vhazování ve středu po gólu
  const [processedTimes, setProcessedTimes] = useState(new Set()); // Sledování již zpracovaných časů

  // Pomocná funkce pro přidání události do správné třetiny
  const pridejUdalost = (udalost, tretina = null) => {
    // Pokud není uvedena třetina, urči ji podle matchTime
    let targetTretina = tretina;
    if (targetTretina === null) {
      const currentMatchTime = (period - 1) * 1200 + (1200 - gameTime);
      if (currentMatchTime < 1200) {
        targetTretina = 1;
      } else if (currentMatchTime < 2400) {
        targetTretina = 2;
      } else {
        targetTretina = 3;
      }
    }
    
    if (targetTretina === 1) {
      setUdalostiTretina1(prev => [udalost, ...prev]);
    } else if (targetTretina === 2) {
      setUdalostiTretina2(prev => [udalost, ...prev]);
    } else if (targetTretina === 3) {
      setUdalostiTretina3(prev => [udalost, ...prev]);
    }
  };

  // Převod času časomíry na čas zápasu (od 00:00 do 60:00)
  const calculateMatchTime = () => {
    return (period - 1) * 1200 + (1200 - gameTime);
  };

  const matchTime = calculateMatchTime();

  const formatMatchTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sledování času a přidávání nových událostí
  useEffect(() => {
    // 00:00 - Začátek zápasu
    if (matchTime === 0 && !processedTimes.has('start-0')) {
      pridejUdalost({
        id: 'start-0',
        cas: '00:00',
        komponenta: <ZacatekZapasuUdalosti />
      }, 1);
      setProcessedTimes(prev => new Set(prev).add('start-0'));
    }

    // 00:01 - Úvodní buly 1. třetiny
    if (matchTime >= 1 && lastFaceoff && !processedTimes.has('faceoff-1')) {
      pridejUdalost({
        id: 'faceoff-1',
        cas: '00:01',
        komponenta: <BuleUdalosti timeSpeed={timeSpeed} 
          lancersCenter={lastFaceoff.lancersCenter}
          mostCenter={lastFaceoff.mostCenter}
          lancersStrength={lastFaceoff.lancersStrength}
          mostStrength={lastFaceoff.mostStrength}
          lancersRoll={lastFaceoff.lancersRoll}
          mostRoll={lastFaceoff.mostRoll}
          winner={lastFaceoff.winner}
        timeSpeed={timeSpeed}
        />
      }, 1);
      
      // Naplánuj první událost ve středním pásmu
      const randomDelay = Math.floor(Math.random() * 8) + 3; // 3-10 sekund
      setNextEventTime(1 + randomDelay);
      setNextEventType('stredni_pasmo');
      setProcessedTimes(prev => new Set(prev).add('faceoff-1'));
    }

    // 20:00 - Konec 1. třetiny (period=1, gameTime=0)
    if (period === 1 && gameTime === 0 && !processedTimes.has('end-period-1')) {
      pridejUdalost({
        id: 'end-period-1',
        cas: '20:00',
        komponenta: <KonecTretinyUdalosti periodEnding={1} />
      }, 1);
      setProcessedTimes(prev => new Set(prev).add('end-period-1'));
    }

    // 20:01 - Úvodní buly 2. třetiny (period=2, gameTime=1199)
    if (period === 2 && gameTime <= 1199 && lastFaceoff && !processedTimes.has('faceoff-1201')) {
      pridejUdalost({
        id: 'faceoff-1201',
        cas: '20:01',
        komponenta: <BuleUdalosti timeSpeed={timeSpeed} 
          lancersCenter={lastFaceoff.lancersCenter}
          mostCenter={lastFaceoff.mostCenter}
          lancersStrength={lastFaceoff.lancersStrength}
          mostStrength={lastFaceoff.mostStrength}
          lancersRoll={lastFaceoff.lancersRoll}
          mostRoll={lastFaceoff.mostRoll}
          winner={lastFaceoff.winner}
        timeSpeed={timeSpeed}
        />
      });
      
      // Naplánuj první událost ve středním pásmu
      const randomDelay = Math.floor(Math.random() * 8) + 3; // 3-10 sekund
      setNextEventTime(1201 + randomDelay);
      setNextEventType('stredni_pasmo');
      setProcessedTimes(prev => new Set(prev).add('faceoff-1201'));
    }

    // 40:00 - Konec 2. třetiny (period=2, gameTime=0)
    if (period === 2 && gameTime === 0 && !processedTimes.has('end-period-2')) {
      pridejUdalost({
        id: 'end-period-2',
        cas: '40:00',
        komponenta: <KonecTretinyUdalosti periodEnding={2} />
      });
      setProcessedTimes(prev => new Set(prev).add('end-period-2'));
    }

    // 40:01 - Úvodní buly 3. třetiny (period=3, gameTime=1199)
    if (period === 3 && gameTime <= 1199 && lastFaceoff && !processedTimes.has('faceoff-2401')) {
      pridejUdalost({
        id: 'faceoff-2401',
        cas: '40:01',
        komponenta: <BuleUdalosti timeSpeed={timeSpeed} 
          lancersCenter={lastFaceoff.lancersCenter}
          mostCenter={lastFaceoff.mostCenter}
          lancersStrength={lastFaceoff.lancersStrength}
          mostStrength={lastFaceoff.mostStrength}
          lancersRoll={lastFaceoff.lancersRoll}
          mostRoll={lastFaceoff.mostRoll}
          winner={lastFaceoff.winner}
        timeSpeed={timeSpeed}
        />
      });
      
      // Naplánuj první událost ve středním pásmu
      const randomDelay = Math.floor(Math.random() * 8) + 3; // 3-10 sekund
      setNextEventTime(2401 + randomDelay);
      setNextEventType('stredni_pasmo');
      setProcessedTimes(prev => new Set(prev).add('faceoff-2401'));
    }

    // 60:00 - Konec 3. třetiny a celého zápasu (period=3, gameTime=0)
    if (period === 3 && gameTime === 0 && !processedTimes.has('end-game')) {
      pridejUdalost({
        id: 'end-game',
        cas: '60:00',
        komponenta: <KonecTretinyUdalosti periodEnding={3} />
      });
      setProcessedTimes(prev => new Set(prev).add('end-game'));
    }

    // Události podle typu
    // Používáme >= místo === aby události fungovaly i při rychlém času
    if (nextEventTime !== null && matchTime >= nextEventTime && lastFaceoff && onIcePlayers) {
      
      // STŘEDNÍ PÁSMO - nahození puku
      if (nextEventType === 'stredni_pasmo') {
        const winningTeam = lastAttackingTeam || lastFaceoff.winner; // Použij aktuální útočící tým, nebo vítěze buly
        const teamOnIce = onIcePlayers[winningTeam];
        const opponentTeam = winningTeam === 'lancers' ? 'most' : 'lancers';
        const opponentOnIce = onIcePlayers[opponentTeam];

        if (teamOnIce && teamOnIce.forwards && teamOnIce.forwards.length > 0) {
          // Vyber náhodného útočníka
          const randomIndex = Math.floor(Math.random() * teamOnIce.forwards.length);
          const attacker = teamOnIce.forwards[randomIndex];

          // Handler pro volbu hráče (dump nebo deke)
          const handlePlayerChoice = (action, result) => {
            if (action === 'dump') {
              // Normální nahození - pokračuj souboj o puk za 4 sekundy
              if (onPuckStatusChange) {
                onPuckStatusChange({ team: winningTeam, zone: 'offensive', hasPuck: false });
              }
              setLastAttackingTeam(winningTeam);
              setNextEventTime(matchTime + 4);
              setNextEventType('souboj_o_puk');
            } else if (action === 'deke') {
              if (result.success) {
                // ÚSPĚCH - pokračuj v útočném pásmu, střela na bránu za 2 sekundy
                if (onPuckStatusChange) {
                  onPuckStatusChange({ team: winningTeam, zone: 'offensive', hasPuck: true });
                }
                setLastAttackingTeam(winningTeam);
                setNextEventTime(matchTime + 2);
                setNextEventType('po_souboji'); // Použijeme existující logiku pro střelu

                // Simulujeme výsledek souboje, jako by útočník vyhrál
                setBattleResult({
                  winner: 'attacker',
                  winType: 'deke',
                  attacker: {
                    name: attacker.name,
                    number: attacker.number,
                    team: winningTeam
                  },
                  defender: result.defender
                });
              } else {
                // NEÚSPĚCH - soupeř má puk ve středním pásmu
                if (onPuckStatusChange) {
                  onPuckStatusChange({ team: opponentTeam, zone: 'neutral', hasPuck: true });
                }
                // Soupeř se stává útočícím týmem
                setLastAttackingTeam(opponentTeam);
                setNextEventTime(matchTime + 3);
                setNextEventType('stredni_pasmo');
              }
            }
          };

          pridejUdalost({
            id: `stredni-${matchTime}`,
            cas: formatMatchTime(matchTime),
            komponenta: <StredniPasmoUdalosti
              attacker={{
                name: attacker.name,
                number: attacker.number,
                position: attacker.specificPosition,
                team: winningTeam,
                isUserPlayer: attacker.isUserPlayer,
                speed: attacker.attributes?.speed || attacker.speed || 70,
                puckControl: attacker.attributes?.puckControl || attacker.puckControl || 70,
                agility: attacker.attributes?.agility || attacker.agility || 70,
                technique: attacker.attributes?.technique || attacker.technique || 70,
                defense: attacker.attributes?.defense || attacker.defense || 70,
                takeaway: attacker.attributes?.takeaway || attacker.takeaway || 70
              }}
              opponentLineup={{
                forwards: opponentOnIce?.forwards || []
              }}
              team={winningTeam}
              timeSpeed={timeSpeed}
              onPlayerChoice={handlePlayerChoice}
              onPauseGame={onPauseGame}
              onResumeGame={onResumeGame}
            />
          });

          // DŮLEŽITÉ: Resetuj nextEventTime hned po vytvoření události, aby se neopakovala
          // Callback onPlayerChoice nastaví nový čas
          setNextEventTime(null);
          setNextEventType(null);
        }
      }
      
      // SOUBOJ O PUK v rohu
      else if (nextEventType === 'souboj_o_puk' && lastAttackingTeam) {
        const attackingTeam = lastAttackingTeam;
        const defendingTeam = attackingTeam === 'lancers' ? 'most' : 'lancers';
        
        const attackingOnIce = onIcePlayers[attackingTeam];
        const defendingOnIce = onIcePlayers[defendingTeam];
        
        if (attackingOnIce && defendingOnIce && 
            attackingOnIce.forwards.length > 0 && 
            defendingOnIce.defenders.length > 0) {
          
          // Vyber náhodného útočníka z útočícího týmu
          const randomAttackerIdx = Math.floor(Math.random() * attackingOnIce.forwards.length);
          const attacker = attackingOnIce.forwards[randomAttackerIdx];
          
          // Vyber náhodného obránce z bránícího týmu
          const randomDefenderIdx = Math.floor(Math.random() * defendingOnIce.defenders.length);
          const defender = defendingOnIce.defenders[randomDefenderIdx];
          
          // VÝPOČET VÍTĚZE PODLE RYCHLOSTI
          const attackerSpeed = attacker.attributes?.speed || attacker.speed;
          const defenderSpeed = defender.attributes?.speed || defender.speed;
          const speedDiff = Math.abs(attackerSpeed - defenderSpeed);
          
          // Výpočet "hodů" - náhodné číslo vážené rychlostí
          const attackerRoll = Math.random() * attackerSpeed;
          const defenderRoll = Math.random() * defenderSpeed;
          
          let winner, winType;
          
          if (speedDiff >= 10) {
            // Velký rozdíl - vyhrává rychlejší
            winner = attackerSpeed > defenderSpeed ? 'attacker' : 'defender';
            winType = 'clear'; // Jasná výhra
          } else {
            // Malý rozdíl - rozhodne hod
            winner = attackerRoll > defenderRoll ? 'attacker' : 'defender';
            winType = 'lucky'; // Štěstí
          }
          
          // Uložíme výsledek souboje
          const result = {
            winner: winner,
            winType: winType,
            attackerSpeed: attackerSpeed,
            defenderSpeed: defenderSpeed,
            speedDiff: speedDiff,
            attackerRoll: attackerRoll,
            defenderRoll: defenderRoll,
            defender: {
              name: defender.name,
              number: defender.number,
              team: defendingTeam
            },
            attacker: {
              name: attacker.name,
              number: attacker.number,
              team: attackingTeam
            }
          };
          
          setBattleResult(result);
          
          pridejUdalost({
            id: `battle-${matchTime}`, // Unikátní ID
            cas: formatMatchTime(matchTime),
            komponenta: <UtocnePasmoNikdonemapuk 
              defender={{
                name: defender.name,
                number: defender.number,
                team: defendingTeam,
                speed: defenderSpeed
              }}
              attacker={{
                name: attacker.name,
                number: attacker.number,
                team: attackingTeam,
                speed: attackerSpeed
              }}
              battleResult={result}
            timeSpeed={timeSpeed}
            />
          });
          
          // Naplánuj další událost za 2 sekundy - VĚTVENÍ podle vítěze!
          setNextEventTime(matchTime + 2);
          setNextEventType('po_souboji');
        }
      }
      
      // PO SOUBOJI - Větví se podle toho, kdo vyhrál
      else if (nextEventType === 'po_souboji' && battleResult) {
        const attackingTeam = battleResult.attacker.team;
        const defendingTeam = battleResult.defender.team;
        
        // Pokud vyhrál ÚTOČNÍK
        if (battleResult.winner === 'attacker') {
          const attackingOnIce = onIcePlayers[attackingTeam];
          const defendingOnIce = onIcePlayers[defendingTeam];
          
          if (attackingOnIce && attackingOnIce.forwards && attackingOnIce.forwards.length > 0 && defendingOnIce && defendingOnIce.goalie) {
            // Vyber náhodného útočníka (může to být i ten samý co vyhrál souboj)
            const randomIdx = Math.floor(Math.random() * attackingOnIce.forwards.length);
            const shooter = attackingOnIce.forwards[randomIdx];
            const goalie = defendingOnIce.goalie;
            
            // VÝPOČET STŘELBY
            const shooterShooting = shooter.attributes?.shooting || shooter.shooting || 5;
            const shooterStrength = shooter.attributes?.strength || shooter.strength || 5;
            const goalieReflexes = goalie.attributes?.reflexes || goalie.reflexes || 5;
            const goaliePositioning = goalie.attributes?.positioning || goalie.positioning || 5;
            const goalieGlove = goalie.attributes?.glove || goalie.glove || 5;
            const goalieBlocker = goalie.attributes?.blocker || goalie.blocker || 5;
            
            const attackPower = shooterShooting + shooterStrength;
            const goaliePower = goalieReflexes + goaliePositioning + (goalieGlove + goalieBlocker) / 2;
            
            const attackRoll = Math.random() * attackPower;
            const goalieRoll = Math.random() * goaliePower;
            
            const isGoal = attackRoll > goalieRoll;
            
            // Aktualizuj statistiku střely
            if (onShot) {
              onShot(
                { team: attackingTeam, name: shooter.name, number: shooter.number },
                { team: defendingTeam, name: goalie.name, number: goalie.number },
                isGoal
              );
            }
            
            let saveType = null;
            if (!isGoal) {
              const saveRandom = Math.random();
              if (saveRandom < 0.4) {
                saveType = 'cover'; // Přikryje (40%)
              } else if (saveRandom < 0.7) {
                saveType = 'corner'; // Vyrazí do rohu (30%)
              } else {
                saveType = 'rebound'; // Vyrazí před sebe (30%)
              }
            }
            
            const shotResult = {
              isGoal,
              saveType,
              attackPower,
              goaliePower,
              attackRoll,
              goalieRoll
            };
            
            pridejUdalost({
              id: `utocne-pasmo-${matchTime}`,
              cas: formatMatchTime(matchTime),
              komponenta: <UtocnePasmo 
                shooter={{
                  name: shooter.name,
                  number: shooter.number,
                  position: shooter.specificPosition,
                  team: attackingTeam,
                  shooting: shooterShooting,
                  strength: shooterStrength
                }}
                goalie={{
                  name: goalie.name,
                  number: goalie.number,
                  team: defendingTeam,
                  reflexes: goalieReflexes,
                  positioning: goaliePositioning,
                  glove: goalieGlove,
                  blocker: goalieBlocker
                }}
                team={attackingTeam}
                shotResult={shotResult}
              timeSpeed={timeSpeed}
              />
            });
            
            // Přepni okno s pukem - útočné pásmo, útočící tým má puk
            if (onPuckStatusChange) {
              onPuckStatusChange({ team: attackingTeam, zone: 'offensive', hasPuck: true });
            }
            
            // PLÁNOVÁNÍ DALŠÍ UDÁLOSTI podle výsledku střely
            if (isGoal) {
              // GÓL - naplánuj vhazování ve středu za 1 sekundu
              setNextEventTime(matchTime + 1);
              setNextEventType('vhazovani_stred');
              setBattleResult(null);
            } else if (saveType === 'corner') {
              // Vyrazí do rohu - naplánuj souboj o puk za 4 sekundy
              setLastAttackingTeam(attackingTeam); // Útočící tým zůstává stejný
              setNextEventTime(matchTime + 4);
              setNextEventType('souboj_o_puk');
              setBattleResult(null);
              
              // Přepni okno - útočné pásmo BEZ puku
              if (onPuckStatusChange) {
                onPuckStatusChange({ team: attackingTeam, zone: 'offensive', hasPuck: false });
              }
            } else {
              // Přikryje nebo vyrazí před sebe
              if (saveType === 'cover') {
                // PŘIKRYTÍ - naplánuj vhazování v útočném pásmu za 3 sekundy
                setLastAttackingTeam(attackingTeam); // Zapamatuj si útočící tým
                setNextEventTime(matchTime + 3);
                setNextEventType('vhazovani_utocne_pasmo');
                setBattleResult(null);
              } else if (saveType === 'rebound') {
                // VYRAZÍ PŘED SEBE - bránící tým vyhodí na zakázané uvolnění
                // Vhazování v obranném pásmu (= útočném pásmu pro útočící tým) za 3 sekundy
                setLastAttackingTeam(attackingTeam); // Zapamatuj si útočící tým
                setNextEventTime(matchTime + 3);
                setNextEventType('vhazovani_utocne_pasmo');
                setBattleResult(null);
              } else {
                // Nemělo by nastat
                setNextEventTime(null);
                setNextEventType(null);
                setBattleResult(null);
              }
            }
          }
        }
        // Pokud vyhrál OBRÁNCE
        else if (battleResult.winner === 'defender') {
          pridejUdalost({
            id: `obranne-pasmo-${matchTime}`,
            cas: formatMatchTime(matchTime),
            komponenta: <ObrannePasmo 
              defender={{
                name: battleResult.defender.name,
                number: battleResult.defender.number,
                team: defendingTeam
              }}
              team={defendingTeam}
            timeSpeed={timeSpeed}
            />
          });
          
          // Přepni okno s pukem - střední pásmo! (už se dostávají do středního pásma)
          if (onPuckStatusChange) {
            onPuckStatusChange({ team: defendingTeam, zone: 'neutral', hasPuck: true });
          }
          
          // DŮLEŽITÉ: Naplánuj událost pro střední pásmo za 3 sekundy
          // Bránící tým se teď stává útočícím týmem!
          setLastAttackingTeam(defendingTeam);
          setNextEventTime(matchTime + 3);
          setNextEventType('stredni_pasmo');
          setBattleResult(null); // Vyčisti battleResult
        }
      }
      
      // VHAZOVÁNÍ V ÚTOČNÉM PÁSMU
      else if (nextEventType === 'vhazovani_utocne_pasmo' && lastAttackingTeam && onIcePlayers) {
        // Před vhazováním zkontroluj střídání
        if (onCheckShift) {
          onCheckShift();
        }
        
        const attackingTeam = lastAttackingTeam;
        const defendingTeam = attackingTeam === 'lancers' ? 'most' : 'lancers';
        
        const attackingOnIce = onIcePlayers[attackingTeam];
        const defendingOnIce = onIcePlayers[defendingTeam];
        
        if (attackingOnIce && defendingOnIce && 
            attackingOnIce.forwards.length > 0 && 
            defendingOnIce.forwards.length > 0) {
          
          // Vyber centra z obou týmů (náhodně)
          const attackingCenterIdx = Math.floor(Math.random() * attackingOnIce.forwards.length);
          const defendingCenterIdx = Math.floor(Math.random() * defendingOnIce.forwards.length);
          
          const attackingCenter = attackingOnIce.forwards[attackingCenterIdx];
          const defendingCenter = defendingOnIce.forwards[defendingCenterIdx];
          
          // VÝPOČET VHAZOVÁNÍ (stejná logika jako u středového buly)
          const lancersCenter = attackingTeam === 'lancers' ? attackingCenter : defendingCenter;
          const mostCenter = attackingTeam === 'most' ? attackingCenter : defendingCenter;
          
          const lancersStrength = (lancersCenter.attributes?.strength || lancersCenter.strength || 5) + 
                                  (lancersCenter.attributes?.speed || lancersCenter.speed || 5);
          const mostStrength = (mostCenter.attributes?.strength || mostCenter.strength || 5) + 
                              (mostCenter.attributes?.speed || mostCenter.speed || 5);
          
          const lancersRoll = Math.random() * lancersStrength;
          const mostRoll = Math.random() * mostStrength;
          
          const winner = lancersRoll > mostRoll ? 'lancers' : 'most';
          
          const faceoff = {
            lancersCenter,
            mostCenter,
            lancersStrength,
            mostStrength,
            lancersRoll,
            mostRoll,
            winner,
            attackingTeam  // Zapamatuj si který tým útočil
          };
          
          // Aktualizuj statistiku vhazování
          if (onFaceoff) {
            onFaceoff(winner);
          }
          
          setFaceoffResult(faceoff);
          
          // Určení typu zóny pro zobrazení
          const zoneType = attackingTeam === 'lancers' ? 'offensive_lancers' : 'offensive_most';
          
          pridejUdalost({
            id: `faceoff-offensive-${matchTime}`,
            cas: formatMatchTime(matchTime),
            komponenta: <BuleUdalosti timeSpeed={timeSpeed} 
              lancersCenter={faceoff.lancersCenter}
              mostCenter={faceoff.mostCenter}
              lancersStrength={faceoff.lancersStrength}
              mostStrength={faceoff.mostStrength}
              lancersRoll={faceoff.lancersRoll}
              mostRoll={faceoff.mostRoll}
              winner={faceoff.winner}
              zoneType={zoneType}
            timeSpeed={timeSpeed}
        />
          });
          
          // Naplánuj další událost za 2 sekundy
          setNextEventTime(matchTime + 2);
          setNextEventType('po_vhazovani_utocne_pasmo');
        }
      }
      
      // PO VHAZOVÁNÍ V ÚTOČNÉM PÁSMU - Větví se podle vítěze
      else if (nextEventType === 'po_vhazovani_utocne_pasmo' && faceoffResult) {
        const attackingTeam = faceoffResult.attackingTeam;
        const defendingTeam = attackingTeam === 'lancers' ? 'most' : 'lancers';
        const winner = faceoffResult.winner;
        
        // Pokud vyhrál ÚTOČÍCÍ TÝM (zůstává v útočném pásmu)
        if (winner === attackingTeam) {
          const attackingOnIce = onIcePlayers[attackingTeam];
          const defendingOnIce = onIcePlayers[defendingTeam];
          
          if (attackingOnIce && attackingOnIce.forwards && attackingOnIce.forwards.length > 0 && 
              defendingOnIce && defendingOnIce.goalie) {
            
            // Vyber náhodného útočníka pro střelu
            const randomIdx = Math.floor(Math.random() * attackingOnIce.forwards.length);
            const shooter = attackingOnIce.forwards[randomIdx];
            const goalie = defendingOnIce.goalie;
            
            // VÝPOČET STŘELBY (stejný jako předtím)
            const shooterShooting = shooter.attributes?.shooting || shooter.shooting || 5;
            const shooterStrength = shooter.attributes?.strength || shooter.strength || 5;
            const goalieReflexes = goalie.attributes?.reflexes || goalie.reflexes || 5;
            const goaliePositioning = goalie.attributes?.positioning || goalie.positioning || 5;
            const goalieGlove = goalie.attributes?.glove || goalie.glove || 5;
            const goalieBlocker = goalie.attributes?.blocker || goalie.blocker || 5;
            
            const attackPower = shooterShooting + shooterStrength;
            const goaliePower = goalieReflexes + goaliePositioning + (goalieGlove + goalieBlocker) / 2;
            
            const attackRoll = Math.random() * attackPower;
            const goalieRoll = Math.random() * goaliePower;
            
            const isGoal = attackRoll > goalieRoll;
            
            // Aktualizuj statistiku střely
            if (onShot) {
              onShot(
                { team: attackingTeam, name: shooter.name, number: shooter.number },
                { team: defendingTeam, name: goalie.name, number: goalie.number },
                isGoal
              );
            }
            
            let saveType = null;
            if (!isGoal) {
              const saveRandom = Math.random();
              if (saveRandom < 0.4) {
                saveType = 'cover';
              } else if (saveRandom < 0.7) {
                saveType = 'corner';
              } else {
                saveType = 'rebound';
              }
            }
            
            const shotResult = {
              isGoal,
              saveType,
              attackPower,
              goaliePower,
              attackRoll,
              goalieRoll
            };
            
            pridejUdalost({
              id: `utocne-pasmo-after-faceoff-${matchTime}`,
              cas: formatMatchTime(matchTime),
              komponenta: <UtocnePasmo 
                shooter={{
                  name: shooter.name,
                  number: shooter.number,
                  position: shooter.specificPosition,
                  team: attackingTeam,
                  shooting: shooterShooting,
                  strength: shooterStrength
                }}
                goalie={{
                  name: goalie.name,
                  number: goalie.number,
                  team: defendingTeam,
                  reflexes: goalieReflexes,
                  positioning: goaliePositioning,
                  glove: goalieGlove,
                  blocker: goalieBlocker
                }}
                team={attackingTeam}
                shotResult={shotResult}
              timeSpeed={timeSpeed}
              />
            });
            
            // Přepni okno s pukem
            if (onPuckStatusChange) {
              onPuckStatusChange({ team: attackingTeam, zone: 'offensive', hasPuck: true });
            }
            
            // Plánuj další události podle výsledku
            if (isGoal) {
              // GÓL - naplánuj vhazování ve středu za 1 sekundu
              setNextEventTime(matchTime + 1);
              setNextEventType('vhazovani_stred');
              setFaceoffResult(null);
            } else if (saveType === 'corner') {
              setLastAttackingTeam(attackingTeam);
              setNextEventTime(matchTime + 4);
              setNextEventType('souboj_o_puk');
              setFaceoffResult(null);
              if (onPuckStatusChange) {
                onPuckStatusChange({ team: attackingTeam, zone: 'offensive', hasPuck: false });
              }
            } else if (saveType === 'cover') {
              setLastAttackingTeam(attackingTeam);
              setNextEventTime(matchTime + 3);
              setNextEventType('vhazovani_utocne_pasmo');
              setFaceoffResult(null);
            } else if (saveType === 'rebound') {
              // VYRAZÍ PŘED SEBE - zakázané uvolnění
              // Vhazování v obranném pásmu (= útočném pásmu pro útočící tým) za 3 sekundy
              setLastAttackingTeam(attackingTeam);
              setNextEventTime(matchTime + 3);
              setNextEventType('vhazovani_utocne_pasmo');
              setFaceoffResult(null);
            } else {
              // Nemělo by nastat
              setNextEventTime(null);
              setNextEventType(null);
              setFaceoffResult(null);
            }
          }
        }
        // Pokud vyhrál BRÁNÍCÍ TÝM (přesun do obranného pásma)
        else {
          pridejUdalost({
            id: `obranne-pasmo-after-faceoff-${matchTime}`,
            cas: formatMatchTime(matchTime),
            komponenta: <ObrannePasmo 
              defender={{
                name: winner === 'lancers' ? faceoffResult.lancersCenter.name : faceoffResult.mostCenter.name,
                number: winner === 'lancers' ? faceoffResult.lancersCenter.number : faceoffResult.mostCenter.number,
                team: winner
              }}
              team={winner}
            timeSpeed={timeSpeed}
            />
          });
          
          // Přepni okno s pukem - střední pásmo
          if (onPuckStatusChange) {
            onPuckStatusChange({ team: winner, zone: 'neutral', hasPuck: true });
          }
          
          // Naplánuj událost pro střední pásmo
          setLastAttackingTeam(winner);
          setNextEventTime(matchTime + 3);
          setNextEventType('stredni_pasmo');
          setFaceoffResult(null);
        }
      }
      
      // VHAZOVÁNÍ VE STŘEDU PO GÓLU
      else if (nextEventType === 'vhazovani_stred' && onIcePlayers) {
        // Před vhazováním zkontroluj střídání
        if (onCheckShift) {
          onCheckShift();
        }
        
        const lancersOnIce = onIcePlayers.lancers;
        const mostOnIce = onIcePlayers.most;
        
        if (lancersOnIce && mostOnIce && 
            lancersOnIce.forwards.length > 0 && 
            mostOnIce.forwards.length > 0) {
          
          // Vyber centra z obou týmů (náhodně z útočníků)
          const lancersCenterIdx = Math.floor(Math.random() * lancersOnIce.forwards.length);
          const mostCenterIdx = Math.floor(Math.random() * mostOnIce.forwards.length);
          
          const lancersCenter = lancersOnIce.forwards[lancersCenterIdx];
          const mostCenter = mostOnIce.forwards[mostCenterIdx];
          
          // VÝPOČET VHAZOVÁNÍ (stejná logika jako na začátku)
          const lancersStrength = (lancersCenter.attributes?.strength || lancersCenter.strength || 5) + 
                                  (lancersCenter.attributes?.speed || lancersCenter.speed || 5);
          const mostStrength = (mostCenter.attributes?.strength || mostCenter.strength || 5) + 
                              (mostCenter.attributes?.speed || mostCenter.speed || 5);
          
          const lancersRoll = Math.random() * lancersStrength;
          const mostRoll = Math.random() * mostStrength;
          
          const winner = lancersRoll > mostRoll ? 'lancers' : 'most';
          
          const centerFaceoff = {
            lancersCenter,
            mostCenter,
            lancersStrength,
            mostStrength,
            lancersRoll,
            mostRoll,
            winner
          };
          
          // Aktualizuj statistiku vhazování
          if (onFaceoff) {
            onFaceoff(winner);
          }
          
          setCenterFaceoffResult(centerFaceoff);
          
          pridejUdalost({
            id: `faceoff-center-${matchTime}`,
            cas: formatMatchTime(matchTime),
            komponenta: <BuleUdalosti timeSpeed={timeSpeed} 
              lancersCenter={centerFaceoff.lancersCenter}
              mostCenter={centerFaceoff.mostCenter}
              lancersStrength={centerFaceoff.lancersStrength}
              mostStrength={centerFaceoff.mostStrength}
              lancersRoll={centerFaceoff.lancersRoll}
              mostRoll={centerFaceoff.mostRoll}
              winner={centerFaceoff.winner}
              zoneType="neutral"
            timeSpeed={timeSpeed}
        />
          });
          
          // Naplánuj další událost za 3 sekundy
          setNextEventTime(matchTime + 3);
          setNextEventType('po_vhazovani_stred');
        }
      }
      
      // PO VHAZOVÁNÍ VE STŘEDU - pokračuj jako na začátku zápasu
      else if (nextEventType === 'po_vhazovani_stred' && centerFaceoffResult) {
        const winningTeam = centerFaceoffResult.winner;
        const teamOnIce = onIcePlayers[winningTeam];
        const opponentTeam = winningTeam === 'lancers' ? 'most' : 'lancers';
        const opponentOnIce = onIcePlayers[opponentTeam];

        if (teamOnIce && teamOnIce.forwards && teamOnIce.forwards.length > 0) {
          // Vyber náhodného útočníka
          const randomIndex = Math.floor(Math.random() * teamOnIce.forwards.length);
          const attacker = teamOnIce.forwards[randomIndex];

          // Handler pro volbu hráče (dump nebo deke)
          const handlePlayerChoice = (action, result) => {
            if (action === 'dump') {
              // Normální nahození - pokračuj souboj o puk za 4 sekundy
              if (onPuckStatusChange) {
                onPuckStatusChange({ team: winningTeam, zone: 'offensive', hasPuck: false });
              }
              setLastAttackingTeam(winningTeam);
              setNextEventTime(matchTime + 4);
              setNextEventType('souboj_o_puk');
              setCenterFaceoffResult(null);
            } else if (action === 'deke') {
              if (result.success) {
                // ÚSPĚCH - pokračuj v útočném pásmu, střela na bránu za 2 sekundy
                if (onPuckStatusChange) {
                  onPuckStatusChange({ team: winningTeam, zone: 'offensive', hasPuck: true });
                }
                setLastAttackingTeam(winningTeam);
                setNextEventTime(matchTime + 2);
                setNextEventType('po_souboji'); // Použijeme existující logiku pro střelu

                // Simulujeme výsledek souboje, jako by útočník vyhrál
                setBattleResult({
                  winner: 'attacker',
                  winType: 'deke',
                  attacker: {
                    name: attacker.name,
                    number: attacker.number,
                    team: winningTeam
                  },
                  defender: result.defender
                });
                setCenterFaceoffResult(null);
              } else {
                // NEÚSPĚCH - soupeř má puk ve středním pásmu
                if (onPuckStatusChange) {
                  onPuckStatusChange({ team: opponentTeam, zone: 'neutral', hasPuck: true });
                }
                // Soupeř se stává útočícím týmem
                setLastAttackingTeam(opponentTeam);
                setNextEventTime(matchTime + 3);
                setNextEventType('stredni_pasmo');
                setCenterFaceoffResult(null);
              }
            }
          };

          pridejUdalost({
            id: `stredni-after-goal-${matchTime}`,
            cas: formatMatchTime(matchTime),
            komponenta: <StredniPasmoUdalosti
              attacker={{
                name: attacker.name,
                number: attacker.number,
                position: attacker.specificPosition,
                team: winningTeam,
                isUserPlayer: attacker.isUserPlayer,
                speed: attacker.attributes?.speed || attacker.speed || 70,
                puckControl: attacker.attributes?.puckControl || attacker.puckControl || 70,
                agility: attacker.attributes?.agility || attacker.agility || 70,
                technique: attacker.attributes?.technique || attacker.technique || 70,
                defense: attacker.attributes?.defense || attacker.defense || 70,
                takeaway: attacker.attributes?.takeaway || attacker.takeaway || 70
              }}
              opponentLineup={{
                forwards: opponentOnIce?.forwards || []
              }}
              team={winningTeam}
              timeSpeed={timeSpeed}
              onPlayerChoice={handlePlayerChoice}
              onPauseGame={onPauseGame}
              onResumeGame={onResumeGame}
            />
          });

          // DŮLEŽITÉ: Resetuj nextEventTime hned po vytvoření události, aby se neopakovala
          // Callback onPlayerChoice nastaví nový čas
          setNextEventTime(null);
          setNextEventType(null);
        }
      }
    }
  }, [matchTime, period, gameTime, lastFaceoff, nextEventTime, nextEventType, lastAttackingTeam, battleResult, faceoffResult, centerFaceoffResult, onIcePlayers, onPuckStatusChange, processedTimes]);

  // Vyber správné události podle aktivního tabu
  let zobrazeneUdalosti = [];
  let zobrazitPocet = 30;
  let setZobrazitPocet = null;
  
  if (activePeriodTab === 'active') {
    // Aktivní třetina = aktuální period
    if (period === 1) {
      zobrazeneUdalosti = udalostiTretina1;
      zobrazitPocet = zobrazitPocet1;
      setZobrazitPocet = setZobrazitPocet1;
    } else if (period === 2) {
      zobrazeneUdalosti = udalostiTretina2;
      zobrazitPocet = zobrazitPocet2;
      setZobrazitPocet = setZobrazitPocet2;
    } else {
      zobrazeneUdalosti = udalostiTretina3;
      zobrazitPocet = zobrazitPocet3;
      setZobrazitPocet = setZobrazitPocet3;
    }
  } else if (activePeriodTab === '1') {
    zobrazeneUdalosti = udalostiTretina1;
    zobrazitPocet = zobrazitPocet1;
    setZobrazitPocet = setZobrazitPocet1;
  } else if (activePeriodTab === '2') {
    zobrazeneUdalosti = udalostiTretina2;
    zobrazitPocet = zobrazitPocet2;
    setZobrazitPocet = setZobrazitPocet2;
  } else if (activePeriodTab === '3') {
    zobrazeneUdalosti = udalostiTretina3;
    zobrazitPocet = zobrazitPocet3;
    setZobrazitPocet = setZobrazitPocet3;
  }

  // Pagination - zobraz jen prvních X událostí
  const udalostiKZobrazeni = zobrazeneUdalosti.slice(0, zobrazitPocet);
  const maViceUdalosti = zobrazeneUdalosti.length > zobrazitPocet;

  return (
    <div className="space-y-2">
      {/* Debug info - můžeš později smazat */}
      <div className="text-xs text-gray-500 text-center mb-2">
        Čas zápasu: {formatMatchTime(matchTime)} | Třetina: {period} | Časomíra: {Math.floor(gameTime/60)}:{(gameTime%60).toString().padStart(2,'0')}
        {nextEventTime && ` | Další událost: ${formatMatchTime(nextEventTime)}`}
        {` | Událostí: ${zobrazeneUdalosti.length}`}
      </div>

      {zobrazeneUdalosti.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-8">
          Zatím žádné události
        </div>
      ) : (
        <>
          {udalostiKZobrazeni.map((udalost) => (
            <div key={udalost.id} className="bg-slate-900/60 rounded-lg p-3 border border-slate-700">
              <div className="flex items-start gap-3">
                <div className="text-xs font-bold text-purple-400 flex-shrink-0 w-12">
                  {udalost.cas}
                </div>
                <div className="flex-1">
                  {udalost.komponenta}
                </div>
              </div>
            </div>
          ))}
          
          {/* Tlačítko pro načtení dalších událostí */}
          {maViceUdalosti && (
            <button
              onClick={() => setZobrazitPocet && setZobrazitPocet(prev => prev + 20)}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-sm transition-all"
            >
              Načíst dalších 20 událostí ({zobrazeneUdalosti.length - zobrazitPocet} zbývá)
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOVÝ SYSTÉM SLEDOVÁNÍ PUKU - PRO OKNO 1
// ═══════════════════════════════════════════════════════════════════════════════

export function PuckStatusWindow({ puckStatus }) {
  // Zobrazení
  const getZoneName = () => {
    if (!puckStatus || !puckStatus.zone) return 'Čeká se na buly';
    if (puckStatus.zone === 'neutral') return 'Střední pásmo';
    if (puckStatus.zone === 'offensive') {
      const teamName = puckStatus.team === 'lancers' ? 'Lancers' : 'Most';
      return `Útočné pásmo ${teamName}`;
    }
    return 'Neznámé pásmo';
  };

  const getTeamEmoji = () => {
    if (!puckStatus || !puckStatus.team) return '⏳';
    return puckStatus.team === 'lancers' ? '🏒' : '🐀';
  };

  const getGradient = () => {
    if (!puckStatus || !puckStatus.team) return 'from-slate-800/90 to-slate-700/90';
    return puckStatus.team === 'lancers' 
      ? 'from-blue-900/80 to-blue-700/80' 
      : 'from-gray-800/80 to-gray-600/80';
  };

  const getBorderColor = () => {
    if (!puckStatus || !puckStatus.team) return 'border-slate-600';
    return puckStatus.team === 'lancers' ? 'border-blue-500' : 'border-gray-500';
  };

  const getPuckStatusText = () => {
    if (!puckStatus || !puckStatus.hasPuck) return '⚪ Volný puk';
    const teamName = puckStatus.team === 'lancers' ? 'Lancers' : 'Most';
    return `🏒 ${teamName}`;
  };

  const getTextColor = () => {
    if (!puckStatus || !puckStatus.team) return 'text-gray-400';
    return puckStatus.team === 'lancers' ? 'text-blue-300' : 'text-gray-300';
  };

  return (
    <div className={`bg-gradient-to-br ${getGradient()} rounded-xl border-2 ${getBorderColor()} p-3 flex flex-col items-center justify-center h-full shadow-lg transition-all duration-500`}>
      <div className="text-center w-full">
        {/* Emoji týmu */}
        <div className="text-3xl mb-1 animate-pulse">
          {getTeamEmoji()}
        </div>
        
        {/* Pásmo */}
        <div className="text-purple-400 font-black text-[9px] mb-1 tracking-wider uppercase">
          {getZoneName()}
        </div>
        
        {/* Status puku */}
        <div className={`${getTextColor()} font-black text-[10px] tracking-tight`}>
          {getPuckStatusText()}
        </div>
      </div>
    </div>
  );
}

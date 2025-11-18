// GameContext.jsx - React Context pro automatické překreslovánÃ­ komponent
// MODERNÃ VERZE s IPC a fallbackem
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { gameState, getSaveData, loadSaveData, resetGameState } from './gameState';

// VytvoÅ™enÃ­ contextu
export const GameContext = createContext(null);

// Provider komponenta
export function GameProvider({ children }) {
  // State pro React komponenty (kopie globÃ¡lnÃ­ho stavu)
  const [state, setState] = useState({
    player: { ...gameState.player },
    online: { ...gameState.online },
    settings: { ...gameState.settings },
    meta: { ...gameState.meta }
  });

  // Synchronizace: kdyÅ¾ se zmÄ›nÃ­ gameState, aktualizuj React state
  const syncState = useCallback(() => {
    setState({
      player: { ...gameState.player },
      online: { ...gameState.online },
      settings: { ...gameState.settings },
      meta: { ...gameState.meta }
    });
  }, []);

  // ===========================================
  // UPDATE FUNKCE (upravujÃ­ gameState i React state)
  // ===========================================

  // ObecnÃ¡ update funkce
  const updateState = useCallback((category, updates) => {
    // Aktualizuj globÃ¡lnÃ­ gameState
    Object.assign(gameState[category], updates);
    
    // PÅ™ekresli React komponenty
    syncState();
  }, [syncState]);

  // SpecifickÃ© update funkce pro pohodlÃ­
  const updatePlayer = useCallback((updates) => {
    updateState('player', updates);
  }, [updateState]);

  const updateSeason = useCallback((updates) => {
    Object.assign(gameState.player.season, updates);
    syncState();
  }, [syncState]);

  const updateMoney = useCallback((amount) => {
    gameState.player.money += amount;
    syncState();
  }, [syncState]);

  const updateSettings = useCallback((updates) => {
    updateState('settings', updates);
  }, [updateState]);

  // ===========================================
  // ROSTER MANAGEMENT
  // ===========================================

  const addPlayerToRoster = useCallback((player) => {
    gameState.player.roster.push(player);
    syncState();
  }, [syncState]);

  const removePlayerFromRoster = useCallback((playerId) => {
    gameState.player.roster = gameState.player.roster.filter(p => p.id !== playerId);
    syncState();
  }, [syncState]);

  const updateRosterPlayer = useCallback((playerId, updates) => {
    const player = gameState.player.roster.find(p => p.id === playerId);
    if (player) {
      Object.assign(player, updates);
      syncState();
    }
  }, [syncState]);

  // ===========================================
  // EQUIPMENT MANAGEMENT
  // ===========================================

  const addEquipment = useCallback((equipment) => {
    gameState.player.equipment.push(equipment);
    syncState();
  }, [syncState]);

  const removeEquipment = useCallback((equipmentId) => {
    gameState.player.equipment = gameState.player.equipment.filter(e => e.id !== equipmentId);
    syncState();
  }, [syncState]);

  const equipItem = useCallback((equipmentId) => {
    gameState.player.equipment.forEach(eq => {
      eq.equipped = (eq.id === equipmentId);
    });
    syncState();
  }, [syncState]);

  // ===========================================
  // SEASON & MATCHES
  // ===========================================

  const addMatchResult = useCallback((matchResult) => {
    gameState.player.season.matchResults.push(matchResult);
    
    // Aktualizuj statistiky
    if (matchResult.result === 'win') {
      gameState.player.season.wins++;
      gameState.player.season.points += 3;
    } else if (matchResult.result === 'loss') {
      gameState.player.season.losses++;
    } else if (matchResult.result === 'overtimeWin') {
      gameState.player.season.overtimeWins++;
      gameState.player.season.points += 2;
    } else if (matchResult.result === 'overtimeLoss') {
      gameState.player.season.overtimeLosses++;
      gameState.player.season.points += 1;
    }
    
    syncState();
  }, [syncState]);

  const advanceToNextRound = useCallback(() => {
    gameState.player.season.round++;
    
    // Posun datum (napÅ™Ã­klad o 7 dnÃ­)
    const currentDate = new Date(gameState.player.season.currentDate);
    currentDate.setDate(currentDate.getDate() + 7);
    gameState.player.season.currentDate = currentDate.toISOString().split('T')[0];
    
    syncState();
  }, [syncState]);

  // ===========================================
  // ONLINE (pro pozdÄ›ji - Firebase)
  // ===========================================

  const updateMarketplace = useCallback((listings) => {
    gameState.online.marketplace.listings = listings;
    syncState();
  }, [syncState]);

  const addMarketplaceListing = useCallback((listing) => {
    gameState.online.marketplace.myListings.push(listing);
    syncState();
  }, [syncState]);

  // ===========================================
  // SAVE/LOAD SYSTEM - MODERNÃ VERZE
  // ===========================================

  // Pomocná funkce - detekce prostředí
  const isElectron = () => {
    return window.electronAPI && window.electronAPI.isElectron;
  };

  const saveGame = useCallback(async (slotNumber = 1) => {
    try {
      const saveData = getSaveData();
      const filename = `save_slot_${slotNumber}.json`;
      const jsonString = JSON.stringify(saveData, null, 2);
      
      // === ELECTRON (moderní IPC) ===
      if (isElectron()) {
        try {
          const result = await window.electronAPI.saveFile(filename, jsonString);
          
          if (result.success) {
            gameState.meta.lastSaved = new Date().toISOString();
            gameState.meta.saveSlot = slotNumber;
            syncState();
            
            console.log(`✅ Hra uložena (Electron) do slotu ${slotNumber}`);
            console.log(`   📁 Cesta: ${result.path}`);
            return { success: true, location: 'electron', path: result.path };
          } else {
            throw new Error(result.error);
          }
        } catch (electronError) {
          console.warn('⚠️ Electron save selhal, zkouším localStorage...', electronError);
          // Fallback níže
        }
      }
      
      // === FALLBACK: localStorage (vývoj nebo selhání Electronu) ===
      try {
        localStorage.setItem(`hockeyManager_save_${slotNumber}`, jsonString);
        
        gameState.meta.lastSaved = new Date().toISOString();
        gameState.meta.saveSlot = slotNumber;
        syncState();
        
        console.log(`✅ Hra uložena (localStorage) do slotu ${slotNumber}`);
        return { success: true, location: 'localStorage' };
      } catch (storageError) {
        console.error('❌ localStorage save selhal:', storageError);
        throw storageError;
      }
      
    } catch (error) {
      console.error('❌ Všechny save metody selhaly:', error);
      return { 
        success: false, 
        error: error.message,
        userMessage: 'Nepodařilo se uložit hru. Zkus to prosím znovu.' 
      };
    }
  }, [syncState]);

  const loadGame = useCallback(async (slotNumber = 1) => {
    try {
      const filename = `save_slot_${slotNumber}.json`;
      let saveData = null;
      
      // === ELECTRON (moderní IPC) ===
      if (isElectron()) {
        try {
          // Nejdřív zkontroluj jestli soubor existuje
          const existsResult = await window.electronAPI.fileExists(filename);
          
          if (existsResult.exists) {
            const result = await window.electronAPI.loadFile(filename);
            
            if (result.success) {
              saveData = JSON.parse(result.data);
              console.log(`✅ Save načten (Electron) ze slotu ${slotNumber}`);
            } else {
              throw new Error(result.error);
            }
          } else {
            console.log(`⚠️ Electron save neexistuje, zkouším localStorage...`);
            // Fallback níže
          }
        } catch (electronError) {
          console.warn('⚠️ Electron load selhal, zkouším localStorage...', electronError);
          // Fallback níže
        }
      }
      
      // === FALLBACK: localStorage (pokud Electron selhal nebo není k dispozici) ===
      if (!saveData) {
        const stored = localStorage.getItem(`hockeyManager_save_${slotNumber}`);
        
        if (stored) {
          saveData = JSON.parse(stored);
          console.log(`✅ Save načten (localStorage) ze slotu ${slotNumber}`);
        } else {
          return { 
            success: false, 
            error: 'Save nenalezen',
            userMessage: `Save ve slotu ${slotNumber} neexistuje.`
          };
        }
      }
      
      // === NaÄti data do gameState ===
      if (saveData) {
        loadSaveData(saveData);
        gameState.meta.saveSlot = slotNumber;
        gameState.meta.lastLoaded = new Date().toISOString();
        syncState();
        
        return { success: true, slotNumber };
      }
      
      return { 
        success: false, 
        error: 'Nepodařilo se načíst data',
        userMessage: 'Chyba při načítání save souboru.'
      };
      
    } catch (error) {
      console.error('❌ Všechny load metody selhaly:', error);
      return { 
        success: false, 
        error: error.message,
        userMessage: 'Nepodařilo se načíst hru. Save může být poškozený.' 
      };
    }
  }, [syncState]);

  const newGame = useCallback(() => {
    resetGameState();
    syncState();
    console.log('✅ Nová hra vytvořena');
  }, [syncState]);

  // ===========================================
  // AUTO-SAVE (kaÅ¾dÃ½ch 5 minut)
  // ===========================================

  useEffect(() => {
    if (gameState.settings.gameplay.autoSave) {
      const interval = setInterval(() => {
        saveGame(gameState.meta.saveSlot);
        console.log('💾 Auto-save proběhl');
      }, gameState.settings.gameplay.autoSaveInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [saveGame]);

  // ===========================================
  // PLAY TIME TRACKER
  // ===========================================

  useEffect(() => {
    const interval = setInterval(() => {
      gameState.meta.playTime += 1; // kaÅ¾dou sekundu
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ===========================================
  // CONTEXT VALUE
  // ===========================================

  const value = {
    // State (read-only)
    state,
    
    // Update funkce
    updatePlayer,
    updateSeason,
    updateMoney,
    updateSettings,
    
    // Roster
    addPlayerToRoster,
    removePlayerFromRoster,
    updateRosterPlayer,
    
    // Equipment
    addEquipment,
    removeEquipment,
    equipItem,
    
    // Season & Matches
    addMatchResult,
    advanceToNextRound,
    
    // Online (pro pozdÄ›ji)
    updateMarketplace,
    addMarketplaceListing,
    
    // Save/Load
    saveGame,
    loadGame,
    newGame,
    
    // PÅ™Ã­mÃ½ pÅ™Ã­stup k gameState (pro read)
    gameState: gameState,
    
    // Utility
    isElectron: isElectron()
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

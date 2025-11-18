// useGameState.js - Custom hook pro snadné použití v komponentách
import { useContext } from 'react';
import { GameContext } from './GameContext';

/**
 * Hook pro přístup k game state a update funkcím
 * 
 * Použití v komponentě:
 * const { state, updateMoney, saveGame } = useGameState();
 */
export function useGameState() {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGameState musí být použit uvnitř GameProvider');
  }
  
  return context;
}

/**
 * Hook pro přístup pouze k player data (pro optimalizaci)
 */
export function usePlayer() {
  const { state } = useGameState();
  return state.player;
}

/**
 * Hook pro přístup pouze k season data
 */
export function useSeason() {
  const { state } = useGameState();
  return state.player.season;
}

/**
 * Hook pro přístup pouze k settings
 */
export function useSettings() {
  const { state } = useGameState();
  return state.settings;
}

/**
 * Hook pro přístup pouze k online data (marketplace, multiplayer)
 */
export function useOnline() {
  const { state } = useGameState();
  return state.online;
}

/**
 * Hook pro roster management
 */
export function useRoster() {
  const { state, addPlayerToRoster, removePlayerFromRoster, updateRosterPlayer } = useGameState();
  
  return {
    roster: state.player.roster,
    addPlayer: addPlayerToRoster,
    removePlayer: removePlayerFromRoster,
    updatePlayer: updateRosterPlayer
  };
}

/**
 * Hook pro equipment management
 */
export function useEquipment() {
  const { state, addEquipment, removeEquipment, equipItem } = useGameState();
  
  return {
    equipment: state.player.equipment,
    addEquipment,
    removeEquipment,
    equipItem
  };
}

/**
 * Hook pro save/load operace
 */
export function useSaveSystem() {
  const { saveGame, loadGame, newGame } = useGameState();
  
  return {
    saveGame,
    loadGame,
    newGame
  };
}

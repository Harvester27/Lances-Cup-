// src/utils/SaveManager.js
const Store = require('electron-store');

class SaveManager {
  constructor() {
    this.store = new Store({
      name: 'hockey-manager-saves',
      defaults: {
        saves: [],
        currentSave: null,
        settings: {
          sound: true,
          difficulty: 'medium',
          language: 'cs'
        }
      }
    });
  }

  // Uložit hru
  saveGame(saveData) {
    const saves = this.store.get('saves');
    const timestamp = new Date().toISOString();
    
    const newSave = {
      id: Date.now(),
      name: saveData.teamName || 'Bez názvu',
      timestamp: timestamp,
      data: {
        team: saveData.team,
        roster: saveData.roster,
        schedule: saveData.schedule,
        standings: saveData.standings,
        finances: saveData.finances,
        season: saveData.season,
        gameDate: saveData.gameDate,
      }
    };
    
    saves.push(newSave);
    this.store.set('saves', saves);
    this.store.set('currentSave', newSave.id);
    
    return newSave;
  }

  // Načíst hru
  loadGame(saveId) {
    const saves = this.store.get('saves');
    const save = saves.find(s => s.id === saveId);
    
    if (save) {
      this.store.set('currentSave', saveId);
      return save.data;
    }
    
    return null;
  }

  // Seznam všech savů
  getAllSaves() {
    return this.store.get('saves');
  }

  // Smazat save
  deleteSave(saveId) {
    const saves = this.store.get('saves');
    const filtered = saves.filter(s => s.id !== saveId);
    this.store.set('saves', filtered);
    
    if (this.store.get('currentSave') === saveId) {
      this.store.set('currentSave', null);
    }
  }

  // Autosave
  autoSave(gameState) {
    const currentId = this.store.get('currentSave');
    
    if (currentId) {
      const saves = this.store.get('saves');
      const index = saves.findIndex(s => s.id === currentId);
      
      if (index !== -1) {
        saves[index].data = gameState;
        saves[index].timestamp = new Date().toISOString();
        this.store.set('saves', saves);
        
        console.log('🔄 Autosave proběhl');
        return true;
      }
    }
    
    return false;
  }

  // Settings
  getSettings() {
    return this.store.get('settings');
  }

  updateSettings(newSettings) {
    const current = this.store.get('settings');
    this.store.set('settings', { ...current, ...newSettings });
  }
}

// Singleton instance
const saveManager = new SaveManager();
module.exports = saveManager;
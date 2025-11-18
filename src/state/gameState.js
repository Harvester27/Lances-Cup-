// gameState.js - Centrální stav celé hry
// Globální objekt pro snadný save/load + Firebase později

export const gameState = {
  // ===========================================
  // SINGLE-PLAYER DATA (ukládá se do save)
  // ===========================================
  
  player: {
    // Základní info
    name: '',
    team: 'lancers', // ID týmu z scheduleData
    avatar: null,
    
    // Progrese
    level: 1,
    experience: 0,
    
    // Finance
    money: 50000,
    
    // Roster (tvůj tým hráčů)
    roster: [
      // Příklad struktury:
      // {
      //   id: 'player_001',
      //   name: 'Petr Novák',
      //   position: 'LW',
      //   attributes: { speed: 7, shooting: 8, ... },
      //   contract: { salary: 5000, years: 2 }
      // }
    ],
    
    // Vybavení (inventory)
    equipment: [
      // {
      //   id: 'eq_001',
      //   type: 'stick',
      //   name: 'Pro Stick X',
      //   bonus: { shooting: +2 },
      //   equipped: true
      // }
    ],
    
    // Sezóna
    season: {
      currentDate: '2024-09-06', // Formát YYYY-MM-DD
      round: 1,
      points: 0,
      wins: 0,
      losses: 0,
      overtimeWins: 0,
      overtimeLosses: 0,
      
      // Odehrané zápasy
      matchResults: [
        // {
        //   round: 1,
        //   matchId: 'z1-1',
        //   opponent: 'chomutov',
        //   isHome: true,
        //   scoreHome: 4,
        //   scoreAway: 2,
        //   result: 'win',
        //   date: '2024-09-06'
        // }
      ]
    },
    
    // Statistiky
    stats: {
      totalGoals: 0,
      totalAssists: 0,
      totalGames: 0,
      bestWinStreak: 0,
      currentStreak: 0
    },
    
    // Achievement/Úkoly (pro později)
    achievements: [],
    
    // Tutorial progress
    tutorialCompleted: false
  },
  
  // ===========================================
  // ONLINE DATA (Firebase - pro později)
  // ===========================================
  
  online: {
    // Marketplace (tradování vybavení)
    marketplace: {
      listings: [
        // Načte se z Firebase
        // {
        //   id: 'listing_001',
        //   sellerId: 'steam_123',
        //   sellerName: 'Olda',
        //   item: {...},
        //   price: 10000,
        //   timestamp: 1699123456
        // }
      ],
      myListings: [], // Moje nabídky
      purchaseHistory: [] // Historie nákupů
    },
    
    // Multiplayer (pro budoucnost)
    multiplayer: {
      isInQueue: false,
      currentMatch: null,
      rating: 1000,
      matchHistory: []
    },
    
    // Leaderboards
    leaderboards: {
      topPlayers: [],
      lastUpdated: null
    }
  },
  
  // ===========================================
  // SETTINGS (lokální, neukládá se na server)
  // ===========================================
  
  settings: {
    volume: {
      master: 0.8,
      music: 0.6,
      sfx: 0.8
    },
    
    graphics: {
      quality: 'high',
      fullscreen: true,
      resolution: '1920x1080'
    },
    
    gameplay: {
      language: 'cs',
      autoSave: true,
      autoSaveInterval: 5, // minuty
      difficulty: 'normal'
    },
    
    notifications: {
      tradeAlerts: true,
      matchReminders: true
    }
  },
  
  // ===========================================
  // GAME METADATA (neukládá se)
  // ===========================================
  
  meta: {
    version: '0.1.0',
    lastSaved: null,
    lastLoaded: null,
    playTime: 0, // sekundy
    saveSlot: 1 // Který save slot je načtený
  }
};

// ===========================================
// UTILITY FUNKCE
// ===========================================

// Získat serializovatelná data pro save
export function getSaveData() {
  return {
    player: gameState.player,
    meta: {
      version: gameState.meta.version,
      savedAt: new Date().toISOString(),
      playTime: gameState.meta.playTime
    }
  };
}

// Načíst data ze save
export function loadSaveData(saveData) {
  if (saveData.player) {
    Object.assign(gameState.player, saveData.player);
  }
  
  if (saveData.meta) {
    gameState.meta.lastLoaded = new Date().toISOString();
    gameState.meta.playTime = saveData.meta.playTime || 0;
  }
}

// Reset hry (nová hra)
export function resetGameState() {
  gameState.player = {
    name: '',
    team: 'lancers',
    avatar: null,
    level: 1,
    experience: 0,
    money: 50000,
    roster: [],
    equipment: [],
    season: {
      currentDate: '2024-09-06',
      round: 1,
      points: 0,
      wins: 0,
      losses: 0,
      overtimeWins: 0,
      overtimeLosses: 0,
      matchResults: []
    },
    stats: {
      totalGoals: 0,
      totalAssists: 0,
      totalGames: 0,
      bestWinStreak: 0,
      currentStreak: 0
    },
    achievements: [],
    tutorialCompleted: false
  };
  
  gameState.online = {
    marketplace: { listings: [], myListings: [], purchaseHistory: [] },
    multiplayer: { isInQueue: false, currentMatch: null, rating: 1000, matchHistory: [] },
    leaderboards: { topPlayers: [], lastUpdated: null }
  };
  
  gameState.meta.lastSaved = null;
  gameState.meta.lastLoaded = null;
  gameState.meta.playTime = 0;
}

// Validace game state (pro debugging)
export function validateGameState() {
  const errors = [];
  
  if (!gameState.player.name) {
    errors.push('Hráč nemá jméno');
  }
  
  if (gameState.player.money < 0) {
    errors.push('Záporné peníze!');
  }
  
  // Další validace...
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

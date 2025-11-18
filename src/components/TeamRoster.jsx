import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Shield, Target, Award, TrendingUp, Zap, Users } from 'lucide-react';
import { teamsData } from './teamsData';

export default function TeamRoster() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [roster, setRoster] = useState([]);

  const teamInfo = teamsData[teamId];

  useEffect(() => {
    if (!teamInfo) {
      navigate('/league-table');
      return;
    }

    // Vygenerovat atributy pro všechny hráče
    const rosterWithAttributes = teamInfo.roster.map(player => ({
      ...player,
      attributes: generatePlayerAttributes(player)
    }));

    setRoster(rosterWithAttributes);
  }, [teamId, teamInfo, navigate]);

  if (!teamInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Načítání...</div>
      </div>
    );
  }

  // Kategorie pro filtrování
  const categories = [
    { id: 'all', label: 'Všichni', icon: Users, count: roster.length },
    { id: 'goalies', label: 'Brankáři', icon: Shield, count: roster.filter(p => p.category === 'goalies').length },
    { id: 'defenders', label: 'Obránci', icon: Target, count: roster.filter(p => p.category === 'defenders').length },
    { id: 'forwards', label: 'Útočníci', icon: Zap, count: roster.filter(p => p.category === 'forwards').length },
  ];

  // Filtrování hráčů
  const filteredPlayers = selectedCategory === 'all' 
    ? roster 
    : roster.filter(p => p.category === selectedCategory);

  // Výpočet celkového ratingu
  const calculateRating = (attributes) => {
    const values = Object.values(attributes).filter(v => typeof v === 'number' && v !== attributes.attendance);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  // Barva podle ratingu
  const getRatingColor = (rating) => {
    if (rating >= 7) return 'from-green-500 to-emerald-600';
    if (rating >= 5) return 'from-blue-500 to-blue-600';
    if (rating >= 3) return 'from-yellow-500 to-orange-600';
    return 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* HORNÍ LIŠTA */}
      <div className="bg-slate-900/80 border-b border-slate-700 shadow-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/league-table')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Zpět na tabulku</span>
            </button>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-5xl">{teamInfo.emoji}</span>
              </div>
              <h1 className="text-2xl font-bold text-white">{teamInfo.name}</h1>
              <p className="text-gray-400 text-sm">{teamInfo.city} • Založeno {teamInfo.founded}</p>
            </div>
            
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* INFO O TÝMU */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-gray-400 text-sm mb-1">Stadion</div>
              <div className="text-white font-bold">{teamInfo.stadium}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Trenér</div>
              <div className="text-white font-bold">{teamInfo.coach}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Hráčů v kádru</div>
              <div className="text-white font-bold">{roster.length}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-gray-300 text-sm">{teamInfo.description}</p>
          </div>
        </div>

        {/* FILTRY */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                    : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50 hover:text-white'
                  }
                `}
              >
                <Icon size={18} />
                <span>{cat.label}</span>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${isActive ? 'bg-white/20' : 'bg-slate-700'}
                `}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* SEZNAM HRÁČŮ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => {
            const rating = calculateRating(player.attributes);
            const ratingColor = getRatingColor(rating);
            
            return (
              <button
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="
                  bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-left
                  transition-all duration-200 hover:scale-105 hover:shadow-xl hover:border-slate-600
                "
              >
                {/* Hlavička karty */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Fotka hráče */}
                    {player.photo ? (
                      <img 
                        src={player.photo} 
                        alt={player.name}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-slate-600"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Číslo dresu - fallback když není fotka */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl bg-slate-700 text-white ${player.photo ? 'hidden' : ''}`}>
                      {player.number}
                    </div>
                    
                    {/* Jméno a pozice */}
                    <div>
                      <h3 className="text-white font-bold">{player.name}</h3>
                      <p className="text-gray-400 text-sm">{player.position}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className={`
                    px-3 py-1 rounded-lg font-bold text-white
                    bg-gradient-to-br ${ratingColor}
                  `}>
                    {rating}
                  </div>
                </div>

                {/* Info řádek */}
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>{player.nationality} {player.age} let</span>
                  <span>{player.height} cm / {player.weight} kg</span>
                </div>

                {/* Docházka */}
                {player.attributes?.attendance && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Docházka</span>
                      <span className={`font-bold ${
                        player.attributes.attendance >= 80 ? 'text-green-400' :
                        player.attributes.attendance >= 60 ? 'text-yellow-400' :
                        player.attributes.attendance >= 40 ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {player.attributes.attendance}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          player.attributes.attendance >= 80 ? 'bg-green-500' :
                          player.attributes.attendance >= 60 ? 'bg-yellow-500' :
                          player.attributes.attendance >= 40 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${player.attributes.attendance}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Top 3 atributy */}
                {player.attributes && (
                  <div className="flex gap-2">
                    {getTopAttributes(player.attributes).map((attr, idx) => (
                      <div 
                        key={idx}
                        className="flex-1 bg-slate-700/50 rounded px-2 py-1 text-center"
                      >
                        <div className="text-blue-400 font-bold text-sm">{attr.value}</div>
                        <div className="text-gray-500 text-xs">{attr.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Počet hráčů */}
        <div className="mt-8 text-center text-gray-500">
          Zobrazeno {filteredPlayers.length} hráčů
        </div>
      </div>

      {/* DETAIL HRÁČE - Modal */}
      {selectedPlayer && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPlayer(null)}
        >
          <div 
            className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hlavička detailu */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Fotka hráče - větší verze */}
                {selectedPlayer.photo ? (
                  <img 
                    src={selectedPlayer.photo} 
                    alt={selectedPlayer.name}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-slate-600"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* Číslo dresu - fallback */}
                <div className={`w-20 h-20 rounded-xl flex items-center justify-center font-bold text-3xl bg-slate-700 text-white ${selectedPlayer.photo ? 'hidden' : ''}`}>
                  {selectedPlayer.number}
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedPlayer.name}</h2>
                  <p className="text-gray-400">{selectedPlayer.position}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                    <span>{selectedPlayer.nationality} {selectedPlayer.age} let</span>
                    <span>•</span>
                    <span>{selectedPlayer.height} cm</span>
                    <span>•</span>
                    <span>{selectedPlayer.weight} kg</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-gray-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Celkový rating</span>
                <div className={`
                  px-4 py-2 rounded-lg font-bold text-white text-xl
                  bg-gradient-to-br ${getRatingColor(calculateRating(selectedPlayer.attributes))}
                `}>
                  {calculateRating(selectedPlayer.attributes)}/10
                </div>
              </div>
            </div>

            {/* Atributy */}
            {selectedPlayer.attributes && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-400" />
                  Atributy
                </h3>
                <div className="space-y-3">
                  {Object.entries(selectedPlayer.attributes)
                    .filter(([key, value]) => typeof value === 'number' && key !== 'attendance')
                    .map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">
                            {translateAttribute(key)}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-blue-400">{value}</div>
                            <div className="flex-1 bg-slate-700 rounded-full h-2 w-32">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                                style={{ width: `${value * 10}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Pomocné funkce

function generatePlayerAttributes(player) {
  // BRANKÁŘI
  if (player.category === 'goalies') {
    const attendance = 60 + Math.floor(Math.random() * 30); // 60-90%
    
    return {
      speed: 2 + Math.floor(Math.random() * 2),
      acceleration: 2 + Math.floor(Math.random() * 2),
      skatingTechnique: 2 + Math.floor(Math.random() * 2),
      braking: 5 + Math.floor(Math.random() * 2),
      stability: 4 + Math.floor(Math.random() * 2),
      stamina: 4 + Math.floor(Math.random() * 2),
      strength: 3 + Math.floor(Math.random() * 2),
      reflexes: 4 + Math.floor(Math.random() * 3),
      positioning: 4 + Math.floor(Math.random() * 3),
      glove: 4 + Math.floor(Math.random() * 2),
      blocker: 4 + Math.floor(Math.random() * 2),
      attendance
    };
  }

  // OBRÁNCI
  if (player.category === 'defenders') {
    const attendance = 50 + Math.floor(Math.random() * 45); // 50-95%
    
    // Ofenzivní obránci
    if (player.description?.includes('Ofenzivní') || player.description?.includes('střelou')) {
      return {
        speed: 4 + Math.floor(Math.random() * 2),
        acceleration: 4 + Math.floor(Math.random() * 2),
        skatingTechnique: 4 + Math.floor(Math.random() * 2),
        braking: 3 + Math.floor(Math.random() * 2),
        stability: 4 + Math.floor(Math.random() * 2),
        stamina: 5 + Math.floor(Math.random() * 2),
        strength: 4 + Math.floor(Math.random() * 2),
        shooting: 6 + Math.floor(Math.random() * 2),
        passing: 5 + Math.floor(Math.random() * 2),
        puckControl: 5 + Math.floor(Math.random() * 2),
        stealing: 3 + Math.floor(Math.random() * 2),
        checking: 4 + Math.floor(Math.random() * 2),
        attendance
      };
    }
    
    // Defenzivní obránci
    if (player.description?.includes('defenzivní') || player.description?.includes('Tvrdý') || player.description?.includes('Fyzicky silný')) {
      return {
        speed: 3 + Math.floor(Math.random() * 2),
        acceleration: 3 + Math.floor(Math.random() * 2),
        skatingTechnique: 3 + Math.floor(Math.random() * 2),
        braking: 4 + Math.floor(Math.random() * 2),
        stability: 6 + Math.floor(Math.random() * 2),
        stamina: 6 + Math.floor(Math.random() * 2),
        strength: 6 + Math.floor(Math.random() * 2),
        shooting: 3 + Math.floor(Math.random() * 2),
        passing: 4 + Math.floor(Math.random() * 2),
        puckControl: 4 + Math.floor(Math.random() * 2),
        stealing: 5 + Math.floor(Math.random() * 2),
        checking: 6 + Math.floor(Math.random() * 2),
        attendance
      };
    }
    
    // Veteráni
    if (player.age >= 35) {
      return {
        speed: 2 + Math.floor(Math.random() * 2),
        acceleration: 2 + Math.floor(Math.random() * 2),
        skatingTechnique: 2 + Math.floor(Math.random() * 2),
        braking: 5 + Math.floor(Math.random() * 2),
        stability: 5 + Math.floor(Math.random() * 2),
        stamina: 4 + Math.floor(Math.random() * 2),
        strength: 5 + Math.floor(Math.random() * 2),
        shooting: 4 + Math.floor(Math.random() * 2),
        passing: 5 + Math.floor(Math.random() * 3),
        puckControl: 5 + Math.floor(Math.random() * 2),
        stealing: 4 + Math.floor(Math.random() * 2),
        checking: 5 + Math.floor(Math.random() * 2),
        attendance: 40 + Math.floor(Math.random() * 30)
      };
    }
    
    // Běžní obránci
    return {
      speed: 3 + Math.floor(Math.random() * 3),
      acceleration: 3 + Math.floor(Math.random() * 3),
      skatingTechnique: 3 + Math.floor(Math.random() * 2),
      braking: 4 + Math.floor(Math.random() * 2),
      stability: 4 + Math.floor(Math.random() * 3),
      stamina: 4 + Math.floor(Math.random() * 3),
      strength: 4 + Math.floor(Math.random() * 3),
      shooting: 3 + Math.floor(Math.random() * 3),
      passing: 4 + Math.floor(Math.random() * 3),
      puckControl: 4 + Math.floor(Math.random() * 3),
      stealing: 4 + Math.floor(Math.random() * 3),
      checking: 5 + Math.floor(Math.random() * 3),
      attendance
    };
  }

  // ÚTOČNÍCI
  if (player.category === 'forwards') {
    const attendance = 50 + Math.floor(Math.random() * 45); // 50-95%
    
    // Hvězdy týmu
    if (player.description?.includes('Nejlepší střelec') || player.description?.includes('Produktivní')) {
      return {
        speed: 5 + Math.floor(Math.random() * 2),
        acceleration: 5 + Math.floor(Math.random() * 2),
        skatingTechnique: 5 + Math.floor(Math.random() * 2),
        braking: 2 + Math.floor(Math.random() * 2),
        stability: 4 + Math.floor(Math.random() * 2),
        stamina: 5 + Math.floor(Math.random() * 2),
        strength: 4 + Math.floor(Math.random() * 2),
        shooting: 6 + Math.floor(Math.random() * 2),
        passing: 5 + Math.floor(Math.random() * 2),
        puckControl: 6 + Math.floor(Math.random() * 2),
        stealing: 4 + Math.floor(Math.random() * 2),
        checking: 3 + Math.floor(Math.random() * 2),
        attendance: 75 + Math.floor(Math.random() * 20)
      };
    }
    
    // Rychlí útočníci
    if (player.description?.includes('Rychlý') || player.description?.includes('rychlé křídlo') || player.description?.includes('rychlík')) {
      return {
        speed: 6 + Math.floor(Math.random() * 2),
        acceleration: 6 + Math.floor(Math.random() * 2),
        skatingTechnique: 6 + Math.floor(Math.random() * 2),
        braking: 2 + Math.floor(Math.random() * 2),
        stability: 3 + Math.floor(Math.random() * 2),
        stamina: 5 + Math.floor(Math.random() * 2),
        strength: 3 + Math.floor(Math.random() * 2),
        shooting: 4 + Math.floor(Math.random() * 2),
        passing: 4 + Math.floor(Math.random() * 2),
        puckControl: 5 + Math.floor(Math.random() * 2),
        stealing: 4 + Math.floor(Math.random() * 2),
        checking: 3 + Math.floor(Math.random() * 2),
        attendance
      };
    }
    
    // Siloví útočníci
    if (player.description?.includes('Silový') || player.description?.includes('veterán')) {
      return {
        speed: 3 + Math.floor(Math.random() * 2),
        acceleration: 3 + Math.floor(Math.random() * 2),
        skatingTechnique: 3 + Math.floor(Math.random() * 2),
        braking: 4 + Math.floor(Math.random() * 2),
        stability: 6 + Math.floor(Math.random() * 2),
        stamina: 6 + Math.floor(Math.random() * 2),
        strength: 6 + Math.floor(Math.random() * 2),
        shooting: 4 + Math.floor(Math.random() * 2),
        passing: 3 + Math.floor(Math.random() * 2),
        puckControl: 4 + Math.floor(Math.random() * 2),
        stealing: 4 + Math.floor(Math.random() * 2),
        checking: 6 + Math.floor(Math.random() * 2),
        attendance
      };
    }
    
    // Mladí talenti
    if (player.description?.includes('Mladý') || player.age <= 23) {
      return {
        speed: 5 + Math.floor(Math.random() * 2),
        acceleration: 5 + Math.floor(Math.random() * 2),
        skatingTechnique: 5 + Math.floor(Math.random() * 2),
        braking: 2 + Math.floor(Math.random() * 2),
        stability: 3 + Math.floor(Math.random() * 2),
        stamina: 6 + Math.floor(Math.random() * 2),
        strength: 3 + Math.floor(Math.random() * 2),
        shooting: 4 + Math.floor(Math.random() * 2),
        passing: 4 + Math.floor(Math.random() * 2),
        puckControl: 5 + Math.floor(Math.random() * 2),
        stealing: 4 + Math.floor(Math.random() * 2),
        checking: 3 + Math.floor(Math.random() * 2),
        attendance: 70 + Math.floor(Math.random() * 25)
      };
    }
    
    // Běžní útočníci
    return {
      speed: 4 + Math.floor(Math.random() * 3),
      acceleration: 4 + Math.floor(Math.random() * 3),
      skatingTechnique: 4 + Math.floor(Math.random() * 2),
      braking: 3 + Math.floor(Math.random() * 2),
      stability: 4 + Math.floor(Math.random() * 3),
      stamina: 4 + Math.floor(Math.random() * 3),
      strength: 4 + Math.floor(Math.random() * 3),
      shooting: 4 + Math.floor(Math.random() * 3),
      passing: 4 + Math.floor(Math.random() * 3),
      puckControl: 4 + Math.floor(Math.random() * 3),
      stealing: 4 + Math.floor(Math.random() * 3),
      checking: 3 + Math.floor(Math.random() * 3),
      attendance
    };
  }

  // Výchozí
  const attendance = 50 + Math.floor(Math.random() * 40);
  return {
    speed: 4,
    acceleration: 4,
    skatingTechnique: 4,
    braking: 6,
    stability: 4,
    stamina: 4,
    strength: 4,
    shooting: 4,
    passing: 4,
    puckControl: 4,
    stealing: 4,
    checking: 4,
    attendance
  };
}

function getTopAttributes(attributes) {
  return Object.entries(attributes)
    .filter(([key, value]) => typeof value === 'number' && key !== 'attendance')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, value]) => ({
      name: translateAttribute(key),
      value
    }));
}

function translateAttribute(key) {
  const translations = {
    speed: 'Rychlost',
    acceleration: 'Zrychlení',
    skatingTechnique: 'Technika bruslení',
    braking: 'Brzdění',
    stability: 'Stabilita',
    stamina: 'Výdrž',
    strength: 'Síla',
    shooting: 'Střela',
    passing: 'Přihrávky',
    puckControl: 'Ovládání puku',
    stealing: 'Odebírání',
    checking: 'Hra tělem',
    reflexes: 'Reflexy',
    positioning: 'Postavení',
    glove: 'Lapačka',
    blocker: 'Vyrážečka',
    attendance: 'Docházka'
  };
  return translations[key] || key;
}

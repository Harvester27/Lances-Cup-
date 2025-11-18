import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Users, Shield, Target, Award, Star, TrendingUp } from 'lucide-react';

// DATA HRÁČŮ - kompletní verze se všemi údaji
const lancersRoster = [
  // Brankáři
  { id: 'novakova-michaela', name: 'Michaela Nováková', number: 30, position: 'Brankář', age: 26, category: 'goalies', 
    photo: '/Images/Fotky/Lancers/michaela-novakova.png',
    description: 'Talentovaná brankářka, první žena v historii KHLA' },
  { id: 'nistor-vlastimil', name: 'Vlastimil Nistor', number: 1, position: 'Brankář', age: 32, category: 'goalies', 
    photo: '/Images/Fotky/Lancers/vlastimil-nistor.png',
    description: 'Zkušený brankář, dvojka za Michaelou Novákovou' },
  { id: 'seidler-jakub', name: 'Jakub Seidler', number: 35, position: 'Brankář', age: 28, category: 'goalies', 
    photo: '/Images/Fotky/Lancers/jakub-seidler.png',
    description: 'Třetí brankář týmu' },
  
  // Obránci
  { id: 'simek-roman', name: 'Roman Šimek', number: 27, position: 'Obránce', age: 32, category: 'defenders', 
    photo: '/Images/Fotky/Lancers/roman-simek.png', description: 'Kapitán týmu, zkušený obránce s výbornou rozehrávkou' },
  { id: 'stepanovsky-oliver', name: 'Oliver Štěpanovský', number: 5, position: 'Obránce', age: 35, category: 'defenders', 
    photo: '/Images/Fotky/Lancers/oliver-stepanovsky.png', description: 'Nejzkušenější obránce týmu. Tvrdý defenzivní specialista' },
  { id: 'coufal-lubos', name: 'Luboš Coufal', number: 14, position: 'Obránce', age: 31, category: 'defenders', 
    photo: '/Images/Fotky/Lancers/lubos-coufal.png', description: 'Zkušený obránce s výbornou přihrávkou' },
  { id: 'turecek-tomas', name: 'Tomáš Tureček', number: 22, position: 'Obránce', age: 28, category: 'defenders', 
    photo: '/Images/Fotky/Lancers/tomas-turecek.png', description: 'Univerzální obránce' },
  { id: 'belinger-jindrich', name: 'Jindřich Belinger', number: 3, position: 'Obránce', age: 34, category: 'defenders', 
    photo: '/Images/Fotky/Lancers/jindrich-belinger.png', description: 'Starší z bratrů Belingerů, defenzivní specialista' },
  { id: 'belinger-jiri', name: 'Jiří Belinger', number: 77, position: 'Obránce', age: 30, category: 'defenders', 
    photo: '/Images/Fotky/Lancers/jiri-belinger.png', description: 'Mladší z bratrů Belingerů' },
  { id: 'hanus-jan', name: 'Jan Hanuš', number: 8, position: 'Obránce', age: 27, category: 'defenders', 
    photo: '/Images/Fotky/Lancers/jan-hanus.png', description: 'Ofenzivní obránce s výbornou střelou' },
  { id: 'schubada-pavel-st', name: 'Pavel Schubada St.', number: 44, position: 'Obránce', age: 45, category: 'defenders', 
    photo: '/Images/Fotky/Lancers/pavel-schubada-st.png', description: 'Veterán týmu, otec tří synů hrajících v útoku' },
  
  // Útočníci
  { id: 'materna-vasek', name: 'Vašek Materna', number: 91, position: 'Útočník', age: 27, category: 'forwards', 
    photo: '/Images/Fotky/Lancers/vasek-materna.png', description: 'Nejlepší střelec týmu, rychlý a technický útočník' },
  { id: 'svarc-stanislav', name: 'Stanislav Švarc', number: 46, position: 'Útočník', age: 38, category: 'forwards', 
    photo: '/Images/Fotky/Lancers/stanislav-svarc.png', description: 'Zkušený centr, univerzální hráč. Produktivní střelec' },
  { id: 'schubada-jan', name: 'Jan Schubada', number: 25, position: 'Útočník', age: 24, category: 'forwards', 
    photo: '/Images/Fotky/Lancers/jan-schubada.png', description: 'Nejstarší ze synů Pavla Schubady St.' },
  { id: 'schubada-pavel-ml', name: 'Pavel Schubada ml.', number: 18, position: 'Útočník', age: 22, category: 'forwards', 
    photo: '/Images/Fotky/Lancers/pavel-schubada-ml.png', description: 'Prostřední ze synů Pavla Schubady St.' },
  { id: 'schubada-adam', name: 'Adam Schubada', number: 11, position: 'Útočník', age: 20, category: 'forwards', 
    photo: '/Images/Fotky/Lancers/adam-schubada.png', description: 'Nejmladší ze synů Pavla Schubady St., velký talent' },
  { id: 'novak-pavel', name: 'Pavel Novák', number: 9, position: 'Útočník', age: 30, category: 'forwards', 
    photo: '/Images/Fotky/Lancers/pavel-novak.png', description: 'Produktivní útočník' },
  { id: 'kuritka-ales', name: 'Aleš Kuřitka', number: 24, position: 'Útočník', age: 33, category: 'forwards', 
    photo: '/Images/Fotky/Lancers/ales-kuritka.png', description: 'Pracovitý útočník třetí formace' },
  { id: 'materna-vaclav', name: 'Václav Materna', number: 17, position: 'Útočník', age: 29, category: 'forwards', 
    photo: '/Images/Fotky/Lancers/vaclav-materna.png', description: 'Bratr Vaška Materny, silový útočník' },
  { id: 'salanda-jiri', name: 'Jiří Šalanda', number: 71, position: 'Útočník', age: 31, category: 'forwards', 
    photo: '/Images/Fotky/Lancers/jiri-salanda.png', description: 'Rychlý a technický útočník' },
  { id: 'hruby-ondrej', name: 'Ondřej Hrubý', number: 88, position: 'Útočník', age: 26, category: 'forwards', 
    photo: '/Images/Fotky/Lancers/ondrej-hruby.png', description: 'Silový útočník čtvrté formace' },
  { id: 'toman-gustav', name: 'Gustav Toman', number: 10, position: 'Útočník', age: 35, category: 'forwards', 
    photo: '/Images/Fotky/Lancers/gustav-toman.png', description: 'Zkušený veterán s výbornou přehrou' },
  { id: 'svarc-jan', name: 'Jan Švarc', number: 13, position: 'Útočník', age: 25, category: 'forwards', 
    photo: '/Images/Fotky/Lancers/jan-svarc.png', description: 'Syn Stanislava Švarce, rychlé křídlo' },
  { id: 'cerny-ladislav', name: 'Ladislav Černý', number: 7, position: 'Útočník', age: 32, category: 'forwards', 
    photo: '/Images/Fotky/Lancers/ladislav-cerny.png', description: 'Univerzální útočník' },
  { id: 'dlugopolsky-marian', name: 'Marian Dlugopolský', number: 69, position: 'Útočník', age: 28, category: 'forwards', 
    photo: '/Images/Fotky/Lancers/marian-dlugopolsky.png', description: 'Slovenský útočník s výbornou střelou' },
];

// FUNKCE PRO GENEROVÁNÍ ATRIBUTŮ HRÁČŮ (stejné jako v LancersSoupiska.jsx)
function generatePlayerAttributes(player) {
  // SPECIÁLNÍ HRÁČI S KONKRÉTNÍMI HODNOTAMI
  
  // Marian Dlugopolský - nejhorší hráč (všude 1)
  if (player.name === 'Marian Dlugopolský') {
    return {
      speed: 1, acceleration: 1, stamina: 1, strength: 1,
      shooting: 1, passing: 1, puckControl: 1, stealing: 1, checking: 1,
      attendance: 45
    };
  }
  
  // Roman Šimek - NEJLEPŠÍ HRÁČ! (Kapitán, hvězda týmu)
  if (player.name === 'Roman Šimek') {
    return {
      speed: 7, acceleration: 7, stamina: 7, strength: 7,
      shooting: 7, passing: 7, puckControl: 7, stealing: 6, checking: 7,
      attendance: 95
    };
  }
  
  // Michaela Nováková - NEJLEPŠÍ BRANKÁŘKA!
  if (player.name === 'Michaela Nováková') {
    return {
      speed: 3, acceleration: 3, stamina: 6, strength: 4,
      reflexes: 7, positioning: 7, glove: 7, blocker: 7,
      attendance: 90
    };
  }
  
  // Vlastimil Nistor - NEJLEPŠÍ BRANKÁŘ!
  if (player.name === 'Vlastimil Nistor') {
    return {
      speed: 3, acceleration: 3, stamina: 7, strength: 5,
      reflexes: 7, positioning: 7, glove: 7, blocker: 7,
      attendance: 85
    };
  }

  // BRANKÁŘI
  if (player.category === 'goalies') {
    const attendance = 60 + Math.floor(Math.random() * 30);
    return {
      speed: 2 + Math.floor(Math.random() * 2),
      acceleration: 2 + Math.floor(Math.random() * 2),
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
    const attendance = 50 + Math.floor(Math.random() * 45);
    
    if (player.description.includes('Ofenzivní') || player.description.includes('střelou')) {
      return {
        speed: 4 + Math.floor(Math.random() * 2),
        acceleration: 4 + Math.floor(Math.random() * 2),
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
    
    if (player.description.includes('defenzivní') || player.description.includes('Tvrdý')) {
      return {
        speed: 3 + Math.floor(Math.random() * 2),
        acceleration: 3 + Math.floor(Math.random() * 2),
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
    
    if (player.age >= 40) {
      return {
        speed: 2 + Math.floor(Math.random() * 2),
        acceleration: 2 + Math.floor(Math.random() * 2),
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
    
    return {
      speed: 3 + Math.floor(Math.random() * 3),
      acceleration: 3 + Math.floor(Math.random() * 3),
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
    const attendance = 50 + Math.floor(Math.random() * 45);
    
    if (player.description.includes('Nejlepší střelec') || player.description.includes('Produktivní')) {
      return {
        speed: 5 + Math.floor(Math.random() * 2),
        acceleration: 5 + Math.floor(Math.random() * 2),
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
    
    if (player.description.includes('Rychlý') || player.description.includes('rychlé křídlo')) {
      return {
        speed: 6 + Math.floor(Math.random() * 2),
        acceleration: 6 + Math.floor(Math.random() * 2),
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
    
    if (player.description.includes('Silový')) {
      return {
        speed: 3 + Math.floor(Math.random() * 2),
        acceleration: 3 + Math.floor(Math.random() * 2),
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
    
    if (player.age >= 35) {
      return {
        speed: 3 + Math.floor(Math.random() * 2),
        acceleration: 3 + Math.floor(Math.random() * 2),
        stamina: 4 + Math.floor(Math.random() * 2),
        strength: 4 + Math.floor(Math.random() * 2),
        shooting: 4 + Math.floor(Math.random() * 3),
        passing: 5 + Math.floor(Math.random() * 3),
        puckControl: 5 + Math.floor(Math.random() * 2),
        stealing: 4 + Math.floor(Math.random() * 2),
        checking: 4 + Math.floor(Math.random() * 2),
        attendance: 40 + Math.floor(Math.random() * 35)
      };
    }
    
    if (player.age <= 23) {
      return {
        speed: 5 + Math.floor(Math.random() * 2),
        acceleration: 5 + Math.floor(Math.random() * 2),
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
    
    return {
      speed: 4 + Math.floor(Math.random() * 3),
      acceleration: 4 + Math.floor(Math.random() * 3),
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
    speed: 4, acceleration: 4, stamina: 4, strength: 4,
    shooting: 4, passing: 4, puckControl: 4, stealing: 4, checking: 4,
    attendance
  };
}

// FUNKCE PRO VÝPOČET LEVELU (průměr atributů)
function calculateRating(attributes) {
  if (!attributes) return 0;
  // Filtrovat pouze číselné hodnoty větší než 0 (ne attendance)
  const values = Object.entries(attributes)
    .filter(([key, value]) => key !== 'attendance' && typeof value === 'number' && value > 0)
    .map(([key, value]) => value);
  
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

// Barva podle ratingu/levelu
function getRatingColor(rating) {
  if (rating >= 7) return 'from-green-500 to-emerald-600';
  if (rating >= 6) return 'from-blue-500 to-blue-600';
  if (rating >= 5) return 'from-yellow-500 to-orange-500';
  if (rating >= 4) return 'from-orange-500 to-red-500';
  return 'from-gray-500 to-gray-600';
}

export default function PreMatchScreen() {
  const navigate = useNavigate();
  const [homeLineup, setHomeLineup] = useState(null);
  const [awayLineup, setAwayLineup] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Načíst data hráče
    const data = sessionStorage.getItem('playerData');
    if (data) {
      setPlayerData(JSON.parse(data));
    }

    // Simulace načítání a výběru hráčů
    setTimeout(() => {
      selectLineups();
      setLoading(false);
    }, 1500);
  }, []);

  const selectLineups = () => {
    // Vygenerovat atributy a levely pro všechny hráče
    const allPlayers = lancersRoster.map(player => {
      const attributes = generatePlayerAttributes(player);
      const level = calculateRating(attributes);
      
      return {
        ...player,
        attributes,
        level
      };
    });

    // Rozdělit podle pozic
    const goalies = allPlayers.filter(p => p.category === 'goalies');
    const defenders = allPlayers.filter(p => p.category === 'defenders');
    const forwards = allPlayers.filter(p => p.category === 'forwards');

    // Seřadit podle levelu (nejlepší první)
    goalies.sort((a, b) => b.level - a.level);
    defenders.sort((a, b) => b.level - a.level);
    forwards.sort((a, b) => b.level - a.level);

    // ZAHAJOVACÍ SESTAVA - menší týmy (jako v normálním hokeji na ledě)
    // Domácí: 1G + 2D + 3F = 6 hráčů
    const homeGoalie = goalies[0];
    const homeDefenders = defenders.slice(0, 2);
    const homeForwards = forwards.slice(0, 3);

    // Hosté: 1G + 2D + 3F = 6 hráčů
    const awayGoalie = goalies[1] || goalies[0];
    const awayDefenders = defenders.slice(2, 4);
    const awayForwards = forwards.slice(3, 6);

    // Načíst data hráče pro přidání do sestavy
    const savedPlayerData = sessionStorage.getItem('playerData');
    let playerCharacter = null;
    
    if (savedPlayerData) {
      const data = JSON.parse(savedPlayerData);
      playerCharacter = {
        id: 'player-character',
        name: `${data.firstName} ${data.lastName}`,
        number: 99,
        position: 'Útočník',
        category: 'forwards',
        isPlayer: true,
        level: data.level || 1,
        attributes: data.skills || {
          speed: 5, acceleration: 5, stamina: 5, strength: 5,
          shooting: 5, passing: 5, puckControl: 5, stealing: 5, checking: 5,
          attendance: 100
        }
      };
    }

    // Přidat hráčovu postavu do domácího týmu (nahradit posledního útočníka)
    let finalHomeForwards = homeForwards;
    if (playerCharacter) {
      finalHomeForwards = [playerCharacter, ...homeForwards.slice(0, 2)]; // Hráč je první
    }

    setHomeLineup({
      name: 'Černí Lancers',
      color: '#3b82f6',
      goalie: homeGoalie,
      defenders: homeDefenders,
      forwards: finalHomeForwards
    });

    setAwayLineup({
      name: 'Červení Lancers',
      color: '#ef4444',
      goalie: awayGoalie,
      defenders: awayDefenders,
      forwards: awayForwards
    });
  };

  const startMatch = () => {
    // ✅ ULOŽIT do sessionStorage
    sessionStorage.setItem('matchHomeLineup', JSON.stringify(homeLineup));
    sessionStorage.setItem('matchAwayLineup', JSON.stringify(awayLineup));
    
    // Pak teprve přejít na zápas
    navigate('/match2d');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Připravuji zápas...</h2>
          <p className="text-gray-400">Vybírám zahajovací sestavu podle levelů hráčů</p>
        </div>
      </div>
    );
  }

  // Komponenta pro hráče
  const PlayerCard = ({ player, color, isStarter = true }) => {
    const ratingColor = getRatingColor(player.level);
    
    return (
      <div className={`
        relative bg-slate-800/50 border rounded-lg p-3 transition-all
        ${player.isPlayer 
          ? 'border-yellow-500 bg-gradient-to-br from-yellow-500/20 to-orange-500/20' 
          : 'border-slate-700 hover:border-slate-600'
        }
        ${isStarter ? 'ring-2 ring-green-500/50' : ''}
      `}>
        {/* Odznak hráče */}
        {player.isPlayer && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full p-1">
            <Award size={16} className="text-white" />
          </div>
        )}
        
        {/* Odznak startera */}
        {isStarter && !player.isPlayer && (
          <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
            <Star size={14} className="text-white" />
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Fotka/Avatar hráče */}
          <div 
            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-lg overflow-hidden
              ${player.isPlayer ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : ''}`}
            style={!player.isPlayer && !player.photo ? { backgroundColor: color } : {}}
          >
            {/* Fotka hráče - pokud existuje */}
            {player.photo ? (
              <img 
                src={player.photo} 
                alt={player.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Pokud se fotka nenačetla, zobraz číslo
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            
            {/* Číslo dresu - fallback */}
            <div className={`w-full h-full flex items-center justify-center ${player.photo ? 'hidden' : ''}`}>
              {player.number}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-bold truncate ${player.isPlayer ? 'text-yellow-300' : 'text-white'}`}>
              {player.name}
            </div>
            <div className="text-xs text-gray-400 mb-1">{player.position}</div>
            
            {/* Level badge s barvou podle hodnoty */}
            {player.level && (
              <div className="flex items-center gap-2">
                <div className={`
                  inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                  bg-gradient-to-r ${ratingColor} text-white font-bold text-xs
                `}>
                  <TrendingUp size={10} />
                  <span>Lvl {player.level}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Komponenta pro zobrazení sestavy
  const LineupDisplay = ({ lineup, side }) => {
    // Průměrný level sestavy
    const allPlayers = [lineup.goalie, ...lineup.defenders, ...lineup.forwards];
    const avgLevel = Math.round(
      allPlayers.reduce((sum, p) => sum + (p.level || 0), 0) / allPlayers.length
    );
    
    return (
      <div className="flex-1">
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700 h-full">
          {/* Hlavička */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: lineup.color + '30' }}
            >
              <Users size={20} style={{ color: lineup.color }} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold" style={{ color: lineup.color }}>
                {lineup.name}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">
                  {side === 'home' ? 'Domácí' : 'Hosté'} • Zahajovací sestava
                </p>
                <div className={`
                  inline-flex items-center gap-1 px-2 py-0.5 rounded
                  bg-gradient-to-r ${getRatingColor(avgLevel)} text-white font-bold text-xs
                `}>
                  ⭐ Ø {avgLevel}
                </div>
              </div>
            </div>
          </div>

          {/* Brankář */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-blue-400" />
              <h3 className="text-sm font-bold text-white">Brankář</h3>
            </div>
            <PlayerCard player={lineup.goalie} color={lineup.color} />
          </div>

          {/* Obránci */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-yellow-400" />
              <h3 className="text-sm font-bold text-white">Obránci ({lineup.defenders.length})</h3>
            </div>
            <div className="space-y-2">
              {lineup.defenders.map(player => (
                <PlayerCard key={player.id} player={player} color={lineup.color} />
              ))}
            </div>
          </div>

          {/* Útočníci */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-red-400" />
              <h3 className="text-sm font-bold text-white">Útočníci ({lineup.forwards.length})</h3>
            </div>
            <div className="space-y-2">
              {lineup.forwards.map(player => (
                <PlayerCard key={player.id} player={player} color={lineup.color} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col overflow-hidden">
      {/* Horní lišta - kompaktní */}
      <div className="bg-slate-900/80 border-b border-slate-700 shadow-xl">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/game')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={18} />
              <span>Zpět</span>
            </button>

            <div className="text-center">
              <h1 className="text-xl font-bold text-white">Zahajovací sestava</h1>
              <p className="text-gray-400 text-xs">6 vs 6 hráčů • Seřazeno podle levelů</p>
            </div>

            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Hlavní obsah - bez scrollování */}
      <div className="flex-1 container mx-auto px-6 py-6 flex flex-col">
        {/* Info banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-3">
            <Star className="text-yellow-400 animate-pulse" size={20} />
            <div className="flex-1">
              <p className="text-blue-200 text-sm font-medium">
                ⭐ Tvoje postava hraje v útoku! Ovládáš hráče #{playerData?.firstName || 'Hráč'} (Level {playerData?.level || 1})
              </p>
            </div>
          </div>
        </div>

        {/* Sestavy vedle sebe */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Domácí */}
          <LineupDisplay lineup={homeLineup} side="home" />

          {/* VS uprostřed */}
          <div className="flex items-center justify-center px-2">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="text-3xl font-bold text-gray-500">VS</div>
            </div>
          </div>

          {/* Hosté */}
          <LineupDisplay lineup={awayLineup} side="away" />
        </div>

        {/* Tlačítko START - pevně dole */}
        <div className="mt-4 text-center">
          <button
            onClick={startMatch}
            className="inline-flex items-center gap-3 px-10 py-4 
                     bg-gradient-to-r from-green-600 to-green-700 
                     hover:from-green-500 hover:to-green-600
                     text-white text-xl font-bold rounded-xl
                     shadow-2xl hover:shadow-3xl
                     transition-all duration-200
                     hover:scale-105
                     border-2 border-green-500"
          >
            <Play size={28} />
            <span>SPUSTIT ZÁPAS!</span>
          </button>
          
          <p className="text-gray-500 text-xs mt-2">
            🟢 Hráči s hvězdičkou jsou v zahajovací sestavě • 🎯 Seřazeno podle levelů
          </p>
        </div>
      </div>
    </div>
  );
}

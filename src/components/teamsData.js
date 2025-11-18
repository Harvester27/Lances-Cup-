// DATA VŠECH TÝMŮ FOFR LIGY - Fixní atributy a docházka

function calculateOverall(attributes, category) {
  if (!attributes) return 5;
  
  if (category === 'goalies') {
    // Důležité atributy brankáře váží 1.5×
    const important = (attributes.reflexes || 0) + (attributes.positioning || 0) + 
                     (attributes.glove || 0) + (attributes.blocker || 0);
    const secondary = (attributes.speed || 0) + (attributes.stamina || 0);
    const avg = (important * 1.5 + secondary) / 8;
    return Math.round(avg * 10) / 10; // Zaokrouhlí na 1 des. místo (např. 6.5)
  }
  
  // Pro hráče: průměr všech atributů
  const values = Object.entries(attributes)
    .filter(([key, value]) => key !== 'attendance' && typeof value === 'number')
    .map(([_, value]) => value);
  
  if (values.length === 0) return 5;
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.round(avg * 10) / 10; // Zaokrouhlí na 1 des. místo (např. 5.5)
}

const lancersRosterData = [
  // BRANKÁŘI
  { id: 1, name: 'Michaela Nováková', number: 30, position: 'Brankář', age: 26, height: 175, weight: 70, 
    nationality: '🇨🇿', category: 'goalies', description: 'První žena v historii KHLA',
    photo: '/Images/Fotky/Lancers/michaela-novakova.png',
    attributes: { reflexes: 7, positioning: 7, glove: 6, blocker: 7, speed: 5, stamina: 6, attendance: 90 }
  },
  { id: 2, name: 'Vlastimil Nistor', number: 1, position: 'Brankář', age: 32, height: 185, weight: 87, 
    nationality: '🇨🇿', category: 'goalies',
    photo: '/Images/Fotky/Lancers/vlastimil-nistor.png',
    attributes: { reflexes: 5, positioning: 6, glove: 5, blocker: 6, speed: 4, stamina: 5, attendance: 75 }
  },
  { id: 3, name: 'Jakub Seidler', number: 35, position: 'Brankář', age: 28, height: 189, weight: 92, 
    nationality: '🇨🇿', category: 'goalies',
    photo: '/Images/Fotky/Lancers/jakub-seidler.png',
    attributes: { reflexes: 6, positioning: 5, glove: 6, blocker: 5, speed: 4, stamina: 6, attendance: 70 }
  },
  { id: 4, name: 'Jiří Morávek', number: 31, position: 'Brankář', age: 29, height: 183, weight: 85, 
    nationality: '🇨🇿', category: 'goalies',
    photo: '/Images/Fotky/Lancers/jiri-moravek.png',
    attributes: { reflexes: 4, positioning: 5, glove: 4, blocker: 5, speed: 4, stamina: 5, attendance: 60 }
  },
  
  // OBRÁNCI
  { id: 5, name: 'Roman Šimek', number: 27, position: 'Obránce', age: 32, height: 183, weight: 86, 
    nationality: '🇨🇿', category: 'defenders', description: 'Kapitán týmu',
    photo: '/Images/Fotky/Lancers/roman-simek.png',
    attributes: { speed: 5, acceleration: 5, skatingTechnique: 6, braking: 6, stability: 6, stamina: 6, strength: 6, shooting: 6, passing: 7, puckControl: 6, stealing: 6, checking: 6, attendance: 85 }
  },
  { id: 6, name: 'Oliver Štěpanovský', number: 5, position: 'Obránce', age: 35, height: 188, weight: 94, 
    nationality: '🇨🇿', category: 'defenders', description: 'Nejzkušenější obránce',
    photo: '/Images/Fotky/Lancers/oliver-stepanovsky.png',
    attributes: { speed: 7, acceleration: 3, skatingTechnique: 7, braking: 6, stability: 7, stamina: 5, strength: 7, shooting: 4, passing: 5, puckControl: 5, stealing: 6, checking: 7, attendance: 100 }
  },
  { id: 7, name: 'Luboš Coufal', number: 14, position: 'Obránce', age: 31, height: 185, weight: 89, 
    nationality: '🇨🇿', category: 'defenders',
    photo: '/Images/Fotky/Lancers/lubos-coufal.png',
    attributes: { speed: 4, acceleration: 4, skatingTechnique: 4, braking: 5, stability: 5, stamina: 5, strength: 5, shooting: 4, passing: 6, puckControl: 5, stealing: 5, checking: 5, attendance: 75 }
  },
  { id: 8, name: 'Tomáš Tureček', number: 22, position: 'Obránce', age: 28, height: 182, weight: 84, 
    nationality: '🇨🇿', category: 'defenders',
    photo: '/Images/Fotky/Lancers/tomas-turecek.png',
    attributes: { speed: 4, acceleration: 4, skatingTechnique: 5, braking: 5, stability: 5, stamina: 6, strength: 5, shooting: 4, passing: 5, puckControl: 5, stealing: 5, checking: 5, attendance: 70 }
  },
  { id: 9, name: 'Jindřich Belinger', number: 3, position: 'Obránce', age: 34, height: 190, weight: 95, 
    nationality: '🇨🇿', category: 'defenders',
    photo: '/Images/Fotky/Lancers/jindrich-belinger.png',
    attributes: { speed: 3, acceleration: 3, skatingTechnique: 4, braking: 6, stability: 6, stamina: 5, strength: 6, shooting: 5, passing: 5, puckControl: 5, stealing: 6, checking: 6, attendance: 75 }
  },
  { id: 10, name: 'Jiří Belinger', number: 77, position: 'Obránce', age: 30, height: 186, weight: 88, 
    nationality: '🇨🇿', category: 'defenders',
    photo: '/Images/Fotky/Lancers/jiri-belinger.png',
    attributes: { speed: 4, acceleration: 4, skatingTechnique: 5, braking: 5, stability: 5, stamina: 5, strength: 5, shooting: 4, passing: 6, puckControl: 5, stealing: 5, checking: 5, attendance: 80 }
  },
  { id: 11, name: 'Jan Hanuš', number: 8, position: 'Obránce', age: 27, height: 184, weight: 87, 
    nationality: '🇨🇿', category: 'defenders', description: 'Ofenzivní obránce',
    photo: '/Images/Fotky/Lancers/jan-hanus.png',
    attributes: { speed: 5, acceleration: 5, skatingTechnique: 6, braking: 4, stability: 5, stamina: 6, strength: 5, shooting: 7, passing: 7, puckControl: 6, stealing: 5, checking: 5, attendance: 85 }
  },
  { id: 12, name: 'Pavel Schubada St.', number: 44, position: 'Obránce', age: 45, height: 183, weight: 90, 
    nationality: '🇨🇿', category: 'defenders', description: 'Veterán týmu, legenda',
    photo: '/Images/Fotky/Lancers/pavel-schubada-st.png',
    attributes: { speed: 2, acceleration: 2, skatingTechnique: 3, braking: 6, stability: 6, stamina: 4, strength: 5, shooting: 4, passing: 6, puckControl: 5, stealing: 5, checking: 5, attendance: 50 }
  },
  { id: 13, name: 'Michal Koreš', number: 6, position: 'Obránce', age: 29, height: 187, weight: 91, 
    nationality: '🇨🇿', category: 'defenders',
    photo: '/Images/Fotky/Lancers/michal-kores.png',
    attributes: { speed: 4, acceleration: 4, skatingTechnique: 4, braking: 5, stability: 6, stamina: 5, strength: 6, shooting: 4, passing: 5, puckControl: 5, stealing: 6, checking: 6, attendance: 70 }
  },
  { id: 14, name: 'Ondřej Kocourek', number: 23, position: 'Obránce', age: 26, height: 181, weight: 83, 
    nationality: '🇨🇿', category: 'defenders',
    photo: '/Images/Fotky/Lancers/ondrej-kocourek.png',
    attributes: { speed: 5, acceleration: 5, skatingTechnique: 5, braking: 4, stability: 4, stamina: 6, strength: 4, shooting: 4, passing: 5, puckControl: 5, stealing: 5, checking: 4, attendance: 80 }
  },
  { id: 15, name: 'Václav Matějovič', number: 99, position: 'Obránce', age: 28, height: 185, weight: 88, 
    nationality: '🇨🇿', category: 'defenders', description: 'Ofenzivní obránce',
    photo: '/Images/Fotky/Lancers/vaclav-matejovic.png',
    attributes: { speed: 5, acceleration: 5, skatingTechnique: 6, braking: 4, stability: 5, stamina: 5, strength: 5, shooting: 7, passing: 6, puckControl: 6, stealing: 5, checking: 5, attendance: 75 }
  },
  
  // ÚTOČNÍCI
  { id: 16, name: 'Vašek Materna', number: 91, position: 'Útočník', age: 27, height: 180, weight: 82, 
    nationality: '🇨🇿', category: 'forwards', description: 'Nejlepší střelec týmu',
    photo: '/Images/Fotky/Lancers/vasek-materna.png',
    attributes: { speed: 6, acceleration: 6, skatingTechnique: 6, braking: 3, stability: 5, stamina: 6, strength: 5, shooting: 8, passing: 6, puckControl: 7, stealing: 5, checking: 4, attendance: 0 }
  },
  { id: 17, name: 'Stanislav Švarc', number: 46, position: 'Útočník', age: 38, height: 183, weight: 84, 
    nationality: '🇨🇿', category: 'forwards', description: 'Zkušený centr',
    photo: '/Images/Fotky/Lancers/stanislav-svarc.png',
    attributes: { speed: 3, acceleration: 3, skatingTechnique: 4, braking: 5, stability: 5, stamina: 5, strength: 5, shooting: 5, passing: 7, puckControl: 6, stealing: 5, checking: 5, attendance: 65 }
  },
  { id: 18, name: 'Jan Schubada', number: 25, position: 'Útočník', age: 24, height: 179, weight: 78, 
    nationality: '🇨🇿', category: 'forwards',
    photo: '/Images/Fotky/Lancers/jan-schubada.png',
    attributes: { speed: 6, acceleration: 6, skatingTechnique: 6, braking: 3, stability: 4, stamina: 7, strength: 4, shooting: 5, passing: 5, puckControl: 6, stealing: 5, checking: 4, attendance: 85 }
  },
  { id: 19, name: 'Pavel Schubada ml.', number: 18, position: 'Útočník', age: 22, height: 175, weight: 76, 
    nationality: '🇨🇿', category: 'forwards',
    photo: '/Images/Fotky/Lancers/pavel-schubada-ml.png',
    attributes: { speed: 6, acceleration: 6, skatingTechnique: 6, braking: 3, stability: 4, stamina: 7, strength: 3, shooting: 5, passing: 5, puckControl: 6, stealing: 5, checking: 3, attendance: 90 }
  },
  { id: 20, name: 'Adam Schubada', number: 11, position: 'Útočník', age: 20, height: 177, weight: 75, 
    nationality: '🇨🇿', category: 'forwards',
    photo: '/Images/Fotky/Lancers/adam-schubada.png',
    attributes: { speed: 7, acceleration: 7, skatingTechnique: 6, braking: 3, stability: 4, stamina: 7, strength: 3, shooting: 4, passing: 5, puckControl: 6, stealing: 5, checking: 3, attendance: 85 }
  },
  { id: 21, name: 'Pavel Novák', number: 9, position: 'Útočník', age: 30, height: 182, weight: 85, 
    nationality: '🇨🇿', category: 'forwards', description: 'Produktivní útočník',
    photo: '/Images/Fotky/Lancers/pavel-novak.png',
    attributes: { speed: 5, acceleration: 5, skatingTechnique: 5, braking: 4, stability: 5, stamina: 6, strength: 5, shooting: 7, passing: 6, puckControl: 7, stealing: 5, checking: 4, attendance: 80 }
  },
  { id: 22, name: 'Aleš Kuřitka', number: 24, position: 'Útočník', age: 33, height: 179, weight: 80, 
    nationality: '🇨🇿', category: 'forwards',
    photo: '/Images/Fotky/Lancers/ales-kuritka.png',
    attributes: { speed: 4, acceleration: 4, skatingTechnique: 5, braking: 4, stability: 5, stamina: 5, strength: 5, shooting: 5, passing: 5, puckControl: 5, stealing: 5, checking: 4, attendance: 70 }
  },
  { id: 23, name: 'Václav Materna', number: 17, position: 'Útočník', age: 29, height: 181, weight: 83, 
    nationality: '🇨🇿', category: 'forwards',
    photo: '/Images/Fotky/Lancers/vaclav-materna.png',
    attributes: { speed: 5, acceleration: 5, skatingTechnique: 5, braking: 4, stability: 5, stamina: 6, strength: 5, shooting: 15, passing: 6, puckControl: 15, stealing: 5, checking: 4, attendance: 75 }
  },
  { id: 24, name: 'Jiří Šalanda', number: 71, position: 'Útočník', age: 31, height: 177, weight: 79, 
    nationality: '🇨🇿', category: 'forwards', description: 'Rychlý a technický',
    photo: '/Images/Fotky/Lancers/jiri-salanda.png',
    attributes: { speed: 7, acceleration: 7, skatingTechnique: 7, braking: 3, stability: 4, stamina: 6, strength: 4, shooting: 5, passing: 5, puckControl: 7, stealing: 5, checking: 3, attendance: 80 }
  },
  { id: 25, name: 'Ondřej Hrubý', number: 88, position: 'Útočník', age: 26, height: 184, weight: 86, 
    nationality: '🇨🇿', category: 'forwards',
    photo: '/Images/Fotky/Lancers/ondrej-hruby.png',
    attributes: { speed: 5, acceleration: 5, skatingTechnique: 5, braking: 4, stability: 5, stamina: 6, strength: 6, shooting: 5, passing: 5, puckControl: 5, stealing: 5, checking: 5, attendance: 75 }
  },
  { id: 26, name: 'Gustav Toman', number: 10, position: 'Útočník', age: 35, height: 180, weight: 82, 
    nationality: '🇨🇿', category: 'forwards',
    photo: '/Images/Fotky/Lancers/gustav-toman.png',
    attributes: { speed: 3, acceleration: 3, skatingTechnique: 4, braking: 5, stability: 5, stamina: 5, strength: 5, shooting: 5, passing: 6, puckControl: 6, stealing: 5, checking: 5, attendance: 60 }
  },
  { id: 27, name: 'Jan Švarc', number: 13, position: 'Útočník', age: 25, height: 178, weight: 77, 
    nationality: '🇨🇿', category: 'forwards',
    photo: '/Images/Fotky/Lancers/jan-svarc.png',
    attributes: { speed: 6, acceleration: 6, skatingTechnique: 6, braking: 3, stability: 4, stamina: 7, strength: 4, shooting: 5, passing: 5, puckControl: 6, stealing: 5, checking: 4, attendance: 5 }
  },
  { id: 28, name: 'Ladislav Černý', number: 7, position: 'Útočník', age: 32, height: 182, weight: 84, 
    nationality: '🇨🇿', category: 'forwards',
    photo: '/Images/Fotky/Lancers/ladislav-cerny.png',
    attributes: { speed: 4, acceleration: 4, skatingTechnique: 5, braking: 4, stability: 5, stamina: 5, strength: 5, shooting: 5, passing: 5, puckControl: 5, stealing: 5, checking: 5, attendance: 70 }
  },
  { id: 29, name: 'Marian Dlugopolský', number: 69, position: 'Útočník', age: 28, height: 185, weight: 88, 
    nationality: '🇸🇰', category: 'forwards',
    photo: '/Images/Fotky/Lancers/marian-dlugopolsky.png',
    attributes: { speed: 5, acceleration: 5, skatingTechnique: 5, braking: 4, stability: 5, stamina: 6, strength: 6, shooting: 6, passing: 5, puckControl: 6, stealing: 5, checking: 5, attendance: 75 }
  },
  { id: 30, name: 'Jiří Matuška', number: 21, position: 'Útočník', age: 34, height: 180, weight: 81, 
    nationality: '🇨🇿', category: 'forwards',
    photo: '/Images/Fotky/Lancers/jiri-matuska.png',
    attributes: { speed: 4, acceleration: 4, skatingTechnique: 4, braking: 4, stability: 5, stamina: 5, strength: 5, shooting: 5, passing: 6, puckControl: 5, stealing: 5, checking: 5, attendance: 7 }
  },
  { id: 31, name: 'Lukáš Matuška', number: 16, position: 'Útočník', age: 23, height: 176, weight: 75, 
    nationality: '🇨🇿', category: 'forwards',
    photo: '/Images/Fotky/Lancers/lukas-matuska.png',
    attributes: { speed: 6, acceleration: 6, skatingTechnique: 6, braking: 3, stability: 4, stamina: 7, strength: 4, shooting: 5, passing: 5, puckControl: 6, stealing: 5, checking: 4, attendance: 5 }
  },
  { id: 32, name: 'Roman Beneš', number: 15, position: 'Útočník', age: 30, height: 183, weight: 85, 
    nationality: '🇨🇿', category: 'forwards',
    photo: '/Images/Fotky/Lancers/roman-benes.png',
    attributes: { speed: 5, acceleration: 5, skatingTechnique: 5, braking: 4, stability: 5, stamina: 6, strength: 5, shooting: 5, passing: 5, puckControl: 5, stealing: 5, checking: 5, attendance: 75 }
  },
  { id: 33, name: 'Dan Kačeňák', number: 89, position: 'Útočník', age: 29, height: 182, weight: 85, 
    nationality: '🇨🇿', category: 'forwards',
    photo: '/Images/Fotky/Lancers/dan-kacenak.png',
    attributes: { speed: 5, acceleration: 5, skatingTechnique: 5, braking: 4, stability: 5, stamina: 6, strength: 5, shooting: 6, passing: 5, puckControl: 6, stealing: 5, checking: 4, attendance: 5 }
  }
];
const mostRosterData = [
  { id: 1, name: 'Martin Sýkora', number: 33, position: 'Brankář', age: 29, height: 186, weight: 88, nationality: '🇨🇿', category: 'goalies', photo: '/Images/Fotky/Krysaci/martin-sykora.png',
    attributes: { reflexes: 6, positioning: 6, glove: 6, blocker: 6, speed: 4, stamina: 5, attendance: 85 }
  },
  { id: 2, name: 'Petr Myšák', number: 31, position: 'Brankář', age: 26, height: 184, weight: 86, nationality: '🇨🇿', category: 'goalies', photo: '/Images/Fotky/Krysaci/petr-mysak.png',
    attributes: { reflexes: 5, positioning: 5, glove: 5, blocker: 5, speed: 4, stamina: 5, attendance: 70 }
  },
  { id: 3, name: 'Tomáš Hrabal', number: 2, position: 'Obránce', age: 30, height: 185, weight: 89, nationality: '🇨🇿', category: 'defenders', photo: '/Images/Fotky/Krysaci/tomas-hrabal.png',
    attributes: { speed: 4, acceleration: 4, skatingTechnique: 4, braking: 5, stability: 5, stamina: 5, strength: 5, shooting: 4, passing: 5, puckControl: 4, stealing: 5, checking: 6, attendance: 75 }
  },
  { id: 4, name: 'Lukáš Veverka', number: 7, position: 'Obránce', age: 28, height: 183, weight: 87, nationality: '🇨🇿', category: 'defenders', photo: '/Images/Fotky/Krysaci/lukas-veverka.png',
    attributes: { speed: 1, acceleration: 4, skatingTechnique: 5, braking: 5, stability: 5, stamina: 5, strength: 5, shooting: 4, passing: 5, puckControl: 5, stealing: 5, checking: 5, attendance: 80 }
  },
  { id: 5, name: 'Jan Potkan', number: 15, position: 'Obránce', age: 32, height: 186, weight: 90, nationality: '🇨🇿', category: 'defenders', photo: '/Images/Fotky/Krysaci/jan-potkan.png',
    attributes: { speed: 1, acceleration: 3, skatingTechnique: 4, braking: 6, stability: 6, stamina: 5, strength: 7, shooting: 3, passing: 4, puckControl: 4, stealing: 6, checking: 7, attendance: 75 }
  },
  { id: 6, name: 'Martin Šedák', number: 21, position: 'Obránce', age: 27, height: 182, weight: 85, nationality: '🇨🇿', category: 'defenders', photo: '/Images/Fotky/Krysaci/martin-sedak.png',
    attributes: { speed: 1, acceleration: 4, skatingTechnique: 5, braking: 5, stability: 5, stamina: 5, strength: 5, shooting: 4, passing: 5, puckControl: 5, stealing: 5, checking: 5, attendance: 80 }
  },
  { id: 7, name: 'Petr Krysa', number: 44, position: 'Obránce', age: 33, height: 188, weight: 92, nationality: '🇨🇿', category: 'defenders', photo: '/Images/Fotky/Krysaci/petr-krysa.png',
    attributes: { speed: 1, acceleration: 3, skatingTechnique: 4, braking: 5, stability: 6, stamina: 1, strength: 6, shooting: 4, passing: 5, puckControl: 4, stealing: 5, checking: 6, attendance: 70 }
  },
  { id: 8, name: 'Filip Hraboš', number: 55, position: 'Obránce', age: 25, height: 180, weight: 83, nationality: '🇨🇿', category: 'defenders', photo: '/Images/Fotky/Krysaci/filip-hrabos.png',
    attributes: { speed: 1, acceleration: 5, skatingTechnique: 5, braking: 4, stability: 4, stamina: 1, strength: 4, shooting: 4, passing: 5, puckControl: 5, stealing: 5, checking: 4, attendance: 85 }
  },
  { id: 9, name: 'David Myšilov', number: 9, position: 'Útočník', age: 26, height: 178, weight: 81, nationality: '🇨🇿', category: 'forwards', photo: '/Images/Fotky/Krysaci/david-mysilov.png',
    attributes: { speed: 1, acceleration: 7, skatingTechnique: 6, braking: 3, stability: 4, stamina: 1, strength: 4, shooting: 11, passing: 5, puckControl: 6, stealing: 5, checking: 3, attendance: 85 }
  },
  { id: 10, name: 'Jakub Krysař', number: 11, position: 'Útočník', age: 29, height: 182, weight: 85, nationality: '🇨🇿', category: 'forwards', photo: '/Images/Fotky/Krysaci/jakub-krysar.png',
    attributes: { speed: 1, acceleration: 5, skatingTechnique: 5, braking: 4, stability: 5, stamina: 1, strength: 5, shooting: 6, passing: 5, puckControl: 5, stealing: 5, checking: 5, attendance: 75 }
  },
  { id: 11, name: 'Michal Hrabavý', number: 17, position: 'Útočník', age: 24, height: 176, weight: 79, nationality: '🇨🇿', category: 'forwards', photo: '/Images/Fotky/Krysaci/michal-hrabavy.png',
    attributes: { speed: 9, acceleration: 6, skatingTechnique: 6, braking: 3, stability: 7, stamina: 1, strength: 9, shooting: 5, passing: 5, puckControl: 9, stealing: 9, checking: 4, attendance: 100 }
  },
  { id: 12, name: 'Tomáš Potkaný', number: 23, position: 'Útočník', age: 31, height: 183, weight: 86, nationality: '🇨🇿', category: 'forwards', photo: '/Images/Fotky/Krysaci/tomas-potkany.png',
    attributes: { speed: 1, acceleration: 4, skatingTechnique: 5, braking: 4, stability: 5, stamina: 1, strength: 6, shooting: 5, passing: 5, puckControl: 5, stealing: 5, checking: 5, attendance: 70 }
  },
  { id: 13, name: 'Filip Šedivý', number: 27, position: 'Útočník', age: 28, height: 181, weight: 84, nationality: '🇨🇿', category: 'forwards', photo: '/Images/Fotky/Krysaci/filip-sedivy.png',
    attributes: { speed: 1, acceleration: 5, skatingTechnique: 5, braking: 4, stability: 5, stamina: 1, strength: 5, shooting: 5, passing: 5, puckControl: 5, stealing: 5, checking: 5, attendance: 75 }
  },
  { id: 14, name: 'Roman Myška', number: 71, position: 'Útočník', age: 30, height: 180, weight: 82, nationality: '🇨🇿', category: 'forwards', photo: '/Images/Fotky/Krysaci/roman-myska.png',
    attributes: { speed: 1, acceleration: 1, skatingTechnique: 5, braking: 4, stability: 5, stamina: 1, strength: 5, shooting: 5, passing: 5, puckControl: 5, stealing: 5, checking: 5, attendance: 75 }
  },
  { id: 15, name: 'Stanislav Hrabák', number: 88, position: 'Útočník', age: 27, height: 179, weight: 81, nationality: '🇨🇿', category: 'forwards', photo: '/Images/Fotky/Krysaci/stanislav-hrabak.png',
    attributes: { speed: 1, acceleration: 1, skatingTechnique: 5, braking: 4, stability: 5, stamina: 1, strength: 5, shooting: 6, passing: 5, puckControl: 6, stealing: 5, checking: 4, attendance: 80 }
  }
];

const addOverallToRoster = (roster) => {
  return roster.map(player => ({
    ...player,
    overall: calculateOverall(player.attributes, player.category)
  }));
};

export const teamsData = {
  lancers: {
    id: 'lancers',
    name: 'Litvínov Lancers',
    city: 'Litvínov',
    emoji: '🏒',
    colors: { primary: '#3B82F6', secondary: '#DBEAFE' },
    founded: '2016',
    stadium: 'Litvínovská hokejová hala',
    coach: 'Ty!',
    description: 'Tvůj tým!',
    roster: addOverallToRoster(lancersRosterData)
  },
  most: {
    id: 'most',
    name: 'Krysáci Most',
    city: 'Most',
    emoji: '🐀',
    colors: { primary: '#8B4513', secondary: '#D2691E' },
    founded: '2018',
    stadium: 'Zimní stadion Most',
    coach: 'Miroslav Krysík',
    description: 'Tradiční tým z Mostu.',
    roster: addOverallToRoster(mostRosterData)
  }
};
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, Target, Award, TrendingUp, Zap } from 'lucide-react';
// DATA HRÁČŮ PŘÍMO V SOUBORU - NENÍ POTŘEBA playerData.js!
const lancersRoster = [
  // Brankáři
  { 
    id: 'novakova-michaela',
    name: 'Michaela Nováková', 
    number: 32, 
    position: 'Brankář', 
    age: 20, 
    height: 175, 
    weight: 70, 
    nationality: '🇨🇿', 
    category: 'goalies',
    photo: '/Images/Fotky/Lancers/michaela-novakova.png',
    joinedTeam: '2023',
    birthDate: '15.3.1999',
    birthPlace: 'Praha',
    catchingHand: 'L',
    description: 'Talentovaná brankářka, která přišla z ženské extraligy. První žena v historii KHLA. Klíčová hráčka ve vyřazovací části Českého poháru.'
  },
  { 
    id: 'nistor-vlastimil',
    name: 'Vlastimil Nistor', 
    number: 1, 
    position: 'Brankář', 
    age: 25, 
    height: 185, 
    weight: 87, 
    nationality: '🇨🇿', 
    category: 'goalies',
    photo: '/Images/Fotky/Lancers/vlastimil-nistor.png',
    joinedTeam: '2020',
    birthDate: '8.11.1993',
    birthPlace: 'Litvínov',
    catchingHand: 'L',
    description: 'Zkušený brankář, dvojka za Michaelou Novákovou. Chytal výhru nad Warriors 3:1, přestřelku 7:6 s Netopýři, prohru 4:7 s Kocoury na Kladně a výhru 4:2 nad Viper Ústí.'
  },
  { 
    id: 'seidler-jakub',
    name: 'Jakub Seidler', 
    number: 35, 
    position: 'Brankář', 
    age: 33, 
    height: 189, 
    weight: 92, 
    nationality: '🇨🇿', 
    category: 'goalies',
    photo: '/Images/Fotky/Lancers/jakub-seidler.png',
    joinedTeam: '2022',
    birthDate: '22.5.1997',
    birthPlace: 'Most',
    catchingHand: 'R',
    description: 'Třetí brankář týmu. Talentovaný gólman s perspektivou. Reprezentoval Lancers na mezinárodním turnaji ve Straubingu 2025.'
  },
  { 
    id: 'moravek-jiri',
    name: 'Jiří Morávek', 
    number: 31, 
    position: 'Brankář', 
    age: 29, 
    height: 183, 
    weight: 85, 
    nationality: '🇨🇿', 
    category: 'goalies',
    photo: '/Images/Fotky/Lancers/jiri-moravek.png',
    joinedTeam: '2021',
    birthDate: '10.9.1996',
    birthPlace: 'Teplice',
    catchingHand: 'L',
    description: 'Čtvrtý brankář týmu. Spolehlivý náhradník.'
  },
  
  // Obránci
  { 
    id: 'simek-roman',
    name: 'Roman Šimek', 
    number: 27, 
    position: 'Obránce', 
    age: 32, 
    height: 183, 
    weight: 86, 
    nationality: '🇨🇿', 
    category: 'defenders',
    photo: '/Images/Fotky/Lancers/roman-simek.png',
    joinedTeam: '2019',
    birthDate: '1.2.1993',
    birthPlace: 'Litvínov',
    shoots: 'R',
    description: 'Kapitán týmu, zkušený obránce s výbornou rozehrávkou a střelou. Zaznamenal 2+2 ve výhře 10:3 nad Sharks Ústí.'
  },
  { 
    id: 'stepanovsky-oliver',
    name: 'Oliver Štěpanovský', 
    number: 27, 
    position: 'Obránce', 
    age: 35, 
    height: 188, 
    weight: 94, 
    nationality: '🇨🇿', 
    category: 'defenders',

    photo: '/Images/Fotky/Lancers/oliver-stepanovsky.png',    joinedTeam: '2018',
    shoots: 'L',
    description: 'Nejzkušenější obránce týmu. Tvrdý defenzivní specialista. Účastník turnaje ve Straubingu 2025.'
  },
  { 
    id: 'coufal-lubos',
    name: 'Luboš Coufal', 
    number: 33, 
    position: 'Obránce', 
    age: 39, 
    height: 185, 
    weight: 89, 
    nationality: '🇨🇿', 
    category: 'defenders',

    photo: '/Images/Fotky/Lancers/lubos-coufal.png',    joinedTeam: '2020',
    shoots: 'R',
    description: 'Zkušený obránce s výbornou přihrávkou. Zaznamenal 2 asistence ve výhře 10:3 nad Gurmány. Výjimečně hrál v útoku proti Viper Ústí. Účastník turnaje ve Straubingu 2025.'
  },
  { 
    id: 'turecek-tomas',
    name: 'Tomáš Tureček', 
    number: 44, 
    position: 'Obránce', 
    age: 28, 
    height: 182, 
    weight: 84, 
    nationality: '🇨🇿', 
    category: 'defenders',

    photo: '/Images/Fotky/Lancers/tomas-turecek.png',    joinedTeam: '2021',
    shoots: 'L',
    description: 'Univerzální obránce, který dokáže v nouzi zaskočit i v brance. Chytal ve dvou zápasech základní skupiny ČP - proti Gurmánům (výhra 10:3) a Ducks Klášterec (prohra 3:6). Účastník turnaje ve Straubingu 2025.'
  },
  { 
    id: 'belinger-jindrich',
    name: 'Jindřich Belinger', 
    number: 22, 
    position: 'Obránce', 
    age: 34, 
    height: 190, 
    weight: 95, 
    nationality: '🇨🇿', 
    category: 'defenders',

    photo: '/Images/Fotky/Lancers/jindrich-belinger.png',    joinedTeam: '2019',
    shoots: 'R',
    description: 'Starší z bratrů Belingerů, defenzivní specialista. Zaznamenal 2 asistence proti Sharks (10:3), gól + asistence proti Kocourům (4:7) a asistenci proti Viper (4:2).'
  },
  { 
    id: 'belinger-jiri',
    name: 'Jiří Belinger', 
    number: 22, 
    position: 'Obránce', 
    age: 25, 
    height: 186, 
    weight: 88, 
    nationality: '🇨🇿', 
    category: 'defenders',

    photo: '/Images/Fotky/Lancers/jiri-belinger.png',    joinedTeam: '2020',
    shoots: 'L',
    description: 'Mladší z bratrů Belingerů. Rychlý obránce s dobrou rozehrávkou. Hrál ve druhé formaci s bratrem proti Viper Ústí.'
  },
  { 
    id: 'hanus-jan',
    name: 'Jan Hanuš', 
    number: 8, 
    position: 'Obránce', 
    age: 48, 
    height: 184, 
    weight: 87, 
    nationality: '🇨🇿', 
    category: 'defenders',

    photo: '/Images/Fotky/Lancers/jan-hanus.png',    joinedTeam: '2022',
    shoots: 'R',
    description: 'Ofenzivní obránce s výbornou střelou. Ve výhře 10:3 nad Gurmány měl 1+2, proti Sharks fantastické 2+2! Někdy až moc emotivní - nesportovní chování proti Kocourům. Žije v Německu a účastnil se turnaje ve Straubingu 2025.'
  },
  { 
    id: 'schubada-pavel-st',
    name: 'Pavel Schubada St.', 
    number: 65, 
    position: 'Obránce', 
    age: 48, 
    height: 183, 
    weight: 90, 
    nationality: '🇨🇿', 
    category: 'defenders',

    photo: '/Images/Fotky/Lancers/pavel-schubada-st.png',    joinedTeam: '2015',
    shoots: 'L',
    description: 'Veterán týmu, otec tří synů hrajících v útoku. Legenda klubu. Ve výhře 10:3 nad Gurmány vstřelil gól - celá rodina Schubadů skórovala! Pravidelně hraje se syny.'
  },
  { 
    id: 'kores-michal',
    name: 'Michal Koreš', 
    number: 6, 
    position: 'Obránce', 
    age: 38, 
    height: 200, 
    weight: 100, 
    nationality: '🇨🇿', 
    category: 'defenders',

    photo: '/Images/Fotky/Lancers/michal-kores.png',    joinedTeam: '2021',
    shoots: 'R',
    description: 'Fyzicky silný obránce. Specialista na osobní souboje. Hrdina semifinále turnaje ve Straubingu 2025 - rozhodl nájezdy proti Bayern Rangers.'
  },
  { 
    id: 'kocourek-ondrej',
    name: 'Ondřej Kocourek', 
    number: 23, 
    position: 'Obránce', 
    age: 30, 
    height: 181, 
    weight: 83, 
    nationality: '🇨🇿', 
    category: 'defenders',

    photo: '/Images/Fotky/Lancers/ondrej-kocourek.png',    joinedTeam: '2023',
    shoots: 'L',
    description: 'Nejmladší obránce v týmu. Rychlý bruslař s potenciálem.'
  },
  { 
    id: 'matejovic',
    name: 'Matějovič', 
    number: 16, 
    position: 'Obránce', 
    age: 35, 
    height: 185, 
    weight: 88, 
    nationality: '🇨🇿', 
    category: 'defenders',

    photo: '/Images/Fotky/Lancers/matejovic.png',    joinedTeam: '2024',
    shoots: 'R',
    description: 'Ofenzivní obránce s výbornou střelou. Hvězda semifinále ČP (2 góly) a hattrick v přestřelce 7:6 s Netopýři!'
  },
  
  // Útočníci
  { 
    id: 'materna-vasek',
    name: 'Vašek Materna', 
    number: 13, 
    position: 'Útočník', 
    age: 35, 
    height: 180, 
    weight: 82, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/vasek-materna.png',    joinedTeam: '2021',
    shoots: 'L',
    description: 'Nejlepší střelec týmu, rychlý a technický útočník. Vstřelil jediný gól ve finále ČP. Zaznamenal 2+3 v přestřelce 7:6 s Netopýři. Asistence na gól Belingera proti Kocourům.'
  },
  { 
    id: 'svarc-stanislav',
    name: 'Stanislav Švarc', 
    number: 4, 
    position: 'Útočník', 
    age: 38, 
    height: 183, 
    weight: 84, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/stanislav-svarc.png',    joinedTeam: '2017',
    shoots: 'R',
    description: 'Zkušený centr, univerzální hráč. Produktivní střelec - 3 góly v ČP, 2 góly proti Netopýřům (7:6), 2 góly proti Sharks (10:3). Schopen hrát ve všech formacích.'
  },
  { 
    id: 'schubada-jan',
    name: 'Jan Schubada', 
    number: 88, 
    position: 'Útočník', 
    age: 30, 
    height: 179, 
    weight: 78, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/jan-schubada.png',    joinedTeam: '2019',
    shoots: 'L',
    description: 'Nejstarší ze synů Pavla Schubady St. Součást historického zápasu, kdy celá rodina skórovala proti Gurmánům. Vstřelil 2 góly proti Sharks Ústí. Pravidelně hraje s otcem a bratrem.'
  },
  { 
    id: 'schubada-pavel-ml',
    name: 'Pavel Schubada ml.', 
    number: 18, 
    position: 'Útočník', 
    age: 25, 
    height: 175, 
    weight: 76, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/pavel-schubada-ml.png',    joinedTeam: '2021',
    shoots: 'R',
    description: 'Prostřední ze synů Pavla Schubady St. Vstřelil hattrick proti Gurmánům (10:3), gól + asistence proti Sharks (10:3) a 2 góly proti Viper Ústí (4:2).'
  },
  { 
    id: 'schubada-adam',
    name: 'Adam Schubada', 
    number: 11, 
    position: 'Útočník', 
    age: 18, 
    height: 178, 
    weight: 75, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/adam-schubada.png',    joinedTeam: '2023',
    shoots: 'L',
    description: 'Nejmladší ze synů Pavla Schubady St., velký talent. Součást hokejové dynastie Schubadů.'
  },
  { 
    id: 'novak-pavel',
    name: 'Pavel Novák', 
    number: 21, 
    position: 'Útočník', 
    age: 38, 
    height: 182, 
    weight: 85, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/pavel-novak.png',    joinedTeam: '2020',
    shoots: 'R',
    description: 'Produktivní útočník. Vstřelil 2 góly v kanonádě 10:3 nad Gurmány, 2 góly ve čtvrtfinále ČP a gól proti Kocourům (4:7).'
  },
  { 
    id: 'kuritka-ales',
    name: 'Aleš Kuřitka', 
    number: 61, 
    position: 'Útočník', 
    age: 38, 
    height: 179, 
    weight: 80, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/ales-kuritka.png',    joinedTeam: '2019',
    shoots: 'L',
    description: 'Pracovitý útočník třetí formace. Výborný na oslabení.'
  },
  { 
    id: 'materna-vaclav',
    name: 'Václav Materna', 
    number: 13, 
    position: 'Útočník', 
    age: 29, 
    height: 181, 
    weight: 83, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/vaclav-materna.png',    joinedTeam: '2020',
    shoots: 'R',
    description: 'Bratr Vaška Materny, silový útočník. Společně tvoří nebezpečnou bratrskou dvojici.'
  },
  { 
    id: 'salanda-jiri',
    name: 'Jiří Šalanda', 
    number: 71, 
    position: 'Útočník', 
    age: 22, 
    height: 177, 
    weight: 79, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/jiri-salanda.png',    joinedTeam: '2018',
    shoots: 'L',
    description: 'Rychlý a technický útočník. Vstřelil 2 góly ve výhře 10:3 nad Gurmány, gól proti Ducks. Asistence na první gól proti Viper Ústí. Účastník turnaje ve Straubingu 2025.'
  },
  { 
    id: 'hruby-ondrej',
    name: 'Ondřej Hrubý', 
    number: 10, 
    position: 'Útočník', 
    age: 30, 
    height: 184, 
    weight: 86, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/ondrej-hruby.png',    joinedTeam: '2022',
    shoots: 'R',
    description: 'Silový útočník čtvrté formace. Bojovník do oslabení.'
  },
  { 
    id: 'toman-gustav',
    name: 'Gustav Toman', 
    number: 67, 
    position: 'Útočník', 
    age: 45, 
    height: 160, 
    weight: 62, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/gustav-toman.png',    joinedTeam: '2017',
    shoots: 'L',
    description: 'Zkušený veterán s výbornou přehrou. Zaznamenal 2 asistence na góly Pavla Nováka ve čtvrtfinále ČP. Vstřelil první gól proti Viper Ústí (4:2).'
  },
  { 
    id: 'svarc-jan',
    name: 'Jan Švarc', 
    number: 2, 
    position: 'Útočník', 
    age: 30, 
    height: 178, 
    weight: 77, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/jan-svarc.png',    joinedTeam: '2022',
    shoots: 'R',
    description: 'Syn Stanislava Švarce, rychlé křídlo. Pravidelně hraje v první formaci s otcem.'
  },
  { 
    id: 'cerny-ladislav',
    name: 'Ladislav Černý', 
    number: 7, 
    position: 'Útočník', 
    age: 41, 
    height: 192, 
    weight: 84, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/ladislav-cerny.png',    joinedTeam: '2019',
    shoots: 'L',
    description: 'Univerzální útočník, může hrát všechny pozice v útoku. Bojovník, někdy až moc - 2 vyloučení v přestřelce s Netopýři.'
  },
  { 
    id: 'dlugopolsky-marian',
    name: 'Marian Dlugopolský', 
    number: 77, 
    position: 'Útočník', 
    age: 28, 
    height: 185, 
    weight: 88, 
    nationality: '🇸🇰', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/marian-dlugopolsky.png',    joinedTeam: '2021',
    shoots: 'R',
    description: 'Slovenský útočník s výbornou střelou. Vstřelil důležitý gól na 9:3 proti Sharks Ústí. Univerzální hráč schopný hrát ve všech formacích.'
  },
  { 
    id: 'matuska-jiri',
    name: 'Jiří Matuška', 
    number: 55, 
    position: 'Útočník', 
    age: 34, 
    height: 180, 
    weight: 81, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/jiri-matuska.png',    joinedTeam: '2018',
    shoots: 'L',
    description: 'Starší z bratrů Matuškových. Zkušený útočník s dobrou střelou. Účastník turnaje ve Straubingu 2025.'
  },
  { 
    id: 'matuska-lukas',
    name: 'Lukáš Matuška', 
    number: 66, 
    position: 'Útočník', 
    age: 23, 
    height: 176, 
    weight: 75, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/lukas-matuska.png',    joinedTeam: '2023',
    shoots: 'R',
    description: 'Mladší z bratrů Matuškových, technický hráč. Vstřelil svůj první gól sezóny v prohře 4:7 s Kocoury na Kladně. Účastník turnaje ve Straubingu 2025.'
  },
  { 
    id: 'benes-roman',
    name: 'Roman Beneš', 
    number: 42, 
    position: 'Útočník', 
    age: 45, 
    height: 183, 
    weight: 85, 
    nationality: '🇨🇿', 
    category: 'forwards',

    photo: '/Images/Fotky/Lancers/roman-benes.png',    joinedTeam: '2020',
    shoots: 'L',
    description: 'Spolehlivý útočník třetí formace. Důležitý článek týmu při oslabení.'
  },
  
  // Hostující hráči (guest players)
  { 
    id: 'kacenak-dan',
    name: 'Dan Kačeňák', 
    number: 89, 
    position: 'Útočník', 
    age: 29, 
    height: 182, 
    weight: 85, 
    nationality: '🇨🇿', 
    category: 'guests',

    photo: '/Images/Fotky/Lancers/dan-kacenak.png',    team: 'Gurmáni',
    joinedTeam: '2025 (host)',
    shoots: 'L',
    description: 'Hostující hráč z týmu Gurmáni. Pomohl Lancers na mezinárodním turnaji ve Straubingu 2025, kde tým obsadil 6. místo. Výborný technický hráč s přehledem.'
  },
  { 
    id: 'zmeskal-lukas',
    name: 'Lukáš Zmeškal', 
    number: 19, 
    position: 'Útočník', 
    age: 27, 
    height: 178, 
    weight: 80, 
    nationality: '🇨🇿', 
    category: 'guests',

    photo: '/Images/Fotky/Lancers/lukas-zmeskal.png',    team: 'Gurmáni',
    joinedTeam: '2025 (host)',
    shoots: 'R',
    description: 'Hostující hráč z týmu Gurmáni. Společně s Danem Kačeňákem reprezentoval Lancers na turnaji ve Straubingu 2025. Rychlý bruslař s výbornou střelou.'
  },
  { 
    id: 'josef-kamarad',
    name: 'Josef "Pepa"', 
    number: 12, 
    position: 'Útočník', 
    age: 26, 
    height: 180, 
    weight: 82, 
    nationality: '🇨🇿', 
    category: 'guests',

    photo: '/Images/Fotky/Lancers/josef-kamarad.png',    team: 'Nezávislý',
    joinedTeam: '2025 (host)',
    shoots: 'L',
    description: 'Kamarád Jakuba Seidlera, který pomohl týmu na turnaji ve Straubingu 2025. Technický hráč s dobrým zakončením.'
  },
];

export default function LancersSoupiska() {
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    const data = sessionStorage.getItem('playerData');
    if (data) {
      setPlayerData(JSON.parse(data));
    } else {
      navigate('/setup');
    }
  }, [navigate]);

  if (!playerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Načítání...</div>
      </div>
    );
  }

  // Přidat hráčské atributy k hráčům (realistické hodnoty)
  const playersWithAttributes = lancersRoster.map(player => ({
    ...player,
    attributes: generatePlayerAttributes(player)
  }));

  // Přidat hráčovu postavu do soupisky
  const playerCharacter = {
    id: 'player-character',
    name: `${playerData.firstName} ${playerData.lastName}`,
    number: 99, // Speciální číslo pro hráče
    position: 'Útočník / Manažer',
    age: 25,
    height: 180,
    weight: 80,
    nationality: '🇨🇿',
    category: 'player',
    joinedTeam: '2024',
    birthDate: playerData.startDate || '1.7.2024',
    birthPlace: 'Litvínov',
    shoots: 'L',
    description: 'Hráč-manažer týmu. Kombinuje úlohu útočníka s vedením klubu.',
    attributes: playerData.skills || {
      speed: 5,
      acceleration: 5,
      stamina: 5,
      strength: 5,
      shooting: 5,
      passing: 5,
      puckControl: 5,
      stealing: 5,
      checking: 5
    },
    isPlayerCharacter: true
  };

  // Kompletní soupiska včetně hráče
  const fullRoster = [playerCharacter, ...playersWithAttributes];

  // Filtrování podle kategorie
  const filteredPlayers = selectedCategory === 'all' 
    ? fullRoster
    : selectedCategory === 'player'
    ? [playerCharacter]
    : fullRoster.filter(p => p.category === selectedCategory);

  // Kategorie pro filtry
  const categories = [
    { id: 'all', label: 'Všichni', icon: User, count: fullRoster.length },
    { id: 'player', label: 'Ty', icon: Award, count: 1, highlight: true },
    { id: 'goalies', label: 'Brankáři', icon: Shield, count: fullRoster.filter(p => p.category === 'goalies').length },
    { id: 'defenders', label: 'Obránci', icon: Shield, count: fullRoster.filter(p => p.category === 'defenders').length },
    { id: 'forwards', label: 'Útočníci', icon: Target, count: fullRoster.filter(p => p.category === 'forwards').length }
  ];

  // Výpočet průměrného ratingu hráče
  const calculateRating = (attributes) => {
    if (!attributes) return 5;
    const values = Object.entries(attributes)
      .filter(([key, value]) => key !== 'attendance' && typeof value === 'number')
      .map(([_, value]) => value);
    
    if (values.length === 0) return 5;
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.round(avg * 10) / 10; // Zaokrouhlí na 1 des. místo (např. 5.5)
  };

  // Barva podle ratingu (škála 1-10)
  const getRatingColor = (rating) => {
    if (rating >= 7.5) return 'from-green-500 to-emerald-600';
    if (rating >= 6.5) return 'from-blue-500 to-blue-600';
    if (rating >= 5.5) return 'from-yellow-500 to-orange-600';
    return 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* HORNÍ LIŠTA */}
      <div className="bg-slate-900/80 border-b border-slate-700 shadow-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/game')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Zpět na hlavní obrazovku</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">HC Litvínov Lancers</h1>
              <p className="text-gray-400 text-sm">Soupiska týmu</p>
            </div>
            
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
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
                    ? cat.highlight 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg scale-105'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
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
                className={`
                  bg-slate-800/50 border rounded-xl p-4 text-left
                  transition-all duration-200 hover:scale-105 hover:shadow-xl
                  ${player.isPlayerCharacter 
                    ? 'border-yellow-500/50 hover:border-yellow-500 bg-gradient-to-br from-yellow-500/10 to-orange-500/10' 
                    : 'border-slate-700 hover:border-slate-600'
                  }
                `}
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
                    <div className={`
                      w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl
                      ${player.isPlayerCharacter 
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white'
                        : 'bg-slate-700 text-white'
                      }
                      ${player.photo ? 'hidden' : ''}
                    `}>
                      {player.number}
                    </div>
                    
                    {/* Jméno a pozice */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold">{player.name}</h3>
                        {player.isPlayerCharacter && (
                          <Award size={16} className="text-yellow-400" />
                        )}
                      </div>
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
                <div className={`
                  w-20 h-20 rounded-xl flex items-center justify-center font-bold text-3xl
                  ${selectedPlayer.isPlayerCharacter 
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white'
                    : 'bg-slate-700 text-white'
                  }
                  ${selectedPlayer.photo ? 'hidden' : ''}
                `}>
                  {selectedPlayer.number}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-3xl font-bold text-white">{selectedPlayer.name}</h2>
                    {selectedPlayer.isPlayerCharacter && (
                      <Award size={24} className="text-yellow-400" />
                    )}
                  </div>
                  <p className="text-gray-400 text-lg">{selectedPlayer.position}</p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Základní info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Věk</div>
                <div className="text-white font-bold text-xl">{selectedPlayer.age} let</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Výška / Váha</div>
                <div className="text-white font-bold text-xl">{selectedPlayer.height} cm / {selectedPlayer.weight} kg</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Národnost</div>
                <div className="text-white font-bold text-xl">{selectedPlayer.nationality}</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">V týmu od</div>
                <div className="text-white font-bold text-xl">{selectedPlayer.joinedTeam}</div>
              </div>
              
              {/* Docházka */}
              {selectedPlayer.attributes?.attendance && (
                <div className="bg-slate-900/50 rounded-lg p-4 col-span-2">
                  <div className="text-gray-400 text-sm mb-2">Docházka na tréninky a zápasy</div>
                  <div className="flex items-center gap-4">
                    <div className={`text-3xl font-bold ${
                      selectedPlayer.attributes.attendance >= 80 ? 'text-green-400' :
                      selectedPlayer.attributes.attendance >= 60 ? 'text-yellow-400' :
                      selectedPlayer.attributes.attendance >= 40 ? 'text-orange-400' :
                      'text-red-400'
                    }`}>
                      {selectedPlayer.attributes.attendance}%
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-slate-700 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full ${
                            selectedPlayer.attributes.attendance >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                            selectedPlayer.attributes.attendance >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            selectedPlayer.attributes.attendance >= 40 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                            'bg-gradient-to-r from-red-500 to-red-700'
                          }`}
                          style={{ width: `${selectedPlayer.attributes.attendance}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedPlayer.attributes.attendance >= 80 ? '✅ Vynikající' :
                         selectedPlayer.attributes.attendance >= 60 ? '👍 Dobrá' :
                         selectedPlayer.attributes.attendance >= 40 ? '⚠️ Průměrná' :
                         '❌ Špatná'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Popis */}
            {selectedPlayer.description && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-blue-200 text-sm">{selectedPlayer.description}</p>
              </div>
            )}

            {/* Atributy */}
            {selectedPlayer.attributes && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={20} />
                  Atributy hráče
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(selectedPlayer.attributes).map(([key, value]) => (
                    typeof value === 'number' && key !== 'attendance' && (
                      <div key={key} className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1 capitalize">
                          {translateAttribute(key)}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-blue-400">{value}</div>
                          <div className="flex-1 bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                              style={{ width: `${value * 10}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  ))}
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
  // SPECIÁLNÍ HRÁČI S KONKRÉTNÍMI HODNOTAMI
  
  // Marian Dlugopolský - nejhorší hráč (všude 1)
  if (player.name === 'Marian Dlugopolský') {
    return {
      speed: 1,
      acceleration: 1,
      skatingTechnique: 1, // ⛸️ NOVÉ!
      braking: 8, // 🛑 NOVÉ!
      stability: 1, // ⚖️ NOVÉ!
      stamina: 1,
      strength: 1,
      shooting: 1,
      passing: 1,
      puckControl: 1,
      stealing: 1,
      checking: 1,
      attendance: 45 // Nízká docházka
    };
  }
  
  // Roman Šimek - NEJLEPŠÍ HRÁČ! (Kapitán, hvězda týmu)
  if (player.name === 'Roman Šimek') {
    return {
      speed: 7,
      acceleration: 7,
      skatingTechnique: 7, // ⛸️ NOVÉ!
      braking: 5, // 🛑 NOVÉ!
      stability: 7, // ⚖️ NOVÉ!
      stamina: 7,
      strength: 7,
      shooting: 7,
      passing: 7,
      puckControl: 7,
      stealing: 6,
      checking: 7,
      attendance: 95 // Vysoká docházka
    };
  }
  
  // Michaela Nováková - NEJLEPŠÍ BRANKÁŘKA!
  if (player.name === 'Michaela Nováková') {
    return {
      speed: 3,
      acceleration: 3,
      skatingTechnique: 3, // ⛸️ NOVÉ!
      braking: 7, // 🛑 NOVÉ!
      stability: 4, // ⚖️ NOVÉ!
      stamina: 6,
      strength: 4,
      reflexes: 7,
      positioning: 7,
      glove: 7,
      blocker: 7,
      attendance: 90
    };
  }
  
  // Vlastimil Nistor - NEJLEPŠÍ BRANKÁŘ!
  if (player.name === 'Vlastimil Nistor') {
    return {
      speed: 3,
      acceleration: 3,
      skatingTechnique: 3, // ⛸️ NOVÉ!
      braking: 7, // 🛑 NOVÉ!
      stability: 5, // ⚖️ NOVÉ!
      stamina: 7,
      strength: 5,
      reflexes: 7,
      positioning: 7,
      glove: 7,
      blocker: 7,
      attendance: 85
    };
  }

  // BRANKÁŘI - různorodé atributy
  if (player.category === 'goalies') {
    const attendance = 60 + Math.floor(Math.random() * 30); // 60-90%
    
    // Slabší brankáři
    return {
      speed: 2 + Math.floor(Math.random() * 2), // 2-3
      acceleration: 2 + Math.floor(Math.random() * 2), // 2-3
      stamina: 4 + Math.floor(Math.random() * 2), // 4-5
      strength: 3 + Math.floor(Math.random() * 2), // 3-4
      reflexes: 4 + Math.floor(Math.random() * 3), // 4-6
      positioning: 4 + Math.floor(Math.random() * 3), // 4-6
      glove: 4 + Math.floor(Math.random() * 2), // 4-5
      blocker: 4 + Math.floor(Math.random() * 2), // 4-5
      attendance
    };
  }

  // OBRÁNCI - rozmanité styly
  if (player.category === 'defenders') {
    const attendance = 50 + Math.floor(Math.random() * 45); // 50-95%
    
    // Ofenzivní obránci (např. Jan Hanuš)
    if (player.description.includes('Ofenzivní') || player.description.includes('střelou')) {
      return {
        speed: 4 + Math.floor(Math.random() * 2), // 4-5
        acceleration: 4 + Math.floor(Math.random() * 2),
      skatingTechnique: 4 + Math.floor(Math.random() * 2), // ⛸️ NOVÉ!
      braking: 3 + Math.floor(Math.random() * 2), // 🛑 NOVÉ!
      stability: 4 + Math.floor(Math.random() * 2), // ⚖️ NOVÉ!
        stamina: 5 + Math.floor(Math.random() * 2),
        strength: 4 + Math.floor(Math.random() * 2),
        shooting: 6 + Math.floor(Math.random() * 2), // Silná stránka
        passing: 5 + Math.floor(Math.random() * 2),
        puckControl: 5 + Math.floor(Math.random() * 2),
        stealing: 3 + Math.floor(Math.random() * 2), // Slabší
        checking: 4 + Math.floor(Math.random() * 2),
        attendance
      };
    }
    
    // Defenzivní obránci (např. Oliver Štěpanovský)
    if (player.description.includes('defenzivní') || player.description.includes('Tvrdý')) {
      return {
        speed: 3 + Math.floor(Math.random() * 2),
        acceleration: 3 + Math.floor(Math.random() * 2),
      skatingTechnique: 3 + Math.floor(Math.random() * 2), // ⛸️ NOVÉ!
      braking: 4 + Math.floor(Math.random() * 2), // 🛑 NOVÉ!
      stability: 6 + Math.floor(Math.random() * 2), // ⚖️ NOVÉ!
        stamina: 6 + Math.floor(Math.random() * 2),
        strength: 6 + Math.floor(Math.random() * 2), // Silná stránka
        shooting: 3 + Math.floor(Math.random() * 2), // Slabší
        passing: 4 + Math.floor(Math.random() * 2),
        puckControl: 4 + Math.floor(Math.random() * 2),
        stealing: 5 + Math.floor(Math.random() * 2),
        checking: 6 + Math.floor(Math.random() * 2), // Silná stránka
        attendance
      };
    }
    
    // Veteráni - vyrovnaní, ale pomalejší
    if (player.age >= 40) {
      return {
        speed: 2 + Math.floor(Math.random() * 2), // Pomalejší
        acceleration: 2 + Math.floor(Math.random() * 2),
      skatingTechnique: 2 + Math.floor(Math.random() * 2), // ⛸️ NOVÉ!
      braking: 5 + Math.floor(Math.random() * 2), // 🛑 NOVÉ!
      stability: 5 + Math.floor(Math.random() * 2), // ⚖️ NOVÉ!
        stamina: 4 + Math.floor(Math.random() * 2),
        strength: 5 + Math.floor(Math.random() * 2),
        shooting: 4 + Math.floor(Math.random() * 2),
        passing: 5 + Math.floor(Math.random() * 3), // Zkušenost
        puckControl: 5 + Math.floor(Math.random() * 2),
        stealing: 4 + Math.floor(Math.random() * 2),
        checking: 5 + Math.floor(Math.random() * 2),
        attendance: 40 + Math.floor(Math.random() * 30) // Nižší docházka
      };
    }
    
    // Běžní obránci
    return {
      speed: 3 + Math.floor(Math.random() * 3), // 3-5
      acceleration: 3 + Math.floor(Math.random() * 3),
      skatingTechnique: 3 + Math.floor(Math.random() * 2), // ⛸️ NOVÉ!
      braking: 4 + Math.floor(Math.random() * 2), // 🛑 NOVÉ!
      stability: 4 + Math.floor(Math.random() * 3), // ⚖️ NOVÉ!
      stamina: 4 + Math.floor(Math.random() * 3),
      strength: 4 + Math.floor(Math.random() * 3),
      shooting: 3 + Math.floor(Math.random() * 3),
      passing: 4 + Math.floor(Math.random() * 3),
      puckControl: 4 + Math.floor(Math.random() * 3),
      stealing: 4 + Math.floor(Math.random() * 3),
      checking: 5 + Math.floor(Math.random() * 3), // Trochu lepší
      attendance
    };
  }

  // ÚTOČNÍCI - různé styly hry
  if (player.category === 'forwards') {
    const attendance = 50 + Math.floor(Math.random() * 45); // 50-95%
    
    // Hvězdy týmu (Vašek Materna, Stanislav Švarc)
    if (player.description.includes('Nejlepší střelec') || player.description.includes('Produktivní')) {
      return {
        speed: 5 + Math.floor(Math.random() * 2), // 5-6
        acceleration: 5 + Math.floor(Math.random() * 2),
      skatingTechnique: 5 + Math.floor(Math.random() * 2), // ⛸️ NOVÉ!
      braking: 2 + Math.floor(Math.random() * 2), // 🛑 NOVÉ!
      stability: 4 + Math.floor(Math.random() * 2), // ⚖️ NOVÉ!
        stamina: 5 + Math.floor(Math.random() * 2),
        strength: 4 + Math.floor(Math.random() * 2),
        shooting: 6 + Math.floor(Math.random() * 2), // 6-7
        passing: 5 + Math.floor(Math.random() * 2),
        puckControl: 6 + Math.floor(Math.random() * 2),
        stealing: 4 + Math.floor(Math.random() * 2),
        checking: 3 + Math.floor(Math.random() * 2),
        attendance: 75 + Math.floor(Math.random() * 20) // Vyšší
      };
    }
    
    // Rychlí útočníci
    if (player.description.includes('Rychlý') || player.description.includes('rychlé křídlo')) {
      return {
        speed: 6 + Math.floor(Math.random() * 2), // Silná stránka
        acceleration: 6 + Math.floor(Math.random() * 2),
      skatingTechnique: 6 + Math.floor(Math.random() * 2), // ⛸️ NOVÉ!
      braking: 2 + Math.floor(Math.random() * 2), // 🛑 NOVÉ!
      stability: 3 + Math.floor(Math.random() * 2), // ⚖️ NOVÉ!
        stamina: 5 + Math.floor(Math.random() * 2),
        strength: 3 + Math.floor(Math.random() * 2), // Slabší
        shooting: 4 + Math.floor(Math.random() * 2),
        passing: 4 + Math.floor(Math.random() * 2),
        puckControl: 5 + Math.floor(Math.random() * 2),
        stealing: 4 + Math.floor(Math.random() * 2),
        checking: 3 + Math.floor(Math.random() * 2), // Slabší
        attendance
      };
    }
    
    // Siloví útočníci
    if (player.description.includes('Silový') || player.description.includes('Bojovník')) {
      return {
        speed: 3 + Math.floor(Math.random() * 2), // Pomalejší
        acceleration: 3 + Math.floor(Math.random() * 2),
      skatingTechnique: 3 + Math.floor(Math.random() * 2), // ⛸️ NOVÉ!
      braking: 4 + Math.floor(Math.random() * 2), // 🛑 NOVÉ!
      stability: 6 + Math.floor(Math.random() * 2), // ⚖️ NOVÉ!
        stamina: 6 + Math.floor(Math.random() * 2),
        strength: 6 + Math.floor(Math.random() * 2), // Silná stránka
        shooting: 4 + Math.floor(Math.random() * 2),
        passing: 3 + Math.floor(Math.random() * 2),
        puckControl: 4 + Math.floor(Math.random() * 2),
        stealing: 4 + Math.floor(Math.random() * 2),
        checking: 6 + Math.floor(Math.random() * 2), // Silná stránka
        attendance
      };
    }
    
    // Veteráni - starší útočníci
    if (player.age >= 35) {
      return {
        speed: 3 + Math.floor(Math.random() * 2),
        acceleration: 3 + Math.floor(Math.random() * 2),
      skatingTechnique: 3 + Math.floor(Math.random() * 2), // ⛸️ NOVÉ!
      braking: 4 + Math.floor(Math.random() * 2), // 🛑 NOVÉ!
      stability: 4 + Math.floor(Math.random() * 2), // ⚖️ NOVÉ!
        stamina: 4 + Math.floor(Math.random() * 2),
        strength: 4 + Math.floor(Math.random() * 2),
        shooting: 4 + Math.floor(Math.random() * 3),
        passing: 5 + Math.floor(Math.random() * 3), // Zkušenost
        puckControl: 5 + Math.floor(Math.random() * 2),
        stealing: 4 + Math.floor(Math.random() * 2),
        checking: 4 + Math.floor(Math.random() * 2),
        attendance: 40 + Math.floor(Math.random() * 35)
      };
    }
    
    // Mladí talenti
    if (player.age <= 23) {
      return {
        speed: 5 + Math.floor(Math.random() * 2),
        acceleration: 5 + Math.floor(Math.random() * 2),
      skatingTechnique: 5 + Math.floor(Math.random() * 2), // ⛸️ NOVÉ!
      braking: 2 + Math.floor(Math.random() * 2), // 🛑 NOVÉ!
      stability: 3 + Math.floor(Math.random() * 2), // ⚖️ NOVÉ!
        stamina: 6 + Math.floor(Math.random() * 2), // Dobrá kondice
        strength: 3 + Math.floor(Math.random() * 2), // Ještě se vyvíjí
        shooting: 4 + Math.floor(Math.random() * 2),
        passing: 4 + Math.floor(Math.random() * 2),
        puckControl: 5 + Math.floor(Math.random() * 2),
        stealing: 4 + Math.floor(Math.random() * 2),
        checking: 3 + Math.floor(Math.random() * 2),
        attendance: 70 + Math.floor(Math.random() * 25) // Mladí jsou pilní
      };
    }
    
    // Běžní útočníci
    return {
      speed: 4 + Math.floor(Math.random() * 3), // 4-6
      acceleration: 4 + Math.floor(Math.random() * 3),
      skatingTechnique: 4 + Math.floor(Math.random() * 2), // ⛸️ NOVÉ!
      braking: 3 + Math.floor(Math.random() * 2), // 🛑 NOVÉ!
      stability: 4 + Math.floor(Math.random() * 3), // ⚖️ NOVÉ!
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

  // HOSTÉ - průměrní hráči
  if (player.category === 'guests') {
    const attendance = 30 + Math.floor(Math.random() * 40); // 30-70% (nepravidelní)
    return {
      speed: 4 + Math.floor(Math.random() * 2),
      acceleration: 4 + Math.floor(Math.random() * 2),
      skatingTechnique: 4 + Math.floor(Math.random() * 2), // ⛸️ NOVÉ!
      braking: 3 + Math.floor(Math.random() * 2), // 🛑 NOVÉ!
      stability: 4 + Math.floor(Math.random() * 2), // ⚖️ NOVÉ!
      stamina: 4 + Math.floor(Math.random() * 2),
      strength: 4 + Math.floor(Math.random() * 2),
      shooting: 4 + Math.floor(Math.random() * 2),
      passing: 4 + Math.floor(Math.random() * 2),
      puckControl: 4 + Math.floor(Math.random() * 2),
      stealing: 4 + Math.floor(Math.random() * 2),
      checking: 4 + Math.floor(Math.random() * 2),
      attendance
    };
  }

  // Výchozí
  const attendance = 50 + Math.floor(Math.random() * 40);
  return {
    speed: 4,
    acceleration: 4,
      skatingTechnique: 4, // ⛸️ NOVÉ!
      braking: 6, // 🛑 NOVÉ!
      stability: 4, // ⚖️ NOVÉ!
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
    .filter(([key, value]) => typeof value === 'number' && key !== 'attendance') // Vynechat docházku
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
    skatingTechnique: 'Technika bruslení', // ⛸️ NOVÉ!
    braking: 'Brzdění', // 🛑 NOVÉ!
    stability: 'Stabilita', // ⚖️ NOVÉ!
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
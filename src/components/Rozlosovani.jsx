import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Calendar, MapPin, Clock, ChevronRight, Star, Award } from 'lucide-react';
import PlayerHeaderBar from './PlayerHeaderBar';

export default function Rozlosovani() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('zakladni');
  const [selectedRound, setSelectedRound] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);

  // Definice všech týmů
  const teams = {
    lancers: { name: 'Litvínov Lancers', logo: '/Images/Loga/LancersWhite.png', emoji: '🐎', isPlayer: true, homeStadium: 'Litvínov', homeDay: 'neděle', homeTime: '20:00' },
    chomutov: { name: 'Buldoci Chomutov', emoji: '🐕', isPlayer: false, homeStadium: 'Chomutov', homeDay: 'sobota', homeTime: '19:00' },
    most: { name: 'Krysáci Most', emoji: '🐀', isPlayer: false, homeStadium: 'Most', homeDay: 'pátek', homeTime: '19:00' },
    teplice: { name: 'Sevečani Teplice', emoji: '🧊', isPlayer: false, homeStadium: 'Teplice', homeDay: 'pátek/neděle', homeTime: '20:45/20:00' },
    bilina: { name: 'Zeleňáči Bílina', emoji: '🟢', isPlayer: false, homeStadium: 'Bílina', homeDay: 'sobota', homeTime: '20:00' },
    litvinov_oboj: { name: 'Obojživelníci Litvínov', emoji: '🐸', isPlayer: false, homeStadium: 'Litvínov', homeDay: 'neděle', homeTime: '20:00' },
    duchcov: { name: 'Mazáci Duchcov', emoji: '🦊', isPlayer: false, homeStadium: 'Teplice', homeDay: 'pátek', homeTime: '20:45' },
    louny: { name: 'Brejlouni Louny', emoji: '👓', isPlayer: false, homeStadium: 'Most', homeDay: 'pátek', homeTime: '19:00' }
  };

  // Mapování stadionů na názvy arén
  const stadiumNames = {
    'Litvínov': 'Litvínov Arena',
    'Chomutov': 'Chomutovská hala',
    'Most': 'Mostecký stadion',
    'Teplice': 'Teplická aréna',
    'Bílina': 'Aréna Bílina'
  };

  // ZÁKLADNÍ ČÁST - 14 kol (každý s každým 2x)
  const zakladniCast = [
    {
      round: 1,
      date: '6. září 2024',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'teplice', away: 'chomutov', time: '20:45', venue: 'Teplická aréna' },
        { home: 'most', away: 'louny', time: '19:00', venue: 'Mostecký stadion' }
      ]
    },
    {
      round: 2,
      date: '7. září 2024',
      dayOfWeek: 'sobota',
      matches: [
        { home: 'chomutov', away: 'bilina', time: '19:00', venue: 'Chomutovská hala' },
        { home: 'bilina', away: 'litvinov_oboj', time: '20:00', venue: 'Aréna Bílina' }
      ]
    },
    {
      round: 3,
      date: '8. září 2024',
      dayOfWeek: 'neděle',
      matches: [
        { home: 'lancers', away: 'most', time: '20:00', venue: 'Litvínov Arena' },
        { home: 'litvinov_oboj', away: 'duchcov', time: '20:00', venue: 'Litvínov Arena' }
      ]
    },
    {
      round: 4,
      date: '13. září 2024',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'teplice', away: 'louny', time: '20:45', venue: 'Teplická aréna' },
        { home: 'duchcov', away: 'lancers', time: '20:45', venue: 'Teplická aréna' }
      ]
    },
    {
      round: 5,
      date: '14. září 2024',
      dayOfWeek: 'sobota',
      matches: [
        { home: 'bilina', away: 'chomutov', time: '20:00', venue: 'Aréna Bílina' }
      ]
    },
    {
      round: 6,
      date: '15. září 2024',
      dayOfWeek: 'neděle',
      matches: [
        { home: 'litvinov_oboj', away: 'teplice', time: '20:00', venue: 'Litvínov Arena' },
        { home: 'lancers', away: 'louny', time: '20:00', venue: 'Litvínov Arena' }
      ]
    },
    {
      round: 7,
      date: '20. září 2024',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'most', away: 'duchcov', time: '19:00', venue: 'Mostecký stadion' }
      ]
    },
    {
      round: 8,
      date: '21. září 2024',
      dayOfWeek: 'sobota',
      matches: [
        { home: 'chomutov', away: 'litvinov_oboj', time: '19:00', venue: 'Chomutovská hala' },
        { home: 'bilina', away: 'teplice', time: '20:00', venue: 'Aréna Bílina' }
      ]
    },
    {
      round: 9,
      date: '22. září 2024',
      dayOfWeek: 'neděle',
      matches: [
        { home: 'lancers', away: 'chomutov', time: '20:00', venue: 'Litvínov Arena' }
      ]
    },
    {
      round: 10,
      date: '27. září 2024',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'most', away: 'bilina', time: '19:00', venue: 'Mostecký stadion' },
        { home: 'louny', away: 'duchcov', time: '19:00', venue: 'Mostecký stadion' }
      ]
    },
    {
      round: 11,
      date: '28. září 2024',
      dayOfWeek: 'sobota',
      matches: [
        { home: 'chomutov', away: 'teplice', time: '19:00', venue: 'Chomutovská hala' }
      ]
    },
    {
      round: 12,
      date: '29. září 2024',
      dayOfWeek: 'neděle',
      matches: [
        { home: 'lancers', away: 'litvinov_oboj', time: '20:00', venue: 'Litvínov Arena' },
        { home: 'teplice', away: 'most', time: '20:00', venue: 'Teplická aréna' }
      ]
    },
    {
      round: 13,
      date: '4. října 2024',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'duchcov', away: 'bilina', time: '20:45', venue: 'Teplická aréna' }
      ]
    },
    {
      round: 14,
      date: '5. října 2024',
      dayOfWeek: 'sobota',
      matches: [
        { home: 'chomutov', away: 'louny', time: '19:00', venue: 'Chomutovská hala' },
        { home: 'bilina', away: 'lancers', time: '20:00', venue: 'Aréna Bílina' }
      ]
    },
    // Pokračování základní části - odvety
    {
      round: 15,
      date: '6. října 2024',
      dayOfWeek: 'neděle',
      matches: [
        { home: 'litvinov_oboj', away: 'chomutov', time: '20:00', venue: 'Litvínov Arena' }
      ]
    },
    {
      round: 16,
      date: '11. října 2024',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'most', away: 'teplice', time: '19:00', venue: 'Mostecký stadion' },
        { home: 'louny', away: 'bilina', time: '19:00', venue: 'Mostecký stadion' }
      ]
    },
    {
      round: 17,
      date: '12. října 2024',
      dayOfWeek: 'sobota',
      matches: [
        { home: 'chomutov', away: 'duchcov', time: '19:00', venue: 'Chomutovská hala' }
      ]
    },
    {
      round: 18,
      date: '13. října 2024',
      dayOfWeek: 'neděle',
      matches: [
        { home: 'lancers', away: 'teplice', time: '20:00', venue: 'Litvínov Arena' },
        { home: 'litvinov_oboj', away: 'louny', time: '20:00', venue: 'Litvínov Arena' }
      ]
    },
    {
      round: 19,
      date: '18. října 2024',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'teplice', away: 'bilina', time: '20:45', venue: 'Teplická aréna' },
        { home: 'duchcov', away: 'most', time: '20:45', venue: 'Teplická aréna' }
      ]
    },
    {
      round: 20,
      date: '19. října 2024',
      dayOfWeek: 'sobota',
      matches: [
        { home: 'chomutov', away: 'lancers', time: '19:00', venue: 'Chomutovská hala' }
      ]
    },
    {
      round: 21,
      date: '20. října 2024',
      dayOfWeek: 'neděle',
      matches: [
        { home: 'litvinov_oboj', away: 'bilina', time: '20:00', venue: 'Litvínov Arena' }
      ]
    },
    {
      round: 22,
      date: '25. října 2024',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'louny', away: 'teplice', time: '19:00', venue: 'Mostecký stadion' },
        { home: 'most', away: 'chomutov', time: '19:00', venue: 'Mostecký stadion' }
      ]
    },
    {
      round: 23,
      date: '26. října 2024',
      dayOfWeek: 'sobota',
      matches: [
        { home: 'bilina', away: 'duchcov', time: '20:00', venue: 'Aréna Bílina' }
      ]
    },
    {
      round: 24,
      date: '27. října 2024',
      dayOfWeek: 'neděle',
      matches: [
        { home: 'lancers', away: 'bilina', time: '20:00', venue: 'Litvínov Arena' },
        { home: 'litvinov_oboj', away: 'most', time: '20:00', venue: 'Litvínov Arena' }
      ]
    },
    {
      round: 25,
      date: '1. listopadu 2024',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'teplice', away: 'duchcov', time: '20:45', venue: 'Teplická aréna' }
      ]
    },
    {
      round: 26,
      date: '2. listopadu 2024',
      dayOfWeek: 'sobota',
      matches: [
        { home: 'chomutov', away: 'most', time: '19:00', venue: 'Chomutovská hala' },
        { home: 'bilina', away: 'louny', time: '20:00', venue: 'Aréna Bílina' }
      ]
    },
    {
      round: 27,
      date: '3. listopadu 2024',
      dayOfWeek: 'neděle',
      matches: [
        { home: 'lancers', away: 'duchcov', time: '20:00', venue: 'Litvínov Arena' }
      ]
    },
    {
      round: 28,
      date: '8. listopadu 2024',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'louny', away: 'lancers', time: '19:00', venue: 'Mostecký stadion' }
      ]
    }
  ];

  // NADSTAVBA - TOP 4 (po základní části se určí podle tabulky)
  const nadstavbaTop4 = [
    {
      round: 29,
      phase: 'Nadstavba TOP 4',
      date: '10. ledna 2025',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'TBD1', away: 'TBD4', time: 'TBD', venue: 'TBD', description: '1. vs 4. místo' },
        { home: 'TBD2', away: 'TBD3', time: 'TBD', venue: 'TBD', description: '2. vs 3. místo' }
      ]
    },
    {
      round: 30,
      phase: 'Nadstavba TOP 4',
      date: '17. ledna 2025',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'TBD3', away: 'TBD4', time: 'TBD', venue: 'TBD', description: '3. vs 4. místo' }
      ]
    },
    {
      round: 31,
      phase: 'Nadstavba TOP 4',
      date: '18. ledna 2025',
      dayOfWeek: 'sobota',
      matches: [
        { home: 'TBD1', away: 'TBD2', time: 'TBD', venue: 'TBD', description: '1. vs 2. místo' }
      ]
    },
    {
      round: 32,
      phase: 'Nadstavba TOP 4',
      date: '24. ledna 2025',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'TBD4', away: 'TBD1', time: 'TBD', venue: 'TBD', description: '4. vs 1. místo - odveta' },
        { home: 'TBD3', away: 'TBD2', time: 'TBD', venue: 'TBD', description: '3. vs 2. místo - odveta' }
      ]
    },
    {
      round: 33,
      phase: 'Nadstavba TOP 4',
      date: '31. ledna 2025',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'TBD4', away: 'TBD3', time: 'TBD', venue: 'TBD', description: '4. vs 3. místo - odveta' }
      ]
    },
    {
      round: 34,
      phase: 'Nadstavba TOP 4',
      date: '1. února 2025',
      dayOfWeek: 'sobota',
      matches: [
        { home: 'TBD2', away: 'TBD1', time: 'TBD', venue: 'TBD', description: '2. vs 1. místo - odveta' }
      ]
    }
  ];

  // NADSTAVBA - BOTTOM 4
  const nadstavbaBottom4 = [
    {
      round: 29,
      phase: 'Nadstavba BOTTOM 4',
      date: '10. ledna 2025',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'TBD5', away: 'TBD8', time: 'TBD', venue: 'TBD', description: '5. vs 8. místo' },
        { home: 'TBD6', away: 'TBD7', time: 'TBD', venue: 'TBD', description: '6. vs 7. místo' }
      ]
    },
    {
      round: 30,
      phase: 'Nadstavba BOTTOM 4',
      date: '17. ledna 2025',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'TBD7', away: 'TBD8', time: 'TBD', venue: 'TBD', description: '7. vs 8. místo' }
      ]
    },
    {
      round: 31,
      phase: 'Nadstavba BOTTOM 4',
      date: '18. ledna 2025',
      dayOfWeek: 'sobota',
      matches: [
        { home: 'TBD5', away: 'TBD6', time: 'TBD', venue: 'TBD', description: '5. vs 6. místo' }
      ]
    },
    {
      round: 32,
      phase: 'Nadstavba BOTTOM 4',
      date: '24. ledna 2025',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'TBD8', away: 'TBD5', time: 'TBD', venue: 'TBD', description: '8. vs 5. místo - odveta' },
        { home: 'TBD7', away: 'TBD6', time: 'TBD', venue: 'TBD', description: '7. vs 6. místo - odveta' }
      ]
    },
    {
      round: 33,
      phase: 'Nadstavba BOTTOM 4',
      date: '31. ledna 2025',
      dayOfWeek: 'pátek',
      matches: [
        { home: 'TBD8', away: 'TBD7', time: 'TBD', venue: 'TBD', description: '8. vs 7. místo - odveta' }
      ]
    },
    {
      round: 34,
      phase: 'Nadstavba BOTTOM 4',
      date: '1. února 2025',
      dayOfWeek: 'sobota',
      matches: [
        { home: 'TBD6', away: 'TBD5', time: 'TBD', venue: 'TBD', description: '6. vs 5. místo - odveta' }
      ]
    }
  ];

  // PLAY-OFF - Předkolo
  const playoffPredkolo = [
    {
      round: 'PO-1',
      phase: 'Předkolo Play-Off',
      series: '3. vs 6. místo',
      date: '7. února 2025',
      matches: [
        { home: 'TBD3', away: 'TBD6', time: 'TBD', venue: 'TBD', description: 'Zápas 1 - Doma vyšší nasazený (3.)' }
      ]
    },
    {
      round: 'PO-2',
      phase: 'Předkolo Play-Off',
      series: '4. vs 5. místo',
      date: '7. února 2025',
      matches: [
        { home: 'TBD4', away: 'TBD5', time: 'TBD', venue: 'TBD', description: 'Zápas 1 - Doma vyšší nasazený (4.)' }
      ]
    },
    {
      round: 'PO-3',
      phase: 'Předkolo Play-Off',
      series: '3. vs 6. místo',
      date: '14. února 2025',
      matches: [
        { home: 'TBD6', away: 'TBD3', time: 'TBD', venue: 'TBD', description: 'Zápas 2 - Venku' }
      ]
    },
    {
      round: 'PO-4',
      phase: 'Předkolo Play-Off',
      series: '4. vs 5. místo',
      date: '14. února 2025',
      matches: [
        { home: 'TBD5', away: 'TBD4', time: 'TBD', venue: 'TBD', description: 'Zápas 2 - Venku' }
      ]
    },
    {
      round: 'PO-5',
      phase: 'Předkolo Play-Off',
      series: '3. vs 6. místo',
      date: '21. února 2025',
      matches: [
        { home: 'TBD3', away: 'TBD6', time: 'TBD', venue: 'TBD', description: 'Zápas 3 - Rozhodující (pokud potřeba)' }
      ]
    },
    {
      round: 'PO-6',
      phase: 'Předkolo Play-Off',
      series: '4. vs 5. místo',
      date: '21. února 2025',
      matches: [
        { home: 'TBD4', away: 'TBD5', time: 'TBD', venue: 'TBD', description: 'Zápas 3 - Rozhodující (pokud potřeba)' }
      ]
    }
  ];

  // PLAY-OFF - Semifinále o titul
  const playoffSemifinaleTitle = [
    {
      round: 'SF-T1',
      phase: 'Semifinále o titul',
      series: '1. místo vs Vítěz 4-5',
      date: '28. února 2025',
      matches: [
        { home: 'TBD1', away: 'VIT45', time: 'TBD', venue: 'TBD', description: 'SF1 - Zápas 1' }
      ]
    },
    {
      round: 'SF-T2',
      phase: 'Semifinále o titul',
      series: '2. místo vs Vítěz 3-6',
      date: '28. února 2025',
      matches: [
        { home: 'TBD2', away: 'VIT36', time: 'TBD', venue: 'TBD', description: 'SF2 - Zápas 1' }
      ]
    },
    {
      round: 'SF-T3',
      phase: 'Semifinále o titul',
      series: '1. místo vs Vítěz 4-5',
      date: '7. března 2025',
      matches: [
        { home: 'VIT45', away: 'TBD1', time: 'TBD', venue: 'TBD', description: 'SF1 - Zápas 2' }
      ]
    },
    {
      round: 'SF-T4',
      phase: 'Semifinále o titul',
      series: '2. místo vs Vítěz 3-6',
      date: '7. března 2025',
      matches: [
        { home: 'VIT36', away: 'TBD2', time: 'TBD', venue: 'TBD', description: 'SF2 - Zápas 2' }
      ]
    },
    {
      round: 'SF-T5',
      phase: 'Semifinále o titul',
      series: 'Rozhodující zápasy',
      date: '14. března 2025',
      matches: [
        { home: 'TBD1', away: 'VIT45', time: 'TBD', venue: 'TBD', description: 'SF1 - Zápas 3 (pokud potřeba)' },
        { home: 'TBD2', away: 'VIT36', time: 'TBD', venue: 'TBD', description: 'SF2 - Zápas 3 (pokud potřeba)' }
      ]
    }
  ];

  // PLAY-OFF - Semifinále o 5-8 místo
  const playoffSemifinale58 = [
    {
      round: 'SF-58-1',
      phase: 'Semifinále o 5-8 místo',
      series: '7. vs Poražený předkola',
      date: '28. února 2025',
      matches: [
        { home: 'TBD7', away: 'POR-PK1', time: 'TBD', venue: 'TBD', description: 'SF-58A - Zápas 1' },
        { home: 'TBD8', away: 'POR-PK2', time: 'TBD', venue: 'TBD', description: 'SF-58B - Zápas 1' }
      ]
    },
    {
      round: 'SF-58-2',
      phase: 'Semifinále o 5-8 místo',
      series: 'Odvety',
      date: '7. března 2025',
      matches: [
        { home: 'POR-PK1', away: 'TBD7', time: 'TBD', venue: 'TBD', description: 'SF-58A - Zápas 2' },
        { home: 'POR-PK2', away: 'TBD8', time: 'TBD', venue: 'TBD', description: 'SF-58B - Zápas 2' }
      ]
    },
    {
      round: 'SF-58-3',
      phase: 'Semifinále o 5-8 místo',
      series: 'Rozhodující',
      date: '14. března 2025',
      matches: [
        { home: 'TBD7', away: 'POR-PK1', time: 'TBD', venue: 'TBD', description: 'SF-58A - Zápas 3 (pokud potřeba)' },
        { home: 'TBD8', away: 'POR-PK2', time: 'TBD', venue: 'TBD', description: 'SF-58B - Zápas 3 (pokud potřeba)' }
      ]
    }
  ];

  // FINÁLE a zápasy o umístění
  const finale = [
    {
      round: 'FIN-1',
      phase: 'FINÁLE o titul (1-2 místo)',
      date: '21. března 2025',
      matches: [
        { home: 'VIT-SF1', away: 'VIT-SF2', time: 'TBD', venue: 'TBD', description: 'FINÁLE - Zápas 1' }
      ]
    },
    {
      round: 'FIN-2',
      phase: 'FINÁLE o titul (1-2 místo)',
      date: '28. března 2025',
      matches: [
        { home: 'VIT-SF2', away: 'VIT-SF1', time: 'TBD', venue: 'TBD', description: 'FINÁLE - Zápas 2' }
      ]
    },
    {
      round: 'FIN-3',
      phase: 'FINÁLE o titul (1-2 místo)',
      date: '30. března 2025',
      matches: [
        { home: 'VIT-SF1', away: 'VIT-SF2', time: 'TBD', venue: 'TBD', description: 'FINÁLE - Zápas 3 (pokud potřeba)' }
      ]
    },
    {
      round: '3M-1',
      phase: 'O 3. místo',
      date: '21. března 2025',
      matches: [
        { home: 'POR-SF1', away: 'POR-SF2', time: 'TBD', venue: 'TBD', description: 'O 3. místo - Zápas 1' }
      ]
    },
    {
      round: '3M-2',
      phase: 'O 3. místo',
      date: '28. března 2025',
      matches: [
        { home: 'POR-SF2', away: 'POR-SF1', time: 'TBD', venue: 'TBD', description: 'O 3. místo - Zápas 2' }
      ]
    },
    {
      round: '3M-3',
      phase: 'O 3. místo',
      date: '30. března 2025',
      matches: [
        { home: 'POR-SF1', away: 'POR-SF2', time: 'TBD', venue: 'TBD', description: 'O 3. místo - Zápas 3 (pokud potřeba)' }
      ]
    },
    {
      round: '5M-1',
      phase: 'O 5. místo',
      date: '21. března 2025',
      matches: [
        { home: 'VIT-SF58A', away: 'VIT-SF58B', time: 'TBD', venue: 'TBD', description: 'O 5. místo - Zápas 1' }
      ]
    },
    {
      round: '5M-2',
      phase: 'O 5. místo',
      date: '28. března 2025',
      matches: [
        { home: 'VIT-SF58B', away: 'VIT-SF58A', time: 'TBD', venue: 'TBD', description: 'O 5. místo - Zápas 2' }
      ]
    },
    {
      round: '5M-3',
      phase: 'O 5. místo',
      date: '30. března 2025',
      matches: [
        { home: 'VIT-SF58A', away: 'VIT-SF58B', time: 'TBD', venue: 'TBD', description: 'O 5. místo - Zápas 3 (pokud potřeba)' }
      ]
    },
    {
      round: '7M-1',
      phase: 'O 7. místo',
      date: '21. března 2025',
      matches: [
        { home: 'POR-SF58A', away: 'POR-SF58B', time: 'TBD', venue: 'TBD', description: 'O 7. místo - Zápas 1' }
      ]
    },
    {
      round: '7M-2',
      phase: 'O 7. místo',
      date: '28. března 2025',
      matches: [
        { home: 'POR-SF58B', away: 'POR-SF58A', time: 'TBD', venue: 'TBD', description: 'O 7. místo - Zápas 2' }
      ]
    },
    {
      round: '7M-3',
      phase: 'O 7. místo',
      date: '30. března 2025',
      matches: [
        { home: 'POR-SF58A', away: 'POR-SF58B', time: 'TBD', venue: 'TBD', description: 'O 7. místo - Zápas 3 (pokud potřeba)' }
      ]
    }
  ];

  const isPlayerInMatch = (match) => {
    return match.home === 'lancers' || match.away === 'lancers';
  };

  const handleMatchClick = (match) => {
    // Kontrola jestli jsou týmy TBD nebo neexistují v teams objektu
    if (!match.home || !match.away || 
        match.home === 'TBD' || match.home.startsWith('TBD') || 
        match.home.startsWith('VIT') || match.home.startsWith('POR') ||
        match.away.startsWith('TBD') || match.away.startsWith('VIT') || match.away.startsWith('POR') ||
        !teams[match.home] || !teams[match.away]) {
      alert('⏳ Tento zápas se určí podle výsledků předchozích kol!');
      return;
    }
    
    if (isPlayerInMatch(match)) {
      alert(`🏒 Zápas ${teams[match.home].name} vs ${teams[match.away].name} - Připravujeme možnost hrát!`);
    } else {
      alert(`👀 Sledovat zápas ${teams[match.home].name} vs ${teams[match.away].name} - Funkce bude přidána!`);
    }
  };

  const renderMatchCard = (match, idx) => {
    // Kontrola jestli jsou týmy TBD nebo neexistují v teams objektu
    if (!match.home || !match.away || 
        match.home === 'TBD' || match.home.startsWith('TBD') || 
        match.home.startsWith('VIT') || match.home.startsWith('POR') ||
        match.away.startsWith('TBD') || match.away.startsWith('VIT') || match.away.startsWith('POR') ||
        !teams[match.home] || !teams[match.away]) {
      // TBD zápas
      return (
        <div key={idx} className="w-full bg-gradient-to-r from-gray-800/40 to-gray-700/40 border border-gray-600/50 rounded-xl p-5">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">⏳ Čeká se na určení týmů</div>
            <div className="text-gray-500 text-sm">{match.description}</div>
          </div>
        </div>
      );
    }

    const homeTeam = teams[match.home];
    const awayTeam = teams[match.away];
    const isPlayerMatch = isPlayerInMatch(match);

    return (
      <button
        key={idx}
        onClick={() => handleMatchClick(match)}
        className={`w-full bg-gradient-to-r rounded-xl p-5 transition-all duration-200 hover:scale-[1.02]
          ${isPlayerMatch 
            ? 'from-blue-900/40 to-blue-800/40 border-2 border-blue-500/50 hover:border-blue-400' 
            : 'from-slate-800/40 to-slate-700/40 border border-slate-600/50 hover:border-slate-500'
          }`}
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Domácí tým */}
          <div className="col-span-5 flex items-center justify-end gap-3">
            <div className="text-right">
              <div className={`font-bold text-lg ${homeTeam.isPlayer ? 'text-blue-300' : 'text-white'}`}>
                {homeTeam.name}
              </div>
              <div className="text-gray-400 text-sm flex items-center justify-end gap-1">
                <MapPin size={14} />
                <span>Doma</span>
              </div>
            </div>
            {homeTeam.logo ? (
              <img src={homeTeam.logo} alt={homeTeam.name} className="w-12 h-12 object-contain" />
            ) : (
              <div className="text-4xl">{homeTeam.emoji}</div>
            )}
          </div>

          {/* VS + Čas */}
          <div className="col-span-2 flex flex-col items-center justify-center">
            <div className="text-gray-400 font-bold text-2xl mb-1">VS</div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              <span>{match.time}</span>
            </div>
          </div>

          {/* Hostující tým */}
          <div className="col-span-5 flex items-center justify-start gap-3">
            {awayTeam.logo ? (
              <img src={awayTeam.logo} alt={awayTeam.name} className="w-12 h-12 object-contain" />
            ) : (
              <div className="text-4xl">{awayTeam.emoji}</div>
            )}
            <div className="text-left">
              <div className={`font-bold text-lg ${awayTeam.isPlayer ? 'text-blue-300' : 'text-white'}`}>
                {awayTeam.name}
              </div>
              <div className="text-gray-400 text-sm flex items-center gap-1">
                <MapPin size={14} />
                <span>Venku</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stadion */}
        <div className="mt-3 pt-3 border-t border-slate-600/30 text-center">
          <div className="text-gray-500 text-xs flex items-center justify-center gap-2">
            <span>🏟️</span>
            <span>{match.venue}</span>
          </div>
        </div>

        {/* Badge pro zápasy hráče */}
        {isPlayerMatch && (
          <div className="mt-3 text-center">
            <span className="inline-block bg-blue-500/20 text-blue-300 px-4 py-1 rounded-full text-xs font-bold border border-blue-500/30">
              ⭐ Tvůj zápas - Klikni pro hraní!
            </span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* HORNÍ LIŠTA */}
      <PlayerHeaderBar>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg border-2 border-blue-400 shadow-lg">
          <div className="text-sm text-blue-200">Tvůj tým</div>
          <div className="font-bold text-lg flex items-center gap-2">
            <img src="/Images/Loga/LancersWhite.png" alt="Lancers" className="w-6 h-6 object-contain" />
            Litvínov Lancers
          </div>
        </div>
      </PlayerHeaderBar>

      {/* NADPIS STRÁNKY */}
      <div className="bg-slate-900/50 border-b border-slate-700">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/league-table')}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Calendar className="text-orange-400" size={32} />
                ROZLOSOVÁNÍ FOFR LIGY
              </h1>
              <p className="text-gray-400 text-sm mt-1">Sezóna 2024/25 • Září - Březen</p>
            </div>
          </div>
        </div>
      </div>

      {/* OBSAH */}
      <div className="container mx-auto px-6 py-8">
        {/* NAVIGAČNÍ TLAČÍTKA */}
        {/* NAVIGAČNÍ TLAČÍTKA */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          <button
            onClick={() => { setActiveSection('zakladni'); setSelectedRound(1); }}
            className={`p-3 rounded-xl border-2 transition-all ${
              activeSection === 'zakladni'
                ? 'bg-green-600 border-green-400 text-white'
                : 'bg-slate-800/50 border-slate-700 text-gray-400 hover:border-slate-600'
            }`}
          >
            <div className="font-bold text-base">📊 ZÁKLADNÍ ČÁST</div>
            <div className="text-xs mt-1">28 kol</div>
          </button>

          <button
            onClick={() => { setActiveSection('nadstavba-top'); setSelectedRound(29); }}
            className={`p-3 rounded-xl border-2 transition-all ${
              activeSection === 'nadstavba-top'
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-slate-800/50 border-slate-700 text-gray-400 hover:border-slate-600'
            }`}
          >
            <div className="font-bold text-base">⭐ NADSTAVBA TOP</div>
            <div className="text-xs mt-1">6 kol</div>
          </button>

          <button
            onClick={() => { setActiveSection('nadstavba-bottom'); setSelectedRound(29); }}
            className={`p-3 rounded-xl border-2 transition-all ${
              activeSection === 'nadstavba-bottom'
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-slate-800/50 border-slate-700 text-gray-400 hover:border-slate-600'
            }`}
          >
            <div className="font-bold text-base">📉 NADSTAVBA BTM</div>
            <div className="text-xs mt-1">6 kol</div>
          </button>

          <button
            onClick={() => { setActiveSection('playoff'); setSelectedRound(1); }}
            className={`p-3 rounded-xl border-2 transition-all ${
              activeSection === 'playoff'
                ? 'bg-purple-600 border-purple-400 text-white'
                : 'bg-slate-800/50 border-slate-700 text-gray-400 hover:border-slate-600'
            }`}
          >
            <div className="font-bold text-base">🔥 PLAY-OFF</div>
            <div className="text-xs mt-1">14 zápasů</div>
          </button>

          <button
            onClick={() => { setActiveSection('finale'); setSelectedRound(1); }}
            className={`p-3 rounded-xl border-2 transition-all ${
              activeSection === 'finale'
                ? 'bg-yellow-600 border-yellow-400 text-white'
                : 'bg-slate-800/50 border-slate-700 text-gray-400 hover:border-slate-600'
            }`}
          >
            <div className="font-bold text-base">🏆 FINÁLE</div>
            <div className="text-xs mt-1">12 zápasů</div>
          </button>
        </div>

        {/* INFO TOOLTIP + KOLA */}
        <div className="mb-4">
          {/* Tooltip info */}
          <div className="relative inline-block mb-3">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white font-bold transition-all"
            >
              ℹ️
            </button>
            
            {showTooltip && (
              <div className="absolute left-0 top-10 z-50 w-96 bg-slate-800 border-2 border-blue-500 rounded-xl p-4 shadow-2xl">
                <h4 className="text-yellow-300 font-bold text-lg mb-2">🏆 Systém FOFR LIGY 2024/25</h4>
                <p className="text-gray-300 text-sm mb-3">Liga se skládá ze tří fází: Základní část, Nadstavba a Play-Off!</p>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-green-300 font-bold">📊 ZÁKLADNÍ ČÁST</div>
                    <div className="text-gray-400">28 kol • Každý s každým 2x</div>
                    <div className="text-gray-400">14 zápasů na tým</div>
                  </div>
                  
                  <div>
                    <div className="text-blue-300 font-bold">⚡ NADSTAVBA</div>
                    <div className="text-gray-400">TOP 4 vs TOP 4</div>
                    <div className="text-gray-400">BOTTOM 4 vs BOTTOM 4</div>
                    <div className="text-gray-400">6 zápasů na tým</div>
                  </div>
                  
                  <div>
                    <div className="text-yellow-300 font-bold">🏆 PLAY-OFF</div>
                    <div className="text-gray-400">Předkola • Semifinále</div>
                    <div className="text-gray-400">Finále o titul</div>
                    <div className="text-gray-400">Na 2 vítězné</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dynamická tlačítka podle sekce */}
          <div className="flex flex-wrap gap-2">
            {activeSection === 'zakladni' && Array.from({ length: 28 }, (_, i) => i + 1).map((round) => (
              <button
                key={round}
                onClick={() => setSelectedRound(round)}
                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                  selectedRound === round
                    ? 'bg-green-600 border-2 border-green-400 text-white scale-110'
                    : 'bg-slate-800 border border-slate-700 text-gray-400 hover:bg-slate-700 hover:border-slate-600'
                }`}
              >
                {round}
              </button>
            ))}
            
            {activeSection === 'nadstavba-top' && Array.from({ length: 6 }, (_, i) => i + 29).map((round) => (
              <button
                key={round}
                onClick={() => setSelectedRound(round)}
                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                  selectedRound === round
                    ? 'bg-blue-600 border-2 border-blue-400 text-white scale-110'
                    : 'bg-slate-800 border border-slate-700 text-gray-400 hover:bg-slate-700 hover:border-slate-600'
                }`}
              >
                {round}
              </button>
            ))}
            
            {activeSection === 'nadstavba-bottom' && Array.from({ length: 6 }, (_, i) => i + 29).map((round) => (
              <button
                key={round}
                onClick={() => setSelectedRound(round)}
                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                  selectedRound === round
                    ? 'bg-blue-600 border-2 border-blue-400 text-white scale-110'
                    : 'bg-slate-800 border border-slate-700 text-gray-400 hover:bg-slate-700 hover:border-slate-600'
                }`}
              >
                {round}
              </button>
            ))}
            
            {activeSection === 'playoff' && Array.from({ length: 14 }, (_, i) => i + 1).map((round) => (
              <button
                key={round}
                onClick={() => setSelectedRound(round)}
                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                  selectedRound === round
                    ? 'bg-purple-600 border-2 border-purple-400 text-white scale-110'
                    : 'bg-slate-800 border border-slate-700 text-gray-400 hover:bg-slate-700 hover:border-slate-600'
                }`}
              >
                {round}
              </button>
            ))}
            
            {activeSection === 'finale' && Array.from({ length: 12 }, (_, i) => i + 1).map((round) => (
              <button
                key={round}
                onClick={() => setSelectedRound(round)}
                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                  selectedRound === round
                    ? 'bg-yellow-600 border-2 border-yellow-400 text-white scale-110'
                    : 'bg-slate-800 border border-slate-700 text-gray-400 hover:bg-slate-700 hover:border-slate-600'
                }`}
              >
                {round}
              </button>
            ))}
          </div>
        </div>

        {/* ZOBRAZENÍ VYBRANÉHO KOLA/ZÁPASU */}
        <div>
          {/* ZÁKLADNÍ ČÁST */}
          {activeSection === 'zakladni' && (() => {
            const selectedRoundData = zakladniCast.find(r => r.round === selectedRound);
            if (!selectedRoundData) return null;
            return (
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border-2 border-green-600 overflow-hidden shadow-xl">
                <div className="bg-gradient-to-r from-green-700 to-green-800 border-b border-green-600 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/30 rounded-full flex items-center justify-center border-2 border-green-400">
                      <span className="text-white font-bold text-lg">{selectedRoundData.round}</span>
                    </div>
                    <div>
                      <div className="text-white font-bold text-xl">{selectedRoundData.round}. KOLO ZÁKLADNÍ ČÁSTI</div>
                      <div className="text-green-200 text-sm">📅 {selectedRoundData.date} • {selectedRoundData.dayOfWeek}</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {selectedRoundData.matches.map((match, idx) => renderMatchCard(match, idx))}
                </div>
              </div>
            );
          })()}

          {/* NADSTAVBA TOP 4 */}
          {activeSection === 'nadstavba-top' && (() => {
            const selectedRoundData = nadstavbaTop4.find(r => r.round === selectedRound);
            if (!selectedRoundData) return null;
            return (
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border-2 border-blue-600 overflow-hidden shadow-xl">
                <div className="bg-gradient-to-r from-blue-700 to-blue-800 border-b border-blue-600 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center border-2 border-blue-400">
                      <span className="text-white font-bold text-lg">{selectedRoundData.round}</span>
                    </div>
                    <div>
                      <div className="text-white font-bold text-xl">{selectedRoundData.round}. KOLO NADSTAVBY TOP 4</div>
                      <div className="text-blue-200 text-sm">📅 {selectedRoundData.date} • {selectedRoundData.dayOfWeek}</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {selectedRoundData.matches.map((match, idx) => renderMatchCard(match, idx))}
                </div>
              </div>
            );
          })()}

          {/* NADSTAVBA BOTTOM 4 */}
          {activeSection === 'nadstavba-bottom' && (() => {
            const selectedRoundData = nadstavbaBottom4.find(r => r.round === selectedRound);
            if (!selectedRoundData) return null;
            return (
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border-2 border-blue-600 overflow-hidden shadow-xl">
                <div className="bg-gradient-to-r from-blue-700 to-blue-800 border-b border-blue-600 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center border-2 border-blue-400">
                      <span className="text-white font-bold text-lg">{selectedRoundData.round}</span>
                    </div>
                    <div>
                      <div className="text-white font-bold text-xl">{selectedRoundData.round}. KOLO NADSTAVBY BOTTOM 4</div>
                      <div className="text-blue-200 text-sm">📅 {selectedRoundData.date} • {selectedRoundData.dayOfWeek}</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {selectedRoundData.matches.map((match, idx) => renderMatchCard(match, idx))}
                </div>
              </div>
            );
          })()}

          {/* PLAY-OFF */}
          {activeSection === 'playoff' && (() => {
            const allPlayoff = [...playoffPredkolo, ...playoffSemifinaleTitle, ...playoffSemifinale58];
            const selectedRoundData = allPlayoff[selectedRound - 1];
            if (!selectedRoundData) return null;
            return (
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border-2 border-purple-600 overflow-hidden shadow-xl">
                <div className="bg-gradient-to-r from-purple-700 to-purple-800 border-b border-purple-600 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/30 rounded-full flex items-center justify-center border-2 border-purple-400">
                      <span className="text-white font-bold text-lg">{selectedRound}</span>
                    </div>
                    <div>
                      <div className="text-white font-bold text-xl">{selectedRoundData.phase}</div>
                      <div className="text-purple-200 text-sm">📅 {selectedRoundData.date}</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {selectedRoundData.matches.map((match, idx) => renderMatchCard(match, idx))}
                </div>
              </div>
            );
          })()}

          {/* FINÁLE */}
          {activeSection === 'finale' && (() => {
            const selectedRoundData = finale[selectedRound - 1];
            if (!selectedRoundData) return null;
            return (
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border-2 border-yellow-600 overflow-hidden shadow-xl">
                <div className="bg-gradient-to-r from-yellow-700 to-orange-800 border-b border-yellow-600 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/30 rounded-full flex items-center justify-center border-2 border-yellow-400">
                      <span className="text-white font-bold text-lg">{selectedRound}</span>
                    </div>
                    <div>
                      <div className="text-white font-bold text-xl">{selectedRoundData.phase}</div>
                      <div className="text-yellow-200 text-sm">📅 {selectedRoundData.date}</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {selectedRoundData.matches.map((match, idx) => renderMatchCard(match, idx))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

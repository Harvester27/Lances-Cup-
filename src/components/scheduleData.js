// scheduleData.js - Centrální rozlosování FOFR LIGY 2024/25

// Definice všech týmů
export const teams = {
  lancers: { name: 'Litvínov Lancers', logo: '/Images/Loga/LancersWhite.png', emoji: '🐎', homeStadium: 'Litvínov', homeDay: 'neděle', homeTime: '20:00' },
  chomutov: { name: 'Buldoci Chomutov', emoji: '🐕', homeStadium: 'Chomutov', homeDay: 'sobota', homeTime: '19:00' },
  most: { name: 'Krysáci Most', emoji: '🐀', homeStadium: 'Most', homeDay: 'pátek', homeTime: '19:00' },
  teplice: { name: 'Sevečani Teplice', emoji: '🧊', homeStadium: 'Teplice', homeDay: 'pátek/neděle', homeTime: '20:45/20:00' },
  bilina: { name: 'Zeleňáči Bílina', emoji: '🟢', homeStadium: 'Bílina', homeDay: 'sobota', homeTime: '20:00' },
  litvinov_oboj: { name: 'Obojživelníci Litvínov', emoji: '🐸', homeStadium: 'Litvínov', homeDay: 'neděle', homeTime: '20:00' },
  duchcov: { name: 'Mazáci Duchcov', emoji: '🦊', homeStadium: 'Teplice', homeDay: 'pátek', homeTime: '20:45' },
  louny: { name: 'Brejlouni Louny', emoji: '👓', homeStadium: 'Most', homeDay: 'pátek', homeTime: '19:00' }
};

// Mapování stadionů
export const stadiumNames = {
  'Litvínov': 'Litvínov Arena',
  'Chomutov': 'Chomutovská hala',
  'Most': 'Mostecký stadion',
  'Teplice': 'Teplická aréna',
  'Bílina': 'Aréna Bílina'
};

// ZÁKLADNÍ ČÁST - 28 kol
export const zakladniCast = [
  {
    round: 1,
    date: '6. září 2024',
    dayOfWeek: 'pátek',
    matches: [
      { id: 'z1-1', home: 'teplice', away: 'chomutov', time: '20:45', venue: 'Teplická aréna' },
      { id: 'z1-2', home: 'most', away: 'louny', time: '19:00', venue: 'Mostecký stadion' }
    ]
  },
  {
    round: 2,
    date: '7. září 2024',
    dayOfWeek: 'sobota',
    matches: [
      { id: 'z2-1', home: 'chomutov', away: 'bilina', time: '19:00', venue: 'Chomutovská hala' },
      { id: 'z2-2', home: 'bilina', away: 'litvinov_oboj', time: '20:00', venue: 'Aréna Bílina' }
    ]
  },
  {
    round: 3,
    date: '8. září 2024',
    dayOfWeek: 'neděle',
    matches: [
      { id: 'z3-1', home: 'lancers', away: 'most', time: '20:00', venue: 'Litvínov Arena' },
      { id: 'z3-2', home: 'litvinov_oboj', away: 'duchcov', time: '20:00', venue: 'Litvínov Arena' }
    ]
  },
  {
    round: 4,
    date: '13. září 2024',
    dayOfWeek: 'pátek',
    matches: [
      { id: 'z4-1', home: 'teplice', away: 'louny', time: '20:45', venue: 'Teplická aréna' },
      { id: 'z4-2', home: 'duchcov', away: 'lancers', time: '20:45', venue: 'Teplická aréna' }
    ]
  },
  {
    round: 5,
    date: '14. září 2024',
    dayOfWeek: 'sobota',
    matches: [
      { id: 'z5-1', home: 'bilina', away: 'chomutov', time: '20:00', venue: 'Aréna Bílina' }
    ]
  },
  {
    round: 6,
    date: '15. září 2024',
    dayOfWeek: 'neděle',
    matches: [
      { id: 'z6-1', home: 'litvinov_oboj', away: 'teplice', time: '20:00', venue: 'Litvínov Arena' },
      { id: 'z6-2', home: 'lancers', away: 'louny', time: '20:00', venue: 'Litvínov Arena' }
    ]
  },
  {
    round: 7,
    date: '20. září 2024',
    dayOfWeek: 'pátek',
    matches: [
      { id: 'z7-1', home: 'most', away: 'duchcov', time: '19:00', venue: 'Mostecký stadion' }
    ]
  },
  {
    round: 8,
    date: '21. září 2024',
    dayOfWeek: 'sobota',
    matches: [
      { id: 'z8-1', home: 'chomutov', away: 'litvinov_oboj', time: '19:00', venue: 'Chomutovská hala' },
      { id: 'z8-2', home: 'bilina', away: 'teplice', time: '20:00', venue: 'Aréna Bílina' }
    ]
  },
  {
    round: 9,
    date: '22. září 2024',
    dayOfWeek: 'neděle',
    matches: [
      { id: 'z9-1', home: 'lancers', away: 'chomutov', time: '20:00', venue: 'Litvínov Arena' }
    ]
  },
  {
    round: 10,
    date: '27. září 2024',
    dayOfWeek: 'pátek',
    matches: [
      { id: 'z10-1', home: 'most', away: 'bilina', time: '19:00', venue: 'Mostecký stadion' },
      { id: 'z10-2', home: 'louny', away: 'duchcov', time: '19:00', venue: 'Mostecký stadion' }
    ]
  },
  {
    round: 11,
    date: '28. září 2024',
    dayOfWeek: 'sobota',
    matches: [
      { id: 'z11-1', home: 'chomutov', away: 'teplice', time: '19:00', venue: 'Chomutovská hala' }
    ]
  },
  {
    round: 12,
    date: '29. září 2024',
    dayOfWeek: 'neděle',
    matches: [
      { id: 'z12-1', home: 'lancers', away: 'litvinov_oboj', time: '20:00', venue: 'Litvínov Arena' },
      { id: 'z12-2', home: 'teplice', away: 'most', time: '20:00', venue: 'Teplická aréna' }
    ]
  },
  {
    round: 13,
    date: '4. října 2024',
    dayOfWeek: 'pátek',
    matches: [
      { id: 'z13-1', home: 'duchcov', away: 'bilina', time: '20:45', venue: 'Teplická aréna' }
    ]
  },
  {
    round: 14,
    date: '5. října 2024',
    dayOfWeek: 'sobota',
    matches: [
      { id: 'z14-1', home: 'chomutov', away: 'louny', time: '19:00', venue: 'Chomutovská hala' },
      { id: 'z14-2', home: 'bilina', away: 'lancers', time: '20:00', venue: 'Aréna Bílina' }
    ]
  },
  {
    round: 15,
    date: '6. října 2024',
    dayOfWeek: 'neděle',
    matches: [
      { id: 'z15-1', home: 'litvinov_oboj', away: 'chomutov', time: '20:00', venue: 'Litvínov Arena' }
    ]
  },
  {
    round: 16,
    date: '11. října 2024',
    dayOfWeek: 'pátek',
    matches: [
      { id: 'z16-1', home: 'most', away: 'teplice', time: '19:00', venue: 'Mostecký stadion' },
      { id: 'z16-2', home: 'louny', away: 'bilina', time: '19:00', venue: 'Mostecký stadion' }
    ]
  },
  {
    round: 17,
    date: '12. října 2024',
    dayOfWeek: 'sobota',
    matches: [
      { id: 'z17-1', home: 'chomutov', away: 'duchcov', time: '19:00', venue: 'Chomutovská hala' }
    ]
  },
  {
    round: 18,
    date: '13. října 2024',
    dayOfWeek: 'neděle',
    matches: [
      { id: 'z18-1', home: 'lancers', away: 'teplice', time: '20:00', venue: 'Litvínov Arena' },
      { id: 'z18-2', home: 'litvinov_oboj', away: 'louny', time: '20:00', venue: 'Litvínov Arena' }
    ]
  },
  {
    round: 19,
    date: '19. října 2024',
    dayOfWeek: 'sobota',
    matches: [
      { id: 'z19-1', home: 'bilina', away: 'duchcov', time: '20:00', venue: 'Aréna Bílina' }
    ]
  },
  {
    round: 20,
    date: '20. října 2024',
    dayOfWeek: 'neděle',
    matches: [
      { id: 'z20-1', home: 'most', away: 'lancers', time: '19:00', venue: 'Mostecký stadion' }
    ]
  },
  {
    round: 21,
    date: '25. října 2024',
    dayOfWeek: 'pátek',
    matches: [
      { id: 'z21-1', home: 'teplice', away: 'litvinov_oboj', time: '20:45', venue: 'Teplická aréna' },
      { id: 'z21-2', home: 'duchcov', away: 'most', time: '20:45', venue: 'Teplická aréna' }
    ]
  },
  {
    round: 22,
    date: '26. října 2024',
    dayOfWeek: 'sobota',
    matches: [
      { id: 'z22-1', home: 'chomutov', away: 'lancers', time: '19:00', venue: 'Chomutovská hala' },
      { id: 'z22-2', home: 'louny', away: 'teplice', time: '19:00', venue: 'Mostecký stadion' }
    ]
  },
  {
    round: 23,
    date: '27. října 2024',
    dayOfWeek: 'neděle',
    matches: [
      { id: 'z23-1', home: 'louny', away: 'lancers', time: '19:00', venue: 'Mostecký stadion' }
    ]
  },
  {
    round: 24,
    date: '1. listopadu 2024',
    dayOfWeek: 'pátek',
    matches: [
      { id: 'z24-1', home: 'teplice', away: 'bilina', time: '20:45', venue: 'Teplická aréna' }
    ]
  },
  {
    round: 25,
    date: '2. listopadu 2024',
    dayOfWeek: 'sobota',
    matches: [
      { id: 'z25-1', home: 'chomutov', away: 'bilina', time: '19:00', venue: 'Chomutovská hala' }
    ]
  },
  {
    round: 26,
    date: '3. listopadu 2024',
    dayOfWeek: 'neděle',
    matches: [
      { id: 'z26-1', home: 'lancers', away: 'duchcov', time: '20:00', venue: 'Litvínov Arena' },
      { id: 'z26-2', home: 'lancers', away: 'bilina', time: '20:00', venue: 'Litvínov Arena' }
    ]
  },
  {
    round: 27,
    date: '8. listopadu 2024',
    dayOfWeek: 'pátek',
    matches: [
      { id: 'z27-1', home: 'duchcov', away: 'louny', time: '20:45', venue: 'Teplická aréna' }
    ]
  },
  {
    round: 28,
    date: '9. listopadu 2024',
    dayOfWeek: 'sobota',
    matches: [
      { id: 'z28-1', home: 'litvinov_oboj', away: 'lancers', time: '20:00', venue: 'Litvínov Arena' },
      { id: 'z28-2', home: 'bilina', away: 'most', time: '20:00', venue: 'Aréna Bílina' }
    ]
  }
];

// Export všech zápasů jako flat array pro snadné prohledávání
export const allMatches = zakladniCast.flatMap(round => 
  round.matches.map(match => ({
    ...match,
    round: round.round,
    date: round.date,
    dayOfWeek: round.dayOfWeek,
    phase: 'zakladni'
  }))
);

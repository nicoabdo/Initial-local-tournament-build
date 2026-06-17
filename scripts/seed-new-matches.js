const fs = require('fs');
const path = require('path');

const userMatchesInput = [
  { "id": 1, "group": "A", "date": "2026-06-11", "time": "15:00", "home_team": "México", "away_team": "Sudáfrica", "venue": "Estadio Ciudad de México" },
  { "id": 2, "group": "A", "date": "2026-06-11", "time": "22:00", "home_team": "República de Corea", "away_team": "República Checa", "venue": "Estadio Guadalajara" },
  { "id": 3, "group": "B", "date": "2026-06-12", "time": "15:00", "home_team": "Canadá", "away_team": "Bosnia y Herzegovina", "venue": "Estadio Toronto" },
  { "id": 4, "group": "D", "date": "2026-06-12", "time": "21:00", "home_team": "Estados Unidos", "away_team": "Paraguay", "venue": "Estadio Los Ángeles" },
  { "id": 5, "group": "B", "date": "2026-06-13", "time": "15:00", "home_team": "Catar", "away_team": "Suiza", "venue": "Estadio Bahía de San Francisco" },
  { "id": 6, "group": "C", "date": "2026-06-13", "time": "18:00", "home_team": "Brasil", "away_team": "Marruecos", "venue": "Estadio Nueva York Nueva Jersey" },
  { "id": 7, "group": "C", "date": "2026-06-13", "time": "21:00", "home_team": "Haití", "away_team": "Escocia", "venue": "Estadio Boston" },
  { "id": 8, "group": "D", "date": "2026-06-13", "time": "00:00", "home_team": "Australia", "away_team": "Turquía", "venue": "Estadio BC Place Vancouver" },
  { "id": 9, "group": "E", "date": "2026-06-14", "time": "13:00", "home_team": "Alemania", "away_team": "Curazao", "venue": "Estadio Houston" },
  { "id": 10, "group": "F", "date": "2026-06-14", "time": "16:00", "home_team": "Países Bajos", "away_team": "Japón", "venue": "Estadio Dallas" },
  { "id": 11, "group": "E", "date": "2026-06-14", "time": "19:00", "home_team": "Costa de Marfil", "away_team": "Ecuador", "venue": "Estadio Filadelfia" },
  { "id": 12, "group": "F", "date": "2026-06-14", "time": "22:00", "home_team": "Suecia", "away_team": "Túnez", "venue": "Estadio Monterrey" },
  { "id": 13, "group": "H", "date": "2026-06-15", "time": "12:00", "home_team": "España", "away_team": "Cabo Verde", "venue": "Estadio Atlanta" },
  { "id": 14, "group": "G", "date": "2026-06-15", "time": "15:00", "home_team": "Bélgica", "away_team": "Egipto", "venue": "Estadio Seattle" },
  { "id": 15, "group": "H", "date": "2026-06-15", "time": "18:00", "home_team": "Arabia Saudí", "away_team": "Uruguay", "venue": "Estadio Miami" },
  { "id": 16, "group": "G", "date": "2026-06-15", "time": "21:00", "home_team": "República Islámica de Irán", "away_team": "Nueva Zelanda", "venue": "Estadio Los Ángeles" },
  { "id": 17, "group": "I", "date": "2026-06-16", "time": "15:00", "home_team": "Francia", "away_team": "Senegal", "venue": "Estadio Nueva York Nueva Jersey" },
  { "id": 18, "group": "I", "date": "2026-06-16", "time": "18:00", "home_team": "Irak", "away_team": "Noruega", "venue": "Estadio Boston" },
  { "id": 19, "group": "J", "date": "2026-06-16", "time": "21:00", "home_team": "Argentina", "away_team": "Argelia", "venue": "Estadio Kansas City" },
  { "id": 20, "group": "J", "date": "2026-06-16", "time": "00:00", "home_team": "Austria", "away_team": "Jordania", "venue": "Estadio Bahía de San Francisco" },
  { "id": 21, "group": "K", "date": "2026-06-17", "time": "13:00", "home_team": "Portugal", "away_team": "República Democrática del Congo", "venue": "Estadio Houston" },
  { "id": 22, "group": "L", "date": "2026-06-17", "time": "16:00", "home_team": "Inglaterra", "away_team": "Croacia", "venue": "Estadio Dallas" },
  { "id": 23, "group": "L", "date": "2026-06-17", "time": "19:00", "home_team": "Ghana", "away_team": "Panamá", "venue": "Estadio Toronto" },
  { "id": 24, "group": "K", "date": "2026-06-17", "time": "22:00", "home_team": "Uzbekistán", "away_team": "Colombia", "venue": "Estadio Ciudad de México" },
  { "id": 25, "group": "A", "date": "2026-06-18", "time": "12:00", "home_team": "República Checa", "away_team": "Sudáfrica", "venue": "Estadio Atlanta" },
  { "id": 26, "group": "B", "date": "2026-06-18", "time": "15:00", "home_team": "Suiza", "away_team": "Bosnia y Herzegovina", "venue": "Estadio Los Ángeles" },
  { "id": 27, "group": "B", "date": "2026-06-18", "time": "18:00", "home_team": "Canadá", "away_team": "Catar", "venue": "Estadio BC Place Vancouver" },
  { "id": 28, "group": "A", "date": "2026-06-18", "time": "21:00", "home_team": "México", "away_team": "República de Corea", "venue": "Estadio Guadalajara" },
  { "id": 29, "group": "D", "date": "2026-06-19", "time": "15:00", "home_team": "Estados Unidos", "away_team": "Australia", "venue": "Estadio Seattle" },
  { "id": 30, "group": "C", "date": "2026-06-19", "time": "18:00", "home_team": "Escocia", "away_team": "Marruecos", "venue": "Estadio Boston" },
  { "id": 31, "group": "C", "date": "2026-06-19", "time": "21:00", "home_team": "Brasil", "away_team": "Haití", "venue": "Estadio Filadelfia" },
  { "id": 32, "group": "D", "date": "2026-06-19", "time": "00:00", "home_team": "Turquía", "away_team": "Paraguay", "venue": "Estadio Bahía de San Francisco" },
  { "id": 33, "group": "F", "date": "2026-06-20", "time": "13:00", "home_team": "Países Bajos", "away_team": "Suecia", "venue": "Estadio Houston" },
  { "id": 34, "group": "E", "date": "2026-06-20", "time": "16:00", "home_team": "Alemania", "away_team": "Costa de Marfil", "venue": "Estadio Toronto" },
  { "id": 35, "group": "E", "date": "2026-06-20", "time": "22:00", "home_team": "Ecuador", "away_team": "Curazao", "venue": "Estadio Kansas City" },
  { "id": 36, "group": "F", "date": "2026-06-20", "time": "00:00", "home_team": "Túnez", "away_team": "Japón", "venue": "Estadio Monterrey" },
  { "id": 37, "group": "H", "date": "2026-06-21", "time": "12:00", "home_team": "España", "away_team": "Arabia Saudí", "venue": "Estadio Atlanta" },
  { "id": 38, "group": "G", "date": "2026-06-21", "time": "15:00", "home_team": "Bélgica", "away_team": "República Islámica de Irán", "venue": "Estadio Los Ángeles" },
  { "id": 39, "group": "H", "date": "2026-06-21", "time": "18:00", "home_team": "Uruguay", "away_team": "Cabo Verde", "venue": "Estadio Miami" },
  { "id": 40, "group": "G", "date": "2026-06-21", "time": "21:00", "home_team": "Nueva Zelanda", "away_team": "Egipto", "venue": "Estadio BC Place Vancouver" },
  { "id": 41, "group": "J", "date": "2026-06-22", "time": "13:00", "home_team": "Argentina", "away_team": "Austria", "venue": "Estadio Dallas" },
  { "id": 42, "group": "I", "date": "2026-06-22", "time": "17:00", "home_team": "Francia", "away_team": "Irak", "venue": "Estadio Filadelfia" },
  { "id": 43, "group": "I", "date": "2026-06-22", "time": "20:00", "home_team": "Noruega", "away_team": "Senegal", "venue": "Estadio Nueva York Nueva Jersey" },
  { "id": 44, "group": "J", "date": "2026-06-22", "time": "23:00", "home_team": "Jordania", "away_team": "Argelia", "venue": "Estadio Bahía de San Francisco" },
  { "id": 45, "group": "K", "date": "2026-06-23", "time": "13:00", "home_team": "Portugal", "away_team": "Uzbekistán", "venue": "Estadio Houston" },
  { "id": 46, "group": "L", "date": "2026-06-23", "time": "16:00", "home_team": "Inglaterra", "away_team": "Ghana", "venue": "Estadio Boston" },
  { "id": 47, "group": "L", "date": "2026-06-23", "time": "19:00", "home_team": "Panamá", "away_team": "Croacia", "venue": "Estadio Toronto" },
  { "id": 48, "group": "K", "date": "2026-06-23", "time": "22:00", "home_team": "Colombia", "away_team": "República Democrática del Congo", "venue": "Estadio Guadalajara" }
];

// Combine date & time into ISO string, determine status & actual scores
const currentDateStr = "2026-06-16T18:44:58-04:00";
const currentTimestamp = new Date(currentDateStr).getTime();

// Fix the actual scores for matches that occur in the past (before June 16, 2026)
// We will generate stable random-looking scores based on match ids to make it reproducible
const getMockActualScore = (id) => {
  const scores = [
    { home: 2, away: 1 }, // México vs Sudáfrica
    { home: 1, away: 1 }, // Corea vs Checa
    { home: 2, away: 0 }, // Canadá vs Bosnia
    { home: 3, away: 1 }, // EE.UU. vs Paraguay
    { home: 0, away: 2 }, // Catar vs Suiza
    { home: 3, away: 0 }, // Brasil vs Marruecos
    { home: 1, away: 2 }, // Haití vs Escocia
    { home: 1, away: 1 }, // Australia vs Turquía
    { home: 4, away: 0 }, // Alemania vs Curazao
    { home: 2, away: 1 }, // Países Bajos vs Japón
    { home: 1, away: 2 }, // Costa de Marfil vs Ecuador
    { home: 2, away: 0 }, // Suecia vs Túnez
    { home: 3, away: 0 }, // España vs Cabo Verde
    { home: 2, away: 1 }, // Bélgica vs Egipto
    { home: 0, away: 2 }, // Arabia vs Uruguay
    { home: 1, away: 1 }, // Irán vs N. Zelanda
    { home: 2, away: 1 }  // Francia vs Senegal (completed at 15:00 on June 16)
  ];
  return scores[id - 1] || { home: null, away: null };
};

const newMatches = userMatchesInput.map(m => {
  const matchDateStr = `${m.date}T${m.time}:00Z`;
  const matchTimestamp = new Date(matchDateStr).getTime();
  
  let status = "scheduled";
  let actual_home_score = null;
  let actual_away_score = null;

  // Let's compare timestamps:
  if (m.id <= 17) {
    status = "finished";
    const mock = getMockActualScore(m.id);
    actual_home_score = mock.home;
    actual_away_score = mock.away;
  } else if (m.id === 18) {
    // Irak vs Noruega is at 18:00 today. Current time is 18:44. It is LIVE!
    status = "live";
    actual_home_score = 1;
    actual_away_score = 1;
  }

  return {
    id: `m${m.id}`,
    team_home: m.home_team,
    team_away: m.away_team,
    group_stage: `Group ${m.group}`,
    match_date: matchDateStr,
    actual_home_score,
    actual_away_score,
    status
  };
});

// Seed predictions for the 4 users
const seedPredictions = (userIndex, rules) => {
  // Let's seed predictions for matches 1 to 20
  const predictions = [];
  const totalMatches = 20;

  for (let i = 1; i <= totalMatches; i++) {
    const match = newMatches.find(m => m.id === `m${i}`);
    if (!match) continue;

    // Generate different predictions based on user index
    let predHome = 0;
    let predAway = 0;

    if (i <= 17) {
      const actual = getMockActualScore(i);
      // We will make some users hit exact and some miss
      if (userIndex === 0) { // Dad
        // Hits some exact, misses some
        if (i % 3 === 0) {
          predHome = actual.home;
          predAway = actual.away;
        } else {
          predHome = Math.max(0, actual.home + (i % 2 === 0 ? 1 : -1));
          predAway = actual.away;
        }
      } else if (userIndex === 1) { // Mom
        if (i % 2 === 0) {
          predHome = actual.home;
          predAway = actual.away;
        } else {
          predHome = actual.home;
          predAway = Math.max(0, actual.away + 1);
        }
      } else if (userIndex === 2) { // Sofia
        if (i % 4 === 0) {
          predHome = actual.home;
          predAway = actual.away;
        } else {
          predHome = Math.max(0, actual.home - 1);
          predAway = actual.away + 1;
        }
      } else { // Lucas
        if (i % 3 === 1) {
          predHome = actual.home;
          predAway = actual.away;
        } else {
          predHome = actual.home;
          predAway = actual.away;
        }
      }
    } else {
      // Future/live matches predictions
      predHome = (i + userIndex) % 3;
      predAway = (i * userIndex) % 3;
    }

    let points_earned = null;
    if (match.status === "finished" && match.actual_home_score !== null && match.actual_away_score !== null) {
      if (predHome === match.actual_home_score && predAway === match.actual_away_score) {
        points_earned = rules.exact_match_points;
      } else if (
        (predHome > predAway && match.actual_home_score > match.actual_away_score) ||
        (predHome < predAway && match.actual_home_score < match.actual_away_score) ||
        (predHome === predAway && match.actual_home_score === match.actual_away_score)
      ) {
        points_earned = rules.correct_outcome_points;
      } else {
        points_earned = rules.loss_points;
      }
    }

    predictions.push({
      match_id: `m${i}`,
      predicted_home_score: predHome,
      predicted_away_score: predAway,
      points_earned
    });
  }

  return predictions;
};

const pointStructure = {
  exact_match_points: 3,
  correct_outcome_points: 1,
  loss_points: 0
};

const users = [
  { id: 'u1', name: 'Dad', total_points: 0, betting_scores: seedPredictions(0, pointStructure) },
  { id: 'u2', name: 'Mom', total_points: 0, betting_scores: seedPredictions(1, pointStructure) },
  { id: 'u3', name: 'Sofia', total_points: 0, betting_scores: seedPredictions(2, pointStructure) },
  { id: 'u4', name: 'Lucas', total_points: 0, betting_scores: seedPredictions(3, pointStructure) }
];

// Calculate initial total points for each user
users.forEach(user => {
  user.total_points = user.betting_scores.reduce((sum, pred) => sum + (pred.points_earned || 0), 0);
});

const newDb = {
  settings: {
    pointStructure
  },
  matches: newMatches,
  users
};

const dbPath = path.join(__dirname, '..', 'db.json');
fs.writeFileSync(dbPath, JSON.stringify(newDb, null, 2), 'utf-8');
console.log('Successfully wrote new seeded database to db.json with 48 World Cup matches.');

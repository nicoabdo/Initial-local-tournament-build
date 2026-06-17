import fs from 'fs';
import path from 'path';
import { Database, Match, User, Prediction, PointStructure } from './types';

// Place the database file in the project root
const DB_FILE = path.join(process.cwd(), 'db.json');

const INITIAL_POINT_STRUCTURE: PointStructure = {
  exact_match_points: 3,
  correct_outcome_points: 1,
  loss_points: 0
};

// Generates the mock actual scores for matches in the past
const mockActualScores: Record<string, { home: number; away: number }> = {
  'm1': { home: 2, away: 0 },
  'm2': { home: 2, away: 1 },
  'm3': { home: 1, away: 1 },
  'm4': { home: 4, away: 1 },
  'm5': { home: 1, away: 1 },
  'm6': { home: 1, away: 1 },
  'm7': { home: 0, away: 1 },
  'm8': { home: 2, away: 0 },
  'm9': { home: 7, away: 1 },
  'm10': { home: 2, away: 2 },
  'm11': { home: 1, away: 0 },
  'm12': { home: 5, away: 1 },
  'm13': { home: 0, away: 0 },
  'm14': { home: 1, away: 1 },
  'm15': { home: 1, away: 1 },
  'm16': { home: 2, away: 2 },
  'm17': { home: 3, away: 1 }
};

// Build the initial matches array programmatically to keep the code clean and maintainable
const userMatchesInput = [
  { id: 1, group: "A", date: "2026-06-11", time: "15:00", home: "México", away: "Sudáfrica" },
  { id: 2, group: "A", date: "2026-06-11", time: "22:00", home: "República de Corea", away: "República Checa" },
  { id: 3, group: "B", date: "2026-06-12", home: "Canadá", away: "Bosnia y Herzegovina", time: "15:00" },
  { id: 4, group: "D", date: "2026-06-12", home: "Estados Unidos", away: "Paraguay", time: "21:00" },
  { id: 5, group: "B", date: "2026-06-13", home: "Catar", away: "Suiza", time: "15:00" },
  { id: 6, group: "C", date: "2026-06-13", home: "Brasil", away: "Marruecos", time: "18:00" },
  { id: 7, group: "C", date: "2026-06-13", home: "Haití", away: "Escocia", time: "21:00" },
  { id: 8, group: "D", date: "2026-06-13", home: "Australia", away: "Turquía", time: "00:00" },
  { id: 9, group: "E", date: "2026-06-14", home: "Alemania", away: "Curazao", time: "13:00" },
  { id: 10, group: "F", date: "2026-06-14", home: "Países Bajos", away: "Japón", time: "16:00" },
  { id: 11, group: "E", date: "2026-06-14", home: "Costa de Marfil", away: "Ecuador", time: "19:00" },
  { id: 12, group: "F", date: "2026-06-14", home: "Suecia", away: "Túnez", time: "22:00" },
  { id: 13, group: "H", date: "2026-06-15", home: "España", away: "Cabo Verde", time: "12:00" },
  { id: 14, group: "G", date: "2026-06-15", home: "Bélgica", away: "Egipto", time: "15:00" },
  { id: 15, group: "H", date: "2026-06-15", home: "Arabia Saudí", away: "Uruguay", time: "18:00" },
  { id: 16, group: "G", date: "2026-06-15", home: "República Islámica de Irán", away: "Nueva Zelanda", time: "21:00" },
  { id: 17, group: "I", date: "2026-06-16", home: "Francia", away: "Senegal", time: "15:00" },
  { id: 18, group: "I", date: "2026-06-16", home: "Irak", away: "Noruega", time: "18:00" },
  { id: 19, group: "J", date: "2026-06-16", home: "Argentina", away: "Argelia", time: "21:00" },
  { id: 20, group: "J", date: "2026-06-16", home: "Austria", away: "Jordania", time: "00:00" },
  { id: 21, group: "K", date: "2026-06-17", home: "Portugal", away: "República Democrática del Congo", time: "13:00" },
  { id: 22, group: "L", date: "2026-06-17", home: "Inglaterra", away: "Croacia", time: "16:00" },
  { id: 23, group: "L", date: "2026-06-17", home: "Ghana", away: "Panamá", time: "19:00" },
  { id: 24, group: "K", date: "2026-06-17", home: "Uzbekistán", away: "Colombia", time: "22:00" },
  { id: 25, group: "A", date: "2026-06-18", home: "República Checa", away: "Sudáfrica", time: "12:00" },
  { id: 26, group: "B", date: "2026-06-18", home: "Suiza", away: "Bosnia y Herzegovina", time: "15:00" },
  { id: 27, group: "B", date: "2026-06-18", home: "Canadá", away: "Catar", time: "18:00" },
  { id: 28, group: "A", date: "2026-06-18", home: "México", away: "República de Corea", time: "21:00" },
  { id: 29, group: "D", date: "2026-06-19", home: "Estados Unidos", away: "Australia", time: "15:00" },
  { id: 30, group: "C", date: "2026-06-19", home: "Escocia", away: "Marruecos", time: "18:00" },
  { id: 31, group: "C", date: "2026-06-19", home: "Brasil", away: "Haití", time: "21:00" },
  { id: 32, group: "D", date: "2026-06-19", home: "Turquía", away: "Paraguay", time: "00:00" },
  { id: 33, group: "F", date: "2026-06-20", home: "Países Bajos", away: "Suecia", time: "13:00" },
  { id: 34, group: "E", date: "2026-06-20", home: "Alemania", away: "Costa de Marfil", time: "16:00" },
  { id: 35, group: "E", date: "2026-06-20", home: "Ecuador", away: "Curazao", time: "22:00" },
  { id: 36, group: "F", date: "2026-06-20", home: "Túnez", away: "Japón", time: "00:00" },
  { id: 37, group: "H", date: "2026-06-21", home: "España", away: "Arabia Saudí", time: "12:00" },
  { id: 38, group: "G", date: "2026-06-21", home: "Bélgica", away: "República Islámica de Irán", time: "15:00" },
  { id: 39, group: "H", date: "2026-06-21", home: "Uruguay", away: "Cabo Verde", time: "18:00" },
  { id: 40, group: "G", date: "2026-06-21", home: "Nueva Zelanda", away: "Egipto", time: "21:00" },
  { id: 41, group: "J", date: "2026-06-22", home: "Argentina", away: "Austria", time: "13:00" },
  { id: 42, group: "I", date: "2026-06-22", home: "Francia", away: "Irak", time: "17:00" },
  { id: 43, group: "I", date: "2026-06-22", home: "Noruega", away: "Senegal", time: "20:00" },
  { id: 44, group: "J", date: "2026-06-22", home: "Jordania", away: "Argelia", time: "23:00" },
  { id: 45, group: "K", date: "2026-06-23", home: "Portugal", away: "Uzbekistán", time: "13:00" },
  { id: 46, group: "L", date: "2026-06-23", home: "Inglaterra", away: "Ghana", time: "16:00" },
  { id: 47, group: "L", date: "2026-06-23", home: "Panamá", away: "Croacia", time: "19:00" },
  { id: 48, group: "K", date: "2026-06-23", home: "Colombia", away: "República Democrática del Congo", time: "22:00" }
];

const INITIAL_MATCHES: Match[] = userMatchesInput.map(m => {
  const matchId = `m${m.id}`;
  const mockScore = mockActualScores[matchId];
  let status: 'scheduled' | 'live' | 'finished' = 'scheduled';
  let actual_home_score = null;
  let actual_away_score = null;

  if (m.id <= 17) {
    status = 'finished';
    actual_home_score = mockScore.home;
    actual_away_score = mockScore.away;
  }

  return {
    id: matchId,
    team_home: m.home,
    team_away: m.away,
    group_stage: `Group ${m.group}`,
    match_date: `${m.date}T${m.time}:00Z`,
    actual_home_score,
    actual_away_score,
    status
  };
});

// Helper to calculate mock points for seed users
function calculateSeedPoints(userIndex: number, matchId: string, actual: { home: number; away: number }): Prediction {
  // Generate semi-random prediction based on user index
  let predHome = 0;
  let predAway = 0;

  if (userIndex === 0) { // Dad
    if (parseInt(matchId.replace('m', '')) % 3 === 0) {
      predHome = actual.home;
      predAway = actual.away;
    } else {
      predHome = Math.max(0, actual.home + (userIndex % 2 === 0 ? 1 : -1));
      predAway = actual.away;
    }
  } else if (userIndex === 1) { // Mom
    if (parseInt(matchId.replace('m', '')) % 2 === 0) {
      predHome = actual.home;
      predAway = actual.away;
    } else {
      predHome = actual.home;
      predAway = Math.max(0, actual.away + 1);
    }
  } else if (userIndex === 2) { // Sofia
    if (parseInt(matchId.replace('m', '')) % 4 === 0) {
      predHome = actual.home;
      predAway = actual.away;
    } else {
      predHome = Math.max(0, actual.home - 1);
      predAway = actual.away + 1;
    }
  } else { // Lucas
    if (parseInt(matchId.replace('m', '')) % 3 === 1) {
      predHome = actual.home;
      predAway = actual.away;
    } else {
      predHome = actual.home;
      predAway = actual.away;
    }
  }

  // Calculate points
  let points_earned = null;
  if (predHome === actual.home && predAway === actual.away) {
    points_earned = INITIAL_POINT_STRUCTURE.exact_match_points;
  } else if (
    (predHome > predAway && actual.home > actual.away) ||
    (predHome < predAway && actual.home < actual.away) ||
    (predHome === predAway && actual.home === actual.away)
  ) {
    points_earned = INITIAL_POINT_STRUCTURE.correct_outcome_points;
  } else {
    points_earned = INITIAL_POINT_STRUCTURE.loss_points;
  }

  return {
    match_id: matchId,
    predicted_home_score: predHome,
    predicted_away_score: predAway,
    points_earned
  };
}

const INITIAL_USERS: User[] = ['Dad', 'Mom', 'Sofia', 'Lucas'].map((name, uIndex) => {
  const betting_scores: Prediction[] = [];
  
  // Seed past predictions
  Object.keys(mockActualScores).forEach(matchId => {
    const actual = mockActualScores[matchId];
    betting_scores.push(calculateSeedPoints(uIndex, matchId, actual));
  });

  // Seed a couple of future predictions
  for (let i = 18; i <= 24; i++) {
    betting_scores.push({
      match_id: `m${i}`,
      predicted_home_score: (i + uIndex) % 3,
      predicted_away_score: (i * uIndex) % 3,
      points_earned: null
    });
  }

  const total_points = betting_scores.reduce((sum, p) => sum + (p.points_earned || 0), 0);

  return {
    id: `u${uIndex + 1}`,
    name,
    total_points,
    betting_scores
  };
});

const INITIAL_DATABASE: Database = {
  settings: {
    pointStructure: INITIAL_POINT_STRUCTURE
  },
  matches: INITIAL_MATCHES,
  users: INITIAL_USERS
};

export function getDatabase(): Database {
  if (!fs.existsSync(DB_FILE)) {
    saveDatabase(INITIAL_DATABASE);
    return INITIAL_DATABASE;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data) as Database;
  } catch (error) {
    console.error('Error reading database file, returning initial state:', error);
    return INITIAL_DATABASE;
  }
}

export function saveDatabase(db: Database): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing database file:', error);
  }
}

export function savePredictions(userId: string, predictions: { match_id: string; home: number; away: number }[]): Database {
  const db = getDatabase();
  const user = db.users.find(u => u.id === userId);
  if (!user) return db;

  predictions.forEach(pred => {
    const match = db.matches.find(m => m.id === pred.match_id);
    if (match) {
      const existingPredIndex = user.betting_scores.findIndex(p => p.match_id === pred.match_id);
      const predictionObj: Prediction = {
        match_id: pred.match_id,
        predicted_home_score: pred.home,
        predicted_away_score: pred.away,
        points_earned: null
      };

      if (existingPredIndex >= 0) {
        user.betting_scores[existingPredIndex] = predictionObj;
      } else {
        user.betting_scores.push(predictionObj);
      }
    }
  });

  saveDatabase(db);
  return db;
}

export function saveAllPredictions(allPredictions: Record<string, { match_id: string; home: number; away: number }[]>): Database {
  const db = getDatabase();
  Object.keys(allPredictions).forEach(userId => {
    const user = db.users.find(u => u.id === userId);
    if (!user) return;

    const predictions = allPredictions[userId];
    predictions.forEach(pred => {
      const match = db.matches.find(m => m.id === pred.match_id);
      if (match) {
        const existingPredIndex = user.betting_scores.findIndex(p => p.match_id === pred.match_id);
        const predictionObj: Prediction = {
          match_id: pred.match_id,
          predicted_home_score: pred.home,
          predicted_away_score: pred.away,
          points_earned: null
        };

        if (existingPredIndex >= 0) {
          user.betting_scores[existingPredIndex] = predictionObj;
        } else {
          user.betting_scores.push(predictionObj);
        }
      }
    });
  });

  saveDatabase(db);
  return db;
}

export function updateMatchScore(matchId: string, home: number | null, away: number | null, status: 'scheduled' | 'live' | 'finished'): Database {
  const db = getDatabase();
  const match = db.matches.find(m => m.id === matchId);
  if (match) {
    match.actual_home_score = home;
    match.actual_away_score = away;
    match.status = status;
    saveDatabase(db);
  }
  return db;
}

export function updateSettings(points: PointStructure): Database {
  const db = getDatabase();
  db.settings.pointStructure = points;
  saveDatabase(db);
  return db;
}

export function recalculatePoints(): Database {
  const db = getDatabase();
  const rules = db.settings.pointStructure;

  db.users.forEach(user => {
    let userTotal = 0;

    user.betting_scores.forEach(pred => {
      const match = db.matches.find(m => m.id === pred.match_id);
      if (!match || match.status !== 'finished' || match.actual_home_score === null || match.actual_away_score === null) {
        pred.points_earned = null;
        return;
      }

      const pHome = pred.predicted_home_score;
      const pAway = pred.predicted_away_score;
      const aHome = match.actual_home_score;
      const aAway = match.actual_away_score;

      if (pHome === aHome && pAway === aAway) {
        pred.points_earned = rules.exact_match_points;
      } else if (
        (pHome > pAway && aHome > aAway) ||
        (pHome < pAway && aHome < aAway) ||
        (pHome === pAway && aHome === aAway)
      ) {
        pred.points_earned = rules.correct_outcome_points;
      } else {
        pred.points_earned = rules.loss_points;
      }

      userTotal += pred.points_earned;
    });

    user.total_points = userTotal;
  });

  saveDatabase(db);
  return db;
}

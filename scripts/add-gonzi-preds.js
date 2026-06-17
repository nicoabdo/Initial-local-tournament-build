const fs = require('fs');
const path = require('path');

const gonziData = {
  "id": "gonzi",
  "name": "GONZI",
  "betting_scores_extension": [
    { "matchId": 13, "predicted_home": 6, "predicted_away": 0 },
    { "matchId": 14, "predicted_home": 2, "predicted_away": 0 },
    { "matchId": 15, "predicted_home": 1, "predicted_away": 2 },
    { "matchId": 16, "predicted_home": 1, "predicted_away": 0 },
    { "matchId": 17, "predicted_home": 3, "predicted_away": 1 },
    { "matchId": 18, "predicted_home": 0, "predicted_away": 3 },
    { "matchId": 19, "predicted_home": 3, "predicted_away": 1 },
    { "matchId": 20, "predicted_home": 2, "predicted_away": 1 },
    { "matchId": 21, "predicted_home": 4, "predicted_away": 0 },
    { "matchId": 22, "predicted_home": 2, "predicted_away": 1 },
    { "matchId": 23, "predicted_home": 1, "predicted_away": 1 },
    { "matchId": 24, "predicted_home": 1, "predicted_away": 3 },
    { "matchId": 25, "predicted_home": 2, "predicted_away": 0 },
    { "matchId": 26, "predicted_home": 2, "predicted_away": 1 },
    { "matchId": 27, "predicted_home": 2, "predicted_away": 0 },
    { "matchId": 28, "predicted_home": 1, "predicted_away": 2 },
    { "matchId": 29, "predicted_home": 3, "predicted_away": 1 },
    { "matchId": 30, "predicted_home": 0, "predicted_away": 2 },
    { "matchId": 31, "predicted_home": 4, "predicted_away": 1 },
    { "matchId": 32, "predicted_home": 2, "predicted_away": 1 },
    { "matchId": 33, "predicted_home": 2, "predicted_away": 1 },
    { "matchId": 34, "predicted_home": 3, "predicted_away": 1 },
    { "matchId": 35, "predicted_home": 3, "predicted_away": 0 },
    { "matchId": 36, "predicted_home": 0, "predicted_away": 2 }
  ]
};

const dbPath = path.join(__dirname, '..', 'db.json');
if (!fs.existsSync(dbPath)) {
  console.error('db.json not found!');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const rules = db.settings.pointStructure;

let user = db.users.find(u => u.id === gonziData.id);
if (!user) {
  user = {
    id: gonziData.id,
    name: gonziData.name,
    total_points: 0,
    betting_scores: []
  };
  db.users.push(user);
}

// Map predictions from Gonzi's payload
gonziData.betting_scores_extension.forEach(pred => {
  const matchId = `m${pred.matchId}`;
  
  const formattedPred = {
    match_id: matchId,
    predicted_home_score: pred.predicted_home,
    predicted_away_score: pred.predicted_away,
    points_earned: null
  };

  const existingIndex = user.betting_scores.findIndex(p => p.match_id === matchId);
  if (existingIndex >= 0) {
    user.betting_scores[existingIndex] = formattedPred;
  } else {
    user.betting_scores.push(formattedPred);
  }
});

// Run point recalculation for all users (including Gonzi)
db.users.forEach(u => {
  let userTotal = 0;

  u.betting_scores.forEach(pred => {
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

  u.total_points = userTotal;
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
console.log('Successfully added GONZI predictions and recalculated standings.');
console.log('Updated Standings:');
db.users.sort((a,b) => b.total_points - a.total_points).forEach((u, i) => {
  console.log(`${i+1}. ${u.name}: ${u.total_points} pts`);
});

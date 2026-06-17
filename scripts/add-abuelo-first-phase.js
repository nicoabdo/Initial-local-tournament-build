const fs = require('fs');
const path = require('path');

const abueloFirstPhase = {
  "id": "abuelo",
  "name": "ABUELO",
  "betting_scores_first_phase": [
    { "matchId": 1, "predicted_home": 2, "predicted_away": 1 },
    { "matchId": 2, "predicted_home": 1, "predicted_away": 0 },
    { "matchId": 3, "predicted_home": 2, "predicted_away": 2 },
    { "matchId": 4, "predicted_home": 1, "predicted_away": 1 },
    { "matchId": 5, "predicted_home": 0, "predicted_away": 0 },
    { "matchId": 6, "predicted_home": 3, "predicted_away": 1 },
    { "matchId": 7, "predicted_home": 1, "predicted_away": 2 },
    { "matchId": 8, "predicted_home": 0, "predicted_away": 1 },
    { "matchId": 9, "predicted_home": 4, "predicted_away": 0 },
    { "matchId": 10, "predicted_home": 1, "predicted_away": 1 },
    { "matchId": 11, "predicted_home": 1, "predicted_away": 2 },
    { "matchId": 12, "predicted_home": 2, "predicted_away": 0 }
  ]
};

const dbPath = path.join(__dirname, '..', 'db.json');
if (!fs.existsSync(dbPath)) {
  console.error('db.json not found!');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const rules = db.settings.pointStructure;

let user = db.users.find(u => u.id === abueloFirstPhase.id);
if (!user) {
  user = {
    id: abueloFirstPhase.id,
    name: abueloFirstPhase.name,
    total_points: 0,
    betting_scores: []
  };
  db.users.push(user);
}

// Map predictions from Abuelo's first phase payload
abueloFirstPhase.betting_scores_first_phase.forEach(pred => {
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

// Run point recalculation for all users (including Abuelo)
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
console.log('Successfully added ABUELO first-phase predictions and recalculated standings.');
console.log('Updated Standings:');
db.users.sort((a,b) => b.total_points - a.total_points).forEach((u, i) => {
  console.log(`${i+1}. ${u.name}: ${u.total_points} pts`);
});

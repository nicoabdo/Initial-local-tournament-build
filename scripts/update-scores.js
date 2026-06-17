const fs = require('fs');
const path = require('path');

const updates = [
  { "id": 13, "actual_home_score": 5, "actual_away_score": 0, "status": "finished" },
  { "id": 14, "actual_home_score": 2, "actual_away_score": 1, "status": "finished" },
  { "id": 15, "actual_home_score": 1, "actual_away_score": 2, "status": "finished" },
  { "id": 16, "actual_home_score": 1, "actual_away_score": 1, "status": "finished" },
  { "id": 17, "actual_home_score": 3, "actual_away_score": 1, "status": "finished" },
  { "id": 18, "actual_home_score": 1, "actual_away_score": 1, "status": "finished" },
  { "id": 19, "actual_home_score": 2, "actual_away_score": 0, "status": "finished" },
  { "id": 20, "actual_home_score": 1, "actual_away_score": 0, "status": "finished" },
  { "id": 21, "actual_home_score": 3, "actual_away_score": 0, "status": "finished" },
  { "id": 22, "actual_home_score": 2, "actual_away_score": 1, "status": "finished" },
  { "id": 23, "actual_home_score": 0, "actual_away_score": 1, "status": "finished" },
  { "id": 24, "actual_home_score": 0, "actual_away_score": 2, "status": "finished" },
  { "id": 25, "actual_home_score": 1, "actual_away_score": 0, "status": "finished" },
  { "id": 26, "actual_home_score": 1, "actual_away_score": 0, "status": "finished" },
  { "id": 27, "actual_home_score": 2, "actual_away_score": 1, "status": "finished" },
  { "id": 28, "actual_home_score": 2, "actual_away_score": 1, "status": "finished" },
  { "id": 29, "actual_home_score": 3, "actual_away_score": 1, "status": "finished" },
  { "id": 30, "actual_home_score": 1, "actual_away_score": 2, "status": "finished" },
  { "id": 31, "actual_home_score": 4, "actual_away_score": 1, "status": "finished" },
  { "id": 32, "actual_home_score": 1, "actual_away_score": 1, "status": "finished" },
  { "id": 33, "actual_home_score": 2, "actual_away_score": 1, "status": "finished" },
  { "id": 34, "actual_home_score": 3, "actual_away_score": 1, "status": "finished" },
  { "id": 35, "actual_home_score": 2, "actual_away_score": 1, "status": "finished" },
  { "id": 36, "actual_home_score": 0, "actual_away_score": 2, "status": "finished" }
];

const dbPath = path.join(__dirname, '..', 'db.json');
if (!fs.existsSync(dbPath)) {
  console.error('db.json not found! Please run seed script first.');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const rules = db.settings.pointStructure;

// Apply score updates
updates.forEach(up => {
  const match = db.matches.find(m => m.id === `m${up.id}`);
  if (match) {
    match.actual_home_score = up.actual_home_score;
    match.actual_away_score = up.actual_away_score;
    match.status = up.status;
  }
});

// Recalculate all users total points
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

    // Rule: Exact Match
    if (pHome === aHome && pAway === aAway) {
      pred.points_earned = rules.exact_match_points;
    }
    // Rule: Correct Outcome
    else if (
      (pHome > pAway && aHome > aAway) ||
      (pHome < pAway && aHome < aAway) ||
      (pHome === pAway && aHome === aAway)
    ) {
      pred.points_earned = rules.correct_outcome_points;
    }
    // Rule: Loss
    else {
      pred.points_earned = rules.loss_points;
    }

    userTotal += pred.points_earned;
  });

  user.total_points = userTotal;
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
console.log('Successfully updated matches 13-36 in db.json and recalculated standings.');
console.log('Updated Standings:');
db.users.sort((a,b) => b.total_points - a.total_points).forEach((u, i) => {
  console.log(`${i+1}. ${u.name}: ${u.total_points} pts`);
});

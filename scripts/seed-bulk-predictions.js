const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db.json');
const dataPath = path.join(__dirname, 'bulk-preds-data.json');

if (!fs.existsSync(dbPath)) {
  console.error('db.json not found!');
  process.exit(1);
}
if (!fs.existsSync(dataPath)) {
  console.error('bulk-preds-data.json not found!');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const bulkData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const rules = db.settings.pointStructure;

console.log(`Loading bulk predictions for ${bulkData.length} participants...`);

bulkData.forEach(userEntry => {
  let user = db.users.find(u => u.id === userEntry.id);
  if (!user) {
    user = {
      id: userEntry.id,
      name: userEntry.name,
      total_points: 0,
      betting_scores: []
    };
    db.users.push(user);
    console.log(`Created new participant profile for: ${userEntry.name}`);
  } else {
    // Keep the name updated
    user.name = userEntry.name;
    console.log(`Updating participant profile for: ${userEntry.name}`);
  }

  // Clear or overwrite prediction matches
  userEntry.betting_scores_first_phase.forEach(pred => {
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
});

console.log('Recalculating points for all participants...');
// Run point recalculation for all users
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

// Save updated database
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
console.log('Successfully completed bulk predictions seeding and points recalculation.');

// Print updated standings sorted by points
console.log('\n--- Updated Standings ---');
db.users.sort((a,b) => b.total_points - a.total_points).forEach((u, i) => {
  console.log(`${String(i+1).padStart(2, ' ')}. ${u.name.padEnd(12, ' ')}: ${u.total_points} pts (${u.betting_scores.length} predictions)`);
});

const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db.json');

if (!fs.existsSync(dbPath)) {
  console.error('db.json not found!');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const rules = db.settings.pointStructure;

console.log(`Clearing predictions for ${db.users.length} participants...`);

db.users.forEach(user => {
  console.log(`Resetting predictions for: ${user.name}`);
  
  // Reinitialize betting_scores to contain 0-0 predictions for all 48 matches
  const resetPredictions = db.matches.map(match => {
    let points_earned = null;
    
    // If match is finished, calculate points earned based on 0-0 prediction
    if (match.status === 'finished' && match.actual_home_score !== null && match.actual_away_score !== null) {
      const pHome = 0;
      const pAway = 0;
      const aHome = match.actual_home_score;
      const aAway = match.actual_away_score;
      
      if (pHome === aHome && pAway === aAway) {
        points_earned = rules.exact_match_points;
      } else if (
        (pHome > pAway && aHome > aAway) ||
        (pHome < pAway && aHome < aAway) ||
        (pHome === pAway && aHome === aAway)
      ) {
        points_earned = rules.correct_outcome_points;
      } else {
        points_earned = rules.loss_points;
      }
    }
    
    return {
      match_id: match.id,
      predicted_home_score: 0,
      predicted_away_score: 0,
      points_earned: points_earned
    };
  });
  
  user.betting_scores = resetPredictions;
  
  // Calculate total points
  user.total_points = resetPredictions.reduce((sum, pred) => sum + (pred.points_earned || 0), 0);
});

// Save updated database
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
console.log('Successfully cleared all predictions and recalculated points.');

// Print updated standings sorted by points
console.log('\n--- Updated Standings (All Predictions set to 0-0) ---');
db.users.sort((a,b) => b.total_points - a.total_points).forEach((u, i) => {
  console.log(`${String(i+1).padStart(2, ' ')}. ${u.name.padEnd(12, ' ')}: ${u.total_points} pts`);
});

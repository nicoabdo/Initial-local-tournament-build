export interface Prediction {
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  points_earned: number | null; // Calculated points for this prediction (null if match not finished)
}

export interface User {
  id: string;
  name: string;
  total_points: number;
  betting_scores: Prediction[]; // Array of predictions as requested
}

export interface Match {
  id: string;
  team_home: string;
  team_away: string;
  group_stage: string; // e.g. "Group Stage", "Round of 16", "Quarter-finals", "Semi-finals", "Final"
  match_date: string;  // ISO string
  actual_home_score: number | null;
  actual_away_score: number | null;
  status: 'scheduled' | 'live' | 'finished';
  venue?: string;      // Stadium/venue details
  phase?: string;      // e.g. "groups", "16avos"
}

export interface PointStructure {
  exact_match_points: number;
  correct_outcome_points: number;
  loss_points: number;
}

export interface Database {
  matches: Match[];
  users: User[];
  settings: {
    pointStructure: PointStructure;
  };
}

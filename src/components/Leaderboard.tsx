"use client";

import { useState, useEffect } from "react";
import { User, Match, PointStructure } from "@/lib/types";
import { Trophy, Award, Search, X, Calendar, CheckCircle2, AlertCircle, HelpCircle, Maximize2, Minimize2 } from "lucide-react";

interface LeaderboardProps {
  users: User[];
  matches: Match[];
  pointStructure: PointStructure;
}

export default function Leaderboard({ users, matches, pointStructure }: LeaderboardProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [standingsTab, setStandingsTab] = useState<"general" | "fase de grupos" | "16 avos" | "8 vos" | "4 tos">("general");

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  // Sort users: 1. displayPoints desc, 2. accuracy % desc, 3. name asc
  const sortedUsers = [...users].map(user => {
    // Filter predictions based on selected standingsTab
    const phasePredictions = user.betting_scores.filter(pred => {
      const match = matches.find(m => m.id === pred.match_id);
      if (!match) return false;
      if (standingsTab === "general") return true;
      return match.phase === standingsTab;
    });

    const totalPredicted = phasePredictions.length;
    
    // Sum points for these predictions
    const points = phasePredictions.reduce((sum, pred) => sum + (pred.points_earned || 0), 0);

    const exactMatches = phasePredictions.filter(pred => {
      const match = matches.find(m => m.id === pred.match_id);
      if (!match || match.status !== "finished") return false;
      return (
        pred.predicted_home_score === match.actual_home_score &&
        pred.predicted_away_score === match.actual_away_score
      );
    }).length;

    const accuracy = totalPredicted > 0 ? Math.round((exactMatches / totalPredicted) * 100) : 0;

    return {
      ...user,
      displayPoints: points,
      totalPredicted,
      exactMatches,
      accuracy
    };
  }).sort((a, b) => {
    if (b.displayPoints !== a.displayPoints) {
      return b.displayPoints - a.displayPoints;
    }
    if (b.accuracy !== a.accuracy) {
      return b.accuracy - a.accuracy;
    }
    return a.name.localeCompare(b.name);
  });

  // Filter users based on search term
  const filteredUsers = sortedUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUserDisplay = selectedUser
    ? sortedUsers.find(u => u.id === selectedUser.id)
    : null;

  return (
    <div className={
      isExpanded 
        ? "fixed inset-0 z-50 bg-slate-950 p-6 sm:p-8 overflow-y-auto flex flex-col gap-6" 
        : "glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden"
    }>
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/15 rounded-xl text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">Family Standings</h2>
            <p className="text-xs text-slate-400">Rankings updated in real-time</p>
          </div>
        </div>

        {/* Search Input & Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-56 bg-slate-900/60 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-slate-100 transition-colors hover:bg-slate-800/60 rounded-xl cursor-pointer"
            title={isExpanded ? "Collapse View" : "Expand View"}
          >
            {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sub-Filters Tabs */}
      <div className="flex border-b border-slate-800/40 mb-6">
        <button
          onClick={() => setStandingsTab("general")}
          className={`px-4 py-2 border-b-2 font-semibold text-sm transition-colors relative -mb-[2px] cursor-pointer ${
            standingsTab === "general" 
              ? "border-amber-500 text-amber-600 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setStandingsTab("fase de grupos")}
          className={`px-4 py-2 border-b-2 font-semibold text-sm transition-colors relative -mb-[2px] cursor-pointer ${
            standingsTab === "fase de grupos" 
              ? "border-amber-500 text-amber-600 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Fase de grupos
        </button>
        <button
          onClick={() => setStandingsTab("16 avos")}
          className={`px-4 py-2 border-b-2 font-semibold text-sm transition-colors relative -mb-[2px] cursor-pointer ${
            standingsTab === "16 avos" 
              ? "border-amber-500 text-amber-600 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          16 avos
        </button>
        <button
          onClick={() => setStandingsTab("8 vos")}
          className={`px-4 py-2 border-b-2 font-semibold text-sm transition-colors relative -mb-[2px] cursor-pointer ${
            standingsTab === "8 vos" 
              ? "border-amber-500 text-amber-600 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          8 vos
        </button>
        <button
          onClick={() => setStandingsTab("4 tos")}
          className={`px-4 py-2 border-b-2 font-semibold text-sm transition-colors relative -mb-[2px] cursor-pointer ${
            standingsTab === "4 tos" 
              ? "border-amber-500 text-amber-600 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          4 tos
        </button>
      </div>

      {/* Leaderboard Table Container */}
      <div className="overflow-x-auto custom-scrollbar -mx-6 px-6">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="py-4 pl-4 w-16">Rank</th>
              <th className="py-4">Name</th>
              <th className="py-4 text-center">Matches Predicted</th>
              <th className="py-4 text-center">Exact Hits</th>
              <th className="py-4 text-center">Accuracy</th>
              <th className="py-4 pr-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-sm">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => {
                const isTopThree = index < 3;
                const rankColor = 
                  index === 0 ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                  index === 1 ? "bg-slate-300/20 text-slate-200 border-slate-300/30" :
                  index === 2 ? "bg-amber-700/20 text-amber-600 border-amber-700/30" :
                  "bg-slate-800/40 text-slate-400 border-slate-700/30";

                return (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="group hover:bg-slate-800/30 cursor-pointer transition-colors duration-150"
                  >
                    <td className="py-4 pl-4">
                      <div className={`w-7 h-7 flex items-center justify-center rounded-lg border font-bold text-xs ${rankColor}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {user.name}
                    </td>
                    <td className="py-4 text-center text-slate-300">
                      {user.totalPredicted}
                    </td>
                    <td className="py-4 text-center text-slate-300">
                      {user.exactMatches}
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.accuracy >= 50 ? "bg-emerald-500/10 text-emerald-400" :
                        user.accuracy >= 25 ? "bg-amber-500/10 text-amber-400" :
                        user.accuracy > 0 ? "bg-slate-500/10 text-slate-400" :
                        "bg-slate-800 text-slate-500"
                      }`}>
                        {user.accuracy}%
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right font-bold text-slate-100 text-base">
                      {user.displayPoints}
                      <span className="text-xs font-normal text-slate-500 ml-1">pts</span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No family members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-slate-700/40 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-100">{selectedUser.name}&apos;s Predictions</h3>
                  <p className="text-xs text-slate-400">Historical performance & scores</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Stats */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-slate-950/40 border-b border-slate-800/80 text-center">
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                <span className="block text-xs text-slate-400 uppercase tracking-wide mb-1">Total Points</span>
                <span className="text-xl font-bold text-slate-100">{selectedUserDisplay ? selectedUserDisplay.displayPoints : 0}</span>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                <span className="block text-xs text-slate-400 uppercase tracking-wide mb-1">Exact Hits</span>
                <span className="text-xl font-bold text-emerald-400">
                  {selectedUserDisplay ? selectedUserDisplay.exactMatches : 0}
                </span>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                <span className="block text-xs text-slate-400 uppercase tracking-wide mb-1">Accuracy</span>
                <span className="text-xl font-bold text-blue-400">
                  {selectedUserDisplay ? selectedUserDisplay.accuracy : 0}%
                </span>
              </div>
            </div>

            {/* Modal Body: Prediction Log */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {selectedUserDisplay && selectedUserDisplay.betting_scores.length > 0 ? (
                [...selectedUserDisplay.betting_scores]
                  .filter(pred => {
                    const match = matches.find(m => m.id === pred.match_id);
                    if (!match) return false;
                    if (standingsTab === "general") return true;
                    return match.phase === standingsTab;
                  })
                  .map(pred => {
                    const match = matches.find(m => m.id === pred.match_id);
                    return { pred, match };
                  })
                  // Show finished/live matches first, then scheduled, sorted by date
                  .sort((a, b) => {
                    if (!a.match || !b.match) return 0;
                    const statusOrder = { finished: 0, live: 1, scheduled: 2 };
                    if (statusOrder[a.match.status] !== statusOrder[b.match.status]) {
                      return statusOrder[a.match.status] - statusOrder[b.match.status];
                    }
                    return new Date(a.match.match_date).getTime() - new Date(b.match.match_date).getTime();
                  })
                  .map(({ pred, match }) => {
                    if (!match) return null;

                    const isFinished = match.status === "finished";
                    const isLive = match.status === "live";

                    // Determine prediction outcome type & display badge
                    let badge = (
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" /> Scheduled
                      </span>
                    );
                    let pointsText = "";
                    let cardBorder = "border-slate-800/60";

                    if (isFinished && match.actual_home_score !== null && match.actual_away_score !== null) {
                      const exact = pred.predicted_home_score === match.actual_home_score && pred.predicted_away_score === match.actual_away_score;
                      const correctOutcome =
                        (pred.predicted_home_score > pred.predicted_away_score && match.actual_home_score > match.actual_away_score) ||
                        (pred.predicted_home_score < pred.predicted_away_score && match.actual_home_score < match.actual_away_score) ||
                        (pred.predicted_home_score === pred.predicted_away_score && match.actual_home_score === match.actual_away_score);

                      if (exact) {
                        badge = (
                          <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Exact Hit
                          </span>
                        );
                        pointsText = `+${pointStructure.exact_match_points} pts`;
                        cardBorder = "border-emerald-500/20 bg-emerald-950/5";
                      } else if (correctOutcome) {
                        badge = (
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct Outcome
                          </span>
                        );
                        pointsText = `+${pointStructure.correct_outcome_points} pts`;
                        cardBorder = "border-blue-500/20 bg-blue-950/5";
                      } else {
                        badge = (
                          <span className="px-2 py-0.5 rounded text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" /> Missed
                          </span>
                        );
                        pointsText = `+${pointStructure.loss_points} pts`;
                        cardBorder = "border-rose-500/20 bg-rose-950/5";
                      }
                    } else if (isLive) {
                      badge = (
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center gap-1 animate-pulse font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span> Live Match
                        </span>
                      );
                    }

                    return (
                      <div key={pred.match_id} className={`p-4 rounded-xl border ${cardBorder} flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150`}>
                        {/* Match Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono font-medium">
                              {match.group_stage}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(match.match_date).toLocaleDateString([], { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-slate-200">
                            {match.team_home} vs {match.team_away}
                          </div>
                        </div>

                        {/* Scores & Badges */}
                        <div className="flex items-center gap-4 sm:text-right">
                          <div className="flex items-center gap-3">
                            {/* Prediction */}
                            <div className="text-center">
                              <span className="block text-[10px] text-slate-500 uppercase tracking-wide">Predicted</span>
                              <span className="bg-slate-900/80 text-slate-100 font-mono px-2.5 py-1 rounded border border-slate-800 text-sm font-bold">
                                {pred.predicted_home_score} - {pred.predicted_away_score}
                              </span>
                            </div>

                            {/* Actual Score */}
                            <div className="text-center">
                              <span className="block text-[10px] text-slate-500 uppercase tracking-wide">Actual</span>
                              <span className="bg-slate-950 text-slate-400 font-mono px-2.5 py-1 rounded border border-slate-900 text-sm font-bold">
                                {isFinished ? `${match.actual_home_score} - ${match.actual_away_score}` : "-"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                            {badge}
                            {pointsText && <span className="text-xs font-bold text-slate-200">{pointsText}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="py-8 text-center text-slate-500 text-sm">
                  This user has not made any predictions yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { User, Match } from "@/lib/types";
import { BarChart3, Goal, Award, CheckCircle2, ChevronDown } from "lucide-react";

interface MatchAnalyticsProps {
  users: User[];
  matches: Match[];
}

export default function MatchAnalytics({ users, matches }: MatchAnalyticsProps) {
  // Only show analytics for matches that have predictions, or are finished
  const analyticsMatches = matches.filter(m => {
    const hasPreds = users.some(u => u.betting_scores.some(p => p.match_id === m.id));
    return hasPreds || m.status === "finished";
  });

  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    analyticsMatches.length > 0 ? analyticsMatches[0].id : ""
  );

  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  // Calculate stats for the selected match
  const getMatchStats = () => {
    if (!selectedMatch) return null;

    const matchPreds = users
      .map(u => {
        const pred = u.betting_scores.find(p => p.match_id === selectedMatch.id);
        return pred ? { userName: u.name, ...pred } : null;
      })
      .filter((p): p is { userName: string } & typeof p => p !== null);

    const totalPreds = matchPreds.length;

    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    let totalHomeGoals = 0;
    let totalAwayGoals = 0;

    matchPreds.forEach(p => {
      totalHomeGoals += p.predicted_home_score;
      totalAwayGoals += p.predicted_away_score;

      if (p.predicted_home_score > p.predicted_away_score) {
        homeWins++;
      } else if (p.predicted_home_score < p.predicted_away_score) {
        awayWins++;
      } else {
        draws++;
      }
    });

    const homeWinPct = totalPreds > 0 ? Math.round((homeWins / totalPreds) * 100) : 0;
    const drawPct = totalPreds > 0 ? Math.round((draws / totalPreds) * 100) : 0;
    const awayWinPct = totalPreds > 0 ? Math.round((awayWins / totalPreds) * 100) : 0;

    const avgHomeGoals = totalPreds > 0 ? (totalHomeGoals / totalPreds).toFixed(1) : "0.0";
    const avgAwayGoals = totalPreds > 0 ? (totalAwayGoals / totalPreds).toFixed(1) : "0.0";

    // Who got exact matches
    const exactWinners: string[] = [];
    const isFinished = selectedMatch.status === "finished";
    if (isFinished && selectedMatch.actual_home_score !== null && selectedMatch.actual_away_score !== null) {
      matchPreds.forEach(p => {
        if (
          p.predicted_home_score === selectedMatch.actual_home_score &&
          p.predicted_away_score === selectedMatch.actual_away_score
        ) {
          exactWinners.push(p.userName);
        }
      });
    }

    return {
      totalPreds,
      homeWinPct,
      drawPct,
      awayWinPct,
      avgHomeGoals,
      avgAwayGoals,
      exactWinners,
      isFinished
    };
  };

  const stats = getMatchStats();

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/15 rounded-xl text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">Match Statistics</h2>
            <p className="text-xs text-slate-400">Family predictions & goal distributions</p>
          </div>
        </div>

        {/* Match Selector Dropdown */}
        {analyticsMatches.length > 0 && (
          <div className="relative bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2">
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-100 focus:outline-none cursor-pointer pr-6 appearance-none w-full sm:w-56"
            >
              {analyticsMatches.map(m => (
                <option key={m.id} value={m.id} className="bg-slate-950 text-slate-100">
                  {m.team_home} vs {m.team_away} ({m.group_stage})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>

      {selectedMatch && stats ? (
        <div className="space-y-6">
          
          {/* Main Info Card */}
          <div className="glass-card p-4 rounded-xl flex items-center justify-between border border-slate-800/60 bg-slate-900/20">
            <div className="text-left">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Home Team</span>
              <span className="text-lg font-extrabold text-slate-100">{selectedMatch.team_home}</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                {selectedMatch.status === "finished" ? "Final Score" : "VS"}
              </span>
              <div className="bg-slate-950 px-4 py-1.5 rounded-xl border border-slate-850 font-bold text-lg font-mono">
                {selectedMatch.status === "finished" 
                  ? `${selectedMatch.actual_home_score} - ${selectedMatch.actual_away_score}`
                  : "vs"
                }
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Away Team</span>
              <span className="text-lg font-extrabold text-slate-100">{selectedMatch.team_away}</span>
            </div>
          </div>

          {/* Predictions Distribution (Custom CSS charts) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              Outcome Predictions Distribution
            </h3>
            
            {/* Visual stacked percentage bar */}
            <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-900">
              {stats.totalPreds > 0 ? (
                <>
                  {stats.homeWinPct > 0 && (
                    <div 
                      style={{ width: `${stats.homeWinPct}%` }}
                      className="bg-emerald-500 h-full transition-all duration-300 flex items-center justify-center text-[9px] font-bold text-slate-950"
                      title={`Home Win: ${stats.homeWinPct}%`}
                    >
                      {stats.homeWinPct > 15 && `${stats.homeWinPct}%`}
                    </div>
                  )}
                  {stats.drawPct > 0 && (
                    <div 
                      style={{ width: `${stats.drawPct}%` }}
                      className="bg-slate-500 h-full transition-all duration-300 flex items-center justify-center text-[9px] font-bold text-slate-950"
                      title={`Draw: ${stats.drawPct}%`}
                    >
                      {stats.drawPct > 15 && `${stats.drawPct}%`}
                    </div>
                  )}
                  {stats.awayWinPct > 0 && (
                    <div 
                      style={{ width: `${stats.awayWinPct}%` }}
                      className="bg-indigo-500 h-full transition-all duration-300 flex items-center justify-center text-[9px] font-bold text-white"
                      title={`Away Win: ${stats.awayWinPct}%`}
                    >
                      {stats.awayWinPct > 15 && `${stats.awayWinPct}%`}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600">
                  No predictions made yet
                </div>
              )}
            </div>

            {/* Legend with percentages */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="flex flex-col items-center gap-1">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>
                  {selectedMatch.team_home} Win
                </span>
                <span className="font-bold text-slate-100 text-sm">{stats.homeWinPct}%</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 bg-slate-500 rounded-sm"></span>
                  Draw
                </span>
                <span className="font-bold text-slate-100 text-sm">{stats.drawPct}%</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></span>
                  {selectedMatch.team_away} Win
                </span>
                <span className="font-bold text-slate-100 text-sm">{stats.awayWinPct}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Goal Statistics */}
            <div className="bg-slate-900/30 border border-slate-800/60 p-4 rounded-xl flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Goal className="w-4 h-4 text-emerald-400" /> Avg Predicted Goals
              </h3>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850">
                  <span className="block text-xs text-slate-400 truncate">{selectedMatch.team_home}</span>
                  <span className="text-xl font-black text-slate-100">{stats.avgHomeGoals}</span>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850">
                  <span className="block text-xs text-slate-400 truncate">{selectedMatch.team_away}</span>
                  <span className="text-xl font-black text-slate-100">{stats.avgAwayGoals}</span>
                </div>
              </div>
            </div>

            {/* Exact Match Hits */}
            <div className="bg-slate-900/30 border border-slate-800/60 p-4 rounded-xl flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Exact Match Winners
              </h3>

              <div className="flex-1 flex flex-col justify-center">
                {!stats.isFinished ? (
                  <span className="text-xs text-slate-500 italic block text-center py-2">
                    Match is scheduled. Winners will appear here once finalized.
                  </span>
                ) : stats.exactWinners.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 justify-center py-1">
                    {stats.exactWinners.map(name => (
                      <span 
                        key={name}
                        className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic block text-center py-2">
                    No family member guessed the exact score!
                  </span>
                )}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="py-12 text-center text-slate-500 text-sm">
          No prediction statistics available. Seeding/predictions must exist first.
        </div>
      )}
    </div>
  );
}

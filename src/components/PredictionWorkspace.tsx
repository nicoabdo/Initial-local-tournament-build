"use client";

import { useState } from "react";
import { User, Match } from "@/lib/types";
import { 
  Save, Check, RefreshCw, AlertTriangle, Search, Lock, Unlock, 
  MapPin, Activity, CheckCircle
} from "lucide-react";

interface PredictionWorkspaceProps {
  users: User[];
  matches: Match[];
  pointStructure: {
    exact_match_points: number;
    correct_outcome_points: number;
    loss_points: number;
  };
  unsavedChanges: Record<string, Record<string, { home: number; away: number }>>;
  onPredChange: (userId: string, matchId: string, team: "home" | "away", val: number) => void;
  onSavePredictions: () => Promise<void>;
  onClearLocalChanges: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
}

export default function PredictionWorkspace({
  users,
  matches,
  pointStructure,
  unsavedChanges,
  onPredChange,
  onSavePredictions,
  onClearLocalChanges,
  isSaving,
  saveSuccess
}: PredictionWorkspaceProps) {
  const [stageFilter, setStageFilter] = useState<"all" | "group" | "knockout">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [overrideUnlock, setOverrideUnlock] = useState(false);

  // Sort users by points descending (leaderboard order) for standard presentation
  const sortedUsers = [...users].sort((a, b) => b.total_points - a.total_points);

  // Filter matches based on stage selection and search text
  const filteredMatches = matches.filter(match => {
    // 1. Stage filter
    const isKnockout = ["Round of 16", "Quarter-finals", "Semi-finals", "Final"].includes(match.group_stage);
    if (stageFilter === "group" && isKnockout) return false;
    if (stageFilter === "knockout" && !isKnockout) return false;

    // 2. Search query (teams or group name)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchHome = match.team_home.toLowerCase();
      const matchAway = match.team_away.toLowerCase();
      const matchGroup = match.group_stage.toLowerCase();
      return matchHome.includes(query) || matchAway.includes(query) || matchGroup.includes(query);
    }

    return true;
  });

  // Check which users have unsaved edits
  const modifiedUserIds = Object.keys(unsavedChanges).filter(userId => {
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    const userEdits = unsavedChanges[userId];
    return Object.keys(userEdits).some(matchId => {
      const edit = userEdits[matchId];
      const saved = user.betting_scores.find(p => p.match_id === matchId);
      const savedHome = saved ? saved.predicted_home_score : 0;
      const savedAway = saved ? saved.predicted_away_score : 0;
      return edit.home !== savedHome || edit.away !== savedAway;
    });
  });

  const hasChanges = modifiedUserIds.length > 0;
  const modifiedNames = modifiedUserIds
    .map(id => users.find(u => u.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-6">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 -mt-12 -ml-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/25">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-wide">Predictions Grid</h2>
          <p className="text-xs text-slate-505 font-semibold uppercase tracking-wider text-emerald-600">
            View & edit all participant predictions in real-time
          </p>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
        {/* Stage Filter Tab Buttons */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl border border-slate-300/30 w-full sm:w-auto">
          {(["all", "group", "knockout"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStageFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                stageFilter === tab 
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-550 hover:text-slate-850"
              }`}
            >
              {tab === "all" ? "All Matches" : tab === "group" ? "Group Stage" : "Knockouts"}
            </button>
          ))}
        </div>

        {/* Right side: Lock Toggle & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          {/* Lock / Unlock Toggle Button */}
          <button
            type="button"
            onClick={() => setOverrideUnlock(!overrideUnlock)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer w-full sm:w-auto justify-center ${
              overrideUnlock 
                ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100/60 shadow-sm" 
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-250/60"
            }`}
          >
            {overrideUnlock ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-red-500" />
                <span>Grid Unlocked</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Grid Locked (Standard)</span>
              </>
            )}
          </button>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search teams or groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500/80 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Unsaved changes notice */}
      {hasChanges && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="text-xs text-slate-700">
            Unsaved changes detected for <span className="font-bold text-amber-600">{modifiedNames}</span>. Edits are cached locally in memory. Use the save button below to persist.
          </div>
        </div>
      )}

      {/* Unified Grid Table Scroll Wrapper */}
      <div className="overflow-x-auto border border-slate-200/80 rounded-2xl shadow-inner max-h-[580px] overflow-y-auto custom-scrollbar">
        <table className="w-full border-collapse text-left text-xs text-slate-800">
          
          {/* Sticky Table Header */}
          <thead className="sticky top-0 bg-slate-50 border-b border-slate-200/80 z-20 shadow-sm">
            <tr>
              {/* Sticky first column header */}
              <th className="sticky left-0 bg-slate-50 z-30 p-3 font-bold text-slate-600 min-w-[200px] border-r border-slate-200/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                Match Details
              </th>
              
              {/* User columns */}
              {sortedUsers.map(user => (
                <th key={user.id} className="p-3 text-center min-w-[105px] border-r border-slate-200/30">
                  <div className="font-extrabold text-slate-850 truncate max-w-[95px]" title={user.name}>
                    {user.name}
                  </div>
                  <div className="text-[10px] text-emerald-650 font-bold mt-0.5">
                    {user.total_points} pts
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredMatches.map(match => {
              const isLocked = (match.status === "finished" || match.status === "live") && !overrideUnlock;

              return (
                <tr key={match.id} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* Sticky First Column: Match Details */}
                  <td className="sticky left-0 bg-white z-10 p-3 border-r border-slate-200/60 min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-slate-50">
                    <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                      <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                        {match.group_stage}
                      </span>
                      <span>
                        {new Date(match.match_date).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    
                    <div className="font-bold text-slate-800 flex items-center justify-between gap-1">
                      <span className="truncate">{match.team_home} vs {match.team_away}</span>
                    </div>

                    {/* Official / Live Match Scores */}
                    {match.status === "finished" && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-650 mt-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        <span>FT: {match.actual_home_score} - {match.actual_away_score}</span>
                      </div>
                    )}
                    {match.status === "live" && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 animate-pulse mt-1">
                        <Activity className="w-3 h-3 text-amber-400" />
                        <span>Live: {match.actual_home_score} - {match.actual_away_score}</span>
                      </div>
                    )}
                    {match.status === "scheduled" && (
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1 font-semibold">
                        <Unlock className="w-3 h-3 text-emerald-500/60" />
                        <span>Open for predictions</span>
                      </div>
                    )}
                  </td>

                  {/* Predictions cells per user */}
                  {sortedUsers.map(user => {
                    const savedPred = user.betting_scores.find(p => p.match_id === match.id);
                    const localEdit = unsavedChanges[user.id]?.[match.id];
                    
                    const homeVal = localEdit !== undefined ? localEdit.home : (savedPred ? savedPred.predicted_home_score : 0);
                    const awayVal = localEdit !== undefined ? localEdit.away : (savedPred ? savedPred.predicted_away_score : 0);
                    
                    const isCellEdited = localEdit !== undefined && (savedPred 
                      ? (savedPred.predicted_home_score !== localEdit.home || savedPred.predicted_away_score !== localEdit.away)
                      : (localEdit.home !== 0 || localEdit.away !== 0)
                    );

                    // If match is locked, render static color-coded badge based on points earned
                    if (isLocked) {
                      const points = savedPred ? savedPred.points_earned : null;
                      let cellStyle = "text-slate-400 bg-slate-50/50";
                      let badge = null;

                      if (points !== null && points > 0) {
                        if (points === pointStructure.exact_match_points) {
                          cellStyle = "bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200/60 shadow-sm";
                          badge = <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" title="Exact Hit"></span>;
                        } else {
                          cellStyle = "bg-emerald-50/40 text-slate-700 font-bold border border-emerald-100/40";
                          badge = <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400/60 rounded-full border border-white" title="Correct Outcome"></span>;
                        }
                      } else if (points === 0) {
                        cellStyle = "bg-red-50/10 text-slate-400 border border-slate-100";
                      }

                      return (
                        <td key={user.id} className="p-3 text-center border-r border-slate-200/35 align-middle">
                          <div className="flex justify-center">
                            <div className={`relative px-3 py-1 rounded-xl text-xs font-mono font-bold tracking-wider inline-block text-center min-w-[50px] ${cellStyle}`}>
                              {homeVal} - {awayVal}
                              {badge}
                            </div>
                          </div>
                        </td>
                      );
                    }

                    // Otherwise, render editable text inputs
                    return (
                      <td key={user.id} className={`p-2 text-center border-r border-slate-200/35 align-middle transition-colors ${
                        isCellEdited ? 'bg-amber-500/5' : ''
                      }`}>
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={homeVal}
                            onChange={(e) => {
                              const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                              if (!isNaN(val)) onPredChange(user.id, match.id, "home", val);
                            }}
                            className={`w-7 h-7 text-center font-bold font-mono text-xs bg-slate-50 border rounded-lg focus:outline-none focus:border-emerald-500 transition-all ${
                              isCellEdited 
                                ? 'border-amber-400 text-amber-600 bg-amber-50/40 shadow-inner' 
                                : 'border-slate-200 text-slate-800 hover:border-slate-300'
                            }`}
                          />
                          <span className="text-slate-400 font-mono">-</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={awayVal}
                            onChange={(e) => {
                              const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                              if (!isNaN(val)) onPredChange(user.id, match.id, "away", val);
                            }}
                            className={`w-7 h-7 text-center font-bold font-mono text-xs bg-slate-50 border rounded-lg focus:outline-none focus:border-emerald-500 transition-all ${
                              isCellEdited 
                                ? 'border-amber-400 text-amber-600 bg-amber-50/40 shadow-inner' 
                                : 'border-slate-200 text-slate-800 hover:border-slate-300'
                            }`}
                          />
                        </div>
                      </td>
                    );
                  })}

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Floating Save Actions Banner */}
      {hasChanges && (
        <div className="bg-slate-950/95 border border-emerald-500/25 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>

          <div className="text-center sm:text-left z-10">
            <span className="block text-xs font-bold text-emerald-400">Unsaved predictions cache</span>
            <span className="text-[11px] text-slate-400">
              Unsaved edits detected for: <span className="font-bold text-slate-200">{modifiedNames}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 z-10 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={onClearLocalChanges}
              className="text-xs text-slate-400 hover:text-slate-100 font-bold px-3 py-2 rounded-xl transition-colors hover:bg-slate-900 cursor-pointer"
            >
              Reset Edits
            </button>
            
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-in zoom-in-95">
                <Check className="w-4 h-4" /> Saved!
              </span>
            )}
            
            <button
              onClick={onSavePredictions}
              disabled={isSaving}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-50 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Predictions
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

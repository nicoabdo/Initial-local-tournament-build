"use client";

import { useState } from "react";
import { User, Match, Prediction } from "@/lib/types";
import { 
  Users, UserPlus, Lock, Unlock, Calendar, Save, Plus, Minus, 
  Check, RefreshCw, MapPin, AlertTriangle, ArrowRight, Trash2
} from "lucide-react";

interface PredictionWorkspaceProps {
  users: User[];
  matches: Match[];
  activeUserId: string;
  setActiveUserId: (id: string) => void;
  localEdits: Record<string, { home: number; away: number }>;
  onPredChange: (matchId: string, team: "home" | "away", val: number) => void;
  onSavePredictions: () => Promise<void>;
  onAddUser: (name: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  hasChanges: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
}

export default function PredictionWorkspace({
  users,
  matches,
  activeUserId,
  setActiveUserId,
  localEdits,
  onPredChange,
  onSavePredictions,
  onAddUser,
  onDeleteUser,
  hasChanges,
  isSaving,
  saveSuccess
}: PredictionWorkspaceProps) {
  // Tabs for stage filtering
  const [stageFilter, setStageFilter] = useState<"all" | "group" | "knockout">("all");
  
  // State for user creation
  const [newUserName, setNewUserName] = useState("");
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // States for user deletion
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeUser = users.find(u => u.id === activeUserId) || users[0];

  // Filter matches based on stage selection
  const filteredMatches = matches.filter(match => {
    if (stageFilter === "all") return true;
    const isKnockout = ["Round of 16", "Quarter-finals", "Semi-finals", "Final"].includes(match.group_stage);
    if (stageFilter === "group") return !isKnockout;
    return isKnockout;
  });

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    setIsAddingUser(true);
    await onAddUser(newUserName);
    setNewUserName("");
    setShowAddUserForm(false);
    setIsAddingUser(false);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    await onDeleteUser(userToDelete.id);
    setIsDeleting(false);
    setUserToDelete(null);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-6">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 -mt-12 -ml-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header and User Selection Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/15 rounded-xl text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">Predictions Workspace</h2>
            <p className="text-xs text-slate-400">Cast your scores and compete with family</p>
          </div>
        </div>

        {/* Participant Switcher Dropdown */}
        {activeUser && (
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 shadow-inner">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Predictor:</span>
            <select
              value={activeUserId}
              onChange={(e) => setActiveUserId(e.target.value)}
              className="bg-transparent text-sm font-extrabold text-emerald-400 focus:outline-none cursor-pointer pr-1"
            >
              {users.map(u => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-slate-100">
                  {u.name} ({u.total_points} pts)
                </option>
              ))}
            </select>
            <button 
              onClick={() => setShowAddUserForm(!showAddUserForm)}
              title="Add new family member"
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors ml-1"
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={() => setUserToDelete(activeUser)}
              title={`Delete ${activeUser.name}`}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-red-500 hover:text-red-400 transition-colors ml-1 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Unsaved changes warning alert inside workspace */}
      {hasChanges && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs text-slate-300">
            <span className="font-bold text-amber-400">{activeUser?.name}</span> has unsaved changes. Switch profiles freely; edits are cached in memory, but make sure to save before reloading.
          </div>
        </div>
      )}

      {/* Add User Dropdown Panel */}
      {showAddUserForm && (
        <form onSubmit={handleAddUserSubmit} className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center animate-in slide-in-from-top-4 duration-200">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">New Family Member Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Aunt Maria, cousin Alex..."
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto mt-5 sm:mt-0">
            <button
              type="submit"
              disabled={isAddingUser}
              className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-slate-550 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              {isAddingUser ? "Adding..." : "Add Member"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddUserForm(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Navigation Filter Tabs */}
      <div className="flex border-b border-slate-800/40">
        {(["all", "group", "knockout"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setStageFilter(tab)}
            className={`px-4 py-2 border-b-2 font-semibold text-sm transition-colors relative -mb-[2px] ${
              stageFilter === tab 
                ? "border-emerald-500 text-emerald-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab === "all" ? "All Matches" : tab === "group" ? "Group Stage" : "Knockout Stages"}
          </button>
        ))}
      </div>

      {/* Matches Grid List (Counter Cards) */}
      <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredMatches.map(match => {
          const isLocked = match.status === "finished" || match.status === "live";
          
          // Get values: first check unsaved localEdits, then fall back to saved db score, default to 0
          const savedPred = activeUser?.betting_scores.find(p => p.match_id === match.id);
          const currentPred = localEdits[match.id] || (savedPred 
            ? { home: savedPred.predicted_home_score, away: savedPred.predicted_away_score }
            : { home: 0, away: 0 }
          );

          // Check if this specific row is edited (unsaved)
          const isRowEdited = savedPred 
            ? (savedPred.predicted_home_score !== currentPred.home || savedPred.predicted_away_score !== currentPred.away)
            : (currentPred.home !== 0 || currentPred.away !== 0);

          return (
            <div 
              key={match.id}
              className={`p-4 rounded-2xl transition-all duration-150 border flex flex-col gap-3 ${
                isLocked 
                  ? "bg-slate-950/40 border-slate-900/60 opacity-80" 
                  : isRowEdited
                    ? "bg-amber-500/5 border-amber-500/20 shadow-md shadow-amber-500/2"
                    : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60"
              }`}
            >
              {/* Card Top Details */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-800/20 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 font-semibold">{match.group_stage}</span>
                  <span>•</span>
                  <span>{new Date(match.match_date).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                  <span>•</span>
                  <span>{new Date(match.match_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                {isRowEdited && (
                  <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping"></span> Unsaved Edits
                  </span>
                )}
              </div>

              {/* Card Middle: Matchup Counter Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 py-1">
                
                {/* Team Home Column */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-bold text-slate-200 text-center tracking-wide">{match.team_home}</span>
                  
                  {isLocked ? (
                    <div className="font-extrabold text-xl font-mono text-slate-500 bg-slate-950/60 px-4 py-1 rounded-xl border border-slate-900">
                      {currentPred.home}
                    </div>
                  ) : (
                    /* Stepper Controls */
                    <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800 shadow-inner">
                      <button
                        type="button"
                        onClick={() => onPredChange(match.id, "home", currentPred.home - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-850 hover:bg-slate-800 hover:text-emerald-400 text-slate-400 transition-colors"
                        title="Decrease Home Score"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-black text-slate-100 text-base font-mono">
                        {currentPred.home}
                      </span>
                      <button
                        type="button"
                        onClick={() => onPredChange(match.id, "home", currentPred.home + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-850 hover:bg-slate-800 hover:text-emerald-400 text-slate-400 transition-colors"
                        title="Increase Home Score"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Center Column: VS Separator & Status */}
                <div className="flex flex-col items-center justify-center gap-1 py-2 sm:py-0 border-y sm:border-y-0 sm:border-x border-slate-800/30">
                  {isLocked ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1 text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-500 font-semibold uppercase tracking-wide">
                        <Lock className="w-3 h-3 text-slate-600" /> Locked
                      </div>
                      
                      {match.status === "finished" && (
                        <div className="text-center mt-1">
                          <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Official Score</span>
                          <span className="text-sm font-black text-emerald-400 font-mono">
                            {match.actual_home_score} - {match.actual_away_score}
                          </span>
                        </div>
                      )}
                      {match.status === "live" && (
                        <div className="text-center mt-1">
                          <span className="block text-[9px] text-amber-500 uppercase tracking-wider font-bold animate-pulse">Live Now</span>
                          <span className="text-sm font-black text-amber-400 font-mono">
                            {match.actual_home_score} - {match.actual_away_score}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-bold uppercase tracking-wide">
                        <Unlock className="w-3 h-3 text-emerald-500" /> Open
                      </div>
                      <span className="text-xs text-slate-500 font-bold font-mono">VS</span>
                    </div>
                  )}
                </div>

                {/* Team Away Column */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-bold text-slate-200 text-center tracking-wide">{match.team_away}</span>
                  
                  {isLocked ? (
                    <div className="font-extrabold text-xl font-mono text-slate-500 bg-slate-950/60 px-4 py-1 rounded-xl border border-slate-900">
                      {currentPred.away}
                    </div>
                  ) : (
                    /* Stepper Controls */
                    <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800 shadow-inner">
                      <button
                        type="button"
                        onClick={() => onPredChange(match.id, "away", currentPred.away - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-850 hover:bg-slate-800 hover:text-emerald-400 text-slate-400 transition-colors"
                        title="Decrease Away Score"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-black text-slate-100 text-base font-mono">
                        {currentPred.away}
                      </span>
                      <button
                        type="button"
                        onClick={() => onPredChange(match.id, "away", currentPred.away + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-850 hover:bg-slate-800 hover:text-emerald-400 text-slate-400 transition-colors"
                        title="Increase Away Score"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Venue details */}
              <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                <span>{match.venue || "TBD Stadium"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Save Actions Footer */}
      {hasChanges && (
        <div className="bg-slate-950/90 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 relative overflow-hidden">
          {/* Subtle background overlay */}
          <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>

          <div>
            <span className="block text-xs font-bold text-emerald-400">Unsaved Predictions</span>
            <span className="text-[11px] text-slate-400">Save edits for {activeUser?.name} before switching</span>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
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
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}
      {/* Delete User Modal Confirmation Dialogue */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-red-500/20 p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 rounded-xl text-red-500 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="font-bold text-base text-slate-100">¿Eliminar participante?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ¿Estás seguro de que deseas eliminar a <span className="font-bold text-red-400">{userToDelete.name}</span> de la quiniela? Esta acción borrará permanentemente todas sus predicciones y no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end border-t border-slate-800/40 pt-4">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-650 disabled:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Eliminando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

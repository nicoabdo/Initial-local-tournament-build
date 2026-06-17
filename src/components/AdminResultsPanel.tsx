"use client";

import { useState, useEffect } from "react";
import { Match, User } from "@/lib/types";
import { 
  ShieldAlert, Play, CheckCircle, Calendar, RefreshCw, Save, 
  MapPin, AlertTriangle, ArrowRight, Activity, Users, Trash2, X 
} from "lucide-react";

interface AdminResultsPanelProps {
  users: User[];
  matches: Match[];
  onUpdateMatch: (matchId: string, home: number | null, away: number | null, status: 'scheduled' | 'live' | 'finished') => Promise<void>;
  onRecalculate: () => Promise<void>;
  onAddUser: (name: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export default function AdminResultsPanel({
  users,
  matches,
  onUpdateMatch,
  onRecalculate,
  onAddUser,
  onDeleteUser
}: AdminResultsPanelProps) {
  // Local state for admin inputs (keyed by matchId)
  const [adminScores, setAdminScores] = useState<Record<string, { home: number | ""; away: number | ""; status: 'scheduled' | 'live' | 'finished' }>>({});
  const [updatingMatchId, setUpdatingMatchId] = useState<string | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcSuccess, setRecalcSuccess] = useState(false);

  // States for user deletion confirmation dialog
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showManageParticipants, setShowManageParticipants] = useState(false);
  
  // State for user creation inside admin panel
  const [newUserName, setNewUserName] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    setIsAddingUser(true);
    await onAddUser(newUserName);
    setNewUserName("");
    setIsAddingUser(false);
  };

  // Sync matches with local form states
  useEffect(() => {
    const initialScores: Record<string, { home: number | ""; away: number | ""; status: 'scheduled' | 'live' | 'finished' }> = {};
    matches.forEach(m => {
      initialScores[m.id] = {
        home: m.actual_home_score !== null ? m.actual_home_score : "",
        away: m.actual_away_score !== null ? m.actual_away_score : "",
        status: m.status
      };
    });
    setAdminScores(initialScores);
  }, [matches]);

  // Filters for matches: "all", "active" (live/finished), "scheduled"
  const [filterType, setFilterType] = useState<"all" | "active" | "scheduled">("all");

  const filteredMatches = matches.filter(match => {
    if (filterType === "all") return true;
    if (filterType === "active") return match.status === "live" || match.status === "finished";
    return match.status === "scheduled";
  });

  const handleAdminScoreChange = (matchId: string, team: "home" | "away", val: string) => {
    const current = adminScores[matchId] || { home: "", away: "", status: "scheduled" };
    const intVal = val === "" ? "" : Math.max(0, parseInt(val) || 0);
    setAdminScores({
      ...adminScores,
      [matchId]: {
        ...current,
        [team]: intVal
      }
    });
  };

  const handleAdminStatusChange = (matchId: string, status: 'scheduled' | 'live' | 'finished') => {
    const current = adminScores[matchId] || { home: "", away: "", status: "scheduled" };
    
    // Auto-fill defaults if transitioning to live or finished
    let homeScore = current.home;
    let awayScore = current.away;
    if ((status === 'finished' || status === 'live') && (homeScore === "" || awayScore === "")) {
      homeScore = homeScore === "" ? 0 : homeScore;
      awayScore = awayScore === "" ? 0 : awayScore;
    }

    setAdminScores({
      ...adminScores,
      [matchId]: {
        ...current,
        status,
        home: homeScore,
        away: awayScore
      }
    });
  };

  const handleSaveMatchOutcome = async (matchId: string) => {
    const scoreState = adminScores[matchId];
    if (!scoreState) return;

    setUpdatingMatchId(matchId);
    
    const hScore = scoreState.home === "" ? null : Number(scoreState.home);
    const aScore = scoreState.away === "" ? null : Number(scoreState.away);
    const mStatus = scoreState.status;

    await onUpdateMatch(matchId, hScore, aScore, mStatus);
    setUpdatingMatchId(null);
  };

  const handleManualRecalc = async () => {
    setIsRecalculating(true);
    await onRecalculate();
    setIsRecalculating(false);
    setRecalcSuccess(true);
    setTimeout(() => setRecalcSuccess(false), 3000);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    await onDeleteUser(userToDelete.id);
    setIsDeleting(false);
    setUserToDelete(null);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-6 border border-amber-500/10">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/15 rounded-xl text-amber-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">Official Results Panel</h2>
            <p className="text-xs text-slate-400">Record definitive scores and manage prediction lockouts</p>
          </div>
        </div>

        {/* Global Standings Recalculator Button */}
        <button
          onClick={handleManualRecalc}
          disabled={isRecalculating}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-600 text-xs px-3.5 py-2 rounded-xl transition-all shadow shadow-amber-500/2 cursor-pointer animate-fade-in"
        >
          {isRecalculating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {recalcSuccess ? "Recalculation Complete!" : "Force Standings Recalc"}
        </button>
      </div>

      {/* Administrator Notice explaining auto-locking and auto-points */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-amber-600">Administrator Notice:</span> Saving a match status as <span className="font-semibold text-emerald-600">Finished</span> will instantly lock all family predictions for that Match ID (making them read-only) and trigger a full point recalculation across all tournament participants.
        </div>
      </div>

      {/* Manage Participants Accordion Panel */}
      <div className="bg-slate-900/30 border border-slate-800/85 rounded-xl p-4 flex flex-col gap-3">
        <button 
          type="button"
          onClick={() => setShowManageParticipants(!showManageParticipants)}
          className="flex items-center justify-between w-full font-bold text-sm text-slate-200 hover:text-emerald-400 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Manage Tournament Participants ({users.length})
          </span>
          <span className="text-xs text-slate-500 font-normal hover:text-emerald-400">
            {showManageParticipants ? "Hide List ▲" : "Show List ▼"}
          </span>
        </button>

        {showManageParticipants && (
          <div className="flex flex-col gap-4 pt-2 border-t border-slate-800/40 animate-in fade-in duration-200">
            {/* Inline Add Participant Form */}
            <form onSubmit={handleAddUserSubmit} className="flex flex-col sm:flex-row gap-2 items-center bg-slate-950/40 border border-slate-900 p-3 rounded-xl">
              <input
                type="text"
                required
                placeholder="New participant name..."
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full sm:flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
              />
              <button
                type="submit"
                disabled={isAddingUser}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-50 font-bold px-4 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              >
                {isAddingUser ? "Adding..." : "Add Participant"}
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {users.length > 0 ? (
              users.map(u => (
                <div 
                  key={u.id} 
                  className="bg-slate-950/60 border border-slate-900 px-3 py-2 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate font-semibold text-slate-300">
                    {u.name} <span className="text-[10px] text-slate-500 font-normal">({u.total_points} pts)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUserToDelete(u)}
                    className="p-1.5 rounded hover:bg-red-500/10 text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                    title={`Delete ${u.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-4 text-center text-slate-500 text-xs">
                No active participant profiles found.
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Sub-Filters Tabs */}
      <div className="flex border-b border-slate-800/40">
        {(["all", "active", "scheduled"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-4 py-2 border-b-2 font-semibold text-sm transition-colors relative -mb-[2px] ${
              filterType === tab 
                ? "border-amber-500 text-amber-600 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab === "all" ? "All Games" : tab === "active" ? "Live / Completed" : "Upcoming Scheduled"}
          </button>
        ))}
      </div>

      {/* Admin Matches List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredMatches.length > 0 ? (
          filteredMatches.map(match => {
            const isMatchFinished = match.status === "finished";
            const isMatchLive = match.status === "live";
            const state = adminScores[match.id] || { home: "", away: "", status: "scheduled" };

            // Row Highlight Classes
            let rowBorder = "border-slate-800/80 bg-slate-900/40";
            if (isMatchFinished) {
              rowBorder = "border-emerald-500/10 bg-emerald-950/5";
            } else if (isMatchLive) {
              rowBorder = "border-amber-500/20 bg-amber-950/5";
            }

            return (
              <div 
                key={match.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-150 ${rowBorder}`}
              >
                {/* Left: Match metadata */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono font-medium">
                      {match.group_stage}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(match.match_date).toLocaleDateString([], { month: "short", day: "numeric" })} at {new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <span>{match.team_home}</span>
                    <span className="text-xs text-slate-500 font-normal">vs</span>
                    <span>{match.team_away}</span>
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-650" />
                    <span>{match.venue}</span>
                  </div>
                </div>

                {/* Middle: Live/Finished flags & score inputs */}
                <div className="flex items-center gap-4">
                  
                  {/* Status Indicator Badges */}
                  <div className="hidden sm:flex flex-col items-end gap-1.5">
                    {isMatchFinished && (
                      <span className="text-emerald-600 bg-emerald-500/15 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-inner">
                        <CheckCircle className="w-3 h-3" /> Finished
                      </span>
                    )}
                    {isMatchLive && (
                      <span className="text-amber-600 bg-amber-500/15 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse shadow-inner">
                        <Activity className="w-3 h-3" /> Live
                      </span>
                    )}
                    {!isMatchFinished && !isMatchLive && (
                      <span className="text-slate-500 bg-slate-900 border border-slate-850 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                        Scheduled
                      </span>
                    )}
                  </div>

                  {/* Definitive score inputs & status selector form */}
                  <div className="flex items-center gap-3 bg-slate-950/70 p-2 rounded-xl border border-slate-900">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        placeholder="Home"
                        value={state.home}
                        onChange={(e) => handleAdminScoreChange(match.id, "home", e.target.value)}
                        className="w-12 bg-slate-900 border border-slate-750/80 rounded px-1.5 py-1 text-center font-black font-mono text-sm text-slate-100 focus:outline-none focus:border-amber-500/50"
                      />
                      <span className="text-slate-655 font-mono font-bold">:</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="Away"
                        value={state.away}
                        onChange={(e) => handleAdminScoreChange(match.id, "away", e.target.value)}
                        className="w-12 bg-slate-900 border border-slate-750/80 rounded px-1.5 py-1 text-center font-black font-mono text-sm text-slate-100 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    {/* Status selection */}
                    <select
                      value={state.status}
                      onChange={(e) => handleAdminStatusChange(match.id, e.target.value as any)}
                      className="bg-slate-900 border border-slate-750/80 text-xs font-semibold text-slate-100 rounded px-1.5 py-1.5 focus:outline-none cursor-pointer"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live</option>
                      <option value="finished">Finished</option>
                    </select>

                    {/* Save row button */}
                    <button
                      onClick={() => handleSaveMatchOutcome(match.id)}
                      disabled={updatingMatchId === match.id}
                      className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-50 font-bold transition-colors cursor-pointer flex items-center justify-center"
                      title="Save definitive result"
                    >
                      {updatingMatchId === match.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-500 text-sm">
            No matches matching criteria.
          </div>
        )}
      </div>

      {/* Delete User Modal Confirmation Dialogue */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-red-500/20 p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 rounded-xl text-red-500 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
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

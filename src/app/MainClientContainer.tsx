"use client";

import { useState } from "react";
import Link from "next/link";
import { Database, PointStructure } from "@/lib/types";
import Leaderboard from "@/components/Leaderboard";
import PredictionWorkspace from "@/components/PredictionWorkspace";
import AdminResultsPanel from "@/components/AdminResultsPanel";
import SettingsPanel from "@/components/SettingsPanel";
import MatchAnalytics from "@/components/MatchAnalytics";
import { 
  saveAllPredictionsAction, 
  updateMatchScoreAction, 
  updateSettingsAction, 
  recalculatePointsAction,
  createNewUserAction,
  deleteUserAction
} from "./actions";
import { Trophy, Compass, Award, ShieldAlert, Sparkles, RefreshCw, Eye, ExternalLink, BarChart3 } from "lucide-react";

interface MainClientContainerProps {
  initialDb: Database;
}

export default function MainClientContainer({ initialDb }: MainClientContainerProps) {
  const [db, setDb] = useState<Database>(initialDb);
  const [activeUserId, setActiveUserId] = useState<string>(
    initialDb.users.length > 0 ? initialDb.users[0].id : ""
  );

  // Layout Tab: 'workspace' (User Prediction Workspace) | '16avos' (16 Avos Phase) | '8vos' (8 Vos Phase) | 'admin' (Admin Results Panel) | 'standings' (Family Standings) | 'statistics' (Match Analytics)
  const [activeTab, setActiveTab] = useState<"workspace" | "16avos" | "8vos" | "admin" | "standings" | "statistics">("workspace");

  // Centralized cache of unsaved predictions: Record<userId, Record<matchId, {home, away}>>
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, Record<string, { home: number; away: number }>>>({});
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);

  // Handler for player predictions grid adjustments
  const handlePredChange = (userId: string, matchId: string, team: "home" | "away", val: number) => {
    const newVal = Math.max(0, val);
    const user = db.users.find(u => u.id === userId);
    if (!user) return;
    
    const userEdits = unsavedChanges[userId] || {};
    const saved = user.betting_scores.find(p => p.match_id === matchId);
    
    const baseHome = saved ? saved.predicted_home_score : 0;
    const baseAway = saved ? saved.predicted_away_score : 0;

    const currentHome = userEdits[matchId] ? userEdits[matchId].home : baseHome;
    const currentAway = userEdits[matchId] ? userEdits[matchId].away : baseAway;

    const updatedHome = team === "home" ? newVal : currentHome;
    const updatedAway = team === "away" ? newVal : currentAway;

    setUnsavedChanges({
      ...unsavedChanges,
      [userId]: {
        ...userEdits,
        [matchId]: { home: updatedHome, away: updatedAway }
      }
    });
  };

  // Handler for saving all predictions globally
  const handleSavePredictions = async () => {
    setIsSaving(true);
    
    // Package edits for all users (only for scheduled open matches)
    const packagedEdits: Record<string, { match_id: string; home: number; away: number }[]> = {};
    
    Object.keys(unsavedChanges).forEach(userId => {
      const userEdits = unsavedChanges[userId];
      const userPredictions = Object.keys(userEdits)
        .filter(matchId => {
          const m = db.matches.find(match => match.id === matchId);
          return !!m;
        })
        .map(matchId => ({
          match_id: matchId,
          home: userEdits[matchId].home,
          away: userEdits[matchId].away
        }));
        
      if (userPredictions.length > 0) {
        packagedEdits[userId] = userPredictions;
      }
    });

    try {
      const updated = await saveAllPredictionsAction(packagedEdits);
      setDb(updated);
      setUnsavedChanges({});
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save predictions:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for admin score edits (automatically locks predictions & triggers standings recalculation)
  const handleUpdateMatch = async (matchId: string, home: number | null, away: number | null, status: 'scheduled' | 'live' | 'finished') => {
    try {
      // 1. Update the match score and status
      const updatedDb = await updateMatchScoreAction(matchId, home, away, status);
      
      // 2. If updated to Finished, trigger point recalculations automatically
      if (status === 'finished') {
        const recalculated = await recalculatePointsAction();
        setDb(recalculated);
      } else {
        setDb(updatedDb);
      }
    } catch (error) {
      console.error("Failed to update match score:", error);
    }
  };

  const handleSaveSettings = async (points: PointStructure) => {
    try {
      const updated = await updateSettingsAction(points);
      setDb(updated);
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  const handleRecalculate = async () => {
    try {
      const updated = await recalculatePointsAction();
      setDb(updated);
    } catch (error) {
      console.error("Failed to recalculate points:", error);
    }
  };

  const handleAddUser = async (name: string) => {
    try {
      const updated = await createNewUserAction(name);
      setDb(updated);
      // Select the newly created user
      const newUser = updated.users.find(u => u.name.toLowerCase() === name.trim().toLowerCase());
      if (newUser) {
        setActiveUserId(newUser.id);
      }
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const updated = await deleteUserAction(userId);
      setDb(updated);
      
      // Clear unsaved cache for the deleted user
      if (unsavedChanges[userId]) {
        const newUnsaved = { ...unsavedChanges };
        delete newUnsaved[userId];
        setUnsavedChanges(newUnsaved);
      }

      // Cascade active profile selection fallback
      if (activeUserId === userId) {
        if (updated.users.length > 0) {
          setActiveUserId(updated.users[0].id);
        } else {
          setActiveUserId("");
        }
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };


  const handleResetData = async () => {
    if (!confirm("Are you sure you want to reset all prediction logs and match outcomes to initial defaults?")) return;
    setGlobalLoading(true);
    try {
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setGlobalLoading(false);
    }
  };

  // Stats calculation
  const leader = [...db.users].sort((a, b) => b.total_points - a.total_points)[0];
  const finishedMatchesCount = db.matches.filter(m => m.status === "finished").length;
  const liveMatchesCount = db.matches.filter(m => m.status === "live").length;
  const totalMatchesCount = db.matches.length;

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative overflow-x-hidden w-full">
      {/* Background glow blur effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main content grid wrapper */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col gap-8">
        
        {/* Navbar Header */}
        <header className="glass-panel rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-500 tracking-tight">
                MUNDIAL 2026
              </h1>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Family Tournament
              </p>
            </div>
          </div>

          {/* Tournament Overview Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 bg-slate-950/40 p-3 rounded-xl border border-slate-900/60 w-full md:w-auto text-center">
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Tournament Leader</span>
              <span className="text-sm font-bold text-amber-600 flex items-center justify-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                {leader ? leader.name : "None"}
              </span>
            </div>
            <div className="border-x border-slate-900 px-3 sm:px-6">
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Games Completed</span>
              <span className="text-sm font-bold text-slate-300">
                {finishedMatchesCount} <span className="text-xs text-slate-600 font-normal">/ {totalMatchesCount}</span>
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Live Matches</span>
              <span className="text-sm font-bold text-amber-600 flex items-center justify-center gap-1.5">
                <span className={`w-2 h-2 rounded-full bg-amber-400 inline-block ${liveMatchesCount > 0 ? 'animate-ping' : ''}`}></span>
                {liveMatchesCount} Live
              </span>
            </div>
          </div>
        </header>

        {/* Module Switching Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-slate-900/80 max-w-2xl w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab("workspace")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-155 cursor-pointer whitespace-nowrap ${
                activeTab === "workspace"
                  ? "bg-emerald-500 text-slate-50 shadow-lg shadow-emerald-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-4 h-4" />
              Fase de grupos
            </button>
            <button
              onClick={() => setActiveTab("16avos")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-155 cursor-pointer whitespace-nowrap ${
                activeTab === "16avos"
                  ? "bg-teal-500 text-slate-50 shadow-lg shadow-teal-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Compass className="w-4 h-4" />
              16 avos
            </button>
            <button
              onClick={() => setActiveTab("8vos")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-155 cursor-pointer whitespace-nowrap ${
                activeTab === "8vos"
                  ? "bg-indigo-500 text-slate-50 shadow-lg shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Compass className="w-4 h-4" />
              8 vos
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-155 cursor-pointer whitespace-nowrap ${
                activeTab === "admin"
                  ? "bg-amber-500 text-slate-50 shadow-lg shadow-amber-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Panel
            </button>
            <button
              onClick={() => setActiveTab("standings")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-155 cursor-pointer ${
                activeTab === "standings"
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Trophy className="w-4 h-4" />
              Standings
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-155 cursor-pointer ${
                activeTab === "statistics"
                  ? "bg-teal-500 text-slate-50 shadow-lg shadow-teal-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Statistics
            </button>
          </div>

          <Link
            href="/leaderboard"
            className="flex items-center justify-center gap-2 bg-slate-950/50 border border-slate-900 hover:border-emerald-500/30 text-slate-300 hover:text-slate-100 text-sm font-bold py-3 px-4 rounded-2xl transition-all shadow w-full sm:w-auto cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span>Open Standings Board</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>
        </div>

        {/* Dashboard Content Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main workspace section (either User Workspace OR Admin Dashboard) */}
          <div className={`${activeTab === "admin" ? "lg:col-span-2" : "lg:col-span-3"} flex flex-col gap-8`}>
            {activeTab === "workspace" && (
              <PredictionWorkspace
                users={db.users}
                matches={db.matches.filter(m => m.phase === "fase de grupos")}
                pointStructure={db.settings.pointStructure}
                unsavedChanges={unsavedChanges}
                onPredChange={handlePredChange}
                onSavePredictions={handleSavePredictions}
                onClearLocalChanges={() => setUnsavedChanges({})}
                isSaving={isSaving}
                saveSuccess={saveSuccess}
                title="Group Stage Predictions Grid"
                subTitle="View & edit all participant predictions for the Group Stage"
              />
            )}
            {activeTab === "16avos" && (
              <PredictionWorkspace
                users={db.users}
                matches={db.matches.filter(m => m.phase === "16 avos")}
                pointStructure={db.settings.pointStructure}
                unsavedChanges={unsavedChanges}
                onPredChange={handlePredChange}
                onSavePredictions={handleSavePredictions}
                onClearLocalChanges={() => setUnsavedChanges({})}
                isSaving={isSaving}
                saveSuccess={saveSuccess}
                title="16 Avos Predictions Grid"
                subTitle="View & edit all participant predictions for the 16 Avos phase"
              />
            )}
            {activeTab === "8vos" && (
              <PredictionWorkspace
                users={db.users}
                matches={db.matches.filter(m => m.phase === "8 vos")}
                pointStructure={db.settings.pointStructure}
                unsavedChanges={unsavedChanges}
                onPredChange={handlePredChange}
                onSavePredictions={handleSavePredictions}
                onClearLocalChanges={() => setUnsavedChanges({})}
                isSaving={isSaving}
                saveSuccess={saveSuccess}
                title="8 Vos Predictions Grid"
                subTitle="View & edit all participant predictions for the 8 Vos phase"
              />
            )}
            {activeTab === "admin" && (
              <AdminResultsPanel
                users={db.users}
                matches={db.matches}
                onUpdateMatch={handleUpdateMatch}
                onRecalculate={handleRecalculate}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
              />
            )}
            {activeTab === "standings" && (
              <Leaderboard
                users={db.users}
                matches={db.matches}
                pointStructure={db.settings.pointStructure}
              />
            )}
            {activeTab === "statistics" && (
              <MatchAnalytics
                users={db.users}
                matches={db.matches}
              />
            )}
          </div>

          {/* Settings panel and options (Admin view only) */}
          {activeTab === "admin" && (
            <div className="flex flex-col gap-8">
              {/* View C: Scoring configuration settings */}
              <SettingsPanel
                pointStructure={db.settings.pointStructure}
                onSaveSettings={handleSaveSettings}
                onRecalculate={handleRecalculate}
              />

              {/* Reset data links */}
              <div className="flex justify-center">
                <button
                  onClick={handleResetData}
                  disabled={globalLoading}
                  className="text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${globalLoading ? 'animate-spin' : ''}`} />
                  Reset tournament to defaults
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-600">
        <p>© 2026 Mundial de Fútbol betting tournament (Quiniela / Prode). Hosted in Canada, USA, and Mexico.</p>
        <p className="mt-1.5 text-[10px]">Built with Next.js (App Router), Tailwind CSS & Lucide React</p>
      </footer>
    </div>
  );
}

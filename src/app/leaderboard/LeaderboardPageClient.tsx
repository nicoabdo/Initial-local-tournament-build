"use client";

import { useState } from "react";
import Link from "next/link";
import { Database } from "@/lib/types";
import Leaderboard from "@/components/Leaderboard";
import { Trophy, ArrowLeft, Sparkles } from "lucide-react";

interface LeaderboardPageClientProps {
  initialDb: Database;
}

export default function LeaderboardPageClient({ initialDb }: LeaderboardPageClientProps) {
  const [db] = useState<Database>(initialDb);

  return (
    <div className="min-h-screen text-slate-200 flex flex-col relative overflow-hidden bg-background">
      {/* Background glow blur effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main container */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col gap-6 relative z-10">
        
        {/* Navigation Bar / Page Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Leaderboard Standings
              </h1>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Mundial 2026 Family Tournament
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/30 text-slate-300 hover:text-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            Back to Predictions
          </Link>
        </header>

        {/* Full Page Leaderboard Table */}
        <main className="flex-1">
          <Leaderboard
            users={db.users}
            matches={db.matches}
            pointStructure={db.settings.pointStructure}
          />
        </main>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-650 z-10">
        <p>© 2026 Mundial de Fútbol betting tournament (Quiniela / Prode).</p>
        <p className="mt-1.5 text-[10px]">Standalone Standings Board View</p>
      </footer>
    </div>
  );
}

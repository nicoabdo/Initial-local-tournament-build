"use client";

import { useState } from "react";
import { PointStructure } from "@/lib/types";
import { Settings, RefreshCw, Save, Check, ShieldAlert } from "lucide-react";

interface SettingsPanelProps {
  pointStructure: PointStructure;
  onSaveSettings: (points: PointStructure) => Promise<void>;
  onRecalculate: () => Promise<void>;
}

export default function SettingsPanel({
  pointStructure,
  onSaveSettings,
  onRecalculate
}: SettingsPanelProps) {
  const [exact, setExact] = useState(pointStructure.exact_match_points);
  const [outcome, setOutcome] = useState(pointStructure.correct_outcome_points);
  const [loss, setLoss] = useState(pointStructure.loss_points);

  const [isSaving, setIsSaving] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [recalcSuccess, setRecalcSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSaveSettings({
      exact_match_points: exact,
      correct_outcome_points: outcome,
      loss_points: loss
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    await onRecalculate();
    setIsRecalculating(false);
    setRecalcSuccess(true);
    setTimeout(() => setRecalcSuccess(false), 3000);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
        <div className="p-3 bg-indigo-500/15 rounded-xl text-indigo-500">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-wide">Scoring Config</h2>
          <p className="text-xs text-slate-400">Define how predictions translate to tournament points</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Exact Match Points */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            Exact Match Score
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              value={exact}
              onChange={(e) => setExact(Number(e.target.value))}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60"
            />
            <span className="text-xs text-slate-500 min-w-[70px]">points</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Gained when score guess is completely correct (e.g. predicted 2-1, ended 2-1).
          </p>
        </div>

        {/* Correct Outcome Points */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            Correct Outcome (Winner/Draw)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              value={outcome}
              onChange={(e) => setOutcome(Number(e.target.value))}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60"
            />
            <span className="text-xs text-slate-500 min-w-[70px]">points</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Gained when outcome is correct but scores mismatch (e.g. predicted 1-0, ended 3-1).
          </p>
        </div>

        {/* Loss Points */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            Wrong Outcome / Loss
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              value={loss}
              onChange={(e) => setLoss(Number(e.target.value))}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60"
            />
            <span className="text-xs text-slate-500 min-w-[70px]">points</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Points given for a completely incorrect guess.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/40">
          {saveSuccess ? (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> Settings Saved!
            </span>
          ) : (
            <span></span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Point Rules
          </button>
        </div>
      </form>

      {/* Recalculate Section */}
      <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex flex-col gap-3.5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Recalculate Standings</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Re-evaluates every user prediction against the actual results of finished matches, using the configured point rules, and updates total scores.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {recalcSuccess ? (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> Leaderboard Updated!
            </span>
          ) : (
            <span></span>
          )}
          <button
            type="button"
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-50 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            {isRecalculating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Recalculate Standings
          </button>
        </div>
      </div>
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { getDatabase, savePredictions, saveAllPredictions, updateMatchScore, updateSettings, recalculatePoints, saveDatabase } from "@/lib/db";
import { PointStructure, Database, User } from "@/lib/types";

export async function getDatabaseAction(): Promise<Database> {
  return getDatabase();
}

export async function savePredictionsAction(
  userId: string,
  predictions: { match_id: string; home: number; away: number }[]
): Promise<Database> {
  savePredictions(userId, predictions);
  const updatedDb = recalculatePoints();
  revalidatePath("/");
  return updatedDb;
}

export async function saveAllPredictionsAction(
  allPredictions: Record<string, { match_id: string; home: number; away: number }[]>
): Promise<Database> {
  saveAllPredictions(allPredictions);
  const updatedDb = recalculatePoints();
  revalidatePath("/");
  return updatedDb;
}

export async function updateMatchScoreAction(
  matchId: string,
  home: number | null,
  away: number | null,
  status: "scheduled" | "live" | "finished"
): Promise<Database> {
  const updatedDb = updateMatchScore(matchId, home, away, status);
  revalidatePath("/");
  return updatedDb;
}

export async function updateSettingsAction(points: PointStructure): Promise<Database> {
  const updatedDb = updateSettings(points);
  revalidatePath("/");
  return updatedDb;
}

export async function recalculatePointsAction(): Promise<Database> {
  const updatedDb = recalculatePoints();
  revalidatePath("/");
  return updatedDb;
}

export async function createNewUserAction(name: string): Promise<Database> {
  const db = getDatabase();
  
  // Clean name
  const cleanName = name.trim();
  if (!cleanName) return db;

  // Check if user already exists
  const exists = db.users.some(u => u.name.toLowerCase() === cleanName.toLowerCase());
  if (exists) return db;

  const newUser: User = {
    id: 'u_' + Date.now(),
    name: cleanName,
    total_points: 0,
    betting_scores: []
  };

  db.users.push(newUser);
  saveDatabase(db);
  revalidatePath("/");
  return db;
}

export async function deleteUserAction(userId: string): Promise<Database> {
  const db = getDatabase();
  db.users = db.users.filter(u => u.id !== userId);
  saveDatabase(db);
  revalidatePath("/");
  return db;
}


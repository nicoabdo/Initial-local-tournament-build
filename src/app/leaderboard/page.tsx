import { getDatabase } from "@/lib/db";
import LeaderboardPageClient from "./LeaderboardPageClient";

export const dynamic = "force-dynamic";

export default function LeaderboardPage() {
  const db = getDatabase();
  
  return (
    <LeaderboardPageClient initialDb={db} />
  );
}

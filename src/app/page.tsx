import { getDatabase } from "@/lib/db";
import MainClientContainer from "./MainClientContainer";

export const dynamic = "force-dynamic";

export default function Home() {
  const initialDb = getDatabase();
  
  return (
    <MainClientContainer initialDb={initialDb} />
  );
}

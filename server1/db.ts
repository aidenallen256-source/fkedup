import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../shared/schema"; // 👈 adjust path, no @ alias unless tsconfig paths are set

const sqlite = new Database("./local.db");
export const db = drizzle(sqlite, { schema });

import pg from "pg";
import { config } from "./config.js";

// Postgres DATE (type id 1082) would become a JS Date and can shift by timezone.
// We keep it as a plain "YYYY-MM-DD" string instead.
pg.types.setTypeParser(1082, (value: string) => value);

// One shared pool of database connections for the whole app.
export const pool = new pg.Pool({ connectionString: config.databaseUrl });

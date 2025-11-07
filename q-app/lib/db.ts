// lib/db.ts
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.PG_BMS_USER || "viewuser",
  host: process.env.PG_BMS_HOST || "172.17.1.77",
  database: process.env.PG_BMS_DB || "uttahosxp",
  password: process.env.PG_BMS_PASSWORD || "viewuser",
  port: Number(process.env.PG_BMS_PORT) || 5432,
});

export default pool;

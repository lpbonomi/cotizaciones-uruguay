import { Database } from "bun:sqlite";
import path from "path";

export function getDb() {
    const dbPath = path.join(__dirname, 'data', 'cache.db');
    const db = new Database(dbPath, { create: true });
    db.query(`
        CREATE TABLE IF NOT EXISTS ultimo_cierre (
            date TEXT,
            last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `).run();
    return db;
}
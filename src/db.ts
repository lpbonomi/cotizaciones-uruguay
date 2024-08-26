import { Database } from "bun:sqlite";

export function getDb() {
    const db = new Database("cache.db", { create: true });
    db.query(`
        CREATE TABLE IF NOT EXISTS ultimo_cierre (
            date TEXT,
            last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `).run();
    return db;
}
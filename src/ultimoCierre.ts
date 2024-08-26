import { getDb } from './db';
import { getSoapClient } from './soapClient';
import { Database } from "bun:sqlite";

export async function obtenerUltimoCierre(cache: boolean = true) {
    const db = getDb();
    if (cache) {
        const cachedDate = cacheGet(db);
        if (cachedDate) {
            return cachedDate
        }
    }

    const client = await getSoapClient('awsultimocierre');
    const [result] = await client.ExecuteAsync({});

    // Format the date to YYYY-MM-DD
    const date = (new Date(result.Salida.Fecha)).toISOString().split('T')[0];

    if (cache) {
        cachePut(db, date);
    }

    return date;
}

function cacheGet(db: Database) {
    const date = db.query(`
        SELECT date FROM ulimo_cierre
        WHERE (date = DATE('now', '-3 hours'))
        OR (last_modified > DATETIME('now', '-30 minutes'));
    `).get() as { date: string } | null;

    return date ? date.date : false;
}

function cachePut(db: Database, date: string): void {
    db.query(`
        INSERT INTO ulimo_cierre (date)
        VALUES (?);
    `).run(date);
}
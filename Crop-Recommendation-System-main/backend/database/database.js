import sqlite3 from "sqlite3";
import { open } from "sqlite";

let db;

export const initDB = async () => {
  db = await open({
    filename: "./database/plantation.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS plantations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      latitude REAL,
      longitude REAL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS ndvi_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plantation_id INTEGER,
      ndvi_value REAL,
      date TEXT
    );
  `);

  return db;
};

export const getDB = () => db;
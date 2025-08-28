import initSqlJs, { Database } from "sql.js";
import { promises as fs } from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/sql-js";
import * as schema from "../shared/schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, "../local.db");

async function ensureSchema(db: Database) {
  const ddl = `
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now')),
    updated_at INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    vat_number TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    payment_terms TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now')),
    updated_at INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    vat_number TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    credit_limit REAL DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s','now')),
    updated_at INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    category TEXT,
    brand TEXT,
    cost_price REAL NOT NULL,
    selling_price REAL NOT NULL,
    wholesale_price REAL,
    stock_quantity INTEGER DEFAULT 0,
    opening_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'pcs',
    created_at INTEGER DEFAULT (strftime('%s','now')),
    updated_at INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS sales_transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    invoice_number TEXT NOT NULL UNIQUE,
    customer_id TEXT,
    customer_name TEXT,
    sale_date INTEGER DEFAULT (strftime('%s','now')),
    subtotal REAL NOT NULL,
    discount_percent REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    vat_enabled INTEGER DEFAULT 1,
    vat_amount REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    payment_method TEXT DEFAULT 'cash',
    payment_status TEXT DEFAULT 'paid',
    user_id TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS sales_transaction_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    sales_transaction_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    discount_percent REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    total_price REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS purchase_transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    bill_number TEXT NOT NULL,
    vendor_id TEXT,
    vendor_name TEXT NOT NULL,
    purchase_date INTEGER DEFAULT (strftime('%s','now')),
    subtotal REAL NOT NULL,
    discount_percent REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    excise_amount REAL DEFAULT 0,
    vat_enabled INTEGER DEFAULT 1,
    vat_amount REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    payment_terms TEXT,
    payment_status TEXT DEFAULT 'pending',
    include_excise_in_accounting INTEGER DEFAULT 0,
    user_id TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS purchase_transaction_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    purchase_transaction_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    discount_percent REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    excise_amount REAL DEFAULT 0,
    total_price REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vat_ledger_entries (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    entry_date INTEGER DEFAULT (strftime('%s','now')),
    entry_type TEXT NOT NULL,
    reference_number TEXT NOT NULL,
    party_name TEXT NOT NULL,
    party_vat_number TEXT,
    taxable_amount REAL NOT NULL,
    vat_amount REAL NOT NULL,
    vat_rate REAL DEFAULT 13,
    status TEXT DEFAULT 'verified',
    sales_transaction_id TEXT,
    purchase_transaction_id TEXT,
    user_id TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  );`;
  db.exec(ddl);
}

async function initDb() {
  const SQL = await initSqlJs({
    locateFile: (file) => path.resolve(process.cwd(), "node_modules/sql.js/dist", file),
  });
  let database: Database;
  try {
    const file = await fs.readFile(DB_PATH);
    database = new SQL.Database(file);
  } catch {
    database = new SQL.Database();
  }
  await ensureSchema(database);
  return database;
}

export const sqlite = await initDb();
export const db = drizzle(sqlite, { schema });

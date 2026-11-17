const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'prime-auto-sales.db'));
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT
);
CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  price REAL NOT NULL,
  status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  vehicle_id INTEGER,
  sale_date TEXT NOT NULL,
  sale_price REAL NOT NULL,
  payment_status TEXT NOT NULL,
  FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY(vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  vehicle_id INTEGER,
  enquiry_date TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY(vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  vehicle_id INTEGER,
  booking_date TEXT NOT NULL,
  status TEXT NOT NULL,
  FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY(vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);
`);
module.exports = db;

-- Prime Auto Sales SQLite schema
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT ''
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
  customerId INTEGER NOT NULL,
  vehicleId INTEGER NOT NULL,
  saleDate TEXT NOT NULL,
  salePrice REAL NOT NULL,
  paymentStatus TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY,
  customerId INTEGER NOT NULL,
  vehicleId INTEGER,
  enquiryDate TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY,
  customerId INTEGER NOT NULL,
  vehicleId INTEGER NOT NULL,
  bookingDate TEXT NOT NULL,
  status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL
);

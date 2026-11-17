const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: '2mb' }));

const collections = {
  customers: {
    table: 'customers',
    fromDb: r => ({ id: r.id, name: r.name, phone: r.phone, email: r.email, address: r.address || '' }),
    columns: ['id', 'name', 'phone', 'email', 'address']
  },
  vehicles: {
    table: 'vehicles',
    fromDb: r => ({ id: r.id, make: r.make, model: r.model, year: r.year, mileage: r.mileage, price: r.price, status: r.status }),
    columns: ['id', 'make', 'model', 'year', 'mileage', 'price', 'status']
  },
  sales: {
    table: 'sales',
    fromDb: r => ({ id: r.id, customerId: r.customer_id, vehicleId: r.vehicle_id, saleDate: r.sale_date, salePrice: r.sale_price, paymentStatus: r.payment_status }),
    columns: ['id', 'customerId', 'vehicleId', 'saleDate', 'salePrice', 'paymentStatus']
  },
  enquiries: {
    table: 'enquiries',
    fromDb: r => ({ id: r.id, customerId: r.customer_id, vehicleId: r.vehicle_id, enquiryDate: r.enquiry_date, message: r.message, status: r.status }),
    columns: ['id', 'customerId', 'vehicleId', 'enquiryDate', 'message', 'status']
  },
  bookings: {
    table: 'bookings',
    fromDb: r => ({ id: r.id, customerId: r.customer_id, vehicleId: r.vehicle_id, bookingDate: r.booking_date, status: r.status }),
    columns: ['id', 'customerId', 'vehicleId', 'bookingDate', 'status']
  }
};

function getCollection(key) {
  const config = collections[key];
  if (!config) return null;
  return { config, rows: db.prepare(`SELECT * FROM ${config.table} ORDER BY id`).all().map(config.fromDb) };
}

app.get('/api/:key', (req, res) => {
  const result = getCollection(req.params.key);
  if (!result) return res.status(404).json({ error: 'Unknown database collection.' });
  res.json(result.rows);
});

app.post('/api/:key', (req, res) => {
  const config = collections[req.params.key];
  if (!config) return res.status(404).json({ error: 'Unknown database collection.' });
  const item = req.body || {};
  if (!Number.isInteger(Number(item.id)) || Number(item.id) < 1) return res.status(400).json({ error: 'A valid record ID is required.' });
  try {
    const maps = {
      customers: ['id','name','phone','email','address'],
      vehicles: ['id','make','model','year','mileage','price','status'],
      sales: ['id','customerId','vehicleId','saleDate','salePrice','paymentStatus'],
      enquiries: ['id','customerId','vehicleId','enquiryDate','message','status'],
      bookings: ['id','customerId','vehicleId','bookingDate','status']
    };
    const columns = maps[req.params.key];
    const sqlColumns = {
      customers: columns,
      vehicles: columns,
      sales: ['id','customer_id','vehicle_id','sale_date','sale_price','payment_status'],
      enquiries: ['id','customer_id','vehicle_id','enquiry_date','message','status'],
      bookings: ['id','customer_id','vehicle_id','booking_date','status']
    }[req.params.key];
    const values = columns.map(k => item[k] === undefined ? null : item[k]);
    const placeholders = sqlColumns.map(() => '?').join(',');
    const updates = sqlColumns.slice(1).map(c => `${c}=excluded.${c}`).join(',');
    db.prepare(`INSERT INTO ${config.table} (${sqlColumns.join(',')}) VALUES (${placeholders}) ON CONFLICT(id) DO UPDATE SET ${updates}`).run(...values);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Could not save this record. Check linked customer/vehicle records and field values.' });
  }
});

app.put('/api/:key', (req, res) => {
  const key = req.params.key;
  const config = collections[key];
  if (!config) return res.status(404).json({ error: 'Unknown database collection.' });
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Expected an array of records.' });
  try {
    const transaction = db.transaction(rows => {
      for (const item of rows) {
        const route = { ...item };
        const columns = {
          customers: ['id','name','phone','email','address'], vehicles: ['id','make','model','year','mileage','price','status'],
          sales: ['id','customerId','vehicleId','saleDate','salePrice','paymentStatus'], enquiries: ['id','customerId','vehicleId','enquiryDate','message','status'],
          bookings: ['id','customerId','vehicleId','bookingDate','status']
        }[key];
        const sqlColumns = columns.map(c => ({customerId:'customer_id',vehicleId:'vehicle_id',saleDate:'sale_date',salePrice:'sale_price',paymentStatus:'payment_status',enquiryDate:'enquiry_date',bookingDate:'booking_date'}[c] || c));
        const vals = columns.map(c => route[c] === undefined ? null : route[c]);
        const updates = sqlColumns.slice(1).map(c => `${c}=excluded.${c}`).join(',');
        db.prepare(`INSERT INTO ${config.table} (${sqlColumns.join(',')}) VALUES (${sqlColumns.map(()=>'?').join(',')}) ON CONFLICT(id) DO UPDATE SET ${updates}`).run(...vals);
      }
    });
    transaction(req.body);
    res.json({ ok: true });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.delete('/api/:key/:id', (req, res) => {
  const config = collections[req.params.key];
  if (!config) return res.status(404).json({ error: 'Unknown database collection.' });
  try {
    db.prepare(`DELETE FROM ${config.table} WHERE id = ?`).run(Number(req.params.id));
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: 'Could not delete this record because it is linked to another record.' });
  }
});

app.use(express.static(path.join(__dirname)));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(PORT, () => console.log(`Prime Auto Sales is running at http://localhost:${PORT}`));

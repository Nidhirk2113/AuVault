import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, Medicine } from './models.js';

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany({}), Medicine.deleteMany({})]);

await User.create({ email: 'admin@clinic.test', passwordHash: await bcrypt.hash('Admin@1234', 12), role: 'admin' });
await User.create({ email: 'pharmacist@clinic.test', passwordHash: await bcrypt.hash('Pharma@1234', 12), role: 'pharmacist' });

const days = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
await Medicine.insertMany([
  { name: 'Paracetamol 500mg', sku: 'PARA-500', batchNo: 'B101', expiryDate: days(400), pricePaise: 200, stock: 250, lowStockThreshold: 50 },
  { name: 'Amoxicillin 250mg', sku: 'AMOX-250', batchNo: 'B102', expiryDate: days(200), pricePaise: 850, stock: 8, lowStockThreshold: 20 },
  { name: 'Sertraline 50mg', sku: 'SERT-50', batchNo: 'B103', expiryDate: days(300), pricePaise: 1200, stock: 90, lowStockThreshold: 30 },
  { name: 'Escitalopram 10mg', sku: 'ESCI-10', batchNo: 'B104', expiryDate: days(20), pricePaise: 1500, stock: 60, lowStockThreshold: 20 },
  { name: 'Olanzapine 5mg', sku: 'OLAN-5', batchNo: 'B105', expiryDate: days(500), pricePaise: 900, stock: 15, lowStockThreshold: 15 },
  { name: 'Lorazepam 1mg', sku: 'LORA-1', batchNo: 'B106', expiryDate: days(-10), pricePaise: 600, stock: 40, lowStockThreshold: 10 },
  { name: 'ORS Sachet', sku: 'ORS-1', batchNo: 'B107', expiryDate: days(600), pricePaise: 150, stock: 300, lowStockThreshold: 60 },
]);

console.log('Seeded. Admin: admin@clinic.test / Admin@1234');
await mongoose.disconnect();

import mongoose from 'mongoose';
const { Schema, model } = mongoose;

// Money is stored as integer paise to avoid floating-point errors.
const User = model('User', new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'pharmacist'], default: 'pharmacist' },
}, { timestamps: true }));

const Medicine = model('Medicine', new Schema({
  name: { type: String, required: true, trim: true, index: true },
  sku: { type: String, required: true, unique: true },
  batchNo: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  pricePaise: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  lowStockThreshold: { type: Number, default: 10, min: 0 },
}, { timestamps: true }));

// Each item stores a snapshot of name and price so history stays correct after edits.
const Dispense = model('Dispense', new Schema({
  items: [{
    medicine: { type: Schema.Types.ObjectId, ref: 'Medicine' },
    name: String,
    batchNo: String,
    quantity: Number,
    unitPricePaise: Number,
  }],
  totalPaise: { type: Number, required: true },
  dispensedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true }));

const AuditLog = model('AuditLog', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  action: String,
  entity: String,
  entityId: String,
  details: Schema.Types.Mixed,
}, { timestamps: true }));

export { User, Medicine, Dispense, AuditLog };

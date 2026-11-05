import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, Medicine } from './models.js';

await mongoose.connect(process.env.MONGO_URI);

const ensureUser = async (email, password, role) => {
  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role,
    });
    console.log(`Created ${role} account: ${email}`);
  } else {
    console.log(`Kept existing account: ${email}`);
  }
};

await ensureUser('admin@clinic.test', 'Admin@1234', 'admin');
await ensureUser('pharmacist@clinic.test', 'Pharma@1234', 'pharmacist');

const days = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

// The original seven demo medicines remain in this list for fresh installations.
// Existing documents are never overwritten: every SKU uses $setOnInsert.
const originalMedicines = [
  { name: 'Paracetamol 500mg', sku: 'PARA-500', category: 'General medicines', batchNo: 'B101', expiryDate: days(400), pricePaise: 200, stock: 250, lowStockThreshold: 50, supplier: 'Aarogya Pharma Distributors', requiresPrescription: false },
  { name: 'Amoxicillin 250mg', sku: 'AMOX-250', category: 'General medicines', batchNo: 'B102', expiryDate: days(200), pricePaise: 850, stock: 8, lowStockThreshold: 20, supplier: 'Aarogya Pharma Distributors', requiresPrescription: true },
  { name: 'Sertraline 50mg', sku: 'SERT-50', category: 'Mental health medicines', batchNo: 'B103', expiryDate: days(300), pricePaise: 1200, stock: 90, lowStockThreshold: 30, supplier: 'Carewell Specialty Pharma', requiresPrescription: true },
  { name: 'Escitalopram 10mg', sku: 'ESCI-10', category: 'Mental health medicines', batchNo: 'B104', expiryDate: days(20), pricePaise: 1500, stock: 60, lowStockThreshold: 20, supplier: 'Carewell Specialty Pharma', requiresPrescription: true },
  { name: 'Olanzapine 5mg', sku: 'OLAN-5', category: 'Mental health medicines', batchNo: 'B105', expiryDate: days(500), pricePaise: 900, stock: 15, lowStockThreshold: 15, supplier: 'Carewell Specialty Pharma', requiresPrescription: true },
  { name: 'Lorazepam 1mg', sku: 'LORA-1', category: 'Mental health medicines', batchNo: 'B106', expiryDate: days(-10), pricePaise: 600, stock: 40, lowStockThreshold: 10, supplier: 'Carewell Specialty Pharma', requiresPrescription: true },
  { name: 'ORS Sachet', sku: 'ORS-1', category: 'Digestive health', batchNo: 'B107', expiryDate: days(600), pricePaise: 150, stock: 300, lowStockThreshold: 60, supplier: 'Aarogya Pharma Distributors', requiresPrescription: false },
];

// Forty additional catalogue entries: eight in each requested category.
// Prices are illustrative demo prices in INR, stored as integer paise.
const additionalMedicines = [
  // General medicines (8)
  { name: 'Ibuprofen 200mg', sku: 'IBU-200', category: 'General medicines', batchNo: 'GEN201', pricePaise: 350, stock: 180, lowStockThreshold: 30, requiresPrescription: false },
  { name: 'Cetirizine 10mg', sku: 'CET-10', category: 'General medicines', batchNo: 'GEN202', pricePaise: 250, stock: 220, lowStockThreshold: 40, requiresPrescription: false },
  { name: 'Diclofenac 50mg', sku: 'DIC-50', category: 'General medicines', batchNo: 'GEN203', pricePaise: 550, stock: 75, lowStockThreshold: 20, requiresPrescription: true },
  { name: 'Azithromycin 500mg', sku: 'AZI-500', category: 'General medicines', batchNo: 'GEN204', pricePaise: 1800, stock: 55, lowStockThreshold: 15, requiresPrescription: true },
  { name: 'Metformin 500mg', sku: 'MET-500', category: 'General medicines', batchNo: 'GEN205', pricePaise: 450, stock: 140, lowStockThreshold: 30, requiresPrescription: true },
  { name: 'Amlodipine 5mg', sku: 'AML-5', category: 'General medicines', batchNo: 'GEN206', pricePaise: 300, stock: 160, lowStockThreshold: 30, requiresPrescription: true },
  { name: 'Atorvastatin 10mg', sku: 'ATO-10', category: 'General medicines', batchNo: 'GEN207', pricePaise: 650, stock: 95, lowStockThreshold: 20, requiresPrescription: true },
  { name: 'Mupirocin 2% Ointment', sku: 'MUP-2-OINT', category: 'General medicines', batchNo: 'GEN208', pricePaise: 4200, stock: 35, lowStockThreshold: 10, requiresPrescription: true },

  // Mental health medicines (8)
  { name: 'Fluoxetine 20mg', sku: 'FLU-20', category: 'Mental health medicines', batchNo: 'PSY201', pricePaise: 900, stock: 70, lowStockThreshold: 20, requiresPrescription: true },
  { name: 'Venlafaxine 37.5mg', sku: 'VEN-37', category: 'Mental health medicines', batchNo: 'PSY202', pricePaise: 1450, stock: 48, lowStockThreshold: 15, requiresPrescription: true },
  { name: 'Duloxetine 30mg', sku: 'DUL-30', category: 'Mental health medicines', batchNo: 'PSY203', pricePaise: 1850, stock: 42, lowStockThreshold: 12, requiresPrescription: true },
  { name: 'Amitriptyline 10mg', sku: 'AMI-10', category: 'Mental health medicines', batchNo: 'PSY204', pricePaise: 500, stock: 65, lowStockThreshold: 15, requiresPrescription: true },
  { name: 'Risperidone 1mg', sku: 'RIS-1', category: 'Mental health medicines', batchNo: 'PSY205', pricePaise: 750, stock: 38, lowStockThreshold: 12, requiresPrescription: true },
  { name: 'Quetiapine 25mg', sku: 'QUE-25', category: 'Mental health medicines', batchNo: 'PSY206', pricePaise: 1100, stock: 52, lowStockThreshold: 15, requiresPrescription: true },
  { name: 'Aripiprazole 10mg', sku: 'ARI-10', category: 'Mental health medicines', batchNo: 'PSY207', pricePaise: 2400, stock: 28, lowStockThreshold: 10, requiresPrescription: true },
  { name: 'Lamotrigine 25mg', sku: 'LAM-25', category: 'Mental health medicines', batchNo: 'PSY208', pricePaise: 950, stock: 44, lowStockThreshold: 12, requiresPrescription: true },

  // Vitamins & supplements (8)
  { name: 'Vitamin C 500mg', sku: 'VIT-C500', category: 'Vitamins & supplements', batchNo: 'VIT201', pricePaise: 500, stock: 200, lowStockThreshold: 40, requiresPrescription: false },
  { name: 'Vitamin D3 1000 IU', sku: 'VIT-D3-1K', category: 'Vitamins & supplements', batchNo: 'VIT202', pricePaise: 850, stock: 125, lowStockThreshold: 25, requiresPrescription: false },
  { name: 'Vitamin B-Complex', sku: 'VIT-BCOMP', category: 'Vitamins & supplements', batchNo: 'VIT203', pricePaise: 650, stock: 150, lowStockThreshold: 30, requiresPrescription: false },
  { name: 'Calcium + Vitamin D3', sku: 'CAL-D3', category: 'Vitamins & supplements', batchNo: 'VIT204', pricePaise: 1100, stock: 105, lowStockThreshold: 25, requiresPrescription: false },
  { name: 'Zinc 20mg', sku: 'ZINC-20', category: 'Vitamins & supplements', batchNo: 'VIT205', pricePaise: 400, stock: 170, lowStockThreshold: 35, requiresPrescription: false },
  { name: 'Folic Acid 5mg', sku: 'FOL-5', category: 'Vitamins & supplements', batchNo: 'VIT206', pricePaise: 250, stock: 90, lowStockThreshold: 20, requiresPrescription: true },
  { name: 'Iron + Folic Acid', sku: 'IRON-FA', category: 'Vitamins & supplements', batchNo: 'VIT207', pricePaise: 550, stock: 115, lowStockThreshold: 25, requiresPrescription: false },
  { name: 'Multivitamin Tablets', sku: 'MULTI-VIT', category: 'Vitamins & supplements', batchNo: 'VIT208', pricePaise: 1250, stock: 80, lowStockThreshold: 20, requiresPrescription: false },

  // Digestive health (8)
  { name: 'Pantoprazole 40mg', sku: 'PAN-40', category: 'Digestive health', batchNo: 'DIG201', pricePaise: 700, stock: 130, lowStockThreshold: 25, requiresPrescription: true },
  { name: 'Lactulose Syrup 100ml', sku: 'LAC-SYR-100', category: 'Digestive health', batchNo: 'DIG202', pricePaise: 950, stock: 45, lowStockThreshold: 12, requiresPrescription: false },
  { name: 'Simethicone  simethicone 80mg', sku: 'SIM-80', category: 'Digestive health', batchNo: 'DIG203', pricePaise: 450, stock: 85, lowStockThreshold: 20, requiresPrescription: false },
  { name: 'Dicyclomine 10mg', sku: 'DICYC-10', category: 'Digestive health', batchNo: 'DIG204', pricePaise: 600, stock: 55, lowStockThreshold: 15, requiresPrescription: true },
  { name: 'Domperidone 10mg', sku: 'DOM-10', category: 'Digestive health', batchNo: 'DIG205', pricePaise: 500, stock: 70, lowStockThreshold: 18, requiresPrescription: true },
  { name: 'Probiotic Capsules', sku: 'PROBIO-CAP', category: 'Digestive health', batchNo: 'DIG206', pricePaise: 1800, stock: 32, lowStockThreshold: 10, requiresPrescription: false },
  { name: 'Antacid Suspension 170ml', sku: 'ANT-SUS-170', category: 'Digestive health', batchNo: 'DIG207', pricePaise: 1250, stock: 60, lowStockThreshold: 15, requiresPrescription: false },
  { name: 'Bisacodyl 5mg', sku: 'BISA-5', category: 'Digestive health', batchNo: 'DIG208', pricePaise: 350, stock: 95, lowStockThreshold: 20, requiresPrescription: false },

  // Cold & respiratory (8)
  { name: 'Levocetirizine 5mg', sku: 'LEVO-5', category: 'Cold & respiratory', batchNo: 'RES201', pricePaise: 400, stock: 145, lowStockThreshold: 30, requiresPrescription: false },
  { name: 'Ambroxol Syrup 100ml', sku: 'AMB-SYR-100', category: 'Cold & respiratory', batchNo: 'RES202', pricePaise: 850, stock: 65, lowStockThreshold: 15, requiresPrescription: false },
  { name: 'Saline Nasal Spray 20ml', sku: 'SAL-NAS-20', category: 'Cold & respiratory', batchNo: 'RES203', pricePaise: 950, stock: 50, lowStockThreshold: 12, requiresPrescription: false },
  { name: 'Dextromethorphan Syrup 100ml', sku: 'DEX-SYR-100', category: 'Cold & respiratory', batchNo: 'RES204', pricePaise: 1050, stock: 42, lowStockThreshold: 12, requiresPrescription: true },
  { name: 'Montelukast 10mg', sku: 'MON-10', category: 'Cold & respiratory', batchNo: 'RES205', pricePaise: 900, stock: 58, lowStockThreshold: 15, requiresPrescription: true },
  { name: 'Budesonide Inhaler 200mcg', sku: 'BUD-INH-200', category: 'Cold & respiratory', batchNo: 'RES206', pricePaise: 18500, stock: 18, lowStockThreshold: 6, requiresPrescription: true },
  { name: 'Guaifenesin Syrup 100ml', sku: 'GUA-SYR-100', category: 'Cold & respiratory', batchNo: 'RES207', pricePaise: 750, stock: 72, lowStockThreshold: 18, requiresPrescription: false },
  { name: 'Oxymetazoline Nasal Drops', sku: 'OXY-NAS', category: 'Cold & respiratory', batchNo: 'RES208', pricePaise: 650, stock: 38, lowStockThreshold: 10, requiresPrescription: false },
];

const suppliers = [
  'Aarogya Pharma Distributors',
  'CityCare Medical Supplies',
  'Carewell Specialty Pharma',
  'Bengaluru Medico Wholesale',
];

const allMedicines = [
  ...originalMedicines,
  ...additionalMedicines.map((medicine, index) => ({
    ...medicine,
    batchNo: medicine.batchNo,
    expiryDate: days(240 + (index % 12) * 45),
    supplier: suppliers[index % suppliers.length],
  })),
];

let inserted = 0;
let existing = 0;

for (const medicine of allMedicines) {
  const result = await Medicine.updateOne(
    { sku: medicine.sku },
    { $setOnInsert: medicine },
    { upsert: true, runValidators: true }
  );
  if (result.upsertedCount === 1) inserted += 1;
  else existing += 1;
}

const total = await Medicine.countDocuments();
console.log(`Inventory seed complete. Added: ${inserted}; already present: ${existing}; total medicines: ${total}.`);
console.log('Demo admin: admin@clinic.test / Admin@1234');
console.log('Demo pharmacist: pharmacist@clinic.test / Pharma@1234');
await mongoose.disconnect();

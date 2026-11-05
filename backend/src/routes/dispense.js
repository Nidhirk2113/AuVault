import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Medicine, Dispense } from '../models.js';
import { authenticate } from '../middleware/auth.js';
import { HttpError } from '../middleware/errors.js';
import { audit } from '../audit.js';

const router = Router();
router.use(authenticate);

const dispenseSchema = z.object({
  items: z.array(z.object({
    medicineId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid medicine id'),
    quantity: z.number().int().positive(),
  })).min(1),
});

// Dispense medicines: all items succeed together or nothing changes.
router.post('/', async (req, res) => {
  const { items } = dispenseSchema.parse(req.body);

  // Merge duplicate lines for the same medicine
  const wanted = new Map();
  for (const { medicineId, quantity } of items) {
    wanted.set(medicineId, (wanted.get(medicineId) || 0) + quantity);
  }

  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const lines = [];
      let totalPaise = 0;

      for (const [medicineId, quantity] of wanted) {
        // Atomic conditional update: only succeeds if enough stock AND not expired.
        // Stock can never go negative, even if two pharmacists race for the last unit.
        const medicine = await Medicine.findOneAndUpdate(
          { _id: medicineId, stock: { $gte: quantity }, expiryDate: { $gt: new Date() } },
          { $inc: { stock: -quantity } },
          { new: true, session }
        );

        if (!medicine) {
          // Work out why it failed so the error message is useful
          const existing = await Medicine.findById(medicineId).session(session);
          if (!existing) throw new HttpError(404, 'Medicine not found');
          if (existing.expiryDate <= new Date()) throw new HttpError(409, `${existing.name} (batch ${existing.batchNo}) is expired`);
          throw new HttpError(409, `Insufficient stock for ${existing.name}: ${existing.stock} left`);
        }

        lines.push({
          medicine: medicine._id,
          name: medicine.name,
          batchNo: medicine.batchNo,
          quantity,
          unitPricePaise: medicine.pricePaise,
        });
        totalPaise += quantity * medicine.pricePaise;
      }

      const [dispense] = await Dispense.create(
        [{ items: lines, totalPaise, dispensedBy: req.user.id }],
        { session }
      );
      await audit(req.user, 'DISPENSE', 'Dispense', dispense._id, { totalPaise, lines: lines.length }, session);
      result = dispense;
    });
  } finally {
    await session.endSession();
  }

  res.status(201).json(result);
});

router.get('/', async (req, res) => {
  res.json(await Dispense.find().sort({ createdAt: -1 }).limit(50));
});

export default router;

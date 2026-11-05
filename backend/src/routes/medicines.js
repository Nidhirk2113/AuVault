import { Router } from 'express';
import { z } from 'zod';
import { Medicine } from '../models.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { HttpError } from '../middleware/errors.js';
import { audit } from '../audit.js';

const router = Router();
router.use(authenticate);

const medicineSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  batchNo: z.string().min(1),
  expiryDate: z.coerce.date(),
  pricePaise: z.number().int().min(0),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(10),
});

router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.q) {
    const escaped = String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.name = { $regex: escaped, $options: 'i' };
  }
  res.json(await Medicine.find(filter).sort({ name: 1 }));
});

router.post('/', requireRole('admin'), async (req, res) => {
  const medicine = await Medicine.create(medicineSchema.parse(req.body));
  await audit(req.user, 'CREATE', 'Medicine', medicine._id, { name: medicine.name });
  res.status(201).json(medicine);
});

router.put('/:id', requireRole('admin'), async (req, res) => {
  const medicine = await Medicine.findByIdAndUpdate(req.params.id, medicineSchema.parse(req.body), {
    new: true,
    runValidators: true,
  });
  if (!medicine) throw new HttpError(404, 'Medicine not found');
  await audit(req.user, 'UPDATE', 'Medicine', medicine._id, { name: medicine.name });
  res.json(medicine);
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  const medicine = await Medicine.findByIdAndDelete(req.params.id);
  if (!medicine) throw new HttpError(404, 'Medicine not found');
  await audit(req.user, 'DELETE', 'Medicine', medicine._id, { name: medicine.name });
  res.status(204).end();
});

export default router;

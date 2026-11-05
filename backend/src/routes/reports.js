import { Router } from 'express';
import { Medicine, Dispense, AuditLog } from '../models.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// Low stock, expiring within 30 days, and already expired
router.get('/alerts', async (req, res) => {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const [lowStock, expiringSoon, expired] = await Promise.all([
    Medicine.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] }, expiryDate: { $gt: now } }).sort({ stock: 1 }),
    Medicine.find({ expiryDate: { $gt: now, $lte: in30Days } }).sort({ expiryDate: 1 }),
    Medicine.find({ expiryDate: { $lte: now } }).sort({ expiryDate: -1 }),
  ]);
  res.json({ lowStock, expiringSoon, expired });
});

// Dashboard data: revenue, sales per day, top dispensed medicines
router.get('/stats', async (req, res) => {
  const [totals, byDay, top] = await Promise.all([
    Dispense.aggregate([{ $group: { _id: null, revenuePaise: { $sum: '$totalPaise' }, count: { $sum: 1 } } }]),
    Dispense.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, totalPaise: { $sum: '$totalPaise' } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', totalPaise: 1 } },
    ]),
    Dispense.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', units: { $sum: '$items.quantity' } } },
      { $sort: { units: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: '$_id', units: 1 } },
    ]),
  ]);
  res.json({
    revenuePaise: totals[0]?.revenuePaise ?? 0,
    dispenseCount: totals[0]?.count ?? 0,
    salesByDay: byDay,
    topMedicines: top,
  });
});

router.get('/audit', requireRole('admin'), async (req, res) => {
  res.json(await AuditLog.find().sort({ createdAt: -1 }).limit(100).populate('user', 'email role'));
});

export default router;

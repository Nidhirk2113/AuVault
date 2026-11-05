import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models.js';
import { HttpError } from '../middleware/errors.js';

const router = Router();
const creds = z.object({ email: z.string().email(), password: z.string().min(8) });
const sign = (u) => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

// The first account becomes admin; later accounts are pharmacists.
// (In production, admins would create staff accounts instead of open signup.)
router.post('/register', async (req, res) => {
  const { email, password } = creds.parse(req.body);
  const isFirst = (await User.countDocuments()) === 0;
  const user = await User.create({
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: isFirst ? 'admin' : 'pharmacist',
  });
  res.status(201).json({ token: sign(user), role: user.role });
});

router.post('/login', async (req, res) => {
  const { email, password } = creds.parse(req.body);
  const user = await User.findOne({ email });
  // Same message for both failures so attackers can't tell which emails exist.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'Invalid email or password');
  }
  res.json({ token: sign(user), role: user.role });
});

export default router;

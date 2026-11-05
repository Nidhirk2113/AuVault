import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import medicineRoutes from './routes/medicines.js';
import dispenseRoutes from './routes/dispense.js';
import reportRoutes from './routes/reports.js';
import { errorHandler } from './middleware/errors.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/dispense', dispenseRoutes);
app.use('/api/reports', reportRoutes);
app.use(errorHandler);

await mongoose.connect(process.env.MONGO_URI);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import workshopRoutes from './routes/workshop.routes.js';
import workshopImageRoutes from './routes/workshopImages.routes.js';
import registrationRoutes from './routes/registration.routes.js';
import checkinRoutes from './routes/checkin.routes.js';
import jobRoutes from './routes/job.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

// Thêm Logger để in ra Terminal mỗi khi có Request tới
/*app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] Nhận request: ${req.method} ${req.url}`,
  );
  next();
});*/

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/workshops/:id/images', workshopImageRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api', jobRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;

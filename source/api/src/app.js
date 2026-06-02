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

const allowedOrigins = [
  'https://www.unihubworkshop.io.vn',
  'https://unihubworkshop.io.vn',
  'http://localhost:3000',
  'http://localhost:5173',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};

app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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

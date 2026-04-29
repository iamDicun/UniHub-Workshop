import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Thêm Logger để in ra Terminal mỗi khi có Request tới
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] Nhận request: ${req.method} ${req.url}`,
  );
  next();
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;

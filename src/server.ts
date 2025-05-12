import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';
import lobbyRoutes from './routes/lobbyRoutes';
import playerRoutes from './routes/playerRoutes';
import sessionRoutes from './routes/sessionRoutes';
import { logger } from './utils/logger';
import config from './config';

dotenv.config();

// Connect to MongoDB
mongoose.connect(config.mongodbUri)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/lobbies', lobbyRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/sessions', sessionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`API server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  process.exit(0);
});

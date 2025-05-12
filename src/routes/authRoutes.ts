import express from 'express';
import { register, login, walletAuth, getCurrentPlayer } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Register a new player
router.post('/register', register);

// Login a player
router.post('/login', login);

// Authenticate with wallet
router.post('/wallet', walletAuth);

// Get current player
router.get('/me', auth, getCurrentPlayer);

export default router;

import express from 'express';
import { getPlayerById, updatePlayer, getPlayerStats, getTopPlayers } from '../controllers/playerController';
import { auth, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Get player by ID (public)
router.get('/:id', optionalAuth, getPlayerById);

// Update player (authenticated)
router.put('/me', auth, updatePlayer);

// Get player stats (public)
router.get('/:id/stats', optionalAuth, getPlayerStats);

// Get top players (public)
router.get('/top', optionalAuth, getTopPlayers);

export default router;

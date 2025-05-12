import express from 'express';
import { getGames, getGameById, createGame, updateGame } from '../controllers/gameController';
import { auth, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Get all games (public)
router.get('/', optionalAuth, getGames);

// Get game by ID (public)
router.get('/:id', optionalAuth, getGameById);

// Create a new game (admin only)
router.post('/', auth, createGame);

// Update game (admin only)
router.put('/:id', auth, updateGame);

export default router;

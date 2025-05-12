import express from 'express';
import {
  createSession,
  getSessionById,
  updateSessionState,
  endSession,
  getPlayerSessions
} from '../controllers/sessionController';
import { auth, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Create a new session
router.post('/', auth, createSession);

// Get session by ID
router.get('/:id', optionalAuth, getSessionById);

// Update session state
router.put('/:id/state', auth, updateSessionState);

// End session
router.post('/:id/end', auth, endSession);

// Get player sessions
router.get('/player/:playerId', optionalAuth, getPlayerSessions);

export default router;

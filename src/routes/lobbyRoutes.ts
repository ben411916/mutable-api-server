import express from 'express';
import {
  createLobby,
  getLobbies,
  getLobby,
  joinLobby,
  leaveLobby,
  setPlayerReady,
  startGame
} from '../controllers/lobbyController';
import { optionalAuth } from '../middleware/auth';

const router = express.Router();

// Apply optional auth to all routes
router.use(optionalAuth);

// Get all lobbies
router.get('/', getLobbies);

// Get a specific lobby
router.get('/:id', getLobby);

// Create a new lobby
router.post('/', createLobby);

// Join a lobby
router.post('/:id/join', joinLobby);

// Leave a lobby
router.post('/:id/leave', leaveLobby);

// Set player ready status
router.post('/:id/ready', setPlayerReady);

// Start a game
router.post('/:id/start', startGame);

export default router;

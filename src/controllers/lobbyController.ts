import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Lobby from '../models/Lobby';
import Game from '../models/Game';
import { logger } from '../utils/logger';

// Create a new lobby
export const createLobby = async (req: Request, res: Response) => {
  try {
    const { gameId, hostId, hostName, gameMode, maxPlayers, wager } = req.body;
    
    // Validate required fields
    if (!gameId || !hostId || !gameMode || !maxPlayers) {
      return res.status(400).json({ message: 'Missing required lobby information' });
    }
    
    // Check if game exists
    const game = await Game.findOne({ id: gameId });
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // Find game mode
    const mode = game.modes.find(m => m.id === gameMode);
    
    if (!mode) {
      return res.status(404).json({ message: 'Game mode not found' });
    }
    
    // Create new lobby
    const lobby = new Lobby({
      id: uuidv4(),
      gameId,
      hostId,
      hostName: hostName || 'Anonymous',
      gameMode,
      gameModeName: mode.name,
      maxPlayers,
      wager: wager || 0,
      players: [{ id: hostId, name: hostName || 'Anonymous', isReady: true }], // Host is automatically ready
      status: 'waiting'
    });
    
    await lobby.save();
    
    res.status(201).json({
      message: 'Lobby created successfully',
      lobby
    });
  } catch (error) {
    logger.error('Create lobby error:', error);
    res.status(500).json({ message: 'Failed to create lobby' });
  }
};

// Get all lobbies
export const getLobbies = async (req: Request, res: Response) => {
  try {
    const { gameId, status } = req.query;
    
    // Build query
    const query: any = {};
    
    if (gameId) {
      query.gameId = gameId;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Find lobbies
    const lobbies = await Lobby.find(query).sort({ createdAt: -1 });
    
    res.json({ lobbies });
  } catch (error) {
    logger.error('Get lobbies error:', error);
    res.status(500).json({ message: 'Failed to get lobbies' });
  }
};

// Get a specific lobby
export const getLobby = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find lobby
    const lobby = await Lobby.findOne({ id });
    
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }
    
    res.json({ lobby });
  } catch (error) {
    logger.error('Get lobby error:', error);
    res.status(500).json({ message: 'Failed to get lobby' });
  }
};

// Join a lobby
export const joinLobby = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { playerId, playerName } = req.body;
    
    // Validate required fields
    if (!playerId) {
      return res.status(400).json({ message: 'Player ID is required' });
    }
    
    // Find lobby
    const lobby = await Lobby.findOne({ id });
    
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }
    
    // Check if lobby is full or in progress
    if (lobby.status !== 'waiting') {
      return res.status(400).json({ message: `Cannot join lobby: ${lobby.status}` });
    }
    
    // Check if player is already in the lobby
    if (lobby.players.some(p => p.id === playerId)) {
      return res.status(400).json({ message: 'Player already in lobby' });
    }
    
    // Add player to lobby
    lobby.players.push({
      id: playerId,
      name: playerName || 'Anonymous',
      isReady: false
    });
    
    // Update lobby status if full
    if (lobby.players.length === lobby.maxPlayers) {
      lobby.status = 'full';
    }
    
    await lobby.save();
    
    res.json({
      message: 'Joined lobby successfully',
      lobby
    });
  } catch (error) {
    logger.error('Join lobby error:', error);
    res.status(500).json({ message: 'Failed to join lobby' });
  }
};

// Leave a lobby
export const leaveLobby = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { playerId } = req.body;
    
    // Validate required fields
    if (!playerId) {
      return res.status(400).json({ message: 'Player ID is required' });
    }
    
    // Find lobby
    const lobby = await Lobby.findOne({ id });
    
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }
    
    // Remove player from lobby
    lobby.players = lobby.players.filter(p => p.id !== playerId);
    
    // If host leaves, assign a new host or delete the lobby
    if (playerId === lobby.hostId) {
      if (lobby.players.length > 0) {
        // Assign the next player as host
        const newHost = lobby.players[0];
        lobby.hostId = newHost.id;
        lobby.hostName = newHost.name;
        newHost.isReady = true; // New host is automatically ready
      } else {
        // Delete the lobby if no players left
        await Lobby.deleteOne({ id });
        
        return res.json({
          message: 'Lobby deleted (no players left)',
          lobbyId: id
        });
      }
    }
    
    // Update lobby status
    if (lobby.status === 'full' && lobby.players.length < lobby.maxPlayers) {
      lobby.status = 'waiting';
    }
    
    await lobby.save();
    
    res.json({
      message: 'Left lobby successfully',
      lobby
    });
  } catch (error) {
    logger.error('Leave lobby error:', error);
    res.status(500).json({ message: 'Failed to leave lobby' });
  }
};

// Set player ready status
export const setPlayerReady = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { playerId, isReady } = req.body;
    
    // Validate required fields
    if (!playerId) {
      return res.status(400).json({ message: 'Player ID is required' });
    }
    
    // Find lobby
    const lobby = await Lobby.findOne({ id });
    
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }
    
    // Find player in lobby
    const playerIndex = lobby.players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) {
      return res.status(404).json({ message: 'Player not in lobby' });
    }
    
    // Update player ready status
    lobby.players[playerIndex].isReady = isReady !== undefined ? isReady : !lobby.players[playerIndex].isReady;
    
    await lobby.save();
    
    res.json({
      message: 'Player ready status updated',
      lobby
    });
  } catch (error) {
    logger.error('Set player ready error:', error);
    res.status(500).json({ message: 'Failed to update player ready status' });
  }
};

// Start a game
export const startGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hostId } = req.body;
    
    // Validate required fields
    if (!hostId) {
      return res.status(400).json({ message: 'Host ID is required' });
    }
    
    // Find lobby
    const lobby = await Lobby.findOne({ id });
    
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' });
    }
    
    // Verify that the request is from the host
    if (hostId !== lobby.hostId) {
      return res.status(403).json({ message: 'Only the host can start the game' });
    }
    
    // Check if all players are ready
    const allReady = lobby.players.every(p => p.isReady);
    
    if (!allReady) {
      return res.status(400).json({ message: 'Not all players are ready' });
    }
    
    // Create a new game session ID
    const sessionId = uuidv4();
    
    // Update lobby status
    lobby.status = 'in-progress';
    await lobby.save();
    
    res.json({
      message: 'Game started',
      sessionId,
      lobby
    });
  } catch (error) {
    logger.error('Start game error:', error);
    res.status(500).json({ message: 'Failed to start game' });
  }
};

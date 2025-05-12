import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Session from '../models/Session';
import Player from '../models/Player';
import { logger } from '../utils/logger';

// Create a new session
export const createSession = async (req: Request, res: Response) => {
  try {
    const { gameId, lobbyId, players } = req.body;
    
    // Validate required fields
    if (!gameId || !players || !Array.isArray(players) || players.length === 0) {
      return res.status(400).json({ message: 'Missing required session information' });
    }
    
    // Create new session
    const session = new Session({
      id: uuidv4(),
      gameId,
      lobbyId,
      players,
      state: { status: 'initializing' },
      startedAt: new Date()
    });
    
    await session.save();
    
    res.status(201).json({
      message: 'Session created successfully',
      sessionId: session.id,
      session
    });
  } catch (error) {
    logger.error('Create session error:', error);
    res.status(500).json({ message: 'Failed to create session' });
  }
};

// Get session by ID
export const getSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const session = await Session.findOne({ id });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json({ session });
  } catch (error) {
    logger.error('Get session error:', error);
    res.status(500).json({ message: 'Failed to get session' });
  }
};

// Update session state
export const updateSessionState = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { state } = req.body;
    
    if (!state) {
      return res.status(400).json({ message: 'State is required' });
    }
    
    const session = await Session.findOne({ id });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Update session state
    session.state = state;
    await session.save();
    
    res.json({
      message: 'Session state updated',
      sessionId: session.id
    });
  } catch (error) {
    logger.error('Update session state error:', error);
    res.status(500).json({ message: 'Failed to update session state' });
  }
};

// End session
export const endSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { results } = req.body;
    
    if (!results) {
      return res.status(400).json({ message: 'Results are required' });
    }
    
    const session = await Session.findOne({ id });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Update session with results
    session.results = results;
    session.endedAt = new Date();
    await session.save();
    
    // Update player stats
    if (results.winner) {
      const winner = await Player.findOne({ id: results.winner });
      if (winner) {
        winner.stats.gamesWon += 1;
        await winner.save();
      }
    }
    
    // Update all players' stats
    for (const player of session.players) {
      const playerDoc = await Player.findOne({ id: player.id });
      if (playerDoc) {
        playerDoc.stats.gamesPlayed += 1;
        
        // Update wager and winnings if applicable
        const reward = results.rewards?.find(r => r.playerId === player.id);
        if (reward) {
          playerDoc.stats.totalWon += reward.amount;
        }
        
        await playerDoc.save();
      }
    }
    
    res.json({
      message: 'Session ended',
      sessionId: session.id,
      results
    });
  } catch (error) {
    logger.error('End session error:', error);
    res.status(500).json({ message: 'Failed to end session' });
  }
};

// Get player sessions
export const getPlayerSessions = async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const sessions = await Session.find({
      'players.id': playerId
    })
      .sort({ startedAt: -1 })
      .limit(limit);
    
    res.json({ sessions });
  } catch (error) {
    logger.error('Get player sessions error:', error);
    res.status(500).json({ message: 'Failed to get player sessions' });
  }
};

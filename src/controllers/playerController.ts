import { Request, Response } from 'express';
import Player from '../models/Player';
import { logger } from '../utils/logger';
import { sanitizeObject } from '../utils/validation';

// Get player by ID
export const getPlayerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const player = await Player.findOne({ id });
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    res.json({
      player: {
        id: player.id,
        name: player.name,
        stats: player.stats
      }
    });
  } catch (error) {
    logger.error('Get player error:', error);
    res.status(500).json({ message: 'Failed to get player' });
  }
};

// Update player
export const updatePlayer = async (req: Request, res: Response) => {
  try {
    // Only allow updating the current user
    const playerId = req.user.id;
    
    const player = await Player.findOne({ id: playerId });
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Only allow updating certain fields
    const allowedFields = ['name'] as const;
    const updates = sanitizeObject(req.body, allowedFields);
    
    // Update player
    Object.assign(player, updates);
    await player.save();
    
    res.json({
      message: 'Player updated successfully',
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        walletAddress: player.walletAddress,
        stats: player.stats
      }
    });
  } catch (error) {
    logger.error('Update player error:', error);
    res.status(500).json({ message: 'Failed to update player' });
  }
};

// Get player stats
export const getPlayerStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const player = await Player.findOne({ id });
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    res.json({
      playerId: player.id,
      playerName: player.name,
      stats: player.stats
    });
  } catch (error) {
    logger.error('Get player stats error:', error);
    res.status(500).json({ message: 'Failed to get player stats' });
  }
};

// Get top players
export const getTopPlayers = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const topPlayers = await Player.find()
      .sort({ 'stats.gamesWon': -1 })
      .limit(limit)
      .select('id name stats');
    
    res.json({
      topPlayers: topPlayers.map(player => ({
        id: player.id,
        name: player.name,
        stats: player.stats
      }))
    });
  } catch (error) {
    logger.error('Get top players error:', error);
    res.status(500).json({ message: 'Failed to get top players' });
  }
};

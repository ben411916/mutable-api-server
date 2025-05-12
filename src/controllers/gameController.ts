import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Game from '../models/Game';
import { logger } from '../utils/logger';

// Get all games
export const getGames = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    
    // Build query
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    const games = await Game.find(query).sort({ name: 1 });
    
    res.json({ games });
  } catch (error) {
    logger.error('Get games error:', error);
    res.status(500).json({ message: 'Failed to get games' });
  }
};

// Get game by ID
export const getGameById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const game = await Game.findOne({ id });
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.json({ game });
  } catch (error) {
    logger.error('Get game error:', error);
    res.status(500).json({ message: 'Failed to get game' });
  }
};

// Create a new game (admin only)
export const createGame = async (req: Request, res: Response) => {
  try {
    const { name, description, thumbnail, modes } = req.body;
    
    // Validate required fields
    if (!name || !description || !thumbnail || !modes) {
      return res.status(400).json({ message: 'Missing required game information' });
    }
    
    // Create new game
    const game = new Game({
      id: uuidv4(),
      name,
      description,
      thumbnail,
      modes,
      status: 'active'
    });
    
    await game.save();
    
    res.status(201).json({
      message: 'Game created successfully',
      game
    });
  } catch (error) {
    logger.error('Create game error:', error);
    res.status(500).json({ message: 'Failed to create game' });
  }
};

// Update game (admin only)
export const updateGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, thumbnail, modes, status } = req.body;
    
    const game = await Game.findOne({ id });
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // Update fields
    if (name) game.name = name;
    if (description) game.description = description;
    if (thumbnail) game.thumbnail = thumbnail;
    if (modes) game.modes = modes;
    if (status) game.status = status;
    
    await game.save();
    
    res.json({
      message: 'Game updated successfully',
      game
    });
  } catch (error) {
    logger.error('Update game error:', error);
    res.status(500).json({ message: 'Failed to update game' });
  }
};

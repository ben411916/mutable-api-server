import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Player from '../models/Player';
import config from '../config';
import { logger } from '../utils/logger';
import { isValidEmail, isValidPassword } from '../utils/validation';

// Register a new player
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, walletAddress } = req.body;
    
    // Validate inputs
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    if (password && !isValidPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    
    // Check if player with email or wallet already exists
    const existingPlayer = await Player.findOne({
      $or: [
        { email: email },
        { walletAddress: walletAddress }
      ]
    });
    
    if (existingPlayer) {
      return res.status(400).json({ message: 'Player already exists' });
    }
    
    // Create new player
    const player = new Player({
      id: uuidv4(),
      name,
      email,
      password,
      walletAddress
    });
    
    await player.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: player.id, name: player.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    
    res.status(201).json({
      message: 'Player registered successfully',
      token,
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        walletAddress: player.walletAddress,
        stats: player.stats
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Login a player
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find player by email
    const player = await Player.findOne({ email });
    
    if (!player) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await player.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: player.id, name: player.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    
    res.json({
      message: 'Login successful',
      token,
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        walletAddress: player.walletAddress,
        stats: player.stats
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Authenticate with wallet
export const walletAuth = async (req: Request, res: Response) => {
  try {
    const { walletAddress, signature } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }
    
    // In a real implementation, you would verify the signature here
    // For now, we'll just check if the wallet exists
    
    // Find or create player by wallet address
    let player = await Player.findOne({ walletAddress });
    
    if (!player) {
      // Create new player with wallet address
      player = new Player({
        id: uuidv4(),
        name: `Player_${walletAddress.substring(0, 8)}`,
        walletAddress
      });
      
      await player.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: player.id, name: player.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    
    res.json({
      message: 'Wallet authentication successful',
      token,
      player: {
        id: player.id,
        name: player.name,
        walletAddress: player.walletAddress,
        stats: player.stats
      }
    });
  } catch (error) {
    logger.error('Wallet authentication error:', error);
    res.status(500).json({ message: 'Wallet authentication failed' });
  }
};

// Get current player
export const getCurrentPlayer = async (req: Request, res: Response) => {
  try {
    const player = await Player.findOne({ id: req.user.id });
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    res.json({
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        walletAddress: player.walletAddress,
        stats: player.stats
      }
    });
  } catch (error) {
    logger.error('Get current player error:', error);
    res.status(500).json({ message: 'Failed to get player information' });
  }
};

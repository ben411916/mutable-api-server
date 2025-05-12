import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IPlayer extends Document {
  id: string;
  name: string;
  email?: string;
  password?: string;
  walletAddress?: string;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    totalWagered: number;
    totalWon: number;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const PlayerSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  walletAddress: { type: String, unique: true, sparse: true },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    totalWagered: { type: Number, default: 0 },
    totalWon: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Hash password before saving
PlayerSchema.pre('save', async function(next) {
  const player = this;
  if (!player.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    player.password = await bcrypt.hash(player.password || '', salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
PlayerSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password || '');
};

export default mongoose.model<IPlayer>('Player', PlayerSchema);

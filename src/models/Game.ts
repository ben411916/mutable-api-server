import mongoose, { Document, Schema } from 'mongoose';

export interface IGame extends Document {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  modes: {
    id: string;
    name: string;
    description: string;
    players: number;
    minWager: number;
  }[];
  status: 'active' | 'maintenance' | 'deprecated';
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  modes: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    players: { type: Number, required: true },
    minWager: { type: Number, required: true, default: 0 }
  }],
  status: { 
    type: String, 
    enum: ['active', 'maintenance', 'deprecated'], 
    default: 'active' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model<IGame>('Game', GameSchema);

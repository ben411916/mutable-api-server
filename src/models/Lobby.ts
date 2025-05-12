import mongoose, { Document, Schema } from 'mongoose';

export interface ILobby extends Document {
  id: string;
  gameId: string;
  hostId: string;
  hostName: string;
  gameMode: string;
  gameModeName: string;
  maxPlayers: number;
  wager: number;
  players: {
    id: string;
    name: string;
    isReady: boolean;
  }[];
  status: 'waiting' | 'full' | 'in-progress';
  createdAt: Date;
  updatedAt: Date;
}

const LobbySchema = new Schema({
  id: { type: String, required: true, unique: true },
  gameId: { type: String, required: true },
  hostId: { type: String, required: true },
  hostName: { type: String, required: true },
  gameMode: { type: String, required: true },
  gameModeName: { type: String, required: true },
  maxPlayers: { type: Number, required: true },
  wager: { type: Number, required: true, default: 0 },
  players: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    isReady: { type: Boolean, default: false }
  }],
  status: { 
    type: String, 
    enum: ['waiting', 'full', 'in-progress'], 
    default: 'waiting' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model<ILobby>('Lobby', LobbySchema);

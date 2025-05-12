import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  id: string;
  gameId: string;
  lobbyId?: string;
  players: {
    id: string;
    name: string;
  }[];
  state: any;
  results?: {
    winner?: string;
    scores: {
      playerId: string;
      score: number;
    }[];
    rewards: {
      playerId: string;
      amount: number;
    }[];
  };
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema({
  id: { type: String, required: true, unique: true },
  gameId: { type: String, required: true },
  lobbyId: { type: String },
  players: [{
    id: { type: String, required: true },
    name: { type: String, required: true }
  }],
  state: { type: Schema.Types.Mixed, default: {} },
  results: {
    winner: { type: String },
    scores: [{
      playerId: { type: String, required: true },
      score: { type: Number, required: true }
    }],
    rewards: [{
      playerId: { type: String, required: true },
      amount: { type: Number, required: true }
    }]
  },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model<ISession>('Session', SessionSchema);

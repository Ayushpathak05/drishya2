import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    emoji: { type: String, default: '🎯' },
    type: { type: String, enum: ['post', 'reel', 'poll', 'any'], default: 'any' },
    xpReward: { type: Number, default: 50 },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date },
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Tag required in caption to verify the challenge action was actually done
    requiredTag: { type: String, default: '' },
}, { timestamps: true });

export const Challenge = mongoose.model('Challenge', challengeSchema);

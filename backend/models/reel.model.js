import mongoose from "mongoose";

const reelSchema = new mongoose.Schema({
    video: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    caption: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    language: { type: String, default: 'English' },
    musicTitle: { type: String, default: 'Original Audio' },
    views: { type: Number, default: 0 },
    mood: {
        type: String,
        enum: ['', 'Lit', 'Funny', 'Aesthetic', 'Chill', 'Inspiring', 'Savage'],
        default: ''
    }
}, { timestamps: true });

export const Reel = mongoose.model('Reel', reelSchema);

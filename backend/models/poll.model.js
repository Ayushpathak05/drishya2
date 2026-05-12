import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const pollSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [pollOptionSchema],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isAnonymous: { type: Boolean, default: true },
    college: { type: String, default: '' },
    expiresAt: { type: Date },
}, { timestamps: true });

export const Poll = mongoose.model('Poll', pollSchema);

import { Poll } from "../models/poll.model.js";

// ─── Create Poll ──────────────────────────────────────────────────────────────
export const createPoll = async (req, res) => {
    try {
        const { question, options, isAnonymous, college } = req.body;
        if (!question || !options || options.length < 2) {
            return res.status(400).json({ message: 'Question and at least 2 options required', success: false });
        }
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h from now
        const poll = await Poll.create({
            question,
            options: options.map(text => ({ text, votes: [] })),
            author: req.id,
            isAnonymous: isAnonymous !== false,
            college: college || '',
            expiresAt: expiry,
        });
        await poll.populate({ path: 'author', select: 'username profilePicture college' });
        return res.status(201).json({ success: true, message: 'Poll created!', poll });
    } catch (error) {
        console.error('[createPoll]', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

// ─── Get Polls (active, campus-scoped) ───────────────────────────────────────
export const getPolls = async (req, res) => {
    try {
        const { college } = req.query;
        const now = new Date();
        const filter = {
            expiresAt: { $gt: now },
            ...(college ? { $or: [{ college: { $regex: college, $options: 'i' } }, { college: '' }] } : {}),
        };
        const polls = await Poll.find(filter)
            .sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture college' });
        return res.status(200).json({ success: true, polls });
    } catch (error) {
        console.error('[getPolls]', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

// ─── Vote on Poll ─────────────────────────────────────────────────────────────
export const votePoll = async (req, res) => {
    try {
        const { pollId, optionIndex } = req.body;
        const userId = req.id;
        const poll = await Poll.findById(pollId);
        if (!poll) return res.status(404).json({ message: 'Poll not found', success: false });
        if (new Date() > poll.expiresAt) return res.status(400).json({ message: 'Poll has expired', success: false });

        // Remove existing vote from all options
        poll.options.forEach(opt => {
            opt.votes = opt.votes.filter(id => id.toString() !== userId);
        });
        // Add vote to chosen option
        if (optionIndex >= 0 && optionIndex < poll.options.length) {
            poll.options[optionIndex].votes.push(userId);
        }
        await poll.save();
        return res.status(200).json({ success: true, message: 'Vote recorded!', poll });
    } catch (error) {
        console.error('[votePoll]', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

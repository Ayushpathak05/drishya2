import { Challenge } from "../models/challenge.model.js";
import { User } from "../models/user.model.js";

// Seed default challenges if none exist today
const seedChallenges = async () => {
    const count = await Challenge.countDocuments({ active: true });
    if (count === 0) {
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 0);
        await Challenge.insertMany([
            { title: "Post Your Project", description: "Share something you built recently — code, design, or idea!", emoji: "🚀", type: "post", xpReward: 100, expiresAt: midnight },
            { title: "Share a Skill Tip", description: "Post a 30-second tip in any skill — coding, design, communication.", emoji: "💡", type: "reel", xpReward: 80, expiresAt: midnight },
            { title: "Start a Campus Poll", description: "Ask your campus something fun or important!", emoji: "🗳️", type: "poll", xpReward: 60, expiresAt: midnight },
            { title: "Introduce Yourself", description: "Post about who you are and what you're building.", emoji: "👋", type: "post", xpReward: 50, expiresAt: midnight },
        ]);
    }
};

// ─── Get Active Challenges ────────────────────────────────────────────────────
export const getChallenges = async (req, res) => {
    try {
        await seedChallenges();
        const userId = req.id;
        const challenges = await Challenge.find({ active: true }).sort({ xpReward: -1 });
        // Mark which ones current user completed
        const result = challenges.map(c => ({
            ...c.toObject(),
            completed: c.completedBy.map(id => id.toString()).includes(userId),
        }));
        return res.status(200).json({ success: true, challenges: result });
    } catch (error) {
        console.error('[getChallenges]', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

// ─── Complete a Challenge ─────────────────────────────────────────────────────
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 7000, 11000, 16000];
const BADGE_MILESTONES = {
    100: '🌟 100 XP Club',
    250: '🚀 Grind Mode',
    500: '🔥 Campus Star',
    1000: '💎 Elite Creator',
    2000: '👑 Legend',
};

export const completeChallenge = async (req, res) => {
    try {
        const userId = req.id;
        const { challengeId } = req.params;

        const challenge = await Challenge.findById(challengeId);
        if (!challenge || !challenge.active) {
            return res.status(404).json({ message: 'Challenge not found or inactive', success: false });
        }
        if (challenge.completedBy.map(id => id.toString()).includes(userId)) {
            return res.status(400).json({ message: 'Challenge already completed', success: false });
        }

        // Award XP
        const user = await User.findById(userId);
        const newXP = user.xp + challenge.xpReward;

        // Calculate level
        let newLevel = 1;
        for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (newXP >= LEVEL_THRESHOLDS[i]) { newLevel = i + 1; break; }
        }

        // Check for new badges
        const newBadges = [...user.badges];
        for (const [threshold, badge] of Object.entries(BADGE_MILESTONES)) {
            if (newXP >= Number(threshold) && !newBadges.includes(badge)) {
                newBadges.push(badge);
            }
        }

        // Special "First Challenge" badge
        if (!newBadges.includes('🎯 First Challenge')) newBadges.push('🎯 First Challenge');

        await User.findByIdAndUpdate(userId, { xp: newXP, level: newLevel, badges: newBadges });
        await Challenge.findByIdAndUpdate(challengeId, { $addToSet: { completedBy: userId } });

        return res.status(200).json({
            success: true,
            message: `Challenge completed! +${challenge.xpReward} XP`,
            xpEarned: challenge.xpReward,
            newXP,
            newLevel,
            newBadges,
        });
    } catch (error) {
        console.error('[completeChallenge]', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

// ─── Get Leaderboard ──────────────────────────────────────────────────────────
export const getLeaderboard = async (req, res) => {
    try {
        const { college } = req.query;
        const filter = college ? { college: { $regex: college, $options: 'i' } } : {};
        const users = await User.find(filter)
            .select('username profilePicture xp level badges college')
            .sort({ xp: -1 })
            .limit(20);
        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('[getLeaderboard]', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

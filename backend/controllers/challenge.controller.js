import { Challenge } from "../models/challenge.model.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { Reel } from "../models/reel.model.js";

// Seed default challenges if none exist today OR if they are the old format (missing requiredTag)
const seedChallenges = async () => {
    const count = await Challenge.countDocuments({ active: true });
    // Check if existing challenges are old format (no requiredTag field)
    const hasOldFormat = count > 0 && await Challenge.findOne({ active: true, requiredTag: { $exists: false } });
    if (count === 0 || hasOldFormat) {
        // Clear old challenges and re-seed with verified versions
        await Challenge.deleteMany({ active: true });
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 0);
        await Challenge.insertMany([
            {
                title: "Post Your Project",
                description: "Share something you built — add #project or #build to your post caption.",
                emoji: "🚀",
                type: "post",
                xpReward: 100,
                expiresAt: midnight,
                requiredTag: "#project",
            },
            {
                title: "Share a Skill Tip Reel",
                description: "Post a short reel tip with #study or #campus in the caption.",
                emoji: "💡",
                type: "reel",
                xpReward: 80,
                expiresAt: midnight,
                requiredTag: "#study",
            },
            {
                title: "Start a Campus Poll",
                description: "Create a poll in the Campus section. XP awarded automatically when you create one.",
                emoji: "🗳️",
                type: "poll",
                xpReward: 60,
                expiresAt: midnight,
                requiredTag: "",
            },
            {
                title: "Introduce Yourself",
                description: "Post about who you are — add #intro to your post caption.",
                emoji: "👋",
                type: "post",
                xpReward: 50,
                expiresAt: midnight,
                requiredTag: "#intro",
            },
        ]);
    }
};

// ─── Get Active Challenges ────────────────────────────────────────────────────
export const getChallenges = async (req, res) => {
    try {
        await seedChallenges();
        const userId = req.id;
        const challenges = await Challenge.find({ active: true }).sort({ xpReward: -1 });
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

// ─── Verify challenge was actually completed ──────────────────────────────────
const verifyUserAction = async (userId, challenge) => {
    // If no requiredTag, only poll-type challenges are allowed through here
    // (polls are auto-awarded via awardPollXP, not this endpoint)
    const challengeCreatedAt = challenge.createdAt || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tag = challenge.requiredTag?.toLowerCase();

    if (challenge.type === 'post') {
        // Find a post by this user created after the challenge was seeded today
        // that contains the required tag in the caption
        const query = {
            author: userId,
            createdAt: { $gte: challengeCreatedAt },
        };
        if (tag) query.caption = { $regex: tag.replace('#', '\\#'), $options: 'i' };

        const matchingPost = await Post.findOne(query);
        return !!matchingPost;
    }

    if (challenge.type === 'reel') {
        const query = {
            author: userId,
            createdAt: { $gte: challengeCreatedAt },
        };
        if (tag) query.caption = { $regex: tag.replace('#', '\\#'), $options: 'i' };

        const matchingReel = await Reel.findOne(query);
        return !!matchingReel;
    }

    // For 'poll' type, verification happens in the poll creation endpoint
    // For 'any', just verify any recent post or reel exists
    if (challenge.type === 'any') {
        const recentPost = await Post.findOne({ author: userId, createdAt: { $gte: challengeCreatedAt } });
        const recentReel = await Reel.findOne({ author: userId, createdAt: { $gte: challengeCreatedAt } });
        return !!(recentPost || recentReel);
    }

    return false;
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

        // ── VERIFY the user actually did the action ──────────────────────────
        if (challenge.type !== 'poll') {
            const verified = await verifyUserAction(userId, challenge);
            if (!verified) {
                const hint = challenge.requiredTag
                    ? `Post/reel with ${challenge.requiredTag} in your caption first, then claim XP.`
                    : 'Complete the required action first, then claim XP.';
                return res.status(400).json({
                    message: `Action not verified. ${hint}`,
                    success: false,
                    notVerified: true,
                });
            }
        }

        // Award XP
        const user = await User.findById(userId);
        const newXP = user.xp + challenge.xpReward;

        let newLevel = 1;
        for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (newXP >= LEVEL_THRESHOLDS[i]) { newLevel = i + 1; break; }
        }

        const newBadges = [...user.badges];
        for (const [threshold, badge] of Object.entries(BADGE_MILESTONES)) {
            if (newXP >= Number(threshold) && !newBadges.includes(badge)) {
                newBadges.push(badge);
            }
        }
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

// ─── Award XP for Poll Creation (called from poll controller) ─────────────────
export const awardPollChallengeXP = async (userId) => {
    try {
        const pollChallenge = await Challenge.findOne({ type: 'poll', active: true });
        if (!pollChallenge) return;
        if (pollChallenge.completedBy.map(id => id.toString()).includes(userId.toString())) return;

        const user = await User.findById(userId);
        if (!user) return;
        const newXP = user.xp + pollChallenge.xpReward;
        let newLevel = 1;
        for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (newXP >= LEVEL_THRESHOLDS[i]) { newLevel = i + 1; break; }
        }
        const newBadges = [...user.badges];
        for (const [threshold, badge] of Object.entries(BADGE_MILESTONES)) {
            if (newXP >= Number(threshold) && !newBadges.includes(badge)) newBadges.push(badge);
        }
        if (!newBadges.includes('🎯 First Challenge')) newBadges.push('🎯 First Challenge');

        await User.findByIdAndUpdate(userId, { xp: newXP, level: newLevel, badges: newBadges });
        await Challenge.findByIdAndUpdate(pollChallenge._id, { $addToSet: { completedBy: userId } });

        console.log(`[awardPollChallengeXP] +${pollChallenge.xpReward} XP to user ${userId}`);
    } catch (e) {
        console.error('[awardPollChallengeXP]', e);
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

import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { Reel } from "../models/reel.model.js";
import { Notification } from "../models/notification.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// ─── Campus-relevant hashtags ─────────────────────────────────────────────────
const CAMPUS_TAGS = [
    '#study', '#campus', '#college', '#university', '#exam', '#exams',
    '#notes', '#lecture', '#lectures', '#internship', '#career', '#job',
    '#jobs', '#hackathon', '#collaborate', '#collab', '#teammate',
    '#placement', '#project', '#research', '#assignment', '#homework',
    '#semester', '#syllabus', '#cgpa', '#coding', '#competitive', '#dsa',
    '#opentowork', '#opportunity', '#workshop', '#fest', '#techfest',
];

const isCampusContent = (caption = '') => {
    const lower = caption.toLowerCase();
    return CAMPUS_TAGS.some(tag => lower.includes(tag));
};
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "Try different email",
                success: false,
            });
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        };

        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        // populate each post if in the posts array
        const populatedPosts = await Promise.all(
            user.posts.map( async (postId) => {
                const post = await Post.findById(postId);
                if(post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        )
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts
        }
        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};
export const logout = async (_, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};
export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({path:'posts', createdAt:-1}).populate('bookmarks');
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender, college, yearOfStudy, skills, openToWork } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        };
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (college !== undefined) user.college = college;
        if (yearOfStudy !== undefined) user.yearOfStudy = yearOfStudy;
        if (skills !== undefined) user.skills = typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : skills;
        if (openToWork !== undefined) user.openToWork = openToWork === 'true' || openToWork === true;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated.',
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};
export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error);
    }
};
export const followOrUnfollow = async (req, res) => {
    try {
        const followKrneWala = req.id; // patel
        const jiskoFollowKrunga = req.params.id; // shivani
        if (followKrneWala === jiskoFollowKrunga) {
            return res.status(400).json({
                message: 'You cannot follow/unfollow yourself',
                success: false
            });
        }

        const user = await User.findById(followKrneWala);
        const targetUser = await User.findById(jiskoFollowKrunga);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            });
        }
        // mai check krunga ki follow krna hai ya unfollow
        const isFollowing = user.following.includes(jiskoFollowKrunga);
        if (isFollowing) {
            // unfollow logic ayega
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $pull: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $pull: { followers: followKrneWala } }),
            ])
            return res.status(200).json({ message: 'Unfollowed successfully', success: true });
        } else {
            // follow logic ayega
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $push: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $push: { followers: followKrneWala } }),
            ])
            
            // Notification logic
            const dbNotification = await Notification.create({
                recipient: jiskoFollowKrunga,
                sender: followKrneWala,
                type: 'follow',
                message: 'Started following you'
            });

            const notification = {
                _id: dbNotification._id,
                type:'follow',
                userId: followKrneWala,
                userDetails: user,
                message: 'Started following you',
                createdAt: dbNotification.createdAt
            }
            const postOwnerSocketId = getReceiverSocketId(jiskoFollowKrunga);
            if(postOwnerSocketId) {
                io.to(postOwnerSocketId).emit('notification', notification);
            }
            return res.status(200).json({ message: 'followed successfully', success: true });
        }
    } catch (error) {
        console.log(error);
    }
}

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.trim() === '') {
            return res.status(400).json({
                message: 'Search query is required',
                success: false
            });
        }

        // Search users by username or email (case-insensitive)
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('-password').limit(20); // Limit results to 20

        return res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Server error',
            success: false
        });
    }
}

// ─── Get Campus Posts (same college, campus-tagged only) ──────────────────────
export const getCampusPosts = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select('college');
        if (!user?.college) {
            return res.status(200).json({ success: true, posts: [], message: 'Set your college in Edit Profile to see campus posts!' });
        }
        // Build a regex OR filter matching any campus tag in caption
        const tagRegex = CAMPUS_TAGS.map(t => t.replace('#', '\\#')).join('|');
        const campusUsers = await User.find({ college: { $regex: user.college, $options: 'i' } }).select('_id');
        const campusUserIds = campusUsers.map(u => u._id);
        const posts = await Post.find({
            author: { $in: campusUserIds },
            caption: { $regex: tagRegex, $options: 'i' },
        })
            .sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture college openToWork' })
            .populate({ path: 'comments', populate: { path: 'author', select: 'username profilePicture' } });
        return res.status(200).json({ success: true, posts });
    } catch (error) {
        console.error('[getCampusPosts]', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

// ─── Get Campus Reels (same college, campus-tagged only) ──────────────────────
export const getCampusReels = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select('college');
        if (!user?.college) {
            return res.status(200).json({ success: true, reels: [], message: 'Set your college in Edit Profile.' });
        }
        const tagRegex = CAMPUS_TAGS.map(t => t.replace('#', '\\#')).join('|');
        const campusUsers = await User.find({ college: { $regex: user.college, $options: 'i' } }).select('_id');
        const campusUserIds = campusUsers.map(u => u._id);
        const reels = await Reel.find({
            author: { $in: campusUserIds },
            caption: { $regex: tagRegex, $options: 'i' },
        })
            .sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture college' })
            .populate({ path: 'comments', populate: { path: 'author', select: 'username profilePicture' } });
        return res.status(200).json({ success: true, reels });
    } catch (error) {
        console.error('[getCampusReels]', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

// ─── Award XP (generic, called internally or via API) ─────────────────────────
export const awardXP = async (req, res) => {
    try {
        const userId = req.id;
        const { amount = 10 } = req.body;
        const user = await User.findById(userId);
        const newXP = user.xp + amount;
        const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 7000, 11000, 16000];
        let newLevel = 1;
        for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (newXP >= LEVEL_THRESHOLDS[i]) { newLevel = i + 1; break; }
        }
        await User.findByIdAndUpdate(userId, { xp: newXP, level: newLevel });
        return res.status(200).json({ success: true, xp: newXP, level: newLevel });
    } catch (error) {
        console.error('[awardXP]', error);
        return res.status(500).json({ success: false });
    }
};

import cloudinary from "../utils/cloudinary.js";
import { Reel } from "../models/reel.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { Notification } from "../models/notification.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import getDataUri from "../utils/datauri.js";

// ─── Create Reel ─────────────────────────────────────────────────────────────
export const createReel = async (req, res) => {
    try {
        const { caption, language, musicTitle, mood } = req.body;
        const videoFile = req.files?.video?.[0];
        const thumbFile = req.files?.thumbnail?.[0];

        if (!videoFile) {
            return res.status(400).json({ message: 'Video file is required', success: false });
        }

        // Upload video to Cloudinary
        const videoDataUri = getDataUri(videoFile);
        const videoUpload = await cloudinary.uploader.upload(videoDataUri, {
            resource_type: 'video',
            folder: 'drishya_reels',
        });

        let thumbnailUrl = '';
        if (thumbFile) {
            const thumbDataUri = getDataUri(thumbFile);
            const thumbUpload = await cloudinary.uploader.upload(thumbDataUri, {
                folder: 'drishya_thumbnails',
            });
            thumbnailUrl = thumbUpload.secure_url;
        } else {
            // Auto-generate thumbnail from the video
            thumbnailUrl = videoUpload.secure_url.replace('/upload/', '/upload/so_0,f_jpg/');
        }

        const reel = await Reel.create({
            video: videoUpload.secure_url,
            thumbnail: thumbnailUrl,
            caption: caption || '',
            author: req.id,
            language: language || 'English',
            musicTitle: musicTitle || 'Original Audio',
            mood: mood || '',
        });

        // Add reel to user's reels array (we'll store _id on users who create reels)
        await User.findByIdAndUpdate(req.id, { $push: { reels: reel._id } });

        await reel.populate({ path: 'author', select: '-password' });

        return res.status(201).json({ message: 'Reel created successfully', success: true, reel });
    } catch (error) {
        console.error('[createReel]', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

// ─── Get All Reels (language-filtered) ───────────────────────────────────────
export const getAllReels = async (req, res) => {
    try {
        const { lang } = req.query;
        const filter = lang && lang !== 'all' ? { language: lang } : {};

        const reels = await Reel.find(filter)
            .sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username profilePicture' }
            });

        return res.status(200).json({ success: true, reels });
    } catch (error) {
        console.error('[getAllReels]', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

// ─── Get User's Reels ─────────────────────────────────────────────────────────
export const getUserReels = async (req, res) => {
    try {
        const { userId } = req.params;
        const reels = await Reel.find({ author: userId })
            .sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' });

        return res.status(200).json({ success: true, reels });
    } catch (error) {
        console.error('[getUserReels]', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

// ─── Like Reel ────────────────────────────────────────────────────────────────
export const likeReel = async (req, res) => {
    try {
        const userId = req.id;
        const reelId = req.params.id;

        const reel = await Reel.findById(reelId);
        if (!reel) return res.status(404).json({ message: 'Reel not found', success: false });

        await reel.updateOne({ $addToSet: { likes: userId } });

        const user = await User.findById(userId).select('username profilePicture');
        const reelOwnerId = reel.author.toString();

        if (reelOwnerId !== userId) {
            const dbNotif = await Notification.create({
                recipient: reelOwnerId,
                sender: userId,
                type: 'like',
                message: 'liked your reel',
            });

            const ownerSocketId = getReceiverSocketId(reelOwnerId);
            if (ownerSocketId) {
                io.to(ownerSocketId).emit('notification', {
                    _id: dbNotif._id,
                    type: 'like',
                    userId,
                    userDetails: user,
                    reelId,
                    message: 'liked your reel',
                    createdAt: dbNotif.createdAt,
                });
            }
        }

        return res.status(200).json({ message: 'Reel liked', success: true });
    } catch (error) {
        console.error('[likeReel]', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

// ─── Dislike Reel ─────────────────────────────────────────────────────────────
export const dislikeReel = async (req, res) => {
    try {
        const userId = req.id;
        const reelId = req.params.id;

        const reel = await Reel.findById(reelId);
        if (!reel) return res.status(404).json({ message: 'Reel not found', success: false });

        await reel.updateOne({ $pull: { likes: userId } });

        return res.status(200).json({ message: 'Reel unliked', success: true });
    } catch (error) {
        console.error('[dislikeReel]', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

// ─── Comment on Reel ──────────────────────────────────────────────────────────
export const addReelComment = async (req, res) => {
    try {
        const reelId = req.params.id;
        const userId = req.id;
        const { text } = req.body;

        if (!text) return res.status(400).json({ message: 'Comment text is required', success: false });

        const reel = await Reel.findById(reelId);
        if (!reel) return res.status(404).json({ message: 'Reel not found', success: false });

        const comment = await Comment.create({ text, author: userId, post: reelId });
        await comment.populate({ path: 'author', select: 'username profilePicture' });

        reel.comments.push(comment._id);
        await reel.save();

        // Notify reel owner
        const reelOwnerId = reel.author.toString();
        if (reelOwnerId !== userId) {
            const dbNotif = await Notification.create({
                recipient: reelOwnerId,
                sender: userId,
                type: 'comment',
                message: 'commented on your reel',
            });
            const ownerSocketId = getReceiverSocketId(reelOwnerId);
            if (ownerSocketId) {
                io.to(ownerSocketId).emit('notification', {
                    _id: dbNotif._id,
                    type: 'comment',
                    userId,
                    userDetails: comment.author,
                    reelId,
                    message: 'commented on your reel',
                    createdAt: dbNotif.createdAt,
                });
            }
        }

        return res.status(201).json({ message: 'Comment added', comment, success: true });
    } catch (error) {
        console.error('[addReelComment]', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

// ─── Delete Reel ──────────────────────────────────────────────────────────────
export const deleteReel = async (req, res) => {
    try {
        const reelId = req.params.id;
        const userId = req.id;

        const reel = await Reel.findById(reelId);
        if (!reel) return res.status(404).json({ message: 'Reel not found', success: false });
        if (reel.author.toString() !== userId) return res.status(403).json({ message: 'Unauthorized', success: false });

        // Delete from Cloudinary
        const publicId = reel.video.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`drishya_reels/${publicId}`, { resource_type: 'video' });

        await Reel.findByIdAndDelete(reelId);
        await User.findByIdAndUpdate(userId, { $pull: { reels: reelId } });
        await Comment.deleteMany({ post: reelId });

        return res.status(200).json({ message: 'Reel deleted', success: true });
    } catch (error) {
        console.error('[deleteReel]', error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

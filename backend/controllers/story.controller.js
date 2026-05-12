import { Story } from "../models/story.model.js";
import { User } from "../models/user.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const createStory = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;

        if (!image) {
            return res.status(400).json({
                message: 'Image is required for story',
                success: false
            });
        }

        const fileUri = getDataUri(image);
        const cloudResponse = await cloudinary.uploader.upload(fileUri);

        const story = await Story.create({
            author: req.id,
            image: cloudResponse.secure_url,
            caption: caption || ''
        });

        // Add story to user's stories array
        await User.findByIdAndUpdate(req.id, {
            $push: { stories: story._id }
        });

        return res.status(201).json({
            message: 'Story created successfully',
            success: true,
            story
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Server error',
            success: false
        });
    }
};

export const getStories = async (req, res) => {
    try {
        const userId = req.id;

        // Get user's following list
        const user = await User.findById(userId).select('following');
        const followingIds = user.following;

        // Include user's own stories
        followingIds.push(userId);

        // Get stories from following users and self, created within last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const stories = await Story.find({
            author: { $in: followingIds },
            createdAt: { $gte: twentyFourHoursAgo }
        })
        .populate('author', 'username profilePicture')
        .populate('views', 'username')
        .populate('likes', 'username')
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            stories
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Server error',
            success: false
        });
    }
};

export const viewStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.id;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({
                message: 'Story not found',
                success: false
            });
        }

        // Add user to views if not already viewed
        if (!story.views.includes(userId)) {
            story.views.push(userId);
            await story.save();
        }

        return res.status(200).json({
            message: 'Story viewed',
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Server error',
            success: false
        });
    }
};

export const likeStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.id;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({
                message: 'Story not found',
                success: false
            });
        }

        const isLiked = story.likes.includes(userId);
        if (isLiked) {
            // Unlike
            story.likes = story.likes.filter(id => id.toString() !== userId);
        } else {
            // Like
            story.likes.push(userId);
        }

        await story.save();

        return res.status(200).json({
            message: isLiked ? 'Story unliked' : 'Story liked',
            success: true,
            likes: story.likes.length
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Server error',
            success: false
        });
    }
};

export const deleteStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.id;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({
                message: 'Story not found',
                success: false
            });
        }

        if (story.author.toString() !== userId) {
            return res.status(403).json({
                message: 'You can only delete your own stories',
                success: false
            });
        }

        // Remove story from user's stories array
        await User.findByIdAndUpdate(userId, {
            $pull: { stories: storyId }
        });

        await Story.findByIdAndDelete(storyId);

        return res.status(200).json({
            message: 'Story deleted successfully',
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Server error',
            success: false
        });
    }
};

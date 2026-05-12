import express from "express";
import { createStory, getStories, viewStory, likeStory, deleteStory } from "../controllers/story.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route('/create').post(isAuthenticated, upload.single('image'), createStory);
router.route('/').get(isAuthenticated, getStories);
router.route('/:storyId/view').post(isAuthenticated, viewStory);
router.route('/:storyId/like').post(isAuthenticated, likeStory);
router.route('/:storyId').delete(isAuthenticated, deleteStory);

export default router;

import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import {
    createReel,
    getAllReels,
    getUserReels,
    likeReel,
    dislikeReel,
    addReelComment,
    deleteReel,
} from "../controllers/reel.controller.js";

const router = express.Router();

// Upload fields: video (required) + thumbnail (optional)
router.route("/upload").post(
    isAuthenticated,
    upload.fields([{ name: "video", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]),
    createReel
);

router.route("/all").get(isAuthenticated, getAllReels);
router.route("/user/:userId").get(isAuthenticated, getUserReels);
router.route("/:id/like").get(isAuthenticated, likeReel);
router.route("/:id/dislike").get(isAuthenticated, dislikeReel);
router.route("/:id/comment").post(isAuthenticated, addReelComment);
router.route("/delete/:id").delete(isAuthenticated, deleteReel);

export default router;

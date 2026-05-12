import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getChallenges, completeChallenge, getLeaderboard } from "../controllers/challenge.controller.js";

const router = express.Router();

router.route("/").get(isAuthenticated, getChallenges);
router.route("/:challengeId/complete").post(isAuthenticated, completeChallenge);
router.route("/leaderboard").get(isAuthenticated, getLeaderboard);

export default router;

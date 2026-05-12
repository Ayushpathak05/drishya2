import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createPoll, getPolls, votePoll } from "../controllers/poll.controller.js";

const router = express.Router();

router.route("/").get(isAuthenticated, getPolls);
router.route("/create").post(isAuthenticated, createPoll);
router.route("/vote").post(isAuthenticated, votePoll);

export default router;

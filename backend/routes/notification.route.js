import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getNotifications, markNotificationsAsRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.route("/").get(isAuthenticated, getNotifications);
router.route("/read").post(isAuthenticated, markNotificationsAsRead);

export default router;

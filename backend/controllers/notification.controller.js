import { Notification } from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.id;
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .populate('sender', 'username profilePicture');
        
        return res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Error fetching notifications" });
    }
};

export const markNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.id;
        await Notification.updateMany({ recipient: userId, read: false }, { read: true });
        return res.status(200).json({ success: true, message: "Notifications marked as read" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Error reading notifications" });
    }
};

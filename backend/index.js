import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import storyRoute from "./routes/story.route.js";
import notificationRoute from "./routes/notification.route.js";
import reelRoute from "./routes/reel.route.js";
import challengeRoute from "./routes/challenge.route.js";
import pollRoute from "./routes/poll.route.js";
import { app, server } from "./socket/socket.js";
import path from "path";

dotenv.config();


const PORT = process.env.PORT || 3000;

const __dirname = path.resolve();

// ─── CORS — handle preflight and all cross-origin requests ───────────────────
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Allow any vercel.app subdomain OR localhost
    const isAllowed = !origin
        || origin.endsWith('.vercel.app')
        || origin.startsWith('http://localhost');

    if (isAllowed && origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
    }

    // Answer preflight immediately
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// yha pr apni api ayengi
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/story", storyRoute);
app.use("/api/v1/notification", notificationRoute);
app.use("/api/v1/reel", reelRoute);
app.use("/api/v1/challenge", challengeRoute);
app.use("/api/v1/poll", pollRoute);


app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req,res)=>{
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
})


server.listen(PORT, () => {
    connectDB();
    console.log(`Server listen at port ${PORT}`);
});

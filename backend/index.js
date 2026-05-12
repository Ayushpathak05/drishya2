import express, { urlencoded } from "express";
import cors from "cors";
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

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
const allowedOrigins = [
    process.env.URL,                         // from .env (localhost dev or Vercel prod)
    'http://localhost:5173',                 // Vite local dev
    'http://localhost:3000',                 // fallback
    'https://drishya2.vercel.app',           // Vercel production — update if your domain differs
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: ${origin} not allowed`));
        }
    },
    credentials: true,
}
app.use(cors(corsOptions));

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

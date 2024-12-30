import express from "express";
import bodyParser from "body-parser";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

//this is to convert the request into readable format
app.use(bodyParser.json({ limit: "10mb" })); // Change "10mb" to the desired size
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json({ limit: "10mb" }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/notification", notificationRoutes);

//absolutely no idea what this is doing this to deploy
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  //Running at port 5000
  console.log(`server is running on port : ${PORT}`);
  connectMongoDB();
});

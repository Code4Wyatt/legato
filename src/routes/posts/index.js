import PostModel from "../../database/models/Post.js";
import User from "../../database/models/User.js";
import VideoModel from "../../database/models/Video.js"
import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import crypto from "crypto";
import { GridFsStorage } from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import { JWTAuthMiddleware } from "../../auth/token.js";
import path from "path";
import mongo from "mongodb";
import "dotenv/config";


const postRouter = Router();

const mongoURI = process.env.MONGO_CONNECTION;

const db = mongoURI;
const gfs = await Grid(db, mongo);

// Create storage engine

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

// Create Post

postRouter.post(
  "/",
  JWTAuthMiddleware,
  upload.single("video"),
  async (req, res, next) => {
    const newPost = new PostModel(req.body);
    const newVideo = new VideoModel(req.body.video);
    try {
      const savedPost = await newPost.save();
      const payload = new FormData();
      const video = req.body.video;
      if (video) {
        const savedVideo = await newVideo.save();
        console.log(savedVideo)
      }
      payload.append("video", video);
      res.status(200).send(savedPost);
      console.log({savedVideo, savedPost})
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// Get All Videos

postRouter.get("/media", async (req, res, next) => {
  try {
      const videos = await gfs.find('uploads').toArray((err, files) => {
          if (!files || files.length === 0) {
              return res.status(200).json({
                  success: false,
                  message: 'No files available'
              });
          }
          files.map(file => {
              if (file.contentType === 'video/mp4') {
                  file.isVideo = true;
              }
          })
    });
    res.json(videos);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get Specific Post

postRouter.get("/:id", async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Edit Post

postRouter.put("/:id", async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await PostModel.updateOne({ $set: req.body });
      res.status(200).json("Post updated successfully!");
    } else {
      res.status(403).json("You can only update your own posts.");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete Post

postRouter.delete("/:id", async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await PostModel.deleteOne();
      res.status(200).json("Post successfully deleted!");
    } else {
      res.status(403).json("You can only delete your own posts.");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Like and Dislike Post

postRouter.put("/:id/like", async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await PostModel.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Post liked!");
    } else {
      await PostModel.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("Post disliked!");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get Timeline Posts

postRouter.get("/timeline"),
  async (req, res, next) => {
    try {
      const currentUser = await User.findById(req.body.userId);
      const userPosts = await PostModel.find({ userId: currentUser._id });
      const friendPosts = await Promise.all(
        currentUser.followings.map((friendId) => {
          return PostModel.find({ userId: friendId });
        })
      );
      res.json(userPosts.concat(...friendPosts));
    } catch (error) {
      res.status(500).json(error);
    }
  };

export default postRouter;

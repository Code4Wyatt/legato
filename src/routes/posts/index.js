import PostModel from "../../database/models/Post.js";
import User from "../../database/models/User.js";
import VideoModel from "../../database/models/Video.js";
import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import crypto from "crypto";
import { GridFsStorage } from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import { JWTAuthMiddleware } from "../../auth/token.js";
import { v2 as Cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import mongo from "mongodb";
import "dotenv/config";
import streamifier from "streamifier";
import fs from "fs";
const mongoURI = process.env.MONGO_CONNECTION;

Cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: Cloudinary,
  params: {
    folder: "unison",
    format: async (req, file) => "png", // supports promises as well
  },
});

const parser = multer({ storage: cloudinaryStorage });

const postRouter = Router();

// Create Post

postRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new PostModel(req.body);
    const savedPost = await newPost.save();

    if (newPost) {
      res.send({ savedPost });
    }

    console.log(savedPost);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Post Image to Post

postRouter.post("/:postId",
  parser.single("image"),
  async (req, res, next) => {
    try {
      const getPostById = await PostModel.findById(req.params.postId);

      if (getPostById) {
        getPostById.image = req.file.path;

        await getPostById.save();

        res.status(203).send({ success: true, data: getPostById });
      } else {
        res.status(404).send({ success: false, message: "Post not found" });
      }
    } catch (error) {
      res.status(500).send({ success: false, error: error.message });
    }
  }
);

// Get All Videos

postRouter.get("/media", async (req, res, next) => {
  try {
    const videos = await gfs.find("uploads").toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(200).json({
          success: false,
          message: "No files available",
        });
      }
      files.map((file) => {
        if (file.contentType === "video/mp4") {
          file.isVideo = true;
        }
      });
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

// Get All Posts

postRouter.get("/", async (req, res, next) => {
  try {
    const allPosts = await PostModel.find();
    res.status(200).json(allPosts);
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

      await post.deleteOne();
      res.status(200).json("Post successfully deleted!");
    
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

postRouter.get("/"),
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

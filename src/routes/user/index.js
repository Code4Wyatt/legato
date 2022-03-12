import bcrypt from "bcrypt";
import { Router } from "express";
import UserModel from "./schema.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import createHttpError from "http-errors"
import jwt from "jsonwebtoken";

const userRouter = Router();

// Get User On Log In

// userRouter.get("/currentUser", JWTAuthMiddleware, async (req, res, next) => {
//   try {
//     let localUsername = typeof window !== 'undefined' ? localStorage.getItem('username') : null
//     let currentUser = await UserModel.findOne({ username: localUsername });
//     res.status(200).send({currentUser});
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// });

userRouter.get("/currentUser", JWTAuthMiddleware, async (req, res, next) => {
    if (req.headers && req.headers.authorization) {
        let authorization = req.headers.authorization.split(' ')[1],
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).send({message: error.message});
        }
        let userId = decoded.id;
        // Fetch the user by id
        UserModel.findOne({_id: userId}).then(function(user){
            // Do something with the user
            return res.send(200);
        });
    }
    return res.send(500);
})

// Get Specific User

userRouter.get("/:id", async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Edit User

userRouter.put("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updatedUser = await UserModel.findByIdAndUpdate(userId, req.body, {
      new: true,
    }); // by default findByIdAndUpdate returns the document pre-update, if I want to retrieve the updated document, I should use new:true as an option
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createHttpError(404, `User with id ${userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

// userRouter.put("/:id", JWTAuthMiddleware, async (req, res) => {
//   if (req.body.userId === req.params.id || req.body.isAdmin) {
//     // if userId matches id in params, or user is an admin
//     if (req.body.password) {
//       // and if password entered, salt it and then
//       try {
//         const salt = await bcrypt.genSalt(10);
//         req.body.password = await bcrypt.hash(req.body.password, salt);
//       } catch (err) {
//         return res.status(500).json(err);
//       }
//     }
//     try {
//       const user = await UserModel.findByIdAndUpdate(req.params.id, {
//         $set: req.body, // update the fields that are received in the request's body
//       });
//       res.status(200).json("Account has been updated successfully");
//     } catch (error) {
//       return res.status(500).json(error);
//     }
//   } else {
//     return res.status(403).json("You can update only your account!");
//   }
// });

// Delete User

userRouter.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await UserModel.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted successfully");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

// Follow User

userRouter.put("/:id/follow", async (req, res, next) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await UserModel.findById(req.params.id);
      const currentUser = await UserModel.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { following: req.params.id } });
        res.status(200).json("User has been followed successfully");
      } else {
        res.status(403).json("You are already following this user");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("You can't follow yourself");
  }
});

// Unfollow User

userRouter.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await UserModel.findById(req.params.id);
      const currentUser = await UserModel.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("User has been unfollowed");
      } else {
        res.status(403).json("You are not following this user");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("You are not following yourself");
  }
});

export default userRouter;

import bcrypt from "bcrypt";
import { Router } from "express"

const userRouter = Router()

// Get Specific User

userRouter.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Edit User

userRouter.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) { // if userId matches id in params, or user is an admin
    if (req.body.password) { // and if password entered, salt it and then
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, { 
        $set: req.body, // update the fields that are received in the request's body
      });
      res.status(200).json("Account has been updated");2
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});



export default userRouter
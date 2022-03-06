import bcrypt from "bcrypt";
import UserModel from "../user/schema.js";
import {
  JWTAuthenticate,
  verifyRefreshTokenAndGenerateNewTokens,
} from "../../auth/tools.js";
import { Router } from "express";

const authRouter = Router();

// Register

authRouter.post("/register", async (req, res, next) => {
  try {
    const user = new UserModel(req.body);
    const { _id } = await user.save();

    res.status(201).send({ _id });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Login

authRouter.post("/login", async (req, res, next) => {
  try {
    // 1. Obtain credentials from req.body
    const { email, password } = req.body;

    // 2. Verify credentials
    const user = await UserModel.checkCredentials(email, password);

    if (user) {
      // 3. If credentials are fine we are going to generate an access token and send it as a response
      const { accessToken, refreshToken } = await JWTAuthenticate(user);
      res.send({ accessToken, refreshToken });
    } else {
      // 4. If they are not --> error (401)
      next(createHttpError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refreshToken", async (req, res, next) => {
  try {
    // 1. Receive the current refresh token in req.body
    const { currentRefreshToken } = req.body;

    // 2. Check the validity of that token (check if token is not expired, check if it hasn't been compromised, check if it is in user's record in db)
    const { accessToken, refreshToken } =
      await verifyRefreshTokenAndGenerateNewTokens(currentRefreshToken);

    // 3. If everything is fine --> generate a new pair of tokens (accessToken2 and refreshToken2)
    // 4. Send tokens back as a response
    res.send({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

export default authRouter;

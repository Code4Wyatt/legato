import createHttpError from "http-errors"
import jwt from "jsonwebtoken"
import UserModel from "../routes/user/schema.js"

export const JWTAuthenticate = async (user) => {
  // 1. given the user, it generates two tokens: accessToken and refreshToken
  const accessToken = await generateJWTToken({ _id: user._id })
  const refreshToken = await generateRefreshJWTToken({ _id: user._id })

  // 2. refresh token should be saved in db
  user.refreshToken = refreshToken

  await user.save() // remember that here user is a Mongoose Document therefore it has some special features like save method

  // 3. return both the tokens
  return { accessToken, refreshToken }
}

const generateJWTToken = payload =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
      (err, token) => {
        if (err) reject(err)
        else resolve(token)
      }
    )
  )

// USAGE: const token = await generateJWTToken({_id: "oaijsdjasdojasoidj"})

const generateRefreshJWTToken = payload =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err)
        else resolve(token)
      }
    )
  )

export const verifyJWT = token =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) reject(err)
      else resolve(payload)
    })
  )

const verifyRefreshToken = token =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.REFRESH_JWT_SECRET, (err, payload) => {
      if (err) reject(err)
      else resolve(payload)
    })
  )

// USAGE: const payload = await verifyJWT(token)

export const verifyRefreshTokenAndGenerateNewTokens =
  async currentRefreshToken => {
    try {
      // 1. Check the validity of the current refresh token (exp date and integrity)
      const payload = await verifyRefreshToken(currentRefreshToken)

      // 2. If token is valid, we shall check if it is the same as the one saved in db
      const user = await UserModel.findById(payload._id)

      if (!user)
        throw new createHttpError(404, `User with id ${payload._id} not found!`)

      if (user.refreshToken && user.refreshToken === currentRefreshToken) {
        // 3. If everything is fine --> generate accessToken and refreshToken
        const { accessToken, refreshToken } = await JWTAuthenticate(user)

        // 4. Return tokens
        return { accessToken, refreshToken }
      } else {
        throw new createHttpError(401, "Refresh token not valid!")
      }
    } catch (error) {
      throw new createHttpError(401, "Refresh token expired or compromised!")
    }
  }
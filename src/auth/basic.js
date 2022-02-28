import createHttpError from "http-errors"
import atob from "atob"
import UserModel from "../users/schema.js"

export const basicAuthMiddleware = async (req, res, next) => {
  // We gonna receive something like --> Autorization: Basic ZGllZ29AYmFub3Zhei5jb206MTIzNA==
  // 1. Check if Authorization header is provided, if it is not --> trigger an error (401)
  if (!req.headers.authorization) {
    next(
      createHttpError(
        401,
        "Please provide credentials in Authorization header!"
      )
    )
  } else {
    // 2. If we have received the Authorization, we should extract the credentials from it (which are base64 encoded, therefore we should translate them into normal text )
    const base64Credentials = req.headers.authorization.split(" ")[1]
    const decodedCredentials = atob(base64Credentials) // decodedCredentials --> diego@banovaz.com:1234

    const [email, password] = decodedCredentials.split(":")

    // 3. Once we obtain credentials, it's time to find the user in db (by email), compare received password with the hashed one
    const user = await UserModel.checkCredentials(email, password)

    if (user) {
      // 4. If credentials are fine, we can proceed to what is next (another middleware or route handler)
      req.user = user // we are attaching to the request the user document
      next()
    } else {
      // 5. If credentials are not fine (user not found OR password not correct) --> trigger an error
      next(createHttpError(401, "Credentials are not ok!"))
    }
  }
}
import createHttpError from "http-errors"
import { verifyJWT } from "./tools.js"

export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    // 1. Check if Authorization header is in the request, if it is not --> 401
    next(
      createHttpError(
        401,
        "Please provide bearer token in authorization header!"
      )
    )
  } else {
    try {
      // 2. Extract token from header
      const token = req.headers.authorization.replace("Bearer ", "") // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MWMxZjllNTQxNTRjYzkxNTA4YzUzMDAiLCJyb2xlIjoiVXNlciIsImlhdCI6MTY0MDEwMjM3OCwiZXhwIjoxNjQwNzA3MTc4fQ.0zLoa3uLQeK0ZjtjE8VgqenvpVOmuy0LK9AXh3-sxTc
      // 3. Verify the token, if everything goes fine we should get back the payload of the token ({_id: "oio1ji2oi3", role: "User"})
      const payload = await verifyJWT(token)

      // 4. If token was ok we can go next

      req.user = {
        _id: payload._id
        }
      
      next()
    } catch (error) {
      // 5. In case of error thrown from jsonwebtoken library --> 401
      next(createHttpError(401, "Token not valid!"))
    }
  }
}
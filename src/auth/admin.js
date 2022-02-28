import createHttpError from "http-errors"

export const adminOnlyMiddleware = (req, res, next) => {
  if (req.user.isAdmin === true) {
    next()
  } else {
    next(createHttpError(403, "Admin only endpoint!"))
  }
}
import mongoose from "mongoose"
import bcrypt from "bcrypt"

const { Schema, model } = mongoose

const UserSchema = new Schema(
  {
    firstname: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, max: 50, unique: true },
    dateOfBirth: { type: Date },
    profileImage: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    media: [{ type: String, default: "" }],
    status: { type: String, default: "" },
    bands: { type: Array, default: [] },
    position: { type: String, default: "" },
    location: { type: String },
    country: { type: String },
    instruments: { type: Array, default: [] },
    followers: { type: Array, default: [] },
    following: { type: Array, default: [] },
    isAdmin: { type: Boolean, default: false },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  }
)

UserSchema.pre("save", async function (next) {
  // BEFORE saving the user in db, hash the password
  // I am NOT using arrow function here because of "this"
  const newUser = this // "this" represents the current user I'm trying to save in db
  const plainPW = newUser.password

  if (newUser.isModified("password")) {
    // only if user is modifying his password I am going to use some CPU cycles to hash the pw, otherwise they are just wasted
    const hash = await bcrypt.hash(plainPW, 10)
    newUser.password = hash
  }

  next()
})

UserSchema.methods.toJSON = function () {
  // this function will be called automagically EVERY TIME express does a res.send(users)

  const userDocument = this
  const userObject = userDocument.toObject()
  delete userObject.password
  delete userObject.__v

  return userObject
}

UserSchema.statics.checkCredentials = async function (email, plainPW) {
  // 1. find the user by email
  const user = await this.findOne({ email }) // "this" here refers to UserModel

  if (user) {
    // 2. if the user is found --> compare plainPw with the hashed one
    const isMatch = await bcrypt.compare(plainPW, user.password)
    if (isMatch) {
      // 3. If they do match --> return a proper response
      return user
    } else {
      // 4. If they don't --> return null
      return null
    }
  } else {
    // 5. also if email is not ok --> return null
    return null
  }
}

// USAGE --> UserModel.checkCredentials("diego@banovaz.com", "1234")

export default model("User", UserSchema)
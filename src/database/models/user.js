import mongoose from "mongoose"

const { Schema, model } = mongoose

const UserSchema = new Schema({
    firstname: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, max: 50, unique: true },
    dateOfBirth: { type: Date },
    profileImage: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    bands: { type: Array, default: [] },
    location: { type: String },
    instruments: { type: Array, default: [] },
    videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }], 
    followers: { type: Array, default: [] },
    following: { type: Array, default: [] },
    isAdmin: { type: Boolean, default: false }
})

export default UserSchema || model("User", UserSchema)
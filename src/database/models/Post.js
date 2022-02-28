import mongoose from "mongoose"

const { Schema, model } = mongoose

const PostSchema = new Schema({
    userId: { type: String, required: true },
    content: { type: String },
    image: { type: String },
    likes: { type: Array, default: [] },
},
    { timestamp: true }
)

export default model("Post", PostSchema)
import mongoose from "mongoose"

const { Schema, model } = mongoose

const VideoSchema = new Schema({
    title: {type: String, required: true},
    video: { type: String, required: true },
    description: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
})

export default VideoSchema || model("Video", VideoSchema)
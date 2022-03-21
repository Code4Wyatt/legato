import mongoose from "mongoose";

const { Schema, model } = mongoose;

const PostSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    content: { type: String },
    videoUrl: { type: String },
    image: { type: Object },
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        comment: { type: String, required: true },
      },
      { timestamps: true },
    ],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamp: true }
);

export default model("Post", PostSchema);

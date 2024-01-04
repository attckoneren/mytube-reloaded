import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  avatarUrl: { type: String, ref: "User" },
  name: { type: String, required: true },
});

const commentModel = mongoose.model("Comment", commentSchema);

export default commentModel;

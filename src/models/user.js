import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  avatarUrl: String,
  email: { type: String, required: true, unique: true },
  socialOnly: { type: Boolean, default: false },
  password: { type: String, unique: true },
  name: { type: String, required: true },
  videos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Comment",
    },
  ],
  likesVideo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  likesComment: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  subscriber: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  SubscriptionList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const userModel = mongoose.model("User", userSchema);

export default userModel;

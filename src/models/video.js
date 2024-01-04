import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 20,
    trim: true,
  },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  description: { type: String, required: true, minLength: 10, trim: true },
  createdAt: { type: Date, required: true },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, required: true, default: 0 },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Comment",
    },
  ],
});

videoSchema.static("formatDate", function (createdAt) {
  const milliSeconds = new Date() - createdAt;
  const seconds = milliSeconds / 1000;
  if (seconds < 60) return `Just now`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)} minutes ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)} hours ago`;
  const days = hours / 24;
  if (days < 7) return `${Math.floor(days)} days ago`;
  const weeks = days / 7;
  if (weeks < 5) return `${Math.floor(weeks)} weeks ago`;
  const months = days / 30;
  if (months < 12) return `${Math.floor(months)} months ago`;
  const years = days / 365;
  return `${Math.floor(years)} years ago`;
});

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const videoModel = mongoose.model("Video", videoSchema);

export default videoModel;

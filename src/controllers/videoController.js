import videoModel from "../models/video";
import userModel from "../models/user";
import commentModel from "../models/comment";
export const home = async (req, res) => {
  const videos = await videoModel
    .find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  const formattedDates = await Promise.all(
    videos.map(async (video) => ({
      ...video.toObject(),
      formattedDate: await videoModel.formatDate(video.createdAt),
    }))
  );
  const url = req.url;

  return res.render("home", {
    pageTitle: "Home",
    videos: formattedDates,
    url,
  });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const videos = await videoModel
    .find({})
    .sort({ createdAt: "asc" })
    .populate("owner");
  const video = await videoModel
    .findById(id)
    .populate("owner")
    .populate("comments");
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  const formattedDates = await Promise.all(
    videos.map(async (video) => ({
      ...video.toObject(),
      formattedDate: await videoModel.formatDate(video.createdAt),
    }))
  );
  const formattedDate = await videoModel.formatDate(video.createdAt);
  const url = req.url;
  return res.render("watch", {
    pageTitle: video.title,
    video,
    videos: formattedDates,
    formattedDate,
    id,
  });
};
export const getEdit = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { id } = req.params;
  const video = await videoModel.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of this video");
    return res.status(403).redirect("/");
  }
  return res.render("edit", {
    pageTitle: `Edit ${video.title}`,
    video,
  });
};
export const postEdit = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await videoModel.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await videoModel.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: videoModel.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};
export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};
export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await videoModel.create({
      title,
      description,
      videoUrl: video[0].location,
      thumbnailUrl: thumb[0].location,
      createdAt: Date.now(),
      hashtags: videoModel.formatHashtags(hashtags),
      owner: _id,
    });
    const user = await userModel.findById(_id);
    user.videos.push(newVideo._id);
    await user.save();
    return res.redirect("/");
  } catch (error) {
    req.flash("error", error._message);
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
    });
  }
};
export const deleteVideo = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { id } = req.params;
  const video = await videoModel.findById(id);
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of this video");
    return res.status(403).redirect("/");
  }
  await videoModel.findByIdAndDelete(id);
  await userModel.findByIdAndUpdate(_id, { $pull: { videos: id } });
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await videoModel
      .find({
        title: { $regex: new RegExp(keyword, "i") },
      })
      .populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};
export const viewApi = async (req, res) => {
  const { id } = req.params;
  const video = await videoModel.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};
export const createComment = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    params: { id },
    body: { text },
  } = req;
  const video = await videoModel.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const user = await userModel.findById(_id);
  if (!user) {
    req.flash("error", "Please Login");
    return;
  }
  const comment = await commentModel.create({
    text,
    owner: user._id,
    video: id,
    avatarUrl: user.avatarUrl,
    name: user.name,
  });
  video.comments.push(comment._id);
  await video.save();
  user.comments.push(comment._id);
  await user.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.session.user;
  try {
    const comment = await commentModel.findById(id).populate("video");
    const videoId = comment.video;
    const video = await videoModel.findById(videoId);
    if (!comment._id) {
      return res.sendStatus(404);
    }
    if (String(comment.owner._id) !== String(_id)) {
      return res.sendStatus(403);
    }
    if (!video) {
      return res.sendStatus(404);
    }
    await commentModel.findByIdAndDelete(id);
    await videoModel.findByIdAndUpdate(videoId, { $pull: { comments: id } });
    await video.save();
    return res.sendStatus(200);
  } catch {
    return res.sendStatus(403);
  }
};
export const editComment = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    params: { id },
    body: { editText },
  } = req;
  const comment = await commentModel.findById(id);
  if (!comment._id) {
    return res.sendStatus(404);
  }
  if (String(comment.owner._id) !== String(_id)) {
    return res.sendStatus(403);
  }
  await commentModel.findByIdAndUpdate(id, {
    text: editText,
  });
  return res.sendStatus(200);
};

export const likeApi = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    params: { id },
  } = req;
  const video = await videoModel.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const user = await userModel.findById(_id);
  if (!user) {
    return res.sendStatus(404);
  }
  const existingRating = user.likesVideo.includes(id);
  let likesCount;
  if (existingRating) {
    user.likesVideo.remove(id);
    await user.save();
    video.meta.likes.remove(_id);
    await video.save();
    likesCount = video.meta.likes.length;
    return res.status(200).json({ likesCount });
  }
  user.likesVideo.push(id);
  await user.save();
  video.meta.likes.push(_id);
  await video.save();
  likesCount = video.meta.likes.length;
  return res.status(200).json({ likesCount });
};

export const likeCommentApi = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    params: { id },
  } = req;
  const comment = await commentModel.findById(id);
  if (!comment) {
    return res.sendStatus(404);
  }
  const user = await userModel.findById(_id);
  if (!user) {
    return res.sendStatus(404);
  }
  const existingRating = user.likesComment.includes(id);
  let likesCommentCount;
  if (existingRating) {
    user.likesComment.remove(id);
    await user.save();
    comment.likes.remove(_id);
    await comment.save();
    likesCommentCount = comment.likes.length;
    return res.status(200).json({ likesCommentCount });
  }
  user.likesComment.push(id);
  await user.save();
  comment.likes.push(_id);
  await comment.save();
  likesCommentCount = comment.likes.length;
  return res.status(200).json({ likesCommentCount });
};

export const infoApi = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.session.user;
  const user = await userModel.findById(_id);
  if (!user) {
    return res.sendStatus(404);
  }
  const comment = await commentModel.findById(id);
  if (!comment) {
    return res.sendStatus(404);
  }
  return res.status(200).json({ comment, user });
};

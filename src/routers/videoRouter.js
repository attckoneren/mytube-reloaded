import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  deleteVideo,
  getUpload,
  postUpload,
} from "../controllers/videoController";

const videosRouter = express.Router();

videosRouter.get("/:id([0-9a-g]{24})", watch);
videosRouter.route("/:id([0-9a-g]{24})/edit").get(getEdit).post(postEdit);
videosRouter.route("/upload").get(getUpload).post(postUpload);
videosRouter.get("/:id([0-9a-g]{24})/delete", deleteVideo);

export default videosRouter;

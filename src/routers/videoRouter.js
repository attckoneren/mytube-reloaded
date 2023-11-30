import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  deleteVideo,
  getUpload,
  postUpload,
} from "../controllers/videoController";
import { protectorMiddleware, uploadVideoMiddleware } from "../middlewares";

const videosRouter = express.Router();

videosRouter.get("/:id([0-9a-g]{24})", watch);
videosRouter
  .route("/:id([0-9a-g]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);
videosRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(uploadVideoMiddleware.single("video"), postUpload);
videosRouter.get("/:id([0-9a-g]{24})/delete", protectorMiddleware, deleteVideo);

export default videosRouter;

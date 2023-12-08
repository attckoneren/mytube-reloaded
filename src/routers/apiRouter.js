import express from "express";
import {
  viewApi,
  createComment,
  deleteComment,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-g]{24})/view", viewApi);
apiRouter.post("/videos/:id([0-9a-g]{24})/comment", createComment);
apiRouter.delete("/comments/:id([0-9a-g]{24})/delete", deleteComment);

export default apiRouter;

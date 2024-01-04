import express from "express";
import {
  viewApi,
  createComment,
  deleteComment,
  editComment,
  likeApi,
  likeCommentApi,
  infoApi,
} from "../controllers/videoController";
import { subsApi } from "../controllers/userController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-g]{24})/view", viewApi);
apiRouter.post("/videos/:id([0-9a-g]{24})/comment", createComment);
apiRouter.delete("/comments/:id([0-9a-g]{24})/delete", deleteComment);
apiRouter.patch("/comments/:id([0-9a-g]{24})/edit", editComment);
apiRouter.post("/videos/:id([0-9a-g]{24})/like", likeApi);
apiRouter.post("/comments/:id([0-9a-g]{24})/like", likeCommentApi);
apiRouter.get("/users/:id([0-9a-g]{24})/info", infoApi);
apiRouter.post("/users/:id([0-9a-g]{24})/subscription", subsApi);
export default apiRouter;

import express from "express";
import { viewApi } from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-g]{24})/view", viewApi);

export default apiRouter;

import express from "express";
import { logout, edit, remove, see } from "../controllers/userController";

const usersRouter = express.Router();

usersRouter.get("/logout", logout);
usersRouter.get("/edit", edit);
usersRouter.get("/remove", remove);
usersRouter.get("/:id", see);

export default usersRouter;

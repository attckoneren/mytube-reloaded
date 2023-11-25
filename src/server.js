import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import usersRouter from "./routers/userRouter";
import videosRouter from "./routers/videoRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use("/", globalRouter);
app.use("/users", usersRouter);
app.use("/videos", videosRouter);

export default app;

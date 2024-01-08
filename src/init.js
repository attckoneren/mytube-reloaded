import "dotenv/config";
import "./db";
import "./models/video";
import "./models/user";
import "./models/comment";

import app from "./server";

const handleServer = () =>
  console.log(
    `server listening on port http://localhost:${process.env.PORT} ✅`
  );
app.listen(process.env.PORT, handleServer);

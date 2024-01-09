import "dotenv/config";
import "./db";
import "./models/video";
import "./models/user";
import "./models/comment";

import app from "./server";

const port = process.env.PORT || 4000;

const handleServer = () =>
  console.log(`server listening on port http://localhost:${port} ✅`);
app.listen(port, handleServer);

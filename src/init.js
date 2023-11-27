import "dotenv/config";
import "./db";
import "./models/video";
import "./models/user";

import app from "./server";

const PORT = 4000;

const handleServer = () =>
  console.log(`server listening on port http://localhost:${PORT} ✅`);
app.listen(PORT, handleServer);

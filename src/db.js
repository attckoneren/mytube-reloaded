import mongoose from "mongoose";

const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;

const dbURL = `mongodb://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

mongoose.connect(dbURL);

const db = mongoose.connection;

const handleOpen = () => console.log("connected to DB ✅");
const handleError = (error) => console.log("DB Error ❌", error);
db.on("error", handleError);
db.once("open", handleOpen);

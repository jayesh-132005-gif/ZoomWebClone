import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";

// SETTING UP A EXPRESS SERVER
const app = express();
const server = createServer(app);
const io = connectToSocket(server);
app.use("/api/users", userRoutes);

// MIDDLEWARES
app.set("port", process.env.PORT || 8000);

// TO ALLOW CROSS ORIGIN REQUESTS
app.use(cors());

// TO PARSE INCOMING REQUESTS WITH JSON PAYLOADS AND URL-ENCODED DATA, WITH A LIMIT OF 40KB
app.use(express.json({ limit: "40kb" }));

// TO PARSE INCOMING REQUESTS WITH URL-ENCODED DATA, WITH A LIMIT OF 40KB
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);


// ROUTES
app.get("/", (req, res) => {
    res.send("Hello World");
});

const start = async () => {

    // TO CONNECT A DATABASE
    const connectionDb =  await mongoose.connect("mongodb+srv://devjayeshsingh_db_user:JsG24139500@zoomwebclone.fgewwob.mongodb.net/?appName=ZoomWebClone");
    console.log(`mongodb connected: ${connectionDb.connection.host}`);

    // TO LISTEN TO A SERVER
    server.listen(app.get("port"), () => {
        console.log("Example app listening on port 8000!");
    });
}

// CALLLING A SERVER START FUNCTION
start ();
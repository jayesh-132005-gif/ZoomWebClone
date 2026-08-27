import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnLine = {};

export const connectToSocket = (server) => {
    // We create a socket server
    const io = new Server(server);

    // Socket server connection
    io.on("connection", (socket) => {
        
        // Multiple handling of events
        socket.on("join_call", (path) => {
            
            // Adding user to room
            if(connections[path] === undefined) {
                connections[path] = [];
            }

            connections[path].push(socket.id);

            timeOnLine[socket.id] = new Date();

            // Sending new users to old users
            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit(
                    "user_joined", 
                    socket.id, 
                    connections[path]);
            }
            
            // Sending old chat of room to new users
            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; a++) {
                    io.to(socket.id).emit(
                        "chat_message", 
                        messages[path][a]['data'], 
                        messages[path][a]['sender'], 
                        messages[path][a]['socket-id-sender']);   
                }
            }

        });

    });

        socket.on("signal", (toId, message) => {

        });


        socket.on("chat_message", (data, sender) => {


        });

        socket.on("disconnected", () => {

        });






       return io;
    }












     

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

            if(connections[path] === undefined) {
                connections[path] = [];
            }
            connections[path].push(socket.id);

            timeOnLine[socket.id] = new Date();

            // connections[path].forEach((ele) => {
            //     io.to(ele);
            // });

            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit(
                    "user_joined", 
                    socket.id, 
                    connections[path]);
            }

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

        // socket.on("signal", (toId, message) => {

        // });


        // socket.on("chat_message", (data, sender) => {


        // });

        // socket.on("disconnected", () => {

        // });






       return io;
    }












     

import { Server } from "socket.io";

// TO save a connection information with room name and socket id
let connections = {};
// To save a message information with room name and message data
let messages = {};
// To save a time information with socket id and time of connection
let timeOnLine = {};


// Socket server initialization function.
export const connectToSocket = (server) => {
    // We create a socket server.
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ['GET', 'POST'],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    // Socket server connection.
    io.on("connection", (socket) => {
        
        // Multiple handling of events.
        socket.on("join_call", (path) => {
            
            // Adding user to room
            if(connections[path] === undefined) {
                connections[path] = [];
            }
            connections[path].push(socket.id);
            timeOnLine[socket.id] = new Date();

            // Sending new users to old users.
            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit(
                    "user_joined", 
                    socket.id, 
                    connections[path]);
            }
            
            // Sending old chat of room to new users.
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
  
        // To send a messgae from (socket.id)sender to (toId)receiver. 
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        // Have this Functionalities
        // Receive message from client → Identify a room of client → Store a message in the history → Share a message to all clients.
        socket.on("chat_message", (data, sender) => {

            const [ matchingRoom, found ] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if(!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found === true) {
                if(messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }
                messages[matchingRoom].push({
                    'data': data,
                    'sender': sender,
                    'socket-id-sender': socket.id
                })
                console.log("messages", key, ":", sender, data)
                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat_message", data, sender, socket.id);
                });
            }    

        });
        
        // When a user disconnects, we need to remove the user from the room and notify other users in the room.
        socket.on("disconnect", () => {
            const diffTime = Math.abs(timeOnLine[socket.id] - new Date());
            let key;
            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                for (let a=0; a<v.length; a++) {
                    if(v[a] === socket.id) {
                        key = k;
                        for (let b=0; b<connections[key].length; b++) {
                            io.to(connections[key][b]).emit("user-left", socket.id);
                        }
                        const index = connections[key].indexOf(socket.id);
                        connections[key].splice(index, 1);
                        if(connections[key].length === 0) {
                            delete connections[key];
                        }
                    }
                }
            }
        });


    });



       return io;
    }












     

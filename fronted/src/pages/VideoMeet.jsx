import { useState, useRef, useEffect } from "react";
import server from "../utils/server.js";

// Backend server base url
const server_url = server;

// Configuration for WebRTC peer connections
const peerConfig = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
};


// VideoMeetComponent is a React component that manages video meeting functionality.
export default function VideoMeetComponent() {
    const [video, setVideo] = useState(true);

    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);

    const connections = useRef({});

    const getPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            localStreamRef.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error("Camera/Microphone access failed:", error);
        }
    };

     // Effect hook to request camera and microphone permissions when the component mounts.
    useEffect(() => {
        getPermissions();
    }, []);


    return (
        <div>
            <h2>Meeting Room</h2>

            <video ref={localVideoRef} autoPlay muted />


            <p>Camera: {video ? "On" : "Off"}</p>

            <button onClick={() => setVideo(prev => !prev)}>
                {video ? "Turn Camera Off" : "Turn Camera On"}
            </button>
        </div>
    );
}
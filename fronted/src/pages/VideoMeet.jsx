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
    const [audio, setAudio] = useState(true);

    const [videoAvailable, setVideoAvailable] = useState(false);
    const [audioAvailable, setAudioAvailable] = useState(false);

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

            setVideoAvailable(stream.getVideoTracks().length > 0);
            setAudioAvailable(stream.getAudioTracks().length > 0);

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

        } catch (error) {
            console.error("Camera/Microphone access failed:", error);
        }

    };

    const handleVideo = () => {
        const nextVideoState = !video;
        setVideo(nextVideoState);

        const stream = localStreamRef.current;

        if (!stream) return;

        stream.getVideoTracks().forEach((track) => {
            track.enabled = nextVideoState;
        });
    };

    const handleAudio = () => {
        const nextAudioState = !audio;
        setAudio(nextAudioState);

        const stream = localStreamRef.current;

        if (!stream) return;

        stream.getAudioTracks().forEach((track) => {
            track.enabled = nextAudioState;
        });
    };

    // Effect hook to request camera and microphone permissions when the component mounts.
    useEffect(() => {
        getPermissions();
    }, []);

    // Effect hook to enable or disable video tracks based on the 'video' state.
    useEffect(() => {
        const stream = localStreamRef.current;

        if (!stream) return;

        const videoTracks = stream.getVideoTracks();

        videoTracks.forEach((track) => {
            track.enabled = video;
        });
    }, [video]);

    // Effect hook to enable or disable audio tracks based on the 'audio' state.
    useEffect(() => {
        const stream = localStreamRef.current;

        if (!stream) return;

        const audioTracks = stream.getAudioTracks();

        audioTracks.forEach((track) => {
            track.enabled = audio;
        });
    }, [audio]);

    return (
        <div>
            <h2>Meeting Room</h2>

            <video ref={localVideoRef} autoPlay muted />

            <p>Camera: {video ? "On" : "Off"}</p>

            <button onClick={handleVideo}>
                {video ? "Turn Camera Off" : "Turn Camera On"}
            </button>

            <p>Microphone: {audio ? "On" : "Off"}</p>

            <button onClick={handleAudio}>
                {audio ? "Turn Microphone Off" : "Turn Microphone On"}
            </button>
        </div>
    );
}
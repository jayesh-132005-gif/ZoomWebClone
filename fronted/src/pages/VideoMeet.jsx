import { useState, useRef, useEffect, useCallback } from "react";
import server from "../utils/server.js";
import { io } from "socket.io-client";

// Backend server base URL
const server_url = server;

// WebRTC peer connection configuration
const peerConfig = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
};

// Stop every track belonging to a stream.
const stopMediaTracks = (stream) => {
    if (!stream) return;

    stream.getTracks().forEach((track) => {
        track.stop();
    });
};

// Convert media errors into understandable messages.
const getMediaErrorMessage = (device, error) => {
    switch (error?.name) {
        case "NotAllowedError":
        case "PermissionDeniedError":
            return `${device}: permission was denied or blocked.`;

        case "NotFoundError":
        case "DevicesNotFoundError":
            return `${device}: no compatible device was found.`;

        case "NotReadableError":
        case "TrackStartError":
            return `${device}: the device may be busy or unavailable.`;

        case "OverconstrainedError":
            return `${device}: the device cannot satisfy the requested settings.`;

        default:
            return `${device}: could not be accessed.`;
    }
};

export default function VideoMeetComponent() {

    // Camera and microphone control states
    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);

    // Screen sharing control states
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");

    // Device availability states
    const [videoAvailable, setVideoAvailable] = useState(false);
    const [audioAvailable, setAudioAvailable] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(false);

    // Media error message
    const [mediaError, setMediaError] = useState("");

    // References
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const connections = useRef({});

    // Identifies the latest permission request.
    // It helps prevent stale permission requests from creating leaked streams.
    const permissionRequestIdRef = useRef(0);

    // Socket state.
    const socketRef = useRef(null);
    const socketIdRef = useRef(null);

    // Socket references.
    const [socketStatus, setSocketStatus] = useState("Not connected");
    const [socketError, setSocketError] = useState("");

    // Request camera, microphone and screen-sharing capability.
    const getPermissions = useCallback(async (requestId) => {
        let videoStream = null;
        let audioStream = null;
        const errors = [];

        const isRequestStale = () => {
            return requestId !== permissionRequestIdRef.current;
        };

        try {
            setMediaError("");

            // Step 1: Check camera permission and availability.
            try {
                videoStream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true
                    });

                // The component may have unmounted while permission was pending.
                if (isRequestStale()) {
                    stopMediaTracks(videoStream);
                    return;
                }

                const videoTracks = videoStream.getVideoTracks();

                if (videoTracks.length > 0) {
                    setVideoAvailable(true);
                    setVideo(true);

                    // Store the camera stream immediately.
                    // Cleanup can now stop it even while the mic request is pending.
                    localStreamRef.current = new MediaStream(videoTracks);

                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject =
                            localStreamRef.current;
                    }

                    console.log("Video permission granted");
                } else {
                    stopMediaTracks(videoStream);
                    videoStream = null;

                    setVideoAvailable(false);
                    setVideo(false);
                    errors.push("Camera: no video track was returned.");
                }
            } catch (error) {
                if (isRequestStale()) return;

                stopMediaTracks(videoStream);
                videoStream = null;

                setVideoAvailable(false);
                setVideo(false);

                errors.push(getMediaErrorMessage("Camera", error));
                console.error("Camera access failed:", error);
            }

            if (isRequestStale()) return;

            // Step 2: Check microphone permission and availability.
            try {
                audioStream =
                    await navigator.mediaDevices.getUserMedia({
                        audio: true
                    });

                if (isRequestStale()) {
                    stopMediaTracks(audioStream);
                    stopMediaTracks(videoStream);
                    return;
                }

                const audioTracks = audioStream.getAudioTracks();

                if (audioTracks.length > 0) {
                    setAudioAvailable(true);
                    setAudio(true);

                    // Combine the available camera and microphone tracks.
                    const existingTracks =
                        localStreamRef.current?.getTracks() ?? [];

                    const combinedStream = new MediaStream([
                        ...existingTracks,
                        ...audioTracks
                    ]);

                    localStreamRef.current = combinedStream;

                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = combinedStream;
                    }

                    console.log("Audio permission granted");
                } else {
                    stopMediaTracks(audioStream);
                    audioStream = null;

                    setAudioAvailable(false);
                    setAudio(false);
                    errors.push("Microphone: no audio track was returned.");
                }
            } catch (error) {
                if (isRequestStale()) {
                    stopMediaTracks(videoStream);
                    return;
                }

                stopMediaTracks(audioStream);
                audioStream = null;

                setAudioAvailable(false);
                setAudio(false);

                errors.push(getMediaErrorMessage("Microphone", error));
                console.error("Microphone access failed:", error);
            }

            if (isRequestStale()) {
                stopMediaTracks(videoStream);
                stopMediaTracks(audioStream);
                return;
            }

            // Step 3: Check browser screen-sharing support.
            const canShareScreen =
                typeof navigator.mediaDevices?.getDisplayMedia ===
                "function";

            setScreenAvailable(canShareScreen);

            // Step 4: Handle partial or complete media failure.
            const activeStream = localStreamRef.current;
            const availableTracks = activeStream?.getTracks() ?? [];

            if (availableTracks.length === 0) {
                const message =
                    errors.length > 0
                        ? errors.join(" ")
                        : "No camera or microphone is available.";

                setMediaError(message);
                console.error(message);
                return;
            }

            // One device can remain usable when the other fails.
            setMediaError(errors.join(" "));

        } catch (error) {
            // Clean up streams if an unexpected setup error occurs.
            if (isRequestStale()) {
                stopMediaTracks(videoStream);
                stopMediaTracks(audioStream);
                return;
            }

            const tracks = new Set([
                ...(localStreamRef.current?.getTracks() ?? []),
                ...(videoStream?.getTracks() ?? []),
                ...(audioStream?.getTracks() ?? [])
            ]);

            tracks.forEach((track) => {
                track.stop();
            });

            localStreamRef.current = null;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }

            setVideoAvailable(false);
            setAudioAvailable(false);
            setVideo(false);
            setAudio(false);

            const message =
                "Unable to prepare camera or microphone. Please try again.";

            setMediaError(message);
            console.error("Media setup failed:", error);
        }
    }, []);

    // Connect to the socket server.
    const connectToSocketServer = () => {
        if (socketRef.current) return;

        setSocketStatus("Connecting...");
        setSocketError("");

        const socket = io(server_url, {
            reconnection: true,
            timeout: 10000
        });

        socketRef.current = socket;

        // Fronted listening connect event from backend and emit join_call event to backend
        socket.on("connect", () => {
            socketIdRef.current = socket.id;

            setSocketStatus("Connected");
            setSocketError("");

            console.log("Socket connected:", socket.id);

            // Join the meeting room with the provided username.
            const roomPath = window.location.href;
            socket.emit("join_call", roomPath);
            console.log("Joining meeting room:", roomPath);

        });

        // Fronted listening user_joined event from backend
        socket.on("user_joined", async (newUserId, participants) => {
            console.log("New user joined:", newUserId);
            console.log("Participants in room:", participants);

            participants.forEach(async (participantId) => {
                // Skip our own socket ID
                if (participantId === socketIdRef.current) {
                    return;
                }

                // Avoid duplicate peer connections
                if (connections.current[participantId]) {
                    return;
                }

                // Create Peer Connection
                const peerConnection = new RTCPeerConnection(peerConfig);

                // Store Peer Connection
                connections.current[participantId] = peerConnection;
                console.log("Peer connection created for:", participantId);

                peerConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log("New ICE candidate:", event.candidate);
                    } else {
                        console.log("ICE candidate gathering completed");
                    }
                };

                if (newUserId === socketIdRef.current) {
                    const offer = await peerConnection.createOffer();

                    await peerConnection.setLocalDescription(offer);

                    socket.emit("signal", participantId, {
                        type: "offer",
                        offer: offer
                    });

                    console.log("Offer sent to:", participantId);
                }


            });
        });

        socket.on("connect_error", (error) => {
            setSocketStatus("Connection failed");
            setSocketError(
                "Unable to connect to the meeting server. Check that the backend is running."
            );

            console.error("Socket connection failed:", error.message);
        });

        socket.on("disconnect", (reason) => {
            socketIdRef.current = null;
            setSocketStatus("Disconnected");

            console.log("Socket disconnected:", reason);
        });
    };

    // Connect to the lobby.
    const handleLobbyConnect = () => {
        const trimmedUsername = username.trim();

        if (!trimmedUsername) {
            setUsernameError("Please enter a username.");
            return;
        }

        setUsername(trimmedUsername);
        setUsernameError("");
        setAskForUsername(false);

        // Establish socket connection after username is set.
        connectToSocketServer();
    };

    // Toggle camera tracks.
    const handleVideo = () => {
        if (!videoAvailable) return;

        const nextVideoState = !video;
        setVideo(nextVideoState);

        const stream = localStreamRef.current;

        if (!stream) return;

        stream.getVideoTracks().forEach((track) => {
            track.enabled = nextVideoState;
        });
    };

    // Toggle microphone tracks.
    const handleAudio = () => {
        if (!audioAvailable) return;

        const nextAudioState = !audio;
        setAudio(nextAudioState);

        const stream = localStreamRef.current;

        if (!stream) return;

        stream.getAudioTracks().forEach((track) => {
            track.enabled = nextAudioState;
        });
    };

    // Request media on mount and release it on unmount.
    useEffect(() => {
        const requestId = ++permissionRequestIdRef.current;

        void getPermissions(requestId);

        return () => {

            // Invalidate any permission request still in progress.
            permissionRequestIdRef.current += 1;

            console.log("Stopping camera and microphone");

            stopMediaTracks(localStreamRef.current);
            localStreamRef.current = null;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }

            // Disconnect from the socket server on unmount.
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current.removeAllListeners();

                socketRef.current = null;
                socketIdRef.current = null;
            }

        };
    }, [getPermissions]);

    // Keep video tracks synchronized with the camera toggle state.
    useEffect(() => {
        const stream = localStreamRef.current;

        if (!stream) return;

        stream.getVideoTracks().forEach((track) => {
            track.enabled = video;
        });
    }, [video]);

    // Keep audio tracks synchronized with the microphone toggle state.
    useEffect(() => {
        const stream = localStreamRef.current;

        if (!stream) return;

        stream.getAudioTracks().forEach((track) => {
            track.enabled = audio;
        });
    }, [audio]);

    return (
        <div>
            {askForUsername ? (
                <div>
                    <h2>Enter into Lobby</h2>

                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setUsernameError("");
                        }}
                    />

                    <button onClick={handleLobbyConnect}>
                        Connect
                    </button>
                    <br />
                    <br />

                    {usernameError && (
                        <p role="alert">{usernameError}</p>
                    )}
                </div>
            ) : (
                <h2>Meeting Room</h2>
            )}

            {mediaError && (
                <p role="alert">{mediaError}</p>
            )}

            {!askForUsername && (
                <p>Socket status: {socketStatus}</p>
            )}

            {socketError && (
                <p role="alert">{socketError}</p>
            )}


            <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
            />

            {!askForUsername && (
                <>
                    <p>Camera: {video ? "On" : "Off"}</p>

                    <button
                        onClick={handleVideo}
                        disabled={!videoAvailable}
                    >
                        {video ? "Turn Camera Off" : "Turn Camera On"}
                    </button>

                    <p>Microphone: {audio ? "On" : "Off"}</p>

                    <button
                        onClick={handleAudio}
                        disabled={!audioAvailable}
                    >
                        {audio ? "Turn Microphone Off" : "Turn Microphone On"}
                    </button>

                    <p>
                        Screen Sharing:{" "}
                        {screenAvailable ? "Supported" : "Not supported"}
                    </p>
                </>
            )}
        </div>
    );

}
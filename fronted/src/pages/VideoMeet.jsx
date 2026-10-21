import { useState, useRef, useEffect, useCallback } from "react";
import server from "../utils/server.js";

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
            <h2>Meeting Room</h2>

            {mediaError && (
                <p role="alert">{mediaError}</p>
            )}

            <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
            />

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
        </div>
    );
}

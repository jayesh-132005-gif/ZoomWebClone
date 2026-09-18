import "../App.css";
import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div className="landingPageContainer">

            <nav>
                <div className="navHeader">
                    <h2>Nexus Hub</h2>
                </div>
                <div className="navList">
                    <Link to="/home" className="nav-button guest-button">
                        Join as a Guest
                    </Link>
                    <Link to="/register" className="nav-button register-button">
                        Register
                    </Link>
                    <Link to="/auth" className="nav-button login-button">
                        Login
                    </Link>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1><span style={{ color: "#ff9839" }}>Connect</span> with your Loved one</h1>
                    <p>Cover a distance by <span style={{ color: "#ff9839" }}>Nexus Hub</span></p>
                    <div role="button" className="getStartedButton">
                        <Link to="/auth">Get Started</Link>
                    </div>
                </div>
                <div className="callingImage">
                    <img src="/callingImage.png" alt="callingImage" height="400rem" />
                </div>
            </div>

        </div>

    );
}
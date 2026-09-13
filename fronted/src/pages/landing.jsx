import "../App.css";
import React from "react";

export default function Landing() {
    return (
        <div className="landingPageContainer">

            <nav>
                <div className="navHeader">
                    <h2>Nexus Hub</h2>
                </div>
                <div className="navList">
                    <p>Join as a Guest</p>
                    <p>Register</p>
                    <div role="button">
                        Login
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1><span style={{color: "#ff9839" }}>Connect</span> with your Loved one</h1>
                    <p>Cover a distance by <span style={{color: "#ff9839" }}>Nexus Hub</span></p>
                </div>
                <div>
                    <img src="/callingImage.png" alt="callingImage" height = "300rem"/>
                </div>
            </div>
        </div>
    );
}
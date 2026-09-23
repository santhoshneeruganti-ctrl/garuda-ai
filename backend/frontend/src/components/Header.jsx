import React from "react";

import "../styles/header.css";


function Header({
    isAuthenticated,
    username,
    onLogin,
    onRegister,
    onLogout,
}) {

    return (

        <header className="header">

            {/* ==================================================
                LEFT
                ================================================== */}

            <div className="header-left">

                <div className="header-brand">

                    <span className="header-brand-icon">
                        🦅
                    </span>

                    <span className="header-brand-name">
                        Garuda AI
                    </span>

                </div>

            </div>


            {/* ==================================================
                RIGHT
                ================================================== */}

            <div className="header-right">

                {!isAuthenticated ? (

                    <>
                        {/* ======================================
                            LOGIN
                            ====================================== */}

                        <button
                            type="button"
                            className="header-login-btn"
                            onClick={onLogin}
                        >
                            Login
                        </button>


                        {/* ======================================
                            SIGN UP
                            ====================================== */}

                        <button
                            type="button"
                            className="header-register-btn"
                            onClick={onRegister}
                        >
                            Sign Up
                        </button>
                    </>

                ) : (

                    <>
                        {/* ======================================
                            PROFILE
                            ====================================== */}

                        <button
                            type="button"
                            className="header-profile-btn"
                        >

                            <span className="header-profile-icon">
                                👤
                            </span>

                            <span className="header-username">
                                {username || "User"}
                            </span>

                        </button>


                        {/* ======================================
                            LOGOUT
                            ====================================== */}

                        <button
                            type="button"
                            className="header-logout-btn"
                            onClick={onLogout}
                        >
                            Logout
                        </button>

                    </>

                )}

            </div>

        </header>

    );

}


export default Header;
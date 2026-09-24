import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

import "./auth.css";


function Login({
  onLogin,
  onRegister,
}) {

  // ======================================================
  // REMEMBERED ACCOUNT
  // ======================================================

  const rememberedAccount =
    localStorage.getItem(
      "garuda_remembered_account"
    );


  let savedAccount = null;


  try {

    if (rememberedAccount) {

      savedAccount =
        JSON.parse(
          rememberedAccount
        );

    }

  } catch (error) {

    console.error(
      "❌ Invalid remembered account data:",
      error
    );

    localStorage.removeItem(
      "garuda_remembered_account"
    );

  }


  // ======================================================
  // STATE
  // ======================================================

  const [
    username,
    setUsername,
  ] = useState(
    savedAccount?.username || ""
  );


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    rememberAccount,
    setRememberAccount,
  ] = useState(
    Boolean(savedAccount)
  );


  const [
    useAnotherAccount,
    setUseAnotherAccount,
  ] = useState(false);


  // ======================================================
  // LOGIN
  // ======================================================

  async function handleLogin(event) {

    event.preventDefault();

    setError("");


    const cleanUsername =
      username.trim();


    if (
      !cleanUsername ||
      !password
    ) {

      setError(
        "Please enter username and password."
      );

      return;

    }


    try {

      setLoading(true);


      const response =
        await axios.post(
          `${API_BASE_URL}/login`,
          {
            username:
              cleanUsername,

            password:
              password,
          }
        );


      const data =
        response.data;


      console.log(
        "🦅 Login Response:",
        data
      );


      // ==================================================
      // LOGIN FAILED
      // ==================================================

      if (
        data.status !==
        "success"
      ) {

        setError(
          data.message ||
          "Invalid Username or Password"
        );

        return;

      }


      // ==================================================
      // ACCESS TOKEN CHECK
      // ==================================================

      if (
        !data.access_token
      ) {

        setError(
          "Login successful, but access token was not received."
        );

        return;

      }


      // ==================================================
      // SAVE JWT
      // ==================================================

      localStorage.setItem(
        "garuda_access_token",
        data.access_token
      );


      // ==================================================
      // SAVE USERNAME
      // ==================================================

      localStorage.setItem(
        "garuda_username",
        cleanUsername
      );


      // ==================================================
      // REMEMBER ACCOUNT
      // ==================================================

      if (
        rememberAccount
      ) {

        const account = {

          username:
            cleanUsername,

          email:
            data.email ||
            data.user?.email ||
            savedAccount?.email ||
            "",

        };


        localStorage.setItem(
          "garuda_remembered_account",
          JSON.stringify(
            account
          )
        );


      } else {

        localStorage.removeItem(
          "garuda_remembered_account"
        );

      }


      console.log(
        "🦅 Garuda Login Successful"
      );


      // ==================================================
      // INFORM APP
      // ==================================================

      if (onLogin) {

        onLogin(
          data
        );

      }

    } catch (error) {

      console.error(
        "❌ Login Error:",
        error
      );


      if (
        error.response
      ) {

        setError(
          error.response.data?.message ||
          "Login failed."
        );

      } else {

        setError(
          "Unable to connect to Garuda server."
        );

      }

    } finally {

      setLoading(
        false
      );

    }

  }


  // ======================================================
  // USE ANOTHER ACCOUNT
  // ======================================================

  function handleUseAnotherAccount() {

    setUseAnotherAccount(
      true
    );

    setUsername("");

    setPassword("");

    setError("");

  }


  // ======================================================
  // BACK TO REMEMBERED ACCOUNT
  // ======================================================

  function handleBackToRememberedAccount() {

    setUseAnotherAccount(
      false
    );

    setPassword("");

    setError("");

  }


  // ======================================================
  // REMOVE REMEMBERED ACCOUNT
  // ======================================================

  function removeRememberedAccount() {

    localStorage.removeItem(
      "garuda_remembered_account"
    );


    setRememberAccount(
      false
    );


    setUseAnotherAccount(
      true
    );


    setUsername("");

    setPassword("");

    setError("");

  }


  // ======================================================
  // REMEMBERED ACCOUNT SCREEN
  // ======================================================

  if (
    savedAccount &&
    !useAnotherAccount
  ) {

    return (

      <div className="auth-page">

        <div className="auth-card">


          {/* ==================================================
              LOGO
          ================================================== */}

          <div className="auth-logo">
            🦅
          </div>


          {/* ==================================================
              TITLE
          ================================================== */}

          <h1>
            Welcome back
          </h1>


          <p className="auth-subtitle">
            Continue with your Garuda account
          </p>


          {/* ==================================================
              ACCOUNT CARD
          ================================================== */}

          <div className="remembered-account">

            <div className="remembered-avatar">

              {savedAccount.username
                ?.charAt(0)
                ?.toUpperCase() || "G"}

            </div>


            <div className="remembered-info">

              <div className="remembered-username">

                {savedAccount.username}

              </div>


              {savedAccount.email && (

                <div className="remembered-email">

                  {savedAccount.email}

                </div>

              )}

            </div>


            <div className="remembered-check">
              ✓
            </div>

          </div>


          {/* ==================================================
              PASSWORD
          ================================================== */}

          <form
            onSubmit={
              handleLogin
            }
          >

            <div className="auth-field">

              <label>
                Password
              </label>


              <input
                type="password"

                value={
                  password
                }

                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }

                placeholder="Enter your password"

                autoComplete="current-password"

                autoFocus

                disabled={
                  loading
                }

              />

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

              <div className="auth-error">

                {error}

              </div>

            )}


            {/* ==================================================
                LOGIN
            ================================================== */}

            <button
              type="submit"
              className="auth-submit"
              disabled={
                loading
              }
            >

              {loading
                ? "Signing in..."
                : "Continue"}

            </button>

          </form>


          {/* ==================================================
              ACCOUNT OPTIONS
          ================================================== */}

          <div className="account-options">

            <button
              type="button"
              className="account-option-btn"
              onClick={
                handleUseAnotherAccount
              }
              disabled={
                loading
              }
            >

              Use another account

            </button>


            <button
              type="button"
              className="remove-account-btn"
              onClick={
                removeRememberedAccount
              }
              disabled={
                loading
              }
            >

              Remove remembered account

            </button>

          </div>


          {/* ==================================================
              REGISTER
          ================================================== */}

          <div className="auth-switch">

            <span>
              Don't have an account?
            </span>


            <button
              type="button"
              onClick={
                onRegister
              }
              disabled={
                loading
              }
            >

              Create Account

            </button>

          </div>


        </div>

      </div>

    );

  }


  // ======================================================
  // NORMAL LOGIN SCREEN
  // ======================================================

  return (

    <div className="auth-page">

      <div className="auth-card">


        {/* ==================================================
            LOGO
        ================================================== */}

        <div className="auth-logo">
          🦅
        </div>


        {/* ==================================================
            TITLE
        ================================================== */}

        <h1>
          Welcome to Garuda AI
        </h1>


        <p className="auth-subtitle">
          Sign in to continue
        </p>


        {/* ==================================================
            LOGIN FORM
        ================================================== */}

        <form
          onSubmit={
            handleLogin
          }
        >


          {/* ==================================================
              USERNAME
          ================================================== */}

          <div className="auth-field">

            <label>
              Username
            </label>


            <input
              type="text"

              value={
                username
              }

              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }

              placeholder="Enter your username"

              autoComplete="username"

              autoFocus

              disabled={
                loading
              }

            />

          </div>


          {/* ==================================================
              PASSWORD
          ================================================== */}

          <div className="auth-field">

            <label>
              Password
            </label>


            <input
              type="password"

              value={
                password
              }

              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }

              placeholder="Enter your password"

              autoComplete="current-password"

              disabled={
                loading
              }

            />

          </div>


          {/* ==================================================
              REMEMBER ACCOUNT
          ================================================== */}

          <label className="remember-account">

            <input
              type="checkbox"

              checked={
                rememberAccount
              }

              onChange={(event) =>
                setRememberAccount(
                  event.target.checked
                )
              }

              disabled={
                loading
              }
            />


            <span>
              Remember this account
            </span>

          </label>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="auth-error">

              {error}

            </div>

          )}


          {/* ==================================================
              LOGIN BUTTON
          ================================================== */}

          <button
            type="submit"
            className="auth-submit"
            disabled={
              loading
            }
          >

            {loading
              ? "Signing in..."
              : "Login"}

          </button>

        </form>


        {/* ==================================================
            BACK TO REMEMBERED ACCOUNT
        ================================================== */}

        {savedAccount && (

          <button
            type="button"
            className="back-account-btn"
            onClick={
              handleBackToRememberedAccount
            }
            disabled={
              loading
            }
          >

            ← Continue with remembered account

          </button>

        )}


        {/* ==================================================
            REGISTER
        ================================================== */}

        <div className="auth-switch">

          <span>
            Don't have an account?
          </span>


          <button
            type="button"
            onClick={
              onRegister
            }
            disabled={
              loading
            }
          >

            Create Account

          </button>

        </div>


      </div>

    </div>

  );

}


export default Login;
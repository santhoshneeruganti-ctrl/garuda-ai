import {
  useState,
} from "react";

import axios from "axios";
import { API_BASE_URL } from "../config/api";

import "../styles/profile.css";


function ChangePassword({
  onBack,
}) {

  // ======================================================
  // FORM STATE
  // ======================================================

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");


  const [
    newPassword,
    setNewPassword,
  ] = useState("");


  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");


  // ======================================================
  // UI STATE
  // ======================================================

  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  // ======================================================
  // CHANGE PASSWORD
  // ======================================================

  async function handleChangePassword(
    event
  ) {

    event.preventDefault();


    setError("");

    setSuccess("");


    // ==================================================
    // EMPTY FIELD CHECK
    // ==================================================

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {

      setError(
        "Please fill in all password fields."
      );

      return;

    }


    // ==================================================
    // PASSWORD MATCH
    // ==================================================

    if (
      newPassword !==
      confirmPassword
    ) {

      setError(
        "New passwords do not match."
      );

      return;

    }


    // ==================================================
    // PASSWORD LENGTH
    // ==================================================

    if (
      newPassword.length < 8
    ) {

      setError(
        "New password must be at least 8 characters."
      );

      return;

    }


    // ==================================================
    // SAME PASSWORD CHECK
    // ==================================================

    if (
      currentPassword ===
      newPassword
    ) {

      setError(
        "New password must be different from your current password."
      );

      return;

    }


    // ==================================================
    // GET JWT
    // ==================================================

    const token =
      localStorage.getItem(
        "garuda_access_token"
      );


    if (!token) {

      setError(
        "Your session has expired. Please login again."
      );

      return;

    }


    // ==================================================
    // SEND REQUEST
    // ==================================================

    try {

      setLoading(true);


      const response =
        await axios.post(
          `${API_BASE_URL}/change-password`,

          {

            current_password:
              currentPassword,

            new_password:
              newPassword,

            confirm_password:
              confirmPassword,

          },

          {

            headers: {

              Authorization:
                `Bearer ${token}`,

            },

          }

        );


      const data =
        response.data;


      console.log(
        "🔐 Change Password Response:",
        data
      );


      // ==================================================
      // BACKEND FAILURE
      // ==================================================

      if (
        data.status !==
        "success"
      ) {

        setError(
          data.message ||
          "Unable to change password."
        );

        return;

      }


      // ==================================================
      // SUCCESS
      // ==================================================

      setSuccess(
        "Password changed successfully."
      );


      // Clear password fields

      setCurrentPassword("");

      setNewPassword("");

      setConfirmPassword("");


    } catch (error) {

      console.error(
        "❌ Change Password Error:",
        error
      );


      if (
        error.response
      ) {

        setError(
          error.response.data?.message ||
          "Unable to change password."
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
  // UI
  // ======================================================

  return (

    <div className="profile-page">


      <div className="profile-card">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="profile-header">


          {/* BACK */}

          <button
            type="button"
            className="profile-back-btn"
            onClick={onBack}
            disabled={loading}
          >

            ← Back

          </button>


          {/* TITLE */}

          <div className="profile-title">

            <span className="profile-title-icon">

              🔐

            </span>


            <div>

              <h1>
                Change Password
              </h1>


              <p>
                Update your Garuda account password
              </p>

            </div>

          </div>


        </div>


        {/* ==================================================
            SECURITY INTRO
        ================================================== */}

        <div className="change-password-intro">


          <div className="change-password-icon">

            🛡️

          </div>


          <div>

            <h2>
              Keep your account secure
            </h2>


            <p>
              Choose a strong password that you
              don't use on other accounts.
            </p>

          </div>


        </div>


        {/* ==================================================
            FORM
        ================================================== */}

        <form
          className="change-password-form"
          onSubmit={
            handleChangePassword
          }
        >


          {/* CURRENT PASSWORD */}

          <div className="auth-field">

            <label>
              Current Password
            </label>


            <input
              type="password"
              value={
                currentPassword
              }
              onChange={(event) =>
                setCurrentPassword(
                  event.target.value
                )
              }
              placeholder="Enter your current password"
              autoComplete="current-password"
              disabled={loading}
            />

          </div>


          {/* NEW PASSWORD */}

          <div className="auth-field">

            <label>
              New Password
            </label>


            <input
              type="password"
              value={
                newPassword
              }
              onChange={(event) =>
                setNewPassword(
                  event.target.value
                )
              }
              placeholder="Enter your new password"
              autoComplete="new-password"
              disabled={loading}
            />

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="auth-field">

            <label>
              Confirm New Password
            </label>


            <input
              type="password"
              value={
                confirmPassword
              }
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Confirm your new password"
              autoComplete="new-password"
              disabled={loading}
            />

          </div>


          {/* PASSWORD REQUIREMENT */}

          <div className="password-requirement">

            <span>
              •
            </span>

            New password must contain at least
            8 characters.

          </div>


          {/* ERROR */}

          {error && (

            <div className="auth-error">

              {error}

            </div>

          )}


          {/* SUCCESS */}

          {success && (

            <div className="auth-success">

              ✓ {success}

            </div>

          )}


          {/* SUBMIT */}

          <button
            type="submit"
            className="auth-submit change-password-submit"
            disabled={loading}
          >

            {loading
              ? "Changing Password..."
              : "Change Password"}

          </button>


        </form>


        {/* ==================================================
            SECURITY NOTE
        ================================================== */}

        <div className="change-password-note">

          🔒 Your password is securely protected
          using bcrypt.

        </div>


      </div>

    </div>

  );

}


export default ChangePassword;
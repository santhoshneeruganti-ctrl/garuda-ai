import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import ChangePassword from "./ChangePassword";

import "../styles/profile.css";


function Profile({
  onBack,
  onLogout,
}) {

  // ======================================================
  // PROFILE STATE
  // ======================================================

  const [
    profile,
    setProfile,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // ======================================================
  // EDIT STATE
  // ======================================================

  const [
    isEditing,
    setIsEditing,
  ] = useState(false);


  const [
    editUsername,
    setEditUsername,
  ] = useState("");


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    saveMessage,
    setSaveMessage,
  ] = useState("");


  // ======================================================
  // CHANGE PASSWORD STATE
  // ======================================================

  const [
    showChangePassword,
    setShowChangePassword,
  ] = useState(false);


  // ======================================================
  // LOAD PROFILE
  // ======================================================

  useEffect(() => {

    loadProfile();

  }, []);


  // ======================================================
  // LOAD PROFILE
  // ======================================================

  async function loadProfile() {

    setLoading(true);

    setError("");

    setSaveMessage("");


    const token =
      localStorage.getItem(
        "garuda_access_token"
      );


    if (!token) {

      setError(
        "Please login to view your profile."
      );

      setLoading(false);

      return;

    }


    try {

      const response =
        await axios.get(
          "http://127.0.0.1:8000/profile",
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
        "🦅 Profile Response:",
        data
      );


      if (
        data.status !==
        "success"
      ) {

        setError(
          data.message ||
          "Unable to load profile."
        );

        return;

      }


      const profileData = {

        id:
          data.id,

        username:
          data.username,

        email:
          data.email,

      };


      setProfile(
        profileData
      );


      setEditUsername(
        profileData.username ||
        ""
      );


    } catch (error) {

      console.error(
        "❌ Profile Error:",
        error
      );


      if (
        error.response
      ) {

        setError(
          error.response.data?.message ||
          "Unable to load profile."
        );

      } else {

        setError(
          "Unable to connect to Garuda server."
        );

      }

    } finally {

      setLoading(false);

    }

  }


  // ======================================================
  // START EDIT
  // ======================================================

  function handleEdit() {

    setEditUsername(
      profile?.username ||
      ""
    );


    setSaveMessage("");

    setIsEditing(
      true
    );

  }


  // ======================================================
  // CANCEL EDIT
  // ======================================================

  function handleCancelEdit() {

    setEditUsername(
      profile?.username ||
      ""
    );


    setSaveMessage("");

    setIsEditing(
      false
    );

  }


  // ======================================================
  // SAVE PROFILE
  // ======================================================

  async function handleSaveProfile() {

    const username =
      editUsername.trim();


    if (!username) {

      setSaveMessage(
        "Username cannot be empty."
      );

      return;

    }


    if (
      username.length < 3
    ) {

      setSaveMessage(
        "Username must contain at least 3 characters."
      );

      return;

    }


    const token =
      localStorage.getItem(
        "garuda_access_token"
      );


    if (!token) {

      setSaveMessage(
        "Please login again."
      );

      return;

    }


    setSaving(true);

    setSaveMessage("");


    try {

      /*
       * IMPORTANT:
       *
       * The frontend is prepared for the
       * profile update endpoint.
       *
       * Change this endpoint only if your
       * FastAPI backend uses a different route.
       */

      const response =
        await axios.put(
          "http://127.0.0.1:8000/profile",
          {
            username,
          },
          {
            headers: {

              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",

            },
          }
        );


      const data =
        response.data;


      console.log(
        "🦅 Profile Update Response:",
        data
      );


      if (
        data.status !==
        "success"
      ) {

        setSaveMessage(
          data.message ||
          "Unable to update profile."
        );

        return;

      }


      // ==================================================
      // UPDATE LOCAL PROFILE
      // ==================================================

      const updatedUsername =
        data.username ||
        username;


      setProfile(
        (previous) => ({
          ...previous,

          username:
            updatedUsername,

        })
      );


      setEditUsername(
        updatedUsername
      );


      // ==================================================
      // KEEP HEADER USERNAME IN SYNC
      // ==================================================

      localStorage.setItem(
        "garuda_username",
        updatedUsername
      );


      setIsEditing(
        false
      );


      setSaveMessage(
        "Profile updated successfully."
      );


    } catch (error) {

      console.error(
        "❌ Profile Update Error:",
        error
      );


      if (
        error.response
      ) {

        setSaveMessage(
          error.response.data?.message ||
          "Unable to update profile."
        );

      } else {

        setSaveMessage(
          "Unable to connect to Garuda server."
        );

      }

    } finally {

      setSaving(false);

    }

  }


  // ======================================================
  // LOGOUT
  // ======================================================

  function handleLogout() {

    console.log(
      "🦅 Logging out from Profile"
    );


    localStorage.removeItem(
      "garuda_access_token"
    );


    localStorage.removeItem(
      "garuda_username"
    );


    if (onLogout) {

      onLogout();

    }

  }


  // ======================================================
  // CHANGE PASSWORD SCREEN
  // ======================================================

  if (
    showChangePassword
  ) {

    return (

      <ChangePassword

        onBack={() =>
          setShowChangePassword(
            false
          )
        }

      />

    );

  }


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {

    return (

      <div className="profile-page">

        <div className="profile-card">

          <div className="profile-loading">

            Loading profile...

          </div>

        </div>

      </div>

    );

  }


  // ======================================================
  // ERROR
  // ======================================================

  if (error) {

    return (

      <div className="profile-page">

        <div className="profile-card">

          <button
            type="button"
            className="profile-back-btn"
            onClick={onBack}
          >

            ← Back

          </button>


          <div className="profile-error">

            {error}

          </div>

        </div>

      </div>

    );

  }


  // ======================================================
  // PROFILE UI
  // ======================================================

  return (

    <div className="profile-page">

      <div className="profile-card">


        {/* ==================================================
            PROFILE HEADER
        ================================================== */}

        <div className="profile-header">


          <button
            type="button"
            className="profile-back-btn"
            onClick={onBack}
          >

            ← Back

          </button>


          <div className="profile-title">

            <span className="profile-title-icon">

              👤

            </span>


            <div>

              <h1>
                Profile
              </h1>


              <p>
                Manage your Garuda account
              </p>

            </div>

          </div>


        </div>


        {/* ==================================================
            AVATAR
        ================================================== */}

        <div className="profile-avatar-section">

          <div className="profile-avatar">

            {profile?.username
              ?.charAt(0)
              ?.toUpperCase() ||
              "G"}

          </div>


          <div className="profile-display-name">

            {profile?.username ||
              "Garuda User"}

          </div>


          <div className="profile-status">

            <span className="profile-status-dot" />

            Active Account

          </div>

        </div>


        {/* ==================================================
            ACCOUNT INFORMATION
        ================================================== */}

        <div className="profile-info">


          {/* ==================================================
              USERNAME
          ================================================== */}

          <div className="profile-info-row">

            <div className="profile-info-label">

              Username

            </div>


            {isEditing ? (

              <input
                type="text"
                className="profile-edit-input"
                value={editUsername}
                onChange={(event) =>
                  setEditUsername(
                    event.target.value
                  )
                }
                maxLength={50}
                autoComplete="username"
              />

            ) : (

              <div className="profile-info-value">

                {profile?.username ||
                  "Not available"}

              </div>

            )}

          </div>


          {/* ==================================================
              EMAIL
          ================================================== */}

          <div className="profile-info-row">

            <div className="profile-info-label">

              Email

            </div>


            <div className="profile-info-value">

              {profile?.email ||
                "Not available"}

            </div>

          </div>


          {/* ==================================================
              ACCOUNT
          ================================================== */}

          <div className="profile-info-row">

            <div className="profile-info-label">

              Account

            </div>


            <div className="profile-info-value">

              Garuda AI Account

            </div>

          </div>


          {/* ==================================================
              STATUS
          ================================================== */}

          <div className="profile-info-row">

            <div className="profile-info-label">

              Status

            </div>


            <div className="profile-info-value profile-active">

              Active

            </div>

          </div>


        </div>


        {/* ==================================================
            SAVE MESSAGE
        ================================================== */}

        {saveMessage && (

          <div
            className={
              saveMessage
                .toLowerCase()
                .includes("success")
                ? "profile-save-message success"
                : "profile-save-message"
            }
          >

            {saveMessage}

          </div>

        )}


        {/* ==================================================
            ACCOUNT ACTIONS
        ================================================== */}

        <div className="profile-actions">


          {isEditing ? (

            <>

              {/* SAVE */}

              <button
                type="button"
                className="profile-save-btn"
                onClick={
                  handleSaveProfile
                }
                disabled={saving}
              >

                <span>
                  {saving
                    ? "⏳"
                    : "💾"}
                </span>


                {saving
                  ? "Saving..."
                  : "Save Changes"}

              </button>


              {/* CANCEL */}

              <button
                type="button"
                className="profile-cancel-btn"
                onClick={
                  handleCancelEdit
                }
                disabled={saving}
              >

                Cancel

              </button>

            </>

          ) : (

            <>

              {/* EDIT PROFILE */}

              <button
                type="button"
                className="profile-edit-btn"
                onClick={
                  handleEdit
                }
              >

                <span>
                  ✏️
                </span>

                Edit Profile

              </button>


              {/* CHANGE PASSWORD */}

              <button
                type="button"
                className="profile-change-password-btn"
                onClick={() =>
                  setShowChangePassword(
                    true
                  )
                }
              >

                <span>
                  🔐
                </span>

                Change Password

              </button>


              {/* LOGOUT */}

              <button
                type="button"
                className="profile-logout-btn"
                onClick={
                  handleLogout
                }
              >

                <span>
                  ↪
                </span>

                Logout

              </button>

            </>

          )}

        </div>


      </div>

    </div>

  );

}


export default Profile;
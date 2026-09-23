import { useState } from "react";
import axios from "axios";
import "./auth.css";

function Register({ onLogin }) {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(event) {

    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {

      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/register",
        {
          username: username.trim(),
          email: email.trim(),
          password: password
        }
      );

      const data = response.data;

      console.log(
        "🦅 Register Response:",
        data
      );

      if (data.status !== "success") {

        setError(
          data.message ||
          "Registration failed."
        );

        return;
      }

      setSuccess(
        "Account created successfully. You can now login."
      );

      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (error) {

      console.error(
        "❌ Registration Error:",
        error
      );

      if (error.response) {

        setError(
          error.response.data?.message ||
          "Registration failed."
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


  return (

    <div className="auth-page">

      <div className="auth-card">

        {/* LOGO */}

        <div className="auth-logo">
          🦅
        </div>


        {/* TITLE */}

        <h1>
          Create your Garuda Account
        </h1>

        <p className="auth-subtitle">
          Join Garuda AI and start exploring
        </p>


        {/* REGISTER FORM */}

        <form onSubmit={handleRegister}>

          {/* USERNAME */}

          <div className="auth-field">

            <label>
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Choose a username"
              autoComplete="username"
              disabled={loading}
            />

          </div>


          {/* EMAIL */}

          <div className="auth-field">

            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
            />

          </div>


          {/* PASSWORD */}

          <div className="auth-field">

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Create a password"
              autoComplete="new-password"
              disabled={loading}
            />

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="auth-field">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={loading}
            />

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
              {success}
            </div>

          )}


          {/* REGISTER BUTTON */}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >

            {loading
              ? "Creating Account..."
              : "Create Account"
            }

          </button>

        </form>


        {/* LOGIN */}

        <div className="auth-switch">

          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={onLogin}
            disabled={loading}
          >
            Login
          </button>

        </div>

      </div>

    </div>

  );

}

export default Register;
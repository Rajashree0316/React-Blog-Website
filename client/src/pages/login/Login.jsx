// Login.jsx
import axios from "axios";
import React, { useState, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import { validatePassword } from "../../utils/validation";
import "./Login.css";

export default function Login() {
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const userRef = useRef();
  const passwordRef = useRef();
  const { dispatch, isFetching } = useContext(Context);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const username = userRef.current.value.trim();
    const password = passwordRef.current.value;

    if (!username || !password) {
      setError("Username and password are required.");
      triggerShake();
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be 8+ chars, with upper/lowercase, number, and special char."
      );
      return;
    }

    dispatch({ type: "LOGIN_START" });

    try {
      const res = await axios.post("/api/auth/login", {
        username,
        password,
      });

localStorage.setItem("user", JSON.stringify(res.data.user));
localStorage.setItem("token", res.data.token);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: res.data.user, token: res.data.token },
      });
    } catch (err) {
      setError("Invalid username or password.");
      dispatch({ type: "LOGIN_FAILURE" });
    }
  };

  return (
    <div className="container">
      <div className={`login ${shake ? "shake" : ""}`}>
        <h2 className="loginTitle">LOGIN</h2>
        {error && (
          <div className="alertCard">
            <p>{error}</p>
          </div>
        )}

        <form className="loginForm" onSubmit={handleSubmit}>
          <input
            type="text"
            className="loginInput"
            placeholder="Username"
            ref={userRef}
            autoComplete="username"
            onFocus={() => setError("")}
          />
          <input
            type="password"
            className="loginInput"
            placeholder="Password"
            ref={passwordRef}
            autoComplete="current-password"
            onFocus={() => setError("")}
          />
          <button className="loginButton" type="submit" disabled={isFetching}>
            {isFetching ? "Logging in..." : "Login"}
          </button>

          <div className="loginLinks">
            <Link className="forgotLink" to="/forgot-password">
              Forgot password?
            </Link>
            <Link className="noUnderline" to="/register">
              Don't have an account?{" "}
              <span className="signupLink">Sign up</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

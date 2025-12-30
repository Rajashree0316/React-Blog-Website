import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  validateUsername,
  validateEmail,
  validatePassword,
} from "../../utils/validation";
import "./Register.css";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [popup, setPopup] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, lastName, username, email, password } = form;

    if (!firstName || !lastName || !username || !email || !password) {
      setError("All fields are required.");
      triggerShake();
      return;
    }

    if (!validateUsername(username)) {
      setError("Invalid username format.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid email address.");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be 8+ chars, with upper/lowercase, number, and special char."
      );
      return;
    }

    try {
      const res = await axios.post("/api/auth/register", {
        firstName,
        lastName,
        username: username.toLowerCase(),
        email,
        password,
      });

      if (res.data) {
        localStorage.setItem(
          "blogUser",
          JSON.stringify({
            firstName,
            lastName,
            email,
          })
        );
        setPopup(true);
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      console.error("Register error:", err);
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="container">
      <div className={`register ${shake ? "shake" : ""}`}>
        <h2 className="registerTitle">REGISTER</h2>
        {error && <div className="alertCard">{error}</div>}
        <form className="registerForm" onSubmit={handleSubmit}>
          <div className="nameFields">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="registerInput"
              value={form.firstName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className="registerInput"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>
          <input
            type="text"
            name="username"
            placeholder="Username"
            maxLength={20}
            className="registerInput"
            value={form.username}
            onChange={handleChange}
          />
          <input
            type="text"
            name="email"
            placeholder="Email"
            className="registerInput"
            value={form.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="registerInput"
            value={form.password}
            onChange={handleChange}
          />
          <button className="registerButton" type="submit" disabled={shake}>
            Register
          </button>
          <div className="registerLoginText">
            <Link className="link" to="/login">
              Already have an account?{" "}
              <span className="loginHighlight">Login</span>
            </Link>
          </div>
        </form>

        {popup && (
          <div className="popup">
            <span>You have registered successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}

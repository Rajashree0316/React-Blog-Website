// components/Newsletter.jsx
import React, { useState } from "react";
import "./Newsletter.css";
import { API } from "../../../config";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = async () => {
    if (!email.includes("@")) {
      setMessage("Please enter a valid email.");
      return;
    }

    try {
      const res = await fetch(`${API}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("Thank you for subscribing!");
        setEmail("");
      } else {
        setMessage(result.message || "Subscription failed.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="sideContainer">
      <h3 className="sideContainer-headings">Newsletter</h3>
      <hr className="divider" />

      <p className="desc">
        Subscribe to get the latest posts delivered to your inbox.
      </p>
      <input
        className="newsletter-input"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="newsletter-button" onClick={handleSubscribe}>
        Subscribe
      </button>
      {message && <p className="newsletter-message">{message}</p>}
    </div>
  );
}

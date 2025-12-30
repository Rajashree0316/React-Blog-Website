import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../../context/Context";
import "./HeroImagePage.css";

const HeroImagePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(Context);

  const isLoggedIn = Boolean(user);
  const primaryBtnLabel = "Explore Articles";
  const secondaryBtnLabel = isLoggedIn ? "Write a Post" : "Get Started";
  const secondaryBtnPath = isLoggedIn ? "/write" : "/register";

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Welcome to the Thought Hub</h1>
        <h2 className="tagline">
          {["Fuel", "your", "curiosity.", "Share", "your", "voice."].map(
            (word, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.15}s` }}>
                {word}
              </span>
            )
          )}
        </h2>

        <p>
          A space where curiosity meets creativity. Whether you're a tech
          enthusiast, a storyteller, or just here to explore—Thought Hub empowers
          you to learn, share, and grow.
        </p>
        <p>
          Dive into a world of insightful articles, emerging trends, and bold
          ideas. Make your voice heard and connect with a community that values
          originality.
        </p>

        <div className="hero-buttons">
          <button onClick={() => navigate("/blogs")}>{primaryBtnLabel}</button>
          <button
            onClick={() => navigate(secondaryBtnPath)}
            className="secondary"
          >
            {secondaryBtnLabel}
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroImagePage;

import React from "react";
import "./IntroSection.css";
import { useNavigate } from "react-router-dom";
import AuthorProfileCard from "../profileCard/AuthorProfileCard";

const IntroSection = ({userId}) => {
  const navigate = useNavigate();

  return (
    <section className="commonContainer">
      {/* About BlogSpace Card */}
      <div className="commonHeadings">
        <h2>About BlogSpace</h2>
        <p>
          BlogSpace is a dynamic platform for sharing a wide range of blog
          content — from tech and education to food, movies, cricket, and more.
          Join us to explore, express, and engage.
        </p>
      </div>

      <div className="intro-main">
        {/* Left Section */}
        <div className="intro-left">
          <h2>Our Story</h2>
          <p>
            BlogSpace started with the mission to empower everyone — writers,
            readers, and learners — by offering a versatile platform for all
            types of blogs. Whether you're reviewing a film or explaining a
            concept, this is your space.
          </p>

          <h3>What We Offer</h3>
          <div className="offer-grid">
            <div className="offer-card">
              <h4>📘 Tutorials</h4>
              <p>
                From cooking recipes to React guides — content for every
                curiosity.
              </p>
            </div>
            <div className="offer-card">
              <h4>💡 Insights</h4>
              <p>
                Stay informed with the latest news, trends, and educational
                resources.
              </p>
            </div>
            <div className="offer-card">
              <h4>🤝 Community Driven</h4>
              <p>
                Share your voice and connect with bloggers from every
                background.
              </p>
            </div>
            <div className="offer-card">
              <h4>🎬 Reviews & More</h4>
              <p>
                Write or read reviews on movies, games, cricket matches, and
                more.
              </p>
            </div>
          </div>

          <div className="our-values">
            <h3>Our Values</h3>
            <div className="value-card">
              <h4>Quality First</h4>
              <p>
                We prioritize high-quality, helpful content across all
                categories.
              </p>
            </div>
            <div className="value-card">
              <h4>Inclusivity</h4>
              <p>
                Writers and readers from every niche and region are welcome.
              </p>
            </div>
            <div className="value-card">
              <h4>Continuous Learning</h4>
              <p>We grow together by sharing knowledge and stories.</p>
            </div>
            <div className="value-card">
              <h4>Freedom of Expression</h4>
              <p>Express yourself with respect, creativity, and passion.</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="intro-right">
          <AuthorProfileCard userId={userId}/> {/* Use the component here */}

          <div className="community-card">
            <h4>Join Our Community</h4>
            <p>
              Ready to start sharing your knowledge or learning from others?
            </p>
            <button className="btn primary" onClick={() => navigate("/write")}>
              Write a Post
            </button>
            <button
              className="btn secondary"
              onClick={() => navigate("/contact")}
            >
              Get in Touch
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;

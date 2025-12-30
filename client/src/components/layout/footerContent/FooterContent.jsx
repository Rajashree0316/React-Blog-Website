import React, { useEffect, useState } from "react";
import "./FooterContent.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../../../config";

export default function FooterContent() {
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axios.get(`${API}/tags`);
        setTags(res.data || []);
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    };

    fetchTags();
  }, []);

  const handleTagClick = (tagName) => {
    navigate(`/posts?tag=${encodeURIComponent(tagName)}`);
  };

  return (
    <div className="footerContent">
      {/* Brand */}
      <div className="footerSection brand">
        <div className="logo">
          <span className="logoIcon">📄</span>
          <Link to="/" className="logoText">
            BlogSpace
          </Link>
        </div>
        <div className="brandDesc">
          Discover insightful articles and stay up to date with our latest posts
          on web development, design, and tech trends.
        </div>
      </div>

      {/* Resources */}
      <div className="footerSection">
        <h4>Resources</h4>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/blogs">Blogs</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
      </div>

      {/* Dynamic Categories */}
      <div className="footerSection">
        <h4>Categories</h4>
        <ul>
          {tags.slice(0, 4).map((tag, index) => (
            <li key={index}>
              <div
                className="footerTag"
                onClick={() => handleTagClick(tag.name)}
              >
                {tag.name.charAt(0).toUpperCase() + tag.name.slice(1)}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Legal */}
      <div className="footerSection">
        <h4>Legal</h4>
        <ul>
          <li>
            <a href="#">Privacy Policy</a>
          </li>
          <li>
            <a href="#">Terms of Service</a>
          </li>
          <li>
            <a href="#">Cookie Policy</a>
          </li>
          <li>
            <a href="#">GDPR</a>
          </li>
        </ul>
      </div>
    </div>
  );
}

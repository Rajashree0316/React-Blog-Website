// src/pages/PersonalBlogs.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PersonalBlogs.css";
import Post from "../../components/allPosts/post/Post";
import Spinner, { SpinnerTypes } from "../../components/common/commonSpinner/Spinner";
import { useNavigate } from "react-router-dom";

const PersonalBlogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = "rajashreeasok16";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`/api/posts?user=${username}`);
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching Rajashree's posts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading)
    return (
      <div className="spinner-wrapper">
        <Spinner
          type={SpinnerTypes.RING}
          size={120}
          color="#d49931"
        />
      </div>
    );

  return (
    <div className="personal-blogs-container">

      {/* ✨ NEW: Back Button */}
      <button className="back-btn" onClick={() => navigate("/about")}>
        ← Back
      </button>

      {/* ✨ NEW: Elegant Heading */}
      <h2 className="section-title">My Personal Blogs</h2>

      {posts.length === 0 ? (
        <p className="no-blogs-msg">No blogs available yet.</p>
      ) : (
        <div
          className={`personal-posts-wrapper ${
            posts.length === 1 ? "centered" : ""
          }`}
        >
          {posts.map((post, index) => (
            <div
              key={post._id}
              className={`animated-card ${
                index % 3 === 0
                  ? "slide-from-left"
                  : index % 3 === 1
                  ? "slide-from-top"
                  : "slide-from-right"
              }`}
            >
              <Post post={post} index={index} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalBlogs;

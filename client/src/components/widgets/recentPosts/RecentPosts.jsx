// src/widgets/recentPosts/RecentPosts.jsx
import React, { useEffect, useState } from "react";
import { API, PF } from "../../../config";
import axios from "axios";
import "./RecentPosts.css";

export default function RecentPosts() {
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const res = await axios.get(`${API}/posts`);
        setRecentPosts(res.data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching recent posts:", error);
      }
    };

    fetchRecentPosts();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="sidePost-card-container">
      <h2>Recent Posts</h2>
      <div className="sidePost-cards">
        {recentPosts.map((post) => (
          <a
            href={`/post/${post._id}`}
            className="sidePost-card"
            key={post._id}
          >
            <img
              src={
                post.photo
                  ? post.photo.startsWith("http")
                    ? post.photo
                    : `${PF}/${post.photo}`
                  : "/default-placeholder.jpg"
              }
              alt={post.title}
            />
            <div className="sidePost-info">
              <h3>
                {post.title.length > 50
                  ? post.title.substring(0, 50) + "..."
                  : post.title}
              </h3>
              <p className="sidePost-date">{formatDate(post.createdAt)}</p>
            </div>
          </a>
        ))}
      </div>
      <a href="/blogs" className="view-all-link">
        View All
      </a>
    </div>
  );
}

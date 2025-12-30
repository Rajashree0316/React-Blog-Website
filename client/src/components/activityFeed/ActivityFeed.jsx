import React, { useEffect, useState } from "react";
import { API } from "../../config";
import axios from "axios";
import "./ActivityFeed.css";
import PostCard from "../common/postCard/PostCard";

const ActivityFeed = ({ userId, showSaved = false }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const fetchPosts = async () => {
      try {
        const url = showSaved
          ? `${API}/posts/saved/${userId}`
          : `${API}/posts?userId=${userId}`;
        const res = await axios.get(url);
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching posts:", err.message);
      }
    };

    fetchPosts();
  }, [userId, showSaved]);

  const handleLike = (postId, liked) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, likes: (p.likes || 0) + (liked ? 1 : -1) }
          : p
      )
    );
  };

  return (
    <div className="activity-feed">
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard key={post._id} post={post} onLike={handleLike} />
        ))
      ) : (
        <p className="no-posts">No posts yet.</p>
      )}
    </div>
  );
};

export default ActivityFeed;

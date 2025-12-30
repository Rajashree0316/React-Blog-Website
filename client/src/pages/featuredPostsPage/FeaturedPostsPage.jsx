import React, { useEffect, useState } from "react";
import { API } from "../../config";
import axios from "axios";
import "./FeaturedPostsPage.css";
import Post from "../../components/allPosts/post/Post";

export default function FeaturedPostsPage() {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharePostId, setSharePostId] = useState(null);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
const res = await axios.get(`${API}/posts/featured`);
        setFeaturedPosts((res.data || []).filter((post) => post.featured));
      } catch (err) {
        console.error("Failed to fetch featured posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedPosts();
  }, []);

  const handleOpenShare = (postId) => setSharePostId(postId);
  const handleCloseShare = () => setSharePostId(null);

  return (
    <div className="featured-posts-page">
      <h1 className="featured-heading">
        ✨ Spotlight Stories — Curated Excellence ✨
      </h1>

      {loading ? (
        <p className="loading-message">Loading featured posts...</p>
      ) : featuredPosts.length === 0 ? (
        <p className="no-posts-message">No featured posts found.</p>
      ) : (
        <div
          className={`featured-posts-grid ${
            featuredPosts.length === 1
              ? "single"
              : featuredPosts.length === 2
              ? "double"
              : ""
          }`}
        >
          {featuredPosts.map((post, index) => (
            <Post
              key={post._id}
              post={post}
              index={index}
              isHighlighted={true}
              isShareOpen={sharePostId === post._id}
              onOpenShare={() => handleOpenShare(post._id)}
              onCloseShare={handleCloseShare}
            />
          ))}
        </div>
      )}
    </div>
  );
}

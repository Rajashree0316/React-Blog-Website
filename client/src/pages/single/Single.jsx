// src/pages/single/Single.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { API } from "../../config";
import { useLocation, Link } from "react-router-dom";
import "./Single.css";
import SinglePost from "../../components/allPosts/singlepost/SinglePost";
import CommentSection from "../../components/allPosts/commentSection/CommentSection";
import StickySidebar from "../../components/layout/stickySidebar/StickySidebar";
import axios from "axios";
import usePostReactions from "../../hooks/usePostReactions";
import RecentPosts from "../../components/widgets/recentPosts/RecentPosts";
import FeaturedUserCard from "../../components/widgets/featuredUserCard/FeaturedUserCard";

export default function Single({ postId, currentUser }) {
  const location = useLocation();
  const commentSectionRef = useRef(null);
  const PF = import.meta.env.VITE_IMAGE_URL;

  const [post, setPost] = useState(null);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  // ✅ usePostReactions safely inside provider
  const {
    likesCount,
    commentsCount,
    saveCount,
    userLiked,
    userSaved,
    setLikesCount,
    setUserLiked,
    setUserSaved,
    setSaveCount,
    refreshReactions,
    version,
  } = usePostReactions(postId, currentUser?._id);

  const handleRefreshReactions = useCallback(async () => {
    await refreshReactions();
  }, [refreshReactions]);

  // ────────── Fetch post ──────────
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${API}/posts/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.error("Error fetching single post", err);
      }
    };
    if (postId) fetchPost();
  }, [postId]);

  // ────────── Fetch trending ──────────
  useEffect(() => {
    const fetchTrending = async () => {
      if (!post?.tags?.length) return;
      try {
        const res = await axios.get(`${API}/posts`);
        const filtered = res.data.filter(
          (p) =>
            p._id !== post._id && p.tags?.some((tag) => post.tags.includes(tag))
        );
        const uniqueFiltered = Array.from(
          new Map(filtered.map((p) => [p._id, p])).values()
        );
        setTrendingPosts(uniqueFiltered);
      } catch (err) {
        console.error("Error fetching trending posts:", err);
      }
    };
    fetchTrending();
  }, [post]);

  // ────────── Fetch recent posts ──────────
  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const res = await axios.get(`${API}/posts?sort=New`);

        setRecentPosts(res.data.slice(0, 5)); // limit to 5
      } catch (err) {
        console.error("Error fetching recent posts:", err);
      }
    };
    fetchRecentPosts();
  }, []);

  // ────────── Scroll to comments ──────────
  useEffect(() => {
    if (location.state?.scrollToComments && commentSectionRef.current) {
      commentSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  const scrollToComments = () => {
    if (!currentUser) return alert("Please log in to comment");
    commentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowSidebar(false);
  };

  // ────────── LIKE ──────────
  const handleLikeClick = async () => {
    if (!currentUser) return alert("Please log in to like posts");
    try {
      const res = await axios.put(
        `${API}/posts/${postId}/${userLiked ? "unlike" : "like"}`,
        { userId: currentUser._id }
      );
      setLikesCount(res.data.likesCount);
      setUserLiked(!userLiked);
    } catch (err) {
      console.error("Error updating like status:", err);
    }
  };

  // ────────── SAVE ──────────
  const handleSaveClick = async () => {
    if (!currentUser) return alert("Please log in to save posts");
    try {
      const res = await axios.put(
        `${API}/posts/${postId}/${userSaved ? "unsave" : "save"}`,
        { userId: currentUser._id }
      );

      setSaveCount(res.data.saveCount);
      setUserSaved(!userSaved);
    } catch (err) {
      console.error("Error updating save status:", err);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="single-wrapper">
      {/* ────────── Sidebar ────────── */}
      <div className={`reaction-sidebar ${showSidebar ? "show" : ""}`}>
        <StickySidebar
          key={version}
          likeCount={likesCount}
          commentCount={commentsCount}
          saveCount={saveCount}
          onCommentClick={scrollToComments}
          onLikeClick={handleLikeClick}
          onSaveClick={handleSaveClick}
          userLiked={userLiked}
          userSaved={userSaved}
        />
      </div>

      {/* ────────── Main Container ────────── */}
      <div className="single-container">
        <div className="single-subContainer">
          <div className="single-posts">
            {post && <SinglePost post={post} />}
          </div>

          {/* Comments */}
          <div className="single-comments" ref={commentSectionRef}>
            <CommentSection
              postId={postId}
              currentUser={currentUser}
              onCommentAdded={handleRefreshReactions}
              onCommentDeleted={handleRefreshReactions}
            />
          </div>
        </div>

        {/* ────────── Sidebar Posts ────────── */}
        <div className="singleSide-posts">
          {post && (
            <FeaturedUserCard
              username={post.username || currentUser?.username}
            />
          )}
          {/* ✅ Only show trending section if there are posts */}
          {trendingPosts.length > 0 && (
            <div className="singleSidePost-card-container">
              <h2>Trending Posts</h2>
              <div className="singleSidePost-cards">
                {trendingPosts.slice(0, 4).map((trend) => (
                  <Link
                    to={`/post/${trend._id}`}
                    key={trend._id}
                    className="singleSidePost-card"
                  >
                    <img
                      src={
                        trend.photo
                          ? PF + trend.photo
                          : PF + "/default-placeholder.jpg"
                      }
                      alt={trend.title}
                    />

                    <div className="singleSidePost-info">
                      <h3>
                        {trend.title.length > 50
                          ? trend.title.substring(0, 50) + "..."
                          : trend.title}
                      </h3>
                      <p className="singleSidePost-date">
                        {formatDate(trend.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/blogs" className="view-all-link">
                View All
              </Link>
            </div>
          )}
          {/* ✅ Recent Posts (only show if available) */}
          {recentPosts.length > 0 && <RecentPosts />}{" "}
        </div>
      </div>
    </div>
  );
}

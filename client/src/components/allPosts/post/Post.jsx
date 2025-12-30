import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaCommentAlt,
  FaEye,
  FaShareAlt,
  FaRegClock,
  FaBookmark,
} from "react-icons/fa";
import "./Post.css";
import axios from "axios";
import { toast } from "react-toastify";
import ShareModal from "../../common/shareModal/ShareModal";
import usePostReactions from "../../../hooks/usePostReactions";
import { useCommentContext } from "../../../context/CommentContext";

export default function Post({
  post,
  isHighlighted,
  index = 0,
  isShareOpen,
  onOpenShare,
  onCloseShare,
  onCommentClick,
  hideImageWrapper = false,
  compact = false,
}) {
  const PF = import.meta.env.IMAGE_BASE_URL || "http://localhost:5000/images/";
  const navigate = useNavigate();

  const [authorPic, setAuthorPic] = useState(null);
  const [viewsCount, setViewsCount] = useState(post.views || 0);

  const currentUser = useMemo(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  }, []);

  if (!post) return null;

  /* ─────── LIKE & COMMENT COUNTS ─────── */
  const {
    likesCount,
    commentsCount,
    saveCount,
    userLiked,
    userSaved,
    userCommented,
    setLikesCount,
    setUserLiked,
    setSaveCount,
    setUserSaved,
    setUserCommented,
  } = usePostReactions(post._id, currentUser?._id);

  let liveCommentCount = commentsCount;
  try {
    const ctx = useCommentContext();
    if (ctx?.totalCommentCount) liveCommentCount = ctx.totalCommentCount;
  } catch {}

  /* ─────── CLEAN TEXT ─────── */
  const plainText = useMemo(() => {
    try {
      return (
        new DOMParser().parseFromString(post.desc || "", "text/html").body
          .textContent || ""
      );
    } catch {
      return post.desc || "";
    }
  }, [post.desc]);

  const readTime = useMemo(() => {
    const wordsPerMinute = 200;
    const wordCount = plainText.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }, [plainText]);

  const words = plainText.split(/\s+/);
  const previewText = words.slice(0, 40).join(" ").trim();
  const isContentLong = words.length > 50;

  /* ─────── VIEW COUNTER ─────── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setViewsCount((prev) => prev + 1);
      axios.put(`/api/posts/${post._id}/view`).catch(() => {});
    }, 3000);
    return () => clearTimeout(timer);
  }, [post._id]);

  /* ─────── LIKE TOGGLE ─────── */
  const toggleLike = useCallback(async () => {
    if (!currentUser) {
      toast.info("Please log in to like the post");
      navigate("/login");
      return;
    }

    const updatedLiked = !userLiked;
    setUserLiked(updatedLiked);
    setLikesCount((prev) => prev + (updatedLiked ? 1 : -1));

    try {
      const endpoint = updatedLiked
        ? `/api/posts/${post._id}/like`
        : `/api/posts/${post._id}/unlike`;
      await axios.put(endpoint, { userId: currentUser._id });

      // persist in localStorage
      const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
      const updatedLikes = updatedLiked
        ? [...new Set([...likedPosts, post._id])]
        : likedPosts.filter((id) => id !== post._id);
      localStorage.setItem("likedPosts", JSON.stringify(updatedLikes));
    } catch {
      setUserLiked(userLiked);
      setLikesCount((prev) => prev + (userLiked ? 1 : -1));
      toast.error("Error updating like");
    }
  }, [userLiked, post._id, setUserLiked, setLikesCount, currentUser, navigate]);

  /* ─────── SAVE TOGGLE ─────── */
  const toggleSave = useCallback(async () => {
    if (!currentUser) {
      toast.info("Please log in to save the post");
      navigate("/login");
      return;
    }

    const updatedSaved = !userSaved;
    setUserSaved(updatedSaved);
    setSaveCount((prev) => prev + (updatedSaved ? 1 : -1));

    try {
      const endpoint = updatedSaved
        ? `/api/posts/${post._id}/save`
        : `/api/posts/${post._id}/unsave`;
      await axios.put(endpoint, { userId: currentUser._id });

      // persist in localStorage
      const savedPosts = JSON.parse(localStorage.getItem("savedPosts") || "[]");
      const updatedSaves = updatedSaved
        ? [...new Set([...savedPosts, post._id])]
        : savedPosts.filter((id) => id !== post._id);
      localStorage.setItem("savedPosts", JSON.stringify(updatedSaves));
    } catch {
      setUserSaved(userSaved);
      setSaveCount((prev) => prev + (userSaved ? 1 : -1));
      toast.error("Error updating save");
    }
  }, [userSaved, post._id, currentUser, navigate]);

  /* ─────── PERSISTENT STATE FROM LOCALSTORAGE ─────── */
  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    const savedPosts = JSON.parse(localStorage.getItem("savedPosts") || "[]");
    if (likedPosts.includes(post._id)) setUserLiked(true);
    if (savedPosts.includes(post._id)) setUserSaved(true);
  }, [post._id]);

  /* ─────── COMMENT CLICK ─────── */
  const handleCommentClick = useCallback(() => {
    navigate(`/post/${post._id}`, { state: { scrollToComments: true } });
  }, [navigate, post._id]);

  const shareUrl = `${window.location.origin}/post/${post._id}`;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCloseShare?.();
    };
    if (isShareOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isShareOpen, onCloseShare]);

  /* ─────── FETCH AUTHOR ─────── */
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const authorId =
          typeof post.userId === "object" && post.userId !== null
            ? post.userId._id || post.userId.id || post.userId
            : post.userId;

        if (!authorId) return;
        const res = await axios.get(`/api/users/${authorId}`);
        setAuthorPic(res.data);
      } catch {
        setAuthorPic(null);
      }
    };
    if (post?.userId && !post.userId.username) fetchAuthor();
    else if (post.userId?.username) setAuthorPic(post.userId);
  }, [post.userId]);

  const profilePic =
    authorPic?.profilePic || post.userId?.profilePic
      ? PF + (authorPic?.profilePic || post.userId?.profilePic)
      : "/default-placeholder.jpg";
  const authorName =
    authorPic?.username || post.userId?.username || "Unknown Author";

  return (
    <div
      className={`post ${isHighlighted ? "highlighted" : ""}${
        compact ? "post--compact" : ""
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="card">
        {post.photo && !hideImageWrapper && (
          <div className="postImgWrapper">
            <img
              loading="lazy"
              className="postImg"
              src={post.photo ? PF + post.photo : "/default-placeholder.jpg"}
              alt={post.title || "Post Image"}
              onError={(e) => (e.target.src = "/default-placeholder.jpg")}
            />
            {post.featured && (
              <span className="featured-label-overlay">Featured</span>
            )}
          </div>
        )}

        <div className="postMetaTop">
          <div className="authorInfo">
            <img
              loading="lazy"
              src={profilePic}
              alt="Author"
              className="avatar"
              onError={(e) => (e.target.src = "/default-placeholder.jpg")}
            />
            <div className="authorDetails">
              <Link
                to={`/profile/${
                  authorPic?._id || post.userId?._id || post.userId
                }`}
                className="authorName"
              >
                {authorName}
              </Link>
              <div className="dateReadTime">
                <span>
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span>
                  <FaRegClock className="metaIcon" />
                  {readTime} min read
                </span>
              </div>
            </div>
          </div>
          <FaShareAlt
            className="commonIcon shareIcon"
            onClick={onOpenShare}
            role="button"
            aria-label="Share Post"
          />
        </div>

        <div className="postContent">
          {post.tags?.length > 0 && (
            <div className="postTags">
              {post.tags.slice(0, 2).map((tag) => (
                <Link
                  key={tag}
                  to={`/posts?tag=${tag}`}
                  className="postTagInline"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
          <Link to={`/post/${post._id}`} className="postTitleLink">
            <h2 className="postTitle">{post.title}</h2>
          </Link>
          <p className="postDesc">
            {previewText}
            <span>...</span>
          </p>
          {isContentLong && (
            <Link to={`/post/${post._id}`} className="readMoreLink">
              Read More
            </Link>
          )}
        </div>

        <div className="postMetaBottom">
          <div className="likes-comments">
            <FaHeart
              className={`commonIcon likeIcon ${userLiked ? "active" : ""}`}
              onClick={toggleLike}
              role="button"
            />
            <span>{likesCount}</span>

            <FaCommentAlt
              className={`commonIcon commentIcon ${
                userCommented ? "active" : ""
              }`}
              onClick={() =>
                onCommentClick ? onCommentClick(post._id) : handleCommentClick()
              }
              role="button"
            />
            <span>{liveCommentCount}</span>

            <FaBookmark
              className={`commonIcon saveIcon ${userSaved ? "active" : ""}`}
              onClick={toggleSave}
              role="button"
            />
            <span>{saveCount}</span>

            <FaEye className="commonIcon viewIcon active" />
            <span>{viewsCount}</span>
          </div>
        </div>
      </div>

      {isShareOpen && <ShareModal url={shareUrl} onClose={onCloseShare} />}
    </div>
  );
}

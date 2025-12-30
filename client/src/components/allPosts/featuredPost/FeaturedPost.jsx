import React from "react";
import { Link } from "react-router-dom";
import "./FeaturedPost.css";
import { PF} from "../../../config";

export default function FeaturedPost({
  post,
  layout = "row",
  showLabel = true,
}) {

  const imgSrc =
    post.photo && post.photo.trim() !== ""
      ? `/images/${post.photo}`
      : "/default-placeholder.jpg";

  // Utility: strip HTML tags
  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  // Generate content preview (max 200 chars)
  const getSummary = () => {
    const text = stripHtml(post?.desc || post?.contentHtml || "");
    return text
      ? text.length > 200
        ? text.slice(0, 200) + "..."
        : text
      : "No content available";
  };

  return (
    <div
      className={`featured-post ${layout === "column" ? "column" : "row"}`}
    >
      {/* Post image + featured label */}
      <div className="featured-image">
        <Link to={`/post/${post._id}`}>
          <img
            src={imgSrc}
            alt={post.title || "Post image"}
            loading="lazy"
            onError={(e) => (e.target.src = "/default-placeholder.jpg")}
          />
        </Link>

        {post.featured && showLabel && (
          <Link to="/featured-posts" className="featured-label-link">
            <span className="featured-label">Featured</span>
          </Link>
        )}
      </div>

      {/* Post content section */}
      <div className="featured-content">
        {/* Author section — avatar + name both link to profile */}
        <div className="post-author">
          <Link
            to={`/profile/${post.userId}`}
            className="author-avatar-link"
            aria-label={`View profile of ${post.username}`}
          >
            <img
              src={
                post.profilePic
                  ? PF + post.profilePic
                  : "/default-placeholder.jpg"
              }
              alt={post.username || "Author"}
              className="author-pic"
              onError={(e) => (e.target.src = "/default-placeholder.jpg")}
            />
          </Link>

          <div>
            <Link
              to={`/profile/${post.userId}`}
              className="author-name-link"
              aria-label={`View profile of ${post.username}`}
            >
              <span className="author-name">
                {post.username || "Unknown Author"}
              </span>
            </Link>
            <p className="post-date">
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Post title (heading) links to full post */}
        <Link
          to={`/post/${post._id}`}
          className="post-title-link"
          aria-label={`Read full post: ${post.title}`}
        >
          <h2 className="post-title">{post.title}</h2>
        </Link>

        {/* Post summary */}
        <p className="post-desc">{getSummary()}</p>

        {/* Read more link */}
        <Link
          to={`/post/${post._id}`}
          className="read-more"
          aria-label={`Read more about ${post.title}`}
        >
          Read More →
        </Link>
      </div>
    </div>
  );
}

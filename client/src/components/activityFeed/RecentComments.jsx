import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./RecentComments.css";

export default function RecentComments({ comments = [], username }) {
  const [showAll, setShowAll] = useState(false);

  // filter valid comments
  const filtered = comments.filter(
    (c) => c && c.postId && c.postId._id && c.userId
  );

  // show 3 by default, all when expanded
  const visibleComments = showAll ? filtered : filtered.slice(0, 3);

  const handleToggle = () => setShowAll((prev) => !prev);

  return (
    <div className="recent-comments">
      <h2>{username ? `${username}'s Comments` : "Recent Comments"}</h2>

      {filtered.length === 0 ? (
        <p className="no-comments">No recent comments.</p>
      ) : (
        <>
          <ul className="recent-comment-list">
            {visibleComments.map((comment) => {
              const post = comment.postId;
              const postAuthor = post?.author || post?.userId;
              const text = comment.text
                ? comment.text.replace(/<[^>]*>?/gm, "").slice(0, 100)
                : "";

              return (
                <li key={comment._id} className="recent-comment-item">
                  <strong className="comment-title">
                    <Link to={`/post/${post._id}`}>
                      {post.title || "Untitled Post"}
                    </Link>
                  </strong>

                  {postAuthor && (
                    <p className="comment-meta">
                      by{" "}
                      <Link to={`/profile/${postAuthor._id}`}>
                        @{postAuthor.username || "Unknown"}
                      </Link>
                    </p>
                  )}

                  <p className="comment-text">
                    {text}...
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>

          {/* show toggle button only if more than 3 comments */}
          {filtered.length > 3 && (
            <button className="toggle-button" onClick={handleToggle}>
              {showAll ? "Hide Comments" : "View All Comments"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

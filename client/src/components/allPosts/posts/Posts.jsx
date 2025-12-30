import Post from "../post/Post";
import "./Posts.css";
import React, { useState } from "react";
import Spinner, { SpinnerTypes } from "../../common/commonSpinner/Spinner";

export default function Posts({ posts, loading }) {
  const [sharePostId, setSharePostId] = useState(null);

  const handleOpenShare = (postId) => {
    setSharePostId(postId);
  };

  const handleCloseShare = () => {
    setSharePostId(null);
  };

  if (loading) {
    return <Spinner type={SpinnerTypes.RING} />;
  }

  if (!posts || posts.length === 0) {
    return <p>No posts available.</p>;
  }

  return (
    <div className="postsContainer">
      {posts.map((p) => (
        <Post
          key={p._id}
          post={p}
          isShareOpen={sharePostId === p._id}
          onOpenShare={() => handleOpenShare(p._id)}
          onCloseShare={handleCloseShare}
        />
      ))}
    </div>
  );
}

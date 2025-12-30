import React from "react";
import "./PostCard.css"; // Import the CSS
import Post from "../../allPosts/post/Post";

export default function PostCard({ post }) {
  return (
    <div className="post-card">
      <Post
        post={post}
        index={0}
        isHighlighted={false}
        isShareOpen={false}
        hideImageWrapper={true}
        onOpenShare={() => {}}
        onCloseShare={() => {}}
        onCommentClick={() => {}}
        compact={true}
      />
    </div>
  );
}

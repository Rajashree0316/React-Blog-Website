import React, { useState, useRef } from "react";
import "./CommentSection.css";
import ShareModal from "../../common/shareModal/ShareModal";
import Spinner, { SpinnerTypes } from "../../common/commonSpinner/Spinner";
import { Editor } from "@tinymce/tinymce-react";
import { useCommentContext } from "../../../context/CommentContext";
import { PF } from "../../../config";

// Count all nested replies recursively
const countNestedReplies = (replies) =>
  replies.reduce((acc, reply) => acc + 1 + countNestedReplies(reply.replies || []), 0);

export default function CommentSection({ postId, currentUser, onCommentAdded, onCommentDeleted }) {
  const [input, setInput] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const editorRef = useRef(null);

  const {
    comments,
    loading,
    visibleCount,
    isNewestFirst,
    setVisibleCount,
    setIsNewestFirst,
    handleSubmitComment,
    handleVote,
    handleReply,
    handleDelete,
    COMMENTS_PER_PAGE,
    totalCommentCount,
  } = useCommentContext();

  const visibleComments = comments.slice(0, visibleCount);

  const handleShare = (commentId) => {
    const url = `${window.location.origin}/post/${postId}#comment-${commentId}`;
    setShareUrl(url);
    setShareModalOpen(true);
  };

  const onSubmitComment = async (e) => {
    e.preventDefault();
    if (!currentUser?._id) return alert("Please log in to comment");

    const success = await handleSubmitComment(input);
    if (success) {
      setInput("");
      if (onCommentAdded) onCommentAdded(totalCommentCount + 1);
    }
  };

  const handleDeleteComment = async (commentId) => {
    await handleDelete(commentId);
    if (onCommentDeleted) onCommentDeleted(totalCommentCount - 1);
  };

  return (
    <div className={`commentBox ${!currentUser && comments.length === 0 ? "noBorder" : ""}`}>
      {currentUser && (
        <>
          <h2>ADD A COMMENT :</h2>
          <form className="commentInput" onSubmit={onSubmitComment}>
            <Editor
              apiKey="yc19r2zg6r8jwyd2oe6329mmu7bakft8oask65g7dvbhmcgg"
              onInit={(evt, editor) => (editorRef.current = editor)}
              initialValue=""
              init={{
                height: 200,
                menubar: false,
                plugins: ["link", "emoticons", "lists"],
                toolbar: "bold italic | bullist numlist | link emoticons",
              }}
              onEditorChange={(newValue) => setInput(newValue)}
              value={input}
              key={postId}
            />
            <button type="submit">Submit</button>
          </form>
        </>
      )}

      {comments.length > 0 && (
        <div className="commentsHeader">
          <h3>Top Comments ({totalCommentCount})</h3>
          <div className="sortArrows">
            <button
              className={`arrowBtn ${!isNewestFirst ? "active" : ""}`}
              onClick={() => setIsNewestFirst(false)}
            >
              ↑
            </button>
            <button
              className={`arrowBtn ${isNewestFirst ? "active" : ""}`}
              onClick={() => setIsNewestFirst(true)}
            >
              ↓
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <Spinner type={SpinnerTypes.PACMAN} />
      ) : (
        <ul className="commentList">
          {visibleComments.map((comment, index) => (
            <CommentItem
              key={`comment-${comment._id}`}
              comment={comment}
              onVote={handleVote}
              onShare={handleShare}
              onDelete={handleDeleteComment}
              onReply={handleReply}
              currentUser={currentUser}
              isLast={index === visibleComments.length - 1}
              onCommentAdded={onCommentAdded}
            />
          ))}
        </ul>
      )}

      {!loading && comments.length > COMMENTS_PER_PAGE && (
        <div className="loadMoreContainer">
          {visibleCount < comments.length ? (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setVisibleCount(visibleCount + COMMENTS_PER_PAGE);
              }}
              className="loadMoreLink"
            >
              Show More ↓
            </a>
          ) : (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setVisibleCount(COMMENTS_PER_PAGE);
              }}
              className="loadMoreLink"
            >
              Show Less ↑
            </a>
          )}
        </div>
      )}

      {shareModalOpen && <ShareModal url={shareUrl} onClose={() => setShareModalOpen(false)} />}
    </div>
  );
}

// ==========================
// Avatar component
// ==========================
function Avatar({ profilePic, username }) {
  if (!profilePic) return null;
  const imageUrl = profilePic.startsWith("http") ? profilePic : PF + profilePic;
  return <img src={imageUrl} alt={username} className="avatarImg" />;
}

// ==========================
// Single Comment + Recursive Replies
// ==========================
function CommentItem({ comment, onVote, onShare, onDelete, onReply, currentUser, isLast = false, onCommentAdded }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);

  const isLoggedInAuthor =
    currentUser?._id === comment.userId?._id || currentUser?._id === comment.userId;

  const handleReplySubmit = (text) => {
    onReply(comment._id, text);
    setReplyOpen(false);
    if (onCommentAdded) onCommentAdded();
  };

  return (
    <li id={`comment-${comment._id}`} className={`commentItem ${isLast ? "lastCommentItem" : ""}`}>
      <div className="avatar">
        <Avatar profilePic={comment.profilePic} username={comment.username} />
      </div>
      <div className="commentContent">
        <p className="author">{comment.username}</p>
        <div className="commentText" dangerouslySetInnerHTML={{ __html: comment.text }} />
        <div className="commentMeta">
          <span>{comment.time ? new Date(comment.time).toLocaleString() : "Just now"}</span>
        </div>
        <div className="commentActions">
          {currentUser && (
            <>
              <button onClick={() => onVote(comment._id, "like")} className="actionBtn">
                👍 {comment.likes || 0}
              </button>
              <button onClick={() => onVote(comment._id, "dislike")} className="actionBtn">
                👎 {comment.dislikes || 0}
              </button>
              <button onClick={() => setReplyOpen(!replyOpen)} className="actionBtn">
                💬 Reply
              </button>
            </>
          )}
          <button onClick={() => onShare(comment._id)} className="actionBtn">
            🔗 Share
          </button>
          {isLoggedInAuthor && (
            <button onClick={() => onDelete(comment._id)} className="actionBtn deleteBtn">
              🗑 Delete
            </button>
          )}
        </div>

        {/* Reply Form */}
        {replyOpen && <ReplyForm onSubmit={handleReplySubmit} />}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="nestedReplies">
            <button onClick={() => setShowReplies(!showReplies)} className="showRepliesBtn">
              {showReplies ? "Hide Replies" : `View Replies (${countNestedReplies(comment.replies)})`}
            </button>
            {showReplies &&
              comment.replies.map((reply) => (
                <CommentItem
                  key={`comment-${reply._id}`}
                  comment={reply}
                  onVote={onVote}
                  onShare={onShare}
                  onDelete={onDelete}
                  onReply={onReply}
                  currentUser={currentUser}
                  onCommentAdded={onCommentAdded}
                />
              ))}
          </div>
        )}
      </div>
    </li>
  );
}

// ==========================
// Reply input form
// ==========================
function ReplyForm({ onSubmit }) {
  const [text, setText] = useState("");
  const editorRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      if (content.replace(/<(.|\n)*?>/g, "").trim()) {
        onSubmit(content);
        setText("");
        editorRef.current.setContent("");
      }
    }
  };

  return (
    <form className="replyForm" onSubmit={handleSubmit}>
      <Editor
        apiKey="dnfe6xhdx2dzx3a0hkxlgmxsr3704c030h6176x2oyanhmkl"
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue=""
        init={{
          height: 150,
          menubar: false,
          plugins: ["link", "emoticons", "lists"],
          toolbar: "bold italic | bullist numlist | link emoticons",
        }}
        onEditorChange={(newValue) => setText(newValue)}
        value={text}
      />
      <button type="submit">Reply</button>
    </form>
  );
}

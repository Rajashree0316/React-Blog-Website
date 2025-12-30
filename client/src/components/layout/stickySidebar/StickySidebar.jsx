import React, { useState } from "react";
import { FaHeart, FaComment, FaBookmark, FaEllipsisH } from "react-icons/fa";
import ShareModal from "../../common/shareModal/ShareModal";
import { useCommentContext } from "../../../context/CommentContext";
import "./StickySidebar.css";

function StickySidebar({
  likeCount,
  saveCount,
  onCommentClick,
  onLikeClick,
  onSaveClick,
  userLiked,
  userSaved,
}) {
  const [isShareModalOpen, setShareModalOpen] = useState(false);

    // ✅ live comment count directly from context
  const { totalCommentCount } = useCommentContext();

  const handleOpenShareModal = () => setShareModalOpen(true);
  const handleCloseShareModal = () => setShareModalOpen(false);

  const reactions = [
    {
      icon: <FaHeart />,
      label: "Likes",
      count: likeCount,
      onClick: onLikeClick,
      style: { color: userLiked ? "red" : "#ccc" },
    },
    {
      icon: <FaComment />,
      label: "Comments",
      count: totalCommentCount, // ✅ always updates
      onClick: onCommentClick,
      style: { color: "#00a8ff" },
    },
    {
      icon: <FaBookmark />,
      label: "Bookmarks",
      count: saveCount,
      onClick: onSaveClick,
      style: { color: userSaved ? "#fbc531" : "#ccc" },
    },
    {
      icon: <FaEllipsisH />,
      label: "More",
      onClick: handleOpenShareModal,
      style: { color: "#fff" },
    },
  ];

  return (
    <>
      <div className="reaction-sidebar">
        {reactions.map((item, index) => (
          <div
            key={index}
            className="reaction-button"
            title={item.label}
            data-label={item.label}
            onClick={item.onClick}
            style={{
              ...item.style,
              cursor: item.onClick ? "pointer" : "default",
            }}
            aria-label={item.label}
          >
            {item.icon}
            {item.count !== undefined && <span>{item.count}</span>}
          </div>
        ))}
      </div>

      {isShareModalOpen && (
        <ShareModal url={window.location.href} onClose={handleCloseShareModal} />
      )}
    </>
  );
}

export default React.memo(StickySidebar);

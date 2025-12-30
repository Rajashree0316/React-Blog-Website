import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import useFollow from "../../../hooks/useFollow";
import { Context } from "../../../context/Context";

const FollowButton = ({ targetUser, onFollowChange }) => {
  const { user: currentUser, token, dispatch } = useContext(Context);
  const navigate = useNavigate();
  const { isFollowing, toggleFollow } = useFollow(targetUser, currentUser);

  const handleFollow = async () => {
    if (!currentUser) return navigate("/login");
    if (!targetUser?._id || !currentUser?._id) return;

    try {
      await toggleFollow();

      // ✅ Calculate updated followings
      const updatedFollowings = isFollowing
        ? (currentUser.followings || []).filter(id => id !== targetUser._id)
        : [...(currentUser.followings || []), targetUser._id];

      // ✅ Dispatch new followings list
      dispatch({ type: "UPDATE_FOLLOWINGS", payload: updatedFollowings });

      // ✅ Update localStorage with merged user
      const updatedUser = {
        ...currentUser,
        followings: updatedFollowings,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("token", token || "");

      // ✅ Update UI if needed
      if (onFollowChange) {
        const delta = isFollowing ? -1 : 1;
        onFollowChange(delta);
      }
    } catch (err) {
      console.error("Follow failed:", err);
      alert("An error occurred while following. Please try again.");
    }
  };

  if (!targetUser?._id) return null;

  if (!currentUser)
    return (
      <button className="follow-btn" onClick={() => navigate("/login")}>
        Login to Follow @{targetUser.username}
      </button>
    );

  if (currentUser.username === targetUser.username) return null;

  return (
    <button className="follow-btn" onClick={handleFollow}>
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;

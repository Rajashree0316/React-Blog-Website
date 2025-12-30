// hooks/useFollow.js
import { useState, useEffect } from "react";
import axios from "axios";

const useFollow = (targetUser, currentUser) => {
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!targetUser?._id || !currentUser?._id) return;

    const localFollowings = currentUser.followings || [];

    // ✅ Immediate context check
    if (localFollowings.includes(targetUser._id)) {
      setIsFollowing(true);
      return;
    }

    // ✅ Fallback to server (in case local state is outdated)
    const checkFollowStatus = async () => {
      try {
        const res = await axios.get(`/api/users/${targetUser._id}/followers`);
        const followerIds = res.data.map((u) => u._id?.toString());
        setIsFollowing(followerIds.includes(currentUser._id.toString()));
      } catch (err) {
        console.error("Error checking follow status:", err.message);
      }
    };

    checkFollowStatus();
  }, [targetUser?._id, currentUser?._id]);

  // 🔁 Toggle follow/unfollow
  const toggleFollow = async () => {
    try {
      await axios.put(`/api/users/${targetUser._id}/follow`, {
        userId: currentUser._id,
      });
      setIsFollowing((prev) => !prev);
    } catch (err) {
      console.error("Error toggling follow:", err.message);
    }
  };

  return { isFollowing, toggleFollow };
};

export default useFollow;

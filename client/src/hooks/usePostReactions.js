import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useCommentContext } from "../context/CommentContext";

const checkUserInteraction = (array, userId) =>
  userId && Array.isArray(array)
    ? array.some((id) => id.toString() === userId.toString())
    : false;

export default function usePostReactions(postId, userId) {
  const ctx = (() => {
    try {
      return useCommentContext();
    } catch {
      return null;
    }
  })();

  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [userSaved, setUserSaved] = useState(false);
  const [userCommented, setUserCommented] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Load cached state
  useEffect(() => {
    if (!postId) return;
    const stored = JSON.parse(localStorage.getItem(`postReactions_${postId}`) || "{}");
    if (stored.likesCount) setLikesCount(stored.likesCount);
    if (stored.saveCount) setSaveCount(stored.saveCount);
    if (stored.commentsCount) setCommentsCount(stored.commentsCount);
    if (stored.userLiked) setUserLiked(stored.userLiked);
    if (stored.userSaved) setUserSaved(stored.userSaved);
    if (stored.userCommented) setUserCommented(stored.userCommented);
  }, [postId]);

  // ✅ Fetch live data
  const fetchAll = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/posts/${postId}`);
      const post = res.data;

      const newData = {
        likesCount: post.likes || 0,
        commentsCount: post.comments || 0,
        saveCount: post.saveCount || 0,
        userLiked: checkUserInteraction(post.likedBy, userId),
        userSaved: checkUserInteraction(post.savedBy, userId),
        userCommented: checkUserInteraction(post.commentedBy, userId), // ✅ add this
      };

      setLikesCount(newData.likesCount);
      setCommentsCount(newData.commentsCount);
      setSaveCount(newData.saveCount);
      setUserLiked(newData.userLiked);
      setUserSaved(newData.userSaved);
      setUserCommented(newData.userCommented);

      localStorage.setItem(`postReactions_${postId}`, JSON.stringify(newData));
    } catch (err) {
      console.error("Error fetching post reactions:", err);
    } finally {
      setLoading(false);
    }
  }, [postId, userId]);

  // ✅ Sync comment count live
  useEffect(() => {
    if (ctx?.totalCommentCount) {
      setCommentsCount(ctx.totalCommentCount);
      const stored = JSON.parse(localStorage.getItem(`postReactions_${postId}`) || "{}");
      localStorage.setItem(
        `postReactions_${postId}`,
        JSON.stringify({ ...stored, commentsCount: ctx.totalCommentCount })
      );
    }
  }, [ctx?.totalCommentCount, postId]);

  // ✅ Persist to localStorage
  useEffect(() => {
    if (!postId) return;
    const data = {
      likesCount,
      commentsCount,
      saveCount,
      userLiked,
      userSaved,
      userCommented,
    };
    localStorage.setItem(`postReactions_${postId}`, JSON.stringify(data));
  }, [likesCount, commentsCount, saveCount, userLiked, userSaved, userCommented, postId]);

  return {
    likesCount,
    commentsCount,
    saveCount,
    userLiked,
    userSaved,
    userCommented,
    setLikesCount,
    setCommentsCount,
    setSaveCount,
    setUserLiked,
    setUserSaved,
    setUserCommented,
    refreshReactions: fetchAll,
    loading,
  };
}

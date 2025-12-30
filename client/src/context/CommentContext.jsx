import { createContext, useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../config";
const CommentContext = createContext(null);

export const CommentProvider = ({ postId, currentUser, children }) => {
  const COMMENTS_PER_PAGE = 5;
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PER_PAGE);
  const [isNewestFirst, setIsNewestFirst] = useState(true);

  // ==========================
  // Fetch comments from backend
  // ==========================
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/comments/${postId}`);
      const sorted = isNewestFirst ? res.data.slice().reverse() : res.data;
      setComments(sorted);
    } catch (err) {
      console.error("Failed to fetch comments", err);
      toast.error("Failed to fetch comments.");
    } finally {
      setLoading(false);
    }
  }, [postId, isNewestFirst]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // ==========================
  // Count total nested comments
  // ==========================
  const countNestedComments = (list) =>
    list.reduce((acc, c) => acc + 1 + countNestedComments(c.replies || []), 0);

  // ==========================
  // Add new top-level comment
  // ==========================
  const handleAddComment = (newComment) => setComments((prev) => [newComment, ...prev]);

  // ==========================
  // Add reply recursively
  // ==========================
  const handleAddReply = (parentId, newReply) => {
    const addReplyRecursively = (list) =>
      list.map((c) => {
        if (c._id === parentId) return { ...c, replies: [...(c.replies || []), newReply] };
        if (c.replies?.length) return { ...c, replies: addReplyRecursively(c.replies) };
        return c;
      });
    setComments((prev) => addReplyRecursively(prev));
  };

  // ==========================
  // Delete comment recursively
  // ==========================
  const handleDelete = async (commentId) => {
    if (!currentUser?._id) return toast.error("Login required to delete comment.");
    try {
      const res = await axios.delete(`${API}/comments/${commentId}`, {
        data: { userId: currentUser._id },
      });

      const deletedCount = res.data.deletedCount || 0;

      const deleteRecursive = (list) =>
        list
          .filter((c) => c._id !== commentId) // filter out top-level deleted comment
          .map((c) => ({ ...c, replies: deleteRecursive(c.replies || []) }));

      setComments((prev) => deleteRecursive(prev));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete comment.");
    }
  };

  // ==========================
  // Like / Dislike comment
  // ==========================
  const handleVote = async (commentId, type) => {
    if (!currentUser?._id) return toast.error(`Please log in to ${type} comments.`);
    try {
      const res = await axios.post(`${API}/comments/${commentId}/${type}`, { userId: currentUser._id });

      // Recursively update votes in nested comments
      const updateVotes = (list) =>
        list.map((c) => {
          if (c._id === commentId) return { ...c, likes: res.data.likes, dislikes: res.data.dislikes };
          if (c.replies?.length) return { ...c, replies: updateVotes(c.replies) };
          return c;
        });

      setComments((prev) => updateVotes(prev));
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${type} comment.`);
    }
  };

  // ==========================
  // Submit top-level comment
  // ==========================
 const handleSubmitComment = async (text) => {
  if (!currentUser?._id) return toast.error("Please log in to comment.");
  if (!text || text.replace(/<(.|\n)*?>/g, "").trim() === "") {
    toast.error("Comment cannot be empty.");
    return false;
  }

  try {
    const res = await axios.post("${API}/comments", { postId, text, userId: currentUser._id });
    handleAddComment(res.data);

    // ✅ Update localStorage for userCommented
    const stored = JSON.parse(localStorage.getItem(`postReactions_${postId}`) || "{}");
    localStorage.setItem(
      `postReactions_${postId}`,
      JSON.stringify({ ...stored, userCommented: true })
    );

    return true;
  } catch (err) {
    console.error(err);
    toast.error("Failed to post comment.");
    return false;
  }
};


  // ==========================
  // Reply to a comment
  // ==========================
 const handleReply = async (parentId, text) => {
  if (!currentUser?._id) return toast.error("Please log in to reply.");
  if (!text || text.replace(/<(.|\n)*?>/g, "").trim() === "") return toast.error("Reply cannot be empty.");

  try {
    const res = await axios.post(`${API}/comments/reply/${parentId}`, { userId: currentUser._id, text });
    handleAddReply(parentId, res.data);

    // ✅ Update localStorage for userCommented
    const stored = JSON.parse(localStorage.getItem(`postReactions_${postId}`) || "{}");
    localStorage.setItem(
      `postReactions_${postId}`,
      JSON.stringify({ ...stored, userCommented: true })
    );

  } catch (err) {
    console.error(err);
    toast.error("Failed to post reply.");
  }
};


  return (
    <CommentContext.Provider
      value={{
        comments,
        setComments,
        loading,
        visibleCount,
        setVisibleCount,
        isNewestFirst,
        setIsNewestFirst,
        COMMENTS_PER_PAGE,
        fetchComments,
        handleSubmitComment,
        handleReply,
        handleDelete,
        handleVote,
        totalCommentCount: countNestedComments(comments),
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};

export const useCommentContext = () => {
  const context = useContext(CommentContext);
  if (!context) throw new Error("useCommentContext must be used within a CommentProvider");
  return context;
};

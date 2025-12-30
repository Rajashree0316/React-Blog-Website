import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../../config";
import axios from "axios";
import Post from "../../components/allPosts/post/Post";
import SortFilterBar from "../../components/common/sortFilterBar/SortFilterBar";
import Spinner, {
  SpinnerTypes,
} from "../../components/common/commonSpinner/Spinner";
import { Context } from "../../context/Context";
import "./PostsByTag.css";

export default function PostsByTag() {
  const [posts, setPosts] = useState([]);
  const [tagInfo, setTagInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const [sortType, setSortType] = useState("Relevant");
  const [timeRange, setTimeRange] = useState("Infinity");

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const tag = params.get("tag");

  const { user } = useContext(Context);

  // ✅ Set page title
  useEffect(() => {
    document.title = `Posts about ${tag}`;
  }, [tag]);

  // ✅ Fetch posts for this tag
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [postRes, tagRes] = await Promise.all([
          axios.get(`${API}/tags/${encodeURIComponent(tag)}/posts`),
          axios.get(`${API}/tags?sort=popular`),
        ]);

        const foundTag = tagRes.data.find(
          (t) => t.name.toLowerCase() === tag.toLowerCase()
        );
        setTagInfo(foundTag || { name: tag });

        setPosts(postRes.data);

        // Check if current user follows the tag
        if (user?.followedTags && foundTag) {
          const followsById = user.followedTags.includes(foundTag._id);
          const followsByName = user.followedTags.some(
            (t) =>
              (typeof t === "string" &&
                t.toLowerCase() === foundTag.name.toLowerCase()) ||
              (typeof t === "object" &&
                t.name?.toLowerCase() === foundTag.name.toLowerCase())
          );
          setIsFollowing(followsById || followsByName);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load posts for this tag");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tag, user]);

  // ✅ Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!user) return navigate("/login");

    setFollowLoading(true);
    try {
      const endpoint = isFollowing
        ? `${API}/tags/unfollow/${tag}`
        : `${API}/tags/follow/${tag}`;

      await axios.put(endpoint, { userId: user._id });

      setIsFollowing(!isFollowing);

      // ✅ Update local user context
      const updatedUser = {
        ...user,
        followedTags: isFollowing
          ? user.followedTags.filter((t) => t !== tag)
          : [...(user.followedTags || []), tag],
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Follow/Unfollow error:", err);
      setError("Could not update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  // ✅ Filter + sort posts
  const filteredAndSortedPosts = posts
    .filter((post) => {
      if (timeRange === "Infinity") return true;
      const postDate = new Date(post.createdAt);
      const now = new Date();
      let rangeDate = new Date();

      if (timeRange === "Week") rangeDate.setDate(now.getDate() - 7);
      else if (timeRange === "Month") rangeDate.setMonth(now.getMonth() - 1);
      else if (timeRange === "Year")
        rangeDate.setFullYear(now.getFullYear() - 1);

      return postDate >= rangeDate;
    })
    .sort((a, b) => {
      if (sortType === "Latest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortType === "Top") {
        return (b.likes || 0) - (a.likes || 0);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="postsByTag-spinner">
        <Spinner type={SpinnerTypes.HASH} size={80} color="#bc1d3d" />
      </div>
    );
  }

  return (
    <div className="postsByTag-container">
      <div className="postsByTag-heading">
        <div className="postsByTag-title">
          #{tagInfo?.name || tag}
          <span className="post-count">
            ({filteredAndSortedPosts.length} posts)
          </span>
        </div>

        <button
          className={`follow-btn ${isFollowing ? "unfollow" : "follow"}`}
          onClick={handleFollowToggle}
          disabled={followLoading}
        >
          {followLoading ? "..." : isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>

      <SortFilterBar
        sortType={sortType}
        setSortType={setSortType}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
      />

      {error && <p className="error">{error}</p>}

      {!error && filteredAndSortedPosts.length === 0 && (
        <p className="no-posts">No posts found for this tag.</p>
      )}

      <div className="postsByTag-grid">
        {filteredAndSortedPosts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}

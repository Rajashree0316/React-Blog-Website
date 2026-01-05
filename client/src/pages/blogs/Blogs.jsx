import React, { useEffect, useState, useRef } from "react";
import { API } from "../../config";
import Post from "../../components/allPosts/post/Post";
import FeaturedPost from "../../components/allPosts/featuredPost/FeaturedPost";
import "./Blogs.css";
import { useLocation, Link } from "react-router-dom";
import SortFilterBar from "../../components/common/sortFilterBar/SortFilterBar";
import Pagination from "../../components/common/pagination/Pagination";
import BlogSidebar from "../../components/common/blogSidebar/BlogSidebar";
import Spinner, {
  SpinnerTypes,
} from "../../components/common/commonSpinner/Spinner";

export default function Blogs() {
  const [posts, setPosts] = useState([]);
  const [openSharePostId, setOpenSharePostId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [sortType, setSortType] = useState("Top");
  const [timeRange, setTimeRange] = useState("Month");
  const [currentPage, setCurrentPage] = useState(1);

  const postsPerPage = 9;
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tag = params.get("tag");
  const highlightId = params.get("highlight");
  const blogsListRef = useRef(null);

  const handleOpenShare = (postId) => setOpenSharePostId(postId);
  const handleCloseShare = () => setOpenSharePostId(null);

  /* Scroll to tagged section */
  useEffect(() => {
    if (tag && blogsListRef.current) {
      setTimeout(() => {
        blogsListRef.current.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
  }, [tag]);

  /* Fetch featured post */
  const fetchFeaturedPost = async () => {
    try {
      const res = await fetch(`${API}/posts/featured`);
      const data = await res.json();
      setFeaturedPost(data?.[0] || null);
      return data?.[0]?._id || null;
    } catch {
      setFeaturedPost(null);
      return null;
    }
  };

  /* Fetch posts */
  const fetchPosts = async (excludeId) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/posts?sort=${sortType}&time=${timeRange}${
          tag ? `&tag=${encodeURIComponent(tag)}` : ""
        }`
      );
      const data = await res.json();

      const filtered = excludeId
        ? data.filter((p) => p._id !== excludeId)
        : data;

      if (highlightId) {
        const highlighted = filtered.find((p) => p._id === highlightId);
        const others = filtered.filter((p) => p._id !== highlightId);
        setPosts(highlighted ? [highlighted, ...others] : filtered);
      } else {
        setPosts(filtered);
      }

      setCurrentPage(1);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  /* Sequential fetch */
  useEffect(() => {
    (async () => {
      const featuredId = await fetchFeaturedPost();
      await fetchPosts(featuredId);
    })();
  }, [location.search, sortType, timeRange, highlightId]);

  /* Pagination */
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  return (
    <div className="commonContainer">
      <div className="commonHeadings">
        <h2>Blog</h2>
        <h1>Ideas that Inspire, Stories that Matter</h1>
        <p>
          Discover fresh perspectives on technology, design, and business. Dive
          into thoughtful articles that fuel innovation and spark creativity.
        </p>
      </div>

      <div className="blogs-main-content">
        <div className="blogs-left" ref={blogsListRef}>
          {/* 🔄 Loading */}
          {loading && (
            <Spinner type={SpinnerTypes.HASH} size={90} color="#06acbf" />
          )}

          {/* 🫥 Empty State */}
          {!loading && posts.length === 0 && (
            <div className="empty-state">
              <div className="empty-illustration">
                <div className="floating-card"></div>
                <div className="floating-card small"></div>
                <div className="floating-card tiny"></div>
              </div>
              <h2>No posts yet</h2>
              <p>
                Looks quiet here 🌱  
                New stories are on the way. Try exploring categories meanwhile.
              </p>
            </div>
          )}

          {/* ⭐ Featured */}
          {!loading && featuredPost && (
            <div className="featured-post-container-wrapper">
              <Link to="/featured-posts" className="clickable-posts">
                <h2 className="featured-post-container-heading">
                  🌟 Highlighted Creations
                </h2>
              </Link>
              <FeaturedPost post={featuredPost} layout="row" />
            </div>
          )}

          {/* 📚 Posts */}
          {!loading && posts.length > 0 && (
            <div className="other-posts-container">
              <h2 className="all-posts-heading">
                🚀 Explore the Latest Insights
              </h2>

              <SortFilterBar
                sortType={sortType}
                setSortType={setSortType}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
              />

              <div className="blogs-list">
                {currentPosts.map((post, index) => (
                  <div
                    key={post._id}
                    className="blog-card-wrapper"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <Post
                      post={post}
                      isHighlighted={index === 0 && !!highlightId}
                      isShareOpen={openSharePostId === post._id}
                      onOpenShare={() => handleOpenShare(post._id)}
                      onCloseShare={handleCloseShare}
                    />
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        <BlogSidebar />
      </div>
    </div>
  );
}

import React, { useEffect, useState, useRef } from "react";
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
  const [error, setError] = useState(null);
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

  // Scroll to tag section
  useEffect(() => {
    if (tag && blogsListRef.current) {
      setTimeout(() => {
        blogsListRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 500);
    }
  }, [tag]);

  // Fetch Featured Post
  const fetchFeaturedPost = async () => {
    try {
      const res = await fetch("/api/posts/featured");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setFeaturedPost(data[0]);
          return data[0];
        } else {
          setFeaturedPost(null);
        }
      } else {
        setFeaturedPost(null);
      }
    } catch (err) {
      console.error("Failed to fetch featured post", err);
      setFeaturedPost(null);
    }
    return null;
  };

  // Fetch All Posts
  const fetchPosts = async (excludedId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/posts?sort=${sortType}&time=${timeRange}${
          tag ? `&tag=${encodeURIComponent(tag)}` : ""
        }`
      );
      if (!response.ok)
        throw new Error(`Failed to fetch posts: ${response.statusText}`);

      const data = await response.json();
      const filtered = excludedId
        ? data.filter((post) => post._id !== excludedId)
        : data;

      if (highlightId) {
        const highlightedPost = filtered.find(
          (post) => post._id === highlightId
        );
        const otherPosts = filtered.filter((post) => post._id !== highlightId);
        setPosts(highlightedPost ? [highlightedPost, ...otherPosts] : filtered);
      } else {
        setPosts(filtered);
      }

      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Sequential fetch: featured first, then posts
  useEffect(() => {
    (async () => {
      const featured = await fetchFeaturedPost();
      await fetchPosts(featured?._id);
    })();
  }, [location.search, highlightId, sortType, timeRange]);

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;

  const filterPosts = () => {
    const now = new Date();
    let filtered = [...posts];

    filtered = filtered.filter((post) => {
      const postDate = new Date(post.createdAt);
      switch (timeRange) {
        case "Week":
          return (now - postDate) / (1000 * 60 * 60 * 24) <= 7;
        case "Month":
          return (now - postDate) / (1000 * 60 * 60 * 24) <= 30;
        case "Year":
          return (now - postDate) / (1000 * 60 * 60 * 24) <= 365;
        default:
          return true;
      }
    });

    switch (sortType) {
      case "Latest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "Top":
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      default:
        break;
    }

    return filtered.slice(indexOfFirstPost, indexOfLastPost);
  };

  const currentPosts = filterPosts();
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
          {/* 🔄 Loading Spinner */}
          {loading && (
            <Spinner type={SpinnerTypes.HASH} size={100} color="#06acbfff" />
          )}

          {/* ✅ Only show heading if featured post exists */}
          <div className="featured-post-container-wrapper">
            {featuredPost && (
              <Link to="/featured-posts" className="clickable-posts">
                <h2 className="featured-post-container-heading">
                  🌟 Highlighted Creations
                </h2>
              </Link>
            )}
            {featuredPost && <FeaturedPost post={featuredPost} layout="row" />}
          </div>
        
         <div className="other-posts-container">
          <h2 className="all-posts-heading">🚀 Explore the Latest Insights</h2>
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
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <Post
                  post={post}
                  index={index}
                  isHighlighted={
                    index === 0 && !!highlightId && currentPage === 1
                  }
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
            onPageChange={paginate}
          />
        </div>
        </div>

        <BlogSidebar />
      </div>
    </div>
  );
}

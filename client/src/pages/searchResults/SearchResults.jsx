import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Post from "../../components/allPosts/post/Post";
import "./SearchResults.css";

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const query = params.get("query");
  const tag = params.get("tag");

  const [highlightedTags, setHighlightedTags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const url = tag
          ? `/api/posts?tag=${encodeURIComponent(tag)}`
          : `/api/posts/search?query=${encodeURIComponent(query)}`;

        const res = await fetch(url);
        const data = await res.json();

        const postsArray = Array.isArray(data) ? data : [];
        setPosts(postsArray);

        // Collect tags for suggestions
        const allTags = postsArray.flatMap((post) => post.tags || []);
        const uniqueTags = [...new Set(allTags)].slice(0, 8);
        setHighlightedTags(uniqueTags);
      } catch (err) {
        console.error("Search failed", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, tag]);

  const handleTagClick = (t) => {
    navigate(`/search?tag=${encodeURIComponent(t)}`);
  };

  return (
    <div className="search-results-container">
      <h2 className="search-heading">
        Search Results for{" "}
        <span className="highlight">
          "{query ? query : tag ? `#${tag}` : "your search"}"
        </span>
      </h2>

      <div className="highlighted-tags">
        {highlightedTags.map((t) => (
          <button key={t} className="highlight clickable" onClick={() => handleTagClick(t)}>
            #{t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="no-results">No posts found.</p>
      ) : (
        <div className="post-flex-container">
          {posts.map((post) => (
            <div className="post-wrapper" key={post._id}>
              <Post post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

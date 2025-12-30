import React, { useEffect, useState } from "react";
import "./PopularTags.css";
import { Link } from "react-router-dom";

const PopularTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        const data = await response.json();
        setTags(data);
      } catch (err) {
        setError("Failed to load tags");
        console.error("Error fetching tags:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const displayedTags = showAll ? tags : tags.slice(0, 8);

  return (
    <div className="sideContainer">
      <h3 className="sideContainer-headings">
        Popular Tags
        </h3>
      <hr className="divider" />

      {loading ? (
        <p className="loading">Loading...</p>
      ) : error ? (
        <p className="loading">{error}</p>
      ) : (
        <>
          <div className="tags-wrapper">
            {displayedTags.map((tag, index) => (
              <Link
                key={index}
                to={`/posts?tag=${encodeURIComponent(tag.name)}&type=tag`}
                className="tag-badge"
              >
                {tag.name} ({tag.count || 0})
              </Link>
            ))}
          </div>
          {tags.length > 8 && (
            <p className="view-toggle" onClick={() => setShowAll(!showAll)}>
              {showAll ? "View Less" : "View More"}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default PopularTags;

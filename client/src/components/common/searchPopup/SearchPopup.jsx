import React, { useState, useEffect } from "react";
import { API } from "../../../config";
import "./SearchPopup.css";
import { useNavigate } from "react-router-dom";

const SearchPopup = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch(`${API}/tags`);
        const data = await res.json();
        console.log("Fetched tags:", data);

        setTags(data);
      } catch (err) {
        console.error("Failed to fetch tags", err);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      onClose();
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/search?tag=${encodeURIComponent(tag)}`);
    onClose();
  };

  return (
    <div className="search-popup">
      <div className="search-popup-content">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2>What are You Looking For?</h2>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <div className="tags-container">
          {loadingTags ? (
            <p>Loading tags...</p>
          ) : tags.length > 0 ? (
            tags
              .sort((a, b) => a.name.localeCompare(b.name))
              .slice(0, 10)
              .map((tag) => (
                <button
                  key={tag._id || tag.name}
                  className="tag"
                  onClick={() => handleTagClick(tag.name)}
                >
                  {tag.name}
                </button>
              ))
          ) : (
            <p>No tags available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;

import React, { useEffect, useState } from "react";
import { API } from "../../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCompass, FaBookOpen, FaCode, FaHeart } from "react-icons/fa";
import "./ExploreCategories.css";

export default function ExploreCategories() {
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();

  const icons = [FaCompass, FaBookOpen, FaCode, FaHeart];

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axios.get(`${API}/tags`);
        setTags(res.data || []);
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };
    fetchTags();
  }, []);

  const handleExploreClick = (tagName) => {
    navigate(`/posts?tag=${encodeURIComponent(tagName)}&type=category`);
  };

  const handleExploreAll = () => {
    navigate("/blogs");
  };

  return (
    <div className="exploreContainer">
      <div className="commonHeadings">
        <h2>Explore Categories</h2>
        <p>Discover amazing topics and dive into creative ideas</p>
      </div>

      <div className="exploreGrid">
        {tags.slice(0, 8).map((tag, index) => {
          const Icon = icons[index % icons.length];
          return (
            <div key={index} className="exploreCard">
              <div className="iconWrapper">
                <Icon className="categoryIcon" />
              </div>
              <h3 className="cardTitle">{tag.name}</h3>
              <p className="cardDesc">{tag.description}</p>
              <p className="postCount">
                {tag.count} post{tag.count !== 1 ? "s" : ""}
              </p>
              <button
                className="exploreButton"
                onClick={() => handleExploreClick(tag.name)}
              >
                Explore →
              </button>
            </div>
          );
        })}
      </div>

      {tags.length > 8 && (
        <div className="exploreAllWrapper">
          <button className="exploreAllButton" onClick={handleExploreAll}>
            Explore All Categories
          </button>
        </div>
      )}
    </div>
  );
}

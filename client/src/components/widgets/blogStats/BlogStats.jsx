// components/QuickStats.jsx
import React, { useEffect, useState } from "react";
import "./BlogStats.css";

export default function BlogStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="sideContainer">
      <h3 className="sideContainer-headings">Blog Stats</h3>
      <hr className="divider" />

      {stats ? (
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-number">{stats.posts}</p>
            <p className="stat-label">Posts</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{stats.views}</p>
            <p className="stat-label">Views</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{stats.comments}</p>
            <p className="stat-label">Comments</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{stats.subscribers}</p>
            <p className="stat-label">Subscribers</p>
          </div>
        </div>
      ) : (
        <p>Loading stats...</p>
      )}
    </div>
  );
}

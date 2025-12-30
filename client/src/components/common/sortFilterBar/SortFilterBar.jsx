import React from "react";
import "./SortFilterBar.css"; 

export default function SortFilterBar({ sortType, setSortType, timeRange, setTimeRange }) {
  return (
    <div className="sort-filter-bar">
      <div className="sort-options">
        {["Relevant", "Latest", "Top"].map((type) => (
          <span
            key={type}
            className={`sort-option ${sortType === type ? "active" : ""}`}
            onClick={() => setSortType(type)}
          >
            {type}
          </span>
        ))}
      </div>
      <div className="time-options">
        {["Week", "Month", "Year", "Infinity"].map((range) => (
          <span
            key={range}
            className={`time-option ${timeRange === range ? "active" : ""}`}
            onClick={() => setTimeRange(range)}
          >
            {range}
          </span>
        ))}
      </div>
    </div>
  );
}

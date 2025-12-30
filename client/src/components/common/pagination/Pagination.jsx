import React from "react";
import "./Pagination.css"; 

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        Prev
      </button>

      {[...Array(totalPages)].map((_, idx) => (
        <button
          key={idx + 1}
          onClick={() => onPageChange(idx + 1)}
          className={`pagination-btn ${currentPage === idx + 1 ? "active" : ""}`}
        >
          {idx + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        Next
      </button>
    </div>
  );
}

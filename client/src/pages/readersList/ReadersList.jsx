import React, { useEffect, useState } from "react";
import { API, PF } from "../../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner, {
  SpinnerTypes,
} from "../../components/common/commonSpinner/Spinner";
import "./ReadersList.css";

const ReadersList = () => {
  const [readers, setReaders] = useState([]);
  const [filteredReaders, setFilteredReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const username = "rajashreeasok16";
  const navigate = useNavigate();
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchReaders = async () => {
      try {
        const res = await axios.get(`${API}/users/readers/${username}`);
        const arr = Array.isArray(res.data) ? res.data : [];
        setReaders(arr);
        setFilteredReaders(arr);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReaders();
  }, []);

  // 🔍 Search
  useEffect(() => {
    const result = readers.filter((r) =>
      r.username.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredReaders(result);
    setPage(1);
  }, [search, readers]);

  // 🔽 Sorting
  useEffect(() => {
    let sorted = [...filteredReaders];
    if (sort === "newest")
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "alphabetical")
      sorted.sort((a, b) => a.username.localeCompare(b.username));
    if (sort === "posts")
      sorted.sort((a, b) => (b.postCount || 0) - (a.postCount || 0));
    setFilteredReaders(sorted);
  }, [sort]);

  // 🔁 Pagination compute
  const paginated = filteredReaders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const totalPages = Math.ceil(filteredReaders.length / itemsPerPage);

  if (loading)
    return (
      <div className="loading-container">
        <Spinner type={SpinnerTypes.PACMAN} size={90} color="#ffffff" />
      </div>
    );

  return (
    <div className="readers-wrapper">
      {/* ===== HEADING ===== */}
      <div className="commonHeadings">
        <h2>Readers Community 👥</h2>
        <p>{readers.length} readers are part of our blog community 🤝</p>
      </div>

      {/* ===== SEARCH + SORT ===== */}
      <div className="reader-controls">
        <input
          type="text"
          placeholder="Search username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="alphabetical">A–Z</option>
          <option value="posts">Most Posts</option>
        </select>
      </div>

      {/* ===== GRID CARDS ===== */}
      <div
        className={`readers-grid ${
          paginated.length === 1 ? "single-reader" : ""
        }`}
      >
        {paginated.length > 0 ? (
          paginated.map((reader) => {
            const joinDate = reader.createdAt
              ? new Date(reader.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Unknown";

            return (
              <div key={reader._id} className="reader-card">
                <img
                  src={
                    reader.profilePic
                      ? reader.profilePic.startsWith("http")
                        ? reader.profilePic
                        : PF + reader.profilePic
                      : PF + "default-placeholder.jpg"
                  }
                  alt={reader.username}
                  onClick={() => navigate(`/profile/${reader._id}`)}
                />
                <h4 onClick={() => navigate(`/profile/${reader._id}`)}>
                  @{reader.username}
                </h4>
                {reader.postCount !== undefined && (
                  <p className="count">{reader.postCount} posts ✨</p>
                )}
                <p className="join">Joined: {joinDate}</p>
              </div>
            );
          })
        ) : (
          <p className="no-readers">
            No readers yet — the journey is just starting 💫
          </p>
        )}
      </div>

      {/* ===== PAGINATION ===== */}
      {totalPages > 1 && (
        <div className="pagination">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={page === i + 1 ? "active" : ""}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReadersList;

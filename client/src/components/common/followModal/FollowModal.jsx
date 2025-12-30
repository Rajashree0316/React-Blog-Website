import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./FollowModal.css";

const FollowModal = ({ show, onClose, userId, type }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const IMAGE_BASE =
    import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000/images";

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [show]);

  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!show || !userId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoint =
          type === "followers"
            ? `/api/users/${userId}/followers`
            : `/api/users/${userId}/followings`;
        const res = await axios.get(endpoint);
        setUsers(res.data || []);
      } catch (err) {
        console.error(`Error fetching ${type}:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [show, userId, type]);

  if (!show) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {type === "followers" ? "Followers" : "Following"}
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <ul className="follow-list">
          {loading ? (
            <li className="loading">Loading...</li>
          ) : users.length === 0 ? (
            <li className="no-users">No {type} found.</li>
          ) : (
            users.map((user) => (
              <li key={user._id} className="user-item">
                <img
                  src={
                    user.profilePic?.startsWith("http")
                      ? user.profilePic
                      : user.profilePic
                      ? `${IMAGE_BASE}/${user.profilePic}`
                      : "/default-placeholder.jpg"
                  }
                  alt="avatar"
                  className="avatar"
                />
                <div
                  className="user-info"
                  onClick={() => {
                    navigate(`/profile/${user.username}`);
                    onClose();
                  }}
                >
                  <span className="username clickable">@{user.username}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default FollowModal;

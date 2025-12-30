import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AuthorProfileCard.css";
import { useNavigate } from "react-router-dom";
import Spinner, { SpinnerTypes } from "../common/commonSpinner/Spinner";
const AuthorProfileCard = () => {
  const [author, setAuthor] = useState(null);
  const [blogCount, setBlogCount] = useState(0);
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const username = "rajashreeasok16";

  // 1.Fetch author + blogs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authorRes, postsRes] = await Promise.all([
          axios.get(`/api/users/username/${username}`),
          axios.get(`/api/posts?user=${username}`),
        ]);
        setAuthor(authorRes.data);
        setBlogCount(postsRes.data.length);
      } catch (err) {
        console.error("Error loading author or posts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  //2. Fetch readers (excluding author)
  useEffect(() => {
    const fetchReaders = async () => {
      try {
        const res = await axios.get(`/api/users/readers/${username}`);
        if (Array.isArray(res.data)) {
          setReaders(res.data);
        } else {
          setReaders([]);
        }
      } catch (err) {
        console.error("Failed to fetch readers", err);
        setReaders([]);
      }
    };

    fetchReaders();
  }, []);

  // 🔄 Show Spinner while loading
  if (loading) {
    return <Spinner type={SpinnerTypes.PACMAN} size={90} color="#bc1d3d" />;
  }

  if (!author) return <div>Error loading author info</div>;

  return (
    <div className="blogSpace-profile-card">
      <img
        src={
          author.profilePic?.startsWith("http")
            ? author.profilePic
            : `/images/${author.profilePic}`
        }
        alt={author.username}
        onError={(e) => {
          e.target.src = "https://randomuser.me/api/portraits/women/44.jpg";
        }}
      />

      <h4>{author.fullName || author.username}</h4>
      {author.title && <p className="blogSpace-title">{author.title}</p>}

      <p>
        {author.bio ||
          "With 2 years of experience in web development, I created this blog to help others by gathering and sharing valuable information in one place — a platform where everything you need is just a search away."}
      </p>

      <div className="blogSpaceStats">
        <span className="clickable" onClick={() => navigate("/personal-blogs")}>
          {blogCount}+ Blogs Posted
        </span>
        <span className="clickable" onClick={() => navigate("/readers")}>
          {readers.length}+ Readers
        </span>
      </div>
    </div>
  );
};

export default AuthorProfileCard;

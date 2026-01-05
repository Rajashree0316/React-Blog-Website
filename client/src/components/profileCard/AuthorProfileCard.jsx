import React, { useEffect, useState } from "react";
import axios from "axios";
import { API, PF } from "../../config";
import "./AuthorProfileCard.css";
import { useNavigate } from "react-router-dom";
import Spinner, { SpinnerTypes } from "../common/commonSpinner/Spinner";

const STATIC_AUTHOR = {
  username: "rajashreeasok16",
  fullName: "Rajashree Asokkumar",
  title: "Frontend Developer",
  bio: "With 2 years of experience in web development, I created this blog to help others by gathering and sharing valuable information in one place — a platform where everything you need is just a search away.",
  profilePic: "/rajashreeasok.jpg",
};

const AuthorProfileCard = () => {
  const [blogCount, setBlogCount] = useState(0);
  const [readersCount, setReadersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const username = STATIC_AUTHOR.username;

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [postsRes, readersRes] = await Promise.all([
          axios.get(`${API}/posts?user=${username}`),
          axios.get(`${API}/users/readers/${username}`),
        ]);

        setBlogCount(postsRes.data.length);
        setReadersCount(Array.isArray(readersRes.data) ? readersRes.data.length : 0);
      } catch (err) {
        console.error("Error loading counts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  if (loading) {
    return <Spinner type={SpinnerTypes.PACMAN} size={90} color="#bc1d3d" />;
  }

  return (
    <div className="blogSpace-profile-card">
      <img
        src={STATIC_AUTHOR.profilePic}
        alt={STATIC_AUTHOR.username}
        onError={(e) => {
          e.target.src = "/default-placeholder.jpg";
        }}
      />

      <h4>{STATIC_AUTHOR.fullName}</h4>
      <p className="blogSpace-title">{STATIC_AUTHOR.title}</p>

      <p>{STATIC_AUTHOR.bio}</p>

      <div className="blogSpaceStats">
        <span className="clickable" onClick={() => navigate("/personal-blogs")}>
          {blogCount}+ Blogs Posted
        </span>

        <span className="clickable" onClick={() => navigate("/readers")}>
          {readersCount}+ Readers
        </span>
      </div>
    </div>
  );
};

export default AuthorProfileCard;

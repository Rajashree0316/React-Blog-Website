// components/FeaturedUserCard/FeaturedUserCard.jsx
import "./FeaturedUserCard.css";
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Context } from "../../../context/Context";
import { Link } from "react-router-dom";
import FollowButton from "../../common/followButton/FollowButton";

const FeaturedUserCard = ({ username }) => {
  const [user, setUser] = useState(null);
  const { user: currentUser } = useContext(Context);
  const PF = import.meta.env.VITE_IMAGE_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const basicRes = await axios.get(`/api/users?username=${username}`);
        const userId = basicRes.data._id;
        const fullRes = await axios.get(`/api/users/${userId}`);
        setUser(fullRes.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    if (username) {
      fetchUser();
    }
  }, [username]);

  const handleFollowChange = (delta) => {
    setUser((prev) => ({
      ...prev,
      followersCount: (prev.followersCount || 0) + delta,
    }));
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <div className="featured-user-card" key={user._id}>
      <div className="featured-header-banner"></div>
      <div className="featured-header-bannerCard">
        <div className="featured-header">
          <img
            src={
              user.profilePic
                ? PF + user.profilePic
                : "/default-placeholder.jpg"
            }
            alt="Profile"
            className="featured-header-profile"
          />
          <div className="profile-header-text">
            <Link to={`/profile/${user._id}`} className="featured-profile-name">
              {user.firstName} {user.lastName}
            </Link>
          </div>
        </div>

        <FollowButton targetUser={user} onFollowChange={handleFollowChange} />

        {user.bio && <p className="featured-profile-bio">{user.bio}</p>}

        <div className="featured-info">
          {user.location && (
            <div className="featured-info-personal">
              <h6>Location</h6>
              <p>{user.location}</p>
            </div>
          )}
          {user.education && (
            <div className="featured-info-personal">
              <h6>Education</h6>
              <p>{user.education}</p>
            </div>
          )}
          {user.pronouns && (
            <div className="featured-info-personal">
              <h6>Pronouns</h6>
              <p>{user.pronouns}</p>
            </div>
          )}
          {user.work && (
            <div className="featured-info-personal">
              <h6>Work</h6>
              <p>{user.work}</p>
            </div>
          )}
          <div className="featured-info-personal">
            <h6>Joined</h6>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedUserCard;

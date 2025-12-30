import React from "react";
import FollowButton from "../followButton/FollowButton";
import "./PrivateProfileView.css";

const PrivateProfileView = ({ user, PF }) => {
  return (
    <div className="privateprofile-container">
      <div className="privateprofile-card">
        <div className="privateprofile-avatar-wrapper">
          <img
            src={user.profilePic ? PF + user.profilePic : "/default-placeholder.jpg"}
            alt="Profile"
            className="privateprofile-avatar"
          />
        </div>
        <div className="privateprofile-info">
          <h1 className="privateprofile-name">
            {user.firstName} {user.lastName}
          </h1>
          {user.bio && <p className="privateprofile-bio">{user.bio}</p>}
          <span className="privateprofile-badge">🔒 Private Profile</span>
          <p className="privateprofile-message">
            This account is private. Only basic information is visible.
          </p>
        </div>
        <FollowButton targetUser={user} />
      </div>
    </div>
  );
};

export default PrivateProfileView;

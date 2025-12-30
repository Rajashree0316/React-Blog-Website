import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SettingsTabs from "../../components/SettingsTabs/SettingsTabs";
import Profile from "../../components/settingsContent/Profile";
import Account from "../../components/settingsContent/Account";
import Security from "../../components/settingsContent/Security";
import Preferences from "../../components/settingsContent/Preferences";
import "./Settings.css";

export default function Settings() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const username = user?.username || "Guest";
  const userId = user?._id;

  const profilePicSrc = user?.profilePic
    ? `http://localhost:5000/images/${user.profilePic}`
    : "/default-placeholder.jpg"; // default fallback

  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = "/default-placeholder.jpg";
  };

  return (
    <div className="commonContainer">
      <div className="commonHeadings">
        <h2>Account Settings</h2>
        <p>Manage your account preferences and security settings</p>
      </div>

      <div className="profileCard">
        <img
          src={profilePicSrc}
          alt="Profile"
          className="profileCardImg"
          onError={handleImgError}
        />
        <div className="profileCardInfo">
          <Link
            to={userId ? `/profile/${userId}` : "#"}
            className="usernameCardLink"
          >
            @{username}
          </Link>
          <Link
            to={userId ? `/profile/${userId}` : "#"}
            className="profileViewLink"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Public Profile <span className="arrowIcon">↗</span>
          </Link>
        </div>
      </div>

      <div className="settingsContainer">
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="contentArea">
          {activeTab === "profile" && <Profile />}
          {activeTab === "account" && <Account />}
          {activeTab === "security" && <Security />}
          {activeTab === "preferences" && <Preferences />}
        </div>
      </div>
    </div>
  );
}

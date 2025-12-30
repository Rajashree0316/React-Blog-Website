import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./Preferences.css";
import { Context } from "../../context/Context";

export default function Preferences() {
  const { user } = useContext(Context);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("notifications");

  const LOCAL_STORAGE_KEY = `preferences_${user?._id}`;

  const defaultPreferences = {
    newLikes: true,
    newComments: true,
    newFollowers: true,
    publicProfile: true,
    showEmail: false,
  };

  useEffect(() => {
    if (!user?._id) return;

    const fetchPreferences = async () => {
      try {
        const res = await axios.get(`/api/preferences/${user._id}`);
        setPreferences(res.data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res.data));
      } catch {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        setPreferences(local ? JSON.parse(local) : defaultPreferences);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const handleToggle = (key) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleSave = () => {
    axios
      .put(`/api/preferences/${user._id}`, preferences)
      .then(() => alert("Preferences saved!"))
      .catch(() => alert("Error saving preferences"));
  };

  const handleReset = () => {
    setPreferences(defaultPreferences);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultPreferences));
  };

  if (loading || !preferences) return <p>Loading preferences...</p>;

  return (
    <div className="commonForm">
      <h2 className="commonFormTitle">Notification Preferences</h2>

      <div className="tabs">
        <button
          className={`tabButton active`}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>
        <button
          className={`tabButton ${
            activeTab === "privacy" ? "active" : ""
          }`}
          onClick={() => setActiveTab("privacy")}
        >
          Privacy
        </button>
      </div>

      <div className="section">
        {activeTab === "notifications" && (
          <>
            <PreferenceItem
              label="Likes"
              description="Get notified when someone likes your post"
              value={preferences.newLikes}
              onToggle={() => handleToggle("newLikes")}
            />

            <PreferenceItem
              label="Comments"
              description="Get notified when someone comments on your post"
              value={preferences.newComments}
              onToggle={() => handleToggle("newComments")}
            />

            <PreferenceItem
              label="Followers"
              description="Get notified when someone follows you"
              value={preferences.newFollowers}
              onToggle={() => handleToggle("newFollowers")}
            />
          </>
        )}

        {activeTab === "privacy" && (
          <>
            <PreferenceItem
              label="Public Profile"
              description="Make your profile visible to others"
              value={preferences.publicProfile}
              onToggle={() => handleToggle("publicProfile")}
            />

            <PreferenceItem
              label="Show Email"
              description="Display your email on your public profile"
              value={preferences.showEmail}
              onToggle={() => handleToggle("showEmail")}
            />
          </>
        )}
      </div>

      <div className="commonButtonGroup">
        <button className="commonBtn saveBtn" onClick={handleSave}>
          Save
        </button>
        <button
          className="commonBtn cancelBtn"
          onClick={() => window.location.reload()}
        >
          Cancel
        </button>
        <button className="commonBtn resetBtn" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
}

function PreferenceItem({ label, description, value, onToggle }) {
  return (
    <div className="preferenceItem">
      <div className="preferenceInfo">
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <label className="switch">
        <input type="checkbox" checked={value} onChange={onToggle} />
        <span className="slider"></span>
      </label>
    </div>
  );
}

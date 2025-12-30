// components/SettingsTabs/SettingsTabs.jsx
import React from "react";
import "./SettingsTabs.css";

export default function SettingsTabs({ activeTab, onTabChange }) {
  const tabs = [
    { key: "profile", label: "👤 Profile" },
    { key: "account", label: "🔒 Account" },
    { key: "security", label: "🛡️ Security" },
    { key: "preferences", label: "⚙️ Preferences" },
  ];

  return (
    <nav className="tabMenu">
      <div className="tabLinksDesktop">
        {tabs.map((t) => (
          <div
            key={t.key}
            className={`tabLink ${activeTab === t.key ? "active" : ""}`}
            onClick={() => onTabChange(t.key)}
          >
            {t.label}
          </div>
        ))}
      </div>
      <div className="tabDropdownMobile">
        <select value={activeTab} onChange={(e) => onTabChange(e.target.value)}>
          {tabs.map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
      </div>
    </nav>
  );
}

import React, { useState, useEffect, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Context } from "../../../context/Context";
import "./TopBar.css";
import SearchPopup from "../../common/searchPopup/SearchPopup";

import {
  FaSearch,
  FaHome,
  FaUser,
  FaPlus,
  FaBlog,
  FaEnvelope,
  FaSignOutAlt,
  FaCog,
  FaUserPlus,
  FaSignInAlt,
} from "react-icons/fa";

const TopBar = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useContext(Context);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    if (onLogout) onLogout();
    closeMenu();
    navigate("/login");
  };

  const navItems = user
    ? [
        { name: "Home", path: "/", icon: <FaHome /> },
        { name: "About", path: "/about", icon: <FaUser /> },
        { name: "New Post", path: "/write", icon: <FaPlus /> },
        { name: "Blogs", path: "/blogs", icon: <FaBlog /> },
        { name: "Contact", path: "/contact", icon: <FaEnvelope /> },
        {
          name: "Logout",
          path: "/logout",
          icon: <FaSignOutAlt />,
          onClick: handleLogout,
        },
      ]
    : [
        { name: "Home", path: "/", icon: <FaHome /> },
        { name: "About", path: "/about", icon: <FaUser /> },
        { name: "Blogs", path: "/blogs", icon: <FaBlog /> },
        { name: "Contact", path: "/contact", icon: <FaEnvelope /> },
        { name: "Register", path: "/register", icon: <FaUserPlus /> },
        { name: "Login", path: "/login", icon: <FaSignInAlt /> },
      ];

  return (
    <header className="topbar">
      <div className="topbar__container">
        <Link to="/" className="topbar__logo" onClick={closeMenu}>
          BlogSpace
        </Link>

        <nav className={`topbar__nav ${menuOpen ? "active" : ""}`}>
          <ul className="topbar__list">
            {navItems.map((item) => (
              <li className="topbar__item" key={item.name}>
                {item.name === "Logout" ? (
                  <button className="logout-button" onClick={handleLogout}>
                    <span className="mobile-icon">{item.icon}</span>
                    <span className="menu-label">{item.name}</span>
                  </button>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      isActive ? "active-link" : undefined
                    }
                    onClick={closeMenu}
                  >
                    <span className="mobile-icon">{item.icon}</span>
                    <span className="menu-label">{item.name}</span>{" "}
                  </NavLink>
                )}
              </li>
            ))}
            {user && (
              <li className="topbar__item settings-link-mobile">
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    isActive ? "active-link" : undefined
                  }
                  onClick={closeMenu}
                >
                  <span className="mobile-icon">
                    <FaCog />
                  </span>
                  <span className="menu-label">Settings</span>{" "}
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="topbar__actions">
          {user && (
            <Link
              to="/settings"
              className="topbar__profile desktop-only"
              onClick={closeMenu}
            >
              <img
                src={
                  user.profilePic
                    ? "http://localhost:5000/images/" + user.profilePic
                    : "/default-placeholder.jpg"
                }
                alt="Profile"
                className="topbar__profile-img"
              />
            </Link>
          )}

          <button
            className="search-icon"
            onClick={() => setShowSearch(true)}
            title="Search"
          >
            <FaSearch className="search-fa-icon" />
          </button>

          <div
            className="topbar__hamburger"
            onClick={toggleMenu}
            role="button"
            tabIndex={0}
            aria-label="Toggle navigation"
            onKeyDown={(e) => e.key === "Enter" && toggleMenu()}
          >
            <div className={`bar ${menuOpen ? "change bar1" : "bar1"}`}></div>
            <div className={`bar ${menuOpen ? "change bar2" : "bar2"}`}></div>
            <div className={`bar ${menuOpen ? "change bar3" : "bar3"}`}></div>
          </div>
        </div>
        {showSearch && <SearchPopup onClose={() => setShowSearch(false)} />}
      </div>
    </header>
  );
};

export default TopBar;

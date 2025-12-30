import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Context } from "../../../context/Context";
import "./Sidebar.css";
import { API, PF } from "../../../config";

export default function Sidebar() {
  const [cats, setCats] = useState([]);
  const { user } = useContext(Context);

  useEffect(() => {
    const getCats = async () => {
      try {
        const res = await axios.get(`${API}/tags`);
        if (Array.isArray(res.data)) {
          setCats(res.data);
        } else {
          console.warn("Unexpected categories response:", res.data);
          setCats([]); // fallback
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    getCats();
  }, []);

  return (
    <div className="sidebar" id="about">
      <div className="sidebarItem">
        <span className="sidebarTitle">ABOUT ME</span>
        <img
          src={
            user?.profilePic?.startsWith("http")
              ? user.profilePic
              : user?.profilePic
              ? `${PF}/${user.profilePic}`
              : "https://i.pinimg.com/236x/1e/3f/58/1e3f587572a7a7b20bbf1828595a1786--holiday-party-themes-holiday-gift-guide.jpg"
          }
          alt="User Profile"
        />
        <p>
          Welcome to our blog! Here, we share our thoughts, experiences, and
          insights on various topics.
        </p>
        <p>
          Our mission is to provide valuable and engaging content to our
          readers.
        </p>
      </div>
      <div className="sidebarItem">
        <span className="sidebarTitle">TAGS</span>
        <ul className="sidebarList">
          {cats.map((c, index) => (
            <Link key={c._id || index} to={`/?cat=${c.name}`} className="link">
              <li className="sidebarListItem">{c.name}</li>
            </Link>
          ))}
        </ul>
      </div>
      <div className="sidebarItem">
        <span className="sidebarTitle">FOLLOW US</span>
        <div className="sidebarSocial">
          <i className="sidebarIcon fab fa-facebook-square"></i>
          <i className="sidebarIcon fab fa-twitter-square"></i>
          <i className="sidebarIcon fab fa-pinterest-square"></i>
          <i className="sidebarIcon fab fa-instagram-square"></i>
        </div>
      </div>
    </div>
  );
}

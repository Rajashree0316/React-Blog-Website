import React from "react";
import "./Footer.css";
import SocialMediaFloat from "../../socialmedia/SocialMediaFloat";
import FooterContent from "../footerContent/FooterContent";

export default function Footer() {
  return (
    <footer>
      <div className="footer">
        <FooterContent />
        <div className="footer-subContainer">
          <SocialMediaFloat isFloating={false} />
        <p>&copy; Copyright 2025 Blogs - All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

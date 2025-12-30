import React from "react";
import { FaTimes, FaLink } from "react-icons/fa";
import SocialMediaFloat from "../../socialmedia/SocialMediaFloat";
import "./ShareModal.css";

export default function ShareModal({ url, onClose }) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="shareModalOverlay" role="dialog" aria-modal="true">
      <div className="shareModal">
        <FaTimes className="closeModal" onClick={onClose} />
        <p>Share this Post:</p>
        <div className="socialIcons">
          <div className="socialAndLink">
            <SocialMediaFloat isFloating={false} />
            <button
              onClick={handleCopyLink}
              className="copyLinkButton"
              title="Copy link"
            >
              <FaLink />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

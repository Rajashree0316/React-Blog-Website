import "./SocialMediaFloat.css";
import {
  FaFacebook,
  FaPinterest ,
  FaInstagramSquare,
  FaWhatsapp,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";

export default function SocialMediaFloat() {
  const containerClass = "socialMediaInline";

  return (
    <div className={containerClass}>
      <a
        href="https://facebook.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
      >
        <FaFacebook />
      </a>
      <a
        href="https://twitter.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Twitter"
      >
        <FaXTwitter />
      </a>

      <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <FaInstagramSquare />
      </a>
      <a
        href="https://wa.me/your-number"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <FaWhatsapp/>
      </a>
      <a
        href="https://pinterest.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Pinterest"
      >
        <FaPinterest  />
      </a>
    </div>
  );
}

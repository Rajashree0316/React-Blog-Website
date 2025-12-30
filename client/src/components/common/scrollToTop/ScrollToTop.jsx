import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PiArrowFatLinesUpFill } from "react-icons/pi";
import "./ScrollToTop.css";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Auto scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);

  // Show button when user scrolls down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTopManually = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {isVisible && (
        <div
          className="scroll-to-top"
          onClick={scrollToTopManually}
          title="Back to Top"
        >
          <PiArrowFatLinesUpFill size={20} />
          <span className="scroll-tooltip">Back to Top</span>
        </div>
      )}
    </>
  );
};

export default ScrollToTop;

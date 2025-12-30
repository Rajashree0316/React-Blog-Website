import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ScrollToTop from "./components/common/scrollToTop/ScrollToTop";
import TopBar from "./components/layout/topbar/TopBar";
import Footer from "./components/layout/footer/Footer";
import CommentSection from "./components/allPosts/commentSection/CommentSection";
import IntroSection from "./components/intro/IntroSection";
import PostsByTag from "./pages/postsByTag/PostsByTag";
import Home from "./pages/home/Home";
import Blogs from "./pages/blogs/Blogs";
import SingleWrapper from "./pages/single/SingleWrapper";
import Write from "./pages/write/Write";
import Settings from "./pages/settings/Settings";
import Contact from "./pages/contact/Contact";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import SearchResults from "./pages/searchResults/SearchResults";
import PublicProfile from "./pages/profile/PublicProfile";
import FeaturedPostsPage from "./pages/featuredPostsPage/FeaturedPostsPage";
import PersonalBlogs from "./pages/personalBlogs/PersonalBlogs";
import ReadersList from "./pages/readersList/ReadersList";

<Route path="/post/:postId" element={<SingleWrapper />} />

import { Context } from "./context/Context";

function App() {
  const { user, dispatch } = useContext(Context);

  // ✅ Log environment variables to check production vs development
  console.log("API URL:", import.meta.env.VITE_API_URL);
  console.log("Image URL:", import.meta.env.VITE_IMAGE_URL);
  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
  };
  

  return (
    <div className="appLayout">
      {/* Rotating Bubbles */}
<div className="bubbles">
  {Array.from({ length: 10 }).map((_, i) => (
    <div key={i} className="bubble"></div>
  ))}
</div>

{/* Twinkling Stars */}
<div className="stars">
  {Array.from({ length: 60 }).map((_, i) => (
    <div
      key={i}
      className="star"
      style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
      }}
    ></div>
  ))}
</div>

      <ScrollToTop />
      <TopBar user={user} onLogout={handleLogout} />
      <div className="mainContent">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<IntroSection />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/posts" element={<PostsByTag />} />
          <Route path="/post/:postId" element={<SingleWrapper />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/post/:id/comments" element={<CommentSection />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="/featured-posts" element={<FeaturedPostsPage />} />
          <Route path="/personal-blogs" element={<PersonalBlogs />} />
          <Route path="/readers" element={<ReadersList />} />

          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <Register />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />

          {/* protected routes */}
          <Route
            path="/write"
            element={user ? <Write /> : <Navigate to="/login" />}
          />
          <Route
            path="/settings"
            element={user ? <Settings /> : <Navigate to="/login" />}
          />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>

      <Footer />
    </div>
  );
}

export default App;

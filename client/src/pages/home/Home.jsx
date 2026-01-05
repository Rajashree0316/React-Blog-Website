import React, { useEffect, useState, useContext } from "react";
import Posts from "../../components/allPosts/posts/Posts";
import IntroSection from "../../components/intro/IntroSection";
import HeroImagePage from "../../components/layout/heroImagePage/HeroImagePage";
import axios from "axios";
import { useLocation } from "react-router";
import { Context } from "../../context/Context";
import "./Home.css";
import ExploreCategories from "../../components/exploreCategories/ExploreCategories";
import { API } from "../../config";
import Spinner, { SpinnerTypes } from "../../components/common/commonSpinner/Spinner";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { search } = useLocation();
  const { user } = useContext(Context);
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    // Only fetch posts if the user is logged in
    if (!isLoggedIn) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/posts${search}`);
        setPosts(res.data || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [search, isLoggedIn]);

  return (
    <>
      <HeroImagePage isLoggedIn={isLoggedIn} />

      <div className="homeContainer">
        <ExploreCategories />
        {isLoggedIn && <IntroSection />}

        {/* 🔄 Show spinner only if logged in */}
        {isLoggedIn && loading && (
          <div className="postsWrapper">
            <Spinner type={SpinnerTypes.PACMAN} size={80} color="#bc1d3d" />
          </div>
        )}

        {/* ✅ Show posts only if logged in */}
        {isLoggedIn && !loading && posts.length > 0 && (
          <div className="postsWrapper">
            <h1>Latest Posts</h1>
            <Posts posts={posts} loading={false} />
          </div>
        )}

        {/* ❌ Logged out or no posts → show nothing */}
      </div>
    </>
  );
}

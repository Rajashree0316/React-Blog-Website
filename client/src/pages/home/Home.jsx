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

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { search } = useLocation();
  const { user } = useContext(Context);
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${API}/posts${search}`);
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [search]);

  return (
    <>
      <HeroImagePage isLoggedIn={isLoggedIn} />

      <div className="homeContainer">
        <ExploreCategories />
        {isLoggedIn && <IntroSection />}
        <div className="postsWrapper">
          <h1>Latest Posts</h1>
          <Posts posts={posts} loading={loading} />
        </div>
      </div>
    </>
  );
}

import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  Suspense,
  lazy,
  memo,
  useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Context } from "../../context/Context";
import { CiLocationOn, CiCalendarDate } from "react-icons/ci";
import { SiGmail } from "react-icons/si";
import { FiExternalLink } from "react-icons/fi";
import "./PublicProfile.css";
import FollowButton from "../../components/common/followButton/FollowButton";
import PrivateProfileView from "../../components/common/privateProfileView/PrivateProfileView";
import Spinner, { SpinnerTypes } from "../../components/common/commonSpinner/Spinner";

const ActivityFeed = lazy(() => import("../../components/activityFeed/ActivityFeed"));
const RecentComments = lazy(() => import("../../components/activityFeed/RecentComments"));
const FollowModal = lazy(() => import("../../components/common/followModal/FollowModal"));

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, dispatch } = useContext(Context);
  const recentCommentsRef = useRef(null);

  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("followers");
  const [viewedUserId, setViewedUserId] = useState(null);
  const [navigatingMessage, setNavigatingMessage] = useState("");
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [viewedPreferences, setViewedPreferences] = useState(null);
  const [showAllTags, setShowAllTags] = useState(false);

  const isOwnProfile = currentUser?._id === id;
  const isPublicProfile = viewedPreferences?.publicProfile;
  const showFullProfile = isOwnProfile || isPublicProfile;
  const PF = import.meta.env.IMAGE_BASE_URL || "http://localhost:5000/images/";

  // ✅ Fetch preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!viewedUserId) return;
      try {
        const res = await axios.get(`/api/preferences/${viewedUserId}`);
        setViewedPreferences(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setViewedPreferences({ publicProfile: false, showEmail: false });
        } else console.error("Error fetching preferences:", err);
      }
    };
    fetchPreferences();
  }, [viewedUserId]);

  const handleFollowChange = (delta) =>
    setUser((prev) => ({
      ...prev,
      followersCount: (prev.followersCount || 0) + delta,
    }));

  const handleFollowBack = useCallback(
    async (followerId) => {
      try {
        const res = await axios.put(`/api/users/${followerId}/follow`, {
          userId: currentUser._id,
        });
        if (res.status === 200) {
          const updatedUser = {
            ...currentUser,
            followings: [...(currentUser.followings || []), followerId],
          };
          dispatch({ type: "LOGIN_SUCCESS", payload: updatedUser });
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.error("Error following back:", err);
      }
    },
    [currentUser, dispatch]
  );

  const validateUserData = (data) => ({
    ...data,
    strengths: data.strength || "", // map backend key
    topics: data.favoriteTopics || "", // map backend key
    followersCount: data.followersCount ?? 0,
    followingsCount: data.followingsCount ?? 0,
    savedPostsCount: data.savedPostsCount ?? 0,
  });

  const fetchUser = useCallback(async () => {
    try {
      if (!id) return;
      const fullRes = await axios.get(`/api/users/${id}`);
      const validated = validateUserData(fullRes.data);
      setViewedUserId(id);

      // Fetch saved posts count
      const savedRes = await axios.get(`/api/users/${id}/bookmarked`);
      validated.savedPostsCount = savedRes.data.length;

      setUser(validated);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const fetchRecentComments = async () => {
      if (!viewedUserId) return;
      try {
        const res = await axios.get(`/api/comments/recent/${viewedUserId}`);
        setComments(res.data);
      } catch (err) {
        setComments([]);
      }
    };
    fetchRecentComments();
  }, [viewedUserId]);

  useEffect(() => {
    const handleResize = () => setShowSidebar(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser)
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: storedUser, token: storedUser.token },
      });
  }, [dispatch]);

  if (!user || !viewedPreferences)
    return (
      <div style={{ padding: "100px 0" }}>
        <Spinner type={SpinnerTypes.HASH} size={90} color="#bc1d3d" />
      </div>
    );

  const scrollToRecentComments = () =>
    recentCommentsRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="profileContainer">
      {navigatingMessage && (
        <div className="navigating-message">{navigatingMessage}</div>
      )}

      {showFullProfile ? (
        <>
          {/* ======= HEADER ======= */}
          <div className="profile-header-wrapper">
            <div className="profile-header-card">
              <div className="profile-header-actions">
                {isOwnProfile ? (
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setNavigatingMessage("Navigating to profile settings...");
                      setTimeout(() => navigate("/settings?tab=profile"), 1000);
                    }}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <FollowButton
                    targetUser={user}
                    onFollowChange={handleFollowChange}
                  />
                )}
              </div>

              <div className="profile-avatar-container">
                <img
                  src={
                    user.profilePic
                      ? PF + user.profilePic
                      : "/default-placeholder.jpg"
                  }
                  alt="Profile"
                  className="profile-avatar"
                />
              </div>

              <div className="profile-info">
                <h1 className="profile-name">
                  {user.firstName} {user.lastName}
                </h1>

                {user.bio && <p className="profile-bio">{user.bio}</p>}

                <div className="meta-info">
                  {user.location && (
                    <div className="meta-info-personal">
                      <CiLocationOn className="meta-icon location" />
                      <p>{user.location}</p>
                    </div>
                  )}
                  <div className="meta-info-personal">
                    <CiCalendarDate className="meta-icon calendar" />
                    <p>
                      Joined on {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {user.website && (
                    <div className="meta-info-personal">
                      <FiExternalLink className="meta-icon web" />
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                  {viewedPreferences?.showEmail && user.email && (
                    <div className="meta-info-personal">
                      <SiGmail className="meta-icon email" />
                      <p>{user.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ======= EDUCATION / PRONOUNS / WORK ======= */}
              <div className="threeCards">
                {user.education && (
                  <div className="singleThreeCards">
                    🎓 <strong>Education</strong>
                    <p>{user.education}</p>
                  </div>
                )}
                {user.pronouns && (
                  <div className="singleThreeCards">
                    🌸<strong>Pronouns</strong>
                    <p>{user.pronouns}</p>
                  </div>
                )}
                {user.work && (
                  <div className="singleThreeCards">
                    💼<strong>Work</strong>
                    <p>{user.work}</p>
                  </div>
                )}
              </div>

              {window.innerWidth < 768 && (
                <button
                  className="sidebar-toggle"
                  onClick={() => setShowSidebar((prev) => !prev)}
                >
                  {showSidebar ? "Hide Sidebar" : "Show Sidebar"}
                </button>
              )}
            </div>
          </div>

          {/* ======= MAIN GRID ======= */}
          <div className="profile-grid">
            <aside
              className={`profile-sidebar ${showSidebar ? "show" : "hidden"}`}
            >
              {/* ======= THREE INFO CARDS ======= */}
              <div className="info-box">
                <h3>Exploring</h3>
                <p>{user.exploring || "Exploring new technologies and ideas."}</p>
              </div>

              <div className="info-box boxes">
                <h3>Key Strength</h3>
                <p>{user.strengths || "Problem solving, collaboration, creativity."}</p>
              </div>

              <div className="info-box boxes">
                <h3>Favorite Topic</h3>
                <p>{user.topics || "Frontend development, UX design, AI."}</p>
              </div>

              <ul className="stats">
                <li onClick={() => setShowSavedPosts(false)} className="clickable">
                  📄 <span>{user.postsCount || 0} posts published</span>
                </li>
                <li onClick={scrollToRecentComments} className="clickable">
                  💬 <span>{user.commentsCount || 0} comments written</span>
                </li>
                <li
                  onClick={() => {
                    setModalType("followers");
                    setIsModalOpen(true);
                  }}
                  className="clickable"
                >
                  👥 <span>{user.followersCount || 0} followers</span>
                </li>
                <li
                  onClick={() => {
                    setModalType("following");
                    setIsModalOpen(true);
                  }}
                  className="clickable"
                >
                  ➡️ <span>{user.followingsCount || 0} following</span>
                </li>
              </ul>

              {/* ======= FOLLOWED TAGS ======= */}
              {user.followedTags?.length > 0 && (
                <li className="followed-tags-section slide-up">
                  🔖 <strong>Tags Followed:</strong>
                  <div className="followed-tags-list">
                    {(showAllTags ? user.followedTags : user.followedTags.slice(0, 8))
                      .filter(Boolean)
                      .map((tagObj, i) => {
                        const tagName = typeof tagObj === "string" ? tagObj : tagObj.name;
                        return (
                          <span
                            key={tagName}
                            className="followed-tag slide-in"
                            style={{ animationDelay: `${i * 0.05}s` }}
                            onClick={() =>
                              navigate(`/posts?tag=${encodeURIComponent(tagName)}`)
                            }
                          >
                            #{tagName}
                          </span>
                        );
                      })}
                  </div>
                  {user.followedTags.length > 8 && (
                    <button
                      className="show-more-tags"
                      onClick={() => setShowAllTags((prev) => !prev)}
                    >
                      {showAllTags ? "Show Less" : "Show More"}
                    </button>
                  )}
                </li>
              )}

              {/* ======= MENTIONED TAGS ======= */}
              {user.tagsMentioned?.length > 0 && (
                <li className="mentioned-tags-section slide-up">
                  🏷️ <strong>Tags Mentioned:</strong>
                  <div className="mentioned-tags-list">
                    {user.tagsMentioned.map((tag) => (
                      <span
                        key={tag}
                        className="mentioned-tag slide-in"
                        onClick={() => navigate(`/posts?tag=${encodeURIComponent(tag)}`)}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </li>
              )}

              {/* ======= FOLLOW MODAL ======= */}
              {isModalOpen && (
                <FollowModal
                  show={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  userId={viewedUserId}
                  type={modalType}
                  currentUser={currentUser}
                  handleFollowBack={handleFollowBack}
                  handleFollowChange={handleFollowChange}
                  isOwnProfile={isOwnProfile}
                />
              )}
            </aside>

            <main className="profile-main">
              <Suspense
                fallback={<Spinner type={SpinnerTypes.PACMAN} size={70} color="#bc1d3d" />}
              >
                <ActivityFeed userId={viewedUserId} showSaved={showSavedPosts} />
                {comments.length > 0 && (
                  <div ref={recentCommentsRef}>
                    <RecentComments comments={comments} username={user.username} />
                  </div>
                )}
              </Suspense>
            </main>
          </div>
        </>
      ) : (
        <PrivateProfileView user={user} PF={PF} />
      )}
    </div>
  );
};

export default memo(PublicProfile);

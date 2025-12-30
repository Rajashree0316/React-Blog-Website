// src/components/blogSidebar/BlogSidebar.jsx
import React from "react";
import PopularTags from "../../widgets/popularTags/PopularTags";
import DailyWisdom from "../../widgets/dailywisdom/DailyWisdom";
import BlogStats from "../../widgets/blogStats/BlogStats";
import Newsletter from "../../widgets/newsLetter/NewsLetter";
import RecentPosts from "../../widgets/recentPosts/RecentPosts"; 

import "./BlogSidebar.css";


export default function BlogSidebar({
  showPopularTags = true,
  showDailyWisdom = true,
  showQuickStats = true,
  showNewsletter = true,
   showRecentPosts = true,
  customOrder = ["PopularTags", "DailyWisdom", "QuickStats", "Newsletter","RecentPosts"],
}) {
  const widgets = {
    PopularTags: showPopularTags && <PopularTags />,
    DailyWisdom: showDailyWisdom && <DailyWisdom />,
    QuickStats: showQuickStats && <BlogStats />,
    Newsletter: showNewsletter && <Newsletter />,
     RecentPosts: showRecentPosts && <RecentPosts />, 
  };

  return (
    <div className="blogs-right">
      {customOrder.map(
        (key) =>
          widgets[key] && (
            <div key={key} className="blogs-right-cards">
              {widgets[key]}
            </div>
          )
      )}
    </div>
  );
}

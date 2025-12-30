import axios from "axios";
import React, { useContext, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { Context } from "../../../context/Context";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { Editor } from "@tinymce/tinymce-react";
import "./SinglePost.css";

export default function SinglePost() {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/")[2];

  const [post, setPost] = useState({});
  const [updateMode, setUpdateMode] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [authorProfile, setAuthorProfile] = useState({});

  const [authorName, setAuthorName] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState([]);

  const PF = import.meta.env.VITE_IMAGE_URL;

  const editorRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/${path}`);
        const p = res.data;
        setPost(p);
        setTitle(p.title);
        setDesc(p.desc);
        setAuthorName(p.username);
        setSelectedTags(p.tags || []);
        if (p?.userId) {
          try {
            const res = await axios.get(`/api/users/${p.userId}`);
            setAuthorProfile(res.data);
          } catch (err) {
            console.error("Error fetching author profile:", err);
          }
        } else if (p?.username) {
          try {
            const res = await axios.get(`/api/users?username=${p.username}`);
            setAuthorProfile(res.data);
          } catch (err) {
            console.error("Error fetching author by username:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching post:", err);
      }
    };

    const fetchTags = async () => {
      try {
        const tagRes = await axios.get("/api/tags");
        setTags(tagRes.data);
      } catch (err) {
        console.error("Failed fetching tags:", err);
      }
    };

    fetchPost();
    fetchTags();
  }, [path, user]);

  useEffect(() => {
    if (updateMode && selectedTags.length > 0) {
      setInputValue(selectedTags.map((tag) => `#${tag}`).join(", "));
    }
  }, [updateMode, selectedTags]);

  const handleUpdate = async () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 5) {
      return alert("Title must be at least 5 characters.");
    }

    const updatedPost = {
      ...post,
      title: trimmedTitle,
      desc,
      tags: selectedTags,
    };

    if (file) {
      const data = new FormData();
      const filename = Date.now() + file.name;
      data.append("name", filename);
      data.append("file", file);
      try {
        await axios.post("/api/upload", data);
        updatedPost.photo = filename;
      } catch (err) {
        console.error("Image upload failed:", err);
        return;
      }
    }

    try {
      await axios.put(`/api/posts/${post._id}`, updatedPost);
      setPost(updatedPost);
      setUpdateMode(false);
      alert("Post updated successfully.");
    } catch (err) {
      console.error("Post update failed:", err);
      alert("Error updating post.");
    }
  };

  const handleDelete = async () => {
    if (!user) return alert("You must be logged in to delete a post.");
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmDelete) return;
    try {
      const res = await axios.delete(
        `/api/posts/${post._id}?userId=${user._id}`
      );

      if (res.status === 200) {
        alert("Post deleted.");
        setPost(null);
        navigate("/blogs");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete post.");
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/posts?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <div className={`singlePost ${updateMode ? "editMode" : ""}`}>
      <div className="singlePostWrapper">
        {/* Post Image */}
        {post.photo && !updateMode && (
          <img
            src={PF + post.photo}
            alt="Post"
            className="singlePostImg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-placeholder.jpg";
            }}
          />
        )}
        {updateMode && (
          <div className="fileInputContainer">
            {post.photo && (
              <img
                src={PF + post.photo}
                alt="Current"
                className="singlePostImg"
              />
            )}
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="fileInput" className="fileInputLabel">
              Choose new image
            </label>
          </div>
        )}

        {/* Author Info */}
        <div
          className="authorInfo"
          onClick={() =>
            navigate(`/profile/${authorProfile?._id || post.userId}`)
          }
          style={{ cursor: "pointer" }}
        >
          <img
            loading="lazy"
            src={
              authorProfile?.profilePic
                ? PF + authorProfile.profilePic
                : "/default-placeholder.jpg"
            }
            alt="Author"
            className="avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-placeholder.jpg";
            }}
          />
          <div className="authorDetails">
            <span className="authorName">
              {authorProfile?.username || post?.username || "Unknown Author"}
            </span>
            <div className="authorDate">
              {post.createdAt && (
                <span className="postDate">
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Post Title */}
        {updateMode ? (
          <input
            type="text"
            value={title}
            className="singlePostTitleInput"
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <h1 className="singlePostTitle">
            {title}
            {post.username === user?.username && (
              <div className="singlePostEdit">
                <i
                  className="singlePostIcon"
                  onClick={() => setUpdateMode(true)}
                >
                  <FaEdit className="singlePostIcon-edit" />
                </i>
                <i className="singlePostIcon" onClick={handleDelete}>
                  <RiDeleteBin6Fill className="singlePostIcon-delete" />
                </i>
              </div>
            )}
          </h1>
        )}

        {/* Tags */}
        <div className="singlePostTags">
          <div className="tagsWrapper">
            {updateMode ? (
              <input
                type="text"
                className="writeInput"
                placeholder="#Tags (separate with space, comma or #)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (["Enter", " ", ","].includes(e.key)) {
                    e.preventDefault();
                    const newTag = inputValue
                      .trim()
                      .replace(/^#/, "")
                      .toLowerCase();
                    if (newTag && !selectedTags.includes(newTag)) {
                      setSelectedTags([...selectedTags, newTag]);
                    }
                    setInputValue("");
                  }
                }}
                onBlur={() => {
                  const rawInput = inputValue.trim();
                  let parsedTags = rawInput
                    .split(/[, \s#]+/)
                    .filter((tag) => tag.length > 0);
                  parsedTags = Array.from(
                    new Set(parsedTags.map((tag) => tag.toLowerCase()))
                  );
                  setSelectedTags(parsedTags);
                }}
              />
            ) : selectedTags.length > 0 ? (
              selectedTags.map((tag, index) => (
                <span
                  key={index}
                  className="tagItem"
                  onClick={() => handleTagClick(tag)}
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span>No tags available</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="singlePostDescWrapper">
          {updateMode ? (
            <Editor
              apiKey="yc19r2zg6r8jwyd2oe6329mmu7bakft8oask65g7dvbhmcgg"
              value={desc}
              init={{
                height: 700,
                menubar: true,
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "codesample",
                  "help",
                  "wordcount",
                ],
                toolbar:
                  "undo redo | blocks | fontfamily fontsize | bold italic underline strikethrough forecolor backcolor | " +
                  "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
                  "link image media table codesample | removeformat | help fullscreen",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
              }}
              onEditorChange={(content) => setDesc(content)}
            />
          ) : (
            <div
              className="singlePostDesc"
              dangerouslySetInnerHTML={{
                __html: desc.replace(/<hr\s*\/?>/g, ""),
              }}
            />
          )}
        </div>

        {/* Update Button */}
        {updateMode && (
          <button className="singlePostButton" onClick={handleUpdate}>
            Update
          </button>
        )}
      </div>
    </div>
  );
}

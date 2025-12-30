import React, { useContext, useRef, useState, useEffect } from "react";
import axios from "axios";
import { Context } from "../../context/Context";
import { Link, useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import "./Write.css";

export default function Write() {
  const { user } = useContext(Context);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState(user?.username.toUpperCase() || "");
  const [selectedTags, setSelectedTags] = useState([]);
  const [file, setFile] = useState(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Error states
  const [titleError, setTitleError] = useState("");
  const [tagsError, setTagsError] = useState("");
  const [fileError, setFileError] = useState("");

  const editorRef = useRef(null);
  const navigate = useNavigate();
  const titleRef = useRef();

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const trimmedTitle = title.trim();

    if (trimmedTitle.length < 5) {
      setTitleError("Title must be at least 5 characters.");
      hasError = true;
    } else {
      setTitleError("");
    }

    if (selectedTags.length === 0) {
      setTagsError("Please add at least one tag.");
      hasError = true;
    } else {
      setTagsError("");
    }

    if (!file) {
      setFileError("Please upload a cover image.");
      hasError = true;
    } else {
      setFileError("");
    }

    if (hasError) return;

    let content = editorRef.current?.getContent() || "";
    content = content.replace(/<p>&nbsp;<\/p>/g, "").replace(/&nbsp;/g, " ");

    const disclaimer = `<p style="color:#000;font-size:0.9em;margin-top:2em;"><em>Disclaimer: This content is based on what I've read and learned from various online resources. Shared here for educational purposes.</em></p>`;
    content = content.trim() + disclaimer;

    const newPost = {
      userId: user?._id,
      username: user?.username || author,
      profilePic: user?.profilePic || "",
      title: trimmedTitle,
      desc: content,
      tags: selectedTags,
      featured: isFeatured,
    };

    if (file) {
      const data = new FormData();
      const filename = Date.now() + file.name;
      data.append("name", filename);
      data.append("file", file);
      newPost.photo = filename;

      try {
        await axios.post("/api/upload", data);
      } catch (err) {
        console.error("Image upload failed:", err);
        setFileError("Image upload failed. Please try again.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await axios.post("/api/posts", newPost);
      navigate(`/post/${res.data._id}`);
    } catch (err) {
      console.error("Post creation failed:", err);
      alert("Could not publish the post. Please check your inputs.");
    }

    setIsLoading(false);
  };

  return (
    <div className="commonContainer">
      <div className="commonHeadings">
        <h2>Create New Post</h2>
        <p>Share your knowledge with the developer community</p>
      </div>

      <div className="writeWrapperContainer">
        <div className="writeWrapper">
          <form className="writeForm" onSubmit={handleSubmit}>
            <div className="writeFormGroup">
              <label htmlFor="fileInput" className="iconLabel">
                <i className="fas fa-cloud-upload-alt"></i> Upload Image*
              </label>
              <input
                type="file"
                id="fileInput"
                style={{ display: "none" }}
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setFileError("");
                }}
                aria-label="Upload blog image"
              />
              {fileError && <p className="errorText">{fileError}</p>}
            </div>

            {file && (
              <div className="writeImgPreview">
                <img
                  className="writeImg"
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                />
              </div>
            )}

            <div className="writeFormGroup">
              <label htmlFor="titleInput">Post Title*</label>
              <input
                ref={titleRef}
                id="titleInput"
                type="text"
                placeholder="Enter an engaging title for your post"
                className="writeInput"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value.trimStart());
                  setTitleError("");
                }}
              />
              {titleError && <p className="errorText">{titleError}</p>}
            </div>

            <div className="writeFormGroup">
              <label htmlFor="authorInput">Author</label>
              <input
                id="authorInput"
                type="text"
                placeholder="Author"
                className="writeInput"
                value={author}
                onChange={(e) => setAuthor(e.target.value.toUpperCase())}
                readOnly
              />
            </div>

            <div className="writeFormGroup">
              <label htmlFor="tagsInput">Tags*</label>
              <input
                type="text"
                id="tagsInput"
                className="writeInput"
                placeholder="#Tags (separate with space or #)"
                onChange={(e) => {
                  const rawInput = e.target.value.trim();
                  const parsedTags = rawInput
                    .split(/[\s#]+/)
                    .filter((tag) => tag.length > 0);
                  setSelectedTags(parsedTags);
                  setTagsError("");
                }}
              />
              {tagsError && <p className="errorText">{tagsError}</p>}
            </div>

            <div className="checkboxContainer">
              <label className="checkboxLabel">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={() => setIsFeatured((prev) => !prev)}
                />
                <span>Mark as Featured</span>
              </label>
            </div>

            <Editor
              apiKey="yc19r2zg6r8jwyd2oe6329mmu7bakft8oask65g7dvbhmcgg"
              onInit={(evt, editor) => (editorRef.current = editor)}
              init={{
                height: 600,
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
                  "help",
                  "wordcount",
                  "emoticons",
                  "codesample",
                  "autosave",
                  "quickbars",
                  "pagebreak",
                  "nonbreaking",
                  "directionality",
                ],
                toolbar:
                  "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough forecolor backcolor | " +
                  "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
                  "link image media codesample table emoticons | removeformat code fullscreen preview | help",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:16px; }",
                image_advtab: true,
                file_picker_types: "image media",
              }}
            />

            <button className="writeSubmit" type="submit" disabled={isLoading}>
              {isLoading ? "Publishing..." : "Publish"}
            </button>

            <div className="writeHeader">
              <Link to="/" className="backLink">
                ← Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

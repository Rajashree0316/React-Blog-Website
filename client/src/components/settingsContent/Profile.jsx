import React, { useContext, useState, useEffect } from "react";
import { Context } from "../../context/Context";
import axios from "axios";
import "./Profile.css";
import { toast } from "react-toastify";

export default function Profile() {
  const { user, dispatch } = useContext(Context);
  const PF = import.meta.env.IMAGE_BASE_URL || "http://localhost:5000/images/";

  const [file, setFile] = useState(null);
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    website: "",
    location: "",
    pronouns: "",
    exploring: "",
    strength: "",
    favoriteTopics: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFields({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        bio: user.bio || "",
        website: user.website || "",
        location: user.location || "",
        pronouns: user.pronouns || "",
        exploring: user.exploring || "",
        strength: user.strength || "",
        favoriteTopics: user.favoriteTopics || "",
      });
    }
  }, [user]);

  const handleChange = (key) => (e) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const capitalize = (str) =>
    str
      .split(" ")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const updatedUser = {
      userId: user._id,
      firstName: capitalize(fields.firstName),
      lastName: capitalize(fields.lastName),
      email: fields.email,
      bio: fields.bio,
      website: fields.website,
      location: capitalize(fields.location),
      pronouns: fields.pronouns,
      exploring: fields.exploring,
      strength: fields.strength,
      favoriteTopics: fields.favoriteTopics,
    };

    if (file) {
      const data = new FormData();
      const filename = Date.now() + file.name;
      data.append("name", filename);
      data.append("file", file);
      updatedUser.profilePic = filename;

      try {
        await axios.post("/api/upload", data);
      } catch (err) {
        setError("Failed to upload profile picture.");
        return;
      }
    }

    try {
      const res = await axios.put(`/api/users/${user._id}/profile`, updatedUser);
      dispatch({ type: "UPDATE_SUCCESS", payload: res.data });

      // Update fields and keep the updated values in the form
      setFields({
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        email: res.data.email || "",
        bio: res.data.bio || "",
        website: res.data.website || "",
        location: res.data.location || "",
        pronouns: res.data.pronouns || "",
        exploring: res.data.exploring || "",
        strength: res.data.strength || "",
        favoriteTopics: res.data.favoriteTopics || "",
      });

      // Clear the file input but keep the preview updated
      if (res.data.profilePic) {
        setFile(null);
      }

      toast.success("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setFile(null);
    if (user) {
      setFields({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        bio: user.bio || "",
        website: user.website || "",
        location: user.location || "",
        pronouns: user.pronouns || "",
        exploring: user.exploring || "",
        strength: user.strength || "",
        favoriteTopics: user.favoriteTopics || "",
      });
    }
    setError("");
    toast.info("Canceled!!..");
  };

  if (!user) return <p>Loading user data...</p>;

  return (
    <form className="commonForm" onSubmit={handleSubmit}>
      <h2 className="commonFormTitle">Profile Information</h2>
      <p className="commonFormSubtitle">Update your profile details</p>

      <div className="profilePicSection">
        <img
          src={
            file
              ? URL.createObjectURL(file)
              : user.profilePic
              ? PF + user.profilePic
              : "default-placeholder.jpg"
          }
          alt="Profile"
          className="profileImagePreview"
        />

        <label htmlFor="fileInput" className="changeProfileText">
          Upload
        </label>
        <input
          id="fileInput"
          type="file"
          style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files[0])}
          accept="image/*"
        />
      </div>

      <div className="formGroupRow">
        <div className="formGroup">
          <label>First Name</label>
          <input
            type="text"
            value={fields.firstName}
            onChange={handleChange("firstName")}
          />
        </div>
        <div className="formGroup">
          <label>Last Name</label>
          <input
            type="text"
            value={fields.lastName}
            onChange={handleChange("lastName")}
          />
        </div>
      </div>

      <div className="formGroup">
        <label>Email Address</label>
        <input
          type="email"
          value={fields.email}
          onChange={handleChange("email")}
        />
      </div>

      <div className="formGroup">
        <label>Bio</label>
        <textarea
          rows="3"
          value={fields.bio}
          onChange={handleChange("bio")}
          placeholder="Tell us a bit about yourself..."
        />
      </div>

      <div className="formGroup">
        <label>Pronouns</label>
        <input
          type="text"
          value={fields.pronouns}
          onChange={handleChange("pronouns")}
          placeholder="e.g. she/her, he/him, they/them"
        />
      </div>

      <div className="formGroup">
        <label>What are you exploring right now?</label>
        <textarea
          rows="2"
          value={fields.exploring}
          onChange={handleChange("exploring")}
          placeholder="E.g. Learning data science, exploring AI tools..."
        />
      </div>

      <div className="formGroup">
        <label>Your key strengths</label>
        <input
          type="text"
          value={fields.strength}
          onChange={handleChange("strength")}
          placeholder="E.g. writing, backend logic, problem solving"
        />
      </div>

      <div className="formGroup">
        <label>Favorite topics</label>
        <input
          type="text"
          value={fields.favoriteTopics}
          onChange={handleChange("favoriteTopics")}
          placeholder="E.g. food, gaming, coding, mental health"
        />
      </div>

      <div className="formGroupRow">
        <div className="formGroup">
          <label>Website</label>
          <input
            type="url"
            value={fields.website}
            onChange={handleChange("website")}
          />
        </div>
        <div className="formGroup">
          <label>Location</label>
          <input
            type="text"
            value={fields.location}
            onChange={handleChange("location")}
          />
        </div>
      </div>

      {error && <p className="commonErrorMsg">{error}</p>}

      <div className="commonButtonGroup">
        <button className="commonBtn saveBtn" type="submit">
          Save
        </button>
        <button
          className="commonBtn cancelBtn"
          type="button"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

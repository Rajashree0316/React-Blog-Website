import React, { useContext, useState, useEffect } from "react";
import { Context } from "../../context/Context";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Account.css";
import { toast } from "react-toastify";

export default function Account() {
  const { user, dispatch } = useContext(Context);
  const navigate = useNavigate();

  const [username, setUsername] = useState(() => user.username || "");
  const [work, setWork] = useState(() => user.work || "");
  const [education, setEducation] = useState(() => user.education || "");
  const [language, setLanguage] = useState(() => user.language || "");

  const [error, setError] = useState("");

  // Sync local states with updated user info whenever user changes
  useEffect(() => {
    setUsername(user.username || "");
    setWork(user.work || "");
    setEducation(user.education || "");
    setLanguage(user.setLanguage || "")
  }, [user]);

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const updatedUser = {
      userId: user._id,
      username,
      work,
      education,
      language,
    };

    try {
      const res = await axios.put(
        `/api/users/${user._id}/profile`,
        updatedUser
      );
      dispatch({ type: "UPDATE_SUCCESS", payload: res.data });
      toast.success("Changes saved successfully!", {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update account settings."
      );
    }
  };

  const handleCancel = () => {
    toast.info("Changes discarded.", {
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const onDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await axios.delete(`/api/users/${user._id}`, {
          data: { userId: user._id },
        });
        dispatch({ type: "LOGOUT" });
        navigate("/register");
      } catch {
        setError("Failed to delete account.");
      }
    }
  };

  return (
    <>
      <form className="commonForm" onSubmit={handleAccountSubmit}>
        <h2 className="commonFormTitle">Account Settings</h2>
        <p className="commonFormSubtitle">
          Update your account information below
        </p>
        <div className="accountCard">
          <div className="formGroup">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <small className="inputNote">
              This will be visible in your profile URL
            </small>
          </div>

          <div className="formGroup">
            <label>Languages</label>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="Known Languages"
            />
          </div>
          <div className="formGroup">
            <label>Work</label>
            <input
              type="text"
              value={work}
              onChange={(e) => setWork(e.target.value)}
              placeholder="Job Title / Company"
            />
          </div>

          <div className="formGroup">
            <label>Education</label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="Your educational background"
            />
          </div>
          <div className="formGroup">
            <label>Joined On</label>
            <input
              type="text"
              value={new Date(user.createdAt).toLocaleDateString()}
              readOnly
            />
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
        </div>

        <div className="dangerZone">
          <h3>Danger Zone</h3>
          <p>This will permanently delete your account.</p>
          <button
            className="commonBtn deleteBtn"
            type="button"
            onClick={onDelete}
          >
            Delete Account
          </button>
        </div>
      </form>
    </>
  );
}

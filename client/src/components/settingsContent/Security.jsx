import React, { useState, useContext, useEffect } from "react";
import { Context } from "../../context/Context";
import axios from "axios";
import "./Security.css";
import { toast } from "react-toastify";

export default function Security() {
  const { user, dispatch } = useContext(Context);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [twoFAEnabled, setTwoFAEnabled] = useState(user.twoFAEnabled);
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get(`/api/users/${user._id}/sessions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSessions(res.data.sessions);
      } catch (err) {
        console.error("Failed to load sessions", err);
      }
    };

    fetchSessions();
  }, [user._id]);

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!currentPassword || !newPassword || !repeatPassword) {
      return setError("All fields are required.");
    }

    if (newPassword.length < 6) {
      return setError("New password must be at least 6 characters.");
    }

    if (newPassword !== repeatPassword) {
      return setError("New passwords do not match.");
    }

    try {
      const res = await axios.put(`/api/users/${user._id}/password`, {
        userId: user._id,
        currentPassword,
        password: newPassword,
      });

      dispatch({ type: "UPDATE_SUCCESS", payload: res.data });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    }
  };

  const handleEnable2FA = async () => {
    try {
      const res = await axios.post(
        `/api/users/${user._id}/enable-2fa`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setQrCode(res.data.qrCode);
      toast.info("Scan the QR code and enter the token to verify 2FA.");
    } catch (err) {
      toast.error("Failed to enable 2FA.");
    }
  };

  const handleVerifyToken = async () => {
    try {
      const res = await axios.post(
        `/api/users/${user._id}/validate-2fa`,
        { token },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTwoFAEnabled(true);
      setQrCode("");
      setToken("");
      toast.success("2FA verified and enabled.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid token.");
    }
  };

  const handleDisable2FA = async () => {
    try {
      await axios.post(
        `/api/users/${user._id}/disable-2fa`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTwoFAEnabled(false);
      setToken("");
      setQrCode("");
      toast.success("2FA disabled.");
    } catch (err) {
      toast.error("Failed to disable 2FA.");
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await axios.post(`/api/users/${user._id}/revoke-session`, { sessionId });
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      toast.success("Session revoked.");
    } catch (err) {
      toast.error("Failed to revoke session.");
    }
  };

  return (
    <>
      <form className="commonForm" onSubmit={handleAccountSubmit}>
        <h2 className="commonFormTitle">Password & Security</h2>
        <div className="securityForm">
          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <label>Confirm New Password</label>
          <input
            type="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
          <div className="commonButtonGroup">
            <button className="commonBtn greenBtn" type="submit">
              Update Password
            </button>
            <button className="commonBtn cancelBtn" type="button">
              Cancel
            </button>
          </div>
          {error && <p className="commonErrorMsg">{error}</p>}
        </div>
      </form>

      <div className="securityCard">
        <h3>Two-Factor Authentication</h3>
        <p>Add an extra layer of security to your account.</p>
        <div className="twoFABox">
          <div className="twoFABoxSub">
            <span className="lockIcon">{twoFAEnabled ? "✅" : "🔒"}</span>
            <div className="twoFAContent">
              <strong>Two-Factor Authentication</strong>
              <p>{twoFAEnabled ? "Enabled" : "Not enabled"}</p>
            </div>
          </div>
          {!twoFAEnabled ? (
            <button className="btn blueBtn" onClick={handleEnable2FA}>
              Enable 2FA
            </button>
          ) : (
            <button className="btn redBtn" onClick={handleDisable2FA}>
              Disable 2FA
            </button>
          )}
        </div>

        {qrCode && (
          <div className="qrSection">
            <p>Scan this QR code with your authenticator app:</p>
            <img src={qrCode} alt="2FA QR Code" className="qrCodeImg" />
            <input
              type="text"
              value={token}
              placeholder="Enter code from app"
              onChange={(e) => setToken(e.target.value)}
            />
            <button className="btn greenBtn" onClick={handleVerifyToken}>
              Verify Token
            </button>
          </div>
        )}
      </div>

      <div className="securityCard">
        <h3>Active Sessions</h3>
        <p>Manage where you're signed in.</p>
        {sessions.map((session) => (
          <div key={session._id} className="sessionItem">
            <div>
              <strong>{session.device}</strong>
              <p>{session.ip}</p>
              <small>
                {session.isCurrent
                  ? "Active now"
                  : new Date(session.loginTime).toLocaleString()}
              </small>
            </div>
            {!session.isCurrent ? (
              <button
                className="btn redBtn"
                onClick={() => handleRevokeSession(session._id)}
              >
                Revoke
              </button>
            ) : (
              <span className="activeTag">Current session</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

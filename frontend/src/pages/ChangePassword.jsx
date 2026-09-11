import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        "/auth/change-password",
        form
      );

      setSuccess(response.data.message);

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to change password"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Change Password</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <label>Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            required
          />

          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            minLength={8}
            maxLength={16}
            placeholder="8-16 chars, uppercase + special"
            required
          />

          <button type="submit">
            Change Password
          </button>
        </form>

        <button
          className="secondary-button"
          onClick={() => navigate("/")}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
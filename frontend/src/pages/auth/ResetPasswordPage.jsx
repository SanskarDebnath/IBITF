import { useState } from "react";
import * as authService from "../../services/authService";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await authService.resetPassword({ token, password });
      setMessage(res.message || "Password updated");
    } catch (err) {
      setError(err.message || "Reset failed");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "2rem auto" }}>
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
        <label>
          Reset Token
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </label>
        <label>
          New Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div style={{ color: "#ef4444" }}>{error}</div>}
        {message && <div style={{ color: "#10b981" }}>{message}</div>}
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

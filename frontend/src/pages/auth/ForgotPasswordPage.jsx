import { useState } from "react";
import { Link } from "react-router-dom";
import * as authService from "../../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await authService.forgotPassword({ email });
      setMessage(res.message || "Reset token created");
      if (res.resetToken) setResetToken(res.resetToken);
    } catch (err) {
      setError(err.message || "Request failed");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "2rem auto" }}>
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {error && <div style={{ color: "#ef4444" }}>{error}</div>}
        {message && <div style={{ color: "#10b981" }}>{message}</div>}
        {resetToken && (
          <div>
            Demo reset token: <strong>{resetToken}</strong>
          </div>
        )}
        <button type="submit">Send Reset Link</button>
      </form>
      <p>
        <Link to="/auth/reset-password">Have a token? Reset here</Link>
      </p>
    </div>
  );
}

import React, { useState } from "react";
import { post } from "../utils/api";

export default function ForgotPassword() {
  const [status, setStatus] = useState("");

  async function submit(e) {
    e.preventDefault();
    const email = new FormData(e.target).get("email");
    setStatus("Sending...");
    try {
      await post("/api/auth/forgot-password", { email });
      setStatus("If that email exists we'll send reset instructions.");
      e.target.reset();
    } catch (err) {
      setStatus(err.message || "Error");
    }
  }

  return (
    <section style={{ maxWidth: 480 }}>
      <h2>Forgot password</h2>
      <form onSubmit={submit}>
        <input name="email" type="email" placeholder="Email" required className="form-input" />
        <button className="btn" type="submit">Send reset link</button>
      </form>
      <p>{status}</p>
    </section>
  );
}

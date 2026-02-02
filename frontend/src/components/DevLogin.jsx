import React from "react";
import { post } from "../utils/api";

export default function DevLogin() {
  async function doLogin() {
    try {
      const data = await post("/api/auth/login", { email: "kangaru@yahoo.com", password: "girls@kangaru" });
      const token = data.token;
      // dispatch event so App listens and sets user+route
      window.dispatchEvent(new CustomEvent("kangaru:dev-login", { detail: { token } }));
    } catch (err) {
      alert(err.message || "Dev login failed");
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <h3>Dev Auto-Login</h3>
      <p style={{ marginTop: 6 }}>Click to auto-login as `kangaru@yahoo.com` (dev only).</p>
      <button onClick={doLogin} style={{ marginTop: 8 }}>Auto-login as kangaru@yahoo.com</button>
    </div>
  );
}

import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../admin.css";

export default function AdminLayout({ user, children, activeSection, setActiveSection, logout }) {
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="logo">School Admin</div>
        <Sidebar active={activeSection} onChange={setActiveSection} />
      </aside>

      <main className="admin-main">
        <Topbar user={user} logout={logout} />
        <div style={{ flex: 1 }}>{children}</div>
      </main>
    </div>
  );
}

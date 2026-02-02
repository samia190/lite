import React from "react";
import AdminButton from "./AdminButton";

export default function Topbar({ user, logout }) {
  return (
    <div className="topbar">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>Manage school content and submissions</div>
      </div>

      <div className="actions">
        <div style={{ position: 'relative' }}>
          <button title="Notifications" style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize:18 }}>🔔</button>
          <span style={{ position:'absolute', right: -6, top:-6, background: 'var(--danger)', color:'#fff', borderRadius:8, padding:'2px 6px', fontSize:11 }}>3</span>
        </div>
        {user && <div style={{ fontSize:13, color:'var(--muted)' }}>{user.email}</div>}
        <AdminButton variant="neutral" onClick={logout}>Logout</AdminButton>
      </div>
    </div>
  );
}

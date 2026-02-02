import { useEffect, useState } from "react";
import { get } from "../utils/api";

export default function DashboardWidgets({ onNavigate }) {
  const [counts, setCounts] = useState({ submissions: 0, admissions: 0, users: 0 });

  useEffect(() => {
    async function load() {
      try {
        const subs = await get("/api/submissions");
        const users = await get("/api/admin/users");
        const admissions = await get("/api/admissions");
        setCounts({ submissions: (subs || []).length, admissions: (admissions || []).length, users: (users || []).length });
      } catch (e) {
        // ignore - show zeros
      }
    }
    load();
  }, []);

  return (
    <div className="grid">
      <div className="card card-animate widget">
        <div className="left">
          <div className="icon sub material-icon">mail_outline</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Submissions</div>
            <div className="muted">Pending review</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{counts.submissions}</div>
          <button className="menu-item" onClick={() => onNavigate && onNavigate("submissions")} style={{ marginTop: 8 }}>Open</button>
        </div>
      </div>

      <div className="card card-animate widget">
        <div className="left">
          <div className="icon adm material-icon">school</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Admissions</div>
            <div className="muted">New applicants</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{counts.admissions}</div>
          <button className="menu-item" onClick={() => onNavigate && onNavigate("admissions")} style={{ marginTop: 8 }}>Open</button>
        </div>
      </div>

      <div className="card card-animate widget">
        <div className="left">
          <div className="icon adm material-icon">people</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Users</div>
            <div className="muted">Manage roles</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{counts.users}</div>
          <button className="menu-item" onClick={() => onNavigate && onNavigate("roles")} style={{ marginTop: 8 }}>Open</button>
        </div>
      </div>
    </div>
  );
}


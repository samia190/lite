import React from "react";

const items = [
  { key: "dashboard", label: "Dashboard", icon: "🏫" },
  { key: "submissions", label: "Submissions", icon: "📥" },
  { key: "admissions", label: "Admissions", icon: "📝" },
  { key: "roles", label: "Users & Roles", icon: "👥" },
  { key: "gallery", label: "Gallery", icon: "🖼️" },
  { key: "legal", label: "Legal", icon: "⚖️" },
];

export default function Sidebar({ active, onChange }) {
  return (
    <nav>
      <ul>
        {items.map((it) => (
          <li key={it.key}>
            <button className={`menu-item ${active === it.key ? 'active' : ''}`} onClick={() => onChange(it.key)}>
              <span style={{ width:28 }}>{it.icon}</span>
              <span>{it.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

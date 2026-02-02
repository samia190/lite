import React, { useEffect, useState } from "react";

export default function Notifications() {
  const [list, setList] = useState([]);

  useEffect(() => {
    function onNotify(e) {
      const { message, type = "info", timeout = 4000 } = e.detail || {};
      const id = Date.now() + Math.random();
      setList((s) => [...s, { id, message, type }]);
      setTimeout(() => {
        setList((s) => s.filter((i) => i.id !== id));
      }, timeout || 4000);
    }

    window.addEventListener("kangaru:notify", onNotify);
    return () => window.removeEventListener("kangaru:notify", onNotify);
  }, []);

  if (!list.length) return null;

  return (
    <div className="notifications-root" style={{ position: "fixed", right: 18, top: 18, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
      {list.map((n) => (
        <div key={n.id} role="status" aria-live="polite" className={`card notification-card fade-in-up`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: n.type === 'error' ? 'rgba(239,68,68,0.12)' : n.type === 'success' ? 'rgba(5,150,105,0.08)' : 'rgba(37,99,235,0.08)' }}>
              <span className="material-icon" style={{ color: n.type === 'error' ? '#ef4444' : n.type === 'success' ? '#059669' : '#2563eb', fontSize: 18 }}>{n.type === 'success' ? 'check' : n.type === 'error' ? 'error' : 'info'}</span>
            </div>
            <div style={{ flex: 1, fontSize: 14, lineHeight: 1.2 }}>{n.message}</div>
            <button aria-label="Close notification" onClick={() => setList((s) => s.filter((i) => i.id !== n.id))} className="btn btn-link" style={{ fontSize: 16 }}>
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

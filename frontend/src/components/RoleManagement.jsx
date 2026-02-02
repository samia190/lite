import React, { useEffect, useState } from "react";
import { get, put } from "../utils/api";
import notify from "../utils/notify";

const btnBase = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
};

const styles = {
  primary: { ...btnBase, background: "#2563eb", color: "#fff" },
  success: { ...btnBase, background: "#059669", color: "#fff" },
  neutral: { ...btnBase, background: "#e5e7eb", color: "#0f172a" },
  danger: { ...btnBase, background: "#ef4444", color: "#fff" },
};

export default function RoleManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null); // { id, name, email, role }

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await get("/api/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      notify("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }

  function promptRoleChange(u, role) {
    setConfirm({ id: u._id || u.id, name: u.name, email: u.email, role });
  }

  async function confirmChange() {
    if (!confirm) return;
    const { id, role } = confirm;
    try {
      await put(`/api/admin/users/${id}/role`, { role });
      notify(`Role updated to ${role}`, "success");
      setUsers((s) => s.map((u) => (u._id === id || u.id === id ? { ...u, role } : u)));
    } catch (err) {
      console.error(err);
      notify("Failed to update role", "error");
    } finally {
      setConfirm(null);
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <h3>Role Management</h3>
      {loading && <div>Loading...</div>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #e6e6e6" }}>
            <th style={{ padding: 8 }}>Name</th>
            <th style={{ padding: 8 }}>Email</th>
            <th style={{ padding: 8 }}>Role</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id || u.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: 8 }}>{u.name}</td>
              <td style={{ padding: 8, color: "#374151" }}>{u.email}</td>
              <td style={{ padding: 8 }}>{u.role}</td>
              <td style={{ padding: 8 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => promptRoleChange(u, "admin")} style={styles.primary}>Make Admin</button>
                  <button onClick={() => promptRoleChange(u, "teacher")} style={styles.success}>Make Teacher</button>
                  <button onClick={() => promptRoleChange(u, "user")} style={styles.neutral}>Make User</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div style={{ background: "#fff", padding: 18, borderRadius: 10, width: 420, boxShadow: "0 10px 30px rgba(2,6,23,0.2)" }}>
            <h4 style={{ marginTop: 0 }}>Confirm role change</h4>
            <p style={{ marginBottom: 8 }}>Change role for <strong>{confirm.name}</strong> ({confirm.email}) to <strong>{confirm.role}</strong>?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setConfirm(null)} style={styles.neutral}>Cancel</button>
              <button onClick={confirmChange} style={styles.danger}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

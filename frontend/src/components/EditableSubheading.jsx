import { useState, useEffect } from "react";

export default function EditableSubheading({ value, onSave, isAdmin, level = 3 }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  function handleBlur() {
    setEditing(false);
    if (text !== value && onSave) onSave(text);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  }

  const Tag = `h${level}`;

  if (!isAdmin) return <Tag>{value}</Tag>;

  return editing ? (
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
      style={{
        fontSize: "1.2rem",
        fontWeight: "600",
        padding: "6px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        width: "100%",
      }}
    />
  ) : (
    <Tag
      onClick={() => setEditing(true)}
      style={{ cursor: "pointer", backgroundColor: "#f3f3f3", padding: "4px", borderRadius: "4px" }}
    >
      {value || "Click to edit subheading"}
    </Tag>
  );
}

import { useState, useEffect } from "react";

export default function EditableText({ value, onSave, isAdmin }) {
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

  if (!isAdmin) return <p>{value}</p>;

  return editing ? (
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
      style={{
        width: "100%",
        minHeight: "60px",
        fontSize: "1rem",
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
      }}
    />
  ) : (
    <p
      onClick={() => setEditing(true)}
      style={{ cursor: "pointer", backgroundColor: "#f9f9f9", padding: "4px", borderRadius: "4px" }}
    >
      {value || "Click to edit"}
    </p>
  );
}

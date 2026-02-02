import { useState, useEffect } from "react";

export default function EditableHeading({ value, onSave, isAdmin, level = 2 }) {
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

  const HeadingTag = `h${level}`;

  if (!isAdmin) return <HeadingTag>{value}</HeadingTag>;

  return editing ? (
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
      style={{
        fontSize: "1.5rem",
        fontWeight: "bold",
        padding: "6px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        width: "100%",
      }}
    />
  ) : (
    <HeadingTag
      onClick={() => setEditing(true)}
      style={{ cursor: "pointer", backgroundColor: "#f9f9f9", padding: "4px", borderRadius: "4px" }}
    >
      {value || "Click to edit heading"}
    </HeadingTag>
  );
}

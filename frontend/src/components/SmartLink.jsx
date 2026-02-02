import React from "react";

export default function SmartLink({ to, label, setRoute, setLoading }) {
  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      setRoute(to);
      setLoading(false);
    }, 600); // Simulated delay for loader effect
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "8px 12px",
        borderRadius: 6,
        color: "#111",
        background: "transparent",
        border: "none",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

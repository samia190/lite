import React from "react";

export default function AdminButton({ children, variant = "primary", onClick, type = "button", disabled = false, className = "", style = {}, ...props }) {
  const cls = `btn btn-${variant} ${className}`.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cls}
      style={{ opacity: disabled ? 0.6 : 1, ...style }}
      {...props}
    >
      {children}
    </button>
  );
}

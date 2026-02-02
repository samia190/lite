import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
      <input
        type="text"
        placeholder="Search site..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="form-input"
      />
      <button type="submit" className="btn">Search</button>
    </form>
  );
}

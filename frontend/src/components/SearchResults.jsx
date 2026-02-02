import React from "react";

export default function SearchResults() {
  const query = new URLSearchParams(window.location.search).get("q");

  return (
    <section>
      <h2>Search Results</h2>
      <p>Showing results for: <strong>{query}</strong></p>
      {/* You can later add fuzzy matching or filtering here */}
    </section>
  );
}

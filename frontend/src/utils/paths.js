export function safePath(p) {
  if (!p) return p;
  try {
    // Ensure forward slashes and encode URI components to avoid spaces/special chars issues
    const normalized = String(p).replace(/\\/g, "/");
    return encodeURI(normalized);
  } catch (e) {
    return p;
  }
}

import { safePath } from "../utils/paths";

function toWebp(src) {
  if (!src) return null;
  const s = String(src);
  const qIndex = s.indexOf("?");
  const base = qIndex >= 0 ? s.slice(0, qIndex) : s;
  const query = qIndex >= 0 ? s.slice(qIndex) : "";

  const lower = base.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png")) {
    return base.replace(/\.(jpe?g|png)$/i, ".webp") + query;
  }
  return null;
}

export default function SmartImage({
  src,
  alt = "",
  className,
  style,
  loading = "lazy",
  decoding = "async",
  fetchPriority,
  ...imgProps
}) {
  const webp = toWebp(src);

  if (!webp) {
    return (
      <img
        src={safePath(src)}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        {...imgProps}
      />
    );
  }

  return (
    <picture>
      <source type="image/webp" srcSet={safePath(webp)} />
      <img
        src={safePath(src)}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        {...imgProps}
      />
    </picture>
  );
}

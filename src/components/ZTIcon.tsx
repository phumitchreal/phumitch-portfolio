export default function ZTIcon({ size = 24, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  // Sticker avatar (zt-icon.avif, 192x192 square — 2x for a 96px box). The
  // `zt-icon` class in global.css swaps the blend mode per theme so the
  // artwork reads on dark AND light surfaces.
  return (
    <img
      src="/zt-icon.avif"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="eager"
      decoding="async"
      className={`zt-icon ${className}`}
      style={{ ...style, objectFit: "contain", display: "block" }}
      draggable={false}
    />
  );
}


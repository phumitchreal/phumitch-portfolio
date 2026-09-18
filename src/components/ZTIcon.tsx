export default function ZTIcon({ size = 24, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  // Use the exact PNG the user uploaded (zt-icon.png) for pixel-perfect match
  // Keep aspect ratio: original is ~ 800x480 (5:3)
  const height = (size * 480) / 800;
  return (
    <img
      src="/zt-icon.png"
      alt="ZT"
      width={size}
      height={height}
      className={className}
      style={{ ...style, objectFit: "contain", display: "block", mixBlendMode: "lighten" as const }}
      draggable={false}
    />
  );
}

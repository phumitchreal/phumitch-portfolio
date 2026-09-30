export default function ZTIcon({ size = 24, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  // Sticker avatar (zt-icon.png, 500x500 square). The `zt-icon` class in global.css
  // swaps the blend mode per theme so the artwork reads on dark AND light surfaces.
  return (
    <img
      src="/zt-icon.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`zt-icon ${className}`}
      style={{ ...style, objectFit: "contain", display: "block" }}
      draggable={false}
    />
  );
}


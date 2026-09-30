import fs from 'fs';

const iconUrl = 'https://cdn.discordapp.com/icons/1551900946211147827/7ba5c4daaa868a3eac98b2d2ccae029f.png?size=256';
const res = await fetch(iconUrl);
if (!res.ok) throw new Error('icon fetch failed ' + res.status);
const buf = Buffer.from(await res.arrayBuffer());
const b64 = buf.toString('base64');
const dataUri = `data:image/png;base64,${b64}`;
console.log('icon bytes', buf.length);

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#141416"/>
    </linearGradient>
    <linearGradient id="bannerGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2b2d31"/>
      <stop offset="100%" stop-color="#1e1f22"/>
    </linearGradient>
    <clipPath id="iconClip">
      <rect x="0" y="0" width="140" height="140" rx="32"/>
    </clipPath>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="20" stdDeviation="30" flood-color="#000" flood-opacity="0.6"/>
    </filter>
  </defs>
  <rect width="1200" height="630" rx="0" fill="url(#bg)"/>
  <text x="600" y="310" text-anchor="middle" font-family="Anton, Inter, sans-serif" font-size="140" font-weight="400" fill="#ffffff" opacity="0.03" letter-spacing="-0.04em">STUDIO.LOL</text>
  <g filter="url(#cardShadow)">
    <rect x="160" y="85" width="880" height="460" rx="28" fill="#232428" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
    <rect x="160" y="85" width="880" height="170" rx="28" fill="url(#bannerGrad)"/>
    <rect x="160" y="185" width="880" height="70" fill="#232428"/>
    <rect x="160" y="85" width="880" height="170" rx="28" fill="white" opacity="0.015"/>
  </g>
  <g transform="translate(220, 165)">
    <rect width="140" height="140" rx="32" fill="#111214" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
    <g clip-path="url(#iconClip)">
      <image href="${dataUri}" x="0" y="0" width="140" height="140" preserveAspectRatio="xMidYMid slice"/>
    </g>
  </g>
  <text x="400" y="272" font-family="Inter, Anuphan, sans-serif" font-size="38" font-weight="700" fill="#ffffff" letter-spacing="-0.02em">𝕾tudio.lol</text>
  <circle cx="400" cy="300" r="7" fill="#23a559"/>
  <text x="416" y="306" font-family="Inter, sans-serif" font-size="17" font-weight="500" fill="#b5bac1">3 Online</text>
  <circle cx="522" cy="300" r="7" fill="#80848e"/>
  <text x="538" y="306" font-family="Inter, sans-serif" font-size="17" font-weight="500" fill="#b5bac1">3 Members</text>
  <text x="400" y="332" font-family="JetBrains Mono, monospace" font-size="14" fill="#80848e" letter-spacing="0.06em">Est. Sep 2026</text>
  <rect x="220" y="360" width="760" height="1" fill="rgba(255,255,255,0.06)"/>
  <text x="220" y="390" font-family="Inter, sans-serif" font-size="15" fill="#949ba4">Hang out together — voice and text chat for the community</text>
  <rect x="220" y="420" width="760" height="64" rx="14" fill="#23a559"/>
  <text x="600" y="462" text-anchor="middle" font-family="Inter, sans-serif" font-size="22" font-weight="700" fill="#ffffff" letter-spacing="0.01em">Join</text>
  <text x="600" y="585" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" fill="#4e5058" letter-spacing="0.08em">phumitch.space/studio_lol → discord.gg/ADRNFfavHa</text>
</svg>
`;

fs.writeFileSync('public/studio-lol-og.svg', svg);
console.log('wrote svg', svg.length);

const sharp = (await import('sharp')).default;
await sharp(Buffer.from(svg)).png().toFile('public/studio-lol-og.png');
console.log('png created', fs.statSync('public/studio-lol-og.png').size);

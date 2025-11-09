const fs = require('fs');
const path = require('path');

// Icon sizes required for PWA
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, 'public', 'icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Generating PWA icons for Lexia with Bright Theme...\n');

// Generate SVG icons for each size
sizes.forEach((size) => {
  // Design parameters for the Lexia logo
  const padding = size * 0.2;
  const innerSize = size - (padding * 2);
  const strokeWidth = Math.max(2, size * 0.08);
  const dotRadius = Math.max(1.5, size * 0.04);

  // Create SVG with modern Lexia logo design - Bright Theme
  // Design: Stylized "L" with connected nodes representing language connectivity
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Bright background gradient -->
    <linearGradient id="bgGrad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F5F7FF;stop-opacity:1" />
    </linearGradient>

    <!-- Vibrant rainbow logo gradient: Coral-pink → Turquoise → Purple -->
    <linearGradient id="logoGrad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B9D;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#00D9FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#A855F7;stop-opacity:1" />
    </linearGradient>

    <!-- Soft shadow for depth -->
    <filter id="shadow${size}">
      <feDropShadow dx="0" dy="${Math.max(1, size * 0.02)}" stdDeviation="${size * 0.03}" flood-opacity="0.15"/>
    </filter>

    <!-- Vibrant glow effect -->
    <filter id="glow${size}">
      <feGaussianBlur stdDeviation="${Math.max(1, size * 0.02)}" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Bright background with subtle border -->
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="url(#bgGrad${size})" filter="url(#shadow${size})"/>
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="none" stroke="#E5E7EB" stroke-width="${Math.max(1, size * 0.01)}"/>

  <!-- Lexia Logo: Modern "L" with connectivity nodes -->
  <g transform="translate(${padding}, ${padding})" filter="url(#glow${size})">
    <!-- Main L shape with vibrant gradient -->
    <path d="M ${innerSize * 0.25} ${innerSize * 0.15}
             L ${innerSize * 0.25} ${innerSize * 0.85}
             L ${innerSize * 0.75} ${innerSize * 0.85}"
          stroke="url(#logoGrad${size})"
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"/>

    <!-- Connection nodes with bright colors -->
    <circle cx="${innerSize * 0.25}" cy="${innerSize * 0.15}" r="${dotRadius * 1.5}" fill="#FF6B9D"/>
    <circle cx="${innerSize * 0.25}" cy="${innerSize * 0.5}" r="${dotRadius}" fill="#00D9FF"/>
    <circle cx="${innerSize * 0.25}" cy="${innerSize * 0.85}" r="${dotRadius * 1.5}" fill="#A855F7"/>
    <circle cx="${innerSize * 0.75}" cy="${innerSize * 0.85}" r="${dotRadius * 1.5}" fill="#10D98E"/>

    <!-- Accent line (suggesting text/language) -->
    <path d="M ${innerSize * 0.45} ${innerSize * 0.3}
             L ${innerSize * 0.75} ${innerSize * 0.3}"
          stroke="#00D9FF"
          stroke-width="${strokeWidth * 0.5}"
          stroke-linecap="round"
          opacity="0.7"/>
  </g>
</svg>`;

  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, svg);
  console.log(`✓ Generated ${filename}`);
});

// Also create favicon.ico sizes
console.log('\n📱 Creating favicon files...\n');

[16, 32].forEach((size) => {
  const padding = size * 0.2;
  const innerSize = size - (padding * 2);
  const strokeWidth = Math.max(2, size * 0.08);
  const dotRadius = Math.max(1.5, size * 0.04);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F5F7FF;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="logoGrad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B9D;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#00D9FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#A855F7;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.floor(size * 0.18)}" fill="url(#bgGrad${size})"/>
  <rect width="${size}" height="${size}" rx="${Math.floor(size * 0.18)}" fill="none" stroke="#E5E7EB" stroke-width="1"/>
  <g transform="translate(${padding}, ${padding})">
    <path d="M ${innerSize * 0.25} ${innerSize * 0.15} L ${innerSize * 0.25} ${innerSize * 0.85} L ${innerSize * 0.75} ${innerSize * 0.85}"
          stroke="url(#logoGrad${size})" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="${innerSize * 0.25}" cy="${innerSize * 0.15}" r="${dotRadius * 1.5}" fill="#FF6B9D"/>
    <circle cx="${innerSize * 0.25}" cy="${innerSize * 0.5}" r="${dotRadius}" fill="#00D9FF"/>
    <circle cx="${innerSize * 0.25}" cy="${innerSize * 0.85}" r="${dotRadius * 1.5}" fill="#A855F7"/>
    <circle cx="${innerSize * 0.75}" cy="${innerSize * 0.85}" r="${dotRadius * 1.5}" fill="#10D98E"/>
    <path d="M ${innerSize * 0.45} ${innerSize * 0.3} L ${innerSize * 0.75} ${innerSize * 0.3}"
          stroke="#00D9FF" stroke-width="${strokeWidth * 0.5}" stroke-linecap="round" opacity="0.7"/>
  </g>
</svg>`;

  const filename = `favicon-${size}x${size}.svg`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, svg);
  console.log(`✓ Generated ${filename}`);
});

// Create apple-touch-icon
const appleSize = 180;
const applePadding = appleSize * 0.2;
const appleInnerSize = appleSize - (applePadding * 2);
const appleStrokeWidth = Math.max(2, appleSize * 0.08);
const appleDotRadius = Math.max(1.5, appleSize * 0.04);

const appleSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${appleSize}" height="${appleSize}" viewBox="0 0 ${appleSize} ${appleSize}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad${appleSize}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F5F7FF;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="logoGrad${appleSize}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B9D;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#00D9FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#A855F7;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow${appleSize}">
      <feDropShadow dx="0" dy="${Math.max(1, appleSize * 0.02)}" stdDeviation="${appleSize * 0.03}" flood-opacity="0.15"/>
    </filter>
    <filter id="glow${appleSize}">
      <feGaussianBlur stdDeviation="${Math.max(1, appleSize * 0.02)}" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${appleSize}" height="${appleSize}" rx="${appleSize * 0.18}" fill="url(#bgGrad${appleSize})" filter="url(#shadow${appleSize})"/>
  <rect width="${appleSize}" height="${appleSize}" rx="${appleSize * 0.18}" fill="none" stroke="#E5E7EB" stroke-width="2"/>
  <g transform="translate(${applePadding}, ${applePadding})" filter="url(#glow${appleSize})">
    <path d="M ${appleInnerSize * 0.25} ${appleInnerSize * 0.15}
             L ${appleInnerSize * 0.25} ${appleInnerSize * 0.85}
             L ${appleInnerSize * 0.75} ${appleInnerSize * 0.85}"
          stroke="url(#logoGrad${appleSize})"
          stroke-width="${appleStrokeWidth}"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"/>
    <circle cx="${appleInnerSize * 0.25}" cy="${appleInnerSize * 0.15}" r="${appleDotRadius * 1.5}" fill="#FF6B9D"/>
    <circle cx="${appleInnerSize * 0.25}" cy="${appleInnerSize * 0.5}" r="${appleDotRadius}" fill="#00D9FF"/>
    <circle cx="${appleInnerSize * 0.25}" cy="${appleInnerSize * 0.85}" r="${appleDotRadius * 1.5}" fill="#A855F7"/>
    <circle cx="${appleInnerSize * 0.75}" cy="${appleInnerSize * 0.85}" r="${appleDotRadius * 1.5}" fill="#10D98E"/>
    <path d="M ${appleInnerSize * 0.45} ${appleInnerSize * 0.3}
             L ${appleInnerSize * 0.75} ${appleInnerSize * 0.3}"
          stroke="#00D9FF"
          stroke-width="${appleStrokeWidth * 0.5}"
          stroke-linecap="round"
          opacity="0.7"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(outputDir, 'apple-touch-icon.svg'), appleSvg);
console.log(`✓ Generated apple-touch-icon.svg`);

console.log('\n✨ Icon generation complete!');
console.log(`\n📂 Icons created in: ${outputDir}`);
console.log(`📊 Total icons: ${sizes.length + 3} files`);
console.log('\n🎨 Bright Theme Colors:');
console.log('   • Background: Light gradient (white to soft blue)');
console.log('   • Logo: Rainbow gradient (coral-pink → turquoise → purple)');
console.log('   • Nodes: Coral-pink, turquoise, purple, mint green');
console.log('\n💡 These icons match the elegant bright theme of Lexia!\n');

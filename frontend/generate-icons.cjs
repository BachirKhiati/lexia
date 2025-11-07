const fs = require('fs');
const path = require('path');

// Icon sizes required for PWA
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, 'public', 'icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Generating PWA icons for Lexia...\n');

// Generate SVG icons for each size
sizes.forEach((size) => {
  // Design parameters for the Lexia logo
  const padding = size * 0.2;
  const innerSize = size - (padding * 2);
  const strokeWidth = Math.max(2, size * 0.08);
  const dotRadius = Math.max(1.5, size * 0.04);

  // Create SVG with modern Lexia logo design
  // Design: Stylized "L" with connected nodes representing language connectivity
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="logoGrad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#06b6d4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
    <filter id="glow${size}">
      <feGaussianBlur stdDeviation="${Math.max(1, size * 0.015)}" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="url(#bgGrad${size})"/>

  <!-- Lexia Logo: Modern "L" with connectivity nodes -->
  <g transform="translate(${padding}, ${padding})" filter="url(#glow${size})">
    <!-- Main L shape -->
    <path d="M ${innerSize * 0.25} ${innerSize * 0.15}
             L ${innerSize * 0.25} ${innerSize * 0.85}
             L ${innerSize * 0.75} ${innerSize * 0.85}"
          stroke="url(#logoGrad${size})"
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"/>

    <!-- Connection nodes (representing language connectivity) -->
    <circle cx="${innerSize * 0.25}" cy="${innerSize * 0.15}" r="${dotRadius * 1.5}" fill="#10b981"/>
    <circle cx="${innerSize * 0.25}" cy="${innerSize * 0.5}" r="${dotRadius}" fill="#06b6d4"/>
    <circle cx="${innerSize * 0.25}" cy="${innerSize * 0.85}" r="${dotRadius * 1.5}" fill="#8b5cf6"/>
    <circle cx="${innerSize * 0.75}" cy="${innerSize * 0.85}" r="${dotRadius * 1.5}" fill="#10b981"/>

    <!-- Accent line (suggesting text/language) -->
    <path d="M ${innerSize * 0.45} ${innerSize * 0.3}
             L ${innerSize * 0.75} ${innerSize * 0.3}"
          stroke="#06b6d4"
          stroke-width="${strokeWidth * 0.5}"
          stroke-linecap="round"
          opacity="0.6"/>
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
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="logoGrad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#06b6d4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.floor(size * 0.18)}" fill="url(#bgGrad${size})"/>
  <g transform="translate(${padding}, ${padding})">
    <path d="M ${innerSize * 0.25} ${innerSize * 0.15} L ${innerSize * 0.25} ${innerSize * 0.85} L ${innerSize * 0.75} ${innerSize * 0.85}"
          stroke="url(#logoGrad${size})" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="${innerSize * 0.25}" cy="${innerSize * 0.15}" r="${dotRadius * 1.5}" fill="#10b981"/>
    <circle cx="${innerSize * 0.25}" cy="${innerSize * 0.5}" r="${dotRadius}" fill="#06b6d4"/>
    <circle cx="${innerSize * 0.25}" cy="${innerSize * 0.85}" r="${dotRadius * 1.5}" fill="#8b5cf6"/>
    <circle cx="${innerSize * 0.75}" cy="${innerSize * 0.85}" r="${dotRadius * 1.5}" fill="#10b981"/>
    <path d="M ${innerSize * 0.45} ${innerSize * 0.3} L ${innerSize * 0.75} ${innerSize * 0.3}"
          stroke="#06b6d4" stroke-width="${strokeWidth * 0.5}" stroke-linecap="round" opacity="0.6"/>
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
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="logoGrad${appleSize}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#06b6d4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
    <filter id="glow${appleSize}">
      <feGaussianBlur stdDeviation="${Math.max(1, appleSize * 0.015)}" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${appleSize}" height="${appleSize}" rx="${appleSize * 0.18}" fill="url(#bgGrad${appleSize})"/>
  <g transform="translate(${applePadding}, ${applePadding})" filter="url(#glow${appleSize})">
    <path d="M ${appleInnerSize * 0.25} ${appleInnerSize * 0.15}
             L ${appleInnerSize * 0.25} ${appleInnerSize * 0.85}
             L ${appleInnerSize * 0.75} ${appleInnerSize * 0.85}"
          stroke="url(#logoGrad${appleSize})"
          stroke-width="${appleStrokeWidth}"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"/>
    <circle cx="${appleInnerSize * 0.25}" cy="${appleInnerSize * 0.15}" r="${appleDotRadius * 1.5}" fill="#10b981"/>
    <circle cx="${appleInnerSize * 0.25}" cy="${appleInnerSize * 0.5}" r="${appleDotRadius}" fill="#06b6d4"/>
    <circle cx="${appleInnerSize * 0.25}" cy="${appleInnerSize * 0.85}" r="${appleDotRadius * 1.5}" fill="#8b5cf6"/>
    <circle cx="${appleInnerSize * 0.75}" cy="${appleInnerSize * 0.85}" r="${appleDotRadius * 1.5}" fill="#10b981"/>
    <path d="M ${appleInnerSize * 0.45} ${appleInnerSize * 0.3}
             L ${appleInnerSize * 0.75} ${appleInnerSize * 0.3}"
          stroke="#06b6d4"
          stroke-width="${appleStrokeWidth * 0.5}"
          stroke-linecap="round"
          opacity="0.6"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(outputDir, 'apple-touch-icon.svg'), appleSvg);
console.log(`✓ Generated apple-touch-icon.svg`);

console.log('\n✨ Icon generation complete!');
console.log(`\n📂 Icons created in: ${outputDir}`);
console.log(`📊 Total icons: ${sizes.length + 3} files`);
console.log('\n💡 Note: These are SVG placeholders. For production, consider using PNG files.');
console.log('   You can convert these to PNG using ImageMagick or sharp library.\n');

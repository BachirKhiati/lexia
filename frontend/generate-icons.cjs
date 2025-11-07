const fs = require('fs');
const path = require('path');

// Icon sizes required for PWA
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, 'public', 'icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Generating PWA icons for Synapse...\n');

// Generate SVG icons for each size
sizes.forEach((size) => {
  const fontSize = Math.floor(size * 0.55);
  const textY = Math.floor(size * 0.68);

  // Create SVG with gradient background and "S" letter
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow${size}">
      <feDropShadow dx="0" dy="${Math.max(1, size * 0.02)}" stdDeviation="${size * 0.02}" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad${size})"/>
  <text x="50%" y="${textY}" text-anchor="middle" fill="white" font-size="${fontSize}" font-weight="bold" font-family="Arial, sans-serif" filter="url(#shadow${size})">S</text>
</svg>`;

  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, svg);
  console.log(`✓ Generated ${filename}`);
});

// Also create favicon.ico sizes
console.log('\n📱 Creating favicon files...\n');

[16, 32].forEach((size) => {
  const fontSize = Math.floor(size * 0.55);
  const textY = Math.floor(size * 0.68);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.floor(size * 0.15)}" fill="url(#grad${size})"/>
  <text x="50%" y="${textY}" text-anchor="middle" fill="white" font-size="${fontSize}" font-weight="bold" font-family="Arial, sans-serif">S</text>
</svg>`;

  const filename = `favicon-${size}x${size}.svg`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, svg);
  console.log(`✓ Generated ${filename}`);
});

// Create apple-touch-icon
const appleSize = 180;
const appleFontSize = Math.floor(appleSize * 0.55);
const appleTextY = Math.floor(appleSize * 0.68);

const appleSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${appleSize}" height="${appleSize}" viewBox="0 0 ${appleSize} ${appleSize}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${appleSize}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow${appleSize}">
      <feDropShadow dx="0" dy="${Math.max(1, appleSize * 0.02)}" stdDeviation="${appleSize * 0.02}" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="${appleSize}" height="${appleSize}" rx="${appleSize * 0.15}" fill="url(#grad${appleSize})"/>
  <text x="50%" y="${appleTextY}" text-anchor="middle" fill="white" font-size="${appleFontSize}" font-weight="bold" font-family="Arial, sans-serif" filter="url(#shadow${appleSize})">S</text>
</svg>`;

fs.writeFileSync(path.join(outputDir, 'apple-touch-icon.svg'), appleSvg);
console.log(`✓ Generated apple-touch-icon.svg`);

console.log('\n✨ Icon generation complete!');
console.log(`\n📂 Icons created in: ${outputDir}`);
console.log(`📊 Total icons: ${sizes.length + 3} files`);
console.log('\n💡 Note: These are SVG placeholders. For production, consider using PNG files.');
console.log('   You can convert these to PNG using ImageMagick or sharp library.\n');

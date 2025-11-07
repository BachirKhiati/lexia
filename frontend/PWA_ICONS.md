# PWA Icon Generation Guide

This guide explains how to generate all the required icon sizes for the Synapse PWA.

## Required Icon Sizes

The PWA manifest requires the following icon sizes:
- 16x16 (favicon)
- 32x32 (favicon)
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192 (minimum for PWA)
- 384x384
- 512x512 (required for PWA)

## Quick Generation Methods

### Method 1: Using ImageMagick (Recommended)

If you have ImageMagick installed:

```bash
# Navigate to frontend/public/icons directory
cd frontend/public/icons

# From a source image (e.g., logo.png at 1024x1024)
for size in 16 32 72 96 128 144 152 192 384 512; do
  convert logo-source.png -resize ${size}x${size} icon-${size}x${size}.png
done
```

### Method 2: Using Online Tools

1. **Favicon Generator** (https://realfavicongenerator.net/)
   - Upload your source image (at least 512x512)
   - Configure PWA settings
   - Download and extract to `frontend/public/icons/`

2. **PWA Asset Generator** (https://www.pwabuilder.com/)
   - Upload your logo
   - Generate all icon sizes
   - Download and place in `frontend/public/icons/`

### Method 3: Using Node.js Script

Install the `sharp` package:

```bash
npm install --save-dev sharp
```

Create `generate-icons.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const inputImage = './logo-source.png';
const outputDir = './public/icons';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate icons
sizes.forEach((size) => {
  sharp(inputImage)
    .resize(size, size)
    .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
    .then(() => console.log(`✓ Generated icon-${size}x${size}.png`))
    .catch((err) => console.error(`✗ Failed to generate ${size}x${size}:`, err));
});

console.log('Generating PWA icons...');
```

Run it:

```bash
node generate-icons.js
```

## Design Guidelines

### Source Image Requirements

1. **Minimum Size**: 512x512 pixels (1024x1024 recommended for best quality)
2. **Format**: PNG with transparency
3. **Safe Zone**: Keep important content within central 80% of the icon
4. **Maskable Icons**: For 192x192 and 512x512, ensure critical content is in the center 40%

### Maskable Icons

For Android adaptive icons, create maskable versions:

```bash
# Add extra padding for maskable icons
convert logo-source.png -gravity center -background transparent \
  -extent 140% icon-192x192-maskable.png
convert icon-192x192-maskable.png -resize 192x192 icon-192x192-maskable.png

convert logo-source.png -gravity center -background transparent \
  -extent 140% icon-512x512-maskable.png
convert icon-512x512-maskable.png -resize 512x512 icon-512x512-maskable.png
```

## Temporary Placeholder

If you don't have a logo yet, you can create a simple colored icon:

```bash
# Create a green circle placeholder
for size in 16 32 72 96 128 144 152 192 384 512; do
  convert -size ${size}x${size} xc:none \
    -draw "fill #10b981 circle $((size/2)),$((size/2)) $((size/2)),0" \
    icon-${size}x${size}.png
done
```

Or use this SVG-to-PNG approach:

```bash
# Create an SVG file first (icon.svg)
cat > icon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="#10b981"/>
  <text x="50" y="65" font-size="40" text-anchor="middle" fill="white" font-weight="bold">S</text>
</svg>
EOF

# Convert to all sizes
for size in 16 32 72 96 128 144 152 192 384 512; do
  convert icon.svg -resize ${size}x${size} icon-${size}x${size}.png
done
```

## Verification

After generating icons, verify them:

1. **Check file sizes**: Icons should be reasonably small (< 50KB each)
2. **Visual inspection**: Open each icon to ensure quality
3. **Manifest validation**: Use Chrome DevTools > Application > Manifest
4. **Lighthouse audit**: Run PWA audit to verify icon compliance

## Testing PWA Icons

1. **Chrome DevTools**:
   ```
   DevTools > Application > Manifest
   ```
   Check that all icons are listed and loadable

2. **Install on Android**:
   - Open Chrome on Android
   - Navigate to your app
   - Menu > Add to Home Screen
   - Check icon on home screen

3. **Install on iOS**:
   - Open Safari
   - Share button > Add to Home Screen
   - Check icon on home screen

## Optimization

Optimize PNGs to reduce file size:

```bash
# Using pngquant
for file in icons/*.png; do
  pngquant --quality=65-80 --ext .png --force "$file"
done

# Using optipng
for file in icons/*.png; do
  optipng -o7 "$file"
done
```

## Quick Start (Placeholder Icons)

If you just want to get started quickly:

```bash
mkdir -p frontend/public/icons

# Download a free icon or use a solid color
cd frontend/public/icons

# Create quick placeholders with Node.js
node -e "
const fs = require('fs');
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach(size => {
  const svg = \`<svg width='\${size}' height='\${size}' xmlns='http://www.w3.org/2000/svg'><rect width='\${size}' height='\${size}' fill='#10b981'/><text x='50%' y='50%' text-anchor='middle' dy='.3em' fill='white' font-size='\${size*0.5}' font-weight='bold'>S</text></svg>\`;
  fs.writeFileSync(\`icon-\${size}x\${size}.svg\`, svg);
  console.log(\`Created icon-\${size}x\${size}.svg\`);
});
"
```

## Resources

- [Web.dev PWA Icons](https://web.dev/add-manifest/#icons)
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [Maskable Icons Editor](https://maskable.app/editor)
- [Favicon Generator](https://realfavicongenerator.net/)

## Notes

- The current manifest points to `/icons/icon-*x*.png`
- Make sure icons are in `frontend/public/icons/` directory
- Icons will be served from `/icons/` in production
- Test on multiple devices for best results

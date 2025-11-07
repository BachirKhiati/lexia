# Synapse PWA Icons

This directory contains all the icons required for the Synapse Progressive Web App (PWA).

## Generated Icons

All icons are in SVG format for perfect scaling and small file size:

- `icon-16x16.svg` to `icon-512x512.svg` - PWA app icons
- `favicon-16x16.svg`, `favicon-32x32.svg` - Browser favicons
- `apple-touch-icon.svg` - iOS home screen icon (180x180)

## Design

The icons feature:
- **Gradient background**: #10b981 to #059669 (emerald green)
- **Letter "S"**: White, bold, centered - represents Synapse
- **Rounded corners**: 15% border radius for modern look
- **Drop shadow**: Subtle shadow on larger icons for depth

## Format

SVG format was chosen for:
- Perfect scaling at any size
- Small file size (~700 bytes each)
- Modern browser support
- Easy to customize colors/styles

## Regeneration

To regenerate icons with different design:

1. Edit `frontend/generate-icons.cjs`
2. Run: `node generate-icons.cjs`
3. Icons will be recreated in this directory

## Production Conversion

For maximum compatibility, you may want to convert to PNG:

```bash
# Using ImageMagick
for file in icon-*.svg; do
  convert "$file" "${file%.svg}.png"
done
```

## Browser Compatibility

- **Modern browsers**: SVG icons work perfectly
- **Older browsers**: Consider adding PNG fallbacks
- **iOS Safari**: Supports SVG in apple-touch-icon
- **Android Chrome**: Full PWA support with SVG

## Testing

Test PWA icons:
1. Chrome DevTools > Application > Manifest
2. Install PWA on Android/iOS
3. Check home screen icon appearance

---

**Generated**: November 2025
**Tool**: `generate-icons.cjs`
**Brand color**: #10b981 (Synapse Green)

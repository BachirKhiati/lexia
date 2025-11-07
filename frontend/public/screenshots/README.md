# PWA Screenshots Guide

The PWA manifest references screenshots to showcase the app in installation prompts and app stores.

## Required Screenshots

According to the manifest, we need:

1. **Desktop/Wide** (`dashboard.png`):
   - Size: 1280x720
   - Form factor: "wide"
   - Shows: Dashboard with word cards and analytics

2. **Mobile/Narrow** (`mobile.png`):
   - Size: 750x1334
   - Form factor: "narrow"
   - Shows: Mobile view of main features

## How to Create Screenshots

### Method 1: Manual Screenshots

1. **Run the app in development**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Desktop screenshot**:
   - Open Chrome at 1280x720 viewport
   - Navigate to dashboard
   - DevTools > Screenshot (or Cmd/Ctrl+Shift+P > "Capture screenshot")
   - Save as `dashboard.png`

3. **Mobile screenshot**:
   - Open Chrome DevTools (F12)
   - Toggle device toolbar (Cmd/Ctrl+Shift+M)
   - Select iPhone 8 Plus (414x736) or similar
   - Navigate to dashboard
   - Take screenshot
   - Save as `mobile.png`

### Method 2: Automated with Playwright/Puppeteer

```javascript
const { chromium } = require('playwright');

async function captureScreenshots() {
  const browser = await chromium.launch();

  // Desktop screenshot
  const desktopPage = await browser.newPage({
    viewport: { width: 1280, height: 720 }
  });
  await desktopPage.goto('http://localhost:5173');
  await desktopPage.screenshot({ path: 'screenshots/dashboard.png' });

  // Mobile screenshot
  const mobilePage = await browser.newPage({
    viewport: { width: 750, height: 1334 }
  });
  await mobilePage.goto('http://localhost:5173');
  await mobilePage.screenshot({ path: 'screenshots/mobile.png' });

  await browser.close();
}

captureScreenshots();
```

### Method 3: Figma/Design Tool

If you have designs in Figma or other tools:
1. Export artboards at exact dimensions
2. Ensure they show realistic app content
3. Save with correct filenames

## Screenshot Guidelines

### Content
- **Show real functionality**: Don't use placeholder content
- **Highlight key features**: Analytics, quests, mind map
- **Use good sample data**: Finnish words, completed quests
- **Show value**: Make it clear what the app does

### Technical
- **PNG format**: Best quality, transparency support
- **Exact dimensions**: Follow manifest requirements
- **Optimize**: Compress images (80-90% quality)
- **Localization**: Consider multiple languages

### Design
- **Clean UI**: No debugging overlays
- **Good lighting**: Clear, readable
- **Brand consistent**: Use Synapse colors
- **Mobile-first**: Show mobile version prominently

## Placeholder Creation

For now, you can create simple placeholder images:

```bash
# Using ImageMagick
convert -size 1280x720 xc:#0f172a \
  -fill #10b981 -font Arial-Bold -pointsize 48 \
  -gravity center -annotate +0+0 "Synapse\nDashboard" \
  dashboard.png

convert -size 750x1334 xc:#0f172a \
  -fill #10b981 -font Arial-Bold -pointsize 36 \
  -gravity center -annotate +0+0 "Synapse\nMobile App" \
  mobile.png
```

## Validation

After creating screenshots:

1. **File size**: Keep under 1MB each
2. **Dimensions**: Verify exact sizes
3. **Content**: Check readability and clarity
4. **Manifest**: Verify paths in `manifest.json`
5. **Lighthouse**: Run PWA audit

## Testing

Test how screenshots appear:
1. Chrome DevTools > Application > Manifest
2. Install PWA on Android
3. Check "Add to Home Screen" prompt
4. Verify appearance in app listing

## Production Checklist

- [ ] Create desktop screenshot (1280x720)
- [ ] Create mobile screenshot (750x1334)
- [ ] Optimize images (< 500KB each)
- [ ] Verify paths in manifest.json
- [ ] Test installation prompt appearance
- [ ] Add additional screenshots if needed

---

**Note**: Currently, screenshot files don't exist. The manifest references them, but they're optional for PWA functionality. Create them before production deployment to improve installation experience.

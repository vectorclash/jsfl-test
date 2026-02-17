# Banner Text Builder for Adobe Animate

A JSFL automation script that reads a JSON file and builds an animated, flowing text layout inside Adobe Animate. It creates stacked text blocks (eyebrow, headline, subhead) with a pill-shaped CTA button — each element animated with staggered slide-in and fade effects.

## Project Structure

```
├── buildFromJSON.jsfl    # Main script — run this from Animate
├── banner-data.json      # Text content (edit per banner)
├── FLA/                  # Animate document templates
│   ├── 300x250.fla
│   └── 300x600.fla
└── OUTPUT/               # Export destination
    ├── 300x250/
    └── 300x600/
```

## Quick Start

### 1. Update the JSON path

Open `buildFromJSON.jsfl` and set `CONFIG.jsonPath` to the absolute path of your `banner-data.json` using the `file:///` URI format:

**Mac:**
```
jsonPath: "file:///Users/yourname/Desktop/jsfl-test/banner-data.json"
```

**Windows** (use `|` instead of `:` after the drive letter):
```
jsonPath: "file:///C|/Users/yourname/Desktop/jsfl-test/banner-data.json"
```

### 2. Edit your JSON

Open `banner-data.json` and set your text content. Use `\n` for line breaks. Set any field to `null` or `""` to skip it.

```json
{
  "eyebrow": "LIMITED TIME OFFER",
  "headline": "Save Big This\nSummer",
  "subhead": "Get up to 50% off select styles through July 31.",
  "cta": "Shop Now"
}
```

### 3. Run the script

1. Open a `.fla` file in Adobe Animate (or use one from `FLA/`)
2. Navigate to the layer and frame where you want the layout placed
3. Run the script: **Commands > Run Command...** and select `buildFromJSON.jsfl`

The script creates all text elements, a CTA button, dedicated layers, and the full animation timeline automatically.

## Configuration

All settings live in the `CONFIG` object at the top of `buildFromJSON.jsfl`.

### Layout

```js
layout: {
    x: 30,           // left edge of text area
    y: 30,           // starting Y position
    maxWidth: 260    // text fields wrap at this width
}
```

### Spacing

Vertical gap (in pixels) after each text block:

```js
spacing: {
    afterEyebrow: 8,
    afterHeadline: 10,
    afterSubhead: 20
}
```

### Typography

Each field has its own style block with font, size, weight, color, and spacing:

```js
styles: {
    eyebrow:  { font: "Arial", size: 14, style: "bold",   color: "#FFFFFF", letterSpacing: 2, lineSpacing: 2 },
    headline: { font: "Arial", size: 36, style: "bold",   color: "#FFFFFF", letterSpacing: 0, lineSpacing: 4 },
    subhead:  { font: "Arial", size: 14, style: "",       color: "#FFFFFF", letterSpacing: 0, lineSpacing: 4 },
    cta:      { font: "Arial", size: 12, style: "bold",   color: "#FFFFFF", letterSpacing: 1, lineSpacing: 0 }
}
```

The `style` field accepts `"bold"`, `"italic"`, `"boldItalic"`, or `""` for regular.

### CTA Button

```js
ctaButton: {
    paddingH: 24,            // horizontal padding
    paddingV: 10,            // vertical padding
    fillColor: "#0057B8",    // bubble background color
    cornerRadius: 50,        // high value = pill shape
    convertToSymbol: true    // wraps text + bubble into a MovieClip named "cta_button"
}
```

### Animation

```js
animation: {
    tweenSeconds: 0.75,    // duration of each tween
    staggerDelay: 6,       // frames between each element's start
    holdFrames: 24,        // frames to hold after last animation
    slideOffset: 200,      // pixels elements slide in from
    easeStrength: -80      // negative = ease out
}
```

Text elements slide in from off-stage with a Circ Out ease curve. The CTA fades in with an alpha tween.

## How It Works

1. **Parse** — A built-in JSON parser reads `banner-data.json` (JSFL has no native `JSON.parse()`)
2. **Measure & split** — Text is measured against `maxWidth` and split into individual lines using a temporary text field
3. **Create layers** — One layer per text line for independent animation control
4. **Place elements** — Text fields are styled and positioned; the CTA gets a rounded-rectangle bubble behind it, both wrapped in a MovieClip
5. **Animate** — Classic tweens are applied with staggered start frames, custom ease curves, and alpha fades

Progress is logged to Animate's Output panel throughout.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Could not read JSON file" | Verify `CONFIG.jsonPath` uses the `file:///` format and the path is correct |
| Text looks unstyled | Font name must match exactly what Animate shows (e.g., `"Arial Black"` not `"ArialBlack"`) |
| CTA bubble is offset | Adjust `paddingH` / `paddingV` values in `ctaButton` config |
| Script does nothing | Make sure a document is open and you're on a valid layer/frame |

## Requirements

- Adobe Animate (any version with JSFL support)
- No external dependencies — pure JSFL

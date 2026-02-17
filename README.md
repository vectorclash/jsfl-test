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

### 1. Place your JSON file

Put `banner-data.json` in the same folder as `buildFromJSON.jsfl`. The script automatically finds it using `fl.scriptURI` — no need to set an absolute path.

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
    afterEyebrow: 2,
    afterHeadline: 2,
    afterSubhead: 20
}
```

### Typography

Each field has its own style block with font, size, weight, color, and spacing:

```js
styles: {
    eyebrow:  { font: "Arial", size: 14, style: "",       color: "#FFFFFF", letterSpacing: 0, lineSpacing: 0 },
    headline: { font: "Arial", size: 36, style: "bold",   color: "#FFFFFF", letterSpacing: -2, lineSpacing: -4 },
    subhead:  { font: "Arial", size: 14, style: "",       color: "#FFFFFF", letterSpacing: 0, lineSpacing: 0 },
    cta:      { font: "Arial", size: 12, style: "bold",   color: "#FFFFFF", letterSpacing: 0, lineSpacing: 0 }
}
```

- `style` accepts `"bold"`, `"italic"`, `"boldItalic"`, or `""` for regular
- `lineSpacing` controls the gap between split lines within a text block. Supports negative values (e.g., `-8`) to tighten lines beyond the default text field padding
- `letterSpacing` adjusts tracking between characters

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
    tweenSeconds: 0.75,          // duration of each tween
    staggerDelay: 3,             // frames between each element's start
    holdFrames: 24,              // frames to hold after last animation
    slideEase: EASE.outCirc,     // ease curve for slide-in elements
    fadeEase: EASE.outQuad       // ease curve for fade-in elements (CTA)
}
```

Text elements slide in from off-stage with a configurable ease curve. The CTA fades in with an alpha tween using its own separate ease.

## Easing Presets

The script includes a full library of standard easing curves in the `EASE` object. Set `slideEase` or `fadeEase` in CONFIG to any of these:

| Family | In | Out | InOut |
|--------|----|-----|-------|
| **Sine** | `EASE.inSine` | `EASE.outSine` | `EASE.inOutSine` |
| **Quad** | `EASE.inQuad` | `EASE.outQuad` | `EASE.inOutQuad` |
| **Cubic** | `EASE.inCubic` | `EASE.outCubic` | `EASE.inOutCubic` |
| **Quart** | `EASE.inQuart` | `EASE.outQuart` | `EASE.inOutQuart` |
| **Quint** | `EASE.inQuint` | `EASE.outQuint` | `EASE.inOutQuint` |
| **Circ** | `EASE.inCirc` | `EASE.outCirc` | `EASE.inOutCirc` |
| **Expo** | `EASE.inExpo` | `EASE.outExpo` | `EASE.inOutExpo` |
| **Back** | `EASE.inBack` | `EASE.outBack` | `EASE.inOutBack` |
| **Elastic** | `EASE.inElastic` | `EASE.outElastic` | `EASE.inOutElastic` |

There's also `EASE.linear` for no easing.

These are defined as cubic bezier control point arrays compatible with Animate's `setCustomEase()` API. The Elastic presets use multi-point curves to approximate the oscillation behavior. JSFL does not expose Animate's named ease presets, so custom control points are the only way to get specific curves.

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
| "Could not read JSON file" | Make sure `banner-data.json` is in the same folder as `buildFromJSON.jsfl` |
| Text looks unstyled | Font name must match exactly what Animate shows (e.g., `"Arial Black"` not `"ArialBlack"`) |
| CTA bubble is offset | Adjust `paddingH` / `paddingV` values in `ctaButton` config |
| Script does nothing | Make sure a document is open and you're on a valid layer/frame |
| Lines too far apart | Use negative `lineSpacing` values (e.g., `-8`) to tighten line gaps |

## Requirements

- Adobe Animate (any version with JSFL support)
- No external dependencies — pure JSFL

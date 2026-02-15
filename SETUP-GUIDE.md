url to json: /Users/aaronsterczewski/Desktop/jsfl-test/banner-data.json

# Banner Text Builder — JSFL Setup Guide

## What You Get

A JSFL script that reads a JSON file and automatically builds a flowing text layout inside Adobe Animate with:

- **Eyebrow** — small caps / label text at the top
- **Headline** — large primary text
- **Subhead** — smaller supporting copy
- **CTA Button** — text inside a pill-shaped bubble, converted to a MovieClip

Each text block stacks vertically with configurable spacing, and the CTA bubble auto-sizes to fit whatever text you give it.

---

## Files

| File | Purpose |
|------|---------|
| `buildFromJSON.jsfl` | The main script — run this from Animate |
| `banner-data.json` | Your text content (edit this per banner) |

---

## Setup Steps

### 1. Place the files

Put both files somewhere accessible. Your Desktop works fine:

- **Mac:** `/Users/yourname/Desktop/`
- **Windows:** `C:\Users\yourname\Desktop\`

### 2. Update the JSON path in the script

Open `buildFromJSON.jsfl` in a text editor and find the `CONFIG.jsonPath` line near the top. Change it to point at your `banner-data.json` file using Animate's `file:///` URI format:

**Mac:**
```
jsonPath: "file:///Users/yourname/Desktop/banner-data.json"
```

**Windows** (note the `|` instead of `:` after the drive letter):
```
jsonPath: "file:///C|/Users/yourname/Desktop/banner-data.json"
```

### 3. Edit your JSON

Open `banner-data.json` and change the text values. Use `\n` for line breaks:

```json
{
  "eyebrow": "LIMITED TIME OFFER",
  "headline": "Save Big This\nSummer",
  "subhead": "Get up to 50% off select styles through July 31.",
  "cta": "Shop Now"
}
```

Any field can be set to `null` or `""` to skip it.

### 4. Open or create your Animate document

Open the `.fla` where you want the text placed. The script operates on whichever layer and frame are currently selected, so navigate to the right spot first.

### 5. Run the script

In Animate: **Commands → Run Command…** → select `buildFromJSON.jsfl`

Or drag the `.jsfl` file directly onto Animate's stage.

---

## Customization

Everything is controlled through the `CONFIG` object at the top of the JSFL file:

### Layout positioning

```javascript
layout: {
    x: 30,           // left edge of text area
    y: 30,           // starting Y position
    maxWidth: 260    // max width for text fields (they'll wrap)
}
```

### Spacing between blocks

```javascript
spacing: {
    afterEyebrow: 8,
    afterHeadline: 10,
    afterSubhead: 20   // bigger gap before the CTA
}
```

### Typography per field

Each field (eyebrow, headline, subhead, cta) has its own style block:

```javascript
headline: {
    font: "Arial",
    size: 28,
    style: "bold",        // "bold", "italic", "boldItalic", or ""
    color: "#000000",
    letterSpacing: 0,
    lineSpacing: 4
}
```

### CTA button appearance

```javascript
ctaButton: {
    paddingH: 24,            // horizontal padding
    paddingV: 10,            // vertical padding
    fillColor: "#0066FF",    // bubble background color
    cornerRadius: 50,        // high value = pill shape
    convertToSymbol: true    // wraps text+bubble into a MovieClip named "cta_button"
}
```

---

## How It Works (Under the Hood)

1. **JSON parsing** — Since JSFL doesn't have `JSON.parse()`, the script includes a lightweight parser that handles strings, numbers, booleans, nulls, objects, and arrays. It's safe for any well-formed JSON.

2. **Text creation** — Each field is created with `document.addNewText()`, then styled via `element.setTextAttr()`. The field is set to `autoExpand = true` so it sizes to fit content, and the measured `height` is used to calculate where the next block goes.

3. **CTA bubble** — The CTA text is created first to get its dimensions. Then a rounded rectangle is drawn behind it using `document.addNewRectangle()` with padding added. The bubble is sent to back, and both elements are selected and converted to a MovieClip.

4. **Logging** — The script traces progress to Animate's Output panel so you can see exactly what happened (dimensions, positions, any errors).

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Could not read JSON file" | Check that `CONFIG.jsonPath` uses the `file:///` format and the path is correct |
| Text looks unstyled | Make sure the font name in CONFIG matches exactly what Animate shows (e.g., "Arial Black" not "ArialBlack") |
| Text height seems wrong | Some fonts report height inconsistently. Try setting `autoExpand` or adjusting `lineSpacing` |
| CTA bubble is offset | If the text field has unexpected padding, tweak `paddingH`/`paddingV` values |
| Script does nothing | Make sure you have a document open and are on a valid layer/frame |

---

## Extending This

Some ideas for where to take it next:

- **Loop through multiple sizes** — Wrap the main logic in a function that accepts size-specific configs, and process an array of banner dimensions
- **Add animation** — After placing elements, use `addNewClassicTween()` or `createMotionTween()` to animate them in
- **Multiple CTAs** — Make the JSON accept an array of CTA objects with different styles
- **Pull from a spreadsheet** — Convert a CSV to JSON first, then batch-process multiple banners


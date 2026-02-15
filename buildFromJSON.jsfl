// ============================================================
// buildFromJSON.jsfl
// Reads a JSON file and creates a flowing text layout 
// with eyebrow, headline, subhead, and a CTA button
// in Adobe Animate (HTML5 Canvas or any doc type).
// ============================================================

// -----------------------------------------------------------
// CONFIG — Adjust these to match your project
// -----------------------------------------------------------
var CONFIG = {
	// Path to your JSON file (use file:/// URI format)
	// On Mac:   "file:///Users/yourname/Desktop/banner-data.json"
	// On Win:   "file:///C|/Users/yourname/Desktop/banner-data.json"
	jsonPath: "file:///Users/aaronsterczewski/Desktop/jsfl-test/banner-data.json",

	// Layout area — where text blocks will be placed
	layout: {
		x: 30,           // left edge of the text area
		y: 30,           // top starting position
		maxWidth: 260    // maximum width for text fields
	},

	// Vertical spacing between each text block
	spacing: {
		afterEyebrow: 8,
		afterHeadline: 10,
		afterSubhead: 20
	},

	// Typography settings for each field
	styles: {
		eyebrow: {
			font: "Arial",
			size: 14,
			style: "bold",       // "bold", "italic", "boldItalic", or "" for regular
			color: "#FFFFFF",
			letterSpacing: 2,
			lineSpacing: 2
		},
		headline: {
			font: "Arial",
			size: 36,
			style: "bold",
			color: "#FFFFFF",
			letterSpacing: 0,
			lineSpacing: 4
		},
		subhead: {
			font: "Arial",
			size: 14,
			style: "",
			color: "#FFFFFF",
			letterSpacing: 0,
			lineSpacing: 4
		},
		cta: {
			font: "Arial",
			size: 12,
			style: "bold",
			color: "#FFFFFF",
			letterSpacing: 1,
			lineSpacing: 0
		}
	},

	// CTA button appearance
	ctaButton: {
		paddingH: 24,         // horizontal padding around CTA text
		paddingV: 10,         // vertical padding around CTA text
		fillColor: "#0057B8", // bubble fill color
		cornerRadius: 50,     // high value = pill shape
		convertToSymbol: true // wrap the CTA group in a MovieClip
	},

	// Animation settings
	animation: {
		tweenSeconds: 0.75,    // duration of each tween in seconds
		staggerDelay: 6,      // frames between each element's animation start
		holdFrames: 24,       // frames to hold after the last animation ends
		slideOffset: 200,      // pixels elements slide in from (horizontal)
		easeStrength: -80     // negative = ease out, positive = ease in
	}
};


// -----------------------------------------------------------
// MINIMAL JSON PARSER (since JSFL has no native JSON.parse)
// Handles strings, numbers, booleans, null, objects, arrays.
// Safe for trusted data files — not a full spec parser.
// -----------------------------------------------------------
var JSONParser = {
	_text: "",
	_pos: 0,

	parse: function(str) {
		this._text = str;
		this._pos = 0;
		var result = this._readValue();
		return result;
	},

	_readValue: function() {
		this._skipWhitespace();
		var ch = this._text.charAt(this._pos);
		if (ch === '"') return this._readString();
		if (ch === '{') return this._readObject();
		if (ch === '[') return this._readArray();
		if (ch === 't' || ch === 'f') return this._readBool();
		if (ch === 'n') return this._readNull();
		return this._readNumber();
	},

	_readString: function() {
		var result = "";
		this._pos++; // skip opening quote
		while (this._pos < this._text.length) {
			var ch = this._text.charAt(this._pos);
			if (ch === '\\') {
				this._pos++;
				var next = this._text.charAt(this._pos);
				if (next === 'n') result += "\n";
				else if (next === 't') result += "\t";
				else if (next === '"') result += '"';
				else if (next === '\\') result += '\\';
				else result += next;
			} else if (ch === '"') {
				this._pos++;
				return result;
			} else {
				result += ch;
			}
			this._pos++;
		}
		return result;
	},

	_readObject: function() {
		var obj = {};
		this._pos++; // skip {
		this._skipWhitespace();
		if (this._text.charAt(this._pos) === '}') { this._pos++; return obj; }
		while (true) {
			this._skipWhitespace();
			var key = this._readString();
			this._skipWhitespace();
			this._pos++; // skip :
			var val = this._readValue();
			obj[key] = val;
			this._skipWhitespace();
			if (this._text.charAt(this._pos) === ',') { this._pos++; }
			else { this._pos++; break; } // skip }
		}
		return obj;
	},

	_readArray: function() {
		var arr = [];
		this._pos++; // skip [
		this._skipWhitespace();
		if (this._text.charAt(this._pos) === ']') { this._pos++; return arr; }
		while (true) {
			arr.push(this._readValue());
			this._skipWhitespace();
			if (this._text.charAt(this._pos) === ',') { this._pos++; }
			else { this._pos++; break; } // skip ]
		}
		return arr;
	},

	_readNumber: function() {
		var start = this._pos;
		while (this._pos < this._text.length && "-0123456789.eE+".indexOf(this._text.charAt(this._pos)) !== -1) {
			this._pos++;
		}
		return parseFloat(this._text.substring(start, this._pos));
	},

	_readBool: function() {
		if (this._text.substr(this._pos, 4) === "true") { this._pos += 4; return true; }
		this._pos += 5; return false;
	},

	_readNull: function() {
		this._pos += 4;
		return null;
	},

	_skipWhitespace: function() {
		while (this._pos < this._text.length && " \t\r\n".indexOf(this._text.charAt(this._pos)) !== -1) {
			this._pos++;
		}
	}
};


// -----------------------------------------------------------
// HELPER: Convert hex color string to Animate's integer format
// -----------------------------------------------------------
function hexToInt(hex) {
	hex = hex.replace("#", "");
	return parseInt(hex, 16);
}


// -----------------------------------------------------------
// HELPER: Apply text attributes to an element
// -----------------------------------------------------------
function applyTextAttrs(el, styleConfig) {
	var textLen = el.getTextString().length;
	var s = 0;
	var e = textLen;

	el.setTextAttr("face",          styleConfig.font,            s, e);
	el.setTextAttr("size",          styleConfig.size,            s, e);
	el.setTextAttr("fillColor",     hexToInt(styleConfig.color), s, e);
	el.setTextAttr("alignment",     styleConfig.alignment || "left", s, e);

	if (styleConfig.style === "bold" || styleConfig.style === "boldItalic") {
		el.setTextAttr("bold", true, s, e);
	}
	if (styleConfig.style === "italic" || styleConfig.style === "boldItalic") {
		el.setTextAttr("italic", true, s, e);
	}
}


// -----------------------------------------------------------
// HELPER: Create a styled text field and return its element.
// Non-autoSize fields use dynamic multiline text for reliable
// word wrapping within maxWidth. CTA uses static auto-expand.
// -----------------------------------------------------------
function createTextField(doc, text, styleConfig, x, y, maxWidth, autoSize) {
	doc.selectNone();

	var rect = {
		left:   x,
		top:    y,
		right:  x + maxWidth,
		bottom: y + 200
	};

	doc.addNewText(rect, text);

	// Grab the element — try selection first, fall back to last element on frame
	var el = doc.selection[0];
	if (!el) {
		var tl = doc.getTimeline();
		var layer = tl.layers[tl.currentLayer];
		var frame = layer.frames[tl.currentFrame];
		var elems = frame.elements;
		el = elems[elems.length - 1];
	}

	if (!el) {
		fl.trace("ERROR: Could not create text field for: " + text);
		return null;
	}

	el.textType = "static";
	if (autoSize) {
		// CTA: auto-expand so we can measure natural width (single line)
		el.autoExpand = true;
	}
	// Non-autoSize fields: static text with fixed width auto-adjusts height to content

	applyTextAttrs(el, styleConfig);

	return el;
}


// -----------------------------------------------------------
// HELPER: Create a rounded rectangle (the CTA bubble)
// -----------------------------------------------------------
function createCTABubble(doc, x, y, w, h, fillColor, cornerRadius) {
	doc.selectNone();

	// Set fill to solid with the desired color, no stroke
	doc.setCustomFill({
		style: "solid",
		color: hexToInt(fillColor)
	});

	// Remove stroke
	doc.setCustomStroke({
		style: "noStroke"
	});

	var rect = {
		left:   x,
		top:    y,
		right:  x + w,
		bottom: y + h
	};

	// addNewRectangle(boundingRect, roundness, bSuppressFill, bSuppressStroke)
	// roundness is 0–999 where 999 is fully round — but we can also
	// use addNewPrimitiveRectangle for precise corner radius control
	doc.addNewRectangle(rect, Math.round(cornerRadius), false, true);

	var el = doc.selection[0];

	if (!el) {
		var tl = doc.getTimeline();
		var layer = tl.layers[tl.currentLayer];
		var frame = layer.frames[tl.currentFrame];
		var elems = frame.elements;
		el = elems[elems.length - 1];
	}

	return el;
}


// -----------------------------------------------------------
// MAIN SCRIPT
// -----------------------------------------------------------
(function() {
	var doc = fl.getDocumentDOM();
	if (!doc) {
		alert("Please open or create a document first.");
		return;
	}

	// Set stage background color
	doc.backgroundColor = "#009FDB";

	// 1. READ THE JSON FILE
	fl.trace("--- buildFromJSON: Starting ---");
	fl.trace("Reading JSON from: " + CONFIG.jsonPath);

	var jsonString = FLfile.read(CONFIG.jsonPath);
	if (!jsonString) {
		alert("Could not read JSON file.\nCheck the path in CONFIG.jsonPath:\n" + CONFIG.jsonPath);
		return;
	}

	fl.trace("JSON loaded. Parsing...");
	var data = JSONParser.parse(jsonString);
	fl.trace("Parsed OK");

	// 2. SET UP LAYOUT TRACKING
	var curX = CONFIG.layout.x;
	var curY = CONFIG.layout.y;
	var maxW = CONFIG.layout.maxWidth;
	var anim = CONFIG.animation;
	var tl = doc.getTimeline();

	// Derive tween duration in frames from seconds and document frame rate
	anim.tweenDuration = Math.round(anim.tweenSeconds * doc.frameRate);

	// -------------------------------------------------------
	// PHASE 1: MEASURE & SPLIT TEXT INTO LINES
	// Uses default Layer 1 as scratch for temp text fields
	// -------------------------------------------------------
	tl.currentLayer = 0;
	tl.currentFrame = 0;

	// Helper: grab the element just created on the current layer
	function grabElement() {
		var el = doc.selection[0];
		if (!el) {
			var layer = tl.layers[tl.currentLayer];
			var frame = layer.frames[tl.currentFrame];
			el = frame.elements[frame.elements.length - 1];
		}
		return el;
	}

	// Helper: split text into lines that fit within maxWidth.
	// Returns { lines: string[], lineHeight: number }
	function splitLines(text, styleConfig) {
		var words = text.split(" ");

		// Create a temp auto-expand field to measure text widths
		doc.selectNone();
		var rect = { left: 0, top: 0, right: 1000, bottom: 100 };
		doc.addNewText(rect, words[0]);
		var el = grabElement();
		el.textType = "static";
		el.autoExpand = true;
		applyTextAttrs(el, styleConfig);

		var lineHeight = el.height;
		var lines = [];
		var cur = words[0];

		for (var i = 1; i < words.length; i++) {
			var test = cur + " " + words[i];
			el.setTextString(test);
			if (el.width > maxW) {
				lines.push(cur);
				cur = words[i];
			} else {
				cur = test;
			}
		}
		lines.push(cur);

		// Delete the temp field
		doc.selectNone();
		doc.selection = [el];
		doc.deleteSelection();

		return { lines: lines, lineHeight: lineHeight };
	}

	// Build a flat list of all items (one per line) with Y positions
	var items = [];

	function addTextElement(name, text, style, afterSpacing) {
		var result = splitLines(text, style);
		var lineStep = result.lineHeight + (style.lineSpacing || 0);

		for (var j = 0; j < result.lines.length; j++) {
			var layerName = result.lines.length === 1 ? name : name + "_line" + (j + 1);
			items.push({
				name: layerName,
				text: result.lines[j],
				style: style,
				x: curX,
				y: curY + j * lineStep,
				type: "slide"
			});
		}

		curY += (result.lines.length - 1) * lineStep + result.lineHeight + afterSpacing;
		fl.trace("  " + name + ": " + result.lines.length + " line(s), lineH=" + result.lineHeight);
	}

	fl.trace("Splitting text into lines...");
	if (data.eyebrow)  addTextElement("eyebrow",  data.eyebrow,  CONFIG.styles.eyebrow,  CONFIG.spacing.afterEyebrow);
	if (data.headline) addTextElement("headline", data.headline, CONFIG.styles.headline, CONFIG.spacing.afterHeadline);
	if (data.subhead)  addTextElement("subhead",  data.subhead,  CONFIG.styles.subhead,  CONFIG.spacing.afterSubhead);

	// CTA is always a single item (no line splitting)
	if (data.cta) {
		items.push({
			name: "cta",
			text: data.cta,
			x: curX,
			y: curY,
			type: "fade",
			isCta: true
		});
	}

	// -------------------------------------------------------
	// PHASE 2: CREATE LAYERS
	// One layer per line item, in reverse for correct stacking
	// -------------------------------------------------------
	for (var i = items.length - 1; i >= 0; i--) {
		tl.addNewLayer(items[i].name);
	}
	// Delete the original Layer 1 (now at the bottom)
	tl.deleteLayer(tl.layerCount - 1);
	// Layer indices now match items array: items[0] = layer 0, etc.

	// -------------------------------------------------------
	// PHASE 3: EXTEND TIMELINE
	// -------------------------------------------------------
	var totalFrames = anim.staggerDelay * (items.length - 1) + anim.tweenDuration + anim.holdFrames;
	if (totalFrames < 1) totalFrames = 1;
	tl.currentFrame = 0;
	tl.insertFrames(totalFrames - 1, true);
	fl.trace("Timeline: " + totalFrames + " frames, " + items.length + " line items");

	// -------------------------------------------------------
	// PHASE 4: PLACE ELEMENTS (one per layer)
	// -------------------------------------------------------
	// Helper: convert last element on current layer/frame to MovieClip
	function convertLastToSymbol(symbolName) {
		var layer = tl.layers[tl.currentLayer];
		var frame = layer.frames[tl.currentFrame];
		var elems = frame.elements;
		var el = elems[elems.length - 1];
		doc.selectNone();
		doc.selection = [el];
		doc.convertToSymbol("movie clip", symbolName, "top left");
		elems = frame.elements;
		return elems[elems.length - 1];
	}

	var animItems = [];

	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var sf = i * anim.staggerDelay;

		tl.currentLayer = i;
		if (sf > 0) tl.insertBlankKeyframe(sf);
		tl.currentFrame = sf;

		if (item.isCta) {
			// --- CTA BUTTON ---
			fl.trace("Creating CTA on layer " + i + " frame " + sf);
			var ctaCfg = CONFIG.ctaButton;
			var ctaTextEl = createTextField(doc, item.text, CONFIG.styles.cta, item.x, item.y, maxW, true);

			if (ctaTextEl) {
				var ctaTextW = ctaTextEl.width;
				var ctaTextH = ctaTextEl.height;
				var bubbleW = ctaTextW + (ctaCfg.paddingH * 2);
				var bubbleH = ctaTextH + (ctaCfg.paddingV * 2);

				ctaTextEl.x = item.x + ctaCfg.paddingH;
				ctaTextEl.y = item.y + ctaCfg.paddingV;

				var radius = Math.min(ctaCfg.cornerRadius, Math.round(bubbleH / 2));
				var bubbleEl = createCTABubble(doc, item.x, item.y, bubbleW, bubbleH, ctaCfg.fillColor, radius);

				if (bubbleEl) {
					doc.selectNone();
					doc.selection = [bubbleEl];
					doc.arrange("back");

					if (ctaCfg.convertToSymbol) {
						doc.selectNone();
						doc.setSelectionRect({
							left: item.x - 1, top: item.y - 1,
							right: item.x + bubbleW + 1, bottom: item.y + bubbleH + 1
						}, false);
						doc.convertToSymbol("movie clip", "cta_button", "top left");
					}
				}

				animItems.push({ layer: i, type: "fade", startFrame: sf });
			}
		} else {
			// --- TEXT LINE ---
			fl.trace("Creating " + item.name + " on layer " + i + " frame " + sf);
			var el = createTextField(doc, item.text, item.style, item.x, item.y, maxW, true);
			if (el) {
				convertLastToSymbol(item.name + "_txt");
				animItems.push({ layer: i, type: "slide", startFrame: sf });
			}
		}
	}

	// -------------------------------------------------------
	// PHASE 5: ANIMATE
	// -------------------------------------------------------
	fl.trace("Animating " + animItems.length + " items...");

	for (var i = 0; i < animItems.length; i++) {
		var ai = animItems[i];
		var sf = ai.startFrame;
		var ef = sf + anim.tweenDuration;

		tl.currentLayer = ai.layer;
		var layer = tl.layers[ai.layer];

		// Insert keyframe at end of tween (copies element from startFrame)
		tl.insertKeyframe(ef);

		// Modify element at startFrame for animation start state
		tl.currentFrame = sf;
		var el = layer.frames[sf].elements[0];

		if (el) {
			if (ai.type === "slide") {
				// Slide in from off-stage left (offset by full stage width)
				el.x -= doc.width;
			} else if (ai.type === "fade") {
				// Fade in: set alpha to 0 at start, 100 at end
				var endEl = layer.frames[ef].elements[0];
				if (endEl) {
					endEl.colorMode = "alpha";
					endEl.colorAlphaPercent = 100;
				}
				el.colorMode = "alpha";
				el.colorAlphaPercent = 0;
			}

			// Apply classic tween
			layer.frames[sf].tweenType = "motion";

			if (ai.type === "slide") {
				// Circ Out custom ease for directional motion
				layer.frames[sf].hasCustomEase = true;
				layer.frames[sf].useSingleEaseCurve = true;
				layer.frames[sf].setCustomEase("all", [
					{x: 0, y: 0},
					{x: 0.08, y: 0.82},
					{x: 0.17, y: 1},
					{x: 1, y: 1}
				]);
			} else {
				layer.frames[sf].tweenEasing = anim.easeStrength;
			}
		}
	}

	// DONE
	doc.selectNone();
	tl.currentFrame = 0;
	fl.trace("--- buildFromJSON: Complete ---");

})();

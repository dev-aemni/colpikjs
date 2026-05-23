/* ========================= */
/* colpik.js                 */
/* ========================= */

class Colpik {

  constructor(options = {}) {

    this.target   = document.querySelector(options.el);
    this.width    = options.width    || 240;
    this.minWidth = options.minWidth || 180;
    this.maxWidth = options.maxWidth || 340;
    this.format   = options.format   || 'hex';
    this.onPick   = options.onPick   || (() => {});

    /*
      theme: 'glass' (default) | 'dark' | 'light'
    */
    this.theme = options.theme || 'glass';

    /*
      Glass customisation — only active when theme === 'glass'.
      transparency : 0–100  (0 = fully opaque, 100 = fully see-through)
                    default 18
      blur         : 0–40px backdrop blur
                    default 16
      Both are optional. If omitted, defaults apply automatically.

      Usage:
        new Colpik({ theme: 'glass' })                    ← defaults
        new Colpik({ theme: 'glass', transparency: 40, blur: 24 })
    */
    this.glassTransparency =
      (options.transparency !== undefined)
        ? Math.max(0, Math.min(100, options.transparency))
        : 18;

    this.glassBlur =
      (options.blur !== undefined)
        ? Math.max(0, Math.min(40, options.blur))
        : 16;

    /*
      components — granular visibility control, all default true.

      mainPicker   : the gradient saturation/lightness canvas
      hueSlider    : the rainbow hue range input
      alphaSlider  : the alpha/opacity range input
      previewInput : the small color swatch + text input
      formatSelect : the HEX / RGB / RGBA / HSL dropdown
      quickColors  : the preset color swatches row
      buttons      : Copy / Random / Apply buttons
    */
    this.components = Object.assign({
      mainPicker:   true,
      hueSlider:    true,
      alphaSlider:  true,
      previewInput: true,
      formatSelect: true,
      quickColors:  true,
      buttons:      true
    }, options.components || {});

    this.presets = options.presets || [
      '#ff0055', '#16d9ff', '#7c3aed', '#22c55e', '#f59e0b'
    ];

    /* internal HSL + alpha state */
    this.h = 220;
    this.s = 100;
    this.l = 50;
    this.a = 1;

    this.build();
    this.attach();
  }

  /* ─────────────────────────────────────────
     build DOM
  ───────────────────────────────────────── */

  build() {

    this.popup = document.createElement('div');
    this.popup.className = 'colpik colpik-theme-' + this.theme;

    this.popup.style.setProperty('--cp-width',     this.width     + 'px');
    this.popup.style.setProperty('--cp-min-width', this.minWidth  + 'px');
    this.popup.style.setProperty('--cp-max-width', this.maxWidth  + 'px');

    if (this.theme === 'glass') this._applyGlassVars();

    const c = this.components;

    const topHTML = c.mainPicker ? `
      <div class="colpik-top">
        <div class="colpik-area">
          <div class="colpik-dot"></div>
        </div>
      </div>` : '';

    const hueHTML = c.hueSlider ? `
      <input type="range" min="0" max="360" value="220"
        class="colpik-slider colpik-hue">` : '';

    const alphaHTML = c.alphaSlider ? `
      <input type="range" min="0" max="100" value="100"
        class="colpik-slider colpik-alpha">` : '';

    const previewHTML = c.previewInput ? `
      <div class="colpik-preview-wrap">
        <div class="colpik-preview"></div>
        <input readonly class="colpik-input">
      </div>` : '';

    const formatHTML = c.formatSelect ? `
      <select class="colpik-format">
        <option value="hex">HEX</option>
        <option value="rgb">RGB</option>
        <option value="rgba">RGBA</option>
        <option value="hsl">HSL</option>
      </select>` : '';

    const paletteHTML = c.quickColors ? `
      <div class="colpik-palette"></div>` : '';

    const buttonsHTML = c.buttons ? `
      <div class="colpik-buttons">
        <button class="colpik-btn cp-copy">Copy</button>
        <button class="colpik-btn cp-random">Random</button>
        <button class="colpik-btn cp-apply">Apply</button>
      </div>` : '';

    this.popup.innerHTML = `
      ${topHTML}
      <div class="colpik-controls">
        ${hueHTML}
        ${alphaHTML}
        ${previewHTML}
        ${formatHTML}
        ${paletteHTML}
        ${buttonsHTML}
      </div>`;

    document.body.appendChild(this.popup);

    /* cache refs */
    this.area         = this.popup.querySelector('.colpik-area');
    this.dot          = this.popup.querySelector('.colpik-dot');
    this.hue          = this.popup.querySelector('.colpik-hue');
    this.alpha        = this.popup.querySelector('.colpik-alpha');
    this.preview      = this.popup.querySelector('.colpik-preview');
    this.input        = this.popup.querySelector('.colpik-input');
    this.palette      = this.popup.querySelector('.colpik-palette');
    this.formatSelect = this.popup.querySelector('.colpik-format');

    if (c.mainPicker) this.updateArea();
    this.update();
    if (c.quickColors) this.makePalette();
  }

  /* ─────────────────────────────────────────
     glass CSS vars — called on build & setGlass
  ───────────────────────────────────────── */

  _applyGlassVars() {
    /*
      transparency (0–100):
        0   → nearly opaque  → white tint alpha very low  → more bg tint
        100 → fully clear    → white tint alpha near zero → pure glass

      We map transparency → the rgba alpha for the bg white-tint.
      t=0  → alpha = 0.08  (subtle tint, dark)
      t=100→ alpha = 0.00  (completely invisible bg)
      Sweet default at t=18 → alpha ≈ 0.066
    */
    const t = this.glassTransparency;       /* 0–100  */
    const b = this.glassBlur;               /* 0–40   */

    /* bg tint: more transparent = less white fill */
    const bgAlpha    = ((100 - t) / 100 * 0.14).toFixed(4);
    /* border shimmer: more transparent = slightly more visible border */
    const borderAlpha = (0.12 + (t / 100) * 0.18).toFixed(4);

    this.popup.style.setProperty(
      '--cp-glass-bg',
      `rgba(255,255,255,${bgAlpha})`
    );
    this.popup.style.setProperty(
      '--cp-glass-blur',
      b + 'px'
    );
    this.popup.style.setProperty(
      '--cp-glass-border-alpha',
      borderAlpha
    );
  }

  /* ─────────────────────────────────────────
     attach events
  ───────────────────────────────────────── */

  attach() {

    const c = this.components;

    /* open / close on trigger */
    this.target.addEventListener('click', e => {
      e.stopPropagation();
      this.toggle();
    });

    document.addEventListener('click', e => {
      if (!this.popup.contains(e.target) && e.target !== this.target)
        this.close();
    });

    /* hue slider */
    if (this.hue) {
      this.hue.addEventListener('input', () => {
        this.h = +this.hue.value;
        if (c.mainPicker) this.updateArea();
        this.update();
      });
    }

    /* alpha slider */
    if (this.alpha) {
      this.alpha.addEventListener('input', () => {
        this.a = this.alpha.value / 100;
        this.update();
      });
    }

    /* main picker drag */
    if (this.area) {
      let dragging = false;

      const move = e => {
        if (!dragging) return;
        const rect = this.area.getBoundingClientRect();
        const x = Math.max(1, Math.min(e.clientX - rect.left,  rect.width  - 1));
        const y = Math.max(1, Math.min(e.clientY - rect.top,   rect.height - 1));
        this.s = Math.round((x / rect.width)  * 100);
        this.l = Math.round(100 - (y / rect.height) * 100);
        this.dot.style.left = x + 'px';
        this.dot.style.top  = y + 'px';
        this.update();
      };

      this.area.addEventListener('pointerdown', e => {
        dragging = true;
        this.area.setPointerCapture(e.pointerId);
        move(e);
      });
      this.area.addEventListener('pointermove', move);
      this.area.addEventListener('pointerup',   () => { dragging = false; });
    }

    /* copy */
    const copyBtn = this.popup.querySelector('.cp-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(
          this.input ? this.input.value : this.hex
        );
      });
    }

    /* random */
    const randomBtn = this.popup.querySelector('.cp-random');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        this.h = Math.random() * 360;
        this.s = Math.random() * 100;
        this.l = Math.random() * 100;
        if (this.hue) this.hue.value = this.h;
        if (this.dot) {
          this.dot.style.left = this.s + '%';
          this.dot.style.top  = (100 - this.l) + '%';
        }
        if (c.mainPicker) this.updateArea();
        this.update();
      });
    }

    /* apply */
    const applyBtn = this.popup.querySelector('.cp-apply');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this.onPick({
          hex: this.hex, rgb: this.rgb,
          rgba: this.rgba, hsl: this.hsl
        });
      });
    }

    /* format select */
    if (this.formatSelect) {
      this.formatSelect.addEventListener('change', () => {
        this.format = this.formatSelect.value;
        this.update();
      });
    }
  }

  /* ─────────────────────────────────────────
     open / close
  ───────────────────────────────────────── */

  toggle() {
    this.popup.classList.contains('show') ? this.close() : this.open();
  }

  open() {
    const rect = this.target.getBoundingClientRect();
    this.popup.style.left = rect.left   + 'px';
    this.popup.style.top  = rect.bottom + 8    + 'px';
    requestAnimationFrame(() => {
      this.popup.classList.add('show');
    });
  }

  close() {
    this.popup.classList.remove('show');
  }

  /* ─────────────────────────────────────────
     color math
  ───────────────────────────────────────── */

  updateArea() {
    if (!this.area) return;
    this.area.style.background = `hsl(${this.h},100%,50%)`;
  }

  hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [
      Math.round(255 * f(0)),
      Math.round(255 * f(8)),
      Math.round(255 * f(4))
    ];
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
  }

  update() {
    const [r, g, b] = this.hslToRgb(this.h, this.s, this.l / 2);

    this.hex  = this.rgbToHex(r, g, b);
    this.rgb  = `rgb(${r}, ${g}, ${b})`;
    this.rgba = `rgba(${r}, ${g}, ${b}, ${this.a.toFixed(2)})`;
    this.hsl  = `hsl(${Math.round(this.h)}, ${Math.round(this.s)}%, ${Math.round(this.l / 2)}%)`;

    let out = this.hex;
    if (this.format === 'rgb')  out = this.rgb;
    if (this.format === 'rgba') out = this.rgba;
    if (this.format === 'hsl')  out = this.hsl;

    /* update preview: set background directly on the element
       (the ::after trick in CSS already handles the swatch color) */
    if (this.preview) this.preview.style.background = this.rgba;
    if (this.input)   this.input.value = out;
  }

  makePalette() {
    if (!this.palette) return;
    this.palette.innerHTML = '';
    this.presets.forEach(color => {
      const div = document.createElement('div');
      div.className = 'colpik-color';
      div.style.background = color;
      div.onclick = () => {
        if (this.preview) this.preview.style.background = color;
        if (this.input)   this.input.value = color;
      };
      this.palette.appendChild(div);
    });
  }

  /* ─────────────────────────────────────────
     public API
  ───────────────────────────────────────── */

  /**
   * Switch theme at runtime.
   * @param {'glass'|'dark'|'light'} theme
   * @param {{ transparency?: number, blur?: number }} opts  (glass only)
   */
  setTheme(theme, opts = {}) {
    this.popup.classList.remove(
      'colpik-theme-dark',
      'colpik-theme-light',
      'colpik-theme-glass'
    );
    this.theme = theme;
    this.popup.classList.add('colpik-theme-' + theme);

    if (theme === 'glass') {
      if (opts.transparency !== undefined)
        this.glassTransparency = Math.max(0, Math.min(100, opts.transparency));
      if (opts.blur !== undefined)
        this.glassBlur = Math.max(0, Math.min(40, opts.blur));
      this._applyGlassVars();
    } else {
      /* clear glass inline vars */
      ['--cp-glass-bg', '--cp-glass-blur', '--cp-glass-border-alpha']
        .forEach(v => this.popup.style.removeProperty(v));
    }
  }

  /**
   * Adjust glass look without switching theme.
   * Safe to call even if current theme isn't glass.
   * @param {{ transparency?: number, blur?: number }} opts
   */
  setGlass(opts = {}) {
    if (opts.transparency !== undefined)
      this.glassTransparency = Math.max(0, Math.min(100, opts.transparency));
    if (opts.blur !== undefined)
      this.glassBlur = Math.max(0, Math.min(40, opts.blur));
    if (this.theme === 'glass') this._applyGlassVars();
  }

  destroy() {
    this.popup.remove();
  }
}

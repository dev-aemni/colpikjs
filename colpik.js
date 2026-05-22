/* ========================= */
/* colpik.js                 */
/* ========================= */

class Colpik {

  constructor(options = {}) {

    this.target =
      document.querySelector(options.el);

    this.width =
      options.width || 240;

    this.minWidth =
      options.minWidth || 180;

    this.maxWidth =
      options.maxWidth || 340;

    this.format =
      options.format || 'hex';

    this.onPick =
      options.onPick || (() => {});

    /* ---- theme: 'dark' | 'light' ---- */
    this.theme =
      options.theme || 'dark';

    /*
      components — each can be true/false
      defaults: all true
      usage:
        components: {
          mainPicker: true,
          hueSlider: true,
          alphaSlider: false,
          previewInput: true,
          formatSelect: true,
          quickColors: true,
          buttons: true
        }
    */
    const defaults = {
      mainPicker:   true,
      hueSlider:    true,
      alphaSlider:  true,
      previewInput: true,
      formatSelect: true,
      quickColors:  true,
      buttons:      true
    };

    const user =
      options.components || {};

    this.components =
      Object.assign({}, defaults, user);

    this.h = 220;
    this.s = 100;
    this.l = 50;
    this.a = 1;

    this.presets = options.presets || [
      '#ff0055',
      '#16d9ff',
      '#7c3aed',
      '#22c55e',
      '#f59e0b'
    ];

    this.build();
    this.attach();

  }

  /* -------- build DOM -------- */

  build() {

    this.popup =
      document.createElement('div');

    this.popup.className =
      'colpik colpik-theme-' + this.theme;

    this.popup.style.setProperty(
      '--cp-width', this.width + 'px'
    );
    this.popup.style.setProperty(
      '--cp-min-width', this.minWidth + 'px'
    );
    this.popup.style.setProperty(
      '--cp-max-width', this.maxWidth + 'px'
    );

    const c = this.components;

    /* --- main picker area --- */
    const topHTML = c.mainPicker ? `
      <div class="colpik-top">
        <div class="colpik-area">
          <div class="colpik-dot"></div>
        </div>
      </div>` : '';

    /* --- sliders --- */
    const hueHTML = c.hueSlider ? `
      <input type="range" min="0" max="360"
        value="220"
        class="colpik-slider colpik-hue">` : '';

    const alphaHTML = c.alphaSlider ? `
      <input type="range" min="0" max="100"
        value="100"
        class="colpik-slider colpik-alpha">` : '';

    /* --- preview + input --- */
    const previewHTML = c.previewInput ? `
      <div class="colpik-preview-wrap">
        <div class="colpik-preview"></div>
        <input readonly class="colpik-input">
      </div>` : '';

    /* --- format select --- */
    const formatHTML = c.formatSelect ? `
      <select class="colpik-format">
        <option value="hex">HEX</option>
        <option value="rgb">RGB</option>
        <option value="rgba">RGBA</option>
        <option value="hsl">HSL</option>
      </select>` : '';

    /* --- quick colors / palette --- */
    const paletteHTML = c.quickColors ? `
      <div class="colpik-palette"></div>` : '';

    /* --- buttons --- */
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

    /* --- cache refs (with null guards) --- */
    this.area =
      this.popup.querySelector('.colpik-area');

    this.dot =
      this.popup.querySelector('.colpik-dot');

    this.hue =
      this.popup.querySelector('.colpik-hue');

    this.alpha =
      this.popup.querySelector('.colpik-alpha');

    this.preview =
      this.popup.querySelector('.colpik-preview');

    this.input =
      this.popup.querySelector('.colpik-input');

    this.palette =
      this.popup.querySelector('.colpik-palette');

    this.formatSelect =
      this.popup.querySelector('.colpik-format');

    if (c.mainPicker) this.updateArea();
    this.update();
    if (c.quickColors) this.makePalette();

  }

  /* -------- attach events -------- */

  attach() {

    const c = this.components;

    /* toggle on trigger element click */
    this.target.addEventListener('click', e => {
      e.stopPropagation();
      this.toggle();
    });

    /* close on outside click */
    document.addEventListener('click', e => {
      if (
        !this.popup.contains(e.target) &&
        e.target !== this.target
      ) {
        this.close();
      }
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

    /* drag on main picker */
    if (this.area) {

      let dragging = false;

      const move = e => {
        if (!dragging) return;
        const rect =
          this.area.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        x = Math.max(1, Math.min(x, rect.width  - 1));
        y = Math.max(1, Math.min(y, rect.height - 1));
        this.s = Math.round((x / rect.width) * 100);
        this.l = Math.round(100 - ((y / rect.height) * 100));
        this.dot.style.left = x + 'px';
        this.dot.style.top  = y + 'px';
        this.update();
      };

      this.area.addEventListener('pointerdown', e => {
        dragging = true;
        move(e);
      });
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup',   () => { dragging = false; });

    }

    /* copy button */
    const copyBtn =
      this.popup.querySelector('.cp-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(
          this.input ? this.input.value : this.hex
        );
      });
    }

    /* random button */
    const randomBtn =
      this.popup.querySelector('.cp-random');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        this.h = Math.random() * 360;
        this.s = Math.random() * 100;
        this.l = Math.random() * 100;
        if (this.hue)  this.hue.value  = this.h;
        if (this.dot) {
          this.dot.style.left = this.s + '%';
          this.dot.style.top  = (100 - this.l) + '%';
        }
        if (c.mainPicker) this.updateArea();
        this.update();
      });
    }

    /* apply button */
    const applyBtn =
      this.popup.querySelector('.cp-apply');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this.onPick({
          hex:  this.hex,
          rgb:  this.rgb,
          rgba: this.rgba,
          hsl:  this.hsl
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

  /* -------- open / close -------- */

  toggle() {
    this.popup.classList.contains('show')
      ? this.close()
      : this.open();
  }

  open() {
    const rect =
      this.target.getBoundingClientRect();
    this.popup.style.left =
      rect.left + 'px';
    this.popup.style.top  =
      rect.bottom + 8 + 'px';   /* was 10 → 8 to reduce vertical gap */
    requestAnimationFrame(() => {
      this.popup.classList.add('show');
    });
  }

  close() {
    this.popup.classList.remove('show');
  }

  /* -------- color helpers -------- */

  updateArea() {
    if (!this.area) return;
    this.area.style.background =
      `hsl(${this.h},100%,50%)`;
  }

  hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(
        -1,
        Math.min(k(n) - 3, Math.min(9 - k(n), 1))
      );
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
    const [r, g, b] =
      this.hslToRgb(this.h, this.s, this.l / 2);

    this.hex  = this.rgbToHex(r, g, b);
    this.rgb  = `rgb(${r}, ${g}, ${b})`;
    this.rgba = `rgba(${r}, ${g}, ${b}, ${this.a.toFixed(2)})`;
    this.hsl  = `hsl(${Math.round(this.h)}, ${Math.round(this.s)}%, ${Math.round(this.l / 2)}%)`;

    let output = this.hex;
    if (this.format === 'rgb')  output = this.rgb;
    if (this.format === 'rgba') output = this.rgba;
    if (this.format === 'hsl')  output = this.hsl;

    if (this.preview)
      this.preview.style.background = this.rgba;

    if (this.input)
      this.input.value = output;
  }

  makePalette() {
    if (!this.palette) return;
    this.palette.innerHTML = '';
    this.presets.forEach(color => {
      const div = document.createElement('div');
      div.className = 'colpik-color';
      div.style.background = color;
      div.onclick = () => {
        if (this.preview)
          this.preview.style.background = color;
        if (this.input)
          this.input.value = color;
      };
      this.palette.appendChild(div);
    });
  }

  /* -------- public API -------- */

  /* change theme at runtime */
  setTheme(theme) {
    this.popup.classList.remove(
      'colpik-theme-dark',
      'colpik-theme-light'
    );
    this.theme = theme;
    this.popup.classList.add('colpik-theme-' + theme);
  }

  destroy() {
    this.popup.remove();
  }

}

// kutv.js — KuTV retro television program

let kutvCanvas, kutvCtx;
let kutvChannel = 1;
let kutvStatusEl = null;

// Channel names
const CHANNEL_NAMES = {
    1: 'Channel 1 — LIVE ✧',
    2: 'Channel 2 — NO SIGNAL',
    3: 'Channel 3 — GLITCH',
    4: 'Channel 4 — COMING SOON ♡'
};
let kutvAnimFrame = null;
let kutvActive = false;
let kutvSwitching = false;
let kutvSwitchStart = 0;
let kutvTargetChannel = 1;
let kutvBlinkTimer = 0;
let kutvScanX = 0;
let kutvFlashTimer = 0;
let kutvDistortTimer = 0;
let kutvLastTime = 0;

const KUTV_SWITCH_DURATION = 300; // ms of static burst when switching
const KUTV_BLINK_RATE = 500; // ms per blink toggle

// SMPTE color bars (top portion)
const SMPTE_COLORS = [
    [192, 192, 192], // white (75%)
    [192, 192, 0],   // yellow
    [0, 192, 192],   // cyan
    [0, 192, 0],     // green
    [192, 0, 192],   // magenta
    [192, 0, 0],     // red
    [0, 0, 192],     // blue
];

// Darker versions for bottom bars
const SMPTE_DARK = [
    [64, 64, 64],
    [64, 64, 0],
    [0, 64, 64],
    [0, 64, 0],
    [64, 0, 64],
    [64, 0, 0],
    [0, 0, 64],
];

function initKuTV() {
    kutvCanvas = document.getElementById('kutv-canvas');
    if (!kutvCanvas) return;
    kutvCtx = kutvCanvas.getContext('2d');
    kutvStatusEl = document.getElementById('kutv-status');

    // Size canvas to container
    resizeKuTVCanvas();

    // Channel button listeners
    document.querySelectorAll('.kutv-channel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const ch = parseInt(btn.dataset.channel);
            switchChannel(ch);
        });
    });

    // Handle resize
    window.addEventListener('resize', resizeKuTVCanvas);

    // Start on channel 1
    kutvChannel = 1;
    startKuTV();
}

function resizeKuTVCanvas() {
    if (!kutvCanvas) return;
    const parent = kutvCanvas.parentElement;
    if (parent) {
        kutvCanvas.width = parent.clientWidth || 320;
        kutvCanvas.height = parent.clientHeight || 240;
    }
}

function startKuTV() {
    kutvActive = true;
    kutvLastTime = performance.now();
    renderKuTV();
}

function stopKuTV() {
    kutvActive = false;
    if (kutvAnimFrame) {
        cancelAnimationFrame(kutvAnimFrame);
        kutvAnimFrame = null;
    }
}

function switchChannel(ch) {
    if (ch === kutvChannel && !kutvSwitching) return;
    if (kutvSwitching) return; // ignore rapid presses during transition

    kutvSwitching = true;
    kutvSwitchStart = performance.now();
    kutvTargetChannel = ch;

    // Update active button styling
    document.querySelectorAll('.kutv-channel-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.channel) === ch);
    });

    // Update status bar text
    if (kutvStatusEl && CHANNEL_NAMES[ch]) {
        kutvStatusEl.textContent = CHANNEL_NAMES[ch];
    }
}

function renderKuTV(timestamp) {
    if (!kutvActive) return;

    timestamp = timestamp || performance.now();
    const dt = timestamp - kutvLastTime;
    kutvLastTime = timestamp;

    const ctx = kutvCtx;
    const w = kutvCanvas.width;
    const h = kutvCanvas.height;

    if (w === 0 || h === 0) {
        kutvAnimFrame = requestAnimationFrame(renderKuTV);
        return;
    }

    // Update timers
    kutvBlinkTimer += dt;
    kutvScanX += dt * 0.05; // scanning line speed
    if (kutvScanX > w) kutvScanX = 0;
    kutvFlashTimer += dt;
    kutvDistortTimer += dt;

    // Handle channel switching static burst
    if (kutvSwitching) {
        const elapsed = timestamp - kutvSwitchStart;
        if (elapsed < KUTV_SWITCH_DURATION) {
            // Render aggressive static burst during switch
            renderSwitchStatic(ctx, w, h);
            kutvAnimFrame = requestAnimationFrame(renderKuTV);
            return;
        } else {
            // Transition complete
            kutvSwitching = false;
            kutvChannel = kutvTargetChannel;
        }
    }

    // Dispatch to channel renderer
    switch (kutvChannel) {
        case 1: renderChannel1(ctx, w, h); break;
        case 2: renderChannel2(ctx, w, h); break;
        case 3: renderChannel3(ctx, w, h); break;
        case 4: renderChannel4(ctx, w, h); break;
        default: renderChannel1(ctx, w, h); break;
    }

    kutvAnimFrame = requestAnimationFrame(renderKuTV);
}

// --- Static burst during channel switch ---
function renderSwitchStatic(ctx, w, h) {
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
        const v = (Math.random() * 256) | 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    // Draw horizontal white lines for burst effect
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    const numLines = 3 + (Math.random() * 5) | 0;
    for (let i = 0; i < numLines; i++) {
        const y = (Math.random() * h) | 0;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
}

// --- Channel 1: White Noise / Static (LIVE CAM) ---
function renderChannel1(ctx, w, h) {
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    const len = data.length;

    // Generate random black & white pixels
    for (let i = 0; i < len; i += 4) {
        const v = (Math.random() * 256) | 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    // Overlay: CH 1 top-left
    drawOverlayText(ctx, 'CH 1', 12, 24, '#00ff00', 16);

    // Overlay: blinking red dot + LIVE CAM top-right
    const blinkOn = (kutvBlinkTimer % (KUTV_BLINK_RATE * 2)) < KUTV_BLINK_RATE;
    if (blinkOn) {
        const liveText = '\u25CF LIVE CAM';
        ctx.font = 'bold 14px monospace';
        const textWidth = ctx.measureText(liveText).width;
        drawOverlayText(ctx, liveText, w - textWidth - 12, 24, '#ff0000', 14, true);
    }
}

// --- Channel 2: Color Bars + Bad Signal ---
function renderChannel2(ctx, w, h) {
    const topH = (h * 2 / 3) | 0;
    const botH = h - topH;
    const barW = w / 7;

    // Occasional horizontal distortion
    const distort = kutvDistortTimer > 2000 && Math.random() < 0.03;
    const shiftAmount = distort ? ((Math.random() - 0.5) * 40) | 0 : 0;

    // Draw top 2/3: SMPTE color bars
    for (let i = 0; i < 7; i++) {
        const [r, g, b] = SMPTE_COLORS[i];
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect((i * barW) | 0, 0, Math.ceil(barW) + 1, topH);
    }

    // Draw bottom 1/3: dark gradient bars
    for (let i = 0; i < 7; i++) {
        const [r, g, b] = SMPTE_DARK[i];
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect((i * barW) | 0, topH, Math.ceil(barW) + 1, botH);
    }

    // Apply horizontal roll effect
    if (distort && shiftAmount !== 0) {
        const rollY = (Math.random() * h) | 0;
        const rollH = 20 + (Math.random() * 60) | 0;
        const slice = ctx.getImageData(0, rollY, w, Math.min(rollH, h - rollY));
        ctx.putImageData(slice, shiftAmount, rollY);
        kutvDistortTimer = 0;
    }

    // Slight noise overlay for analog feel
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = ((Math.random() - 0.5) * 20) | 0;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

    // Overlay: blinking centered "CH 2 — NO SIGNAL"
    const blinkOn = (kutvBlinkTimer % (KUTV_BLINK_RATE * 2)) < KUTV_BLINK_RATE;
    if (blinkOn) {
        const text = 'CH 2 \u2014 NO SIGNAL';
        ctx.font = 'bold 20px monospace';
        const textW = ctx.measureText(text).width;
        const tx = (w - textW) / 2;
        const ty = h / 2;

        // Dark background for readability
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(tx - 8, ty - 20, textW + 16, 30);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(text, tx, ty);
    }
}

// --- Channel 3: CRT Tube Glitch ---
function renderChannel3(ctx, w, h) {
    // Base: dark bluish static
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
        const v = (Math.random() * 60) | 0;
        data[i] = (v * 0.4) | 0;       // low red
        data[i + 1] = (v * 0.5) | 0;   // slightly more green
        data[i + 2] = v + 10;           // blue tint
        data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    // Horizontal scan lines (every 2px)
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    for (let y = 0; y < h; y += 2) {
        ctx.fillRect(0, y, w, 1);
    }

    // Random horizontal tear/displacement
    if (Math.random() < 0.15) {
        const tearCount = 1 + (Math.random() * 3) | 0;
        for (let t = 0; t < tearCount; t++) {
            const tearY = (Math.random() * h) | 0;
            const tearH = 2 + (Math.random() * 12) | 0;
            const tearShift = ((Math.random() - 0.5) * 60) | 0;
            const clampedH = Math.min(tearH, h - tearY);
            if (clampedH > 0) {
                const slice = ctx.getImageData(0, tearY, w, clampedH);
                ctx.putImageData(slice, tearShift, tearY);
            }
        }
    }

    // Vertical scanning line (bright white/cyan, ~4px wide)
    const scanX = kutvScanX % w;
    const gradient = ctx.createLinearGradient(scanX - 6, 0, scanX + 6, 0);
    gradient.addColorStop(0, 'rgba(0,255,255,0)');
    gradient.addColorStop(0.3, 'rgba(0,255,255,0.4)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.9)');
    gradient.addColorStop(0.7, 'rgba(0,255,255,0.4)');
    gradient.addColorStop(1, 'rgba(0,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(scanX - 6, 0, 12, h);

    // Occasional bright flash
    if (kutvFlashTimer > 3000 && Math.random() < 0.008) {
        ctx.fillStyle = 'rgba(200,220,255,0.25)';
        ctx.fillRect(0, 0, w, h);
        kutvFlashTimer = 0;
    }

    // Overlay: CH 3 top-left in cyan
    drawOverlayText(ctx, 'CH 3', 12, 24, '#00ffff', 16);
}

// --- Channel 4: Placeholder ---
function renderChannel4(ctx, w, h) {
    // White noise (same as channel 1)
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
        const v = (Math.random() * 256) | 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    // Overlay: CH 4 top-left
    drawOverlayText(ctx, 'CH 4', 12, 24, '#ff69b4', 16);

    // Centered: "CH 4 — COMING SOON ♡" in pink
    const text = 'CH 4 \u2014 COMING SOON \u2661';
    ctx.font = 'bold 18px monospace';
    const textW = ctx.measureText(text).width;
    const tx = (w - textW) / 2;
    const ty = h / 2;

    // Dark background for readability
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(tx - 10, ty - 22, textW + 20, 32);

    ctx.fillStyle = '#ff69b4';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(text, tx, ty);
}

// --- Utility: draw overlay text with optional bold ---
function drawOverlayText(ctx, text, x, y, color, size, bold) {
    const weight = bold ? 'bold ' : 'bold ';
    ctx.font = weight + size + 'px monospace';

    // Shadow for readability
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillText(text, x + 1, y + 1);

    // Main text
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

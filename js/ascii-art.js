// ascii-art.js — Floating decorative ASCII art for Windows 98 portfolio desktop
// Creates subtle, ethereal ASCII art pieces that drift across the background

const asciiPieces = [
    {
        art: `  ♥♥   ♥♥\n ♥  ♥ ♥  ♥\n ♥   ♥   ♥\n  ♥     ♥\n   ♥   ♥\n    ♥ ♥\n     ♥`,
        color: '#ff8ec4'  // pink
    },
    {
        art: ` /\\_/\\\n( o.o )\n > ^ <`,
        color: '#c4a7e7'  // lavender
    },
    {
        art: `    *\n   ***\n  *****\n   ***\n    *`,
        color: '#7dcfff'  // cyan
    },
    {
        art: `╔═══════╗\n║ 夢想家 ║\n║ ♡♡♡  ║\n╚═══════╝`,
        color: '#dbb6ee'  // light purple
    },
    {
        art: ` _______\n|  ___  |\n| |   | |\n| |___| |\n|_______|\n  || ||`,
        color: '#7dcfff'  // cyan
    },
    {
        art: `  .--.\n / .. \\\n| (  ) |\n \\    /\n  |~~|`,
        color: '#ff8ec4'  // pink
    },
    {
        art: `♪ ♫ ♪\n  ♫\n♪   ♫`,
        color: '#c4a7e7'  // lavender
    },
    {
        art: `(\\(\\\n( -.-)\no_(")(")`,
        color: '#ffb7d5'  // soft pink
    },
    {
        art: `.:*~*:._.:*~*:.`,
        color: '#b4deff'  // light cyan
    }
];

// Each floating piece tracks its own state
class FloatingAscii {
    constructor(desktop, piece, index, totalPieces) {
        this.desktop = desktop;
        this.piece = piece;

        // Create the DOM element
        this.el = document.createElement('pre');
        this.el.className = 'ascii-float';
        this.el.textContent = piece.art;
        this.el.setAttribute('aria-hidden', 'true');

        // Styling — use left/top (NOT transform) so overflow:hidden works predictably
        Object.assign(this.el.style, {
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: '90',
            fontFamily: '"MS Gothic", "Courier New", monospace',
            fontSize: '18px',
            lineHeight: '1.3',
            whiteSpace: 'pre',
            color: piece.color,
            opacity: '0',           // start invisible, fade in
            margin: '0',
            padding: '0',
            userSelect: 'none',
            transition: 'none',
            textShadow: `0 0 8px ${piece.color}, 0 0 16px ${piece.color}40`
        });

        // Spread pieces across the desktop — keep well inside bounds
        const dw = desktop.clientWidth || window.innerWidth;
        const dh = desktop.clientHeight || window.innerHeight;
        const margin = 120; // generous margin from edges

        const cols = 3;
        const rows = Math.ceil(totalPieces / cols);
        const col = index % cols;
        const row = Math.floor(index / cols);

        // Calculate cell boundaries within the safe area
        const safeW = dw - margin * 2;
        const safeH = dh - margin * 2;
        const cellW = safeW / cols;
        const cellH = safeH / rows;

        this.x = margin + col * cellW + Math.random() * cellW * 0.7;
        this.y = margin + row * cellH + Math.random() * cellH * 0.7;

        // Velocity: very slow drift (0.08 - 0.25 px per frame at 60fps)
        const speed = 0.08 + Math.random() * 0.17;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        // Subtle rotation wobble
        this.rotation = (Math.random() - 0.5) * 6;         // initial rotation (-3 to 3 deg)
        this.rotationSpeed = (Math.random() - 0.5) * 0.005; // very slow wobble
        this.baseOpacity = 0.35 + Math.random() * 0.20;     // 0.35 - 0.55

        // Slow opacity pulse for a breathing effect
        this.opacityPhase = Math.random() * Math.PI * 2;
        this.opacitySpeed = 0.003 + Math.random() * 0.004;  // very slow pulse

        // Fade-in: start at 0 and ramp up over ~2 seconds via the update loop
        this.fadeInStart = performance.now() + index * 400; // stagger
        this.fadeInDuration = 2000; // ms to reach full opacity

        this.applyTransform();
        desktop.appendChild(this.el);
    }

    applyTransform() {
        this.el.style.left = `${this.x}px`;
        this.el.style.top = `${this.y}px`;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Fade-in ramp
        const now = performance.now();
        let fadeMultiplier = 1;
        if (now < this.fadeInStart) {
            fadeMultiplier = 0;
        } else if (now < this.fadeInStart + this.fadeInDuration) {
            fadeMultiplier = (now - this.fadeInStart) / this.fadeInDuration;
        }

        // Subtle opacity breathing
        this.opacityPhase += this.opacitySpeed;
        const opacityWobble = Math.sin(this.opacityPhase) * 0.08;
        const targetOpacity = Math.max(0.20, this.baseOpacity + opacityWobble) * fadeMultiplier;
        this.el.style.opacity = String(targetOpacity);

        // Get approximate element dimensions
        const w = this.el.offsetWidth || 120;
        const h = this.el.offsetHeight || 80;
        const dw = this.desktop.clientWidth || window.innerWidth;
        const dh = this.desktop.clientHeight || window.innerHeight;

        // Bounce off edges to stay visible inside the desktop
        const pad = 20;
        if (this.x < pad) { this.x = pad; this.vx = Math.abs(this.vx); }
        if (this.x > dw - w - pad) { this.x = dw - w - pad; this.vx = -Math.abs(this.vx); }
        if (this.y < pad) { this.y = pad; this.vy = Math.abs(this.vy); }
        if (this.y > dh - h - pad) { this.y = dh - h - pad; this.vy = -Math.abs(this.vy); }

        this.applyTransform();
    }

    destroy() {
        if (this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    }
}

// Main controller
const ASCIIArt = {
    floaters: [],
    animationId: null,
    initialized: false,

    init() {
        // Skip on mobile / small screens
        if (window.innerWidth <= 768) return;

        // Prevent double-initialization
        if (this.initialized) return;
        this.initialized = true;

        // Use #desktop as container — ASCII art uses left/top positioning
        // and stays within bounds so overflow:hidden doesn't clip them
        const container = document.getElementById('desktop');
        if (!container) return;
        this.container = container;

        // Pick 7 random pieces (from the 9 available) for variety without overcrowding
        const count = 7;
        const shuffled = asciiPieces
            .map((p, i) => ({ piece: p, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .slice(0, count)
            .map(item => item.piece);

        shuffled.forEach((piece, i) => {
            this.floaters.push(new FloatingAscii(container, piece, i, count));
        });

        // Start animation loop
        const animate = () => {
            for (let i = 0; i < this.floaters.length; i++) {
                this.floaters[i].update();
            }
            this.animationId = requestAnimationFrame(animate);
        };
        this.animationId = requestAnimationFrame(animate);

        // Pause animation when tab is hidden to save resources
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
            } else {
                if (!this.animationId) {
                    this.animationId = requestAnimationFrame(animate);
                }
            }
        });

        // Handle resize: recalculate bounds (the wrap logic uses live dimensions)
        // No special action needed since we read desktop.clientWidth/Height each frame.

        // Clean up on page unload
        window.addEventListener('beforeunload', () => this.destroy());
    },

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.floaters.forEach(f => f.destroy());
        this.floaters = [];
        this.container = null;
        this.initialized = false;
    }
};

// Auto-initialize
// If there is a splash screen the caller can delay this; otherwise run on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ASCIIArt.init());
} else {
    // DOM already ready (script loaded late or deferred)
    ASCIIArt.init();
}

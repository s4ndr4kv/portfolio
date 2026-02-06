// ascii-art.js — Floating decorative ASCII art for Windows 98 portfolio desktop
// DVD screensaver style: pieces bounce off walls and change color on each bounce

const asciiPieces = [
    {
        art: `  愛\n  愛\n  愛`,
        color: '#ff8ec4'  // pink — amor
    },
    {
        art: ` /\\_/\\\n( o.o )\n > ^ <`,
        color: '#c4a7e7'  // lavender
    },
    {
        art: `  暴力\n  暴力\n  暴力`,
        color: '#7dcfff'  // cyan — violencia
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

// DVD bounce color palette — pink/cyan/lavender to match the portfolio aesthetic
const dvdColors = [
    '#ff69b4', // hot pink
    '#7dcfff', // cyan
    '#c4a7e7', // lavender
    '#ff8ec4', // pink
    '#ffb7d5', // soft pink
    '#b4deff', // light cyan
    '#dbb6ee', // light purple
    '#87ceeb', // sky blue
    '#dda0dd', // plum
    '#ffffff', // white
];

// Each floating piece tracks its own state
class FloatingAscii {
    constructor(desktop, piece, index, totalPieces) {
        this.desktop = desktop;
        this.piece = piece;
        this.colorIndex = index % dvdColors.length;

        // Create the DOM element
        this.el = document.createElement('pre');
        this.el.className = 'ascii-float';
        this.el.textContent = piece.art;
        this.el.setAttribute('aria-hidden', 'true');

        // Pick initial color from DVD palette
        const initColor = dvdColors[this.colorIndex];

        // Styling — DVD screensaver style
        Object.assign(this.el.style, {
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: '90',
            fontFamily: '"MS Gothic", "Courier New", monospace',
            fontSize: '18px',
            lineHeight: '1.3',
            whiteSpace: 'pre',
            color: initColor,
            opacity: '0',           // start invisible, fade in
            margin: '0',
            padding: '0',
            userSelect: 'none',
            transition: 'color 0.3s ease',
            textShadow: `0 0 8px ${initColor}88, 0 0 16px ${initColor}44`
        });

        // Spread pieces across the desktop
        const dw = desktop.clientWidth || window.innerWidth;
        const dh = desktop.clientHeight || window.innerHeight;
        const margin = 120;

        const cols = 3;
        const rows = Math.ceil(totalPieces / cols);
        const col = index % cols;
        const row = Math.floor(index / cols);

        const safeW = dw - margin * 2;
        const safeH = dh - margin * 2;
        const cellW = safeW / cols;
        const cellH = safeH / rows;

        this.x = margin + col * cellW + Math.random() * cellW * 0.7;
        this.y = margin + row * cellH + Math.random() * cellH * 0.7;

        // DVD speed: steady diagonal movement (~0.4-0.7 px/frame at 60fps)
        const speed = 0.4 + Math.random() * 0.3;
        // Diagonal angles only — like DVD (avoid near-horizontal or near-vertical)
        const baseAngle = (Math.PI / 4) + (Math.random() - 0.5) * 0.4; // ~35-55 degrees
        const quadrant = Math.floor(Math.random() * 4);
        const angle = baseAngle + (quadrant * Math.PI / 2);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.baseOpacity = 0.55 + Math.random() * 0.20;     // 0.55 - 0.75

        // Fade-in
        this.fadeInStart = performance.now() + index * 400;
        this.fadeInDuration = 2000;

        this.applyTransform();
        desktop.appendChild(this.el);
    }

    applyTransform() {
        this.el.style.left = `${this.x}px`;
        this.el.style.top = `${this.y}px`;
    }

    // Change color on bounce — the iconic DVD effect
    cycleColor() {
        this.colorIndex = (this.colorIndex + 1) % dvdColors.length;
        const newColor = dvdColors[this.colorIndex];
        this.el.style.color = newColor;
        this.el.style.textShadow = `0 0 8px ${newColor}88, 0 0 16px ${newColor}44`;
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

        // Steady opacity (no breathing — DVD style is solid)
        const targetOpacity = this.baseOpacity * fadeMultiplier;
        this.el.style.opacity = String(targetOpacity);

        // Get element dimensions
        const w = this.el.offsetWidth || 120;
        const h = this.el.offsetHeight || 80;
        const dw = this.desktop.clientWidth || window.innerWidth;
        const dh = this.desktop.clientHeight || window.innerHeight;

        // DVD bounce: reverse direction + change color on wall hit
        const pad = 10;
        let bounced = false;

        if (this.x < pad) {
            this.x = pad;
            this.vx = Math.abs(this.vx);
            bounced = true;
        }
        if (this.x > dw - w - pad) {
            this.x = dw - w - pad;
            this.vx = -Math.abs(this.vx);
            bounced = true;
        }
        if (this.y < pad) {
            this.y = pad;
            this.vy = Math.abs(this.vy);
            bounced = true;
        }
        if (this.y > dh - h - pad) {
            this.y = dh - h - pad;
            this.vy = -Math.abs(this.vy);
            bounced = true;
        }

        if (bounced) {
            this.cycleColor();
        }

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

        // Use #desktop as container
        const container = document.getElementById('desktop');
        if (!container) return;
        this.container = container;

        // Pick 7 random pieces (from the 9 available)
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
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ASCIIArt.init());
} else {
    ASCIIArt.init();
}

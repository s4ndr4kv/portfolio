/*
 * Tamagotchi — Bunny Pet Game
 * Take care of your kawaii bunny!
 */

// ===== GAME STATE =====
const SAVE_KEY = 'bunny_tamagotchi';
const TICK_INTERVAL = 30000; // Stats decrease every 30 seconds
const DEATH_THRESHOLD = 0; // Dies if any stat hits 0

let petState = {
    hunger: 80,
    happiness: 80,
    energy: 80,
    alive: true,
    lastUpdate: Date.now(),
    age: 0 // in minutes
};

// ===== SPRITES (ASCII art for now, can replace with images) =====
const sprites = {
    happy: `
  (\\(\\
  ( -.-)
  o_(")(")
    `,
    normal: `
  (\\(\\
  ( o.o)
  o_(")(")
    `,
    sad: `
  (\\(\\
  ( ;.;)
  o_(")(")
    `,
    sleeping: `
  (\\(\\
  ( -.-) zzZ
  o_(")(")
    `,
    eating: `
  (\\(\\
  ( ^.^) ~🍙
  o_(")(")
    `,
    playing: `
  (\\(\\  ♪
  ( >.<)
  o_(")(")
    `,
    dead: `
  (\\(\\
  ( x.x)
  o_(")(")
    `
};

let currentSprite = 'normal';
let animationTimeout = null;

// ===== SAVE/LOAD =====
function saveState() {
    petState.lastUpdate = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(petState));
}

function loadState() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        petState = JSON.parse(saved);
        // Calculate time passed and decrease stats
        const timePassed = Date.now() - petState.lastUpdate;
        const ticksPassed = Math.floor(timePassed / TICK_INTERVAL);

        if (petState.alive && ticksPassed > 0) {
            // Decrease stats based on time away (slower rate when away)
            const decrease = Math.min(ticksPassed * 2, 50); // Cap at 50
            petState.hunger = Math.max(0, petState.hunger - decrease);
            petState.happiness = Math.max(0, petState.happiness - decrease * 0.5);
            petState.energy = Math.min(100, petState.energy + decrease * 0.3); // Rest while away
            petState.age += Math.floor(timePassed / 60000);

            checkDeath();
        }
    }
}

// ===== GAME LOGIC =====
function feed() {
    if (!petState.alive) return;

    petState.hunger = Math.min(100, petState.hunger + 25);
    petState.energy = Math.max(0, petState.energy - 5);

    showAnimation('eating');
    updateDisplay();
    saveState();
}

function play() {
    if (!petState.alive) return;
    if (petState.energy < 10) {
        showMessage('Too tired to play...');
        return;
    }

    petState.happiness = Math.min(100, petState.happiness + 20);
    petState.hunger = Math.max(0, petState.hunger - 10);
    petState.energy = Math.max(0, petState.energy - 15);

    showAnimation('playing');
    updateDisplay();
    saveState();
}

function sleep() {
    if (!petState.alive) return;

    petState.energy = Math.min(100, petState.energy + 30);
    petState.hunger = Math.max(0, petState.hunger - 5);

    showAnimation('sleeping');
    updateDisplay();
    saveState();
}

function revive() {
    petState = {
        hunger: 80,
        happiness: 80,
        energy: 80,
        alive: true,
        lastUpdate: Date.now(),
        age: 0
    };
    showAnimation('happy');
    updateDisplay();
    saveState();

    // Remove from recycle bin if there
    if (typeof removeDeadBunnyFromTrash === 'function') {
        removeDeadBunnyFromTrash();
    }
}

function checkDeath() {
    if (petState.hunger <= DEATH_THRESHOLD || petState.happiness <= DEATH_THRESHOLD) {
        petState.alive = false;
        currentSprite = 'dead';

        // Add to recycle bin
        if (typeof addDeadBunnyToTrash === 'function') {
            addDeadBunnyToTrash();
        }
    }
}

function tick() {
    if (!petState.alive) return;

    // Decrease stats over time
    petState.hunger = Math.max(0, petState.hunger - 3);
    petState.happiness = Math.max(0, petState.happiness - 2);
    petState.energy = Math.max(0, petState.energy - 1);
    petState.age += 0.5; // half minute per tick

    checkDeath();
    updateDisplay();
    saveState();
}

// ===== DISPLAY =====
function showAnimation(type) {
    currentSprite = type;
    updateSprite();

    if (animationTimeout) clearTimeout(animationTimeout);
    animationTimeout = setTimeout(() => {
        currentSprite = getMoodSprite();
        updateSprite();
    }, 1500);
}

function getMoodSprite() {
    if (!petState.alive) return 'dead';

    const avgMood = (petState.hunger + petState.happiness + petState.energy) / 3;
    if (avgMood > 70) return 'happy';
    if (avgMood > 40) return 'normal';
    return 'sad';
}

function showMessage(msg) {
    const msgEl = document.getElementById('tama-message');
    if (msgEl) {
        msgEl.textContent = msg;
        msgEl.classList.add('visible');
        setTimeout(() => msgEl.classList.remove('visible'), 2000);
    }
}

function updateSprite() {
    const spriteEl = document.getElementById('tama-sprite');
    if (spriteEl) {
        spriteEl.textContent = sprites[currentSprite];
    }
}

function updateDisplay() {
    // Update stat bars
    const hungerBar = document.getElementById('tama-hunger');
    const happyBar = document.getElementById('tama-happy');
    const energyBar = document.getElementById('tama-energy');

    if (hungerBar) hungerBar.style.width = petState.hunger + '%';
    if (happyBar) happyBar.style.width = petState.happiness + '%';
    if (energyBar) energyBar.style.width = petState.energy + '%';

    // Update colors based on level
    [hungerBar, happyBar, energyBar].forEach(bar => {
        if (!bar) return;
        const val = parseInt(bar.style.width);
        bar.className = 'tama-bar-fill';
        if (val <= 20) bar.classList.add('critical');
        else if (val <= 40) bar.classList.add('warning');
    });

    // Update sprite
    if (!animationTimeout) {
        currentSprite = getMoodSprite();
        updateSprite();
    }

    // Update age display
    const ageEl = document.getElementById('tama-age');
    if (ageEl) {
        ageEl.textContent = `Age: ${Math.floor(petState.age)} min`;
    }

    // Show/hide revive button
    const reviveBtn = document.getElementById('tama-revive');
    const actionBtns = document.getElementById('tama-actions');
    if (reviveBtn && actionBtns) {
        if (petState.alive) {
            reviveBtn.style.display = 'none';
            actionBtns.style.display = 'flex';
        } else {
            reviveBtn.style.display = 'block';
            actionBtns.style.display = 'none';
        }
    }
}

// ===== INIT =====
function initTamagotchi() {
    loadState();
    updateDisplay();

    // Start game tick
    setInterval(tick, TICK_INTERVAL);

    // Button handlers
    document.getElementById('tama-btn-feed')?.addEventListener('click', feed);
    document.getElementById('tama-btn-play')?.addEventListener('click', play);
    document.getElementById('tama-btn-sleep')?.addEventListener('click', sleep);
    document.getElementById('tama-revive')?.addEventListener('click', revive);
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', initTamagotchi);

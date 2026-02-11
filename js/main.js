/*
 * Portfolio Sandra — Main JavaScript
 * Window management, taskbar, splash screen, gallery, lightbox
 */

// ===== STATE =====
let openWindows = new Set();
let activeWindow = null;
let zIndexCounter = 1000;
let draggedElement = null;
let dragOffset = { x: 0, y: 0 };
let selectedIcon = null;

// ===== WINDOW TITLES =====
const windowTitles = {
    'editorial': '📖 Illustration — イラスト ✧',
    'personajes': '🧙 Characters — キャラクター ✧',
    'winamp': '🎵 Winamp — ウィンアンプ ♡',
    'experimental': '🧪 Experimental — 実験的 ✧',
    'fotografia': '📷 Photos — 写真 ✧',
    'about': '🖥️ My PC — マイコンピュータ',
    'notepad': '📝 CV.txt — メモ帳 ✧',
    'email': '📧 New Message — メール ♡',
    'paint': '🎨 untitled — ペイント ♡',
    'recycle': '🗑️ Recycle Bin — ごみ箱',
    'kutv': '📺 KuTV — テレビ ♡',
    'tamagotchi': '🐰 Tamagotchi — たまごっち ♡',
    'ie-browser': '🪐 Branding ✧',
    'imageviewer': '🖼️ Image Viewer — 画像 ✧'
};

// Photo files mapping (filename -> actual image path)
const photoFiles = {
    'DSC82738.jpg': 'img/fotografia/IMG_1752825135453.JPEG',
    'DSC82739.jpg': 'img/fotografia/IMG_1753169082772.JPEG',
    'DSC82740.jpg': 'img/fotografia/IMG_1770068868969.JPEG',
    'DSC82741.jpg': 'img/fotografia/IMG_1770068869192.JPEG',
    'DSC82742.jpg': 'img/fotografia/IMG_1770072373044.jpg'
};

// ===== SPLASH SCREEN — BIOS BOOT =====
function initSplash() {
    const splash = document.getElementById('splash-screen');
    const biosLines = document.getElementById('bios-lines');
    const progressSection = document.getElementById('bios-progress-section');
    const progressContainer = document.getElementById('splash-progress');
    let aborted = false;

    // BIOS boot lines — kawaii retro terminal ♡
    const lines = [
        { text: 'SANDRA98 BIOS v1.0 ♡', cls: 'highlight', delay: 0 },
        { text: 'Copyright (C) 2026 Ku Industries ✧', cls: 'dimmed', delay: 200 },
        { text: '', cls: '', delay: 100 },
        { text: 'MEMORY CHECK: 640K OK ✧', cls: '', delay: 400 },
        { text: 'LOADING KAWAII MODULES........... OK', cls: '', delay: 600 },
        { text: 'DETECTING PINK HARDWARE......... OK', cls: '', delay: 400 },
        { text: 'INITIALIZING ポートフォリオ...... OK', cls: 'accent', delay: 500 },
        { text: '', cls: '', delay: 100 },
        { text: 'Starting sandra98.exe ૮ . . ྀია', cls: 'highlight', delay: 300 },
        { text: 'ようこそ ♡', cls: 'success', delay: 400 },
    ];

    let lineIndex = 0;
    let totalDelay = 0;
    const timeouts = [];

    // Show each line with cumulative delay
    lines.forEach((line, i) => {
        totalDelay += line.delay;
        const t = setTimeout(() => {
            if (aborted) return;
            const div = document.createElement('div');
            div.className = 'bios-line' + (line.cls ? ' ' + line.cls : '');
            div.textContent = line.text || '\u00A0'; // non-breaking space for empty lines
            biosLines.appendChild(div);
        }, totalDelay);
        timeouts.push(t);
    });

    // After all lines: show progress bar
    totalDelay += 500;
    const tProgress = setTimeout(() => {
        if (aborted) return;
        progressSection.classList.remove('hidden');
        startProgressBar();
    }, totalDelay);
    timeouts.push(tProgress);

    function startProgressBar() {
        const totalBlocks = 20;
        let currentBlock = 0;

        progressContainer.innerHTML = '';
        for (let i = 0; i < totalBlocks; i++) {
            const block = document.createElement('div');
            block.className = 'progress-block';
            progressContainer.appendChild(block);
        }

        const blocks = progressContainer.querySelectorAll('.progress-block');

        const interval = setInterval(() => {
            if (aborted) { clearInterval(interval); return; }
            const step = Math.floor(Math.random() * 3) + 1;
            currentBlock = Math.min(currentBlock + step, totalBlocks);

            for (let i = 0; i < currentBlock; i++) {
                blocks[i].classList.add('filled');
            }

            if (currentBlock >= totalBlocks) {
                clearInterval(interval);
                setTimeout(() => closeSplash(), 300);
            }
        }, 120);
    }

    // Click or key to skip
    function skipSplash() {
        aborted = true;
        timeouts.forEach(t => clearTimeout(t));
        closeSplash();
    }

    splash.addEventListener('click', skipSplash);
    document.addEventListener('keydown', function onKey(e) {
        skipSplash();
        document.removeEventListener('keydown', onKey);
    });
}

function closeSplash() {
    const splash = document.getElementById('splash-screen');
    splash.classList.add('fade-out');
    setTimeout(() => {
        splash.style.display = 'none';
        // Clean desktop — no windows auto-open
    }, 500);
}

// ===== WINDOW MANAGEMENT =====

// Mobile window size/position presets — varied sizes for natural overlap
const mobileWindowPresets = [
    { w: 85, h: 60, top: 4, left: 4 },
    { w: 80, h: 55, top: 14, left: 8 },
    { w: 88, h: 62, top: 8, left: 2 },
    { w: 78, h: 50, top: 18, left: 10 },
    { w: 82, h: 58, top: 6, left: 6 },
    { w: 86, h: 64, top: 10, left: 3 },
    { w: 76, h: 52, top: 20, left: 12 },
    { w: 84, h: 56, top: 2, left: 7 },
    { w: 90, h: 60, top: 16, left: 1 },
    { w: 79, h: 54, top: 12, left: 9 }
];
let mobilePresetIndex = 0;

function getMobileWindowStyle() {
    // Cycle through presets + add small random offset for variety
    const preset = mobileWindowPresets[mobilePresetIndex % mobileWindowPresets.length];
    mobilePresetIndex++;
    // Add small random jitter (±2vw / ±2%)
    const jitterX = (Math.random() - 0.5) * 4;
    const jitterY = (Math.random() - 0.5) * 4;
    return {
        width: Math.round(preset.w + (Math.random() - 0.5) * 6) + 'vw',
        top: Math.max(1, Math.round(preset.top + jitterY)) + '%',
        left: Math.max(1, Math.round(preset.left + jitterX)) + 'vw'
    };
}

function openWindow(windowId) {
    const windowEl = document.getElementById(windowId + '-window');
    if (!windowEl) return;

    // On mobile: assign random position and size for natural overlap
    if (window.innerWidth <= 768) {
        const style = getMobileWindowStyle();
        windowEl.style.width = style.width;
        windowEl.style.top = style.top;
        windowEl.style.left = style.left;
    }

    windowEl.classList.add('visible');
    windowEl.classList.remove('inactive');
    openWindows.add(windowId);
    setActiveWindow(windowId);
    addToTaskbar(windowId);
    closeStartMenu();
    clearIconSelection();

    // Initialize paint canvas when paint window opens
    if (windowId === 'paint') {
        setTimeout(() => initPaintCanvas(), 50);
    }
    // Initialize KuTV canvas when kutv window opens
    if (windowId === 'kutv') {
        setTimeout(() => { if (typeof initKuTV === 'function') initKuTV(); }, 50);
    }
    // Initialize IE Browser when window opens
    if (windowId === 'ie-browser') {
        setTimeout(() => { if (typeof initIEBrowser === 'function') initIEBrowser(); }, 50);
    }
}

function closeWindow(windowId) {
    const windowEl = document.getElementById(windowId + '-window');
    if (!windowEl) return;

    // Stop KuTV animation on close to save CPU
    if (windowId === 'kutv' && typeof stopKuTV === 'function') stopKuTV();

    // Animate close: shrink + fade out (immediately, don't restore size first)
    windowEl.classList.add('closing');
    openWindows.delete(windowId);
    removeFromTaskbar(windowId);

    setTimeout(() => {
        windowEl.classList.remove('visible', 'active', 'closing');
        windowEl.classList.add('inactive');

        // Reset maximized state AFTER closing so it reopens at normal size
        if (windowEl.classList.contains('maximized')) {
            windowEl.classList.remove('maximized');
            windowEl.style.width = windowEl.dataset.origW || '';
            windowEl.style.height = windowEl.dataset.origH || '';
            windowEl.style.maxHeight = windowEl.dataset.origMaxH || '';
            windowEl.style.top = windowEl.dataset.origT || '';
            windowEl.style.left = windowEl.dataset.origL || '';
            if (windowId === 'winamp') removeWinampEmptySlots();
        }

        if (openWindows.size > 0) {
            setActiveWindow(Array.from(openWindows).pop());
        } else {
            activeWindow = null;
        }
    }, 200); // matches CSS animation duration
}

function minimizeWindow(windowId) {
    const windowEl = document.getElementById(windowId + '-window');
    if (!windowEl) return;

    windowEl.classList.remove('visible', 'active');
    windowEl.classList.add('inactive');

    const taskbarItem = document.querySelector(`.taskbar-item[data-window="${windowId}"]`);
    if (taskbarItem) taskbarItem.classList.remove('active');
}

function maximizeWindow(windowId) {
    const windowEl = document.getElementById(windowId + '-window');
    if (!windowEl) return;
    const isMobile = window.innerWidth <= 768;

    if (windowEl.classList.contains('maximized')) {
        // Restore to original size
        windowEl.classList.remove('maximized');
        windowEl.style.width = windowEl.dataset.origW || '';
        windowEl.style.height = windowEl.dataset.origH || '';
        windowEl.style.maxHeight = windowEl.dataset.origMaxH || '';
        windowEl.style.top = windowEl.dataset.origT || '';
        windowEl.style.left = windowEl.dataset.origL || '';

        // Winamp: remove empty playlist slots
        if (windowId === 'winamp') {
            removeWinampEmptySlots();
        }
    } else {
        // Save current dimensions before maximizing
        windowEl.dataset.origW = windowEl.style.width;
        windowEl.dataset.origH = windowEl.style.height;
        windowEl.dataset.origMaxH = windowEl.style.maxHeight;
        windowEl.dataset.origT = windowEl.style.top;
        windowEl.dataset.origL = windowEl.style.left;

        windowEl.classList.add('maximized');

        if (isMobile) {
            // Mobile: much taller + slightly wider, pinned near top
            windowEl.style.width = '94vw';
            windowEl.style.height = '80vh';
            windowEl.style.maxHeight = '80vh';
            windowEl.style.top = '1%';
            windowEl.style.left = '3vw';

            // Winamp: add empty playlist slots to fill the extra height
            if (windowId === 'winamp') {
                addWinampEmptySlots();
            }
        } else {
            // Desktop: true fullscreen minus taskbar
            const taskbarH = document.querySelector('.taskbar').offsetHeight;
            windowEl.style.width = '100vw';
            windowEl.style.height = `calc(100vh - ${taskbarH}px)`;
            windowEl.style.maxHeight = 'none';
            windowEl.style.top = '0';
            windowEl.style.left = '0';
        }
    }

    // Recalculate gallery zoom after maximize/restore (with small delay for CSS to apply)
    if (windowId === 'editorial') {
        setTimeout(() => {
            if (window.recalculateGalleryZoom) {
                window.recalculateGalleryZoom();
            }
        }, 100);
    }
}

// Winamp: add/remove separators between tracks + empty placeholder slots when maximized
function addWinampEmptySlots() {
    const playlist = document.getElementById('winamp-playlist');
    if (!playlist) return;
    removeWinampEmptySlots(); // clean first

    const tracks = playlist.querySelectorAll('.winamp-track:not(.winamp-empty-slot)');
    const sepColor = '#2a1a3e';

    // Add a separator line BETWEEN each real track (insert before each track except the first)
    tracks.forEach((track, i) => {
        if (i > 0) {
            const sep = document.createElement('div');
            sep.className = 'winamp-empty-slot';
            sep.style.cssText = `height:1px;background:${sepColor};margin:0 4px;`;
            track.parentNode.insertBefore(sep, track);
        }
    });

    // After the last track: separator, then empty placeholder rows repeating
    // (line, empty space, line, empty space...) like slots for songs not yet added
    const numPlaceholders = 10;
    for (let i = 0; i < numPlaceholders; i++) {
        // Separator line
        const sep = document.createElement('div');
        sep.className = 'winamp-empty-slot';
        sep.style.cssText = `height:1px;background:${sepColor};margin:0 4px;`;
        playlist.appendChild(sep);

        // Empty track placeholder (same height as a real track, but empty)
        const empty = document.createElement('div');
        empty.className = 'winamp-track winamp-empty-slot';
        empty.innerHTML = '&nbsp;';
        empty.style.cssText = 'cursor:default;color:transparent;';
        playlist.appendChild(empty);
    }
    // Final separator at the bottom
    const lastSep = document.createElement('div');
    lastSep.className = 'winamp-empty-slot';
    lastSep.style.cssText = `height:1px;background:${sepColor};margin:0 4px;`;
    playlist.appendChild(lastSep);
}

function removeWinampEmptySlots() {
    document.querySelectorAll('.winamp-empty-slot').forEach(el => el.remove());
}

function setActiveWindow(windowId) {
    document.querySelectorAll('.window').forEach(w => {
        w.classList.remove('active');
        w.classList.add('inactive');
    });
    document.querySelectorAll('.taskbar-item').forEach(t => {
        t.classList.remove('active');
    });

    const windowEl = document.getElementById(windowId + '-window');
    if (windowEl) {
        windowEl.classList.add('active');
        windowEl.classList.remove('inactive');
        windowEl.style.zIndex = ++zIndexCounter;
        activeWindow = windowId;
    }

    const taskbarItem = document.querySelector(`.taskbar-item[data-window="${windowId}"]`);
    if (taskbarItem) taskbarItem.classList.add('active');
}

function toggleWindow(windowId) {
    const windowEl = document.getElementById(windowId + '-window');
    if (!windowEl) return;

    if (windowEl.classList.contains('visible') && activeWindow === windowId) {
        minimizeWindow(windowId);
    } else {
        windowEl.classList.add('visible');
        setActiveWindow(windowId);
    }
}

// ===== TASKBAR =====
function addToTaskbar(windowId) {
    const container = document.getElementById('taskbar-items');
    if (document.querySelector(`.taskbar-item[data-window="${windowId}"]`)) return;

    const item = document.createElement('div');
    item.className = 'taskbar-item';
    item.setAttribute('data-window', windowId);

    const fullTitle = windowTitles[windowId] || windowId;
    // On mobile: show only the emoji (first character using spread to handle multi-byte)
    if (window.innerWidth <= 768) {
        item.textContent = [...fullTitle][0] || fullTitle.slice(0, 2);
    } else {
        item.textContent = fullTitle;
    }

    item.addEventListener('click', () => toggleWindow(windowId));
    container.appendChild(item);
}

function removeFromTaskbar(windowId) {
    const item = document.querySelector(`.taskbar-item[data-window="${windowId}"]`);
    if (item) item.remove();
}

// ===== START MENU =====
function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    const btn = document.getElementById('start-button');
    menu.classList.toggle('visible');
    btn.classList.toggle('active');
}

function closeStartMenu() {
    document.getElementById('start-menu').classList.remove('visible');
    document.getElementById('start-button').classList.remove('active');
}

// ===== ICON SELECTION =====
function clearIconSelection() {
    document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
    selectedIcon = null;
}

// ===== DRAG & DROP =====
function initDrag() {
    // Mouse events
    document.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    // Touch events
    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);

    // Double-click on window header to maximize/restore
    document.addEventListener('dblclick', onHeaderDoubleClick);
}

// Double-click on title bar to maximize/restore window
function onHeaderDoubleClick(e) {
    const header = e.target.closest('.window-header');
    if (!header) return;

    // Don't trigger if clicking on window controls
    if (e.target.closest('.window-controls')) return;

    const windowEl = header.closest('.window');
    if (!windowEl) return;

    const windowId = windowEl.id.replace('-window', '');
    maximizeWindow(windowId);
}

function onDragStart(e) {
    const header = e.target.closest('.window-header');
    if (!header || e.target.closest('.window-controls')) return;

    // Don't drag on mobile (windows are fullscreen)
    if (window.innerWidth <= 768) return;

    draggedElement = header.closest('.window');
    const rect = draggedElement.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    const windowId = draggedElement.id.replace('-window', '');
    setActiveWindow(windowId);
    e.preventDefault();
}

function onTouchStart(e) {
    const header = e.target.closest('.window-header');
    if (!header || e.target.closest('.window-controls')) return;
    if (window.innerWidth <= 768) return;

    const touch = e.touches[0];
    draggedElement = header.closest('.window');
    const rect = draggedElement.getBoundingClientRect();
    dragOffset.x = touch.clientX - rect.left;
    dragOffset.y = touch.clientY - rect.top;

    const windowId = draggedElement.id.replace('-window', '');
    setActiveWindow(windowId);
}

function onDragMove(e) {
    if (!draggedElement) return;
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    const taskbarH = document.querySelector('.taskbar').offsetHeight;
    const maxX = window.innerWidth - 50;
    const maxY = window.innerHeight - taskbarH - 20;

    draggedElement.style.left = Math.max(-draggedElement.offsetWidth + 50, Math.min(x, maxX)) + 'px';
    draggedElement.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
}

function onTouchMove(e) {
    if (!draggedElement) return;
    const touch = e.touches[0];
    const x = touch.clientX - dragOffset.x;
    const y = touch.clientY - dragOffset.y;
    const taskbarH = document.querySelector('.taskbar').offsetHeight;
    const maxX = window.innerWidth - 50;
    const maxY = window.innerHeight - taskbarH - 20;

    draggedElement.style.left = Math.max(-draggedElement.offsetWidth + 50, Math.min(x, maxX)) + 'px';
    draggedElement.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    e.preventDefault();
}

function onDragEnd() {
    draggedElement = null;
}

// ===== CLOCK =====
function updateClock() {
    const clock = document.getElementById('clock');
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ===== DIALOG =====
function showDialog(title, message, icon) {
    const overlay = document.getElementById('dialog-overlay');
    document.getElementById('dialog-title').textContent = title;
    document.getElementById('dialog-message').textContent = message;
    const iconEl = document.getElementById('dialog-icon');
    iconEl.className = 'dialog-icon fas ' + (icon || 'fa-info-circle');
    overlay.classList.add('visible');
}

function closeDialog() {
    document.getElementById('dialog-overlay').classList.remove('visible');
}

// ===== BUNNY DEATH DIALOG =====
function showBunnyDeathDialog() {
    const bunny = document.getElementById('bunny-container');

    // Hide the bunny
    bunny.style.display = 'none';

    // Show custom error dialog
    const dialog = document.createElement('div');
    dialog.className = 'error-dialog bunny-death-dialog';
    dialog.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 99999;
        min-width: 320px;
        box-shadow: 4px 4px 0px rgba(0,0,0,0.3);
    `;

    dialog.innerHTML = `
        <div class="error-titlebar" style="padding: 4px 8px; font-size: 14px; cursor: move;">
            <span>Fatal Error</span>
            <div class="error-close" style="font-size: 12px; padding: 2px 6px;">✕</div>
        </div>
        <div class="error-body" style="padding: 16px 20px; flex-direction: row; gap: 16px; align-items: center;">
            <div class="error-icon" style="font-size: 32px; margin: 0;">💀</div>
            <div style="flex: 1;">
                <div style="font-size: 14px; margin-bottom: 12px;">Noooooooo, you killed him!!</div>
                <button class="error-ok bunny-respawn-btn" style="padding: 4px 20px; font-size: 13px;">Respawn</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    // Add event listeners
    const closeBtn = dialog.querySelector('.error-close');
    const respawnBtn = dialog.querySelector('.bunny-respawn-btn');

    closeBtn.addEventListener('click', () => closeBunnyDeathDialog(false));
    respawnBtn.addEventListener('click', () => closeBunnyDeathDialog(true));

    // Make dialog draggable
    const titlebar = dialog.querySelector('.error-titlebar');
    let isDragging = false;
    let startX, startY, dialogX, dialogY;

    titlebar.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('error-close')) return;
        isDragging = true;
        const rect = dialog.getBoundingClientRect();
        dialogX = rect.left;
        dialogY = rect.top;
        startX = e.clientX;
        startY = e.clientY;
        dialog.style.transform = 'none';
        dialog.style.left = dialogX + 'px';
        dialog.style.top = dialogY + 'px';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        dialog.style.left = (dialogX + dx) + 'px';
        dialog.style.top = (dialogY + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function closeBunnyDeathDialog(respawn) {
    const dialog = document.querySelector('.bunny-death-dialog');
    const bunny = document.getElementById('bunny-container');

    // Remove dialog
    if (dialog) dialog.remove();

    // Only bring bunny back if respawn was clicked
    if (respawn) {
        bunny.style.display = '';
        bunny.style.left = '';
        bunny.style.top = '';
        bunny.style.right = '8px';
        bunny.style.bottom = '52px';
        // Remove from recycle bin if it was there
        window.bunnyIsDead = false;
        removeDeadBunnyFromRecycle();
    } else {
        // Bunny is permanently dead - add to recycle bin
        window.bunnyIsDead = true;
        addDeadBunnyToRecycle();
    }
}

function addDeadBunnyToRecycle() {
    const recycleGrid = document.querySelector('.recycle-grid');
    if (!recycleGrid) return;

    // Check if already added
    if (document.getElementById('dead-bunny-item')) return;

    const deadBunnyItem = document.createElement('div');
    deadBunnyItem.className = 'recycle-item dead-bunny';
    deadBunnyItem.id = 'dead-bunny-item';
    deadBunnyItem.innerHTML = `
        <i class="fas fa-skull"></i>
        <span>deadbunny.gif</span>
    `;
    recycleGrid.appendChild(deadBunnyItem);

    // Update status bar count
    const statusBar = document.querySelector('#recycle-window .window-status-bar span');
    if (statusBar) {
        statusBar.textContent = '6 objects ✧';
    }
}

function removeDeadBunnyFromRecycle() {
    const deadBunnyItem = document.getElementById('dead-bunny-item');
    if (deadBunnyItem) {
        deadBunnyItem.remove();
        // Update status bar count
        const statusBar = document.querySelector('#recycle-window .window-status-bar span');
        if (statusBar) {
            statusBar.textContent = '5 objects ✧';
        }
    }
}

// ===== SHUTDOWN SCREEN (Game Over) =====
function showShutdownScreen() {
    // First show CRT turn-off effect
    const crtOff = document.createElement('div');
    crtOff.id = 'crt-off';
    document.body.appendChild(crtOff);

    // Trigger CRT animation
    setTimeout(() => {
        crtOff.classList.add('active');
    }, 10);

    // Create game over screen BEFORE removing CRT (so it's underneath)
    setTimeout(() => {
        const overlay = document.createElement('div');
        overlay.id = 'shutdown-screen';
        overlay.classList.add('active');
        overlay.innerHTML = `
            <div class="gameover-content">
                <div class="gameover-text">GAME OVER</div>
                <div class="gameover-score">SCORE: 9999</div>
                <div class="gameover-insert">INSERT COIN</div>
                <div class="gameover-credits">CREDITS: 0</div>
            </div>
        `;
        // Insert BEFORE crtOff so it appears underneath
        document.body.insertBefore(overlay, crtOff);

        // Now remove CRT (game over is already visible behind it)
        setTimeout(() => {
            crtOff.remove();
        }, 50);

        // Click to restart
        overlay.addEventListener('click', () => {
            // Keep screen black during reload
            overlay.innerHTML = '<div class="gameover-restarting">RESTARTING...</div>';
            setTimeout(() => {
                location.reload();
            }, 100);
        });
    }, 500);
}

// ===== LIGHTBOX =====
let lightboxImages = [];
let lightboxIndex = 0;

function openLightbox(images, index) {
    lightboxImages = images;
    lightboxIndex = index;
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = images[index];
    lightbox.classList.add('visible');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('visible');
}

function lightboxPrev() {
    if (lightboxImages.length === 0) return;
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    document.getElementById('lightbox-img').src = lightboxImages[lightboxIndex];
}

function lightboxNext() {
    if (lightboxImages.length === 0) return;
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
    document.getElementById('lightbox-img').src = lightboxImages[lightboxIndex];
}

// ===== EMAIL =====
function initEmail() {
    const sendBtn = document.getElementById('email-send-btn');
    sendBtn.addEventListener('click', async () => {
        const form = document.getElementById('email-form');
        const fromEmail = form.querySelector('[name="from_email"]').value;
        const subject = form.querySelector('[name="subject"]').value;
        const message = form.querySelector('[name="message"]').value;

        if (!fromEmail || !subject || !message) {
            showDialog('Outlook Express', 'Please fill in all fields.', 'fa-exclamation-triangle');
            return;
        }

        // Disable button while sending
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const response = await fetch('https://formspree.io/f/mdalkyoj', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    _subject: `[Portfolio] ${subject}`,
                    from: 'Website Outlook Express',
                    email: fromEmail,
                    subject: subject,
                    message: message
                })
            });

            if (response.ok) {
                showDialog('Outlook Express', 'Message sent!! 🐰 Sandra will get back to you asap', 'fa-check-circle');
                form.reset();
            } else {
                showDialog('Outlook Express', 'Failed to send message. Please try again.', 'fa-exclamation-triangle');
            }
        } catch (error) {
            showDialog('Outlook Express', 'Failed to send message. Please try again.', 'fa-exclamation-triangle');
        }

        // Re-enable button
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send';
    });
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Splash screen
    initSplash();

    // Drag & drop
    initDrag();

    // Clock
    updateClock();
    setInterval(updateClock, 30000);

    // Email
    initEmail();

    // Desktop icon clicks (single click = open)
    document.querySelectorAll('.icon[data-window]').forEach(icon => {
        icon.addEventListener('click', () => {
            clearIconSelection();
            icon.classList.add('selected');
            selectedIcon = icon;
            const windowId = icon.getAttribute('data-window');
            openWindow(windowId);
        });
    });

    // Window controls (minimize, maximize, close)
    document.querySelectorAll('.window-button[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const action = btn.getAttribute('data-action');
            const windowId = btn.getAttribute('data-window');
            if (action === 'close') closeWindow(windowId);
            if (action === 'minimize') minimizeWindow(windowId);
            if (action === 'maximize') maximizeWindow(windowId);
        });
    });

    // Click on window to bring to front
    document.querySelectorAll('.window').forEach(w => {
        w.addEventListener('mousedown', () => {
            const windowId = w.id.replace('-window', '');
            if (openWindows.has(windowId)) setActiveWindow(windowId);
        });
    });

    // Start button
    document.getElementById('start-button').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStartMenu();
    });

    // Start menu items
    document.querySelectorAll('.start-menu-item[data-window]').forEach(item => {
        item.addEventListener('click', () => {
            openWindow(item.getAttribute('data-window'));
        });
    });

    // Shutdown button
    document.getElementById('shutdown-btn').addEventListener('click', () => {
        closeStartMenu();
        showShutdownScreen();
    });

    // Close start menu on click outside
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('start-menu');
        const btn = document.getElementById('start-button');
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            closeStartMenu();
        }
    });

    // Clear icon selection on desktop click
    document.getElementById('desktop').addEventListener('click', (e) => {
        if (e.target.id === 'desktop' || e.target.classList.contains('crt-effect')) {
            clearIconSelection();
        }
    });

    // Dialog close
    document.getElementById('dialog-ok').addEventListener('click', closeDialog);
    document.getElementById('dialog-close').addEventListener('click', closeDialog);

    // Lightbox
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev').addEventListener('click', lightboxPrev);
    document.getElementById('lightbox-next').addEventListener('click', lightboxNext);

    document.getElementById('lightbox').addEventListener('click', (e) => {
        if (e.target.id === 'lightbox') closeLightbox();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeStartMenu();
            closeLightbox();
            closeDialog();
        }
        if (document.getElementById('lightbox').classList.contains('visible')) {
            if (e.key === 'ArrowLeft') lightboxPrev();
            if (e.key === 'ArrowRight') lightboxNext();
        }
    });

    // Gallery item clicks (for future use when images are added)
    document.addEventListener('click', (e) => {
        const galleryItem = e.target.closest('.gallery-item');
        if (galleryItem) {
            const img = galleryItem.querySelector('img');
            if (!img) return;
            const fullSrc = img.getAttribute('data-full') || img.src;
            const gallery = galleryItem.closest('.gallery-grid');
            const items = Array.from(gallery.querySelectorAll('.gallery-item img'));
            const srcs = items.map(i => i.getAttribute('data-full') || i.src);
            const idx = items.indexOf(img);
            openLightbox(srcs, idx);
        }
    });

    // Prevent default drag
    document.addEventListener('dragstart', (e) => e.preventDefault());

    // ===== LAIN EFFECTS =====
    initGlitch();
    initStatusBarGlitch();
    // initNightMode(); // disabled

    // ===== SPARKLE PARTICLES =====
    createSparkles();
});

// ===== LAIN EFFECTS: GLITCH + NIGHT MODE + ERROR CASCADE =====

// --- Random screen glitch (horizontal jump) ---
function initGlitch() {
    function triggerGlitch() {
        const desktop = document.getElementById('desktop');
        if (!desktop) return;
        desktop.classList.add('glitching');
        setTimeout(() => desktop.classList.remove('glitching'), 150);
        // Schedule next glitch: random 15-45 seconds
        const next = (Math.random() * 30 + 15) * 1000;
        setTimeout(triggerGlitch, next);
    }
    // First glitch after 8-20 seconds
    setTimeout(triggerGlitch, (Math.random() * 12 + 8) * 1000);
}

// --- Status bar text glitch ---
function initStatusBarGlitch() {
    const glitchChars = '▓░▒█▀▄╬╠╣═║┼┤├┬┴♡エラー壊故障接続不明';

    function getGlitchTargets() {
        const targets = [];
        // 1. Visible status bars
        document.querySelectorAll('.window-status-bar').forEach(bar => {
            const win = bar.closest('.window');
            if (win && win.classList.contains('visible')) {
                const span = bar.querySelector('span') || bar;
                targets.push(span);
            }
        });
        // 2. Taskbar items
        document.querySelectorAll('.taskbar-item').forEach(item => targets.push(item));
        // 3. Window title bars of visible windows
        document.querySelectorAll('.window.visible .window-title').forEach(title => targets.push(title));
        // 4. Clock
        const clock = document.querySelector('.taskbar-clock');
        if (clock) targets.push(clock);
        return targets;
    }

    function glitchText() {
        const targets = getGlitchTargets();
        if (targets.length === 0) {
            setTimeout(glitchText, 10000);
            return;
        }

        const target = targets[Math.floor(Math.random() * targets.length)];
        const origText = target.textContent;

        // Corrupt the text
        let corrupted = '';
        for (let i = 0; i < origText.length; i++) {
            if (Math.random() < 0.4) {
                corrupted += glitchChars[Math.floor(Math.random() * glitchChars.length)];
            } else {
                corrupted += origText[i];
            }
        }
        target.textContent = corrupted;

        // Restore after brief moment
        setTimeout(() => { target.textContent = origText; }, 200);

        // Schedule next glitch: 20-60 seconds
        const next = (Math.random() * 40 + 20) * 1000;
        setTimeout(glitchText, next);
    }
    // Start after 12 seconds
    setTimeout(glitchText, 12000);
}

// --- Night mode overlay (20:00 - 06:00) ---
function initNightMode() {
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour < 6;

    if (isNight) {
        const overlay = document.createElement('div');
        overlay.className = 'night-overlay';
        document.getElementById('desktop').appendChild(overlay);
    }
}

// --- Error window cascade ---
const errorMessages = [
    '?????',
    'エラー',
    '接続不明',
    'close me ♡',
    'are you there?',
    '見てる？',
    'undefined',
    '///???///',
    'no signal',
    '誰もいない',
    'present day ♡',
    '記憶 not found',
    'layer 07',
    'who am i',
    '存在しない'
];

function spawnErrorDialog(x, y, message) {
    const dialog = document.createElement('div');
    dialog.className = 'error-dialog';
    dialog.style.left = x + 'px';
    dialog.style.top = y + 'px';

    const title = Math.random() < 0.5 ? 'Error' : 'Warning';
    const icon = Math.random() < 0.5 ? '⚠️' : '❌';

    dialog.innerHTML = `
        <div class="error-titlebar">
            <span>${title}</span>
            <div class="error-close" onclick="this.closest('.error-dialog').remove()">✕</div>
        </div>
        <div class="error-body">
            <div class="error-icon">${icon}</div>
            <div>${message}</div>
            <button class="error-ok" onclick="this.closest('.error-dialog').remove()">OK</button>
        </div>
    `;

    document.body.appendChild(dialog);
    return dialog;
}

function spawnErrorCascade(count, baseX, baseY) {
    for (let i = 0; i < count; i++) {
        const x = baseX + i * 22;
        const y = baseY + i * 22;
        const msg = errorMessages[Math.floor(Math.random() * errorMessages.length)];
        setTimeout(() => spawnErrorDialog(x, y, msg), i * 120);
    }
}

// Error cascade after splash screen
function initSplashErrors() {
    const centerX = Math.max(100, (window.innerWidth / 2) - 180);
    const centerY = Math.max(80, (window.innerHeight / 2) - 160);
    spawnErrorCascade(5, centerX, centerY);
}

// Error cascade on window close (25% chance)
function maybeSpawnCloseErrors() {
    if (Math.random() < 0.25) {
        const x = 200 + Math.random() * (window.innerWidth - 500);
        const y = 100 + Math.random() * (window.innerHeight - 400);
        spawnErrorCascade(3, x, y);
    }
}

// ===== SPARKLES =====
function createSparkles() {
    const desktop = document.getElementById('desktop');
    if (!desktop || window.innerWidth <= 768) return;

    function spawnSparkle() {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        const size = Math.random() * 4 + 2;
        const x = Math.random() * 100;
        const duration = Math.random() * 8 + 6;
        const delay = Math.random() * 2;

        sparkle.style.cssText = `
            --size: ${size}px;
            left: ${x}%;
            bottom: -10px;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;

        desktop.appendChild(sparkle);

        setTimeout(() => {
            sparkle.remove();
        }, (duration + delay) * 1000);
    }

    // Spawn sparkles periodically
    setInterval(spawnSparkle, 2000);
    // Initial batch
    for (let i = 0; i < 5; i++) {
        setTimeout(spawnSparkle, i * 400);
    }
}

// ===== CRT FLICKER — realistic old monitor effect =====
function initCRTFlicker() {
    // Skip on mobile
    if (window.innerWidth <= 768) return;

    // Create the flicker overlay element
    const flicker = document.createElement('div');
    flicker.id = 'crt-flicker';
    document.body.appendChild(flicker);

    // Randomly trigger flicker events
    function scheduleFlicker() {
        // Random delay between 2-8 seconds
        const delay = 2000 + Math.random() * 6000;
        setTimeout(() => {
            doFlicker();
            scheduleFlicker();
        }, delay);
    }

    function doFlicker() {
        // Only horizontal roll — band that sweeps down the screen
        doHorizontalRoll();
    }

    function doHorizontalRoll() {
        // Create a horizontal bright band that sweeps down the screen
        const band = document.createElement('div');
        band.style.cssText = `
            position: fixed;
            left: 0;
            width: 100%;
            height: 3px;
            background: rgba(255,255,255,0.12);
            pointer-events: none;
            z-index: 999998;
            top: -5px;
            transition: none;
        `;
        document.body.appendChild(band);

        let y = -5;
        const speed = 8 + Math.random() * 12; // px per frame
        function animateBand() {
            y += speed;
            band.style.top = y + 'px';
            if (y < window.innerHeight + 10) {
                requestAnimationFrame(animateBand);
            } else {
                band.remove();
            }
        }
        requestAnimationFrame(animateBand);
    }

    scheduleFlicker();
}

// Start CRT flicker after splash
document.addEventListener('DOMContentLoaded', () => {
    // Delay slightly so it starts after splash
    setTimeout(initCRTFlicker, 3000);
});

// ===== BUNNY DRAG =====
function initBunnyDrag() {
    const bunny = document.getElementById('bunny-container');
    if (!bunny) return;

    let isDragging = false;
    let startX, startY;
    let bunnyX, bunnyY;
    let isOverRecycleBin = false;

    // Full size depends on viewport (5x desktop, 4x mobile)
    function getFullSize() {
        return window.innerWidth <= 768
            ? { w: 248, h: 260 }
            : { w: 310, h: 325 };
    }

    // Get initial position from CSS
    function getBunnyPosition() {
        const rect = bunny.getBoundingClientRect();
        return { x: rect.left, y: rect.top };
    }

    function onStart(e) {
        isDragging = true;
        isOverRecycleBin = false;
        bunny.classList.add('dragging');

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const pos = getBunnyPosition();
        bunnyX = pos.x;
        bunnyY = pos.y;
        startX = clientX - bunnyX;
        startY = clientY - bunnyY;

        // Switch from right/bottom positioning to left/top
        bunny.style.left = bunnyX + 'px';
        bunny.style.top = bunnyY + 'px';
        bunny.style.right = 'auto';
        bunny.style.bottom = 'auto';

        e.preventDefault();
    }

    function onMove(e) {
        if (!isDragging) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const full = getFullSize();

        // Check if cursor is hovering over the recycle bin
        const recycleIcon = document.querySelector('.icon[data-window="recycle"]');
        if (recycleIcon) {
            const recycleRect = recycleIcon.getBoundingClientRect();
            const margin = 30;
            const isOver = (
                clientX >= recycleRect.left - margin &&
                clientX <= recycleRect.right + margin &&
                clientY >= recycleRect.top - margin &&
                clientY <= recycleRect.bottom + margin
            );

            if (isOver && !isOverRecycleBin) {
                // Entering recycle zone — shrink and slide to recycle bin center
                isOverRecycleBin = true;
                bunny.classList.add('over-recycle');
                const recycleCenterX = recycleRect.left + recycleRect.width / 2;
                const recycleCenterY = recycleRect.top + recycleRect.height / 2;
                bunny.style.left = (recycleCenterX - full.w / 2) + 'px';
                bunny.style.top = (recycleCenterY - full.h / 2) + 'px';
            } else if (!isOver && isOverRecycleBin) {
                // Leaving recycle zone — snap back to cursor instantly
                isOverRecycleBin = false;
                bunny.classList.remove('over-recycle');
                // Remove transition so position follows cursor without delay
                bunny.style.transition = 'transform 0.25s ease-out';
                bunny.style.transform = 'scale(1)';
                bunny.style.left = (clientX - startX) + 'px';
                bunny.style.top = (clientY - startY) + 'px';
                // Clear inline transition after scale animation finishes
                setTimeout(() => {
                    if (isDragging && !isOverRecycleBin) {
                        bunny.style.transition = '';
                        bunny.style.transform = '';
                    }
                }, 250);
            }
        }

        // Only follow cursor when NOT over recycle bin
        if (!isOverRecycleBin) {
            let newX = clientX - startX;
            let newY = clientY - startY;
            const maxX = window.innerWidth - full.w;
            const maxY = window.innerHeight - full.h;
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            bunny.style.left = newX + 'px';
            bunny.style.top = newY + 'px';
        }

        e.preventDefault();
    }

    function onEnd() {
        if (!isDragging) return;
        isDragging = false;

        const wasOverRecycle = isOverRecycleBin;

        // Restore classes and clear inline styles
        bunny.classList.remove('dragging');
        bunny.classList.remove('over-recycle');
        bunny.style.transition = '';
        bunny.style.transform = '';
        isOverRecycleBin = false;

        if (wasOverRecycle) {
            showBunnyDeathDialog();
        }
    }

    // Mouse events
    bunny.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);

    // Touch events
    bunny.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
}

// Init bunny drag after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initBunnyDrag();
});

// ===== ICON DRAG =====
function initIconDrag() {
    const icons = document.querySelectorAll('.icon[data-window]');
    let draggedIcon = null;
    let isDragging = false;
    let hasMoved = false;
    let startX, startY;
    let iconStartX, iconStartY;
    const dragThreshold = 5; // pixels before considering it a drag

    icons.forEach(icon => {
        function onStart(e) {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            draggedIcon = icon;
            hasMoved = false;
            isDragging = false;
            startX = clientX;
            startY = clientY;

            // Get current position relative to desktop
            const rect = icon.getBoundingClientRect();
            const desktop = document.getElementById('desktop');
            const desktopRect = desktop.getBoundingClientRect();
            iconStartX = rect.left - desktopRect.left;
            iconStartY = rect.top - desktopRect.top;
        }

        function onMove(e) {
            if (!draggedIcon || draggedIcon !== icon) return;

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            // Check if we've moved enough to start dragging
            if (!isDragging && (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold)) {
                isDragging = true;
                hasMoved = true;
                icon.classList.add('dragging');

                // Switch to absolute positioning when drag starts
                icon.style.position = 'absolute';
                icon.style.left = iconStartX + 'px';
                icon.style.top = iconStartY + 'px';
                // Remove grid placement
                icon.style.gridColumn = 'auto';
                icon.style.gridRow = 'auto';
            }

            if (isDragging) {
                const desktop = document.getElementById('desktop');
                const desktopRect = desktop.getBoundingClientRect();
                const taskbarHeight = document.querySelector('.taskbar').offsetHeight;

                let newX = iconStartX + deltaX;
                let newY = iconStartY + deltaY;

                // Constrain to desktop area
                const maxX = desktopRect.width - icon.offsetWidth;
                const maxY = desktopRect.height - taskbarHeight - icon.offsetHeight;
                newX = Math.max(0, Math.min(newX, maxX));
                newY = Math.max(0, Math.min(newY, maxY));

                icon.style.left = newX + 'px';
                icon.style.top = newY + 'px';

                e.preventDefault();
            }
        }

        function onEnd(e) {
            if (draggedIcon === icon) {
                icon.classList.remove('dragging');

                // If we dragged, prevent the click from opening the window
                if (hasMoved) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                draggedIcon = null;
                isDragging = false;
            }
        }

        // Mouse events
        icon.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);

        // Touch events
        icon.addEventListener('touchstart', onStart, { passive: true });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
    });

    // Prevent click when dragged
    icons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            if (hasMoved) {
                e.preventDefault();
                e.stopPropagation();
                hasMoved = false;
            }
        }, true);
    });
}

// Init icon drag after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Skip on mobile - icons are in grid
    if (window.innerWidth > 768) {
        initIconDrag();
    }
});

// ===== IMAGE VIEWER (for Photos) =====
let imageViewerCount = 0;

function openImageViewer(filename) {
    console.log('openImageViewer called with:', filename);
    const imagePath = photoFiles[filename];
    if (!imagePath) {
        console.error('No path found for:', filename);
        return;
    }
    console.log('Loading image from:', imagePath);

    // Create unique window ID
    imageViewerCount++;
    const windowId = `photo-${imageViewerCount}`;

    // Pre-load image to get dimensions
    const img = new Image();
    img.onerror = function() {
        console.error('Failed to load image:', imagePath);
    };
    img.onload = function() {
        console.log('Image loaded successfully:', imagePath);
        // Calculate window size based on image
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.8;
        let imgWidth = img.naturalWidth;
        let imgHeight = img.naturalHeight;

        // Scale down if too big
        if (imgWidth > maxWidth) {
            const ratio = maxWidth / imgWidth;
            imgWidth = maxWidth;
            imgHeight *= ratio;
        }
        if (imgHeight > maxHeight) {
            const ratio = maxHeight / imgHeight;
            imgHeight = maxHeight;
            imgWidth *= ratio;
        }

        // Detect mobile
        const isMobile = window.innerWidth <= 768;

        let winWidth, winHeight, left, top;
        if (isMobile) {
            // Mobile: centered window that fits in viewport
            winWidth = Math.min(window.innerWidth - 20, 360);
            winHeight = Math.min(window.innerHeight - 80, 600);
            left = Math.max(10, (window.innerWidth - winWidth) / 2);
            top = 10;
        } else {
            // Desktop: window size based on image + header + status bar
            winWidth = Math.round(imgWidth) + 4; // 2px border each side
            winHeight = Math.round(imgHeight) + 70; // header + menu + status

            // Random position
            left = 100 + (imageViewerCount * 30) % 200;
            top = 50 + (imageViewerCount * 25) % 150;
        }

        // Create window HTML
        const windowHTML = `
            <div class="window visible" id="${windowId}-window" style="top: ${top}px; left: ${left}px; width: ${winWidth}px; height: ${winHeight}px;">
                <div class="window-header">
                    <span class="window-title">🖼️ ${filename}</span>
                    <div class="window-controls">
                        <button class="window-button minimize-btn" data-action="minimize" data-window="${windowId}">_</button>
                        <button class="window-button maximize-btn" data-action="maximize" data-window="${windowId}">□</button>
                        <button class="window-button close-btn" data-action="close" data-window="${windowId}">×</button>
                    </div>
                </div>
                <div class="window-menu-bar">
                    <span class="menu-item">File</span>
                    <span class="menu-item">Edit</span>
                    <span class="menu-item">View</span>
                    <span class="menu-item">Help</span>
                </div>
                <div class="window-content imageviewer-content-fit">
                    <img src="${imagePath}" alt="${filename}">
                </div>
                <div class="window-status-bar">
                    <span>${filename} ✧</span>
                </div>
            </div>
        `;

        // Add to DOM
        document.getElementById('desktop').insertAdjacentHTML('beforeend', windowHTML);

        // Register window title
        windowTitles[windowId] = `🖼️ ${filename}`;

        // Setup window controls
        const newWindow = document.getElementById(`${windowId}-window`);
        newWindow.querySelectorAll('.window-button[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                const wId = btn.getAttribute('data-window');
                if (action === 'close') {
                    closeWindow(wId);
                    newWindow.remove(); // Remove from DOM
                }
                if (action === 'minimize') minimizeWindow(wId);
                if (action === 'maximize') maximizeWindow(wId);
            });
        });

        // Add to open windows and taskbar
        openWindows.add(windowId);
        setActiveWindow(windowId);
        addToTaskbar(windowId);
    };
    img.src = imagePath;
}

function initPhotoViewer() {
    const files = document.querySelectorAll('.explorer-file');
    console.log('initPhotoViewer: Found', files.length, 'explorer-file elements');
    files.forEach((file, i) => {
        file.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const filename = file.querySelector('.explorer-file-name').textContent;
            console.log('Photo clicked:', filename);
            openImageViewer(filename);
        });
    });
}

// Init photo viewer after DOM ready
document.addEventListener('DOMContentLoaded', initPhotoViewer);

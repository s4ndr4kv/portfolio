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
    'fotografia': '📷 Photography — 写真 ✧',
    'about': '🖥️ My Computer — マイコンピュータ',
    'notepad': '📝 CV.txt — メモ帳 ✧',
    'email': '📧 New Message — メール ♡',
    'paint': '🎨 untitled — ペイント ♡',
    'recycle': '🗑️ Recycle Bin — ごみ箱'
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
        { text: 'Copyright (C) 2024 Sandra Industries ✧', cls: 'dimmed', delay: 200 },
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
        // Auto-open Paint and Notepad on desktop only (not mobile)
        if (window.innerWidth > 768) {
            setTimeout(() => {
                openWindow('paint');
                setTimeout(() => {
                    openWindow('notepad');
                }, 150);
            }, 200);
        }
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
}

function closeWindow(windowId) {
    const windowEl = document.getElementById(windowId + '-window');
    if (!windowEl) return;

    // Reset maximized state so it reopens at normal size
    if (windowEl.classList.contains('maximized')) {
        windowEl.classList.remove('maximized');
        windowEl.style.width = windowEl.dataset.origW || '';
        windowEl.style.height = windowEl.dataset.origH || '';
        windowEl.style.maxHeight = windowEl.dataset.origMaxH || '';
        windowEl.style.top = windowEl.dataset.origT || '';
        windowEl.style.left = windowEl.dataset.origL || '';
        if (windowId === 'winamp') removeWinampEmptySlots();
    }

    // Animate close: shrink + fade out
    windowEl.classList.add('closing');
    openWindows.delete(windowId);
    removeFromTaskbar(windowId);

    setTimeout(() => {
        windowEl.classList.remove('visible', 'active', 'closing');
        windowEl.classList.add('inactive');

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
    sendBtn.addEventListener('click', () => {
        const form = document.getElementById('email-form');
        const fromEmail = form.querySelector('[name="from_email"]').value;
        const subject = form.querySelector('[name="subject"]').value;
        const message = form.querySelector('[name="message"]').value;

        if (!fromEmail || !subject || !message) {
            showDialog('Outlook Express', 'Por favor, rellena todos los campos.', 'fa-exclamation-triangle');
            return;
        }

        // For now, show success dialog. When you set up Formspree/EmailJS, this will actually send.
        showDialog('Outlook Express', '¡Mensaje enviado correctamente! ✉️ Sandra lo recibirá pronto.', 'fa-check-circle');
        form.reset();
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
        showDialog('Apagar equipo', 'Gracias por visitar el portfolio de Sandra ♡\n¿Seguro que quieres irte?', 'fa-power-off');
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

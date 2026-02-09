/*
 * Gallery — Folder View + Image Viewer
 * Windows Explorer style with folder navigation
 */

// Detect mobile
const isMobile = window.innerWidth <= 768;

// Base paths - use smaller images on mobile
const basePath = isMobile ? 'img/Illustration-mobile/' : 'img/Illustration/';

// Helper to detect video files
function isVideo(filename) {
    return /\.(mp4|mov|webm)$/i.test(filename);
}

// Helper to get optimized video path (uses compressed version if available)
function getOptimizedVideoPath(folderPath, filename) {
    // For videos, try to use the -desktop.mp4 version
    if (isVideo(filename)) {
        const decoded = decodeURIComponent(filename);
        // Keep original extension in name to handle duplicates (e.g., file.mov and file.mp4)
        // Format: "originalname.originalext-desktop.mp4"
        const videoPath = folderPath + encodeURIComponent(decoded + '-desktop') + '.mp4';
        console.log('[Video] Loading:', videoPath);
        return videoPath;
    }
    return folderPath + filename;
}

// Folder configuration with images
const folderConfig = {
    'character-design': {
        name: 'Character Design',
        path: basePath + 'Character%20Design/',
        images: [
            // Videos first (replaces static versions of same illustrations)
            'copy_537F05B4-9A80-4703-9BAF-CA29B5E69A51.MOV',
            'Project%20Name%2026.MP4',  // Replaces E0081877-255B-41D1-AED1-D813EBDE2B53_1_102_o.jpeg
            // Optimized JPGs (max 2000px, quality 85)
            '29223947-303D-42AA-9289-8C5F68B5662F_1_201_a.jpeg',
            '3A99DE5A-1EAD-4946-8C5C-F00B95592FF5_1_105_c.jpeg',
            '61006B33-0100-4B51-9E01-9A133295D919_1_102_o.jpeg',
            '7664EE13-9DF0-4FBC-B651-1C8404A29B5C_1_201_a.jpeg',
            '97A24059-1B1E-49DC-86B1-D827A7548B79_1_105_c.jpeg',
            '9975D294-C7EB-4757-9665-B4975F37575B_1_105_c.jpeg',
            'CD7B311C-3CDB-4B15-B984-3836269FB3AE.jpg',
            'CEE58645-C6C9-40EE-8288-99C58986B33F_1_105_c.jpeg',
            'E835B217-81B6-4924-8890-04D933EA78CB_1_105_c.jpeg',
            'F0FC2259-337F-4136-8EFC-96DD06BECFC8_1_105_c.jpeg',
            'FE9F58FA-49DB-421B-9F22-293C43B18786_1_102_o.jpg'
        ]
    },
    'kidcore': {
        name: 'Kidcore',
        path: basePath + 'Kidcore/',
        images: [
            // Videos first (use compressed -desktop.mp4 versions)
            '2464c640229a47539fbac38cc5032a06.mov',
            'Project%20Name%201.mov',
            'Untitled_Artwork%203.mp4',
            'Untitled_Artwork.mp4',
            // Images (optimized JPGs)
            '9B6597D1-3B4C-4D4B-A877-054B152BDABD_1_102_o.jpg',
            'Facetune_01-10-2025-13-14-00.jpg',
            'Facetune_05-11-2025-18-10-18.jpg',
            'IMG_4083.jpg',
            'IMG_5056.jpg',
            'IMG_6311.jpg',
            'IMG_6841.jpg',
            'IMG_6846.jpg',
            'Untitled_Artwork%2011.jpg',
            'Untitled_Artwork%2015.jpg',
            'Untitled_Artwork%202.jpg',
            'Untitled_Artwork%203.jpg',
            'Untitled_Artwork%205.jpg',
            'Untitled_Artwork%209.jpg'
        ]
    },
    'narrative': {
        name: 'Narrative',
        path: basePath + 'Narrative/',
        images: [
            // Videos first (use compressed -desktop.mp4 versions)
            '44ce761d37924a7aafb5a8607fa65467.mov',
            'Project%20Name%2038%202.mov',
            'Project%20Name%2038%203.mov',
            'Project%20Name%2041.mp4',
            'Project%20Name%2043.mp4',
            'Project%20Name%2044.mov',
            'Project%20Name%2045.mov',
            'Project%20Name%2045.mp4',
            'Project%20Name%2047.mov',
            'Project%20Name%2054.mp4',
            'Project%20Name%2055.mp4',
            // Images (optimized JPGs)
            'C6D0EEAA-D0D9-4FB6-9E0C-6189B8C6F12C_1_102_o.jpg',
            'Facetune_05-11-2025-18-10-18.jpg',
            'Facetune_08-12-2024-22-49-05.jpg',
            'Facetune_10-12-2024-16-18-51.jpg',
            'Facetune_18-12-2024-12-39-41.jpg',
            'Facetune_19-12-2024-15-10-00.jpg',
            'Facetune_21-12-2024-21-33-39.jpg',
            'Facetune_22-12-2024-19-40-04.jpg',
            'Facetune_26-12-2024-01-11-44.jpg',
            'IMG_3978.jpg',
            'IMG_4008.jpg',
            'IMG_4024.jpg',
            'IMG_4083.jpg',
            'IMG_4199.jpg',
            'Untitled_Artwork%203.jpg'
        ]
    },
    'photography': {
        name: 'Photography',
        path: 'img/fotografia/',
        images: [
            'IMG_1752825135453.JPEG',
            'IMG_1753169082772.JPEG',
            'IMG_1770068868969.JPEG',
            'IMG_1770068869192.JPEG',
            'IMG_1770072373044.jpg'
        ]
    }
};

// State
let currentFolder = null;
let currentFolderId = null;
let currentImageIndex = 0;
let currentZoom = 100; // Zoom level percentage
let baseZoom = 100; // Base zoom for vertical images (calculated to fill width)
let isVerticalCrop = false; // Track if current image is very vertical

// Pan/drag state for zoomed images
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let panOffsetX = 0;
let panOffsetY = 0;

// Image dimensions for pan limits
let imageNaturalWidth = 0;
let imageNaturalHeight = 0;
let containerWidth = 0;
let containerHeight = 0;

// DOM elements (initialized on load)
let explorerList, viewerHeader, viewerMain, viewerThumbs;
let viewerImage, viewerTitle, viewerCount;
let explorerPath, explorerStatus;

function initGallery() {
    explorerList = document.getElementById('editorial-folders');
    viewerHeader = document.getElementById('editorial-viewer-header');
    viewerMain = document.getElementById('editorial-viewer-main');
    viewerThumbs = document.getElementById('editorial-viewer-thumbs');
    viewerImage = document.querySelector('.viewer-image');
    viewerTitle = document.querySelector('.viewer-title');
    viewerCount = document.querySelector('.viewer-count');
    explorerPath = document.getElementById('explorer-path');
    explorerStatus = document.getElementById('explorer-status');

    if (!explorerList) return;

    // List item click handlers (right panel)
    document.querySelectorAll('.explorer-list-item').forEach(item => {
        item.addEventListener('click', () => {
            const folderId = item.getAttribute('data-folder');
            openFolder(folderId);
        });
    });

    // Tree row click handlers (left sidebar) - new structure with .tree-row
    document.querySelectorAll('.tree-row[data-folder]').forEach(row => {
        row.addEventListener('click', (e) => {
            e.stopPropagation();
            const folderId = row.getAttribute('data-folder');

            // Update tree selection
            document.querySelectorAll('.tree-row').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');

            if (folderId === 'root') {
                closeFolder();
            } else {
                openFolder(folderId);
            }
        });
    });

    // Back button in viewer
    document.querySelector('.viewer-back')?.addEventListener('click', closeFolder);

    // Sidebar close button - collapses the tree panel
    document.querySelector('.explorer-sidebar-close')?.addEventListener('click', toggleSidebar);

    // Explorer toolbar buttons
    document.getElementById('explorer-back')?.addEventListener('click', closeFolder);
    document.getElementById('explorer-up')?.addEventListener('click', closeFolder);

    // Navigation buttons
    document.querySelector('.viewer-prev')?.addEventListener('click', prevImage);
    document.querySelector('.viewer-next')?.addEventListener('click', nextImage);

    // Zoom controls
    document.getElementById('zoom-in')?.addEventListener('click', zoomIn);
    document.getElementById('zoom-out')?.addEventListener('click', zoomOut);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!currentFolder) return;
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'Escape') closeFolder();
        if (e.key === '+' || e.key === '=') zoomIn();
        if (e.key === '-') zoomOut();
    });

    // Select Illustration (root) in tree by default
    document.querySelector('.tree-row[data-folder="root"]')?.classList.add('selected');
}

function openFolder(folderId) {
    const folder = folderConfig[folderId];
    if (!folder || folder.images.length === 0) return;

    currentFolder = folder;
    currentFolderId = folderId;
    currentImageIndex = 0;

    // Resize window to be as TALL as possible for better image viewing
    resizeWindowForViewer();

    // Update tree selection (using .tree-row now)
    document.querySelectorAll('.tree-row').forEach(r => r.classList.remove('selected'));
    document.querySelector(`.tree-row[data-folder="${folderId}"]`)?.classList.add('selected');

    // Update address bar
    if (explorerPath) {
        // Photography has its own path, others are under Illustration
        const addressPath = folderId === 'photography'
            ? `C:\\Sandra\\Photography`
            : `C:\\Sandra\\Illustration\\${folder.name}`;
        explorerPath.textContent = addressPath;
    }

    // Update status bar
    if (explorerStatus) {
        explorerStatus.textContent = `${folder.images.length} object(s) ✧`;
    }

    // Switch views - hide folder list, show viewer
    explorerList.classList.add('hidden');
    viewerHeader.classList.remove('hidden');
    viewerMain.classList.remove('hidden');
    viewerThumbs.classList.remove('hidden');

    // Update viewer title
    viewerTitle.textContent = folder.name;

    // Build thumbnails
    buildThumbnails();

    // Show first image
    showImage(0);
}

// Resize the Illustration window IN PLACE to be taller and wider for image viewing
// Uses 4:5 aspect ratio for desktop, maximizes on mobile
function resizeWindowForViewer() {
    const windowEl = document.getElementById('editorial-window');
    if (!windowEl) return;

    const isMobile = window.innerWidth <= 768;
    const taskbarH = document.querySelector('.taskbar')?.offsetHeight || 46;
    const margin = isMobile ? 10 : 30;

    // Save original dimensions for restore (if not already saved)
    if (!windowEl.dataset.viewerOrigH) {
        windowEl.dataset.viewerOrigW = windowEl.style.width;
        windowEl.dataset.viewerOrigH = windowEl.style.height;
        windowEl.dataset.viewerOrigMaxH = windowEl.style.maxHeight;
    }

    if (isMobile) {
        // Mobile: MAXIMIZE the window using the existing maximizeWindow function
        const windowId = 'editorial';
        if (typeof maximizeWindow === 'function' && !windowEl.classList.contains('maximized')) {
            maximizeWindow(windowId);
        }
    } else {
        // Desktop: use 4:5 aspect ratio (width:height)
        const rect = windowEl.getBoundingClientRect();
        const currentTop = rect.top;
        const availableHeight = window.innerHeight - currentTop - taskbarH - margin;

        // Calculate width based on 4:5 aspect ratio
        // 4:5 means width = height * 0.8
        const targetHeight = availableHeight;
        const targetWidth = Math.round(targetHeight * 0.8);

        // Ensure minimum width of 600px and max of 1000px
        const finalWidth = Math.max(600, Math.min(targetWidth, 1000));

        windowEl.style.width = `${finalWidth}px`;
        windowEl.style.height = `${targetHeight}px`;
        windowEl.style.maxHeight = `${targetHeight}px`;
    }
}

function closeFolder() {
    currentFolder = null;
    currentFolderId = null;

    // Restore original window size
    restoreWindowFromViewer();

    // Update tree selection back to Illustration (root)
    document.querySelectorAll('.tree-row').forEach(r => r.classList.remove('selected'));
    document.querySelector('.tree-row[data-folder="root"]')?.classList.add('selected');

    // Update address bar
    if (explorerPath) {
        explorerPath.textContent = 'C:\\Sandra\\Illustration';
    }

    // Update status bar
    if (explorerStatus) {
        explorerStatus.textContent = '3 object(s) ✧';
    }

    // Show folder list, hide viewer
    explorerList.classList.remove('hidden');
    viewerHeader.classList.add('hidden');
    viewerMain.classList.add('hidden');
    viewerThumbs.classList.add('hidden');

    // Re-open sidebar when going back to folder view
    const sidebar = document.querySelector('.explorer-sidebar');
    if (sidebar) {
        sidebar.classList.remove('collapsed');
    }
}

// Toggle sidebar visibility (collapse/expand the tree panel)
function toggleSidebar() {
    const sidebar = document.querySelector('.explorer-sidebar');
    if (!sidebar) return;

    sidebar.classList.toggle('collapsed');
}

// Restore window to original size when closing viewer (position stays the same)
function restoreWindowFromViewer() {
    const windowEl = document.getElementById('editorial-window');
    if (!windowEl) return;

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // Mobile: restore from maximized state using maximizeWindow toggle
        if (windowEl.classList.contains('maximized') && typeof maximizeWindow === 'function') {
            maximizeWindow('editorial');
        }
    } else if (windowEl.dataset.viewerOrigH) {
        // Desktop: restore saved dimensions
        windowEl.style.width = windowEl.dataset.viewerOrigW || '';
        windowEl.style.height = windowEl.dataset.viewerOrigH || '';
        windowEl.style.maxHeight = windowEl.dataset.viewerOrigMaxH || '';
    }

    // Clear saved dimensions
    delete windowEl.dataset.viewerOrigW;
    delete windowEl.dataset.viewerOrigH;
    delete windowEl.dataset.viewerOrigMaxH;
}

function showImage(index) {
    if (!currentFolder) return;

    const files = currentFolder.images;
    currentImageIndex = index;

    // Wrap around
    if (currentImageIndex < 0) currentImageIndex = files.length - 1;
    if (currentImageIndex >= files.length) currentImageIndex = 0;

    const filename = files[currentImageIndex];
    // Use optimized video path if available, otherwise use original
    const filePath = isVideo(filename)
        ? getOptimizedVideoPath(currentFolder.path, filename)
        : currentFolder.path + filename;

    // Reset zoom and pan when changing images
    currentZoom = 100;
    baseZoom = 100;
    isVerticalCrop = false;
    panOffsetX = 0;
    panOffsetY = 0;

    // Zoom controls HTML
    const zoomControlsHTML = `
        <div class="viewer-zoom-controls">
            <button class="viewer-zoom-btn" id="zoom-out">−</button>
            <span class="viewer-zoom-level" id="zoom-level">100%</span>
            <button class="viewer-zoom-btn" id="zoom-in">+</button>
        </div>
    `;

    // Check if it's a video or image
    if (isVideo(filename)) {
        // Replace img with video element - use optimized compressed version
        viewerMain.innerHTML = `
            <button class="viewer-prev">◀</button>
            <video class="viewer-image" src="${filePath}" loop autoplay muted playsinline webkit-playsinline preload="auto"></video>
            <button class="viewer-next">▶</button>
            ${zoomControlsHTML}
        `;

        // Force play on mobile (some browsers need this)
        const videoEl = viewerMain.querySelector('video.viewer-image');
        videoEl.play().catch(e => console.log('Autoplay prevented:', e));
        // Re-attach navigation listeners
        viewerMain.querySelector('.viewer-prev')?.addEventListener('click', prevImage);
        viewerMain.querySelector('.viewer-next')?.addEventListener('click', nextImage);

        // Attach zoom listeners
        document.getElementById('zoom-in')?.addEventListener('click', zoomIn);
        document.getElementById('zoom-out')?.addEventListener('click', zoomOut);

        // Check if video is very vertical and apply real zoom
        const video = viewerMain.querySelector('video.viewer-image');
        video.addEventListener('error', (e) => {
            console.error('[Video Error] Failed to load video:', filePath, e);
        });
        video.addEventListener('loadedmetadata', () => {
            // Store natural dimensions for pan limit calculations
            imageNaturalWidth = video.videoWidth;
            imageNaturalHeight = video.videoHeight;

            // Get container dimensions
            containerWidth = viewerMain.clientWidth;
            containerHeight = viewerMain.clientHeight;

            // On mobile, don't apply automatic zoom - let user control it
            const isMobileView = window.innerWidth <= 768;
            if (isMobileView) {
                isVerticalCrop = false;
                baseZoom = 100;
                currentZoom = 100;
                return;
            }

            const aspectRatio = video.videoHeight / video.videoWidth;

            if (aspectRatio > 1.5) {
                video.classList.add('vertical-crop');
                isVerticalCrop = true;

                // Calculate zoom needed to fill the container width
                const containerAspect = containerWidth / containerHeight;
                const videoAspect = video.videoWidth / video.videoHeight;
                baseZoom = Math.round((containerAspect / videoAspect) * 100);
                baseZoom = Math.max(100, baseZoom);

                currentZoom = baseZoom;
                applyZoom();
            } else {
                isVerticalCrop = false;
                baseZoom = 100;
                currentZoom = 100;
            }
        });

        // Attach pan listeners for video
        attachPanListeners(video);
    } else {
        // Check if we need to replace video with img
        const currentMedia = viewerMain.querySelector('.viewer-image');
        if (!currentMedia || currentMedia.tagName === 'VIDEO') {
            viewerMain.innerHTML = `
                <button class="viewer-prev">◀</button>
                <img class="viewer-image" src="${filePath}" alt="illustration">
                <button class="viewer-next">▶</button>
                ${zoomControlsHTML}
            `;
            viewerMain.querySelector('.viewer-prev')?.addEventListener('click', prevImage);
            viewerMain.querySelector('.viewer-next')?.addEventListener('click', nextImage);

            // Attach zoom listeners
            document.getElementById('zoom-in')?.addEventListener('click', zoomIn);
            document.getElementById('zoom-out')?.addEventListener('click', zoomOut);

            viewerImage = viewerMain.querySelector('.viewer-image');

            // Attach pan listeners for image
            attachPanListeners(viewerImage);
        } else {
            viewerImage.src = filePath;
            viewerImage.classList.remove('vertical-crop');
            viewerImage.style.transform = '';
            // Update zoom display
            const zoomLevel = document.getElementById('zoom-level');
            if (zoomLevel) zoomLevel.textContent = '100%';
        }

        // Check if image is very vertical and apply real zoom
        const img = viewerMain.querySelector('img.viewer-image');
        if (img) {
            img.onload = () => {
                // Store natural dimensions for pan limit calculations
                imageNaturalWidth = img.naturalWidth;
                imageNaturalHeight = img.naturalHeight;

                // Get container dimensions
                const container = viewerMain;
                containerWidth = container.clientWidth;
                containerHeight = container.clientHeight;

                // On mobile, don't apply automatic zoom - let user control it
                const isMobileView = window.innerWidth <= 768;
                if (isMobileView) {
                    img.classList.remove('vertical-crop');
                    isVerticalCrop = false;
                    baseZoom = 100;
                    currentZoom = 100;
                    return;
                }

                const aspectRatio = img.naturalHeight / img.naturalWidth;

                // If image is very vertical (taller than 3:2), auto-zoom to fill width
                if (aspectRatio > 1.5) {
                    img.classList.add('vertical-crop');
                    isVerticalCrop = true;

                    // Calculate zoom needed to fill the container width
                    // First, find what the displayed height would be at 100% (contain mode)
                    const containerAspect = containerWidth / containerHeight;
                    const imageAspect = img.naturalWidth / img.naturalHeight;

                    // At 100%, the image fits by height (since it's very tall)
                    // We want to zoom so it fills by width instead
                    // Zoom factor = container aspect / image aspect
                    baseZoom = Math.round((containerAspect / imageAspect) * 100);
                    // Ensure minimum base zoom of 100
                    baseZoom = Math.max(100, baseZoom);

                    currentZoom = baseZoom;

                    // Apply the zoom immediately
                    applyZoom();
                } else {
                    img.classList.remove('vertical-crop');
                    isVerticalCrop = false;
                    baseZoom = 100;
                    currentZoom = 100;
                }
            };
        }
    }

    // Update counter
    viewerCount.textContent = `${currentImageIndex + 1} / ${files.length}`;

    // Update active thumbnail
    document.querySelectorAll('.viewer-thumb').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === currentImageIndex);
    });

    // Scroll thumbnail into view
    const activeThumb = document.querySelector('.viewer-thumb.active');
    if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

function prevImage() {
    showImage(currentImageIndex - 1);
}

function nextImage() {
    showImage(currentImageIndex + 1);
}

function zoomIn() {
    // Max zoom is 200% or baseZoom + 100%, whichever is higher
    const maxZoom = Math.max(200, baseZoom + 100);
    if (currentZoom < maxZoom) {
        currentZoom += 25;
        applyZoom();
    }
}

function zoomOut() {
    // Min zoom is 25% to allow seeing full image
    const minZoom = 25;
    if (currentZoom > minZoom) {
        currentZoom -= 25;
        if (currentZoom < minZoom) currentZoom = minZoom;
        applyZoom();
    }
}

function resetZoom() {
    // Reset to base zoom (which might be > 100 for cropped images)
    currentZoom = baseZoom;
    panOffsetX = 0;
    panOffsetY = 0;
    applyZoom();
}

function applyZoom() {
    const media = viewerMain?.querySelector('.viewer-image');
    const zoomLevel = document.getElementById('zoom-level');

    if (media) {
        const scaleValue = currentZoom / 100;

        // Clamp pan offsets to image boundaries
        clampPanOffsets();

        // Apply transform for any zoom level
        media.style.transform = `scale(${scaleValue}) translate(${panOffsetX}px, ${panOffsetY}px)`;
        media.style.transformOrigin = 'center center';

        // Show grab cursor if panning is possible
        const containerRect = viewerMain.getBoundingClientRect();
        const canPan = (media.clientWidth * scaleValue > containerRect.width) ||
                       (media.clientHeight * scaleValue > containerRect.height);
        media.style.cursor = canPan ? 'grab' : '';
    }

    if (zoomLevel) {
        zoomLevel.textContent = `${currentZoom}%`;
    }
}

// Calculate and clamp pan offsets so image doesn't go beyond its boundaries
function clampPanOffsets() {
    if (!viewerMain) {
        panOffsetX = 0;
        panOffsetY = 0;
        return;
    }

    const media = viewerMain.querySelector('.viewer-image');
    if (!media) return;

    const containerRect = viewerMain.getBoundingClientRect();

    // Use the element's client dimensions (size before transform)
    const displayedWidth = media.clientWidth;
    const displayedHeight = media.clientHeight;

    const scaleValue = currentZoom / 100;
    const scaledWidth = displayedWidth * scaleValue;
    const scaledHeight = displayedHeight * scaleValue;

    // Calculate max pan distances for each axis independently
    // With transform: scale(s) translate(x, y), the translate happens in unscaled space,
    // then gets scaled. So the visual offset = x * s.
    // Max visual pan = (scaledSize - containerSize) / 2
    // Max translate value = maxVisualPan / scaleValue
    const maxPanX = Math.max(0, (scaledWidth - containerRect.width) / 2 / scaleValue);
    const maxPanY = Math.max(0, (scaledHeight - containerRect.height) / 2 / scaleValue);

    // Clamp each axis - if image fits in that dimension, center it (0 offset)
    panOffsetX = maxPanX > 0 ? Math.max(-maxPanX, Math.min(maxPanX, panOffsetX)) : 0;
    panOffsetY = maxPanY > 0 ? Math.max(-maxPanY, Math.min(maxPanY, panOffsetY)) : 0;
}

// Pan/drag functionality for zoomed images
function attachPanListeners(element) {
    if (!element) return;

    // Mouse events
    element.addEventListener('mousedown', startPan);
    element.addEventListener('mousemove', doPan);
    element.addEventListener('mouseup', endPan);
    element.addEventListener('mouseleave', endPan);

    // Touch events for mobile
    element.addEventListener('touchstart', startPanTouch, { passive: false });
    element.addEventListener('touchmove', doPanTouch, { passive: false });
    element.addEventListener('touchend', endPan);
}

function startPan(e) {
    if (currentZoom <= 100) return;
    isPanning = true;
    // Store start position compensated for current scale
    const scale = currentZoom / 100;
    panStartX = e.clientX - (panOffsetX * scale);
    panStartY = e.clientY - (panOffsetY * scale);
    e.target.style.cursor = 'grabbing';
    e.preventDefault();
}

function startPanTouch(e) {
    if (currentZoom <= 100) return;
    if (e.touches.length === 1) {
        isPanning = true;
        // Store start position compensated for current scale
        const scale = currentZoom / 100;
        panStartX = e.touches[0].clientX - (panOffsetX * scale);
        panStartY = e.touches[0].clientY - (panOffsetY * scale);
        e.preventDefault();
    }
}

function doPan(e) {
    if (!isPanning || currentZoom <= 100) return;
    // Compensate for zoom scale - higher zoom = less movement needed
    const scale = currentZoom / 100;
    const newOffsetX = (e.clientX - panStartX) / scale;
    const newOffsetY = (e.clientY - panStartY) / scale;

    // Store old offsets to detect if clamping happened
    const oldX = panOffsetX;
    const oldY = panOffsetY;

    panOffsetX = newOffsetX;
    panOffsetY = newOffsetY;

    // applyZoom will clamp the offsets
    applyZoom();

    // If offsets were clamped, update panStart to prevent "sticking"
    if (panOffsetX !== newOffsetX) {
        panStartX = e.clientX - (panOffsetX * scale);
    }
    if (panOffsetY !== newOffsetY) {
        panStartY = e.clientY - (panOffsetY * scale);
    }

    e.preventDefault();
}

function doPanTouch(e) {
    if (!isPanning || currentZoom <= 100) return;
    if (e.touches.length === 1) {
        const scale = currentZoom / 100;
        const newOffsetX = (e.touches[0].clientX - panStartX) / scale;
        const newOffsetY = (e.touches[0].clientY - panStartY) / scale;

        panOffsetX = newOffsetX;
        panOffsetY = newOffsetY;

        applyZoom();

        // If offsets were clamped, update panStart
        if (panOffsetX !== newOffsetX) {
            panStartX = e.touches[0].clientX - (panOffsetX * scale);
        }
        if (panOffsetY !== newOffsetY) {
            panStartY = e.touches[0].clientY - (panOffsetY * scale);
        }

        e.preventDefault();
    }
}

function endPan(e) {
    if (isPanning) {
        isPanning = false;
        const media = viewerMain?.querySelector('.viewer-image');
        if (media && currentZoom > 100) {
            media.style.cursor = 'grab';
        }
    }
}

function buildThumbnails() {
    if (!currentFolder || !viewerThumbs) return;

    viewerThumbs.innerHTML = '';

    currentFolder.images.forEach((file, index) => {
        const thumb = document.createElement('div');
        thumb.className = 'viewer-thumb' + (index === 0 ? ' active' : '');

        if (isVideo(file)) {
            // Video thumbnail
            thumb.classList.add('video-thumb');
            const video = document.createElement('video');
            const videoSrc = getOptimizedVideoPath(currentFolder.path, file);
            video.muted = true;
            video.playsInline = true;
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.preload = 'auto';
            video.src = videoSrc;
            video.load();

            // When data loads, seek to show first frame
            video.addEventListener('loadeddata', () => {
                video.currentTime = 0.1;
            });

            // Add play icon overlay
            const playIcon = document.createElement('div');
            playIcon.className = 'video-thumb-icon';
            playIcon.innerHTML = '▶';

            thumb.appendChild(video);
            thumb.appendChild(playIcon);
        } else {
            // Image thumbnail
            thumb.style.backgroundImage = `url('${currentFolder.path}${file}')`;
        }

        thumb.addEventListener('click', () => showImage(index));
        viewerThumbs.appendChild(thumb);
    });
}

// Recalculate zoom when container size changes (e.g., window maximize/restore)
function recalculateZoom() {
    if (!viewerMain || !currentFolder) return;

    const media = viewerMain.querySelector('.viewer-image');
    if (!media) return;

    // Get current container dimensions
    const containerWidth = viewerMain.clientWidth;
    const containerHeight = viewerMain.clientHeight;

    // Get media natural dimensions
    let naturalWidth, naturalHeight;
    if (media.tagName === 'VIDEO') {
        naturalWidth = media.videoWidth;
        naturalHeight = media.videoHeight;
    } else {
        naturalWidth = media.naturalWidth;
        naturalHeight = media.naturalHeight;
    }

    if (!naturalWidth || !naturalHeight) return;

    const aspectRatio = naturalHeight / naturalWidth;

    // Recalculate base zoom for vertical content
    if (aspectRatio > 1.5) {
        const containerAspect = containerWidth / containerHeight;
        const mediaAspect = naturalWidth / naturalHeight;
        baseZoom = Math.round((containerAspect / mediaAspect) * 100);
        baseZoom = Math.max(100, baseZoom);
        isVerticalCrop = true;
    } else {
        baseZoom = 100;
        isVerticalCrop = false;
    }

    // Reset to new base zoom
    currentZoom = baseZoom;
    panOffsetX = 0;
    panOffsetY = 0;
    applyZoom();
}

// Expose recalculateZoom globally for main.js to call on maximize/restore
window.recalculateGalleryZoom = recalculateZoom;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initGallery);

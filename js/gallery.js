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

// Folder configuration with images
const folderConfig = {
    'character-design': {
        name: 'Character Design',
        path: basePath + 'Character%20Design/',
        images: [
            '0BDA6B2C-3E09-45ED-88FD-F61644D3250F_1_102_o.jpeg',
            '29223947-303D-42AA-9289-8C5F68B5662F_1_201_a.jpeg',
            '3A99DE5A-1EAD-4946-8C5C-F00B95592FF5_1_105_c.jpeg',
            '61006B33-0100-4B51-9E01-9A133295D919_1_102_o.jpeg',
            '7664EE13-9DF0-4FBC-B651-1C8404A29B5C_1_201_a.jpeg',
            '97A24059-1B1E-49DC-86B1-D827A7548B79_1_105_c.jpeg',
            '9975D294-C7EB-4757-9665-B4975F37575B_1_105_c.jpeg',
            'CD7B311C-3CDB-4B15-B984-3836269FB3AE.jpeg',
            'CEE58645-C6C9-40EE-8288-99C58986B33F_1_105_c.jpeg',
            'E0081877-255B-41D1-AED1-D813EBDE2B53_1_102_o.jpeg',
            'E835B217-81B6-4924-8890-04D933EA78CB_1_105_c.jpeg',
            'F0FC2259-337F-4136-8EFC-96DD06BECFC8_1_105_c.jpeg',
            'FE9F58FA-49DB-421B-9F22-293C43B18786_1_102_o.jpeg'
        ]
    },
    'kidcore': {
        name: 'Kidcore',
        path: basePath + 'Kidcore/',
        images: [
            // Videos first
            '2464c640229a47539fbac38cc5032a06.mov',
            'Project%20Name%201.mov',
            'Untitled_Artwork%203.mp4',
            'Untitled_Artwork.mp4',
            // Images
            '9B6597D1-3B4C-4D4B-A877-054B152BDABD_1_102_o.jpeg',
            'Facetune_01-10-2025-13-14-00.jpeg',
            'Facetune_05-11-2025-18-10-18.jpeg',
            'IMG_4083.jpeg',
            'IMG_5056.jpeg',
            'IMG_6311.jpeg',
            'IMG_6841.png',
            'IMG_6846.png',
            'Untitled_Artwork%2011.png',
            'Untitled_Artwork%2015.png',
            'Untitled_Artwork%202.png',
            'Untitled_Artwork%203.png',
            'Untitled_Artwork%205.png',
            'Untitled_Artwork%209.png'
        ]
    },
    'narrative': {
        name: 'Narrative',
        path: basePath + 'Narrative/',
        images: [
            // Videos first
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
            // Images
            'C6D0EEAA-D0D9-4FB6-9E0C-6189B8C6F12C_1_102_o.jpeg',
            'Facetune_05-11-2025-18-10-18.jpeg',
            'Facetune_08-12-2024-22-49-05.jpeg',
            'Facetune_10-12-2024-16-18-51.jpeg',
            'Facetune_18-12-2024-12-39-41.jpeg',
            'Facetune_19-12-2024-15-10-00.jpeg',
            'Facetune_21-12-2024-21-33-39.jpeg',
            'Facetune_22-12-2024-19-40-04.jpeg',
            'Facetune_26-12-2024-01-11-44.jpeg',
            'IMG_3978.png',
            'IMG_4008.jpeg',
            'IMG_4024.png',
            'IMG_4083.jpeg',
            'IMG_4199.png',
            'Untitled_Artwork%203.png'
        ]
    }
};

// State
let currentFolder = null;
let currentFolderId = null;
let currentImageIndex = 0;
let currentZoom = 100; // Zoom level percentage

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

    // Update tree selection (using .tree-row now)
    document.querySelectorAll('.tree-row').forEach(r => r.classList.remove('selected'));
    document.querySelector(`.tree-row[data-folder="${folderId}"]`)?.classList.add('selected');

    // Update address bar
    if (explorerPath) {
        explorerPath.textContent = `C:\\Sandra\\Illustration\\${folder.name}`;
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

function closeFolder() {
    currentFolder = null;
    currentFolderId = null;

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
}

function showImage(index) {
    if (!currentFolder) return;

    const files = currentFolder.images;
    currentImageIndex = index;

    // Wrap around
    if (currentImageIndex < 0) currentImageIndex = files.length - 1;
    if (currentImageIndex >= files.length) currentImageIndex = 0;

    const filePath = currentFolder.path + files[currentImageIndex];
    const filename = files[currentImageIndex];

    // Reset zoom when changing images
    currentZoom = 100;

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
        // Replace img with video element
        viewerMain.innerHTML = `
            <button class="viewer-prev">◀</button>
            <video class="viewer-image" src="${filePath}" loop autoplay muted playsinline></video>
            <button class="viewer-next">▶</button>
            ${zoomControlsHTML}
        `;
        // Re-attach navigation listeners
        viewerMain.querySelector('.viewer-prev')?.addEventListener('click', prevImage);
        viewerMain.querySelector('.viewer-next')?.addEventListener('click', nextImage);

        // Attach zoom listeners
        document.getElementById('zoom-in')?.addEventListener('click', zoomIn);
        document.getElementById('zoom-out')?.addEventListener('click', zoomOut);

        // Check if video is very vertical (reels format) and add crop class
        const video = viewerMain.querySelector('video.viewer-image');
        video.addEventListener('loadedmetadata', () => {
            const aspectRatio = video.videoHeight / video.videoWidth;
            // If taller than 4:3 vertical (ratio > 1.33), crop it
            if (aspectRatio > 1.5) {
                video.classList.add('vertical-crop');
            }
        });
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
        } else {
            viewerImage.src = filePath;
            viewerImage.classList.remove('vertical-crop');
            viewerImage.style.transform = '';
            // Update zoom display
            const zoomLevel = document.getElementById('zoom-level');
            if (zoomLevel) zoomLevel.textContent = '100%';
        }

        // Check if image is very vertical and add crop class
        const img = viewerMain.querySelector('img.viewer-image');
        if (img) {
            img.onload = () => {
                const aspectRatio = img.naturalHeight / img.naturalWidth;
                if (aspectRatio > 1.5) {
                    img.classList.add('vertical-crop');
                } else {
                    img.classList.remove('vertical-crop');
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
    if (currentZoom < 200) {
        currentZoom += 25;
        applyZoom();
    }
}

function zoomOut() {
    if (currentZoom > 50) {
        currentZoom -= 25;
        applyZoom();
    }
}

function resetZoom() {
    currentZoom = 100;
    applyZoom();
}

function applyZoom() {
    const media = viewerMain?.querySelector('.viewer-image');
    const zoomLevel = document.getElementById('zoom-level');

    if (media) {
        if (currentZoom === 100) {
            media.style.transform = '';
            media.style.maxWidth = '100%';
            media.style.maxHeight = '100%';
        } else {
            media.style.transform = `scale(${currentZoom / 100})`;
            media.style.transformOrigin = 'center center';
        }
    }

    if (zoomLevel) {
        zoomLevel.textContent = `${currentZoom}%`;
    }
}

function buildThumbnails() {
    if (!currentFolder || !viewerThumbs) return;

    viewerThumbs.innerHTML = '';

    currentFolder.images.forEach((file, index) => {
        const thumb = document.createElement('div');
        thumb.className = 'viewer-thumb' + (index === 0 ? ' active' : '');

        if (isVideo(file)) {
            // Video thumbnail - use video element
            thumb.classList.add('video-thumb');
            const video = document.createElement('video');
            video.src = currentFolder.path + file;
            video.muted = true;
            video.preload = 'metadata';
            thumb.appendChild(video);
        } else {
            // Image thumbnail
            thumb.style.backgroundImage = `url('${currentFolder.path}${file}')`;
        }

        thumb.addEventListener('click', () => showImage(index));
        viewerThumbs.appendChild(thumb);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initGallery);

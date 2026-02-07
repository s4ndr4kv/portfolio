/*
 * Gallery — Folder View + Image Viewer
 * Windows Explorer style with folder navigation
 */

// Folder configuration with images
const folderConfig = {
    'character-design': {
        name: 'Character Design',
        path: 'img/Illustration/Character%20Design/',
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
        path: 'img/Illustration/Kidcore/',
        images: [
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
        path: 'img/Illustration/Narrative/',
        images: [
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
let currentImageIndex = 0;

// DOM elements (initialized on load)
let folderView, imageViewer, viewerImage, viewerTitle, viewerCount, thumbnailsContainer;

function initGallery() {
    folderView = document.getElementById('editorial-folders');
    imageViewer = document.getElementById('editorial-viewer');
    viewerImage = document.querySelector('.viewer-image');
    viewerTitle = document.querySelector('.viewer-title');
    viewerCount = document.querySelector('.viewer-count');
    thumbnailsContainer = document.querySelector('.viewer-thumbnails');

    if (!folderView) return;

    // Folder click handlers
    document.querySelectorAll('.folder-item').forEach(folder => {
        folder.addEventListener('click', () => {
            const folderId = folder.getAttribute('data-folder');
            openFolder(folderId);
        });
    });

    // Back button
    document.querySelector('.viewer-back')?.addEventListener('click', closeFolder);

    // Navigation buttons
    document.querySelector('.viewer-prev')?.addEventListener('click', prevImage);
    document.querySelector('.viewer-next')?.addEventListener('click', nextImage);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!currentFolder) return;
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'Escape') closeFolder();
    });
}

function openFolder(folderId) {
    const folder = folderConfig[folderId];
    if (!folder || folder.images.length === 0) return;

    currentFolder = folder;
    currentImageIndex = 0;

    // Switch views
    folderView.classList.add('hidden');
    imageViewer.classList.remove('hidden');

    // Update title
    viewerTitle.textContent = folder.name;

    // Build thumbnails
    buildThumbnails();

    // Show first image
    showImage(0);
}

function closeFolder() {
    currentFolder = null;
    folderView.classList.remove('hidden');
    imageViewer.classList.add('hidden');
}

function showImage(index) {
    if (!currentFolder) return;

    const images = currentFolder.images;
    currentImageIndex = index;

    // Wrap around
    if (currentImageIndex < 0) currentImageIndex = images.length - 1;
    if (currentImageIndex >= images.length) currentImageIndex = 0;

    // Update main image
    const imagePath = currentFolder.path + images[currentImageIndex];
    viewerImage.src = imagePath;

    // Update counter
    viewerCount.textContent = `${currentImageIndex + 1} / ${images.length}`;

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

function buildThumbnails() {
    if (!currentFolder || !thumbnailsContainer) return;

    thumbnailsContainer.innerHTML = '';

    currentFolder.images.forEach((img, index) => {
        const thumb = document.createElement('div');
        thumb.className = 'viewer-thumb' + (index === 0 ? ' active' : '');
        thumb.style.backgroundImage = `url('${currentFolder.path}${img}')`;
        thumb.addEventListener('click', () => showImage(index));
        thumbnailsContainer.appendChild(thumb);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initGallery);

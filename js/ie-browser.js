/*
 * IE Browser -- Branding Portfolio
 * Retro Internet Explorer window with GeoCities-style content
 */

// ===== PROJECT DATA =====
const IE_PROJECTS = {
    'rebellion': {
        name: 'Rebellion',
        nameJp: 'レベリオン',
        icon: '*',
        year: '2019',
        category: 'Branding, UI Design',
        tagline: 'The money app for Gen Z',
        description: 'Rebellion is a Spanish mobile-first fintech that challenges the status quo offering payment services to the younger generations. The brand needed an in-depth identity with enough shades to connect with Gen Z. We made banking cool, easy, young and fun.',
        path: 'img/Branding/rebellion/',
        images: [
            '1header_10_1000.png',
            '2text1b_1000.png',
            '3explicacion_4_1000.png',
            '4logo-build_12_1000.png',
            '5photogrid_1_1000.png',
            '6angels_1000.png',
            '7text2_8_1000.png',
            '8text3_7_1000.png',
            'fullbody_1000.png',
            'montsemouse-invertido.gif',
            'rebelliongifs2.gif',
            'text4_1000.png'
        ]
    },
    'cabify': {
        name: 'Cabify',
        nameJp: 'キャビファイ',
        icon: '*',
        year: '2018',
        category: 'Branding, Marketing',
        tagline: 'Mobility platform rebrand',
        description: 'Cabify is a technological mobility platform operating in 38 cities across Spain, Portugal and Latin America. I worked on the complete rebranding, creating graphic global assets for international use: digital advertising templates, offline materials, merchandising and events.',
        path: 'img/Branding/cabify/',
        images: [
            'logo.svg',
            '1.jpg',
            '2.png',
            '3.jpg',
            '4.jpg',
            '5.png',
            '6.png',
            '7.png',
            '8.png',
            '9.png'
        ]
    },
    'carto': {
        name: 'CARTO',
        nameJp: 'カルト',
        icon: '*',
        year: '2017',
        category: 'Marketing, Branding',
        tagline: 'Location intelligence platform',
        description: 'CARTO is an open, powerful, and intuitive platform for discovering and predicting key insights underlying the location data in our world. I created graphic assets for the marketing team: digital banners, event brochures, roll-ups and marketing collateral.',
        path: 'img/Branding/carto/',
        images: [
            'logo.svg',
            '1.png',
            '2.png',
            '3.png',
            '4.png',
            '5.png',
            '6.png',
            '7.png'
        ]
    },
    'carbono': {
        name: 'Carbono',
        nameJp: 'カルボノ',
        icon: '*',
        year: '2021',
        category: 'Crypto, Web Design',
        tagline: 'Crypto advisory',
        description: '',
        path: 'img/Branding/carbono/',
        images: []
    },
    'nenakawaii': {
        name: 'Nenakawaii',
        nameJp: 'ネナカワイイ',
        icon: '*',
        year: '2017',
        category: 'Branding, E-commerce',
        tagline: 'Kawaii e-commerce',
        description: 'Nenakawaii is an ongoing personal project. A curated kawaii products e-commerce with Facebook, Instagram and website design.',
        path: 'img/Branding/nenakawaii/',
        images: [
            'nenamockup_1000.png',
            'iphonex-nenakawaii-ig.gif',
            'nenakawaiivideo_11.gif'
        ]
    },
    'raul-marcos': {
        name: 'Raul Marcos',
        nameJp: 'ラウル・マルコス',
        icon: '*',
        year: '2018',
        category: 'Personal Branding',
        tagline: 'Crypto analyst branding',
        description: 'Personal branding for crypto analyst Raul Marcos. Avatar, scalable design system for social networks, conferences and cards. Also redesigned his Chrome ETH price widget.',
        path: 'img/Branding/raul-marcos/',
        images: [
            'business-card-raul_1000.png',
            'Artboard-12x_1000.png',
            'eth-ticker_1000.png',
            'portfolio_1000.png',
            'projector_1000.png'
        ]
    },
    'lab-terapeutico': {
        name: 'Lab Terapeutico',
        nameJp: 'ラボ・テラペウティコ',
        icon: '*',
        year: '2019',
        category: 'Branding',
        tagline: 'Psychology office branding',
        description: 'Laboratorio Terapeutico is a psychological office targeting young people and the LGBTQ community. Modern and colorful branding with heart icons and a fresh color palette.',
        path: 'img/Branding/lab-terapeutico/',
        images: []
    }
};

// Main projects shown individually on the index
const IE_MAIN_PROJECTS = ['rebellion', 'cabify', 'carto', 'carbono'];

// Projects grouped under "More projects..."
const IE_MORE_PROJECTS = ['nenakawaii', 'raul-marcos', 'lab-terapeutico'];

// ===== NAVIGATION STATE =====
let ieCurrentPage = 'home';
let ieHistory = [];
let ieHistoryIndex = -1;
let ieBrowserInitialized = false;

// ===== IMAGE PRELOADER =====
let ieImagesPreloaded = false;

function iePreloadAllImages() {
    if (ieImagesPreloaded) return;
    ieImagesPreloaded = true;

    // Collect all image URLs from all projects
    const allImages = [];
    Object.keys(IE_PROJECTS).forEach(slug => {
        const project = IE_PROJECTS[slug];
        if (!project.path || !project.images) return;
        project.images.forEach(img => {
            // Skip videos — only preload actual images
            if (/\.(mp4|mov|webm)$/i.test(img)) return;
            allImages.push(project.path + img);
        });
    });

    // Also preload Rebellion's hardcoded images (not all are in the images array)
    const rebellionExtras = [
        'img/Branding/rebellion/logo-rebellion-white.svg',
        'img/Branding/rebellion/audience.png',
        'img/Branding/rebellion/logobuild.png',
        'img/Branding/rebellion/angels.png',
        'img/Branding/rebellion/rebelliongifs.gif',
        'img/Branding/rebellion/montsemouse-invertido.gif',
        'img/Branding/rebellion/fullbody_1000.png'
    ];
    rebellionExtras.forEach(src => {
        if (!allImages.includes(src)) allImages.push(src);
    });

    // More-projects images (not in IE_PROJECTS)
    const moreProjectsImages = [
        'img/Branding/more-projects/2.gif',
        'img/Branding/more-projects/3.png',
        'img/Branding/more-projects/4.png',
        'img/Branding/more-projects/5.png',
        'img/Branding/more-projects/6.png',
        'img/Branding/more-projects/7.png'
    ];
    moreProjectsImages.forEach(src => {
        if (!allImages.includes(src)) allImages.push(src);
    });

    // Preload with staggered loading to avoid blocking the main thread
    let i = 0;
    function loadNext() {
        if (i >= allImages.length) return;
        const img = new Image();
        img.src = allImages[i];
        i++;
        // Load next image after a small delay or when this one loads/errors
        img.onload = img.onerror = () => setTimeout(loadNext, 50);
        // Fallback timeout in case onload/onerror don't fire
        setTimeout(loadNext, 500);
    }
    // Start loading 3 images in parallel
    loadNext();
    loadNext();
    loadNext();
}

// ===== INIT =====
function initIEBrowser() {
    if (ieBrowserInitialized) return;
    ieBrowserInitialized = true;

    document.getElementById('ie-back').addEventListener('click', ieGoBack);
    document.getElementById('ie-forward').addEventListener('click', ieGoForward);
    document.getElementById('ie-home-btn').addEventListener('click', () => ieNavigate('home'));

    ieNavigate('home');

    // Start preloading all project images in the background
    iePreloadAllImages();
}

// ===== NAVIGATION =====
function ieNavigate(page, addToHistory = true) {
    ieCurrentPage = page;

    if (addToHistory) {
        ieHistory = ieHistory.slice(0, ieHistoryIndex + 1);
        ieHistory.push(page);
        ieHistoryIndex = ieHistory.length - 1;
    }

    // Update address bar
    const addressEl = document.getElementById('ie-address');
    if (page === 'home') {
        addressEl.textContent = 'http://www.geocities.com/sandraku/';
    } else if (page === 'more-projects') {
        addressEl.textContent = 'http://www.geocities.com/sandraku/more.html';
    } else {
        addressEl.textContent = 'http://www.geocities.com/sandraku/' + page + '.html';
    }

    // Update window title
    const titleEl = document.querySelector('#ie-browser-window .window-title');
    if (titleEl) {
        if (page === 'home') {
            titleEl.textContent = '\uD83E\uDE90 Branding';
        } else if (page === 'more-projects') {
            titleEl.textContent = '\uD83E\uDE90 /sandraku/more.html';
        } else {
            titleEl.textContent = '\uD83E\uDE90 /sandraku/' + page + '.html';
        }
    }

    // Update nav buttons
    document.getElementById('ie-back').disabled = ieHistoryIndex <= 0;
    document.getElementById('ie-forward').disabled = ieHistoryIndex >= ieHistory.length - 1;

    // Update status bar
    document.getElementById('ie-status').textContent = 'Done';

    // Swap background for rebellion only (solid black)
    const content = document.getElementById('ie-content');
    if (page === 'rebellion') {
        content.style.backgroundImage = 'none';
        content.style.backgroundColor = '#000';
    } else {
        content.style.backgroundImage = '';
        content.style.backgroundColor = '';
    }

    // Render
    if (page === 'home') {
        renderIEHome(content);
    } else if (page === 'more-projects') {
        renderIEMoreProjects(content);
    } else {
        renderIEProject(content, page);
    }
}

function ieGoBack() {
    if (ieHistoryIndex > 0) {
        ieHistoryIndex--;
        ieNavigate(ieHistory[ieHistoryIndex], false);
    }
}

function ieGoForward() {
    if (ieHistoryIndex < ieHistory.length - 1) {
        ieHistoryIndex++;
        ieNavigate(ieHistory[ieHistoryIndex], false);
    }
}

// ===== HOME PAGE =====
function renderIEHome(container) {
    const visitorCount = (4827 + Math.floor(Math.random() * 200)).toString().padStart(6, '0').replace(/(\d{3})(\d{3})/, '$1,$2');

    let html = '<div class="ie-home">';

    // Snowfall container
    html += '<div class="ie-snow-container" id="ie-snow"></div>';

    // Header — simple scrolling text
    html += '<div class="ie-home-header">';
    html += '<div class="ie-header-scroll"><span>sandraku\'s branding projects !</span></div>';
    html += '</div>';
    html += '<div class="ie-header-line"></div>';

    html += '<div class="ie-hr-stars">*~-.,_,.-~*~-.,_,.-~*~-.,_,.-~*~-.,_,.-~*</div>';

    // Main projects — simple list
    html += '<div class="ie-directory-wrapper">';
    html += '<div class="ie-directory">';
    html += '<div class="ie-directory-header">[Project Directory]</div>';

    IE_MAIN_PROJECTS.forEach(slug => {
        const p = IE_PROJECTS[slug];
        const comingSoon = !p.images || p.images.length === 0;
        if (comingSoon) {
            html += '<div class="ie-link-row">';
            html += '<span class="ie-link-arrows">&gt;&gt;</span> ';
            html += '<a class="ie-project-link" href="#" data-name="' + p.name + '" data-name-jp="' + p.nameJp + '" onclick="ieNavigate(\'' + slug + '\'); return false;">';
            html += p.name + '</a>';
            html += '</div>';
        } else {
            html += '<div class="ie-link-row">';
            html += '<span class="ie-link-arrows">&gt;&gt;</span> ';
            html += '<a class="ie-project-link" href="#" data-name="' + p.name + '" data-name-jp="' + p.nameJp + '" onclick="ieNavigate(\'' + slug + '\'); return false;">';
            html += p.name + '</a>';
            html += '</div>';
        }
    });

    // More projects link
    html += '<div class="ie-link-row">';
    html += '<span class="ie-link-arrows">&gt;&gt;</span> ';
    html += '<a class="ie-project-link ie-more-link" href="#" data-name="More projects..." data-name-jp="もっとプロジェクト..." onclick="ieNavigate(\'more-projects\'); return false;">';
    html += 'More projects...</a>';
    html += '</div>';

    html += '</div>';
    html += '<img class="ie-directory-gif" src="img/Branding/welcome2.gif" alt="welcome">';
    html += '</div>';

    html += '<div class="ie-hr-stars">*~-.,_,.-~*~-.,_,.-~*~-.,_,.-~*~-.,_,.-~*</div>';

    // Footer
    html += '<div class="ie-home-footer">';
    html += '<div class="ie-visitor-counter">visitors: <span class="ie-counter-digits">' + visitorCount + '</span></div>';
    html += '<div class="ie-home-badges">';
    html += '<span class="ie-badge">Best viewed in 800x600</span>';
    html += '<span class="ie-badge">Made with &lt;3</span>';
    html += '</div>';
    html += '<div class="ie-copyright">(c) sandraku 2026</div>';
    html += '</div>';

    html += '</div>';

    container.innerHTML = html;
    container.scrollTop = 0;

    // Hover: swap name to Japanese (lock width to prevent flicker)
    container.querySelectorAll('[data-name-jp]').forEach(el => {
        const w = el.offsetWidth;
        el.style.minWidth = w + 'px';
        el.addEventListener('mouseenter', () => {
            el.textContent = el.dataset.nameJp;
        });
        el.addEventListener('mouseleave', () => {
            el.textContent = el.dataset.name;
        });
    });

    // Start snowfall
    ieStartSnow();
}

// ===== PROJECT PAGE =====
function renderIEProject(container, slug) {
    const project = IE_PROJECTS[slug];
    if (!project) { ieNavigate('home'); return; }

    // Projects with custom designed pages
    if (slug === 'rebellion') {
        renderRebellionProject(container);
        return;
    }
    if (slug === 'cabify') {
        renderCabifyProject(container);
        return;
    }
    if (slug === 'carto') {
        renderCartoProject(container);
        return;
    }

    let html = '<div class="ie-project-page">';

    // Back link
    html += '<a class="ie-back-link" href="#" onclick="ieGoBack(); return false;">&#8592; <span class="ie-back-text" data-en="Back" data-jp="戻る">Back</span></a>';

    // Project header
    html += '<div class="ie-project-banner">';
    html += '<span class="ie-project-name">.:*~ ' + project.name + ' ~*:.</span>';
    html += '</div>';

    html += '<div class="ie-hr-stars">-~-~-~-~-~-~-~-~-~-~-~-~-~-~-</div>';

    // Under construction placeholder
    html += '<div class="ie-under-construction-page">';
    html += '<div class="ie-construction-icon">&#9888;</div>';
    html += '<div class="ie-construction-text">UNDER CONSTRUCTION</div>';
    html += '<div class="ie-construction-sub">.:*~ coming soon ~*:.</div>';
    html += '</div>';

    html += '<div class="ie-hr-stars">-~-~-~-~-~-~-~-~-~-~-~-~-~-~-</div>';

    // Back link at bottom
    html += '<a class="ie-back-link" href="#" onclick="ieGoBack(); return false;">&#8592; <span class="ie-back-text" data-en="Back" data-jp="戻る">Back</span></a>';

    html += '</div>';

    container.innerHTML = html;
    container.scrollTop = 0;

    // Japanese hover on back links
    container.querySelectorAll('.ie-back-text').forEach(el => {
        el.addEventListener('mouseenter', () => { el.textContent = el.dataset.jp; });
        el.addEventListener('mouseleave', () => { el.textContent = el.dataset.en; });
    });
}

// ===== REBELLION PROJECT PAGE =====
function renderRebellionProject(container) {
    const imgPath = 'img/Branding/rebellion/';
    let html = '<div class="ie-project-page">';

    // Back link
    html += '<a class="ie-back-link" href="#" onclick="ieGoBack(); return false;">&#8592; <span class="ie-back-text" data-en="Back" data-jp="戻る">Back</span></a>';

    // Centered content
    html += '<div class="ie-project-content">';

    // Logo (centered, 2x size)
    html += '<img class="ie-project-logo" src="' + imgPath + 'logo-rebellion-white.svg" alt="Rebellion">';

    // Intro text
    html += '<p class="ie-project-text">Rebellion is a Spanish mobile-first fintech that challenges the status quo offering payment services to the younger generations. So, in short: Rebellion is the money app for Gen Z.</p>';

    // WHAT WE NEEDED
    html += '<div class="ie-project-section-header">&gt;&gt; WHAT WE NEEDED</div>';
    html += '<p class="ie-project-text">Scalability, coherence, readability and a rebel soul.</p>';

    // HOW WE DID IT
    html += '<div class="ie-project-section-header">&gt;&gt; HOW WE DID IT</div>';
    html += '<p class="ie-project-text">First, we identified all the design requirements and researched the audience and competitors extensively. And then, we had fun with it!</p>';
    html += '<div class="ie-project-spacer"></div>';
    html += '<img src="' + imgPath + 'audience.png" alt="Audience">';
    html += '<div class="ie-project-spacer"></div>';
    html += '<img src="' + imgPath + 'logobuild.png" alt="Logo Build">';
    html += '<div class="ie-project-spacer"></div>';
    html += '<p class="ie-project-text">This logo is how we perceive the world:<br>An unfinished city.<br>Technological, generative, geometric.<br>Always in motion.</p>';
    html += '<img src="' + imgPath + 'angels.png" alt="Angels">';

    // A BRAND FULL OF NEON
    html += '<div class="ie-project-section-header">&gt;&gt; A BRAND FULL OF NEON</div>';
    html += '<p class="ie-project-text">The carefully chosen photography is essential for the brand.</p>';
    html += '<p class="ie-project-text">&amp; with a vibrant palette &amp; vector doodles we show our attitude towards this world:<br>Defiant.<br>Disruptive.<br>Irreverent.</p>';
    html += '<img src="' + imgPath + 'rebelliongifs.gif" alt="Rebellion GIFs">';
    html += '<p class="ie-project-text">We are a glitch in the system. And we love it.</p>';
    html += '<img src="' + imgPath + 'montsemouse-invertido.gif" alt="Montsemouse">';
    html += '<img src="' + imgPath + 'fullbody_1000.png" alt="Full Body">';

    html += '</div>'; // close ie-project-content

    // Back link at bottom
    html += '<a class="ie-back-link" href="#" onclick="ieGoBack(); return false;">&#8592; <span class="ie-back-text" data-en="Back" data-jp="戻る">Back</span></a>';

    html += '</div>'; // close ie-project-page

    container.innerHTML = html;
    container.scrollTop = 0;

    // Japanese hover on back links
    container.querySelectorAll('.ie-back-text').forEach(el => {
        el.addEventListener('mouseenter', () => { el.textContent = el.dataset.jp; });
        el.addEventListener('mouseleave', () => { el.textContent = el.dataset.en; });
    });
}

// ===== CABIFY PROJECT PAGE =====
function renderCabifyProject(container) {
    const imgPath = 'img/Branding/cabify/';
    let html = '<div class="ie-project-page">';

    // Back link
    html += '<a class="ie-back-link" href="#" onclick="ieGoBack(); return false;">&#8592; <span class="ie-back-text" data-en="Back" data-jp="戻る">Back</span></a>';

    // Centered content
    html += '<div class="ie-project-content">';

    // Logo (centered)
    html += '<img class="ie-project-logo" src="' + imgPath + 'logo.svg" alt="Cabify">';

    // Intro text
    html += '<p class="ie-project-text">Cabify is a technological mobility platform created in Madrid. It operates in 6 countries and more than 40 cities around the world.</p>';

    // Main image
    html += '<img src="' + imgPath + '1.jpg" alt="Cabify Branding">';
    html += '<div class="ie-project-spacer"></div>';

    // Description
    html += '<p class="ie-project-text">I worked alongside a few colleagues in the complete rebranding of Cabify. On my day to day, I created graphic global assets for international use and, as Brand Guardian, I worked closely with every local designer, making sure the Cabify brand was coherent and solid in every city.</p>';

    // Brandemia link
    html += '<p class="ie-project-text">If you want to know more, <a class="ie-project-link" href="https://brandemia.org/la-marca-cabify-se-renueva-redefiniendo-su-estrategia-y-evolucionando-su-identidad-visual" target="_blank" rel="noopener">Brandemia</a> talked about the rebranding in this article.</p>';

    // Images 2-5
    html += '<div class="ie-project-spacer"></div>';
    html += '<img src="' + imgPath + '2.png" alt="Cabify">';
    html += '<img src="' + imgPath + '3.jpg" alt="Cabify">';
    html += '<img src="' + imgPath + '4.jpg" alt="Cabify">';
    html += '<img src="' + imgPath + '5.png" alt="Cabify">';

    // Forward section
    html += '<div class="ie-project-spacer"></div>';
    html += '<p class="ie-project-text">Cabify also hosts \'Forward\', an internal technologic event, and our team was in charge of creating its brand.</p>';

    // Images 6-9
    html += '<div class="ie-project-spacer"></div>';
    html += '<img src="' + imgPath + '6.png" alt="Forward">';
    html += '<img src="' + imgPath + '7.png" alt="Forward">';
    html += '<img src="' + imgPath + '8.png" alt="Forward">';
    html += '<img src="' + imgPath + '9.png" alt="Forward">';

    html += '</div>'; // close ie-project-content

    // Back link at bottom
    html += '<a class="ie-back-link" href="#" onclick="ieGoBack(); return false;">&#8592; <span class="ie-back-text" data-en="Back" data-jp="戻る">Back</span></a>';

    html += '</div>'; // close ie-project-page

    container.innerHTML = html;
    container.scrollTop = 0;

    // Japanese hover on back links
    container.querySelectorAll('.ie-back-text').forEach(el => {
        el.addEventListener('mouseenter', () => { el.textContent = el.dataset.jp; });
        el.addEventListener('mouseleave', () => { el.textContent = el.dataset.en; });
    });
}

// ===== CARTO PROJECT PAGE =====
function renderCartoProject(container) {
    const imgPath = 'img/Branding/carto/';
    let html = '<div class="ie-project-page">';

    // Back link
    html += '<a class="ie-back-link" href="#" onclick="ieGoBack(); return false;">&#8592; <span class="ie-back-text" data-en="Back" data-jp="戻る">Back</span></a>';

    // Centered content
    html += '<div class="ie-project-content">';

    // Logo (centered)
    html += '<img class="ie-project-logo" src="' + imgPath + 'logo.svg" alt="CARTO">';

    // Intro text with link
    html += '<p class="ie-project-text"><a class="ie-project-link" href="https://carto.com/" target="_blank" rel="noopener">CARTO</a> is an open, powerful, and intuitive platform for discovering and predicting the key insights underlying the location data in our world. Under their brand guidelines, I created assets needed all around the company.</p>';

    // Images 1-7
    html += '<div class="ie-project-spacer"></div>';
    html += '<img src="' + imgPath + '1.png" alt="CARTO">';
    html += '<img src="' + imgPath + '2.png" alt="CARTO">';
    html += '<img src="' + imgPath + '3.png" alt="CARTO">';
    html += '<img src="' + imgPath + '4.png" alt="CARTO">';
    html += '<img src="' + imgPath + '5.png" alt="CARTO">';
    html += '<img src="' + imgPath + '6.png" alt="CARTO">';
    html += '<img src="' + imgPath + '7.png" alt="CARTO">';

    html += '</div>'; // close ie-project-content

    // Back link at bottom
    html += '<a class="ie-back-link" href="#" onclick="ieGoBack(); return false;">&#8592; <span class="ie-back-text" data-en="Back" data-jp="戻る">Back</span></a>';

    html += '</div>'; // close ie-project-page

    container.innerHTML = html;
    container.scrollTop = 0;

    // Japanese hover on back links
    container.querySelectorAll('.ie-back-text').forEach(el => {
        el.addEventListener('mouseenter', () => { el.textContent = el.dataset.jp; });
        el.addEventListener('mouseleave', () => { el.textContent = el.dataset.en; });
    });
}

// ===== MORE PROJECTS PAGE =====
function renderIEMoreProjects(container) {
    const imgPath = 'img/Branding/more-projects/';
    let html = '<div class="ie-project-page">';

    // Back link
    html += '<a class="ie-back-link" href="#" onclick="ieNavigate(\'home\'); return false;">&#8592; <span class="ie-back-text" data-en="Back" data-jp="戻る">Back</span></a>';

    // Centered content
    html += '<div class="ie-project-content">';

    // SBC images first
    html += '<img src="' + imgPath + 'sbc1.png" alt="More Projects">';
    html += '<img src="' + imgPath + 'sbc2.GIF" alt="More Projects">';
    html += '<img src="' + imgPath + 'sbc3.PNG" alt="More Projects">';
    html += '<div class="ie-project-spacer"></div>';
    html += '<div class="ie-hr-stars">*~-.,_,.-~*~-.,_,.-~*~-.,_,.-~*~-.,_,.-~*</div>';
    html += '<div class="ie-project-spacer"></div>';

    // Remaining images (2-7, skip 1.gif)
    html += '<img src="' + imgPath + '2.gif" alt="More Projects">';
    html += '<img src="' + imgPath + '3.png" alt="More Projects">';
    html += '<div class="ie-project-spacer"></div>';
    html += '<div class="ie-hr-stars">*~-.,_,.-~*~-.,_,.-~*~-.,_,.-~*~-.,_,.-~*</div>';
    html += '<div class="ie-project-spacer"></div>';
    html += '<img src="' + imgPath + '4.png" alt="More Projects">';
    html += '<img src="' + imgPath + '5.png" alt="More Projects">';
    html += '<div class="ie-project-spacer"></div>';
    html += '<div class="ie-hr-stars">*~-.,_,.-~*~-.,_,.-~*~-.,_,.-~*~-.,_,.-~*</div>';
    html += '<div class="ie-project-spacer"></div>';
    html += '<img src="' + imgPath + '6.png" alt="More Projects">';
    html += '<div class="ie-project-spacer"></div>';
    html += '<div class="ie-hr-stars">*~-.,_,.-~*~-.,_,.-~*~-.,_,.-~*~-.,_,.-~*</div>';
    html += '<div class="ie-project-spacer"></div>';
    html += '<img src="' + imgPath + '7.png" alt="More Projects">';

    html += '</div>'; // close ie-project-content

    // Back link at bottom
    html += '<a class="ie-back-link" href="#" onclick="ieNavigate(\'home\'); return false;">&#8592; <span class="ie-back-text" data-en="Back" data-jp="戻る">Back</span></a>';

    html += '</div>';

    container.innerHTML = html;
    container.scrollTop = 0;

    // Japanese hover on back links
    container.querySelectorAll('.ie-back-text').forEach(el => {
        el.addEventListener('mouseenter', () => { el.textContent = el.dataset.jp; });
        el.addEventListener('mouseleave', () => { el.textContent = el.dataset.en; });
    });
}

// ===== SNOWFALL =====
let ieSnowInterval = null;
function ieStartSnow() {
    if (ieSnowInterval) clearInterval(ieSnowInterval);
    const snowContainer = document.getElementById('ie-snow');
    if (!snowContainer) return;
    snowContainer.innerHTML = '';

    ieSnowInterval = setInterval(() => {
        // Keep count low — max ~15 flakes on screen
        if (snowContainer.children.length > 15) return;
        const flake = document.createElement('span');
        flake.className = 'ie-snowflake';
        flake.textContent = '*';
        flake.style.left = Math.random() * 100 + '%';
        flake.style.animationDuration = (4 + Math.random() * 4) + 's';
        flake.style.fontSize = (10 + Math.random() * 8) + 'px';
        flake.style.opacity = 0.3 + Math.random() * 0.4;
        snowContainer.appendChild(flake);
        setTimeout(() => { if (flake.parentNode) flake.remove(); }, 8000);
    }, 600);
}

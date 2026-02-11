/*
 * IE Browser -- Brand Design Portfolio
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
        path: 'img/brand-design/rebellion/',
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
        path: 'img/brand-design/cabify/',
        images: [
            'wfh_shh_1000.png',
            'box_1000.png',
            'infog_854.png',
            'cabify_layout_buildup25_0_1000.jpg',
            'cabify_layout_buildup28_1000.jpg',
            'cabify_layout_buildup29_1000.jpg',
            'forward-materials_1000.png',
            'forward-mug_1000.png',
            'forward-stickers_1000.png',
            'rollup-forward_1000.png'
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
        path: 'img/brand-design/carto/',
        images: [
            'tumblr_ob1rfhKy5r1rf9x4co1_1280_1000.png',
            'tumblr_ob1rikuA3J1rf9x4co1_1280_782.png',
            'tumblr_ob1rmcj4T01rf9x4co1_r1_1280_1000.png',
            'tumblr_ob1ro4Gfsi1rf9x4co1_1280_1000.png',
            'tumblr_ob1rwt0rMm1rf9x4co1_1280_1000.png',
            'tumblr_ob1rwt0rMm1rf9x4co2_1280_1000.png',
            'tumblr_ob1rwt0rMm1rf9x4co3_1280_1000.png',
            'tumblr_ob1rwt0rMm1rf9x4co4_1280_1000.png',
            'cartobrochure_1000.png',
            'cartorollup_1000.png',
            'tumblr_ob1t5coDgH1rf9x4co1_1280_1000.png',
            'tumblr_ob1t5coDgH1rf9x4co2_1280_1000.png'
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
        path: 'img/brand-design/carbono/',
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
        path: 'img/brand-design/nenakawaii/',
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
        path: 'img/brand-design/raul-marcos/',
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
        path: 'img/brand-design/lab-terapeutico/',
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

// ===== INIT =====
function initIEBrowser() {
    if (ieBrowserInitialized) return;
    ieBrowserInitialized = true;

    document.getElementById('ie-back').addEventListener('click', ieGoBack);
    document.getElementById('ie-forward').addEventListener('click', ieGoForward);
    document.getElementById('ie-home-btn').addEventListener('click', () => ieNavigate('home'));

    ieNavigate('home');
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
        addressEl.textContent = 'sandraku://brand-design/';
    } else if (page === 'more-projects') {
        addressEl.textContent = 'sandraku://brand-design/more/';
    } else {
        addressEl.textContent = 'sandraku://brand-design/' + page + '/';
    }

    // Update window title
    const titleEl = document.querySelector('#ie-browser-window .window-title');
    if (titleEl) {
        if (page === 'home') {
            titleEl.textContent = 'Internet Explorer -- sandraku://brand-design/';
        } else if (page === 'more-projects') {
            titleEl.textContent = 'More Projects -- Internet Explorer';
        } else {
            const proj = IE_PROJECTS[page];
            titleEl.textContent = (proj ? proj.name : page) + ' -- Internet Explorer';
        }
    }

    // Update nav buttons
    document.getElementById('ie-back').disabled = ieHistoryIndex <= 0;
    document.getElementById('ie-forward').disabled = ieHistoryIndex >= ieHistory.length - 1;

    // Update status bar
    document.getElementById('ie-status').textContent = 'Done';

    // Swap background for rebellion (solid black)
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
            html += '<div class="ie-link-row ie-coming-soon">';
            html += '<span class="ie-link-arrows">&gt;&gt;</span> ';
            html += '<span class="ie-link-text" data-name="' + p.name + '" data-name-jp="' + p.nameJp + '">' + p.name + '</span>';
            html += ' <span class="ie-under-construction">[under construction]</span>';
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
    html += '<img class="ie-directory-gif" src="img/welcome2.gif" alt="welcome">';
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

    // Rebellion has its own designed page
    if (slug === 'rebellion') {
        renderRebellionProject(container);
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
    const imgPath = 'img/brand-design/rebellion/';
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

// ===== MORE PROJECTS PAGE =====
function renderIEMoreProjects(container) {
    let html = '<div class="ie-project-page">';

    // Back link
    html += '<a class="ie-back-link" href="#" onclick="ieNavigate(\'home\'); return false;">&#8592; <span class="ie-back-text" data-en="Back" data-jp="戻る">Back</span></a>';

    html += '<div class="ie-project-banner">';
    html += '<span class="ie-project-name">.:*~ More Projects ~*:.</span>';
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

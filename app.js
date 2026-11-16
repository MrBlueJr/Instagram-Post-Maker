/* ============================================================
   Instagram Post Maker — Interactive Application & HTML Export
   ============================================================ */

(function () {
    'use strict';

    /* ========================================
       High-Resolution Vector Avatar & Sample Photos
       ======================================== */
    const defaultAvatarSvg = `<svg viewBox="0 0 120 120" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="60" fill="#E1E2E6"/>
        <circle cx="60" cy="46" r="22" fill="#999CA0"/>
        <path d="M22 104C22 84 38 74 60 74C82 74 98 84 98 104" fill="#999CA0"/>
    </svg>`;

    function createSampleImage(text, subtext, gradientColors) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
            <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${gradientColors[0]}" />
                    <stop offset="50%" stop-color="${gradientColors[1]}" />
                    <stop offset="100%" stop-color="${gradientColors[2]}" />
                </linearGradient>
                <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stop-color="#000000" stop-opacity="0" />
                    <stop offset="100%" stop-color="#000000" stop-opacity="0.4" />
                </radialGradient>
            </defs>
            <rect width="1080" height="1080" fill="url(#g)" />
            <rect width="1080" height="1080" fill="url(#vignette)" />
            <circle cx="540" cy="460" r="140" fill="rgba(255,255,255,0.18)" />
            <path d="M540 370 C490 370 450 410 450 460 C450 510 490 550 540 550 C590 550 630 510 630 460 C630 410 590 370 540 370 Z" fill="none" stroke="#ffffff" stroke-width="8" />
            <circle cx="540" cy="460" r="42" fill="#ffffff" />
            <text x="540" y="690" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="1">${text}</text>
            <text x="540" y="750" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="500" fill="rgba(255,255,255,0.85)" text-anchor="middle">${subtext}</text>
        </svg>`;
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    const defaultImages = [
        createSampleImage('GOLDEN HOUR', 'Swipe for more photos 👉', ['#ff7e5f', '#feb47b', '#d94b7a']),
        createSampleImage('COASTAL TRAILS', 'Pacific Coast Highway', ['#2193b0', '#6dd5ed', '#005c97']),
        createSampleImage('SUNSET VIBES', 'California Dreamin’', ['#833ab4', '#fd1d1d', '#fcb045'])
    ];

    function toLocalIsoString(d) {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    }

    /* ========================================
       State
       ======================================== */
    const state = {
        username: 'instagram',
        profilePic: null, // High-resolution raw base64 string
        verified: true,
        location: 'San Francisco, California',
        theme: 'light', // 'light' | 'dark'
        followState: 'hidden', // 'hidden' | 'follow' | 'following'
        menuDots: 'horizontal', // 'horizontal' | 'vertical'
        storyRing: false,
        showTaggedBadge: false,
        showCommentBox: true,
        visibility: {
            header: true,
            location: true,
            actions: true,
            likes: true,
            caption: true,
            comments: true,
            time: true,
            commentBox: true
        },
        customViewComments: '',
        postType: 'carousel', // 'single' | 'carousel'
        images: [...defaultImages],
        aspectRatio: '1:1', // '1:1' | '4:5' | '1.91:1'
        caption: `Exploring the hidden spots ✨\nSwipe to see the magic 👉\n\n#travel #photography\n@instagram`,
        likesCount: 14820,
        likedByEnabled: false,
        likedByUser: 'natgeo',
        timeMode: 'auto', // 'auto' | 'manual'
        postDateTime: toLocalIsoString(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2 hours ago
        manualTimeText: '3 hours ago',
        comments: [
            { user: 'alex_wanderlust', text: 'These colors are unreal! 🔥\nWhere was slide 2 taken?' },
            { user: 'travelgram', text: 'Bucket list destination for sure 😍' }
        ],
        carouselIndex: 0,
        liked: false,
        bookmarked: false,
        captionExpanded: false
    };

    /* ========================================
       DOM References
       ======================================== */
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // Header actions
    const exportBtn = $('#exportBtn');
    const downloadPngBtn = $('#downloadPngBtn');

    // Sidebar Toolbar Actions
    const expandAllSectionsBtn = $('#expandAllSectionsBtn');
    const collapseAllSectionsBtn = $('#collapseAllSectionsBtn');

    // Sidebar - Style & Appearance
    const themeToggleBtns = $$('#themeToggleGroup .toggle-btn');
    const followToggleBtns = $$('#followToggleGroup .toggle-btn');
    const menuDotsToggleBtns = $$('#menuDotsToggleGroup .toggle-btn');
    const storyRingToggle = $('#storyRingToggle');
    const taggedPeopleToggle = $('#taggedPeopleToggle');
    const commentBoxToggle = $('#commentBoxToggle');

    // Visibility Checkboxes ("Show on the Post")
    const showHeaderToggle = $('#showHeaderToggle');
    const showLocationToggle = $('#showLocationToggle');
    const showActionsToggle = $('#showActionsToggle');
    const showLikesToggle = $('#showLikesToggle');
    const showCaptionToggle = $('#showCaptionToggle');
    const showCommentsToggle = $('#showCommentsToggle');
    const showTimeToggle = $('#showTimeToggle');

    // Sidebar - Profile
    const usernameInput = $('#username');
    const profilePicBtn = $('#profilePicBtn');
    const removeProfilePicBtn = $('#removeProfilePicBtn');
    const profilePicInput = $('#profilePicInput');
    const profilePicPreview = $('#profilePicPreview');
    const verifiedCheckbox = $('#verified');
    const locationInput = $('#location');

    // Sidebar - Post Content
    const postTypeBtns = $$('#postTypeGroup .toggle-btn');
    const aspectRatioBtns = $$('#aspectRatioGroup .toggle-btn');
    const imageDropZone = $('#imageDropZone');
    const imageInput = $('#imageInput');
    const addMoreImagesBtn = $('#addMoreImagesBtn');
    const addMoreInput = $('#addMoreInput');
    const carouselThumbnails = $('#carouselThumbnails');
    const thumbnailList = $('#thumbnailList');
    const slideCountLabel = $('#slideCountLabel');

    // Sidebar - Caption & Engagement
    const captionTextarea = $('#caption');
    const charCount = $('#charCount');
    const likesCountInput = $('#likesCount');
    const likedByToggle = $('#likedByToggle');
    const likedByUserField = $('#likedByUserField');
    const likedByUserInput = $('#likedByUser');
    const customViewCommentsInput = $('#customViewCommentsInput');

    // Sidebar - Post Time & Date
    const timeModeBtns = $$('#timeModeGroup .toggle-btn');
    const autoTimeGroup = $('#autoTimeGroup');
    const manualTimeGroup = $('#manualTimeGroup');
    const postDateTimeInput = $('#postDateTime');
    const presetPills = $$('.preset-pill');
    const calculatedTimeBadge = $('#calculatedTimeBadge');
    const manualTimeInput = $('#manualTimeInput');

    // Sidebar - Comments
    const commentsEditor = $('#commentsEditor');
    const addCommentBtn = $('#addCommentBtn');
    const commentCountBadge = $('#commentCountBadge');

    // Live Preview Elements
    const phoneFrame = $('#phoneFrame');
    const postHeaderRow = $('#postHeaderRow');
    const previewAvatarWrapper = $('#previewAvatarWrapper');
    const previewProfilePic = $('#previewProfilePic');
    const previewUsername = $('#previewUsername');
    const previewVerified = $('#previewVerified');
    const previewFollowBtn = $('#previewFollowBtn');
    const previewLocation = $('#previewLocation');
    const headerMenuIcon = $('#headerMenuIcon');
    const igImageContainer = $('#igImageContainer');
    const igImageWrapper = $('#igImageWrapper');
    const carouselCounterBadge = $('#carouselCounterBadge');
    const carouselCurrentSlide = $('#carouselCurrentSlide');
    const carouselTotalSlides = $('#carouselTotalSlides');
    const carouselLeft = $('#carouselLeft');
    const carouselRight = $('#carouselRight');
    const carouselDots = $('#carouselDots');
    const previewTaggedBadge = $('#previewTaggedBadge');
    const doubleTapHeart = $('#doubleTapHeart');
    const postActionsRow = $('#postActionsRow');
    const heartBtn = $('#heartBtn');
    const bookmarkBtn = $('#bookmarkBtn');
    const previewLikes = $('#previewLikes');
    const previewCaption = $('#previewCaption');
    const previewComments = $('#previewComments');
    const previewTime = $('#previewTime');
    const previewCommentBox = $('#previewCommentBox');
    const quickCommentInput = $('#quickCommentInput');
    const quickCommentBtn = $('#quickCommentBtn');

    /* ========================================
       Collapsible Section Headers & Toolbar
       ======================================== */
    if (expandAllSectionsBtn) {
        expandAllSectionsBtn.addEventListener('click', () => {
            $$('.section-header').forEach((h) => {
                h.setAttribute('aria-expanded', 'true');
                const b = h.nextElementSibling;
                if (b) b.classList.remove('collapsed');
            });
        });
    }

    if (collapseAllSectionsBtn) {
        collapseAllSectionsBtn.addEventListener('click', () => {
            $$('.section-header').forEach((h) => {
                h.setAttribute('aria-expanded', 'false');
                const b = h.nextElementSibling;
                if (b) b.classList.add('collapsed');
            });
        });
    }

    $$('.section-header').forEach((header) => {
        header.addEventListener('click', () => {
            const expanded = header.getAttribute('aria-expanded') === 'true';
            header.setAttribute('aria-expanded', !expanded);
            const body = header.nextElementSibling;
            if (expanded) {
                body.classList.add('collapsed');
            } else {
                body.classList.remove('collapsed');
                setTimeout(() => {
                    header.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 60);
            }
        });
    });

    /* ========================================
       Helper: Format Caption with Hashtags & Mentions (Preserves Newlines)
       ======================================== */
    function formatTextWithTags(text) {
        if (!text) return '';
        const escaped = escapeHtml(text);
        return escaped
            .replace(/(#[\w\d_]+)/g, '<span class="ig-tag">$1</span>')
            .replace(/(@[\w\d_.]+)/g, '<span class="ig-tag">$1</span>');
    }

    /* ========================================
       Time Ago Calculator
       ======================================== */
    function calculateTimeAgo(dateString) {
        if (!dateString) return 'JUST NOW';
        const postTime = new Date(dateString).getTime();
        const now = Date.now();
        let diffSec = Math.floor((now - postTime) / 1000);
        if (isNaN(diffSec) || diffSec < 60) return 'JUST NOW';
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return diffMin === 1 ? '1 MINUTE AGO' : `${diffMin} MINUTES AGO`;
        const diffHours = Math.floor(diffMin / 60);
        if (diffHours < 24) return diffHours === 1 ? '1 HOUR AGO' : `${diffHours} HOURS AGO`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return diffDays === 1 ? '1 DAY AGO' : `${diffDays} DAYS AGO`;
        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks < 5) return diffWeeks === 1 ? '1 WEEK AGO' : `${diffWeeks} WEEKS AGO`;
        const d = new Date(postTime);
        const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
        const sameYear = d.getFullYear() === new Date().getFullYear();
        return `${months[d.getMonth()]} ${d.getDate()}${sameYear ? '' : ', ' + d.getFullYear()}`;
    }

    /* ========================================
       Theme & Style Toggles
       ======================================== */
    themeToggleBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            themeToggleBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            state.theme = btn.dataset.theme;
            if (state.theme === 'dark') {
                phoneFrame.classList.remove('theme-light');
                phoneFrame.classList.add('theme-dark');
            } else {
                phoneFrame.classList.remove('theme-dark');
                phoneFrame.classList.add('theme-light');
            }
        });
    });

    followToggleBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            followToggleBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            state.followState = btn.dataset.follow;
            updatePreview();
        });
    });

    menuDotsToggleBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            menuDotsToggleBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            state.menuDots = btn.dataset.dots;
            updateMenuDots();
        });
    });

    function updateMenuDots() {
        if (!headerMenuIcon) return;
        if (state.menuDots === 'vertical') {
            headerMenuIcon.innerHTML = '<circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/>';
        } else {
            headerMenuIcon.innerHTML = '<circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>';
        }
    }

    storyRingToggle.addEventListener('change', () => {
        state.storyRing = storyRingToggle.checked;
        updatePreview();
    });

    if (taggedPeopleToggle) {
        taggedPeopleToggle.addEventListener('change', () => {
            state.showTaggedBadge = taggedPeopleToggle.checked;
            updatePreview();
        });
    }

    /* Visibility Checkboxes */
    if (showHeaderToggle) {
        showHeaderToggle.addEventListener('change', () => {
            state.visibility.header = showHeaderToggle.checked;
            updatePreview();
        });
    }

    if (showLocationToggle) {
        showLocationToggle.addEventListener('change', () => {
            state.visibility.location = showLocationToggle.checked;
            updatePreview();
        });
    }

    if (showActionsToggle) {
        showActionsToggle.addEventListener('change', () => {
            state.visibility.actions = showActionsToggle.checked;
            updatePreview();
        });
    }

    if (showLikesToggle) {
        showLikesToggle.addEventListener('change', () => {
            state.visibility.likes = showLikesToggle.checked;
            updatePreview();
        });
    }

    if (showCaptionToggle) {
        showCaptionToggle.addEventListener('change', () => {
            state.visibility.caption = showCaptionToggle.checked;
            updatePreview();
        });
    }

    if (showCommentsToggle) {
        showCommentsToggle.addEventListener('change', () => {
            state.visibility.comments = showCommentsToggle.checked;
            updatePreview();
        });
    }

    if (showTimeToggle) {
        showTimeToggle.addEventListener('change', () => {
            state.visibility.time = showTimeToggle.checked;
            updatePreview();
        });
    }

    if (commentBoxToggle) {
        commentBoxToggle.addEventListener('change', () => {
            state.showCommentBox = commentBoxToggle.checked;
            state.visibility.commentBox = commentBoxToggle.checked;
            updatePreview();
        });
    }

    /* ========================================
       Profile Section Listeners
       ======================================== */
    usernameInput.addEventListener('input', () => {
        state.username = usernameInput.value.trim() || 'instagram';
        updatePreview();
    });

    profilePicBtn.addEventListener('click', () => profilePicInput.click());

    profilePicInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        readFileAsBase64(file, (data) => {
            state.profilePic = data;
            removeProfilePicBtn.style.display = 'inline-flex';
            updatePreview();
        });
    });

    removeProfilePicBtn.addEventListener('click', () => {
        state.profilePic = null;
        profilePicInput.value = '';
        removeProfilePicBtn.style.display = 'none';
        updatePreview();
    });

    verifiedCheckbox.addEventListener('change', () => {
        state.verified = verifiedCheckbox.checked;
        updatePreview();
    });

    locationInput.addEventListener('input', () => {
        state.location = locationInput.value.trim();
        updatePreview();
    });

    /* ========================================
       Post Images & Content Listeners
       ======================================== */
    postTypeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            postTypeBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            state.postType = btn.dataset.type;
            state.carouselIndex = 0;
            updateCarouselVisibility();
            updatePreview();
        });
    });

    aspectRatioBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            aspectRatioBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            state.aspectRatio = btn.dataset.ratio;
            updatePreview();
        });
    });

    imageDropZone.addEventListener('click', () => imageInput.click());

    imageDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageDropZone.classList.add('dragover');
    });

    imageDropZone.addEventListener('dragleave', () => {
        imageDropZone.classList.remove('dragover');
    });

    imageDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        imageDropZone.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
        if (files.length) handleImageFiles(files);
    });

    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length) handleImageFiles(files);
        imageInput.value = '';
    });

    addMoreImagesBtn.addEventListener('click', () => addMoreInput.click());

    addMoreInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length) {
            let loaded = 0;
            files.forEach((file) => {
                readFileAsBase64(file, (data) => {
                    state.images.push(data);
                    loaded++;
                    if (loaded === files.length) {
                        renderThumbnails();
                        updatePreview();
                    }
                });
            });
        }
        addMoreInput.value = '';
    });

    function handleImageFiles(files) {
        if (state.postType === 'single') {
            readFileAsBase64(files[0], (data) => {
                state.images = [data];
                state.carouselIndex = 0;
                renderThumbnails();
                updatePreview();
            });
        } else {
            let loaded = 0;
            const newImages = [];
            files.forEach((file) => {
                readFileAsBase64(file, (data) => {
                    newImages.push(data);
                    loaded++;
                    if (loaded === files.length) {
                        state.images = [...state.images, ...newImages];
                        renderThumbnails();
                        updatePreview();
                    }
                });
            });
        }
    }

    function updateCarouselVisibility() {
        if (state.postType === 'carousel') {
            carouselThumbnails.style.display = 'flex';
            carouselThumbnails.style.flexDirection = 'column';
            carouselThumbnails.style.gap = '8px';
            renderThumbnails();
        } else {
            carouselThumbnails.style.display = 'none';
        }
    }

    function renderThumbnails() {
        thumbnailList.innerHTML = '';
        slideCountLabel.textContent = state.images.length;

        state.images.forEach((img, i) => {
            const item = document.createElement('div');
            item.className = 'thumbnail-item';
            item.draggable = true;
            item.dataset.index = i;
            item.innerHTML = `
                <img src="${img}" alt="Slide ${i + 1}">
                <span class="thumbnail-index">${i + 1}</span>
                <button class="thumbnail-remove" data-idx="${i}" title="Remove slide">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;

            // Drag and drop reordering
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', i.toString());
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                $$('.thumbnail-item').forEach((t) => t.classList.remove('drag-over'));
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                item.classList.add('drag-over');
            });

            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                const toIdx = parseInt(item.dataset.index, 10);
                if (!isNaN(fromIdx) && !isNaN(toIdx) && fromIdx !== toIdx) {
                    const moved = state.images.splice(fromIdx, 1)[0];
                    state.images.splice(toIdx, 0, moved);
                    state.carouselIndex = Math.min(state.carouselIndex, state.images.length - 1);
                    renderThumbnails();
                    updatePreview();
                }
            });

            // Remove slide
            item.querySelector('.thumbnail-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                state.images.splice(i, 1);
                if (state.carouselIndex >= state.images.length) {
                    state.carouselIndex = Math.max(0, state.images.length - 1);
                }
                renderThumbnails();
                updatePreview();
            });

            thumbnailList.appendChild(item);
        });
    }

    /* ========================================
       Caption & Engagement Listeners
       ======================================== */
    captionTextarea.addEventListener('input', () => {
        state.caption = captionTextarea.value;
        charCount.textContent = captionTextarea.value.length;
        state.captionExpanded = false;
        updatePreview();
    });

    likesCountInput.addEventListener('input', () => {
        state.likesCount = parseInt(likesCountInput.value, 10) || 0;
        updateLikesPreview();
    });

    likedByToggle.addEventListener('change', () => {
        state.likedByEnabled = likedByToggle.checked;
        likedByUserField.style.display = likedByToggle.checked ? 'flex' : 'none';
        updateLikesPreview();
    });

    likedByUserInput.addEventListener('input', () => {
        state.likedByUser = likedByUserInput.value.trim() || 'photographer';
        updateLikesPreview();
    });

    if (customViewCommentsInput) {
        customViewCommentsInput.addEventListener('input', () => {
            state.customViewComments = customViewCommentsInput.value.trim();
            updateCommentsPreview();
        });
    }

    /* ========================================
       Post Time & Date Calculation Listeners
       ======================================== */
    timeModeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            timeModeBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            state.timeMode = btn.dataset.timemode;

            if (state.timeMode === 'auto') {
                autoTimeGroup.style.display = 'flex';
                manualTimeGroup.style.display = 'none';
            } else {
                autoTimeGroup.style.display = 'none';
                manualTimeGroup.style.display = 'flex';
            }
            updateTimeDisplay();
        });
    });

    postDateTimeInput.value = state.postDateTime;
    postDateTimeInput.addEventListener('input', () => {
        state.postDateTime = postDateTimeInput.value;
        presetPills.forEach((p) => p.classList.remove('active'));
        updateTimeDisplay();
    });

    presetPills.forEach((pill) => {
        pill.addEventListener('click', () => {
            presetPills.forEach((p) => p.classList.remove('active'));
            pill.classList.add('active');
            const preset = pill.dataset.preset;
            let targetDate = new Date();

            if (preset === 'now') {
                targetDate = new Date();
            } else if (preset === '30m') {
                targetDate = new Date(Date.now() - 30 * 60 * 1000);
            } else if (preset === '2h') {
                targetDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
            } else if (preset === 'yesterday') {
                targetDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
            } else if (preset === '3d') {
                targetDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
            } else if (preset === '1w') {
                targetDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            }

            state.postDateTime = toLocalIsoString(targetDate);
            postDateTimeInput.value = state.postDateTime;
            updateTimeDisplay();
        });
    });

    manualTimeInput.addEventListener('input', () => {
        state.manualTimeText = manualTimeInput.value.trim() || '3 hours ago';
        updateTimeDisplay();
    });

    function updateTimeDisplay() {
        if (state.timeMode === 'auto') {
            const timeText = calculateTimeAgo(state.postDateTime);
            calculatedTimeBadge.textContent = timeText;
            previewTime.textContent = timeText;
        } else {
            previewTime.textContent = state.manualTimeText.toUpperCase();
        }
    }

    /* ========================================
       Comments Editor Listeners
       ======================================== */
    addCommentBtn.addEventListener('click', () => {
        state.comments.push({ user: 'friend', text: 'Love this shot! ✨' });
        renderCommentsEditor();
        updatePreview();
    });

    function renderCommentsEditor() {
        commentsEditor.innerHTML = '';
        commentCountBadge.textContent = state.comments.length;

        state.comments.forEach((comment, i) => {
            const row = document.createElement('div');
            row.className = 'comment-row';
            row.dataset.index = i;
            row.innerHTML = `
                <input type="text" class="comment-user" placeholder="username" value="${escapeHtml(comment.user)}">
                <input type="text" class="comment-text" placeholder="comment" value="${escapeHtml(comment.text)}">
                <button class="remove-comment-btn" title="Remove comment"><i class="fa-solid fa-xmark"></i></button>
            `;

            row.querySelector('.comment-user').addEventListener('input', (e) => {
                state.comments[i].user = e.target.value;
                updateCommentsPreview();
            });

            row.querySelector('.comment-text').addEventListener('input', (e) => {
                state.comments[i].text = e.target.value;
                updateCommentsPreview();
            });

            row.querySelector('.remove-comment-btn').addEventListener('click', () => {
                state.comments.splice(i, 1);
                renderCommentsEditor();
                updateCommentsPreview();
            });

            commentsEditor.appendChild(row);
        });
    }

    /* Quick Comment Box inside Mockup */
    quickCommentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitQuickComment();
        }
    });

    quickCommentBtn.addEventListener('click', submitQuickComment);

    function submitQuickComment() {
        const text = quickCommentInput.value.trim();
        if (!text) return;
        state.comments.push({ user: 'you', text: text });
        quickCommentInput.value = '';
        renderCommentsEditor();
        updateCommentsPreview();
    }

    /* ========================================
       Preview Update Logic
       ======================================== */
    function getAspectRatioPadding() {
        switch (state.aspectRatio) {
            case '1:1': return '100%';
            case '4:5': return '125%';
            case '1.91:1': return '52.36%';
            default: return '100%';
        }
    }

    function updatePreview() {
        // Header Row Visibility
        if (postHeaderRow) {
            postHeaderRow.style.display = state.visibility.header ? 'flex' : 'none';
        }

        // Header Menu Dots
        updateMenuDots();

        // Profile Avatar & Story Ring (Crisp High Resolution)
        if (state.storyRing) {
            previewAvatarWrapper.classList.add('has-story-ring');
        } else {
            previewAvatarWrapper.classList.remove('has-story-ring');
        }

        if (state.profilePic) {
            previewProfilePic.innerHTML = `<img src="${state.profilePic}" alt="${escapeHtml(state.username)}">`;
            profilePicPreview.innerHTML = `<img src="${state.profilePic}" alt="Profile">`;
        } else {
            previewProfilePic.innerHTML = defaultAvatarSvg;
            profilePicPreview.innerHTML = defaultAvatarSvg;
        }

        // Username
        previewUsername.textContent = state.username;

        // Verified Badge
        previewVerified.style.display = state.verified ? 'inline-flex' : 'none';

        // Follow Status
        if (state.followState === 'follow') {
            previewFollowBtn.style.display = 'inline-block';
            previewFollowBtn.textContent = '• Follow';
            previewFollowBtn.classList.remove('following-mode');
        } else if (state.followState === 'following') {
            previewFollowBtn.style.display = 'inline-block';
            previewFollowBtn.textContent = '• Following';
            previewFollowBtn.classList.add('following-mode');
        } else {
            previewFollowBtn.style.display = 'none';
        }

        // Location Tag
        if (state.location && state.visibility.location) {
            previewLocation.textContent = state.location;
            previewLocation.style.display = 'block';
        } else {
            previewLocation.style.display = 'none';
        }

        // Tagged People Badge
        if (previewTaggedBadge) {
            previewTaggedBadge.style.display = state.showTaggedBadge ? 'flex' : 'none';
        }

        // Images & Carousel
        updateImagePreview();

        // Actions Row Visibility
        if (postActionsRow) {
            postActionsRow.style.display = state.visibility.actions ? 'flex' : 'none';
        }

        // Likes Visibility
        previewLikes.style.display = state.visibility.likes ? 'block' : 'none';
        if (state.visibility.likes) {
            updateLikesPreview();
        }

        // Caption Visibility & Rendering (with newlines & hashtags)
        if (state.caption && state.visibility.caption) {
            previewCaption.style.display = 'block';
            updateCaptionPreview();
        } else {
            previewCaption.style.display = 'none';
        }

        // Comments Section Visibility
        previewComments.style.display = state.visibility.comments ? 'block' : 'none';
        if (state.visibility.comments) {
            updateCommentsPreview();
        }

        // Posted Time Visibility
        previewTime.style.display = state.visibility.time ? 'block' : 'none';
        if (state.visibility.time) {
            updateTimeDisplay();
        }

        // Comment Box Visibility
        previewCommentBox.style.display = (state.showCommentBox && state.visibility.commentBox) ? 'flex' : 'none';
    }

    function updateImagePreview() {
        const padding = getAspectRatioPadding();
        igImageContainer.style.paddingBottom = padding;
        igImageContainer.style.height = '0';
        igImageContainer.style.position = 'relative';

        igImageWrapper.style.position = 'absolute';
        igImageWrapper.style.top = '0';
        igImageWrapper.style.left = '0';
        igImageWrapper.style.width = '100%';
        igImageWrapper.style.height = '100%';

        if (state.images.length === 0) {
            igImageWrapper.innerHTML = `
                <div class="ig-image-slide ig-placeholder" style="min-width:100%;height:100%;">
                    <div class="placeholder-content">
                        <i class="fa-solid fa-camera"></i>
                        <span>Add photos to preview</span>
                    </div>
                </div>
            `;
            carouselCounterBadge.style.display = 'none';
            carouselLeft.style.display = 'none';
            carouselRight.style.display = 'none';
            carouselDots.style.display = 'none';
            return;
        }

        const isCarousel = state.postType === 'carousel' && state.images.length > 1;

        // Render slides
        igImageWrapper.innerHTML = '';
        state.images.forEach((img, i) => {
            const slide = document.createElement('div');
            slide.className = 'ig-image-slide';
            slide.style.minWidth = '100%';
            slide.style.height = '100%';
            slide.innerHTML = `<img src="${img}" alt="Slide ${i + 1}" draggable="false">`;
            igImageWrapper.appendChild(slide);
        });

        // Ensure index is within range
        if (state.carouselIndex >= state.images.length) {
            state.carouselIndex = Math.max(0, state.images.length - 1);
        }

        igImageWrapper.style.transform = `translateX(-${state.carouselIndex * 100}%)`;

        // Slide Counter Badge (1/N)
        if (isCarousel) {
            carouselCounterBadge.style.display = 'block';
            carouselCurrentSlide.textContent = state.carouselIndex + 1;
            carouselTotalSlides.textContent = state.images.length;
        } else {
            carouselCounterBadge.style.display = 'none';
        }

        // Arrows
        carouselLeft.style.display = isCarousel && state.carouselIndex > 0 ? 'flex' : 'none';
        carouselRight.style.display = isCarousel && state.carouselIndex < state.images.length - 1 ? 'flex' : 'none';

        // Dots
        if (isCarousel) {
            carouselDots.style.display = 'flex';
            carouselDots.innerHTML = '';
            state.images.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = 'carousel-dot' + (i === state.carouselIndex ? ' active' : '');
                carouselDots.appendChild(dot);
            });
        } else {
            carouselDots.style.display = 'none';
        }
    }

    function updateLikesPreview() {
        const displayCount = state.liked ? state.likesCount + 1 : state.likesCount;

        if (state.likedByEnabled && state.likedByUser) {
            const othersCount = Math.max(0, displayCount - 1);
            previewLikes.innerHTML = `<span class="ig-liked-by">Liked by <span class="ig-liked-by-name">${escapeHtml(state.likedByUser)}</span> and <strong>${formatNumber(othersCount)} others</strong></span>`;
        } else {
            previewLikes.innerHTML = `<span class="ig-likes-count">${formatNumber(displayCount)} likes</span>`;
        }
    }

    function updateCaptionPreview() {
        if (!state.caption) {
            previewCaption.style.display = 'none';
            return;
        }
        previewCaption.style.display = 'block';
        const formatted = formatTextWithTags(state.caption);
        const isLong = state.caption.length > 110 || (state.caption.match(/\n/g) || []).length >= 2;

        if (isLong && !state.captionExpanded) {
            previewCaption.classList.add('truncated');
            previewCaption.innerHTML = `
                <span class="ig-caption-user">${escapeHtml(state.username)}</span>
                <span class="ig-caption-text">${formatted}</span>
                <span class="ig-caption-more" id="previewCaptionMore">...more</span>
            `;
            const moreBtn = $('#previewCaptionMore');
            if (moreBtn) {
                moreBtn.addEventListener('click', () => {
                    state.captionExpanded = true;
                    updateCaptionPreview();
                });
            }
        } else {
            previewCaption.classList.remove('truncated');
            previewCaption.innerHTML = `
                <span class="ig-caption-user">${escapeHtml(state.username)}</span>
                <span class="ig-caption-text">${formatted}</span>
            `;
        }
    }

    function updateCommentsPreview() {
        const validComments = state.comments.filter((c) => c.user && c.text);
        previewComments.innerHTML = '';

        let viewAllText = '';
        if (state.customViewComments) {
            viewAllText = state.customViewComments;
        } else if (validComments.length > 2) {
            viewAllText = `View all ${validComments.length} comments`;
        }

        if (viewAllText) {
            const viewAll = document.createElement('div');
            viewAll.className = 'ig-view-comments';
            viewAll.textContent = viewAllText;
            previewComments.appendChild(viewAll);
        }

        const displayComments = validComments.slice(-2);
        displayComments.forEach((c) => {
            const div = document.createElement('div');
            div.className = 'ig-comment';
            div.innerHTML = `
                <div class="ig-comment-content">
                    <span class="ig-comment-user">${escapeHtml(c.user)}</span>
                    <span class="ig-comment-text">${formatTextWithTags(c.text)}</span>
                </div>
                <div class="ig-comment-heart">
                    <i class="fa-regular fa-heart"></i>
                </div>
            `;

            // Toggle comment like
            const heartIcon = div.querySelector('.ig-comment-heart i');
            heartIcon.addEventListener('click', () => {
                const liked = heartIcon.classList.contains('fa-solid');
                if (liked) {
                    heartIcon.classList.remove('fa-solid', 'liked');
                    heartIcon.classList.add('fa-regular');
                } else {
                    heartIcon.classList.remove('fa-regular');
                    heartIcon.classList.add('fa-solid', 'liked');
                }
            });

            previewComments.appendChild(div);
        });
    }

    /* ========================================
       Live Preview Interactive Controls
       ======================================== */
    // Heart Action Toggle
    heartBtn.addEventListener('click', toggleLike);

    function toggleLike() {
        state.liked = !state.liked;
        const outline = heartBtn.querySelector('.heart-outline');
        const filled = heartBtn.querySelector('.heart-filled');

        if (state.liked) {
            outline.style.display = 'none';
            filled.style.display = 'block';
        } else {
            outline.style.display = 'block';
            filled.style.display = 'none';
        }
        updateLikesPreview();
    }

    // Bookmark Action Toggle
    bookmarkBtn.addEventListener('click', () => {
        state.bookmarked = !state.bookmarked;
        const outline = bookmarkBtn.querySelector('.bookmark-outline');
        const filled = bookmarkBtn.querySelector('.bookmark-filled');
        if (state.bookmarked) {
            outline.style.display = 'none';
            filled.style.display = 'block';
        } else {
            outline.style.display = 'block';
            filled.style.display = 'none';
        }
    });

    // Double-tap Image to Like
    let lastTapTime = 0;
    igImageContainer.addEventListener('click', (e) => {
        if (e.target.closest('.carousel-arrow')) return;
        const now = Date.now();
        if (now - lastTapTime < 340) {
            if (!state.liked) {
                toggleLike();
            }
            doubleTapHeart.classList.remove('animate');
            void doubleTapHeart.offsetWidth; // Reflow
            doubleTapHeart.classList.add('animate');
            doubleTapHeart.addEventListener(
                'animationend',
                () => doubleTapHeart.classList.remove('animate'),
                { once: true }
            );
        }
        lastTapTime = now;
    });

    // Carousel Navigation Buttons
    carouselLeft.addEventListener('click', () => {
        if (state.carouselIndex > 0) {
            state.carouselIndex--;
            updateImagePreview();
        }
    });

    carouselRight.addEventListener('click', () => {
        if (state.carouselIndex < state.images.length - 1) {
            state.carouselIndex++;
            updateImagePreview();
        }
    });

    // Touch Swipe on Carousel
    let touchStartX = 0;
    igImageContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    igImageContainer.addEventListener('touchend', (e) => {
        const diffX = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diffX) > 40) {
            if (diffX > 0 && state.carouselIndex < state.images.length - 1) {
                state.carouselIndex++;
                updateImagePreview();
            } else if (diffX < 0 && state.carouselIndex > 0) {
                state.carouselIndex--;
                updateImagePreview();
            }
        }
    }, { passive: true });

    // Keyboard Arrow Navigation when mouse is over post
    window.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowLeft' && state.carouselIndex > 0) {
            state.carouselIndex--;
            updateImagePreview();
        } else if (e.key === 'ArrowRight' && state.carouselIndex < state.images.length - 1) {
            state.carouselIndex++;
            updateImagePreview();
        }
    });

    /* ========================================
       FEATURE: Export as Standalone Interactive HTML
       ======================================== */
    exportBtn.addEventListener('click', generateExportHTML);

    function generateExportHTML() {
        const isCarousel = state.postType === 'carousel' && state.images.length > 1;
        const aspectPadding = getAspectRatioPadding();
        const validComments = state.comments.filter((c) => c.user && c.text);
        const isDark = state.theme === 'dark';

        // Build Slides HTML
        let slidesHTML = '';
        if (state.images.length === 0) {
            slidesHTML = `<div class="slide" style="min-width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a1a;color:#888;">No photo</div>`;
        } else {
            state.images.forEach((img, i) => {
                slidesHTML += `<div class="slide" style="min-width:100%;height:100%;flex-shrink:0;">
                    <img src="${img}" alt="Slide ${i + 1}" draggable="false" style="width:100%;height:100%;object-fit:cover;display:block;">
                </div>`;
            });
        }

        // Build Carousel Dots HTML
        let dotsHTML = '';
        if (isCarousel) {
            dotsHTML = '<div class="dots" id="carouselDots">';
            state.images.forEach((_, i) => {
                dotsHTML += `<div class="dot${i === 0 ? ' active' : ''}"></div>`;
            });
            dotsHTML += '</div>';
        }

        // Build Carousel Counter Badge (1/N)
        const counterBadgeHTML = isCarousel
            ? `<div class="counter-badge" id="counterBadge"><span id="currSlideNum">1</span>/${state.images.length}</div>`
            : '';

        // Tagged People Icon Badge
        const taggedBadgeHTML = state.showTaggedBadge
            ? `<div class="tagged-badge" title="Tagged people">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="#ffffff">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
               </div>`
            : '';

        // Profile Picture HTML (Crisp High-Resolution)
        let profilePicHTML = '';
        if (state.profilePic) {
            profilePicHTML = `<img src="${state.profilePic}" alt="${escapeHtml(state.username)}">`;
        } else {
            profilePicHTML = defaultAvatarSvg;
        }

        // Verified Rosette Badge
        const verifiedHTML = state.verified
            ? `<span class="verified" title="Verified"><svg viewBox="0 0 40 40" width="14" height="14" style="vertical-align:middle;display:inline-block;"><path fill="#0095f6" d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.906 20 40 14.641l-5.436-3.137V5.15h-6.234L25.358 0l-5.36 3.094zM18 27.27L10.455 19.1l2.636-2.726L18 21.727l8.91-9.454 2.636 2.726L18 27.27z"/></svg></span>`
            : '';

        // Follow Status
        let followHTML = '';
        if (state.followState === 'follow') {
            followHTML = `<span class="follow-btn">• Follow</span>`;
        } else if (state.followState === 'following') {
            followHTML = `<span class="follow-btn following">• Following</span>`;
        }

        // Location Tag
        const locationHTML = (state.location && state.visibility.location)
            ? `<div class="location">${escapeHtml(state.location)}</div>`
            : '';

        // Story ring class
        const storyRingClass = state.storyRing ? ' has-story-ring' : '';

        // Menu dots SVG (Horizontal or Vertical)
        const menuDotsSvg = state.menuDots === 'vertical'
            ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>`
            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>`;

        // Header HTML
        const headerHTML = state.visibility.header ? `
    <!-- Header -->
    <div class="header">
        <div class="header-left">
            <div class="avatar-wrap${storyRingClass}">
                <div class="pfp">${profilePicHTML}</div>
            </div>
            <div class="user-info">
                <div class="user-row">
                    <span class="username">${escapeHtml(state.username)}</span>
                    ${verifiedHTML}
                    ${followHTML}
                </div>
                ${locationHTML}
            </div>
        </div>
        <div class="menu-dots" title="More options">
            ${menuDotsSvg}
        </div>
    </div>` : '';

        // Actions Row HTML
        const actionsHTML = state.visibility.actions ? `
    <!-- Actions Bar -->
    <div class="actions">
        <div class="actions-left">
            <button class="action-btn" id="heartBtn" aria-label="Like post">
                <svg id="heartOutline" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-1.816-1.543-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938z"/></svg>
                <svg id="heartFilled" class="heart-pop-anim" viewBox="0 0 48 48" width="24" height="24" style="display:none;"><path fill="#ff3040" d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.6-6.5l2.3-2c.7-.6 1.3-1.2 1.9-1.7 5.2-4.5 10.6-9.2 10.6-16.5 0-8-6-14.5-13.4-14.5z"/></svg>
            </button>
            <button class="action-btn" id="commentBtn" aria-label="Comment">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22z" stroke-linejoin="round"/></svg>
            </button>
            <button class="action-btn" aria-label="Share">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="3" x2="9.218" y2="10.083"/><polygon points="22,3 15,22 11,13 2,9"/></svg>
            </button>
        </div>
        <div class="actions-right">
            <button class="action-btn" id="bookmarkBtn" aria-label="Save">
                <svg id="bmOutline" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21l-8-5.333L4 21V5a2 2 0 012-2h12a2 2 0 012 2z"/></svg>
                <svg id="bmFilled" viewBox="0 0 24 24" width="24" height="24" style="display:none;"><path fill="currentColor" d="M20 21l-8-5.333L4 21V5a2 2 0 012-2h12a2 2 0 012 2z"/></svg>
            </button>
        </div>
    </div>` : '';

        // Likes HTML
        const likesHTML = state.visibility.likes ? `
    <!-- Likes -->
    <div class="likes" id="likesContainer">
        <span class="likes-count" id="likesCountText">${formatNumber(state.likesCount)} likes</span>
    </div>` : '';

        // Caption HTML (with newlines & hashtags preserved)
        const captionFormatted = formatTextWithTags(state.caption);
        const isLongCaption = state.caption.length > 110 || (state.caption.match(/\n/g) || []).length >= 2;
        const captionHTML = (state.caption && state.visibility.caption)
            ? `<!-- Caption -->
    <div class="caption${isLongCaption ? ' truncated' : ''}" id="postCaption">
        <span class="user">${escapeHtml(state.username)}</span>
        <span class="caption-text">${captionFormatted}</span>
        ${isLongCaption ? '<span class="more-link" id="captionMore">...more</span>' : ''}
    </div>`
            : '';

        // Comments HTML
        let viewAllText = '';
        if (state.customViewComments) {
            viewAllText = state.customViewComments;
        } else if (validComments.length > 2) {
            viewAllText = `View all ${validComments.length} comments`;
        }

        let commentsListHTML = '';
        if (state.visibility.comments && (viewAllText || validComments.length > 0)) {
            let innerComments = '';
            if (viewAllText) {
                innerComments += `<div class="view-comments">${escapeHtml(viewAllText)}</div>`;
            }
            validComments.forEach((c) => {
                innerComments += `<div class="comment">
                    <div class="comment-content">
                        <span class="user">${escapeHtml(c.user)}</span>
                        <span class="comment-text">${formatTextWithTags(c.text)}</span>
                    </div>
                    <span class="comment-heart" onclick="this.classList.toggle('liked');this.textContent=this.classList.contains('liked')?'❤️':'🤍'">🤍</span>
                </div>`;
            });

            commentsListHTML = `
    <!-- Comments List -->
    <div class="comments-list" id="commentsList">
        ${innerComments}
    </div>`;
        }

        // Post Date Attribute for Dynamic Calculation
        const postDateIso = state.timeMode === 'auto'
            ? new Date(state.postDateTime).toISOString()
            : '';
        const initialTimeText = state.timeMode === 'auto'
            ? calculateTimeAgo(state.postDateTime)
            : state.manualTimeText.toUpperCase();

        const timeHTML = state.visibility.time ? `
    <!-- Timestamp (Auto-calculated or Fixed) -->
    <div class="time" id="postTimestamp"${postDateIso ? ` data-post-date="${postDateIso}"` : ''}>${initialTimeText}</div>` : '';

        // Add Comment Box HTML
        const addCommentBoxHTML = (state.showCommentBox && state.visibility.commentBox)
            ? `<!-- Add Comment Box -->
    <div class="add-comment-box">
        <div class="mini-avatar">${defaultAvatarSvg}</div>
        <input type="text" class="comment-input" id="newCommentInput" placeholder="Add a comment...">
        <button class="post-comment-btn" id="postCommentBtn">Post</button>
    </div>`
            : '';

        // Standalone Exported Document
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Instagram Post - @${escapeHtml(state.username)}</title>
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    background:${isDark ? '#121212' : '#f0f2f5'};
    color:${isDark ? '#f5f5f5' : '#262626'};
    display:flex;
    align-items:center;
    justify-content:center;
    min-height:100vh;
    padding:20px;
}
.ig-card{
    width:100%;
    max-width:400px;
    background:${isDark ? '#000000' : '#ffffff'};
    border-radius:14px;
    box-shadow:0 12px 40px rgba(0,0,0,${isDark ? '0.7' : '0.12'});
    overflow:hidden;
    user-select:none;
}
/* Header */
.header{
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:10px 14px;
    border-bottom:1px solid ${isDark ? '#262626' : '#efefef'};
}
.header-left{display:flex;align-items:center;gap:10px;}
.avatar-wrap{
    padding:2px;
    border-radius:50%;
}
.avatar-wrap.has-story-ring{
    background:linear-gradient(45deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);
    padding:2.5px;
}
.pfp{
    width:38px;
    height:38px;
    border-radius:50%;
    border:1px solid ${isDark ? '#363636' : '#dbdbdb'};
    overflow:hidden;
    display:flex;
    align-items:center;
    justify-content:center;
    background:#e5e7eb;
    flex-shrink:0;
}
.avatar-wrap.has-story-ring .pfp{
    border:2px solid ${isDark ? '#000000' : '#ffffff'};
}
.pfp img{
    width:100%;
    height:100%;
    object-fit:cover;
    image-rendering:-webkit-optimize-contrast;
    image-rendering:high-quality;
    transform:translateZ(0);
}
.pfp svg{width:100%;height:100%;display:block;}
.user-info{display:flex;flex-direction:column;gap:1px;}
.user-row{display:flex;align-items:center;gap:5px;}
.username{font-size:13.5px;font-weight:600;color:${isDark ? '#f5f5f5' : '#262626'};cursor:pointer;}
.follow-btn{font-size:13.5px;font-weight:600;color:#0095f6;cursor:pointer;}
.follow-btn.following{color:#8e8e8e;font-weight:500;}
.location{font-size:11.5px;color:${isDark ? '#f5f5f5' : '#262626'};line-height:1.2;}
.menu-dots{cursor:pointer;color:${isDark ? '#f5f5f5' : '#262626'};padding:4px;display:flex;align-items:center;}
/* Media Container */
.media-container{
    position:relative;
    width:100%;
    padding-bottom:${aspectPadding};
    height:0;
    overflow:hidden;
    background:#000;
}
.media-wrapper{
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height:100%;
    display:flex;
    transition:transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
}
.counter-badge{
    position:absolute;
    top:12px;
    right:12px;
    background:rgba(18,18,18,0.75);
    color:#fff;
    font-size:12px;
    font-weight:600;
    padding:4px 10px;
    border-radius:14px;
    backdrop-filter:blur(8px);
    z-index:4;
    letter-spacing:0.5px;
}
.tagged-badge{
    position:absolute;
    bottom:12px;
    left:12px;
    width:26px;
    height:26px;
    border-radius:50%;
    background:rgba(18,18,18,0.75);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:4;
    backdrop-filter:blur(8px);
}
.nav-arrow{
    position:absolute;
    top:50%;
    transform:translateY(-50%);
    width:30px;
    height:30px;
    border-radius:50%;
    background:rgba(255,255,255,0.88);
    border:none;
    box-shadow:0 3px 12px rgba(0,0,0,0.3);
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:5;
    color:#111;
    font-size:14px;
    font-weight:bold;
    transition:background 0.15s,transform 0.15s;
}
.nav-arrow:hover{background:#fff;transform:translateY(-50%) scale(1.08);}
.nav-arrow-left{left:10px;}
.nav-arrow-right{right:10px;}
.dots{
    position:absolute;
    bottom:12px;
    left:50%;
    transform:translateX(-50%);
    display:flex;
    gap:5px;
    z-index:4;
}
.dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.45);transition:all 0.2s;}
.dot.active{background:#0095f6;transform:scale(1.15);}
.double-heart{
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%) scale(0);
    z-index:10;
    pointer-events:none;
    opacity:0;
    filter:drop-shadow(0 4px 16px rgba(0,0,0,0.45));
}
.double-heart.pop{
    animation:heartPop 0.9s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
}
@keyframes heartPop{
    0%{opacity:0;transform:translate(-50%,-50%) scale(0);}
    15%{opacity:1;transform:translate(-50%,-50%) scale(1.2);}
    30%{opacity:1;transform:translate(-50%,-50%) scale(0.95);}
    45%,75%{opacity:1;transform:translate(-50%,-50%) scale(1);}
    100%{opacity:0;transform:translate(-50%,-50%) scale(0.8);}
}
/* Action Buttons */
.actions{
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:8px 14px 6px;
}
.actions-left{display:flex;align-items:center;gap:16px;}
.action-btn{
    background:none;
    border:none;
    cursor:pointer;
    padding:4px;
    display:flex;
    align-items:center;
    justify-content:center;
    color:${isDark ? '#f5f5f5' : '#262626'};
    transition:transform 0.15s;
}
.action-btn:hover{transform:scale(1.12);}
.action-btn:active{transform:scale(0.9);}
.heart-pop-anim{animation:heartBounce 0.35s ease;}
@keyframes heartBounce{0%{transform:scale(0);}50%{transform:scale(1.25);}100%{transform:scale(1);}}
/* Likes, Caption, Comments */
.likes{padding:0 14px 6px;font-size:13.5px;color:${isDark ? '#f5f5f5' : '#262626'};}
.likes-count{font-weight:600;}
.caption{
    padding:0 14px 6px;
    font-size:13.5px;
    line-height:1.45;
    color:${isDark ? '#f5f5f5' : '#262626'};
}
.caption .user{font-weight:600;margin-right:5px;}
.caption-text{
    white-space:pre-wrap;
    word-wrap:break-word;
    word-break:break-word;
    overflow-wrap:break-word;
}
.caption.truncated .caption-text{
    display:-webkit-box;
    -webkit-line-clamp:2;
    -webkit-box-orient:vertical;
    overflow:hidden;
    white-space:pre-wrap;
}
.more-link{color:#8e8e8e;cursor:pointer;margin-left:4px;}
.ig-tag{color:${isDark ? '#e0f1ff' : '#00376b'};cursor:pointer;}
.comments-list{padding:0 14px 4px;}
.view-comments{font-size:13.5px;color:#8e8e8e;margin-bottom:4px;cursor:pointer;}
.comment{
    font-size:13.5px;
    line-height:1.35;
    margin-bottom:4px;
    display:flex;
    justify-content:space-between;
    align-items:baseline;
}
.comment .user{font-weight:600;margin-right:5px;}
.comment-content{white-space:pre-wrap;word-break:break-word;flex:1;}
.comment-heart{font-size:11px;cursor:pointer;padding-left:8px;user-select:none;}
.time{padding:4px 14px 12px;font-size:10px;color:#8e8e8e;text-transform:uppercase;letter-spacing:0.3px;}
/* Add Comment Input */
.add-comment-box{
    display:flex;
    align-items:center;
    padding:10px 14px;
    border-top:1px solid ${isDark ? '#262626' : '#efefef'};
    gap:10px;
}
.mini-avatar{
    width:28px;
    height:28px;
    border-radius:50%;
    background:${isDark ? '#2a2a2a' : '#e5e7eb'};
    display:flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
    overflow:hidden;
}
.mini-avatar svg{width:100%;height:100%;display:block;}
.comment-input{
    flex:1;
    background:none;
    border:none;
    font-size:13px;
    color:${isDark ? '#f5f5f5' : '#262626'};
    outline:none;
    font-family:inherit;
}
.comment-input::placeholder{color:#8e8e8e;}
.post-comment-btn{
    background:none;
    border:none;
    color:#0095f6;
    font-size:13px;
    font-weight:600;
    cursor:pointer;
    padding:0 4px;
}
</style>
</head>
<body>

<div class="ig-card">
    ${headerHTML}

    <!-- Media (Carousel / Single) -->
    <div class="media-container" id="mediaContainer">
        <div class="media-wrapper" id="mediaWrapper">
            ${slidesHTML}
        </div>

        ${counterBadgeHTML}
        ${taggedBadgeHTML}

        ${isCarousel ? `
        <button class="nav-arrow nav-arrow-left" id="arrowLeft" style="display:none;" aria-label="Previous image">&#10094;</button>
        <button class="nav-arrow nav-arrow-right" id="arrowRight" aria-label="Next image">&#10095;</button>
        ` : ''}

        ${dotsHTML}

        <!-- Double-tap Heart Animation -->
        <div class="double-heart" id="doubleHeart">
            <svg viewBox="0 0 48 48" width="80" height="80"><path fill="#fff" d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.6-6.5l2.3-2c.7-.6 1.3-1.2 1.9-1.7 5.2-4.5 10.6-9.2 10.6-16.5 0-8-6-14.5-13.4-14.5z"/></svg>
        </div>
    </div>

    ${actionsHTML}
    ${likesHTML}
    ${captionHTML}
    ${commentsListHTML}
    ${timeHTML}
    ${addCommentBoxHTML}
</div>

<script>
(function(){
    var liked = false;
    var bookmarked = false;
    var baseLikes = ${state.likesCount};
    var currentSlide = 0;
    var totalSlides = ${state.images.length};

    var heartBtn = document.getElementById('heartBtn');
    var heartOutline = document.getElementById('heartOutline');
    var heartFilled = document.getElementById('heartFilled');
    var likesCountText = document.getElementById('likesCountText');
    var bookmarkBtn = document.getElementById('bookmarkBtn');
    var bmOutline = document.getElementById('bmOutline');
    var bmFilled = document.getElementById('bmFilled');
    var mediaContainer = document.getElementById('mediaContainer');
    var mediaWrapper = document.getElementById('mediaWrapper');
    var doubleHeart = document.getElementById('doubleHeart');
    var captionEl = document.getElementById('postCaption');
    var captionMore = document.getElementById('captionMore');
    var timestampEl = document.getElementById('postTimestamp');

    function formatNum(n){ return n.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ','); }

    function updateLikesDisplay(){
        var count = liked ? baseLikes + 1 : baseLikes;
        if(likesCountText) likesCountText.textContent = formatNum(count) + ' likes';
    }

    function toggleHeart(){
        liked = !liked;
        if(heartOutline) heartOutline.style.display = liked ? 'none' : 'block';
        if(heartFilled) heartFilled.style.display = liked ? 'block' : 'none';
        updateLikesDisplay();
    }

    if(heartBtn){
        heartBtn.addEventListener('click', toggleHeart);
    }

    if(bookmarkBtn){
        bookmarkBtn.addEventListener('click', function(){
            bookmarked = !bookmarked;
            if(bmOutline) bmOutline.style.display = bookmarked ? 'none' : 'block';
            if(bmFilled) bmFilled.style.display = bookmarked ? 'block' : 'none';
        });
    }

    // Double-tap Image to Like
    var lastTap = 0;
    if(mediaContainer){
        mediaContainer.addEventListener('click', function(e){
            if(e.target.closest('.nav-arrow')) return;
            var now = Date.now();
            if(now - lastTap < 340){
                if(!liked) toggleHeart();
                if(doubleHeart){
                    doubleHeart.classList.remove('pop');
                    void doubleHeart.offsetWidth;
                    doubleHeart.classList.add('pop');
                }
            }
            lastTap = now;
        });
    }

    // Expand Caption
    if(captionMore && captionEl){
        captionMore.addEventListener('click', function(){
            captionEl.classList.remove('truncated');
            captionMore.style.display = 'none';
        });
    }

    // Auto-calculate relative post date on load & refresh
    function updatePostTimeAgo(){
        if(!timestampEl) return;
        var dateStr = timestampEl.getAttribute('data-post-date');
        if(!dateStr) return;
        var postTime = new Date(dateStr).getTime();
        var now = Date.now();
        var diffSec = Math.floor((now - postTime) / 1000);
        if(isNaN(diffSec) || diffSec < 60){ timestampEl.textContent = 'JUST NOW'; return; }
        var diffMin = Math.floor(diffSec / 60);
        if(diffMin < 60){ timestampEl.textContent = diffMin === 1 ? '1 MINUTE AGO' : diffMin + ' MINUTES AGO'; return; }
        var diffHours = Math.floor(diffMin / 60);
        if(diffHours < 24){ timestampEl.textContent = diffHours === 1 ? '1 HOUR AGO' : diffHours + ' HOURS AGO'; return; }
        var diffDays = Math.floor(diffHours / 24);
        if(diffDays < 7){ timestampEl.textContent = diffDays === 1 ? '1 DAY AGO' : diffDays + ' DAYS AGO'; return; }
        var diffWeeks = Math.floor(diffDays / 7);
        if(diffWeeks < 5){ timestampEl.textContent = diffWeeks === 1 ? '1 WEEK AGO' : diffWeeks + ' WEEKS AGO'; return; }
        var d = new Date(postTime);
        var months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
        var sameYear = d.getFullYear() === new Date().getFullYear();
        timestampEl.textContent = months[d.getMonth()] + ' ' + d.getDate() + (sameYear ? '' : ', ' + d.getFullYear());
    }
    updatePostTimeAgo();
    setInterval(updatePostTimeAgo, 60000);

    ${isCarousel ? `
    // Carousel Controls
    var arrowLeft = document.getElementById('arrowLeft');
    var arrowRight = document.getElementById('arrowRight');
    var dots = document.querySelectorAll('.dot');
    var currSlideNum = document.getElementById('currSlideNum');

    function updateCarousel(){
        if(mediaWrapper) mediaWrapper.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
        dots.forEach(function(d, idx){
            d.classList.toggle('active', idx === currentSlide);
        });
        if(currSlideNum) currSlideNum.textContent = currentSlide + 1;
        if(arrowLeft) arrowLeft.style.display = currentSlide > 0 ? 'flex' : 'none';
        if(arrowRight) arrowRight.style.display = currentSlide < totalSlides - 1 ? 'flex' : 'none';
    }

    if(arrowLeft){
        arrowLeft.addEventListener('click', function(e){
            e.stopPropagation();
            if(currentSlide > 0){ currentSlide--; updateCarousel(); }
        });
    }
    if(arrowRight){
        arrowRight.addEventListener('click', function(e){
            e.stopPropagation();
            if(currentSlide < totalSlides - 1){ currentSlide++; updateCarousel(); }
        });
    }

    // Touch Swipe
    var touchStartX = 0;
    if(mediaContainer){
        mediaContainer.addEventListener('touchstart', function(e){
            touchStartX = e.changedTouches[0].screenX;
        }, {passive:true});

        mediaContainer.addEventListener('touchend', function(e){
            var diff = touchStartX - e.changedTouches[0].screenX;
            if(Math.abs(diff) > 40){
                if(diff > 0 && currentSlide < totalSlides - 1){ currentSlide++; updateCarousel(); }
                else if(diff < 0 && currentSlide > 0){ currentSlide--; updateCarousel(); }
            }
        }, {passive:true});
    }

    // Keyboard navigation
    window.addEventListener('keydown', function(e){
        if(e.key === 'ArrowLeft' && currentSlide > 0){ currentSlide--; updateCarousel(); }
        else if(e.key === 'ArrowRight' && currentSlide < totalSlides - 1){ currentSlide++; updateCarousel(); }
    });
    ` : ''}

    // Interactive Commenting
    var commentInput = document.getElementById('newCommentInput');
    var postCommentBtn = document.getElementById('postCommentBtn');
    var commentsList = document.getElementById('commentsList');

    function addComment(){
        if(!commentInput || !commentsList) return;
        var text = commentInput.value.trim();
        if(!text) return;
        var div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = '<div class="comment-content"><span class="user">you</span> <span class="comment-text">' + text.replace(/&/g,"&amp;").replace(/</g,"&lt;") + '</span></div><span class="comment-heart" onclick="this.classList.toggle(\\'liked\\');this.textContent=this.classList.contains(\\'liked\\')?\\'❤️\\':\\'🤍\\'">🤍</span>';
        commentsList.appendChild(div);
        commentInput.value = '';
    }

    if(postCommentBtn) postCommentBtn.addEventListener('click', addComment);
    if(commentInput){
        commentInput.addEventListener('keydown', function(e){
            if(e.key === 'Enter') addComment();
        });
    }
})();
<\/script>
</body>
</html>`;

        // Trigger file download
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `instagram-post-${state.username}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /* ========================================
       FEATURE: Export as PNG Image (Retina 3x High-Resolution)
       ======================================== */
    downloadPngBtn.addEventListener('click', () => {
        if (typeof html2canvas === 'undefined') {
            alert('html2canvas library is loading, please try again in a moment.');
            return;
        }

        const btnText = downloadPngBtn.querySelector('span');
        const origText = btnText ? btnText.textContent : 'Download PNG';
        if (btnText) btnText.textContent = 'Generating High-Res...';

        html2canvas(phoneFrame, {
            scale: 3, // Retina 3x sharpness
            useCORS: true,
            allowTaint: true,
            backgroundColor: null
        }).then((canvas) => {
            const link = document.createElement('a');
            link.download = `instagram-post-${state.username}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            if (btnText) btnText.textContent = origText;
        }).catch((err) => {
            console.error('Export PNG failed:', err);
            alert('Could not generate PNG image: ' + err.message);
            if (btnText) btnText.textContent = origText;
        });
    });

    /* ========================================
       Utility Functions
       ======================================== */
    function readFileAsBase64(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target.result);
        reader.readAsDataURL(file);
    }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /* ========================================
       Initial Setup
       ======================================== */
    renderThumbnails();
    renderCommentsEditor();
    charCount.textContent = state.caption.length;
    updatePreview();

})();

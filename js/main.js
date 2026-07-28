const initHero = () => {
    const hero = document.querySelector('#hero');

    if (!hero || !window.Swiper) return;

    const control = hero.querySelector('.control');
    const pagingButtons = [...hero.querySelectorAll('.paging li button')];
    const progress = hero.querySelector('.control-progress');
    const heroImages = [...hero.querySelectorAll('.visual-main')];

    heroImages.forEach((image) => {
        image.addEventListener('error', () => {
            if (image.dataset.fallbackApplied === 'true') {
                image.hidden = true;
                return;
            }

            image.dataset.fallbackApplied = 'true';
            image.src = 'images/visual1.jpg';
        });
    });

    const heroSwiper = new window.Swiper(hero.querySelector('.swiper'), {
        loop: true,
        effect: 'slide',
        speed: 800,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
    });

    const resetProgress = () => {
        if (!progress) return;

        progress.style.animation = 'none';
        void progress.offsetWidth;
        progress.style.animation = '';
    };

    const updatePaging = () => {
        pagingButtons.forEach((button, index) => {
            const isActive = index === heroSwiper.realIndex;

            button.closest('li')?.classList.toggle('active', isActive);

            if (isActive) {
                button.setAttribute('aria-current', 'true');
            } else {
                button.removeAttribute('aria-current');
            }
        });

        resetProgress();
    };

    control?.setAttribute('aria-pressed', 'false');

    control?.addEventListener('click', () => {
        const isPaused = control.getAttribute('aria-pressed') === 'true';

        if (isPaused) {
            heroSwiper.autoplay.start();
            resetProgress();
        } else {
            heroSwiper.autoplay.stop();
        }

        control.setAttribute('aria-pressed', String(!isPaused));
        control.setAttribute(
            'aria-label',
            isPaused ? '자동 재생 일시정지' : '자동 재생 시작',
        );
        hero.classList.toggle('is-paused', !isPaused);
    });

    pagingButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            heroSwiper.slideToLoop(index);
        });
    });

    heroSwiper.on('slideChange', updatePaging);
    updatePaging();
};

const getSlideStep = (track) => {
    const firstItem = track.firstElementChild;

    if (!firstItem) return 0;

    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;

    return firstItem.getBoundingClientRect().width + gap;
};

const initTransformSlider = () => {
    const section = document.querySelector('.main .con1');

    if (!section) return;

    const track = section.querySelector('.promotion-list');
    const prevButton = section.querySelector('.slide-button.prev');
    const nextButton = section.querySelector('.slide-button.next');
    let currentIndex = 0;

    const updateButtonState = (maxIndex) => {
        const isAtStart = currentIndex <= 0;
        const isAtEnd = currentIndex >= maxIndex;

        if (prevButton) prevButton.disabled = isAtStart;
        if (nextButton) nextButton.disabled = isAtEnd;
    };

    const updateResponsiveButtonState = () => {
        if (!track) return;

        const maxScroll = track.scrollWidth - track.clientWidth;
        if (prevButton) prevButton.disabled = track.scrollLeft <= 1;
        if (nextButton) nextButton.disabled = track.scrollLeft >= maxScroll - 1;
    };

    if (track) {
        const cards = [...track.children];
        const sourceCards = cards.slice(0, 4);

        cards.slice(4).forEach((card, index) => {
            card.innerHTML = sourceCards[index % sourceCards.length].innerHTML;
        });
    }

    const move = (direction) => {
        if (!track) return;

        const isResponsive = window.matchMedia('(max-width: 1024px)').matches;
        const step = getSlideStep(track);

        if (isResponsive) {
            track.scrollBy({ left: step * direction, behavior: 'smooth' });
            return;
        }

        const cards = [...track.children];
        const visibleCount = 4;
        const maxIndex = Math.max(cards.length - visibleCount, 0);

        currentIndex = Math.min(Math.max(currentIndex + direction, 0), maxIndex);

        track.style.transform = `translateX(${-step * currentIndex}px)`;
        updateButtonState(maxIndex);
    };

    prevButton?.addEventListener('click', () => move(-1));
    nextButton?.addEventListener('click', () => move(1));

    track?.addEventListener('scroll', () => {
        if (!window.matchMedia('(max-width: 1024px)').matches) return;
        updateResponsiveButtonState();
    });

    window.addEventListener('resize', () => {
        if (!track) return;

        currentIndex = 0;
        track.style.transform = '';

        if (window.matchMedia('(max-width: 1024px)').matches) {
            updateResponsiveButtonState();
        } else {
            updateButtonState(Math.max(track.children.length - 4, 0));
        }
    });

    updateButtonState(Math.max((track?.children.length ?? 0) - 4, 0));
};

const initScrollSlider = (
    sectionSelector,
    viewportSelector,
    trackSelector,
    prevSelector,
    nextSelector,
) => {
    const section = document.querySelector(sectionSelector);

    if (!section) return;

    const viewport = section.querySelector(viewportSelector);
    const track = viewport?.querySelector(trackSelector);
    const prevButton = section.querySelector(prevSelector);
    const nextButton = section.querySelector(nextSelector);

    const move = (direction) => {
        if (!viewport || !track) return;

        const step = getSlideStep(track);
        const maxScroll = viewport.scrollWidth - viewport.clientWidth;
        const isLast = viewport.scrollLeft >= maxScroll - 1;
        const isFirst = viewport.scrollLeft <= 1;

        if (direction > 0 && isLast) {
            viewport.scrollTo({ left: 0, behavior: 'smooth' });
            return;
        }

        if (direction < 0 && isFirst) {
            viewport.scrollTo({ left: maxScroll, behavior: 'smooth' });
            return;
        }

        viewport.scrollBy({ left: step * direction, behavior: 'smooth' });
    };

    prevButton?.addEventListener('click', () => move(-1));
    nextButton?.addEventListener('click', () => move(1));
};

const initLiveSwiper = () => {
    const section = document.querySelector('.main .con2');
    const swiperElement = section?.querySelector('.live-swiper');
    const prevButton = section?.querySelector('.live-slide-button.prev');
    const nextButton = section?.querySelector('.live-slide-button.next');

    if (!section || !swiperElement || !window.Swiper) return;

    const track = swiperElement.querySelector('.live-now__list');

    if (!track) return;

    const liveSwiper = new window.Swiper(swiperElement, {
        loop: false,
        effect: 'slide',
        speed: 600,
        slidesPerView: 'auto',
        slidesPerGroup: 1,
        spaceBetween: 23,
    });

    const updateButtonState = () => {
        if (prevButton) prevButton.disabled = liveSwiper.isBeginning;
    };

    prevButton?.addEventListener('click', () => {
        if (!liveSwiper.isBeginning) liveSwiper.slidePrev();
    });

    nextButton?.addEventListener('click', () => {
        if (liveSwiper.isEnd) {
            liveSwiper.slideTo(0);
            return;
        }

        liveSwiper.slideNext();
    });

    liveSwiper.on('slideChange', updateButtonState);
    liveSwiper.on('resize', updateButtonState);
    updateButtonState();
};

const initRankingSwiper = () => {
    const section = document.querySelector('.main .con3');
    const swiperElement = section?.querySelector('.ranking-frame');
    const sourceList = swiperElement?.querySelector('.ranking-list');

    if (!section || !swiperElement || !sourceList || !window.Swiper) return;

    const sourceCards = [...sourceList.querySelectorAll('.ranking-card')];

    if (sourceCards.length !== 8) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'ranking-wrapper swiper-wrapper';

    for (let groupIndex = 0; groupIndex < 3; groupIndex += 1) {
        const slide = document.createElement('div');
        const list = document.createElement('ul');

        slide.className = 'ranking-slide swiper-slide';
        list.className = 'ranking-list';

        sourceCards.forEach((sourceCard, cardIndex) => {
            const card = sourceCard.cloneNode(true);
            const rank = card.querySelector('.rank');
            const rankNumber = groupIndex * sourceCards.length + cardIndex + 1;

            if (rank) rank.textContent = String(rankNumber);
            list.append(card);
        });

        slide.append(list);
        wrapper.append(slide);
    }

    sourceList.replaceWith(wrapper);

    new window.Swiper(swiperElement, {
        loop: true,
        effect: 'slide',
        speed: 600,
        slidesPerView: 1,
        slidesPerGroup: 1,
        navigation: {
            prevEl: section.querySelector('.ranking-slide-button.prev'),
            nextEl: section.querySelector('.ranking-slide-button.next'),
        },
    });
};

const initTopButton = () => {
    const topButton = document.querySelector('.top-button');
    const hero = document.querySelector('#hero');
    const footer = document.querySelector('#footer');

    if (!topButton || !hero || !footer) return;

    let isTicking = false;

    const updateTopButton = () => {
        const scrollTop = window.scrollY;
        const heroEnd = hero.offsetTop + hero.offsetHeight;
        const footerStart = footer.offsetTop;
        const viewportBottom = scrollTop + window.innerHeight;
        const isHero = scrollTop < heroEnd;
        const isFooter = viewportBottom >= footerStart;

        topButton.classList.toggle('is-hidden', isHero);
        topButton.classList.toggle('is-footer', !isHero && isFooter);
        isTicking = false;
    };

    topButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener(
        'scroll',
        () => {
            if (isTicking) return;

            isTicking = true;
            window.requestAnimationFrame(updateTopButton);
        },
        { passive: true },
    );
    window.addEventListener('resize', updateTopButton);
    updateTopButton();
};

const initSectionTag = () => {
    const sectionTag = document.querySelector('.section-tag');
    const sections = [
        { element: document.querySelector('.main .con1'), text: 'SALE' },
        { element: document.querySelector('.main .con2'), text: 'LIVE NOW' },
        { element: document.querySelector('.main .con3'), text: 'RANKING' },
    ];

    if (!sectionTag || sections.some(({ element }) => !element)) return;

    let isTicking = false;

    const updateSectionTag = () => {
        const checkPoint = window.scrollY + window.innerHeight / 2;
        const activeSection = sections.find(({ element }) => {
            const sectionTop = element.offsetTop;
            const sectionBottom = sectionTop + element.offsetHeight;

            return checkPoint >= sectionTop && checkPoint < sectionBottom;
        });

        sectionTag.classList.toggle('is-hidden', !activeSection);

        if (activeSection) {
            sectionTag.textContent = activeSection.text;
        }

        isTicking = false;
    };

    window.addEventListener(
        'scroll',
        () => {
            if (isTicking) return;

            isTicking = true;
            window.requestAnimationFrame(updateSectionTag);
        },
        { passive: true },
    );
    window.addEventListener('resize', updateSectionTag);
    updateSectionTag();
};

(() => {
    initHero();
    initTransformSlider();
    initLiveSwiper();
    initRankingSwiper();
    initTopButton();
    initSectionTag();
})();

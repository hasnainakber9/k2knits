document.addEventListener('DOMContentLoaded', () => {

    // 1. INITIALIZE LENIS FOR SMOOTH SCROLL
    const lenis = new Lenis();

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // 2. PRELOADER ANIMATION
    const preloader = document.querySelector('.preloader');
    const preloaderText = document.querySelector('.preloader-text');

    gsap.to(preloaderText, {
        opacity: 0,
        delay: 1,
        duration: 0.5,
        onComplete: () => {
            gsap.to(preloader, {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    preloader.style.display = 'none';
                    // Start animations AFTER preloader is gone
                    initPageAnimations();
                }
            });
        }
    });

    // 3. CUSTOM CURSOR
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const clickableElems = document.querySelectorAll('a, .clickable');

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let outlineX = 0, outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // GSAP ticker for smooth "lerped" cursor
    gsap.ticker.add(() => {
        // Lerp (linear interpolation) for smoothing
        dotX += (mouseX - dotX) * 0.3;
        dotY += (mouseY - dotY) * 0.3;
        outlineX += (mouseX - outlineX) * 0.1;
        outlineY += (mouseY - outlineY) * 0.1;

        gsap.set(cursorDot, { x: dotX, y: dotY });
        gsap.set(cursorOutline, { x: outlineX, y: outlineY });
    });

    clickableElems.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
        });
    });


    // 4. MAIN PAGE ANIMATIONS
    function initPageAnimations() {
        
        // --- HERO ANIMATION ---
        // Wrap each word span in another span for the stagger reveal
        const heroTitle = document.querySelector('.hero-title');
        heroTitle.querySelectorAll('span').forEach(span => {
            span.innerHTML = `<span>${span.innerHTML}</span>`;
        });

        gsap.from(heroTitle.querySelectorAll('span > span'), {
            y: "100%",
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.2
        });

        gsap.from('.hero-subtitle', {
            opacity: 0,
            y: 20,
            duration: 1,
            delay: 0.8,
            ease: "power2.out"
        });

        gsap.from('.scroll-down-indicator', {
            opacity: 0,
            y: 10,
            duration: 1,
            delay: 1.2,
            ease: "power2.out"
        });

        // --- GENERAL TEXT REVEAL ---
        const textElements = gsap.utils.toArray('.text-reveal');
        textElements.forEach(el => {
            gsap.from(el, {
                opacity: 0,
                y: 50,
                duration: 1,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });

        // --- PROBLEM IMAGE PARALLAX ---
        gsap.to('.problem-image-wrapper img', {
            y: '-20%', // Move image up as user scrolls down
            ease: 'none',
            scrollTrigger: {
                trigger: '.problem-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });

        // --- PILLARS REVEAL ---
        gsap.from('.pillar', {
            opacity: 0,
            y: 50,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
                trigger: '.pillars-section',
                start: 'top 70%',
                toggleActions: 'play none none none'
            }
        });

        // --- ARTISANS HORIZONTAL SCROLL ---
        const track = document.querySelector('.artisan-track');
        const wrapper = document.querySelector('.artisan-section-wrapper');

        // Calculate the distance to scroll
        const getScrollAmount = () => {
            let trackWidth = track.scrollWidth;
            let wrapperWidth = wrapper.offsetWidth;
            return -(trackWidth - wrapperWidth) - (wrapper.offsetWidth * 0.08); // Subtract right padding
        };

        gsap.to(track, {
            x: getScrollAmount,
            ease: 'none',
            scrollTrigger: {
                trigger: wrapper,
                start: 'top top',
                end: () => `+=${track.scrollWidth - wrapper.offsetWidth}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true // Recalculate on resize
            }
        });
        
        // --- IMPACT NUMBER COUNTER ---
        const counters = gsap.utils.toArray('.impact-number');
        counters.forEach(counter => {
            const target = +counter.dataset.target; // Get target number from data-target
            const counterObj = { val: 0 }; // Dummy object for GSAP to tween

            gsap.to(counterObj, {
                val: target,
                duration: 2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: counter,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                onUpdate: () => {
                    counter.textContent = Math.round(counterObj.val); // Update text
                }
            });
        });

        // --- FOOTER REVEAL ---
        gsap.from('.footer > *', {
            opacity: 0,
            y: 50,
            duration: 1,
            stagger: 0.1,
            scrollTrigger: {
                trigger: '.footer',
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });

    } // end initPageAnimations()

});

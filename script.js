document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- GSAP & Lenis Setup ---
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    let lenis;

    // --- DOM Element Cache ---
    const body = document.body;
    const preloader = document.querySelector('.preloader');
    const preloaderText = document.querySelector('.preloader-text');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const siteHeader = document.querySelector('.site-header');
    const themeToggleBtn = document.getElementById('theme-toggle');
    // Add accessibility button selectors if implemented
    const motionToggleAcc = document.getElementById('motion-toggle-acc');

    // --- State ---
    let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let currentTheme = localStorage.getItem('theme') || 'light';

    // --- Initialization ---
    initTheme();
    initPreloader();
    initCustomCursor();
    // initSmoothScroll(); // Initialize after site entry

    // --- Preloader ---
    function initPreloader() {
        // Fallback if elements are missing
        if (!preloader || !preloaderText) {
            console.warn("Preloader elements not found. Skipping.");
            enterSite(); // Immediately try to enter site
            return;
        }

        // Fast exit for reduced motion
        if (prefersReducedMotion) {
             preloader.style.display = 'none';
             enterSite();
             return;
        }

        gsap.to(preloaderText, {
            opacity: 0,
            delay: 1,
            duration: 0.5,
            onComplete: () => {
                gsap.to(preloader, {
                    opacity: 0,
                    duration: 1,
                    ease: "power2.inOut",
                    onComplete: () => {
                        preloader.style.display = 'none';
                        enterSite();
                    }
                });
            }
        });
    }

    // --- Site Entry ---
    function enterSite() {
        console.log("Entering site...");
        initSmoothScroll(); // Init smooth scroll here
        initScrollBasedAnimations();
        initThemeToggle();
        initHeaderScroll();
        // Placeholder for fetching dynamic data
        fetchPatternData();
        fetchImpactData();
    }

     // --- Smooth Scroll (Lenis) ---
    function initSmoothScroll() {
        if (typeof Lenis === 'undefined') {
             console.warn("Lenis library not found. Smooth scrolling disabled.");
             return;
        }
        if (prefersReducedMotion) return; // Respect reduced motion

        lenis = new Lenis();
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
             lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
        console.log("Lenis smooth scroll initialized.");
    }

    // --- Custom Cursor ---
    function initCustomCursor() {
        if (prefersReducedMotion || !cursorDot || !cursorOutline || window.matchMedia('(hover: none)').matches) {
            body.style.cursor = 'auto'; // Fallback to default cursor
            if(cursorDot) cursorDot.style.display = 'none';
            if(cursorOutline) cursorOutline.style.display = 'none';
            return;
        }

        gsap.set([cursorDot, cursorOutline], { xPercent: -50, yPercent: -50 });
        let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
        let dotX = mouseX, dotY = mouseY;
        let outlineX = mouseX, outlineY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        gsap.ticker.add(() => {
            dotX += (mouseX - dotX) * 0.7; // Faster dot movement
            dotY += (mouseY - dotY) * 0.7;
            outlineX += (mouseX - outlineX) * 0.15; // Slower outline movement
            outlineY += (mouseY - outlineY) * 0.15;
            gsap.set(cursorDot, { x: dotX, y: dotY });
            gsap.set(cursorOutline, { x: outlineX, y: outlineY });
        });

        document.querySelectorAll('a, button, input, textarea, select, .clickable').forEach(el => {
            el.addEventListener('mouseenter', () => body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => body.classList.remove('cursor-hover'));
        });
    }

    // --- Theme Toggling ---
    function initTheme() {
        if (currentTheme === 'dark') {
            body.classList.replace('light-theme', 'dark-theme');
        } else {
             body.classList.replace('dark-theme', 'light-theme'); // Ensure light is default
        }
        // Store RGB for header scroll effect
        updateHeaderScrollColor();
    }

    function initThemeToggle() {
        if (!themeToggleBtn) return;
        themeToggleBtn.addEventListener('click', () => {
            currentTheme = (currentTheme === 'light') ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
            body.classList.toggle('dark-theme');
            body.classList.toggle('light-theme');
            updateHeaderScrollColor(); // Update color variable for header effect
        });
    }

     // --- Header Scroll Effect ---
     function initHeaderScroll() {
         if (!siteHeader) return;
         ScrollTrigger.create({
             start: 'top top-=-10px', // Trigger slightly below the top
             onUpdate: self => {
                 siteHeader.classList.toggle('is-scrolled', self.direction === 1 && self.scroll() > 50);
             }
         });
     }

    function updateHeaderScrollColor() {
         const primaryBg = getComputedStyle(body).getPropertyValue('--color-primary-bg').trim();
         // Basic conversion from hex/named color to RGB components for rgba()
         let rgb = '248, 245, 240'; // Default light
         if (primaryBg.startsWith('#')) {
              const bigint = parseInt(primaryBg.slice(1), 16);
              rgb = `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
         } else if (primaryBg === '#1A120B') { // Specific dark theme check
             rgb = '26, 18, 11';
         }
         body.style.setProperty('--color-primary-bg-rgb', rgb);
    }

    // --- Scroll-Based Animations ---
    function initScrollBasedAnimations() {
         if (prefersReducedMotion) {
             // If reduced motion, make elements immediately visible
             gsap.utils.toArray('.reveal-up').forEach(el => gsap.set(el, { opacity: 1, y: 0 }));
             return;
         };

        // General reveal-up animation
        gsap.utils.toArray('.reveal-up').forEach(el => {
            gsap.fromTo(el,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 88%', // Start animation when 88% of the element is visible
                        // markers: true, // Uncomment for debugging
                        toggleActions: 'play none none none', // Only play once on enter
                        once: true // Ensures it only triggers once
                    }
                }
            );
        });

        // Hero animation (if not handled by preloader interaction)
         if (!document.body.classList.contains('site-entered')) { // Ensure hero animates if preloader skipped
             gsap.from('.hero-title', { opacity: 0, y: 30, duration: 1, delay: 0.2, ease: "power2.out" });
             gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 1, delay: 0.4, ease: "power2.out" });
         }


        // Impact Number Counter
        const counters = gsap.utils.toArray('.impact-number');
        counters.forEach(counter => {
            const target = +counter.dataset.target || 0;
            const counterObj = { val: 0 };

            gsap.to(counterObj, {
                val: target,
                duration: 2.5,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: counter,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                onUpdate: () => {
                    counter.textContent = Math.round(counterObj.val).toLocaleString(); // Format with commas
                }
            });
        });

        // Parallax for problem image (subtle)
        gsap.to('.problem-image-wrapper img', {
            yPercent: -10,
            ease: 'none',
            scrollTrigger: {
                trigger: '.problem-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // --- Dynamic Data Fetching (Placeholders) ---
    function fetchPatternData() {
        const grid = document.getElementById('pattern-grid');
        if (!grid) return;

        // Simulate fetching data after a delay
        setTimeout(() => {
            // Replace placeholder
            const placeholder = grid.querySelector('.pattern-item-placeholder');
            if(placeholder) placeholder.remove();

            // === IMAGE URLS UPDATED HERE ===
            const patterns = [
                { id: 1, name: "Balti Rose Motif", description: "Traditional floral pattern.", imageUrl: "https://lh3.googleusercontent.com/d/1A3KiO4PaYQv3uudTF4tYeOgCE8c57vpN" }, // Re-using original
                { id: 2, name: "Geometric Step Design", description: "Buryad Mongolian Ornament.", imageUrl: "https://stock.adobe.com/images/buryad-mongolian-ornament-vector-wallpaper/530738722" }, // Updated
                { id: 3, name: "Ibex Horn Symbol", description: "Turkish Kilim Konia Rug.", imageUrl: "https://www.pamono.eu/turkish-kilim-konia-rug-decorated-with-rams-horn-1880s?srsltid=AfmBOopb2Z2jq30e-fizqhWL24NOrayaPz38zIWuYe5bErWBdNuU8Y_l" }, // Updated
                { id: 4, name: "Modern Abstract Weave", description: "Contemporary Tibetan Trellis.", imageUrl: "https://www.arugforallreasons.com/cdn/shop/products/contemporary-tibetan-rug-Tibetan-Trellis-_Blue-Green_large.png?v=1541964938" } // Updated
            ];
            // === END IMAGE URLS ===

            patterns.forEach(pattern => {
                const item = document.createElement('div');
                item.className = 'pattern-item reveal-up'; // Add reveal-up for animation
                item.innerHTML = `
                    <img src="${pattern.imageUrl}" alt="${pattern.name}" loading="lazy">
                    <h4>${pattern.name}</h4>
                    <p>${pattern.description}</p>
                `;
                grid.appendChild(item);
            });

            // Re-run animations for newly added items
            initScrollBasedAnimations();

        }, 1500); // Simulate network delay
    }

    function fetchImpactData() {
        // In a real app, fetch data used by impact counters here
        // For now, the targets are hardcoded in the HTML data-target attributes
        console.log("Fetching impact data (conceptual)...");
    }

    // --- Accessibility Controls ---
    function initAccessibilityControls() {
        // Example: Reduced motion toggle
        if (motionToggleAcc) {
            motionToggleAcc.checked = !prefersReducedMotion;
            motionToggleAcc.addEventListener('change', (e) => {
                prefersReducedMotion = !e.target.checked;
                body.classList.toggle('reduced-motion', prefersReducedMotion);
                // Re-initialize or kill animations based on new preference
                ScrollTrigger.refresh(); // Refresh ScrollTrigger positions
                if (prefersReducedMotion) {
                    // Kill existing animations if needed
                    gsap.globalTimeline.getChildren().forEach(tween => tween.kill());
                    if(lenis) lenis.stop();
                    // Add logic to stop Three.js if running
                    if (cosmicBgAnimator) cosmicBgAnimator.stop();
                } else {
                    if(lenis) lenis.start();
                    // Re-initialize animations
                    initScrollBasedAnimations();
                    if (cosmicBgAnimator) cosmicBgAnimator.animate();
                    else initCosmicBackground(); // Init if not already running
                }
            });
        }
    }
    // initAccessibilityControls(); // Call this if you add the controls HTML


}); // End DOMContentLoaded

(function () {
    "use strict";

    var header = document.getElementById("site-header");
    var navToggle = document.getElementById("nav-toggle");
    var navLinks = document.getElementById("nav-links");
    var navLinkEls = document.querySelectorAll("[data-nav-link]");
    var backToTop = document.getElementById("back-to-top");
    var yearEl = document.getElementById("year");
    var copyBtn = document.querySelector("[data-copy]");

    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Sticky header shadow
    function onScroll() {
        var scrolled = window.scrollY > 4;
        header.classList.toggle("is-scrolled", scrolled);
        if (backToTop) {
            backToTop.classList.toggle("is-visible", window.scrollY > 400);
        }
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Mobile nav toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener("click", function () {
            var isOpen = navLinks.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navLinkEls.forEach(function (link) {
            link.addEventListener("click", function () {
                navLinks.classList.remove("is-open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    // Back to top
    if (backToTop) {
        backToTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // Scrollspy: highlight the nav link for the section in view
    var sections = Array.prototype.map.call(navLinkEls, function (link) {
        var id = link.getAttribute("href").slice(1);
        return document.getElementById(id);
    }).filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
        var spy = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    navLinkEls.forEach(function (link) {
                        link.classList.toggle(
                            "is-active",
                            link.getAttribute("href") === "#" + entry.target.id
                        );
                    });
                });
            },
            { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
        );
        sections.forEach(function (section) {
            spy.observe(section);
        });
    }

    // Scroll reveal
    var revealEls = document.querySelectorAll("[data-reveal]");
    if ("IntersectionObserver" in window && revealEls.length) {
        var reveal = new IntersectionObserver(
            function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );
        revealEls.forEach(function (el) {
            reveal.observe(el);
        });
    } else {
        revealEls.forEach(function (el) {
            el.classList.add("is-visible");
        });
    }

    // Copy email to clipboard
    if (copyBtn) {
        copyBtn.addEventListener("click", function () {
            var value = copyBtn.getAttribute("data-copy");
            if (!navigator.clipboard) return;
            navigator.clipboard.writeText(value).then(function () {
                copyBtn.classList.add("is-copied");
                setTimeout(function () {
                    copyBtn.classList.remove("is-copied");
                }, 1500);
            });
        });
    }
})();

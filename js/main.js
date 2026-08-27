(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hasFinePointer = window.matchMedia("(pointer: fine)").matches;

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
            { rootMargin: "-15% 0px -80% 0px", threshold: 0 }
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

    // Physics-draggable skill tags
    (function initPhysicsArena() {
        var arena = document.getElementById("phys-arena");
        if (!arena || reduceMotion) return;

        var tags = Array.prototype.slice.call(arena.querySelectorAll(".phys-tag"));
        var bodies = [];
        var bounds = { w: 0, h: 0 };

        function updateBounds() {
            var rect = arena.getBoundingClientRect();
            bounds.w = rect.width;
            bounds.h = rect.height;
            return rect;
        }

        function setTransform(b) {
            b.el.style.transform = "translate(" + b.x + "px," + b.y + "px)";
        }

        function layout() {
            var rect = updateBounds();
            bodies = tags.map(function (el, i) {
                var prev = bodies[i];
                var r = el.getBoundingClientRect();
                return {
                    el: el,
                    x: prev ? Math.min(prev.x, bounds.w - r.width) : r.left - rect.left,
                    y: prev ? Math.min(prev.y, bounds.h - r.height) : r.top - rect.top,
                    w: r.width,
                    h: r.height,
                    vx: prev ? prev.vx : 0,
                    vy: prev ? prev.vy : 0,
                    dragging: false
                };
            });
            arena.classList.add("is-ready");
            bodies.forEach(setTransform);
        }

        layout();

        var resizeTimer = null;
        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(layout, 200);
        });

        bodies.forEach(function (b) {
            var grabX = 0, grabY = 0, lastX = 0, lastY = 0, lastT = 0, pointerId = null;

            b.el.addEventListener("pointerdown", function (e) {
                b.dragging = true;
                b.el.classList.add("is-dragging");
                pointerId = e.pointerId;
                b.el.setPointerCapture(pointerId);
                var rect = arena.getBoundingClientRect();
                grabX = e.clientX - rect.left - b.x;
                grabY = e.clientY - rect.top - b.y;
                lastX = e.clientX;
                lastY = e.clientY;
                lastT = performance.now();
                e.preventDefault();
            });

            b.el.addEventListener("pointermove", function (e) {
                if (!b.dragging) return;
                var rect = arena.getBoundingClientRect();
                b.x = e.clientX - rect.left - grabX;
                b.y = e.clientY - rect.top - grabY;
                var now = performance.now();
                var dt = Math.max(now - lastT, 1);
                b.vx = ((e.clientX - lastX) / dt) * 16;
                b.vy = ((e.clientY - lastY) / dt) * 16;
                lastX = e.clientX;
                lastY = e.clientY;
                lastT = now;
            });

            function endDrag() {
                if (!b.dragging) return;
                b.dragging = false;
                b.el.classList.remove("is-dragging");
                try {
                    b.el.releasePointerCapture(pointerId);
                } catch (err) {
                    /* pointer already released */
                }
            }
            b.el.addEventListener("pointerup", endDrag);
            b.el.addEventListener("pointercancel", endDrag);
        });

        function step() {
            updateBounds();
            var i, j, b, a, c;

            for (i = 0; i < bodies.length; i++) {
                b = bodies[i];
                if (b.dragging) continue;
                b.vx *= 0.96;
                b.vy *= 0.96;
                b.x += b.vx;
                b.y += b.vy;

                if (b.x < 0) {
                    b.x = 0;
                    b.vx *= -0.5;
                } else if (b.x + b.w > bounds.w) {
                    b.x = bounds.w - b.w;
                    b.vx *= -0.5;
                }
                if (b.y < 0) {
                    b.y = 0;
                    b.vy *= -0.5;
                } else if (b.y + b.h > bounds.h) {
                    b.y = bounds.h - b.h;
                    b.vy *= -0.5;
                }
            }

            for (i = 0; i < bodies.length; i++) {
                for (j = i + 1; j < bodies.length; j++) {
                    a = bodies[i];
                    c = bodies[j];
                    var overlapX = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
                    var overlapY = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
                    if (overlapX > 0 && overlapY > 0) {
                        if (overlapX < overlapY) {
                            var pushX = overlapX / 2;
                            var dirX = a.x < c.x ? -1 : 1;
                            if (!a.dragging) a.x += dirX * pushX;
                            if (!c.dragging) c.x -= dirX * pushX;
                            var tmpVx = a.vx;
                            if (!a.dragging) a.vx = c.vx * 0.5;
                            if (!c.dragging) c.vx = tmpVx * 0.5;
                        } else {
                            var pushY = overlapY / 2;
                            var dirY = a.y < c.y ? -1 : 1;
                            if (!a.dragging) a.y += dirY * pushY;
                            if (!c.dragging) c.y -= dirY * pushY;
                            var tmpVy = a.vy;
                            if (!a.dragging) a.vy = c.vy * 0.5;
                            if (!c.dragging) c.vy = tmpVy * 0.5;
                        }
                    }
                }
            }

            bodies.forEach(setTransform);
            requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    })();

    // Magnetic icon links
    (function initMagnetic() {
        if (reduceMotion || !hasFinePointer) return;
        var els = document.querySelectorAll(".nav__icon-link, .footer__social a");
        els.forEach(function (el) {
            var strength = 6;
            el.addEventListener("pointermove", function (e) {
                var r = el.getBoundingClientRect();
                var relX = (e.clientX - r.left - r.width / 2) / (r.width / 2);
                var relY = (e.clientY - r.top - r.height / 2) / (r.height / 2);
                el.style.transform = "translate(" + (relX * strength) + "px," + (relY * strength) + "px)";
            });
            el.addEventListener("pointerleave", function () {
                el.style.transform = "";
            });
        });
    })();

    // Cursor spotlight
    (function initSpotlight() {
        var el = document.getElementById("cursor-spotlight");
        if (!el || reduceMotion || !hasFinePointer) return;
        var latestX = 0, latestY = 0, raf = null;
        document.addEventListener(
            "pointermove",
            function (e) {
                latestX = e.clientX;
                latestY = e.clientY;
                el.classList.add("is-active");
                if (raf) return;
                raf = requestAnimationFrame(function () {
                    el.style.setProperty("--sx", latestX + "px");
                    el.style.setProperty("--sy", latestY + "px");
                    raf = null;
                });
            },
            { passive: true }
        );
        document.addEventListener("pointerleave", function () {
            el.classList.remove("is-active");
        });
    })();

    // Scramble-on-hover for the hero name
    (function initScramble() {
        var el = document.querySelector("[data-scramble]");
        if (!el || reduceMotion) return;
        var original = el.textContent;
        var chars = "!<>-_\\/[]{}=+*^?#0123456789";
        var running = false;

        function randChar() {
            return chars[Math.floor(Math.random() * chars.length)];
        }

        el.addEventListener("mouseenter", function () {
            if (running) return;
            running = true;
            var iteration = 0;
            var interval = setInterval(function () {
                el.textContent = original
                    .split("")
                    .map(function (ch, idx) {
                        if (ch === " ") return " ";
                        if (idx < iteration) return original[idx];
                        return randChar();
                    })
                    .join("");
                iteration += 0.5;
                if (iteration >= original.length) {
                    clearInterval(interval);
                    el.textContent = original;
                    running = false;
                }
            }, 30);
        });
    })();

    // Count-up numbers when stats enter the viewport
    (function initCounters() {
        var els = document.querySelectorAll("[data-count]");
        if (!els.length) return;

        function animate(el) {
            var target = parseInt(el.textContent.replace(/,/g, ""), 10);
            if (isNaN(target)) return;
            if (reduceMotion) {
                el.textContent = target.toLocaleString();
                return;
            }
            var start = performance.now();
            var duration = 1200;
            function tick(now) {
                var p = Math.min((now - start) / duration, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.floor(eased * target).toLocaleString();
                if (p < 1) {
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = target.toLocaleString();
                }
            }
            requestAnimationFrame(tick);
        }

        if ("IntersectionObserver" in window) {
            var obs = new IntersectionObserver(
                function (entries, o) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            animate(entry.target);
                            o.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.4 }
            );
            els.forEach(function (el) {
                obs.observe(el);
            });
        } else {
            els.forEach(animate);
        }
    })();

    // Scroll-linked word-by-word text reveal
    (function initScrollText() {
        var targets = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-text]"));
        if (!targets.length) return;

        var entries = targets.map(function (el) {
            var words = el.textContent.trim().split(/\s+/);
            el.textContent = "";
            var wordEls = words.map(function (word, i) {
                var span = document.createElement("span");
                span.className = "sr-word";
                span.textContent = word;
                el.appendChild(span);
                if (i < words.length - 1) {
                    el.appendChild(document.createTextNode(" "));
                }
                return span;
            });
            return { el: el, words: wordEls };
        });

        if (reduceMotion) {
            entries.forEach(function (entry) {
                entry.words.forEach(function (w) {
                    w.style.opacity = 1;
                });
            });
            return;
        }

        var ticking = false;
        function update() {
            var vh = window.innerHeight;
            var start = vh * 0.9;
            var end = vh * 0.4;
            entries.forEach(function (entry) {
                var rect = entry.el.getBoundingClientRect();
                var raw = (start - rect.top) / (start - end);
                var progress = Math.min(Math.max(raw, 0), 1);
                var n = entry.words.length;
                entry.words.forEach(function (w, i) {
                    var wp = Math.min(Math.max(progress * n - i, 0), 1);
                    w.style.opacity = wp;
                    w.style.transform = "translateY(" + (1 - wp) * 20 + "px)";
                });
            });
            ticking = false;
        }

        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        update();
    })();

    // Subtle parallax between title and metadata inside project cards
    (function initCardParallax() {
        if (reduceMotion) return;
        var cards = document.querySelectorAll(".project-card");
        if (!cards.length) return;

        var items = Array.prototype.map.call(cards, function (card) {
            return {
                title: card.querySelector("h3"),
                meta: card.querySelector(".project-card__stack"),
                card: card
            };
        });

        var ticking = false;
        function update() {
            var center = window.innerHeight / 2;
            items.forEach(function (item) {
                var rect = item.card.getBoundingClientRect();
                var delta = center - (rect.top + rect.height / 2);
                var clamped = Math.min(Math.max(delta, -120), 120);
                if (item.title) {
                    item.title.style.transform = "translateY(" + clamped * 0.02 + "px)";
                }
                if (item.meta) {
                    item.meta.style.transform = "translateY(" + clamped * 0.035 + "px)";
                }
            });
            ticking = false;
        }

        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        update();
    })();
})();

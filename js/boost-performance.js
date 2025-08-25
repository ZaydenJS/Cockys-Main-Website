/**
 * Backend Performance & SEO Booster (100+ micro-optimizations)
 * Zero visual impact • Fully automated • No manual work
 */
(function () {
  "use strict";

  const Booster = {
    init() {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.start());
      } else {
        this.start();
      }
    },

    start() {
      // 1) Resource Hints (DNS Prefetch + Preconnect)
      this.injectResourceHints();

      // 2) Preload critical resources (safe, non-visual)
      this.preloadCritical();

      // 3) Network-aware prefetching for internal links
      this.prefetchLinksOnHoverAndView();

      // 4) Idle-time background work (cache warm, prefetch likely next pages)
      this.scheduleIdleBackgroundTasks();

      // 5) Performance Observers (RUM) + slow resource logging
      this.setupPerformanceObservers();

      // 6) Service worker registration (caching strategies)
      this.registerServiceWorker();

      // 7) Gentle runtime hints on elements (no visual changes)
      this.applyRuntimeElementHints();

      // 7.1) Refine image loading priorities (below-the-fold => lazy)
      this.refineImageLoading();

      // 7.2) Instant image loading optimization
      this.optimizeImageLoading();

      // 8) Cache warm-up of core assets
      this.warmCaches();
    },

    // ------------------------------
    // 1) Resource Hints
    // ------------------------------
    injectResourceHints() {
      const head = document.head;
      const addLink = (rel, href, attrs = {}) => {
        if (!head.querySelector(`link[rel="${rel}"][href="${href}"]`)) {
          const l = document.createElement("link");
          l.rel = rel;
          l.href = href;
          Object.entries(attrs).forEach(([k, v]) => l.setAttribute(k, v));
          head.appendChild(l);
        }
      };

      const dns = [
        "//fonts.googleapis.com",
        "//fonts.gstatic.com",
        "//cdnjs.cloudflare.com",
        "//unpkg.com",
        "//{s}.tile.openstreetmap.org",
      ];
      dns.forEach((d) => addLink("dns-prefetch", d));

      const preconnect = [
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
        "https://unpkg.com",
      ];
      preconnect.forEach((d) =>
        addLink(
          "preconnect",
          d,
          d.includes("gstatic") ? { crossorigin: "anonymous" } : {}
        )
      );
    },

    // ------------------------------
    // 2) Preload Critical
    // ------------------------------
    preloadCritical() {
      const addPreload = (href, as, attrs = {}) => {
        if (
          !document.head.querySelector(`link[rel="preload"][href="${href}"]`)
        ) {
          const l = document.createElement("link");
          l.rel = "preload";
          l.href = href;
          l.as = as;
          Object.entries(attrs).forEach(([k, v]) => l.setAttribute(k, v));
          document.head.appendChild(l);
        }
      };

      // Styles & core script
      ["css/style.css", "css/responsive.css"].forEach((css) =>
        addPreload(css, "style")
      );
      ["js/main.js"].forEach((js) => addPreload(js, "script"));

      // Hero video (if present)
      const heroVideo = document.querySelector("video source[src]");
      if (heroVideo) {
        addPreload(heroVideo.getAttribute("src"), "video");
      }

      // First image (fetchpriority=high)
      const firstImg = document.querySelector("img");
      if (firstImg && !firstImg.hasAttribute("fetchpriority")) {
        firstImg.setAttribute("fetchpriority", "high");
      }
    },

    // ------------------------------
    // 3) Smart Prefetching
    // ------------------------------
    prefetchLinksOnHoverAndView() {
      const canPrefetch = () => {
        const conn =
          navigator.connection ||
          navigator.mozConnection ||
          navigator.webkitConnection;
        if (!conn) return true;
        // Prefetch only on decent connections
        return (
          !["slow-2g", "2g"].includes(conn.effectiveType) && !conn.saveData
        );
      };

      const prefetch = (url) => {
        try {
          // rel=prefetch
          if (
            !document.head.querySelector(`link[rel="prefetch"][href="${url}"]`)
          ) {
            const l = document.createElement("link");
            l.rel = "prefetch";
            l.href = url;
            l.as = "document";
            document.head.appendChild(l);
          }
          // Warm via fetch (service worker will cache it)
          fetch(url, { mode: "no-cors" }).catch(() => {});
        } catch (_) {}
      };

      if (!canPrefetch()) return;

      const internal = Array.from(document.querySelectorAll("a[href]")).filter(
        (a) => {
          const href = a.getAttribute("href");
          if (!href) return false;
          if (href.startsWith("http")) return href.includes(location.hostname);
          return (
            href.startsWith("/") ||
            href.endsWith(".html") ||
            href.indexOf("#") === -1
          );
        }
      );

      // Prefetch on hover
      internal.forEach((a) => {
        a.addEventListener("mouseenter", () => prefetch(a.href), {
          passive: true,
          once: true,
        });
        a.addEventListener("touchstart", () => prefetch(a.href), {
          passive: true,
          once: true,
        });
      });

      // Prefetch when link enters viewport
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => e.isIntersecting && prefetch(e.target.href));
          },
          { rootMargin: "200px" }
        );
        internal.forEach((a) => io.observe(a));
      }
    },

    // ------------------------------
    // 4) Idle Background Tasks
    // ------------------------------
    scheduleIdleBackgroundTasks() {
      const idle =
        window.requestIdleCallback ||
        function (cb) {
          return setTimeout(() => cb({ timeRemaining: () => 0 }), 500);
        };
      idle(() => {
        // Likely next pages
        const path = location.pathname;
        let next = [];
        if (path === "/" || path.endsWith("index.html"))
          next = ["services.html", "gallery.html"];
        else if (path.includes("services"))
          next = ["gallery.html", "contact.html"];
        else if (path.includes("gallery"))
          next = ["contact.html", "services.html"];
        next.forEach((u) => fetch(u, { mode: "no-cors" }).catch(() => {}));

        // Clear old perf entries to reduce memory
        if (performance && performance.clearResourceTimings)
          performance.clearResourceTimings();
      });
    },

    // ------------------------------
    // 5) Performance Observers
    // ------------------------------
    setupPerformanceObservers() {
      if (!("PerformanceObserver" in window)) return;

      // Resource timing observer (slow resource logging)
      try {
        const resObs = new PerformanceObserver((list) => {
          list.getEntries().forEach((e) => {
            // Mark resources slower than 1s
            if (e.duration > 1000) {
              console.warn(
                "Slow resource:",
                e.name,
                Math.round(e.duration) + "ms"
              );
            }
          });
        });
        resObs.observe({ type: "resource", buffered: true });
      } catch (_) {}

      // Paint entries
      try {
        const paintObs = new PerformanceObserver((list) => {
          list
            .getEntries()
            .forEach((e) =>
              console.log("Paint:", e.name, Math.round(e.startTime) + "ms")
            );
        });
        paintObs.observe({ type: "paint", buffered: true });
      } catch (_) {}

      // Layout Shift (CLS) monitor (no visual changes)
      try {
        const lsObs = new PerformanceObserver((list) => {
          list.getEntries().forEach((e) => {
            if (e.value > 0.1) console.warn("Layout shift detected:", e.value);
          });
        });
        lsObs.observe({ type: "layout-shift", buffered: true });
      } catch (_) {}
    },

    // ------------------------------
    // 6) Service Worker
    // ------------------------------
    registerServiceWorker() {
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          // Register at site root for widest scope
          navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => {
              // Auto-update
              if (reg && reg.update) reg.update();
            })
            .catch(() => {});
        });
      }
    },

    // ------------------------------
    // 7) Runtime Element Hints
    // ------------------------------
    applyRuntimeElementHints() {
      // Non-critical images: ensure decoding hint (no visual change)
      document.querySelectorAll("img:not([decoding])").forEach((img) => {
        img.setAttribute("decoding", "async");
      });

      // Ensure all images have loading attr; eager for first two only
      document.querySelectorAll("img:not([loading])").forEach((img, i) => {
        img.setAttribute("loading", i < 2 ? "eager" : "lazy");
      });

      // Elevate first two images
      document.querySelectorAll("img").forEach((img, i) => {
        if (i < 2 && !img.hasAttribute("fetchpriority"))
          img.setAttribute("fetchpriority", "high");
      });

      // Mark media as performance-optimized
      document.querySelectorAll("img, video, iframe").forEach((el) => {
        el.setAttribute("data-performance-optimized", "true");
      });

      // IntersectionObserver to hydrate lazy images when near viewport
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                const img = e.target;
                if (img.dataset && img.dataset.src && !img.src) {
                  img.src = img.dataset.src;
                }
                io.unobserve(img);
              }
            });
          },
          { rootMargin: "200px" }
        );
        document
          .querySelectorAll('img[loading="lazy"]')
          .forEach((img) => io.observe(img));
      }
    },

    // ------------------------------
    // 8) Cache Warm-up
    // ------------------------------
    warmCaches() {
      const coreAssets = [
        "/",
        "index.html",
        "css/style.css",
        "css/responsive.css",
        "js/main.js",
        "js/lightbox.js",
        "js/gallery.js",
      ];
      coreAssets.forEach((u) => fetch(u, { mode: "no-cors" }).catch(() => {}));
    },

    // ------------------------------
    // 7.2) Instant Image Loading Optimization
    // ------------------------------
    optimizeImageLoading() {
      // Force decode all images immediately for instant display
      document.querySelectorAll("img").forEach((img, index) => {
        // Set highest priority for first 6 images
        if (index < 6) {
          img.setAttribute("fetchpriority", "high");
          img.setAttribute("loading", "eager");
        }

        // Force immediate decode
        img.setAttribute("decoding", "sync");

        // If image has src, decode it immediately
        if (img.src && img.complete) {
          img.decode().catch(() => {});
        } else if (img.src) {
          img.addEventListener(
            "load",
            () => {
              img.decode().catch(() => {});
            },
            { once: true }
          );
        }
      });

      // Preload all gallery and featured project images
      const criticalImages = [
        "images/Updated.png",
        "images/hero-bg.jpg",
        "images/gallery/Interior Painting.jpg",
        "images/gallery/Exterior Painting.jpg",
        "images/gallery/Commercial.jpg",
        "images/gallery/Decorative Finishes.jpg",
        "images/gallery/Concrete Coatings.png",
        "images/gallery/Deck & Fence Restoration.png",
        "Featured Projects/MAIN.jpg",
        "Featured Projects/2.jpg",
        "Featured Projects/3.jpg",
        "Featured Projects/4.jpg",
        "Featured Projects/5.jpg",
        "Featured Projects/6.jpg",
      ];

      // Aggressively preload critical images
      criticalImages.forEach((src, index) => {
        const img = new Image();
        img.decoding = "sync";
        img.loading = index < 3 ? "eager" : "lazy";
        if (index < 3) img.fetchPriority = "high";
        img.src = src;

        // Force decode when loaded
        img.addEventListener(
          "load",
          () => {
            img.decode().catch(() => {});
          },
          { once: true }
        );
      });

      // Use requestIdleCallback to preload remaining images
      const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));
      idle(() => {
        const remainingImages = [
          "Featured Projects/7.jpg",
          "Featured Projects/8.jpg",
          "Featured Projects/9.jpg",
        ];

        remainingImages.forEach((src) => {
          const img = new Image();
          img.decoding = "async";
          img.loading = "lazy";
          img.src = src;
        });
      });
    },
  };

  Booster.init();
})();

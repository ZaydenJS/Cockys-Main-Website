/**
 * Advanced Image Optimization System
 * - WebP format detection and fallback
 * - Responsive image loading with srcset
 * - Lazy loading with intersection observer
 * - Progressive image enhancement
 * Zero visual impact, maximum performance gain
 */
(function () {
  "use strict";

  const ImageOptimizer = {
    init() {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.start());
      } else {
        this.start();
      }
    },

    start() {
      this.detectWebPSupport();
      this.optimizeImages();
      this.setupLazyLoading();
      this.preloadCriticalImages();
      this.setupResponsiveImages();
    },

    // Detect WebP support and add class to html
    detectWebPSupport() {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        if (webP.height === 2) {
          document.documentElement.classList.add("webp-supported");
        } else {
          document.documentElement.classList.add("webp-not-supported");
        }
      };
      webP.src =
        "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    },

    // Optimize existing images
    optimizeImages() {
      const images = document.querySelectorAll("img");
      images.forEach((img) => {
        // Add loading="lazy" to non-critical images
        if (!img.hasAttribute("loading") && !this.isCriticalImage(img)) {
          img.loading = "lazy";
        }

        // Add decoding="async" for better performance
        if (!img.hasAttribute("decoding")) {
          img.decoding = "async";
        }

        // Optimize image dimensions
        this.optimizeImageDimensions(img);
      });
    },

    // Check if image is critical (above the fold)
    isCriticalImage(img) {
      const criticalSelectors = [
        ".logo-img",
        ".hero-video img",
        ".hero-brand img",
        '[fetchpriority="high"]',
      ];

      // Also check by src for specific critical images
      const criticalSrcs = [
        "images/Updated.png",
        "Featured Projects/MAIN.jpg",
        "images/Why Choose Cocky's Painting.jpg",
      ];

      const matchesSelector = criticalSelectors.some(
        (selector) => img.matches(selector) || img.closest(selector)
      );

      const matchesSrc = criticalSrcs.some(
        (src) => img.src && img.src.includes(src)
      );

      return matchesSelector || matchesSrc;
    },

    // Optimize image dimensions based on container
    optimizeImageDimensions(img) {
      if (!img.width || !img.height) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const rect = entry.target.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                entry.target.width = Math.ceil(rect.width);
                entry.target.height = Math.ceil(rect.height);
              }
              observer.unobserve(entry.target);
            }
          });
        });
        observer.observe(img);
      }
    },

    // Setup advanced lazy loading
    setupLazyLoading() {
      if (!("IntersectionObserver" in window)) return;

      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      const imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              this.loadImageWithFallback(img);
              observer.unobserve(img);
            }
          });
        },
        {
          rootMargin: "50px 0px",
          threshold: 0.01,
        }
      );

      lazyImages.forEach((img) => imageObserver.observe(img));
    },

    // Load image with WebP fallback
    loadImageWithFallback(img) {
      const originalSrc = img.src || img.dataset.src;
      if (!originalSrc) return;

      // Try WebP version first if supported
      if (document.documentElement.classList.contains("webp-supported")) {
        const webpSrc = this.getWebPVersion(originalSrc);
        if (webpSrc !== originalSrc) {
          const testImg = new Image();
          testImg.onload = () => {
            img.src = webpSrc;
          };
          testImg.onerror = () => {
            img.src = originalSrc;
          };
          testImg.src = webpSrc;
          return;
        }
      }

      img.src = originalSrc;
    },

    // Generate WebP version path
    getWebPVersion(src) {
      // Convert common image extensions to WebP
      return src.replace(/\.(jpg|jpeg|png)$/i, ".webp");
    },

    // Preload critical images with priority
    preloadCriticalImages() {
      const criticalImages = ["images/Updated.png", "videos/test.mp4"];

      criticalImages.forEach((src) => {
        if (
          !document.head.querySelector(`link[rel="preload"][href="${src}"]`)
        ) {
          const link = document.createElement("link");
          link.rel = "preload";
          link.href = src;
          link.as = src.includes(".mp4") ? "video" : "image";
          if (!src.includes(".mp4")) {
            link.setAttribute("fetchpriority", "high");
          }
          document.head.appendChild(link);
        }
      });
    },

    // Setup responsive images
    setupResponsiveImages() {
      const images = document.querySelectorAll("img:not([srcset])");
      images.forEach((img) => {
        if (this.shouldMakeResponsive(img)) {
          this.addResponsiveSrcset(img);
        }
      });
    },

    // Check if image should be made responsive
    shouldMakeResponsive(img) {
      const src = img.src || img.dataset.src;
      if (!src) return false;

      // Skip small images and icons
      const rect = img.getBoundingClientRect();
      return rect.width > 200 || img.naturalWidth > 200;
    },

    // Add responsive srcset
    addResponsiveSrcset(img) {
      const src = img.src || img.dataset.src;
      if (!src) return;

      const basePath = src.substring(0, src.lastIndexOf("."));
      const extension = src.substring(src.lastIndexOf("."));

      // Generate srcset for different screen densities
      const srcset = [
        `${basePath}${extension} 1x`,
        `${basePath}@2x${extension} 2x`,
      ].join(", ");

      img.srcset = srcset;
    },

    // Progressive image enhancement
    enhanceImageLoading() {
      const images = document.querySelectorAll("img");
      images.forEach((img) => {
        img.addEventListener("load", () => {
          img.classList.add("loaded");
        });

        img.addEventListener("error", () => {
          // Fallback to original format if WebP fails
          if (img.src.includes(".webp")) {
            img.src = img.src.replace(".webp", ".jpg");
          }
        });
      });
    },
  };

  // Initialize the image optimizer
  ImageOptimizer.init();
})();

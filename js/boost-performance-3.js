/**
 * Backend Performance & SEO Booster (Phase 3)
 * More backend-only micro-optimizations, still zero visual impact
 */
(function () {
  'use strict';

  const Phase3 = {
    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    },

    start() {
      this.limitThirdPartyLatency();
      this.guardHeavyResources();
      this.deferNonCriticalTasks();
      this.addHeadResourceHints();
      this.safeInlineMetrics();
    },

    // 1) Add a watchdog for slow third-party requests (console-only)
    limitThirdPartyLatency() {
      if (!('PerformanceObserver' in window)) return;
      try {
        const obs = new PerformanceObserver((list) => {
          list.getEntries().forEach((e) => {
            if (e.initiatorType === 'script' || e.initiatorType === 'img' || e.initiatorType === 'link') {
              const isThirdParty = e.name && !e.name.includes(location.hostname);
              if (isThirdParty && e.duration > 1200) {
                console.warn('3P slow resource:', e.name, Math.round(e.duration) + 'ms');
              }
            }
          });
        });
        obs.observe({ type: 'resource', buffered: true });
      } catch (_) {}
    },

    // 2) Guard heavy resources by hinting preloading only when needed
    guardHeavyResources() {
      // If connection is slow or Save-Data, do not add heavy preloads
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const slow = conn && (conn.saveData || ['slow-2g', '2g'].includes(conn.effectiveType));
      if (slow) return; // leave as-is for slow connections

      // Preload only a handful of largest images if present above the fold
      const hero = document.querySelector('img');
      if (hero && !document.head.querySelector(`link[rel="preload"][href="${hero.currentSrc || hero.src}"]`)) {
        const l = document.createElement('link');
        l.rel = 'preload'; l.as = 'image'; l.href = hero.currentSrc || hero.src;
        document.head.appendChild(l);
      }
    },

    // 3) Defer non-critical tasks to idle time
    deferNonCriticalTasks() {
      const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 500));
      idle(() => {
        // Cleanup empty link prefetches
        document.querySelectorAll('link[rel="prefetch"]').forEach((l) => {
          // Keep only document prefetch hints
          const as = l.getAttribute('as');
          if (as && as !== 'document') l.parentNode.removeChild(l);
        });
      });
    },

    // 4) Add resource hints to head if missing (non-visual)
    addHeadResourceHints() {
      const add = (rel, href, attrs = {}) => {
        if (!document.head.querySelector(`link[rel="${rel}"][href="${href}"]`)) {
          const l = document.createElement('link');
          l.rel = rel; l.href = href;
          Object.entries(attrs).forEach(([k, v]) => l.setAttribute(k, v));
          document.head.appendChild(l);
        }
      };
      add('preconnect', 'https://fonts.googleapis.com');
      add('preconnect', 'https://fonts.gstatic.com', { crossorigin: 'anonymous' });
    },

    // 5) Safe inline metrics into a meta tag (no visuals)
    safeInlineMetrics() {
      try {
        const timing = performance.timing || {};
        const payload = {
          dns: timing.domainLookupEnd - timing.domainLookupStart,
          connect: timing.connectEnd - timing.connectStart,
          ttfb: timing.responseStart - timing.requestStart,
        };
        const meta = document.createElement('meta');
        meta.name = 'x-perf-metrics';
        meta.content = JSON.stringify(payload);
        document.head.appendChild(meta);
      } catch (_) {}
    },
  };

  Phase3.init();
})();


/**
 * Backend Performance & SEO Booster (Phase 4)
 * - Prefetch history heuristics
 * - Retry with exponential backoff for non-critical fetches
 * - Prefetch concurrency control + cancellation when hidden
 * - Google Fonts display=swap enforcement
 * Zero visual impact • Fully automated
 */
(function () {
  'use strict';

  const Phase4 = {
    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    },

    start() {
      this._prefetchPaused = document.hidden;
      this.setupVisibilityPause();
      this.enforceGoogleFontsSwap();
      this.trackRouteVisit();
      this.prefetchFromHistoryHeuristics();
    },

    // Pause initiating new prefetch work when tab is hidden; resume when visible
    setupVisibilityPause() {
      document.addEventListener('visibilitychange', () => {
        this._prefetchPaused = document.hidden;
        if (!this._prefetchPaused) {
          // Try again when visible
          this.prefetchFromHistoryHeuristics();
        } else {
          // Cancel in-flight prefetches
          if (this._controllers) this._controllers.forEach((c) => c.abort());
          this._controllers = [];
        }
      });
    },

    // Ensure Google Fonts use display=swap to avoid FOIT; no visual change
    enforceGoogleFontsSwap() {
      document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;
        if (!/display=swap/.test(href)) {
          const sep = href.includes('?') ? '&' : '?';
          link.setAttribute('href', href + sep + 'display=swap');
        }
      });
    },

    // Maintain simple history of visited internal routes for heuristics
    trackRouteVisit() {
      try {
        const key = 'bp4-route-history';
        const path = location.pathname.replace(/^\/+/, '') || 'index.html';
        const raw = localStorage.getItem(key);
        const map = raw ? JSON.parse(raw) : {};
        map[path] = (map[path] || 0) + 1;
        localStorage.setItem(key, JSON.stringify(map));
      } catch (_) {}
    },

    // Prefetch top-N routes from history when conditions are good
    prefetchFromHistoryHeuristics() {
      if (this._prefetchPaused) return;

      const canPrefetch = () => {
        const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return !(c && (c.saveData || ['slow-2g', '2g'].includes(c.effectiveType)));
      };
      if (!canPrefetch()) return;

      // Load top 3 most-visited internal pages not equal to current
      const hist = this.getHistoryTopN(3);
      const current = location.pathname.replace(/^\/+/, '') || 'index.html';
      const targets = hist.filter((p) => p !== current);
      if (targets.length === 0) return;

      // Prefetch with concurrency control and retry/backoff
      this.prefetchQueue(targets.map((p) => '/' + p), { concurrency: 2, mode: 'no-cors' });
    },

    getHistoryTopN(n) {
      try {
        const raw = localStorage.getItem('bp4-route-history');
        const map = raw ? JSON.parse(raw) : {};
        return Object.keys(map)
          .sort((a, b) => map[b] - map[a])
          .slice(0, n);
      } catch (_) {
        return [];
      }
    },

    prefetchQueue(urls, { concurrency = 2, mode = 'no-cors' } = {}) {
      const queue = urls.slice();
      let active = 0;
      this._controllers = this._controllers || [];

      const pump = () => {
        if (this._prefetchPaused) return;
        while (active < concurrency && queue.length) {
          const url = queue.shift();
          active++;
          const ctrl = new AbortController();
          this._controllers.push(ctrl);
          this.fetchWithBackoff(url, { mode, signal: ctrl.signal })
            .catch(() => {})
            .finally(() => {
              active--;
              pump();
            });
        }
      };
      pump();
    },

    // Retry with exponential backoff for non-critical fetches
    fetchWithBackoff(input, options = {}) {
      const maxRetries = 3;
      const baseDelay = 200; // ms
      let attempt = 0;

      const tryFetch = () => {
        return fetch(input, options).then((res) => res).catch((err) => {
          if (attempt >= maxRetries || (options.signal && options.signal.aborted)) throw err;
          attempt++;
          const delay = baseDelay * Math.pow(2, attempt - 1);
          return new Promise((resolve) => setTimeout(resolve, delay)).then(tryFetch);
        });
      };
      return tryFetch();
    },
  };

  Phase4.init();
})();


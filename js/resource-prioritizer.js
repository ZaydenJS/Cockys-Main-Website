/**
 * Advanced Resource Prioritization System
 * - Intelligent preloading based on user behavior
 * - Connection optimization and resource hints
 * - Critical resource path optimization
 * - Bandwidth-aware loading strategies
 * Zero visual impact, maximum performance optimization
 */
(function() {
  'use strict';

  const ResourcePrioritizer = {
    init() {
      this.connectionInfo = this.getConnectionInfo();
      this.userBehavior = this.initUserBehavior();
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    },

    start() {
      this.optimizeConnections();
      this.prioritizeCriticalResources();
      this.setupIntelligentPrefetching();
      this.optimizeResourceHints();
      this.setupBandwidthAwareLoading();
      this.monitorResourcePerformance();
    },

    // Get connection information
    getConnectionInfo() {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      return {
        effectiveType: conn?.effectiveType || '4g',
        downlink: conn?.downlink || 10,
        saveData: conn?.saveData || false,
        rtt: conn?.rtt || 100
      };
    },

    // Initialize user behavior tracking
    initUserBehavior() {
      return {
        scrollDepth: 0,
        timeOnPage: Date.now(),
        interactions: 0,
        likelyNextPages: this.predictNextPages()
      };
    },

    // Optimize connection setup
    optimizeConnections() {
      const criticalDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://cdnjs.cloudflare.com'
      ];

      criticalDomains.forEach(domain => {
        this.addResourceHint('preconnect', domain, { crossorigin: true });
      });

      // DNS prefetch for likely next domains
      const prefetchDomains = [
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com'
      ];

      prefetchDomains.forEach(domain => {
        this.addResourceHint('dns-prefetch', domain);
      });
    },

    // Add resource hint if not already present
    addResourceHint(rel, href, attrs = {}) {
      const existing = document.head.querySelector(`link[rel="${rel}"][href="${href}"]`);
      if (existing) return;

      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      
      Object.entries(attrs).forEach(([key, value]) => {
        if (value === true) {
          link.setAttribute(key, '');
        } else if (value) {
          link.setAttribute(key, value);
        }
      });

      document.head.appendChild(link);
    },

    // Prioritize critical resources
    prioritizeCriticalResources() {
      const criticalResources = [
        { href: 'css/style.css', as: 'style', priority: 'high' },
        { href: 'css/responsive.css', as: 'style', priority: 'high' },
        { href: 'js/main.js', as: 'script', priority: 'high' }
      ];

      criticalResources.forEach(resource => {
        if (!document.head.querySelector(`link[rel="preload"][href="${resource.href}"]`)) {
          this.addResourceHint('preload', resource.href, {
            as: resource.as,
            fetchpriority: resource.priority
          });
        }
      });
    },

    // Setup intelligent prefetching based on user behavior
    setupIntelligentPrefetching() {
      // Track scroll depth for content prefetching
      let ticking = false;
      const updateScrollDepth = () => {
        const scrolled = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        this.userBehavior.scrollDepth = Math.min(scrolled / maxScroll, 1);
        
        // Prefetch next section content when user scrolls 50%
        if (this.userBehavior.scrollDepth > 0.5 && !this.prefetchedNextSection) {
          this.prefetchNextSectionContent();
          this.prefetchedNextSection = true;
        }
        
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateScrollDepth);
          ticking = true;
        }
      }, { passive: true });

      // Track user interactions
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, () => {
          this.userBehavior.interactions++;
        }, { passive: true });
      });

      // Prefetch likely next pages on hover
      this.setupHoverPrefetching();
    },

    // Setup hover-based prefetching
    setupHoverPrefetching() {
      const links = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
      
      links.forEach(link => {
        let prefetchTimeout;
        
        link.addEventListener('mouseenter', () => {
          prefetchTimeout = setTimeout(() => {
            if (this.shouldPrefetch(link.href)) {
              this.prefetchPage(link.href);
            }
          }, 100); // Small delay to avoid prefetching on quick mouse movements
        });

        link.addEventListener('mouseleave', () => {
          clearTimeout(prefetchTimeout);
        });
      });
    },

    // Check if page should be prefetched
    shouldPrefetch(href) {
      // Don't prefetch on slow connections or save-data mode
      if (this.connectionInfo.saveData || 
          ['slow-2g', '2g'].includes(this.connectionInfo.effectiveType)) {
        return false;
      }

      // Don't prefetch if already prefetched
      if (document.head.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
        return false;
      }

      return true;
    },

    // Prefetch a page
    prefetchPage(href) {
      this.addResourceHint('prefetch', href, { as: 'document' });
    },

    // Prefetch next section content
    prefetchNextSectionContent() {
      const nextSectionImages = [
        'images/gallery/Interior Painting.jpg',
        'images/gallery/Exterior Painting.jpg',
        'images/gallery/Commercial.jpg'
      ];

      nextSectionImages.forEach(src => {
        if (this.shouldPrefetch(src)) {
          this.addResourceHint('prefetch', src, { as: 'image' });
        }
      });
    },

    // Predict likely next pages based on current page
    predictNextPages() {
      const currentPath = window.location.pathname;
      const predictions = {
        '/': ['services.html', 'gallery.html', 'about.html'],
        '/index.html': ['services.html', 'gallery.html', 'about.html'],
        '/services.html': ['gallery.html', 'contact.html'],
        '/gallery.html': ['services.html', 'contact.html'],
        '/about.html': ['services.html', 'contact.html'],
        '/contact.html': ['services.html', 'gallery.html']
      };

      return predictions[currentPath] || [];
    },

    // Optimize resource hints based on page content
    optimizeResourceHints() {
      // Add modulepreload for ES modules if supported
      if ('noModule' in HTMLScriptElement.prototype) {
        const moduleScripts = document.querySelectorAll('script[type="module"]');
        moduleScripts.forEach(script => {
          if (script.src) {
            this.addResourceHint('modulepreload', script.src);
          }
        });
      }
    },

    // Setup bandwidth-aware loading
    setupBandwidthAwareLoading() {
      const { effectiveType, saveData, downlink } = this.connectionInfo;
      
      // Adjust image quality based on connection
      if (saveData || ['slow-2g', '2g'].includes(effectiveType)) {
        document.documentElement.classList.add('low-bandwidth');
        this.reducedQualityMode();
      } else if (downlink > 5) {
        document.documentElement.classList.add('high-bandwidth');
        this.highQualityMode();
      }
    },

    // Reduced quality mode for slow connections
    reducedQualityMode() {
      // Reduce image preloading
      const preloadImages = document.querySelectorAll('link[rel="preload"][as="image"]');
      preloadImages.forEach(link => {
        if (!link.hasAttribute('fetchpriority')) {
          link.remove();
        }
      });

      // Disable video autoplay
      const videos = document.querySelectorAll('video[autoplay]');
      videos.forEach(video => {
        video.removeAttribute('autoplay');
        video.preload = 'none';
      });
    },

    // High quality mode for fast connections
    highQualityMode() {
      // Preload additional high-quality images
      const additionalImages = [
        'Featured Projects/2.jpg',
        'Featured Projects/3.jpg',
        'Featured Projects/4.jpg'
      ];

      additionalImages.forEach(src => {
        this.addResourceHint('prefetch', src, { as: 'image' });
      });
    },

    // Monitor resource performance
    monitorResourcePerformance() {
      if (!('PerformanceObserver' in window)) return;

      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            // Log slow resources for optimization
            if (entry.duration > 1000) {
              console.warn(`Slow resource detected: ${entry.name} (${Math.round(entry.duration)}ms)`);
            }

            // Track resource timing for analytics
            this.trackResourceTiming(entry);
          });
        });

        observer.observe({ type: 'resource', buffered: true });
      } catch (e) {
        // Silently fail if PerformanceObserver is not supported
      }
    },

    // Track resource timing for performance analytics
    trackResourceTiming(entry) {
      // Store timing data for potential analytics
      if (!window.resourceTimings) {
        window.resourceTimings = [];
      }

      window.resourceTimings.push({
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize,
        type: entry.initiatorType,
        timestamp: entry.startTime
      });

      // Keep only last 50 entries to prevent memory leaks
      if (window.resourceTimings.length > 50) {
        window.resourceTimings = window.resourceTimings.slice(-50);
      }
    }
  };

  // Initialize the resource prioritizer
  ResourcePrioritizer.init();
})();

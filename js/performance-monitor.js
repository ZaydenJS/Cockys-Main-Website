/**
 * Advanced Performance Monitoring System
 * - Real User Metrics (RUM) collection
 * - Core Web Vitals tracking
 * - Performance regression detection
 * - Speed index monitoring
 * Zero visual impact, comprehensive performance insights
 */
(function() {
  'use strict';

  const PerformanceMonitor = {
    init() {
      this.metrics = {};
      this.vitals = {};
      this.startTime = performance.now();
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    },

    start() {
      this.measureCoreWebVitals();
      this.measureCustomMetrics();
      this.setupPerformanceObserver();
      this.trackSpeedIndex();
      this.monitorResourceTiming();
      this.scheduleReporting();
    },

    // Measure Core Web Vitals
    measureCoreWebVitals() {
      // Largest Contentful Paint (LCP)
      this.measureLCP();
      
      // First Input Delay (FID)
      this.measureFID();
      
      // Cumulative Layout Shift (CLS)
      this.measureCLS();
      
      // First Contentful Paint (FCP)
      this.measureFCP();
      
      // Time to First Byte (TTFB)
      this.measureTTFB();
    },

    // Measure Largest Contentful Paint
    measureLCP() {
      if (!('PerformanceObserver' in window)) return;

      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          this.vitals.lcp = {
            value: lastEntry.startTime,
            element: lastEntry.element?.tagName || 'unknown',
            url: lastEntry.url || 'unknown',
            timestamp: Date.now()
          };
          
          this.evaluateMetric('LCP', lastEntry.startTime, {
            good: 2500,
            needsImprovement: 4000
          });
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        console.warn('LCP measurement not supported');
      }
    },

    // Measure First Input Delay
    measureFID() {
      if (!('PerformanceObserver' in window)) return;

      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.vitals.fid = {
              value: entry.processingStart - entry.startTime,
              timestamp: Date.now()
            };
            
            this.evaluateMetric('FID', entry.processingStart - entry.startTime, {
              good: 100,
              needsImprovement: 300
            });
          });
        });

        observer.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        console.warn('FID measurement not supported');
      }
    },

    // Measure Cumulative Layout Shift
    measureCLS() {
      if (!('PerformanceObserver' in window)) return;

      let clsValue = 0;
      let sessionValue = 0;
      let sessionEntries = [];

      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
              
              if (sessionValue && 
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                sessionValue += entry.value;
                sessionEntries.push(entry);
              } else {
                sessionValue = entry.value;
                sessionEntries = [entry];
              }
              
              if (sessionValue > clsValue) {
                clsValue = sessionValue;
                
                this.vitals.cls = {
                  value: clsValue,
                  timestamp: Date.now()
                };
                
                this.evaluateMetric('CLS', clsValue, {
                  good: 0.1,
                  needsImprovement: 0.25
                });
              }
            }
          });
        });

        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('CLS measurement not supported');
      }
    },

    // Measure First Contentful Paint
    measureFCP() {
      if (!('PerformanceObserver' in window)) return;

      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
              this.vitals.fcp = {
                value: entry.startTime,
                timestamp: Date.now()
              };
              
              this.evaluateMetric('FCP', entry.startTime, {
                good: 1800,
                needsImprovement: 3000
              });
            }
          });
        });

        observer.observe({ type: 'paint', buffered: true });
      } catch (e) {
        console.warn('FCP measurement not supported');
      }
    },

    // Measure Time to First Byte
    measureTTFB() {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        
        this.vitals.ttfb = {
          value: ttfb,
          timestamp: Date.now()
        };
        
        this.evaluateMetric('TTFB', ttfb, {
          good: 800,
          needsImprovement: 1800
        });
      }
    },

    // Measure custom performance metrics
    measureCustomMetrics() {
      // Speed Index approximation
      this.measureSpeedIndex();
      
      // Time to Interactive
      this.measureTTI();
      
      // Resource loading metrics
      this.measureResourceMetrics();
    },

    // Approximate Speed Index measurement
    measureSpeedIndex() {
      let speedIndex = 0;
      let lastVisualChange = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            lastVisualChange = entry.startTime;
          }
        });
      });

      try {
        observer.observe({ type: 'paint', buffered: true });
        
        // Simplified speed index calculation
        setTimeout(() => {
          speedIndex = lastVisualChange + (performance.now() - lastVisualChange) * 0.5;
          
          this.metrics.speedIndex = {
            value: speedIndex,
            timestamp: Date.now()
          };
          
          this.evaluateMetric('Speed Index', speedIndex, {
            good: 3000,
            needsImprovement: 4600
          });
        }, 1000);
      } catch (e) {
        console.warn('Speed Index measurement not supported');
      }
    },

    // Track actual Speed Index
    trackSpeedIndex() {
      // Use Intersection Observer to track visual completeness
      const elements = document.querySelectorAll('img, video, .hero-video, .hero-content-overlay');
      let loadedElements = 0;
      const totalElements = elements.length;
      let visualCompleteTime = 0;

      const checkVisualComplete = () => {
        loadedElements++;
        if (loadedElements === totalElements) {
          visualCompleteTime = performance.now();
          
          this.metrics.visualComplete = {
            value: visualCompleteTime,
            timestamp: Date.now()
          };
        }
      };

      elements.forEach(element => {
        if (element.tagName === 'IMG') {
          if (element.complete) {
            checkVisualComplete();
          } else {
            element.addEventListener('load', checkVisualComplete);
            element.addEventListener('error', checkVisualComplete);
          }
        } else if (element.tagName === 'VIDEO') {
          element.addEventListener('loadeddata', checkVisualComplete);
        } else {
          // For other elements, assume they're loaded when visible
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                checkVisualComplete();
                observer.unobserve(entry.target);
              }
            });
          });
          observer.observe(element);
        }
      });
    },

    // Measure Time to Interactive
    measureTTI() {
      // Simplified TTI measurement
      let longTasksEnd = 0;
      
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
              if (entry.duration > 50) {
                longTasksEnd = Math.max(longTasksEnd, entry.startTime + entry.duration);
              }
            });
          });

          observer.observe({ type: 'longtask', buffered: true });
          
          // Estimate TTI as 5 seconds after last long task
          setTimeout(() => {
            const tti = Math.max(longTasksEnd + 5000, performance.now());
            
            this.metrics.tti = {
              value: tti,
              timestamp: Date.now()
            };
          }, 10000);
        } catch (e) {
          console.warn('TTI measurement not supported');
        }
      }
    },

    // Measure resource loading metrics
    measureResourceMetrics() {
      const resources = performance.getEntriesByType('resource');
      
      const cssResources = resources.filter(r => r.name.includes('.css'));
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const imageResources = resources.filter(r => 
        r.name.includes('.jpg') || r.name.includes('.png') || 
        r.name.includes('.webp') || r.name.includes('.gif')
      );

      this.metrics.resources = {
        css: {
          count: cssResources.length,
          totalSize: cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
          avgLoadTime: cssResources.reduce((sum, r) => sum + r.duration, 0) / cssResources.length
        },
        js: {
          count: jsResources.length,
          totalSize: jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
          avgLoadTime: jsResources.reduce((sum, r) => sum + r.duration, 0) / jsResources.length
        },
        images: {
          count: imageResources.length,
          totalSize: imageResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
          avgLoadTime: imageResources.reduce((sum, r) => sum + r.duration, 0) / imageResources.length
        }
      };
    },

    // Setup Performance Observer for ongoing monitoring
    setupPerformanceObserver() {
      if (!('PerformanceObserver' in window)) return;

      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            // Log slow resources
            if (entry.duration > 1000) {
              console.warn(`Slow resource: ${entry.name} (${Math.round(entry.duration)}ms)`);
            }
          });
        });

        observer.observe({ type: 'resource', buffered: true });
      } catch (e) {
        console.warn('Performance Observer not fully supported');
      }
    },

    // Monitor resource timing
    monitorResourceTiming() {
      const checkResourceTiming = () => {
        const resources = performance.getEntriesByType('resource');
        const slowResources = resources.filter(r => r.duration > 2000);
        
        if (slowResources.length > 0) {
          this.metrics.slowResources = slowResources.map(r => ({
            name: r.name,
            duration: r.duration,
            size: r.transferSize
          }));
        }
      };

      setTimeout(checkResourceTiming, 5000);
    },

    // Evaluate metric against thresholds
    evaluateMetric(name, value, thresholds) {
      let rating = 'good';
      if (value > thresholds.needsImprovement) {
        rating = 'poor';
      } else if (value > thresholds.good) {
        rating = 'needs-improvement';
      }

      console.log(`${name}: ${Math.round(value)}ms (${rating})`);
      
      if (rating === 'poor') {
        console.warn(`${name} is performing poorly. Target: <${thresholds.good}ms`);
      }
    },

    // Schedule performance reporting
    scheduleReporting() {
      // Report after page load
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.generateReport();
        }, 2000);
      });

      // Report before page unload
      window.addEventListener('beforeunload', () => {
        this.generateReport();
      });
    },

    // Generate performance report
    generateReport() {
      const report = {
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        connection: this.getConnectionInfo(),
        vitals: this.vitals,
        metrics: this.metrics,
        summary: this.generateSummary()
      };

      console.group('Performance Report');
      console.log('Core Web Vitals:', this.vitals);
      console.log('Custom Metrics:', this.metrics);
      console.log('Performance Summary:', report.summary);
      console.groupEnd();

      // Store report for potential analytics
      window.performanceReport = report;
      
      return report;
    },

    // Get connection information
    getConnectionInfo() {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      return {
        effectiveType: conn?.effectiveType || 'unknown',
        downlink: conn?.downlink || 'unknown',
        rtt: conn?.rtt || 'unknown',
        saveData: conn?.saveData || false
      };
    },

    // Generate performance summary
    generateSummary() {
      const summary = {
        overallScore: 0,
        recommendations: []
      };

      // Calculate overall score based on Core Web Vitals
      let score = 100;
      
      if (this.vitals.lcp?.value > 4000) {
        score -= 30;
        summary.recommendations.push('Optimize Largest Contentful Paint (LCP)');
      } else if (this.vitals.lcp?.value > 2500) {
        score -= 15;
      }

      if (this.vitals.fid?.value > 300) {
        score -= 25;
        summary.recommendations.push('Reduce First Input Delay (FID)');
      } else if (this.vitals.fid?.value > 100) {
        score -= 10;
      }

      if (this.vitals.cls?.value > 0.25) {
        score -= 25;
        summary.recommendations.push('Minimize Cumulative Layout Shift (CLS)');
      } else if (this.vitals.cls?.value > 0.1) {
        score -= 10;
      }

      if (this.metrics.speedIndex?.value > 4600) {
        score -= 20;
        summary.recommendations.push('Improve Speed Index');
      }

      summary.overallScore = Math.max(0, score);
      
      return summary;
    }
  };

  // Initialize performance monitor
  PerformanceMonitor.init();

  // Expose for debugging
  window.PerformanceMonitor = PerformanceMonitor;
})();

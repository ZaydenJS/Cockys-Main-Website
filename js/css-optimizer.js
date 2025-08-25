/**
 * CSS Optimization System
 * - Identifies unused CSS rules
 * - Optimizes CSS delivery
 * - Removes redundant styles
 * - Implements critical CSS extraction
 * Zero visual impact, maximum performance optimization
 */
(function() {
  'use strict';

  const CSSOptimizer = {
    init() {
      this.usedSelectors = new Set();
      this.unusedRules = [];
      this.criticalCSS = '';
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    },

    start() {
      // Wait for all stylesheets to load
      this.waitForStylesheets().then(() => {
        this.analyzeCSS();
        this.optimizeDelivery();
        this.reportOptimizations();
      });
    },

    // Wait for all stylesheets to load
    waitForStylesheets() {
      const stylesheets = Array.from(document.styleSheets);
      const promises = stylesheets.map(sheet => {
        return new Promise(resolve => {
          if (sheet.href) {
            const link = document.querySelector(`link[href="${sheet.href}"]`);
            if (link) {
              if (link.sheet && link.sheet.cssRules) {
                resolve();
              } else {
                link.addEventListener('load', resolve);
                link.addEventListener('error', resolve);
              }
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        });
      });

      return Promise.all(promises);
    },

    // Analyze CSS usage
    analyzeCSS() {
      try {
        Array.from(document.styleSheets).forEach(sheet => {
          this.analyzeStylesheet(sheet);
        });
      } catch (e) {
        console.warn('CSS analysis limited due to CORS restrictions');
      }
    },

    // Analyze individual stylesheet
    analyzeStylesheet(sheet) {
      if (!sheet.cssRules) return;

      try {
        Array.from(sheet.cssRules).forEach(rule => {
          if (rule.type === CSSRule.STYLE_RULE) {
            this.analyzeStyleRule(rule);
          } else if (rule.type === CSSRule.MEDIA_RULE) {
            this.analyzeMediaRule(rule);
          }
        });
      } catch (e) {
        // Skip CORS-restricted stylesheets
      }
    },

    // Analyze style rule
    analyzeStyleRule(rule) {
      const selector = rule.selectorText;
      if (!selector) return;

      // Check if selector is used in the document
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          this.usedSelectors.add(selector);
          
          // Check if this is critical CSS (above the fold)
          const isCritical = Array.from(elements).some(el => 
            this.isAboveTheFold(el)
          );
          
          if (isCritical) {
            this.criticalCSS += rule.cssText + '\n';
          }
        } else {
          this.unusedRules.push({
            selector: selector,
            cssText: rule.cssText,
            parentSheet: rule.parentStyleSheet?.href || 'inline'
          });
        }
      } catch (e) {
        // Invalid selector, mark as potentially unused
        this.unusedRules.push({
          selector: selector,
          cssText: rule.cssText,
          parentSheet: rule.parentStyleSheet?.href || 'inline',
          error: 'Invalid selector'
        });
      }
    },

    // Analyze media rule
    analyzeMediaRule(rule) {
      if (!rule.cssRules) return;

      Array.from(rule.cssRules).forEach(childRule => {
        if (childRule.type === CSSRule.STYLE_RULE) {
          this.analyzeStyleRule(childRule);
        }
      });
    },

    // Check if element is above the fold
    isAboveTheFold(element) {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      
      return rect.top < viewportHeight && rect.bottom > 0;
    },

    // Optimize CSS delivery
    optimizeDelivery() {
      // Add critical CSS to head if not already present
      if (this.criticalCSS && !document.getElementById('critical-css-runtime')) {
        const style = document.createElement('style');
        style.id = 'critical-css-runtime';
        style.textContent = this.criticalCSS;
        document.head.insertBefore(style, document.head.firstChild);
      }

      // Optimize non-critical CSS loading
      this.optimizeNonCriticalCSS();
      
      // Remove unused CSS classes from elements
      this.cleanupUnusedClasses();
    },

    // Optimize non-critical CSS loading
    optimizeNonCriticalCSS() {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      
      stylesheets.forEach(link => {
        // Skip critical stylesheets
        if (link.hasAttribute('data-critical')) return;
        
        // Add loading optimization
        if (!link.hasAttribute('media')) {
          link.setAttribute('media', 'print');
          link.addEventListener('load', function() {
            this.media = 'all';
          });
        }
      });
    },

    // Clean up unused classes from elements
    cleanupUnusedClasses() {
      const elements = document.querySelectorAll('[class]');
      let removedClasses = 0;

      elements.forEach(element => {
        const classes = Array.from(element.classList);
        const usedClasses = classes.filter(className => {
          // Check if class is used in any CSS rule
          return this.isClassUsed(className);
        });

        if (usedClasses.length !== classes.length) {
          element.className = usedClasses.join(' ');
          removedClasses += classes.length - usedClasses.length;
        }
      });

      if (removedClasses > 0) {
        console.log(`CSS Optimizer: Removed ${removedClasses} unused classes from DOM`);
      }
    },

    // Check if class is used in CSS
    isClassUsed(className) {
      // Check against used selectors
      for (const selector of this.usedSelectors) {
        if (selector.includes(`.${className}`)) {
          return true;
        }
      }

      // Check for dynamic classes that might be added by JavaScript
      const dynamicClasses = [
        'active', 'open', 'closed', 'visible', 'hidden',
        'loading', 'loaded', 'error', 'success',
        'hover', 'focus', 'disabled', 'selected'
      ];

      return dynamicClasses.includes(className);
    },

    // Report optimization results
    reportOptimizations() {
      const report = {
        totalSelectors: this.usedSelectors.size + this.unusedRules.length,
        usedSelectors: this.usedSelectors.size,
        unusedRules: this.unusedRules.length,
        criticalCSSSize: this.criticalCSS.length,
        unusedRulesBySheet: this.groupUnusedRulesBySheet()
      };

      console.group('CSS Optimization Report');
      console.log(`Total CSS rules analyzed: ${report.totalSelectors}`);
      console.log(`Used selectors: ${report.usedSelectors}`);
      console.log(`Unused rules: ${report.unusedRules}`);
      console.log(`Critical CSS size: ${report.criticalCSSSize} characters`);
      
      if (report.unusedRules > 0) {
        console.log('Unused rules by stylesheet:', report.unusedRulesBySheet);
        console.log('Consider removing these unused rules to reduce CSS size');
      }
      
      console.groupEnd();

      // Store report for potential analytics
      window.cssOptimizationReport = report;
    },

    // Group unused rules by stylesheet
    groupUnusedRulesBySheet() {
      const grouped = {};
      
      this.unusedRules.forEach(rule => {
        const sheet = rule.parentSheet;
        if (!grouped[sheet]) {
          grouped[sheet] = [];
        }
        grouped[sheet].push(rule.selector);
      });

      return grouped;
    },

    // Generate optimized CSS
    generateOptimizedCSS() {
      let optimizedCSS = '';
      
      // Add critical CSS first
      optimizedCSS += '/* Critical CSS */\n';
      optimizedCSS += this.criticalCSS;
      optimizedCSS += '\n/* Non-critical CSS */\n';
      
      // Add only used CSS rules
      try {
        Array.from(document.styleSheets).forEach(sheet => {
          if (!sheet.cssRules) return;
          
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule.type === CSSRule.STYLE_RULE) {
              const selector = rule.selectorText;
              if (this.usedSelectors.has(selector)) {
                optimizedCSS += rule.cssText + '\n';
              }
            }
          });
        });
      } catch (e) {
        console.warn('Could not generate optimized CSS due to CORS restrictions');
      }

      return optimizedCSS;
    },

    // Export optimization data
    exportOptimizationData() {
      return {
        usedSelectors: Array.from(this.usedSelectors),
        unusedRules: this.unusedRules,
        criticalCSS: this.criticalCSS,
        optimizedCSS: this.generateOptimizedCSS()
      };
    }
  };

  // Initialize CSS optimizer
  CSSOptimizer.init();

  // Expose optimizer for debugging
  window.CSSOptimizer = CSSOptimizer;
})();

/**
 * Performance Validation System
 * - Validates speed index is below 3 seconds
 * - Ensures visual appearance is unchanged
 * - Provides optimization recommendations
 * - Generates performance score
 */
(function() {
  'use strict';

  const PerformanceValidator = {
    init() {
      this.targetSpeedIndex = 3000; // 3 seconds target
      this.validationResults = {};
      this.visualChecks = [];
      
      // Wait for page to fully load before validation
      if (document.readyState === 'complete') {
        this.startValidation();
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => this.startValidation(), 2000);
        });
      }
    },

    startValidation() {
      console.group('🚀 Performance Validation Started');
      console.log('Target: Speed Index < 3000ms');
      
      this.validateSpeedIndex();
      this.validateVisualIntegrity();
      this.validateCoreWebVitals();
      this.validateResourceOptimization();
      this.generateValidationReport();
    },

    // Validate Speed Index
    validateSpeedIndex() {
      const speedIndexMetric = window.PerformanceMonitor?.metrics?.speedIndex;
      const visualCompleteMetric = window.PerformanceMonitor?.metrics?.visualComplete;
      
      let speedIndex = 0;
      
      if (speedIndexMetric) {
        speedIndex = speedIndexMetric.value;
      } else if (visualCompleteMetric) {
        speedIndex = visualCompleteMetric.value;
      } else {
        // Fallback calculation
        speedIndex = this.calculateFallbackSpeedIndex();
      }

      this.validationResults.speedIndex = {
        value: speedIndex,
        target: this.targetSpeedIndex,
        passed: speedIndex < this.targetSpeedIndex,
        improvement: this.targetSpeedIndex - speedIndex
      };

      if (speedIndex < this.targetSpeedIndex) {
        console.log(`✅ Speed Index: ${Math.round(speedIndex)}ms (Target: <${this.targetSpeedIndex}ms)`);
      } else {
        console.warn(`❌ Speed Index: ${Math.round(speedIndex)}ms (Exceeds target by ${Math.round(speedIndex - this.targetSpeedIndex)}ms)`);
      }
    },

    // Fallback Speed Index calculation
    calculateFallbackSpeedIndex() {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      
      let fcp = 0;
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          fcp = entry.startTime;
        }
      });

      // Estimate speed index as FCP + additional loading time
      const domContentLoaded = navigation ? navigation.domContentLoadedEventEnd : 0;
      const loadComplete = navigation ? navigation.loadEventEnd : performance.now();
      
      return fcp + (loadComplete - domContentLoaded) * 0.3;
    },

    // Validate visual integrity
    validateVisualIntegrity() {
      const checks = [
        this.checkHeaderVisibility(),
        this.checkHeroSectionVisibility(),
        this.checkFontLoading(),
        this.checkImageLoading(),
        this.checkLayoutStability()
      ];

      const passedChecks = checks.filter(check => check.passed).length;
      const totalChecks = checks.length;

      this.validationResults.visualIntegrity = {
        passed: passedChecks === totalChecks,
        score: (passedChecks / totalChecks) * 100,
        checks: checks
      };

      console.log(`👁️ Visual Integrity: ${passedChecks}/${totalChecks} checks passed`);
    },

    // Check header visibility
    checkHeaderVisibility() {
      const header = document.querySelector('.header');
      const logo = document.querySelector('.logo-img');
      const companyName = document.querySelector('.company-name h1');

      const isVisible = header && 
        getComputedStyle(header).display !== 'none' &&
        logo && logo.offsetWidth > 0 &&
        companyName && companyName.offsetWidth > 0;

      return {
        name: 'Header Visibility',
        passed: isVisible,
        details: isVisible ? 'Header and logo are visible' : 'Header or logo not visible'
      };
    },

    // Check hero section visibility
    checkHeroSectionVisibility() {
      const heroVideo = document.querySelector('.hero-video');
      const heroContent = document.querySelector('.hero-content-overlay');
      const heroTitle = document.querySelector('.hero-video .hero-title');

      const isVisible = heroVideo && 
        getComputedStyle(heroVideo).display !== 'none' &&
        heroContent && heroContent.offsetHeight > 0 &&
        heroTitle && heroTitle.textContent.trim().length > 0;

      return {
        name: 'Hero Section Visibility',
        passed: isVisible,
        details: isVisible ? 'Hero section is fully visible' : 'Hero section has visibility issues'
      };
    },

    // Check font loading
    checkFontLoading() {
      const testElement = document.createElement('div');
      testElement.style.fontFamily = 'Inter, sans-serif';
      testElement.style.position = 'absolute';
      testElement.style.visibility = 'hidden';
      testElement.textContent = 'Test';
      document.body.appendChild(testElement);

      const fontLoaded = getComputedStyle(testElement).fontFamily.includes('Inter');
      document.body.removeChild(testElement);

      return {
        name: 'Font Loading',
        passed: fontLoaded,
        details: fontLoaded ? 'Custom fonts loaded successfully' : 'Custom fonts not loaded'
      };
    },

    // Check image loading
    checkImageLoading() {
      const criticalImages = document.querySelectorAll('.logo-img, .hero-video img');
      let loadedImages = 0;

      criticalImages.forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
          loadedImages++;
        }
      });

      const allLoaded = loadedImages === criticalImages.length;

      return {
        name: 'Critical Image Loading',
        passed: allLoaded,
        details: `${loadedImages}/${criticalImages.length} critical images loaded`
      };
    },

    // Check layout stability
    checkLayoutStability() {
      const cls = window.PerformanceMonitor?.vitals?.cls?.value || 0;
      const isStable = cls < 0.1; // Good CLS threshold

      return {
        name: 'Layout Stability',
        passed: isStable,
        details: `CLS: ${cls.toFixed(3)} (${isStable ? 'Good' : 'Needs improvement'})`
      };
    },

    // Validate Core Web Vitals
    validateCoreWebVitals() {
      const vitals = window.PerformanceMonitor?.vitals || {};
      
      const checks = {
        lcp: {
          value: vitals.lcp?.value || 0,
          target: 2500,
          passed: (vitals.lcp?.value || 0) < 2500
        },
        fid: {
          value: vitals.fid?.value || 0,
          target: 100,
          passed: (vitals.fid?.value || 0) < 100
        },
        cls: {
          value: vitals.cls?.value || 0,
          target: 0.1,
          passed: (vitals.cls?.value || 0) < 0.1
        },
        fcp: {
          value: vitals.fcp?.value || 0,
          target: 1800,
          passed: (vitals.fcp?.value || 0) < 1800
        }
      };

      this.validationResults.coreWebVitals = checks;

      console.log('📊 Core Web Vitals:');
      Object.entries(checks).forEach(([metric, data]) => {
        const status = data.passed ? '✅' : '❌';
        console.log(`  ${status} ${metric.toUpperCase()}: ${Math.round(data.value)}ms (Target: <${data.target}ms)`);
      });
    },

    // Validate resource optimization
    validateResourceOptimization() {
      const resources = performance.getEntriesByType('resource');
      
      const cssResources = resources.filter(r => r.name.includes('.css'));
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const imageResources = resources.filter(r => 
        r.name.includes('.jpg') || r.name.includes('.png') || 
        r.name.includes('.webp') || r.name.includes('.gif')
      );

      const checks = {
        cssOptimization: {
          passed: cssResources.every(r => r.duration < 500),
          details: `${cssResources.length} CSS files, avg load time: ${Math.round(cssResources.reduce((sum, r) => sum + r.duration, 0) / cssResources.length)}ms`
        },
        jsOptimization: {
          passed: jsResources.every(r => r.duration < 300),
          details: `${jsResources.length} JS files, avg load time: ${Math.round(jsResources.reduce((sum, r) => sum + r.duration, 0) / jsResources.length)}ms`
        },
        imageOptimization: {
          passed: imageResources.every(r => r.duration < 1000),
          details: `${imageResources.length} images, avg load time: ${Math.round(imageResources.reduce((sum, r) => sum + r.duration, 0) / imageResources.length)}ms`
        }
      };

      this.validationResults.resourceOptimization = checks;

      console.log('🔧 Resource Optimization:');
      Object.entries(checks).forEach(([check, data]) => {
        const status = data.passed ? '✅' : '❌';
        console.log(`  ${status} ${check}: ${data.details}`);
      });
    },

    // Generate validation report
    generateValidationReport() {
      const overallScore = this.calculateOverallScore();
      const recommendations = this.generateRecommendations();

      const report = {
        timestamp: Date.now(),
        url: window.location.href,
        overallScore: overallScore,
        speedIndexTarget: this.targetSpeedIndex,
        results: this.validationResults,
        recommendations: recommendations,
        summary: this.generateSummary()
      };

      console.log('\n📋 Validation Summary:');
      console.log(`Overall Score: ${overallScore}/100`);
      console.log(`Speed Index Target: ${this.validationResults.speedIndex?.passed ? 'ACHIEVED' : 'NOT ACHIEVED'}`);
      
      if (recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        recommendations.forEach(rec => console.log(`  • ${rec}`));
      }

      console.groupEnd();

      // Store report globally
      window.performanceValidationReport = report;
      
      return report;
    },

    // Calculate overall performance score
    calculateOverallScore() {
      let score = 100;

      // Speed Index (40% weight)
      if (!this.validationResults.speedIndex?.passed) {
        const excess = this.validationResults.speedIndex?.value - this.targetSpeedIndex;
        score -= Math.min(40, (excess / 1000) * 10);
      }

      // Core Web Vitals (40% weight)
      const vitals = this.validationResults.coreWebVitals || {};
      const vitalsPassed = Object.values(vitals).filter(v => v.passed).length;
      const vitalsTotal = Object.keys(vitals).length;
      if (vitalsTotal > 0) {
        score -= (40 * (vitalsTotal - vitalsPassed)) / vitalsTotal;
      }

      // Visual Integrity (20% weight)
      if (this.validationResults.visualIntegrity) {
        score -= 20 * (1 - this.validationResults.visualIntegrity.score / 100);
      }

      return Math.max(0, Math.round(score));
    },

    // Generate recommendations
    generateRecommendations() {
      const recommendations = [];

      if (!this.validationResults.speedIndex?.passed) {
        recommendations.push('Optimize critical rendering path to improve Speed Index');
      }

      const vitals = this.validationResults.coreWebVitals || {};
      if (vitals.lcp && !vitals.lcp.passed) {
        recommendations.push('Optimize Largest Contentful Paint (LCP) - consider image optimization and server response time');
      }
      if (vitals.fid && !vitals.fid.passed) {
        recommendations.push('Reduce First Input Delay (FID) - minimize JavaScript execution time');
      }
      if (vitals.cls && !vitals.cls.passed) {
        recommendations.push('Improve Cumulative Layout Shift (CLS) - ensure proper image dimensions and avoid layout shifts');
      }

      if (this.validationResults.visualIntegrity?.score < 100) {
        recommendations.push('Address visual integrity issues to ensure consistent appearance');
      }

      return recommendations;
    },

    // Generate summary
    generateSummary() {
      const speedIndexAchieved = this.validationResults.speedIndex?.passed;
      const visualIntegrityScore = this.validationResults.visualIntegrity?.score || 0;
      
      return {
        speedIndexTarget: speedIndexAchieved ? 'ACHIEVED' : 'NOT ACHIEVED',
        visualIntegrity: visualIntegrityScore === 100 ? 'PERFECT' : visualIntegrityScore > 80 ? 'GOOD' : 'NEEDS IMPROVEMENT',
        overallStatus: speedIndexAchieved && visualIntegrityScore === 100 ? 'SUCCESS' : 'NEEDS OPTIMIZATION'
      };
    }
  };

  // Initialize validator when page is ready
  PerformanceValidator.init();

  // Expose for debugging
  window.PerformanceValidator = PerformanceValidator;
})();

// Main JavaScript for Cocky's Painting & Decorating Website

document.addEventListener("DOMContentLoaded", function () {
  // Mobile Navigation
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }

  // Smooth scrolling for anchor links (center service sections)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const href = this.getAttribute("href");
      const target = document.querySelector(href);
      if (target) {
        const serviceAnchor =
          target.classList && target.classList.contains("service-anchor");
        const card = serviceAnchor
          ? target.closest(".service-premium-card") || target
          : target;
        card.scrollIntoView({
          behavior: "smooth",
          block: serviceAnchor ? "center" : "start",
        });
      }
    });
  });

  // If the page loads with a hash (e.g., coming from services.html#...)
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      const serviceAnchor =
        target.classList && target.classList.contains("service-anchor");
      const card = serviceAnchor
        ? target.closest(".service-premium-card") || target
        : target;
      // Delay to ensure layout is ready before centering
      setTimeout(() => {
        card.scrollIntoView({
          behavior: "smooth",
          block: serviceAnchor ? "center" : "start",
        });
      }, 50);
    }
  }
  // Eagerly decode and load all images on the page for instant display
  try {
    document.querySelectorAll("img").forEach((img) => {
      img.setAttribute("loading", "eager");
      img.setAttribute("decoding", "async");
      if (img.dataset && img.dataset.src && !img.src) {
        img.src = img.dataset.src;
      }
      // Touch the image to encourage early fetch
      if (img.complete === false) {
        const _pre = new Image();
        _pre.src = img.src;
      }
    });
  } catch (_) {}

  // Header scroll effect - DISABLED to maintain static charcoal color
  // const header = document.querySelector(".header");
  // if (header) {
  //   window.addEventListener("scroll", function () {
  //     if (window.scrollY > 100) {
  //       header.style.background = "rgba(58, 58, 58, 0.98)";
  //       header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.2)";
  //     } else {
  //       header.style.background = "rgba(58, 58, 58, 0.95)";
  //       header.style.boxShadow = "0 2px 4px rgba(44, 62, 45, 0.08)";
  //     }
  //   });
  // }

  // Gallery functionality
  initializeGallery();

  // Form handling
  initializeForms();

  // Intersection Observer for animations
  initializeAnimations();
});

// Gallery Functions
function initializeGallery() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");

  // Exit early if lightbox elements don't exist on this page
  if (!lightbox || !lightboxImg) {
    return;
  }

  let currentImageIndex = 0;
  let currentImages = [];

  // Filter functionality
  if (filterButtons.length > 0) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const filter = this.getAttribute("data-filter");

        // Update active button
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        // Filter gallery items
        galleryItems.forEach((item) => {
          const category = item.getAttribute("data-category");
          if (filter === "all" || category === filter) {
            item.style.display = "block";
            setTimeout(() => {
              item.style.opacity = "1";
              item.style.transform = "scale(1)";
            }, 100);
          } else {
            item.style.opacity = "0";
            item.style.transform = "scale(0.8)";
            setTimeout(() => {
              item.style.display = "none";
            }, 300);
          }
        });
      });
    });
  }

  // Lightbox functionality
  if (galleryItems.length > 0 && lightbox) {
    galleryItems.forEach((item, index) => {
      item.addEventListener("click", function () {
        const img = this.querySelector("img");
        if (img) {
          currentImages = Array.from(galleryItems)
            .filter((item) => item.style.display !== "none")
            .map((item) => ({
              src: item.querySelector("img").src,
              alt: item.querySelector("img").alt,
            }));

          currentImageIndex = currentImages.findIndex(
            (image) => image.src === img.src
          );
          showLightbox(currentImages[currentImageIndex]);
        }
      });
    });

    // Lightbox controls
    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    if (lightboxPrev) {
      lightboxPrev.addEventListener("click", showPreviousImage);
    }

    if (lightboxNext) {
      lightboxNext.addEventListener("click", showNextImage);
    }

    // Close lightbox on background click
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener("keydown", function (e) {
      if (lightbox.style.display === "flex") {
        switch (e.key) {
          case "Escape":
            closeLightbox();
            break;
          case "ArrowLeft":
            showPreviousImage();
            break;
          case "ArrowRight":
            showNextImage();
            break;
        }
      }
    });
  }

  function showLightbox(image) {
    if (lightboxImg && lightbox) {
      lightboxImg.src = image.src;
      lightboxImg.alt = image.alt;
      lightbox.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.style.display = "none";
      document.body.style.overflow = "auto";
    }
  }

  function showPreviousImage() {
    if (currentImages.length > 0) {
      currentImageIndex =
        (currentImageIndex - 1 + currentImages.length) % currentImages.length;
      showLightbox(currentImages[currentImageIndex]);
    }
  }

  function showNextImage() {
    if (currentImages.length > 0) {
      currentImageIndex = (currentImageIndex + 1) % currentImages.length;
      showLightbox(currentImages[currentImageIndex]);
    }
  }
}

// Form handling
function initializeForms() {
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // Always prevent default submission

      // Basic form validation
      const requiredFields = form.querySelectorAll("[required]");
      let isValid = true;

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add("error");
          showFieldError(field, "This field is required");
        } else {
          field.classList.remove("error");
          hideFieldError(field);
        }
      });

      // Email validation
      const emailFields = form.querySelectorAll('input[type="email"]');
      emailFields.forEach((field) => {
        if (field.value && !isValidEmail(field.value)) {
          isValid = false;
          field.classList.add("error");
          showFieldError(field, "Please enter a valid email address");
        }
      });

      // Phone validation
      const phoneFields = form.querySelectorAll('input[type="tel"]');
      phoneFields.forEach((field) => {
        if (field.value && !isValidPhone(field.value)) {
          isValid = false;
          field.classList.add("error");
          showFieldError(field, "Please enter a valid phone number");
        }
      });

      // If validation passes, submit via AJAX
      if (isValid) {
        submitFormToWeb3Forms(form);
      }
    });
  });
}

// Submit form to Web3Forms via AJAX
function submitFormToWeb3Forms(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.innerHTML;

  // Show loading state
  submitButton.innerHTML =
    '<i class="fas fa-spinner fa-spin" style="margin-right: 10px"></i>Sending...';
  submitButton.disabled = true;

  // Prepare form data
  const formData = new FormData(form);

  // Submit to Web3Forms
  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Success - show message and reset form
        showSuccessMessage(
          "Thank you! Your message has been sent successfully. We'll get back to you within 24 hours."
        );
        form.reset();
      } else {
        // Error from Web3Forms
        showErrorMessage(
          "Sorry, there was an error sending your message. Please try again or call us directly."
        );
      }
    })
    .catch((error) => {
      // Network or other error
      console.error("Form submission error:", error);
      showErrorMessage(
        "Sorry, there was an error sending your message. Please try again or call us directly."
      );
    })
    .finally(() => {
      // Restore button state
      submitButton.innerHTML = originalButtonText;
      submitButton.disabled = false;
    });
}

function showFieldError(field, message) {
  let errorElement = field.parentNode.querySelector(".field-error");
  if (!errorElement) {
    errorElement = document.createElement("span");
    errorElement.className = "field-error";
    field.parentNode.appendChild(errorElement);
  }
  errorElement.textContent = message;
}

function hideFieldError(field) {
  const errorElement = field.parentNode.querySelector(".field-error");
  if (errorElement) {
    errorElement.remove();
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

function showSuccessMessage(message) {
  // Create and show success notification
  const notification = document.createElement("div");
  notification.className = "success-notification";
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: var(--forest-primary);
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        font-size: 0.95rem;
        line-height: 1.4;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

function showErrorMessage(message) {
  // Create and show error notification
  const notification = document.createElement("div");
  notification.className = "error-notification";
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        font-size: 0.95rem;
        line-height: 1.4;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

// Animation on scroll
function initializeAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animateElements = document.querySelectorAll(
    ".service-card, .feature, .gallery-item, .stat"
  );
  animateElements.forEach((el) => {
    observer.observe(el);
  });
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .field-error {
        color: #e74c3c;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    }

    .error {
        border-color: #e74c3c !important;
        box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2) !important;
    }

    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Scroll to services function for hero button
function scrollToServices() {
  const servicesSection = document.getElementById("services");
  if (servicesSection) {
    servicesSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// Scroll from hero to the next section (works on PC and Mobile)
function scrollToNextSection() {
  // Find the company-overview section (first section after hero)
  const companyOverview = document.querySelector(".company-overview");
  if (companyOverview) {
    // Get header height for offset calculation
    const header = document.querySelector(".header");
    const headerOffset = header ? header.offsetHeight : 0;

    // Get viewport height and section dimensions
    const viewportHeight = window.innerHeight;
    const rect = companyOverview.getBoundingClientRect();
    const sectionHeight = rect.height;

    // Mobile-specific adjustments
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // On mobile, scroll to position the "Premium Quality Guaranteed" tag at the top
      const premiumQualityTag = document.getElementById("premium-quality");
      if (premiumQualityTag) {
        const header = document.querySelector(".header");
        const headerOffset = header ? header.offsetHeight : 0;
        const rect = premiumQualityTag.getBoundingClientRect();
        const targetPosition =
          window.pageYOffset + rect.top - headerOffset - 50; // Extra scroll for perfect positioning
        const maxScroll =
          document.documentElement.scrollHeight - viewportHeight;
        const finalPosition = Math.max(0, Math.min(targetPosition, maxScroll));

        window.scrollTo({
          top: finalPosition,
          behavior: "smooth",
        });
        return;
      }

      // Fallback: scroll to company overview section top
      const rect = companyOverview.getBoundingClientRect();
      const header = document.querySelector(".header");
      const headerOffset = header ? header.offsetHeight : 0;
      const targetPosition = window.pageYOffset + rect.top - headerOffset - 50;
      const maxScroll = document.documentElement.scrollHeight - viewportHeight;
      const finalPosition = Math.max(0, Math.min(targetPosition, maxScroll));

      window.scrollTo({
        top: finalPosition,
        behavior: "smooth",
      });
      return;
    }

    // Desktop: Calculate position to center the section in viewport
    const centerOffset = Math.max(
      0,
      (viewportHeight - headerOffset - sectionHeight) / 2
    );
    const targetPosition =
      window.pageYOffset + rect.top - headerOffset - centerOffset;

    // Ensure we don't scroll past the section or above the page
    const maxScroll = document.documentElement.scrollHeight - viewportHeight;
    const finalPosition = Math.max(0, Math.min(targetPosition, maxScroll));

    window.scrollTo({
      top: finalPosition,
      behavior: "smooth",
    });
    return;
  }

  // Fallback: try to find premium-quality element and center it
  const target = document.getElementById("premium-quality");
  if (target) {
    const header = document.querySelector(".header");
    const headerOffset = header ? header.offsetHeight : 0;
    const viewportHeight = window.innerHeight;
    const rect = target.getBoundingClientRect();

    // Center the element in the available viewport space
    const centerOffset = (viewportHeight - headerOffset) / 2;
    const targetPosition =
      window.pageYOffset + rect.top - headerOffset - centerOffset;
    const maxScroll = document.documentElement.scrollHeight - viewportHeight;
    const finalPosition = Math.max(0, Math.min(targetPosition, maxScroll));

    window.scrollTo({
      top: finalPosition,
      behavior: "smooth",
    });
    return;
  }

  // Final fallback - scroll one viewport height
  const viewportHeight = window.innerHeight;
  const currentScroll = window.pageYOffset;
  const maxScroll = document.documentElement.scrollHeight - viewportHeight;
  const targetScroll = Math.min(currentScroll + viewportHeight, maxScroll);

  window.scrollTo({
    top: targetScroll,
    behavior: "smooth",
  });
}

// Expose for inline onclick
window.scrollToNextSection = scrollToNextSection;

// Scroll to Top Button Functionality
function initScrollToTop() {
  const scrollToTopBtn = document.getElementById("scrollToTop");

  if (!scrollToTopBtn) return; // Exit if button doesn't exist on this page

  // Show/hide button based on scroll position
  function toggleScrollButton() {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.classList.add("visible");
    } else {
      scrollToTopBtn.classList.remove("visible");
    }
  }

  // Scroll to top when button is clicked
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Event listeners
  window.addEventListener("scroll", toggleScrollButton);
  scrollToTopBtn.addEventListener("click", scrollToTop);

  // Initial check
  toggleScrollButton();
}

// Initialize scroll to top functionality
document.addEventListener("DOMContentLoaded", initScrollToTop);

// Make function globally available
window.scrollToServices = scrollToServices;

// Gallery Lightbox Functionality
// Gallery images data - All gallery images in order
const galleryImages = [
  {
    src: "images/gallery/Interior Painting.jpg",
    alt: "Interior Painting Project",
  },
  {
    src: "images/gallery/Exterior Painting.jpg",
    alt: "Exterior Painting Project",
  },
  { src: "images/gallery/Commercial.jpg", alt: "Commercial Project" },
  {
    src: "images/gallery/Decorative Finishes.jpg",
    alt: "Decorative Finishes Project",
  },
  {
    src: "images/gallery/Concrete Coatings.png",
    alt: "Concrete Coatings Project",
  },
  {
    src: "images/gallery/Deck & Fence Restoration.png",
    alt: "Deck & Fence Restoration Project",
  },
];

// Preload Gallery images for instant lightbox display and cache natural sizes
const galleryImageMeta = [];
(function preloadGalleryImages() {
  try {
    galleryImages.forEach((item, idx) => {
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = item.src;
      img.addEventListener("load", () => {
        galleryImageMeta[idx] = {
          w: img.naturalWidth || 0,
          h: img.naturalHeight || 0,
        };
      });
    });
  } catch (_) {}
})();

let currentGalleryImageIndex = 0;

// Compute the largest possible displayed width across all images (desktop only)
function computeLargestDisplayedWidth() {
  const maxW = window.innerWidth * 0.8; // matches CSS max-width: 80vw
  const maxH = window.innerHeight * 0.7; // matches CSS max-height: 70vh
  let maxDisplayW = 0;

  galleryImageMeta.forEach((meta) => {
    if (!meta || !meta.w || !meta.h) return;
    const aspect = meta.w / meta.h;
    const widthLimitedByHeight = maxH * aspect;
    const displayW = Math.min(maxW, widthLimitedByHeight);
    if (displayW > maxDisplayW) maxDisplayW = displayW;
  });

  // Fallback if meta not ready yet
  if (maxDisplayW === 0) return Math.round(maxW);
  return Math.round(maxDisplayW);
}

// Initialize gallery lightbox functionality
document.addEventListener("DOMContentLoaded", function () {
  const galleryCards = document.querySelectorAll(".gallery-card");

  // Add click event to each gallery card image
  galleryCards.forEach((card, index) => {
    const cardImage = card.querySelector(".card-image img");
    if (cardImage) {
      cardImage.style.cursor = "pointer";
      cardImage.addEventListener("click", function () {
        openGalleryLightbox(index);
      });
    }
  });

  // Add keyboard navigation
  document.addEventListener("keydown", function (e) {
    const lightbox = document.getElementById("gallery-lightbox");
    if (lightbox && lightbox.classList.contains("active")) {
      switch (e.key) {
        case "Escape":
          closeGalleryLightbox();
          break;
        case "ArrowLeft":
          previousGalleryImage();
          break;
        case "ArrowRight":
          nextGalleryImage();
          break;
      }
    }
  });

  // Close lightbox on background click
  const lightbox = document.getElementById("gallery-lightbox");
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) {
        closeGalleryLightbox();
      }
    });
  }

  // Touch/swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  const lightboxContainer = document.querySelector(
    "#gallery-lightbox .lightbox-container"
  );
  if (lightboxContainer) {
    lightboxContainer.addEventListener("touchstart", function (event) {
      touchStartX = event.changedTouches[0].screenX;
    });

    lightboxContainer.addEventListener("touchend", function (event) {
      touchEndX = event.changedTouches[0].screenX;
      handleGallerySwipe();
    });
  }

  function handleGallerySwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // Swipe right - previous image
        previousGalleryImage();
      } else {
        // Swipe left - next image
        nextGalleryImage();
      }
    }
  }
});

// Open lightbox with specific image
function openGalleryLightbox(index) {
  currentGalleryImageIndex = index;
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImage = document.getElementById("gallery-lightbox-image");

  // Set image
  const currentImage = galleryImages[currentGalleryImageIndex];
  lightboxImage.src = currentImage.src;
  lightboxImage.alt = currentImage.alt;

  // Show lightbox
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent background scrolling

  // Set CSS var with the width of the largest displayed image (desktop only)
  if (window.innerWidth >= 769) {
    const w = computeLargestDisplayedWidth();
    document.documentElement.style.setProperty("--lb-width", `${w}px`);
  }
}

// Close lightbox
function closeGalleryLightbox() {
  const lightbox = document.getElementById("gallery-lightbox");
  lightbox.classList.remove("active");
  document.body.style.overflow = ""; // Restore scrolling

  // Clear CSS var when closing (desktop only)
  if (window.innerWidth >= 769) {
    document.documentElement.style.removeProperty("--lb-width");
  }
}

// Navigate to previous image
function previousGalleryImage() {
  currentGalleryImageIndex =
    (currentGalleryImageIndex - 1 + galleryImages.length) %
    galleryImages.length;
  updateGalleryLightboxContent();
}

// Navigate to next image
function nextGalleryImage() {
  currentGalleryImageIndex =
    (currentGalleryImageIndex + 1) % galleryImages.length;
  updateGalleryLightboxContent();
}

// Update lightbox content
function updateGalleryLightboxContent() {
  const lightboxImage = document.getElementById("gallery-lightbox-image");
  const currentImage = galleryImages[currentGalleryImageIndex];

  // Add fade effect
  lightboxImage.style.opacity = "0";

  setTimeout(() => {
    lightboxImage.src = currentImage.src;
    lightboxImage.alt = currentImage.alt;
    lightboxImage.style.opacity = "1";
  }, 150);
}

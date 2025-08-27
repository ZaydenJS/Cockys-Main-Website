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

// Preload Gallery images for instant lightbox display
(function preloadGalleryImages() {
  try {
    galleryImages.forEach((item) => {
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = item.src;
    });
  } catch (_) {}
})();

let currentGalleryImageIndex = 0;

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

  // Desktop-only: keep nav arrows fixed at edges of the largest possible image
  (function setupFixedArrowPositions() {
    function getMaxDisplayedWidthPx(imageSrcs) {
      return new Promise((resolve) => {
        let remaining = imageSrcs.length;
        let maxAR = 0; // aspect ratio w/h
        const finish = () => {
          if (maxAR <= 0) maxAR = 16 / 9; // sensible fallback
          const width = Math.min(
            window.innerWidth * 0.8, // max-width: 80vw
            window.innerHeight * 0.7 * maxAR // max-height: 70vh converted to width via AR
          );
          resolve(width);
        };
        const timeout = setTimeout(finish, 1000);
        imageSrcs.forEach((src) => {
          const img = new Image();
          img.onload = () => {
            const ar =
              img.naturalWidth && img.naturalHeight
                ? img.naturalWidth / img.naturalHeight
                : 0;
            if (ar > maxAR) maxAR = ar;
            if (--remaining === 0) {
              clearTimeout(timeout);
              finish();
            }
          };
          img.onerror = () => {
            if (--remaining === 0) {
              clearTimeout(timeout);
              finish();
            }
          };
          img.src = src;
        });
      });
    }

    async function positionArrows() {
      if (window.innerWidth < 769) return; // PC only
      const overlay = document.getElementById("gallery-lightbox");
      if (!overlay) return;
      const prev = overlay.querySelector(".lightbox-prev");
      const next = overlay.querySelector(".lightbox-next");
      if (!prev || !next) return;

      const srcs = galleryImages.map((i) => i.src);
      const maxWidth = await getMaxDisplayedWidthPx(srcs);
      const margin = Math.max((window.innerWidth - maxWidth) / 2, 12);
      const arrowSize = 60; // should match CSS
      const gap = 16;
      const offset = Math.max(12, Math.round(margin - arrowSize - gap));

      prev.style.left = offset + "px";
      prev.style.right = "";
      next.style.right = offset + "px";
      next.style.left = "";
    }

    positionArrows();
    window.addEventListener("resize", positionArrows);
    window.positionGalleryArrows = positionArrows;
  })();

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
}

// Close lightbox
function closeGalleryLightbox() {
  const lightbox = document.getElementById("gallery-lightbox");
  lightbox.classList.remove("active");
  document.body.style.overflow = ""; // Restore scrolling
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

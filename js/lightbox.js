// Lightbox Gallery Functionality
// Gallery images data - All featured project images in numerical order
const galleryImages = [
  { src: "Featured Projects/MAIN.jpg" },
  { src: "Featured Projects/2.jpg" },
  { src: "Featured Projects/3.jpg" },
  { src: "Featured Projects/4.jpg" },
  { src: "Featured Projects/5.jpg" },
  { src: "Featured Projects/6.jpg" },
  { src: "Featured Projects/7.jpg" },
  { src: "Featured Projects/8.jpg" },
  { src: "Featured Projects/9.jpg" },
];

// Preload Featured Projects images for instant lightbox display
(function preloadFeaturedProjectImages() {
  try {
    galleryImages.forEach((item) => {
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = item.src;
    });
  } catch (_) {}
})();

let currentImageIndex = 0;

// Open lightbox with specific image
function openLightbox(index) {
  currentImageIndex = index;
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxDescription = document.getElementById("lightbox-description");

  // Set image and content
  const currentImage = galleryImages[currentImageIndex];
  lightboxImage.src = currentImage.src;
  lightboxImage.alt = currentImage.title;
  lightboxTitle.textContent = currentImage.title;
  lightboxDescription.textContent = currentImage.description;

  // Show lightbox
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent background scrolling

  // Add keyboard event listener
  document.addEventListener("keydown", handleKeyPress);
}

// Close lightbox
function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.remove("active");
  document.body.style.overflow = ""; // Restore scrolling

  // Remove keyboard event listener
  document.removeEventListener("keydown", handleKeyPress);
}

// Navigate to previous image
function previousImage() {
  currentImageIndex =
    (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
  updateLightboxContent();
}

// Navigate to next image
function nextImage() {
  currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
  updateLightboxContent();
}

// Update lightbox content
function updateLightboxContent() {
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxDescription = document.getElementById("lightbox-description");

  const currentImage = galleryImages[currentImageIndex];

  // Add fade effect
  lightboxImage.style.opacity = "0";

  setTimeout(() => {
    lightboxImage.src = currentImage.src;
    lightboxImage.alt = currentImage.title;
    lightboxTitle.textContent = currentImage.title;
    lightboxDescription.textContent = currentImage.description;
    lightboxImage.style.opacity = "1";
  }, 150);
}

// Handle keyboard navigation
function handleKeyPress(event) {
  switch (event.key) {
    case "Escape":
      closeLightbox();
      break;
    case "ArrowLeft":
      previousImage();
      break;
    case "ArrowRight":
      nextImage();
      break;
  }
}

// Close lightbox when clicking outside the image
document.addEventListener("DOMContentLoaded", function () {
  const lightbox = document.getElementById("lightbox");

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  // Add smooth transition to lightbox image
  const lightboxImage = document.getElementById("lightbox-image");
  lightboxImage.style.transition = "opacity 0.3s ease";
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("DOMContentLoaded", function () {
  const lightboxContainer = document.querySelector(".lightbox-container");

  lightboxContainer.addEventListener("touchstart", function (event) {
    touchStartX = event.changedTouches[0].screenX;
  });

  lightboxContainer.addEventListener("touchend", function (event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
  });
});

function handleSwipe() {
  const swipeThreshold = 50;
  const swipeDistance = touchEndX - touchStartX;

  if (Math.abs(swipeDistance) > swipeThreshold) {
    if (swipeDistance > 0) {
      // Swipe right - previous image
      previousImage();
    } else {
      // Swipe left - next image
      nextImage();
    }
  }
}

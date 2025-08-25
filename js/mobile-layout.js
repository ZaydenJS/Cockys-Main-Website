// Mobile Layout Adjustments
// - Moves primary hero buttons under the visual on mobile
// - Overlays the team credentials on the bottom-right of the team image on mobile

document.addEventListener("DOMContentLoaded", function () {
  function adjustMobileLayout() {
    const heroContent = document.querySelector(".hero-content");
    const heroActions = document.querySelector(".hero-actions");
    const heroVisual = document.querySelector(".hero-visual");

    if (heroContent && heroActions && heroVisual) {
      // Always clean up existing mobile actions first
      const existingMobileActions = document.querySelector(".mobile-actions");
      if (existingMobileActions) existingMobileActions.remove();

      if (window.innerWidth <= 768) {
        // Clone the buttons with deep clone to preserve all content
        const actionsClone = heroActions.cloneNode(true);
        actionsClone.classList.add("mobile-actions");

        // Ensure all button content is preserved
        const originalButtons = heroActions.querySelectorAll(".btn");
        const clonedButtons = actionsClone.querySelectorAll(".btn");
        originalButtons.forEach((originalBtn, index) => {
          if (clonedButtons[index]) {
            clonedButtons[index].innerHTML = originalBtn.innerHTML;
            clonedButtons[index].className = originalBtn.className;
            clonedButtons[index].href = originalBtn.href;
            if (originalBtn.onclick)
              clonedButtons[index].onclick = originalBtn.onclick;
          }
        });

        // Hide original buttons and insert mobile clone after the visual
        heroActions.style.display = "none";
        heroVisual.parentNode.insertBefore(
          actionsClone,
          heroVisual.nextSibling
        );
      } else {
        // Desktop - restore original layout
        heroActions.style.display = "";
      }
    }
  }

  function adjustTeamCredentialsOverlay() {
    // Credentials are now shown in main layout on mobile, no overlay needed
    const imageContainer = document.querySelector(".team-image-container");
    if (!imageContainer) return;

    // Remove any existing overlay
    const overlay = imageContainer.querySelector(".credentials-overlay");
    if (overlay) overlay.remove();

    // Ensure original credentials are always visible
    const originalCreds = document.querySelector(".team-credentials");
    if (originalCreds) {
      originalCreds.style.display = "";
    }
  }

  function adjustContactPageLayout() {
    // Only run on contact page
    if (!window.location.pathname.includes("contact.html")) return;

    const contactSection = document.querySelector(
      'section[style*="grid-template-columns: 1fr 1fr"]'
    );
    if (!contactSection) return;

    const container = contactSection.querySelector(".container > div");
    if (!container) return;

    const contactInfo = container.children[0]; // Contact Information div
    const contactForm = container.children[1]; // Contact Form div

    if (!contactInfo || !contactForm) return;

    if (window.innerWidth <= 768) {
      // Mobile layout: Form after title/description, then contact details, then buttons
      const titleSection = contactInfo.children[0]; // Title and description
      const detailsSection = contactInfo.children[1]; // Contact details
      const buttonsSection = contactInfo.children[2]; // Buttons

      // Reorganize order: title, form, details, buttons
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "40px";

      // Set order
      titleSection.style.order = "1";
      contactForm.style.order = "2";
      detailsSection.style.order = "3";
      buttonsSection.style.order = "4";
    } else {
      // Desktop layout: restore original
      container.style.display = "";
      container.style.flexDirection = "";
      container.style.gap = "";

      // Reset order
      const elements = [
        contactInfo.children[0],
        contactInfo.children[1],
        contactInfo.children[2],
        contactForm,
      ];
      elements.forEach((el) => {
        if (el) el.style.order = "";
      });
    }
  }

  function adjustWhyChooseUsLayout() {
    // Only run on homepage
    if (
      !window.location.pathname.includes("index.html") &&
      window.location.pathname !== "/"
    )
      return;

    const whyChooseSection = document.querySelector(".why-choose-us");
    if (!whyChooseSection) return;

    const contentSplit = whyChooseSection.querySelector(".content-split");
    const contentLeft = whyChooseSection.querySelector(".content-left");
    const contentRight = whyChooseSection.querySelector(".content-right");
    const title = contentLeft?.querySelector("h2");
    const features = contentLeft?.querySelector(".features");

    if (!contentSplit || !contentLeft || !contentRight || !title || !features)
      return;

    if (window.innerWidth <= 768) {
      // Mobile layout: Title, Image, Features
      contentSplit.style.display = "flex";
      contentSplit.style.flexDirection = "column";
      contentSplit.style.gap = "2rem";
      contentSplit.style.textAlign = "center";

      // Restructure the layout: move title out of contentLeft
      const titleParent = title.parentNode;

      // Create new structure: title first, then image, then features
      contentSplit.innerHTML = "";

      // Add title directly to contentSplit
      const titleContainer = document.createElement("div");
      titleContainer.appendChild(title);
      titleContainer.style.order = "1";
      titleContainer.style.textAlign = "center";
      titleContainer.style.marginBottom = "2rem";
      contentSplit.appendChild(titleContainer);

      // Add image container
      contentRight.style.order = "2";
      contentRight.style.display = "flex";
      contentRight.style.justifyContent = "center";
      contentRight.style.marginBottom = "2rem";
      contentSplit.appendChild(contentRight);

      // Add features container
      const featuresContainer = document.createElement("div");
      featuresContainer.appendChild(features);
      featuresContainer.style.order = "3";
      featuresContainer.style.textAlign = "center";
      contentSplit.appendChild(featuresContainer);
    } else {
      // Desktop layout: restore original structure
      // Check if we need to restore the original structure
      if (contentSplit.children.length === 3) {
        // We have the mobile structure, need to restore desktop
        contentSplit.innerHTML = "";

        // Recreate contentLeft with title and features
        const newContentLeft = document.createElement("div");
        newContentLeft.className = "content-left";
        newContentLeft.appendChild(title);
        newContentLeft.appendChild(features);
        contentSplit.appendChild(newContentLeft);

        // Add contentRight back
        contentSplit.appendChild(contentRight);
      }

      // Reset styles
      contentSplit.style.display = "";
      contentSplit.style.flexDirection = "";
      contentSplit.style.gap = "";
      contentSplit.style.textAlign = "";

      // Reset individual element styles
      if (title) {
        title.style.order = "";
        title.style.marginBottom = "";
      }

      contentRight.style.order = "";
      contentRight.style.display = "";
      contentRight.style.justifyContent = "";
      contentRight.style.marginBottom = "";

      if (features) {
        features.style.order = "";
        features.style.marginTop = "";
      }
    }
  }

  function adjustServiceAreasLayout() {
    // Only run on about page
    if (!window.location.pathname.includes("about.html")) return;

    const serviceAreasSection = document.querySelector(
      ".service-areas-section"
    );
    if (!serviceAreasSection) return;

    const areasContent = serviceAreasSection.querySelector(".areas-content");
    const areasText = serviceAreasSection.querySelector(".areas-text");
    const areasVisual = serviceAreasSection.querySelector(".areas-visual");

    if (!areasContent || !areasText || !areasVisual) return;

    const title = areasText.querySelector("h2");
    const intro = areasText.querySelector(".areas-intro");
    const features = areasText.querySelector(".areas-features");
    const cta = areasText.querySelector(".contact-cta");

    if (!title || !intro || !features || !cta) return;

    if (window.innerWidth <= 768) {
      // Mobile layout: Title, Description, Map, Features, CTA
      areasContent.style.display = "flex";
      areasContent.style.flexDirection = "column";
      areasContent.style.gap = "2rem";
      areasContent.style.textAlign = "center";

      // Restructure the layout
      areasContent.innerHTML = "";

      // 1. Add title
      const titleContainer = document.createElement("div");
      titleContainer.appendChild(title);
      titleContainer.style.order = "1";
      titleContainer.style.textAlign = "center";
      titleContainer.style.marginBottom = "1rem";
      areasContent.appendChild(titleContainer);

      // 2. Add description
      const introContainer = document.createElement("div");
      introContainer.appendChild(intro);
      introContainer.style.order = "2";
      introContainer.style.textAlign = "center";
      introContainer.style.marginBottom = "2rem";
      areasContent.appendChild(introContainer);

      // 3. Add map
      areasVisual.style.order = "3";
      areasVisual.style.marginBottom = "2rem";
      areasContent.appendChild(areasVisual);

      // 4. Add features as cards
      const featuresContainer = document.createElement("div");
      featuresContainer.appendChild(features);
      featuresContainer.style.order = "4";
      featuresContainer.style.textAlign = "center";
      featuresContainer.style.marginBottom = "0.5rem";
      areasContent.appendChild(featuresContainer);

      // 5. Add CTA
      const ctaContainer = document.createElement("div");
      ctaContainer.appendChild(cta);
      ctaContainer.style.order = "5";
      ctaContainer.style.textAlign = "center";
      areasContent.appendChild(ctaContainer);
    } else {
      // Desktop layout: restore original structure
      if (areasContent.children.length === 5) {
        // We have the mobile structure, need to restore desktop
        areasContent.innerHTML = "";

        // Recreate areasText with title, intro, features, and cta
        const newAreasText = document.createElement("div");
        newAreasText.className = "areas-text";
        newAreasText.appendChild(title);
        newAreasText.appendChild(intro);
        newAreasText.appendChild(features);
        newAreasText.appendChild(cta);
        areasContent.appendChild(newAreasText);

        // Add areasVisual back
        areasContent.appendChild(areasVisual);
      }

      // Reset styles
      areasContent.style.display = "";
      areasContent.style.flexDirection = "";
      areasContent.style.gap = "";
      areasContent.style.textAlign = "";

      // Reset individual element styles
      if (title) {
        title.style.order = "";
        title.style.marginBottom = "";
      }
      if (intro) {
        intro.style.order = "";
        intro.style.marginBottom = "";
      }
      areasVisual.style.order = "";
      areasVisual.style.marginBottom = "";
      if (features) {
        features.style.order = "";
        features.style.marginBottom = "";
      }
      if (cta) {
        cta.style.order = "";
      }
    }
  }

  // Run on load
  adjustMobileLayout();
  adjustTeamCredentialsOverlay();
  adjustContactPageLayout();
  adjustWhyChooseUsLayout();
  adjustServiceAreasLayout();

  // Run on resize with debounce
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      adjustMobileLayout();
      adjustTeamCredentialsOverlay();
      adjustContactPageLayout();
      adjustWhyChooseUsLayout();
      adjustServiceAreasLayout();
    }, 250);
  });
});

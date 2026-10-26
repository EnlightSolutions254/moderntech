/* ==========================================================================
   Zanatechnologies — Homepage JavaScript
   No frameworks, no external libraries. Progressive enhancement only —
   every section here degrades gracefully (links still work, forms still
   submit) if JS fails to load.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     1. Announcement bar dismiss (persists for the session)
     ------------------------------------------------------------------ */
  var announcementBar = document.getElementById("announcement-bar");
  var announcementClose = document.getElementById("announcement-close");

  if (announcementBar && announcementClose) {
    if (sessionStorage.getItem("announcementDismissed") === "true") {
      announcementBar.hidden = true;
    }
    announcementClose.addEventListener("click", function () {
      announcementBar.hidden = true;
      try { sessionStorage.setItem("announcementDismissed", "true"); } catch (e) { /* storage unavailable — fail silently */ }
    });
  }

  /* ------------------------------------------------------------------
     2. Mobile search panel toggle
     ------------------------------------------------------------------ */
  var searchToggle = document.getElementById("search-toggle");
  var searchPanel = document.getElementById("search-panel");

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener("click", function () {
      var isOpen = !searchPanel.hidden;
      searchPanel.hidden = isOpen;
      searchToggle.setAttribute("aria-expanded", String(!isOpen));
      if (!isOpen) {
        var input = document.getElementById("site-search-input");
        if (input) input.focus();
      }
    });
  }

  /* ------------------------------------------------------------------
     3. Mobile nav drawer
     ------------------------------------------------------------------ */
  var menuToggle = document.getElementById("menu-toggle");
  var drawer = document.getElementById("mobile-drawer");
  var drawerClose = document.getElementById("mobile-drawer-close");
  var drawerBackdrop = document.getElementById("mobile-drawer-backdrop");

  function openDrawer() {
    drawer.hidden = false;
    document.body.style.overflow = "hidden";
    menuToggle.setAttribute("aria-expanded", "true");
    drawerClose.focus();
  }

  function closeDrawer() {
    drawer.hidden = true;
    document.body.style.overflow = "";
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.focus();
  }

  if (menuToggle && drawer && drawerClose && drawerBackdrop) {
    menuToggle.addEventListener("click", openDrawer);
    drawerClose.addEventListener("click", closeDrawer);
    drawerBackdrop.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !drawer.hidden) closeDrawer();
    });
  }

  /* ------------------------------------------------------------------
     5. Delivery coverage "see full list" expand
     ------------------------------------------------------------------ */
  var coverageExpand = document.getElementById("coverage-expand");
  var coverageList = document.getElementById("coverage-list");

  if (coverageExpand && coverageList) {
    coverageExpand.addEventListener("click", function () {
      var hiddenItems = coverageList.querySelectorAll(".coverage-list__more");
      var isExpanded = coverageExpand.getAttribute("aria-expanded") === "true";

      hiddenItems.forEach(function (item) { item.hidden = isExpanded; });
      coverageExpand.setAttribute("aria-expanded", String(!isExpanded));
      coverageExpand.textContent = isExpanded ? "See full coverage list" : "Show fewer areas";
    });
  }

  /* ------------------------------------------------------------------
     6. Lazy image loading via IntersectionObserver
     Progressive enhancement over the native loading="lazy" attribute —
     also swaps data-src to src and fades the image in once loaded.
     ------------------------------------------------------------------ */
  var lazyImages = document.querySelectorAll("img.lazy-img[data-src]");

  function loadImage(img) {
    img.src = img.getAttribute("data-src");
    img.addEventListener("load", function () { img.classList.add("is-loaded"); }, { once: true });
    img.removeAttribute("data-src");
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadImage(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "200px 0px" });

    lazyImages.forEach(function (img) { observer.observe(img); });
  } else {
    // Fallback for older browsers — load everything immediately.
    lazyImages.forEach(loadImage);
  }

  /* ------------------------------------------------------------------
     7. Footer year
     ------------------------------------------------------------------ */
  var footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------------
     8. WhatsApp CTA click tracking hook
     Wires every WhatsApp CTA for analytics (per blueprint requirement
     to instrument each WhatsAppCTAInline instance individually).
     Replace the console.log with your analytics call (GA4, Meta Pixel, etc).
     ------------------------------------------------------------------ */
  document.querySelectorAll('a[href*="wa.me"]').forEach(function (link) {
    link.addEventListener("click", function () {
      var section = link.closest("section, header, footer, div.sticky-whatsapp");
      var sectionId = section ? (section.id || section.className.split(" ")[0]) : "unknown";
      if (window.dataLayer) {
        window.dataLayer.push({ event: "whatsapp_click", section: sectionId });
      }
    });
  });

  /* ------------------------------------------------------------------
     10. Category page — FilterDrawer (mobile) open/close
     Desktop FilterSidebar uses the same #filter-form, just rendered
     persistently in-page rather than inside the drawer, so all the
     filtering logic below is shared between both.
     ------------------------------------------------------------------ */
  var filterTrigger = document.getElementById("filter-trigger");
  var filterDrawer = document.getElementById("filter-drawer");
  var filterDrawerClose = document.getElementById("filter-drawer-close");
  var filterDrawerBackdrop = document.getElementById("filter-drawer-backdrop");

  function openFilterDrawer() {
    if (!filterDrawer) return;
    filterDrawer.hidden = false;
    document.body.style.overflow = "hidden";
    filterTrigger.setAttribute("aria-expanded", "true");
  }
  function closeFilterDrawer() {
    if (!filterDrawer) return;
    filterDrawer.hidden = true;
    document.body.style.overflow = "";
    filterTrigger.setAttribute("aria-expanded", "false");
    filterTrigger.focus();
  }
  if (filterTrigger && filterDrawer && filterDrawerClose && filterDrawerBackdrop) {
    filterTrigger.addEventListener("click", openFilterDrawer);
    filterDrawerClose.addEventListener("click", closeFilterDrawer);
    filterDrawerBackdrop.addEventListener("click", closeFilterDrawer);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !filterDrawer.hidden) closeFilterDrawer();
    });
  }

  /* ------------------------------------------------------------------
     11. Category page — client-side filtering (Brand + Availability)
     For launch this filters the static cards already in the DOM.
     Once products.json powers the grid, swap the DOM-query approach
     for re-rendering filtered results from the data source instead.
     ------------------------------------------------------------------ */
  var productGrid = document.getElementById("product-grid");
  var emptyState = document.getElementById("product-grid-empty");
  var resultCount = document.getElementById("category-result-count");
  var activeFiltersBar = document.getElementById("active-filters-bar");
  var clearAllBtn = document.getElementById("clear-all-filters");
  var applyButtons = document.querySelectorAll(".js-apply-filters");
  var clearButtons = document.querySelectorAll(".js-clear-filters");
  var priceSliderContainers = document.querySelectorAll("[data-price-slider]");

  function getCheckedBrands() {
    return Array.prototype.slice
      .call(document.querySelectorAll('input[name="brand"]:checked'))
      .map(function (el) { return el.value; });
  }
  function inStockOnly() {
    var mobile = document.getElementById("filter-in-stock");
    var desktop = document.getElementById("filter-in-stock-desktop");
    return !!((mobile && mobile.checked) || (desktop && desktop.checked));
  }

  /* --- Price range slider ---
     Bounds are computed from the actual prices rendered in the grid (so
     this works unmodified for every category, whatever its price spread
     is) rather than being hardcoded. Every product card, including the
     ones still hidden behind "Load More", gets a data-price attribute
     used both for the slider bounds and for filtering later. */
  function initPriceSliders() {
    if (!productGrid || !priceSliderContainers.length) return;

    var prices = [];
    productGrid.querySelectorAll(".product-card").forEach(function (card) {
      var priceEl = card.querySelector(".price");
      var num = priceEl ? parseInt(priceEl.textContent.replace(/[^0-9]/g, ""), 10) : NaN;
      if (!isNaN(num)) {
        card.setAttribute("data-price", String(num));
        prices.push(num);
      }
    });
    if (!prices.length) return;

    var step = 50;
    var boundsMin = Math.floor(Math.min.apply(null, prices) / step) * step;
    var boundsMax = Math.ceil(Math.max.apply(null, prices) / step) * step;
    if (boundsMax <= boundsMin) boundsMax = boundsMin + step;

    priceSliderContainers.forEach(function (container) {
      var minInput = container.querySelector(".js-price-min");
      var maxInput = container.querySelector(".js-price-max");
      if (!minInput || !maxInput) return;
      [minInput, maxInput].forEach(function (input) {
        input.min = boundsMin;
        input.max = boundsMax;
        input.step = step;
      });
      minInput.value = boundsMin;
      maxInput.value = boundsMax;
      updatePriceSliderVisual(container);
    });
  }

  function updatePriceSliderVisual(container) {
    var minInput = container.querySelector(".js-price-min");
    var maxInput = container.querySelector(".js-price-max");
    if (!minInput || !maxInput) return;
    var bar = container.querySelector(".js-price-range-bar");
    var minLabel = container.querySelector(".js-price-min-label");
    var maxLabel = container.querySelector(".js-price-max-label");
    var lo = Number(minInput.min), hi = Number(minInput.max);
    var span = (hi - lo) || 1;
    var minPct = ((Number(minInput.value) - lo) / span) * 100;
    var maxPct = ((Number(maxInput.value) - lo) / span) * 100;

    if (bar) {
      bar.style.left = minPct + "%";
      bar.style.right = (100 - maxPct) + "%";
    }
    if (minLabel) minLabel.textContent = "KES " + Number(minInput.value).toLocaleString();
    if (maxLabel) maxLabel.textContent = "KES " + Number(maxInput.value).toLocaleString();
  }

  // Stop the two handles crossing over each other.
  function clampPriceHandles(changedInput) {
    var container = changedInput.closest("[data-price-slider]");
    if (!container) return;
    var minInput = container.querySelector(".js-price-min");
    var maxInput = container.querySelector(".js-price-max");
    if (!minInput || !maxInput) return;
    if (Number(minInput.value) > Number(maxInput.value)) {
      if (changedInput === minInput) minInput.value = maxInput.value;
      else maxInput.value = minInput.value;
    }
  }

  // Mirror a slider drag from one form (desktop/mobile) onto the other,
  // same pattern as syncFilterInputs() below for brand/stock.
  function syncPriceSliders(sourceContainer) {
    var sourceMin = sourceContainer.querySelector(".js-price-min");
    var sourceMax = sourceContainer.querySelector(".js-price-max");
    if (!sourceMin || !sourceMax) return;
    priceSliderContainers.forEach(function (container) {
      if (container === sourceContainer) return;
      var minInput = container.querySelector(".js-price-min");
      var maxInput = container.querySelector(".js-price-max");
      if (minInput) minInput.value = sourceMin.value;
      if (maxInput) maxInput.value = sourceMax.value;
      updatePriceSliderVisual(container);
    });
  }

  function getSelectedPriceRange() {
    var container = priceSliderContainers[0];
    if (!container) return null;
    var minInput = container.querySelector(".js-price-min");
    var maxInput = container.querySelector(".js-price-max");
    if (!minInput || !maxInput || minInput.value === "") return null;
    return {
      min: Number(minInput.value),
      max: Number(maxInput.value),
      boundsMin: Number(minInput.min),
      boundsMax: Number(minInput.max)
    };
  }

  function isPriceFilterActive() {
    var range = getSelectedPriceRange();
    return !!range && (range.min > range.boundsMin || range.max < range.boundsMax);
  }

  function resetPriceSliders() {
    priceSliderContainers.forEach(function (container) {
      var minInput = container.querySelector(".js-price-min");
      var maxInput = container.querySelector(".js-price-max");
      if (minInput) minInput.value = minInput.min;
      if (maxInput) maxInput.value = maxInput.max;
      updatePriceSliderVisual(container);
    });
  }

  // Keep desktop FilterSidebar and mobile FilterDrawer in sync — both sets
  // of inputs share the same `name`/id pattern so a change in one reflects
  // in the other (e.g. user filters on mobile, then rotates to desktop).
  function syncFilterInputs(changedEl) {
    if (changedEl.name === "brand") {
      document.querySelectorAll('input[name="brand"][value="' + changedEl.value + '"]').forEach(function (el) {
        el.checked = changedEl.checked;
      });
    } else if (changedEl.id === "filter-in-stock" || changedEl.id === "filter-in-stock-desktop") {
      ["filter-in-stock", "filter-in-stock-desktop"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.checked = changedEl.checked;
      });
    }
  }

  function updateFilterTriggerCount() {
    var countEl = document.getElementById("filter-trigger-count");
    if (!countEl) return;
    var count = getCheckedBrands().length + (inStockOnly() ? 1 : 0) + (isPriceFilterActive() ? 1 : 0);
    countEl.textContent = String(count);
    countEl.hidden = count === 0;
  }

  function renderActiveFilterChips() {
    if (!activeFiltersBar) return;
    var brands = getCheckedBrands();
    var chips = [];

    brands.forEach(function (brand) {
      var label = document.querySelector('input[name="brand"][value="' + brand + '"]');
      var text = label ? label.closest(".filter-checklist__item").querySelector("span").textContent : brand;
      chips.push({ type: "brand", value: brand, text: "Brand: " + text });
    });
    if (inStockOnly()) chips.push({ type: "stock", value: "in-stock", text: "In stock only" });
    if (isPriceFilterActive()) {
      var range = getSelectedPriceRange();
      chips.push({
        type: "price",
        value: "price",
        text: "Price: KES " + range.min.toLocaleString() + "–" + range.max.toLocaleString()
      });
    }

    activeFiltersBar.innerHTML = "";
    if (chips.length === 0) {
      activeFiltersBar.hidden = true;
      return;
    }
    activeFiltersBar.hidden = false;

    chips.forEach(function (chip) {
      var el = document.createElement("button");
      el.type = "button";
      el.className = "filter-chip";
      el.setAttribute("data-filter-type", chip.type);
      el.setAttribute("data-filter-value", chip.value);
      el.innerHTML = chip.text + ' <span class="filter-chip__remove" aria-hidden="true">&#10005;</span>';
      el.setAttribute("aria-label", "Remove filter: " + chip.text);
      el.addEventListener("click", function () {
        if (chip.type === "brand") {
          var input = document.querySelector('input[name="brand"][value="' + chip.value + '"]');
          if (input) input.checked = false;
        } else if (chip.type === "stock") {
          var stockInput = document.getElementById("filter-in-stock");
          if (stockInput) stockInput.checked = false;
        } else if (chip.type === "price") {
          resetPriceSliders();
        }
        applyFilters();
      });
      activeFiltersBar.appendChild(el);
    });

    if (clearAllBtn) {
      clearAllBtn.hidden = false;
      activeFiltersBar.appendChild(clearAllBtn);
    }
  }

  // Pagination state lives here (not inside the pagination block below) so
  // applyFilters() can read it — filtering and paging share the same pass
  // over the cards instead of fighting each other for the `hidden` attribute.
  var paginationNav = document.getElementById("category-pagination");
  var paginationCurrentPage = 1;
  var paginationTotalPages = paginationNav
    ? paginationNav.querySelectorAll(".pagination__page").length
    : 1;

  function hasActiveFilters() {
    return getCheckedBrands().length > 0 || inStockOnly() || isPriceFilterActive();
  }

  function applyFilters() {
    if (!productGrid) return;
    var brands = getCheckedBrands();
    var onlyInStock = inStockOnly();
    var priceRange = getSelectedPriceRange();
    var filtersActive = hasActiveFilters();
    var cards = productGrid.querySelectorAll(".product-card");
    var visibleCount = 0;

    cards.forEach(function (card) {
      var cardBrand = card.getAttribute("data-brand");
      var cardStock = card.getAttribute("data-stock");
      var cardPrice = Number(card.getAttribute("data-price"));
      var cardPage = parseInt(card.getAttribute("data-page"), 10) || 1;
      var matchesBrand = brands.length === 0 || brands.indexOf(cardBrand) !== -1;
      var matchesStock = !onlyInStock || cardStock === "in_stock";
      var matchesPrice = !priceRange || (cardPrice >= priceRange.min && cardPrice <= priceRange.max);
      // With no filters active, pagination decides visibility (only the
      // current page's cards show). Once any filter is active, show every
      // match across all pages — paging through filtered results isn't
      // useful for a catalog this size, and pagination hides itself below.
      var matchesPage = filtersActive || cardPage === paginationCurrentPage;
      var visible = matchesBrand && matchesStock && matchesPrice && matchesPage;
      card.hidden = !visible;
      if (visible) visibleCount++;
    });

    if (paginationNav) paginationNav.hidden = filtersActive || paginationTotalPages <= 1;

    if (emptyState) emptyState.hidden = visibleCount !== 0;
    if (resultCount) {
      resultCount.textContent = visibleCount + (visibleCount === 1 ? " part found" : " parts found");
    }

    renderActiveFilterChips();
    updateFilterTriggerCount();
    closeFilterDrawer();
  }

  if (productGrid) {
    initPriceSliders();

    applyButtons.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        applyFilters();
      });
    });
    clearButtons.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelectorAll('input[name="brand"]').forEach(function (el) { el.checked = false; });
        ["filter-in-stock", "filter-in-stock-desktop"].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.checked = false;
        });
        resetPriceSliders();
        applyFilters();
      });
    });
    // Live-apply on desktop persistent sidebar (checkbox change), per component spec
    // ("filters apply live or via explicit Apply" on desktop). Mobile drawer inputs
    // wait for the explicit "Apply Filters" button instead.
    document.querySelectorAll('input[name="brand"], #filter-in-stock, #filter-in-stock-desktop').forEach(function (el) {
      el.addEventListener("change", function () {
        syncFilterInputs(el);
        updateFilterTriggerCount();
        if (window.matchMedia("(min-width: 960px)").matches) applyFilters();
      });
    });
    // Price slider: update the label/highlight live while dragging ("input"),
    // then sync the other form + apply on release ("change") — same
    // live-on-desktop / explicit-Apply-on-mobile split as the checkboxes above.
    document.querySelectorAll(".js-price-min, .js-price-max").forEach(function (el) {
      el.addEventListener("input", function () {
        clampPriceHandles(el);
        updatePriceSliderVisual(el.closest("[data-price-slider]"));
      });
      el.addEventListener("change", function () {
        clampPriceHandles(el);
        var container = el.closest("[data-price-slider]");
        updatePriceSliderVisual(container);
        syncPriceSliders(container);
        updateFilterTriggerCount();
        if (window.matchMedia("(min-width: 960px)").matches) applyFilters();
      });
    });
    renderActiveFilterChips();
  }

  /* ------------------------------------------------------------------
     12. Category page — numbered pagination (10 products per page)
     Replaces the old "Load More" reveal. Page state + the visibility
     pass both live in applyFilters() above so paging and filtering
     never fight over which cards are hidden.
     ------------------------------------------------------------------ */
  if (paginationNav && productGrid) {
    var paginationPrevBtn = document.getElementById("pagination-prev");
    var paginationNextBtn = document.getElementById("pagination-next");
    var paginationPageBtns = paginationNav.querySelectorAll(".pagination__page");

    function goToPage(n) {
      if (n < 1 || n > paginationTotalPages) return;
      paginationCurrentPage = n;
      paginationPageBtns.forEach(function (btn) {
        var isActive = parseInt(btn.getAttribute("data-page"), 10) === paginationCurrentPage;
        btn.classList.toggle("is-active", isActive);
        if (isActive) { btn.setAttribute("aria-current", "page"); } else { btn.removeAttribute("aria-current"); }
      });
      if (paginationPrevBtn) paginationPrevBtn.disabled = paginationCurrentPage === 1;
      if (paginationNextBtn) paginationNextBtn.disabled = paginationCurrentPage === paginationTotalPages;
      applyFilters();
      var gridTop = productGrid.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: gridTop, behavior: "smooth" });
    }

    paginationPageBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        goToPage(parseInt(btn.getAttribute("data-page"), 10));
      });
    });
    if (paginationPrevBtn) paginationPrevBtn.addEventListener("click", function () { goToPage(paginationCurrentPage - 1); });
    if (paginationNextBtn) paginationNextBtn.addEventListener("click", function () { goToPage(paginationCurrentPage + 1); });
  }

  /* ------------------------------------------------------------------
     13. PDP — Gallery (mobile swipe + dots, desktop thumbnails) and
     ImageZoomModal
     ------------------------------------------------------------------ */
  var galleryTrack = document.getElementById("pdp-gallery-track");
  var galleryDots = document.getElementById("pdp-gallery-dots");
  var galleryThumbs = document.getElementById("pdp-gallery-thumbs");
  var mainImage = document.getElementById("pdp-main-image");
  var zoomModal = document.getElementById("image-zoom-modal");
  var zoomModalImg = document.getElementById("image-zoom-img");
  var zoomClose = document.getElementById("image-zoom-close");
  var zoomBackdrop = document.getElementById("image-zoom-backdrop");

  // Build dots to match the number of mobile slides, keep active dot in sync on scroll.
  if (galleryTrack && galleryDots) {
    var slides = galleryTrack.querySelectorAll(".pdp-gallery__slide");
    slides.forEach(function (slide, i) {
      var dot = document.createElement("span");
      dot.className = "pdp-gallery__dot" + (i === 0 ? " is-active" : "");
      galleryDots.appendChild(dot);
    });

    var scrollTicking = false;
    galleryTrack.addEventListener("scroll", function () {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(function () {
        var index = Math.round(galleryTrack.scrollLeft / galleryTrack.clientWidth);
        galleryDots.querySelectorAll(".pdp-gallery__dot").forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
        scrollTicking = false;
      });
    });
  }

  // Desktop thumbnails swap the single main image.
  if (galleryThumbs && mainImage) {
    galleryThumbs.querySelectorAll(".pdp-gallery__thumb").forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var full = thumb.getAttribute("data-full");
        mainImage.setAttribute("data-src", full);
        loadImage(mainImage);
        galleryThumbs.querySelectorAll(".pdp-gallery__thumb").forEach(function (t) {
          t.classList.toggle("is-active", t === thumb);
        });
      });
    });
  }

  // ImageZoomModal — any element with data-full opens the modal on the
  // matching full-size image.
  function openZoomModal(src, alt) {
    if (!zoomModal || !zoomModalImg) return;
    zoomModalImg.src = src;
    zoomModalImg.alt = alt || "";
    zoomModal.hidden = false;
    document.body.style.overflow = "hidden";
    if (zoomClose) zoomClose.focus();
  }
  function closeZoomModal() {
    if (!zoomModal) return;
    zoomModal.hidden = true;
    document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-zoom-trigger]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var img = btn.parentElement ? btn.parentElement.querySelector("img") : null;
      var src = btn.getAttribute("data-full") || (img ? img.getAttribute("data-src") || img.src : "");
      openZoomModal(src, img ? img.alt : "");
    });
  });
  if (zoomClose) zoomClose.addEventListener("click", closeZoomModal);
  if (zoomBackdrop) zoomBackdrop.addEventListener("click", closeZoomModal);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && zoomModal && !zoomModal.hidden) closeZoomModal();
  });

  /* ------------------------------------------------------------------
     14. Motion system — everything below is pure progressive enhancement.
     If JS fails to load, no .reveal-init class is ever applied, so every
     element stays at its normal, fully-visible CSS state. Nothing here
     changes markup that's required for content to work without JS.
     ------------------------------------------------------------------ */
  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- 14a. Header shrink-on-scroll --- */
  var siteHeader = document.querySelector(".site-header");
  if (siteHeader) {
    var lastScrollState = false;
    var onHeaderScroll = function () {
      var scrolled = window.scrollY > 8;
      if (scrolled !== lastScrollState) {
        siteHeader.classList.toggle("is-scrolled", scrolled);
        lastScrollState = scrolled;
      }
    };
    window.addEventListener("scroll", onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  /* --- 14b. Scroll-reveal for repeating components across every page.
     Selectors are chosen to match components already defined in the
     design system (Section 3-4 of component-architecture doc) so this
     works identically on every generated template without edits. --- */
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    var revealGroups = [
      { selector: ".section-heading", scale: false },
      { selector: ".tile-card", scale: true },
      { selector: ".product-card", scale: true },
      { selector: ".brand-tile", scale: true },
      { selector: ".testimonial-card", scale: true },
      { selector: ".trust-item", scale: true },
      { selector: ".value-card", scale: true },
      { selector: ".contact-card", scale: true },
      { selector: ".article-card", scale: true },
      { selector: ".step-item", scale: false },
      { selector: ".faq-item", scale: false },
      { selector: ".stat-item", scale: true },
      { selector: ".technician-cta-sm", scale: false },
      { selector: ".wizard", scale: false }
    ];

    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    revealGroups.forEach(function (group) {
      var items = document.querySelectorAll(group.selector);
      items.forEach(function (el, i) {
        el.classList.add(group.scale ? "reveal-init--scale" : "reveal-init");
        // Stagger siblings within the same visual group (cap the delay so
        // long lists don't leave the last card waiting a full second).
        var delay = Math.min(i % 8, 5) * 70;
        el.style.setProperty("--reveal-delay", delay + "ms");
        revealObserver.observe(el);
      });
    });
  }

  /* --- 14c. Animated count-up for StatGrid numbers (About page) ---
     Reads the existing rendered text (e.g. "1,200+", "98%") and animates
     the numeric portion up from 0, preserving any prefix/suffix text. */
  var statValues = document.querySelectorAll(".stat-item__value");
  if (statValues.length && !prefersReducedMotion && "IntersectionObserver" in window) {
    var animateCount = function (el) {
      var raw = el.textContent.trim();
      var match = raw.match(/[\d,]+(\.\d+)?/);
      if (!match) return; // no numeric portion — leave text as-is
      var target = parseFloat(match[0].replace(/,/g, ""));
      if (isNaN(target)) return;
      var prefix = raw.slice(0, match.index);
      var suffix = raw.slice(match.index + match[0].length);
      var useComma = match[0].indexOf(",") !== -1;
      var duration = 900;
      var start = null;

      el.classList.add("is-counting");
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(target * eased);
        el.textContent = prefix + (useComma ? current.toLocaleString() : current) + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = raw; // land on exact original text/formatting
        }
      }
      window.requestAnimationFrame(step);
    };

    var statObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statValues.forEach(function (el) { statObserver.observe(el); });
  }

  /* --- 14e. Button click ripple (primary + whatsapp variants only,
     matching the shine-sweep hover treatment defined in styles.css) --- */
  if (!prefersReducedMotion) {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".btn--primary, .btn--whatsapp");
      if (!btn) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement("span");
      ripple.className = "btn__ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
      ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
      btn.appendChild(ripple);
      window.setTimeout(function () { ripple.remove(); }, 650);
    });
  }

  /* --- 14f. Smooth-height accordion for FAQ items only.
     Wraps each <details>'s content (everything after <summary>) in a
     synthetic panel at runtime, purely in JS — no template changes —
     so native <details>/<summary> keyboard and no-JS behavior is
     untouched if this fails to run.
     NOTE: footer columns are intentionally excluded — per the design
     system they're a static always-open 4-column layout on desktop and
     open-by-default on mobile (see .footer-col CSS), not a toggleable
     accordion. Forcing them closed here was a bug that hid the footer
     link columns until clicked; footer <details> are left completely
     untouched so they keep their native open="" behavior. --- */
  if (!prefersReducedMotion) {
    document.querySelectorAll(".faq-item").forEach(function (details) {
      if (details.tagName !== "DETAILS") return;
      var summary = details.querySelector("summary");
      if (!summary) return;
      var toWrap = Array.prototype.filter.call(details.childNodes, function (node) {
        return node !== summary && !(node.nodeType === 3 && !node.textContent.trim());
      });
      if (!toWrap.length) return;

      var panel = document.createElement("div");
      panel.className = "js-accordion-panel";
      toWrap.forEach(function (node) { panel.appendChild(node); });
      details.appendChild(panel);

      var setOpenState = function (open) {
        if (open) {
          panel.style.setProperty("--panel-height", panel.scrollHeight + "px");
          panel.classList.add("is-open");
        } else {
          panel.classList.remove("is-open");
        }
      };
      // Start in sync with the details element's current state.
      details.open = false;
      setOpenState(false);

      summary.addEventListener("click", function (e) {
        e.preventDefault();
        var willOpen = !details.open;
        if (willOpen) details.open = true;
        setOpenState(willOpen);
        if (!willOpen) {
          window.setTimeout(function () { details.open = false; }, 320);
        }
      });
    });
  }

})();
/* Broken-image fallback: any product image that fails to load shows a neutral "photo coming soon" tile. */
(function () {
  var FALLBACK = "/assets/images/products/placeholder-battery.jpg";
  document.addEventListener("error", function (e) {
    var img = e.target;
    if (!img || img.tagName !== "IMG" || img.dataset.fallbackDone) return;
    if (img.src.indexOf("data:") === 0) return;
    img.dataset.fallbackDone = "1";
    img.removeAttribute("srcset");
    img.src = FALLBACK;
  }, true);
})();

/* ==========================================================================
   [Store Name] — Homepage JavaScript
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
     4. Find My Part Wizard — dependent selects
     Data below is a placeholder map. Replace with real data pulled
     from products.json at build/render time (see Section 5 note).
     ------------------------------------------------------------------ */
  var modelsByBrand = {
    hp: ["EliteBook 840 G3", "EliteBook 840 G4", "ProBook 450 G5", "Pavilion 15"],
    dell: ["Latitude 5490", "Latitude 7480", "Inspiron 15 3000", "XPS 13"],
    lenovo: ["ThinkPad T480", "ThinkPad X1 Carbon", "IdeaPad 3"],
    acer: ["Aspire 5", "Swift 3"],
    toshiba: ["Satellite C55", "Tecra A50"],
    asus: ["VivoBook 15", "ZenBook 14"],
    macbook: ["MacBook Air 2017", "MacBook Pro 2019 13\"", "MacBook Pro 2019 15\""]
  };

  var brandSelect = document.getElementById("wizard-brand");
  var modelSelect = document.getElementById("wizard-model");
  var partSelect = document.getElementById("wizard-part");
  var wizardForm = document.getElementById("find-my-part-form");

  function populateModels(brandKey) {
    modelSelect.innerHTML = "";
    var models = modelsByBrand[brandKey] || [];

    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = models.length ? "Select model" : "No models found";
    modelSelect.appendChild(placeholder);

    models.forEach(function (model) {
      var opt = document.createElement("option");
      opt.value = model.toLowerCase().replace(/\s+/g, "-");
      opt.textContent = model;
      modelSelect.appendChild(opt);
    });

    modelSelect.disabled = models.length === 0;
  }

  if (brandSelect && modelSelect && partSelect && wizardForm) {
    brandSelect.addEventListener("change", function () {
      populateModels(brandSelect.value);
      partSelect.disabled = true;
      partSelect.selectedIndex = 0;
    });

    modelSelect.addEventListener("change", function () {
      partSelect.disabled = !modelSelect.value;
    });

    wizardForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var brand = brandSelect.value;
      var model = modelSelect.value;
      var part = partSelect.value;
      if (!brand || !model || !part) return;

      // In production this routes to the filtered category/brand URL, e.g.:
      // /shop/{part}/?brand={brand}&model={model}
      var destination = "/shop/" + encodeURIComponent(part) + "/?brand=" + encodeURIComponent(brand) + "&model=" + encodeURIComponent(model);
      window.location.href = destination;
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
     9. Product card renderer (for future product data integration)
     Not invoked on page load — the static markup in index.html serves
     as the launch content. Once products.json is wired in, call
     renderProductCard(product) for each item and append to the
     #featured-products list, replacing the placeholder <li> elements.
     ------------------------------------------------------------------ */
  function renderProductCard(product) {
    var li = document.createElement("li");
    li.className = "product-card";
    li.innerHTML =
      '<a href="' + product.url + '" class="product-card__media-link">' +
        '<div class="media-frame media-frame--square">' +
          '<span class="badge badge--' + product.stock_status + '">' + product.stock_label + '</span>' +
          '<img class="lazy-img" data-src="' + product.image + '" alt="' + product.name + '" width="400" height="400" loading="lazy" decoding="async">' +
        '</div>' +
      '</a>' +
      '<div class="product-card__body">' +
        '<h3 class="product-card__name"><a href="' + product.url + '">' + product.name + '</a></h3>' +
        '<p class="price price--sm">KES ' + product.price.toLocaleString() + '</p>' +
        '<a class="btn btn--whatsapp btn--sm btn--full" href="' + product.whatsapp_url + '" target="_blank" rel="noopener">Order on WhatsApp</a>' +
      '</div>';
    return li;
  }

  // Exposed for use once real product data is wired in.
  window.__store = window.__store || {};
  window.__store.renderProductCard = renderProductCard;

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
    var count = getCheckedBrands().length + (inStockOnly() ? 1 : 0);
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

  function applyFilters() {
    if (!productGrid) return;
    var brands = getCheckedBrands();
    var onlyInStock = inStockOnly();
    var cards = productGrid.querySelectorAll(".product-card");
    var visibleCount = 0;

    cards.forEach(function (card) {
      var cardBrand = card.getAttribute("data-brand");
      var cardStock = card.getAttribute("data-stock");
      var matchesBrand = brands.length === 0 || brands.indexOf(cardBrand) !== -1;
      var matchesStock = !onlyInStock || cardStock === "in_stock";
      var visible = matchesBrand && matchesStock;
      card.hidden = !visible;
      if (visible) visibleCount++;
    });

    if (emptyState) emptyState.hidden = visibleCount !== 0;
    if (resultCount) {
      resultCount.textContent = visibleCount + (visibleCount === 1 ? " part found" : " parts found");
    }

    renderActiveFilterChips();
    updateFilterTriggerCount();
    closeFilterDrawer();
  }

  if (productGrid) {
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
    renderActiveFilterChips();
  }

  /* ------------------------------------------------------------------
     12. Category page — "Load More" (client-side reveal of extra cards)
     ------------------------------------------------------------------ */
  var loadMoreBtn = document.getElementById("load-more");
  if (loadMoreBtn && productGrid) {
    loadMoreBtn.addEventListener("click", function () {
      var hiddenExtra = productGrid.querySelectorAll(".product-card.is-extra[hidden]");
      var batch = Array.prototype.slice.call(hiddenExtra, 0, 8);
      batch.forEach(function (card) { card.hidden = false; });
      if (productGrid.querySelectorAll(".product-card.is-extra[hidden]").length === 0) {
        loadMoreBtn.hidden = true;
      }
    });
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

})();

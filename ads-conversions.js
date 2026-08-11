/**
 * Google Ads conversion event wiring for Oraimo Shop Mfangano.
 *
 * The base Google tag (AW-17818728557) is already installed in <head> on every
 * page and sends page-view/remarketing data to Google Ads automatically.
 *
 * This file only handles CONVERSION EVENTS (the actual "someone took a
 * valuable action" signal). Each event below needs a Conversion Label from
 * Google Ads (Tools & Settings > Conversions > [your conversion action] >
 * "Google tag" > look for the string after the slash in
 * "send_to: 'AW-17818728557/XXXXXXXXXXXX'").
 *
 * Until a label is filled in below, that event simply does nothing — it will
 * NOT send a broken or malformed hit to Google Ads. This makes it safe to
 * ship now and finish later by editing only this file.
 *
 * HOW TO FINISH SETUP:
 * 1. In Google Ads, create a "Website" conversion action (e.g. "WhatsApp Order
 *    Sent", "Contact Form Submitted", "Phone Number Clicked").
 * 2. Copy the conversion label Google Ads gives you for each action.
 * 3. Paste it into the matching field in CONVERSION_LABELS below.
 * 4. Save/deploy. No other file needs to change.
 */
(function () {
  "use strict";

  var ADS_ID = "AW-17818728557";

  // ---- FILL THESE IN (see instructions above) ----
  var CONVERSION_LABELS = {
    // Fires when a customer taps "Send Order via WhatsApp" in the cart drawer
    // (the site's main purchase/order action).
    whatsappOrder: null, // e.g. "AbCdEfGhIjKlMnOp"

    // Fires when the contact form on contact.html is submitted.
    contactForm: null,

    // Fires when a visitor taps a tel: (phone call) link.
    phoneCall: null,

    // Fires when a visitor taps any other WhatsApp link (floating button,
    // header icon, footer link, mobile nav link, shop quick-action button).
    // Optional — leave null if you only want the order/contact/call events.
    whatsappGeneral: null
  };
  // --------------------------------------------------

  function fireConversion(label, extraParams) {
    if (!label) return; // not configured yet — do nothing, send nothing
    if (typeof window.gtag !== "function") return;
    var params = { send_to: ADS_ID + "/" + label };
    if (extraParams) {
      for (var k in extraParams) { params[k] = extraParams[k]; }
    }
    window.gtag("event", "conversion", params);
  }

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    // 1) WhatsApp order checkout button (present on every page via the cart drawer)
    var checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", function () {
        fireConversion(CONVERSION_LABELS.whatsappOrder);
      });
    }

    // 2) Contact form (contact.html)
    var contactForm = document.getElementById("contact-form");
    if (contactForm) {
      contactForm.addEventListener("submit", function () {
        fireConversion(CONVERSION_LABELS.contactForm);
      });
    }

    // 3) Phone call links (tel:)
    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener("click", function () {
        fireConversion(CONVERSION_LABELS.phoneCall);
      });
    });

    // 4) General WhatsApp links (float button, header icon, footer, mobile nav,
    //    shop quick-action) — excludes the checkout button, which is tracked
    //    separately above as the primary order conversion.
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (a) {
      if (a.id === "checkout-btn") return;
      a.addEventListener("click", function () {
        fireConversion(CONVERSION_LABELS.whatsappGeneral);
      });
    });
  });
})();

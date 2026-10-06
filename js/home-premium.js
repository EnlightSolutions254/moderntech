/* home-premium.js — scroll reveal for the homepage. Safe without JS or IntersectionObserver. */
(function () {
  var secs = document.querySelectorAll("main > section:not(.hero):not(.zx-cats)");
  if (!secs.length || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("zx-js");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
  secs.forEach(function (s) { s.classList.add("zx-reveal"); io.observe(s); });
})();

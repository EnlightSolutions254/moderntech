/* search.js — site-wide instant search over /search-index.json (built by generate.js).
   No match -> offers WhatsApp so the lead is never lost. */
(function () {
  var forms = document.querySelectorAll("form.zx-search");
  if (!forms.length) return;
  var index = null, loading = null;

  function load() {
    if (index) return Promise.resolve(index);
    if (!loading) loading = fetch("/search-index.json").then(function (r) { return r.json(); })
      .then(function (d) { index = d; return d; }).catch(function () { index = []; return index; });
    return loading;
  }
  function score(it, toks, cat) {
    if (cat && it.cs !== cat) return 0;
    var name = it.n.toLowerCase(), hay = (it.n + " " + it.k + " " + it.c + " " + it.b).toLowerCase(), s = 0;
    for (var i = 0; i < toks.length; i++) {
      if (hay.indexOf(toks[i]) < 0) return 0;
      s += name.indexOf(toks[i]) === 0 ? 3 : name.indexOf(toks[i]) > -1 ? 2 : 1;
    }
    return s;
  }

  Array.prototype.forEach.call(forms, function (form) {
    var input = form.querySelector(".zx-search__input");
    var list = form.querySelector(".zx-search__results");
    var catSel = form.querySelector(".zx-search__cat");
    var wa = form.getAttribute("data-wa");
    var shown = [], active = -1;

    function waLink(q) { return "https://wa.me/" + wa + "?text=" + encodeURIComponent("Hi, do you have: " + q + "?"); }
    function close() { list.hidden = true; active = -1; }
    function mark() {
      Array.prototype.forEach.call(list.children, function (li, i) { li.setAttribute("aria-selected", i === active ? "true" : "false"); });
    }
    function render(q) {
      list.innerHTML = "";
      shown.forEach(function (it) {
        var li = document.createElement("li"), a = document.createElement("a");
        li.setAttribute("role", "option"); a.href = it.u;
        var left = document.createElement("span"), nm = document.createElement("span"), meta = document.createElement("span");
        nm.className = "zx-search__name"; nm.textContent = it.n;
        meta.className = "zx-search__meta"; meta.textContent = it.c;
        left.appendChild(nm); left.appendChild(meta); a.appendChild(left);
        if (it.p) { var p = document.createElement("span"); p.className = "zx-search__price"; p.textContent = it.p; a.appendChild(p); }
        li.appendChild(a); list.appendChild(li);
      });
      if (!shown.length) {
        var li2 = document.createElement("li"), a2 = document.createElement("a");
        li2.className = "zx-search__none"; a2.href = waLink(q); a2.target = "_blank"; a2.rel = "noopener";
        a2.textContent = "No match for \u201C" + q + "\u201D \u2014 ask us on WhatsApp";
        li2.appendChild(a2); list.appendChild(li2);
      }
      list.hidden = false; active = -1;
    }
    function run() {
      var q = input.value.trim();
      if (q.length < 2) { close(); return; }
      var toks = q.toLowerCase().split(/\s+/), cat = catSel ? catSel.value : "";
      load().then(function (data) {
        shown = data.map(function (it) { return { it: it, s: score(it, toks, cat) }; })
          .filter(function (x) { return x.s > 0; })
          .sort(function (a, b) { return b.s - a.s; }).slice(0, 6).map(function (x) { return x.it; });
        render(q);
      });
    }

    input.addEventListener("focus", load);
    input.addEventListener("input", run);
    if (catSel) catSel.addEventListener("change", run);
    input.addEventListener("keydown", function (e) {
      var n = list.children.length;
      if (e.key === "ArrowDown" && n) { e.preventDefault(); active = (active + 1) % n; mark(); }
      else if (e.key === "ArrowUp" && n) { e.preventDefault(); active = (active - 1 + n) % n; mark(); }
      else if (e.key === "Escape") { close(); }
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim(); if (!q) return;
      var target = active > -1 ? shown[active] : shown[0];
      if (target) window.location.href = target.u;
      else window.open(waLink(q), "_blank", "noopener");
    });
    document.addEventListener("click", function (e) { if (!form.contains(e.target)) close(); });
  });
})();

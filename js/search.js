/* search.js — site-wide instant search over /search-index.json (built by generate.js).
   No match -> offers WhatsApp so the lead is never lost. */
(function () {
  /* ---------- matching core (pure functions, also unit-tested in Node) ---------- */
  var STOP = { "for": 1, "the": 1, "and": 1, "of": 1, "with": 1, "to": 1, "a": 1, "an": 1, "in": 1, "my": 1,
               laptop: 1, laptops: 1, part: 1, parts: 1, replacement: 1, "new": 1 };
  var SYN = { lcd: ["screen"], display: ["screen"], panel: ["screen"], adaptor: ["adapter"],
              ram: ["ddr", "sodimm"], memory: ["ram", "ddr", "sodimm"], ups: ["battery backup"] };

  function norm(s) { return String(s || "").toLowerCase(); }
  function compact(s) { return norm(s).replace(/[^a-z0-9]/g, ""); }

  // "battery for hp 840 g3" -> ["battery","hp","840","g3"]; falls back to all words if only filler was typed
  function tokens(q) {
    var all = norm(q).split(/[\s,]+/).filter(Boolean);
    var keep = all.filter(function (t) { return !STOP[t]; });
    return keep.length ? keep : all;
  }
  // a typed word also matches its singular form and a few synonyms ("batteries" -> "battery", "lcd" -> "screen")
  function variants(t) {
    var v = [t];
    if (t.length > 4 && /ies$/.test(t)) v.push(t.slice(0, -3) + "y");
    else if (t.length > 3 && /s$/.test(t)) v.push(t.slice(0, -1));
    if (SYN[t]) v = v.concat(SYN[t]);
    return v;
  }
  function prep(it) {
    if (it._h) return it;
    it._n = norm(it.n);
    it._h = norm([it.n, it.k, it.c, it.b].join(" "));
    it._c = compact(it._h);
    return it;
  }
  // true if v appears at the start of a word (so "ram" matches "RAM" but not "fRAMe")
  function wordStart(str, v) {
    var i = str.indexOf(v);
    while (i > -1) {
      if (i === 0 || !/[a-z0-9]/.test(str.charAt(i - 1))) return true;
      i = str.indexOf(v, i + 1);
    }
    return false;
  }
  function score(it, toks, cat, qCompact) {
    if (cat && it.cs !== cat) return 0;
    prep(it);
    var total = 0;
    for (var i = 0; i < toks.length; i++) {
      var vs = variants(toks[i]), best = 0;
      for (var j = 0; j < vs.length; j++) {
        var v = vs[j], s = 0, short = v.length <= 3;
        if (it._n.indexOf(v) === 0) s = 3;
        else if (it._n.indexOf(" " + v) > -1) s = 2.5;
        else if (wordStart(it._n, v) || (!short && it._n.indexOf(v) > -1)) s = 2;
        else if (short ? wordStart(it._h, v) : it._h.indexOf(v) > -1) s = 1;
        else if (compact(v).length >= 4 && it._c.indexOf(compact(v)) > -1) s = 0.8;   // "840g3" vs "840 G3"
        if (s > best) best = s;
      }
      if (!best) return 0;               // every typed word must match something
      total += best;
    }
    if (qCompact && qCompact.length >= 3 && compact(it.n).indexOf(qCompact) > -1) total += 1;
    if ((it.c === "Category" || it.c === "Brand") && toks.length === 1) total += 1;   // "batteries" -> the category first
    return total;
  }
  function search(data, q, cat, limit) {
    var toks = tokens(q), qc = compact(q);
    return data.map(function (it) { return { it: it, s: score(it, toks, cat, qc) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s || a.it.n.length - b.it.n.length; })
      .slice(0, limit || 8).map(function (x) { return x.it; });
  }
  function money(p) { return /^\d/.test(p) ? "KES " + p : p; }

  if (typeof module !== "undefined" && module.exports) { module.exports = { search: search, tokens: tokens, score: score }; }
  if (typeof document === "undefined") return;

  /* ---------- UI ---------- */
  var forms = document.querySelectorAll("form.zx-search");
  if (!forms.length) return;
  var index = null, loading = null;

  function load() {
    if (index) return Promise.resolve(index);
    if (!loading) loading = fetch("/search-index.json").then(function (r) { return r.json(); })
      .then(function (d) { index = d; return d; }).catch(function () { index = []; return index; });
    return loading;
  }

  Array.prototype.forEach.call(forms, function (form) {
    var input = form.querySelector(".zx-search__input");
    var list = form.querySelector(".zx-search__results");
    var catSel = form.querySelector(".zx-search__cat");
    var wa = form.getAttribute("data-wa");
    var shown = [], active = -1, seq = 0;

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
        if (it.p) { var p = document.createElement("span"); p.className = "zx-search__price"; p.textContent = money(it.p); a.appendChild(p); }
        li.appendChild(a); list.appendChild(li);
      });
      if (!shown.length) {
        var li2 = document.createElement("li"), a2 = document.createElement("a");
        li2.className = "zx-search__none"; a2.href = waLink(q); a2.target = "_blank"; a2.rel = "noopener";
        a2.textContent = "No match for “" + q + "” — ask us on WhatsApp";
        li2.appendChild(a2); list.appendChild(li2);
      }
      list.hidden = false; active = -1;
    }
    // runs the search and resolves with the results (ignores answers that arrive after newer typing)
    function run() {
      var q = input.value.trim(), mine = ++seq;
      if (q.length < 2) { close(); shown = []; return Promise.resolve(null); }
      return load().then(function (data) {
        if (mine !== seq) return null;
        shown = search(data, q, catSel ? catSel.value : "", 8);
        render(q);
        return shown;
      });
    }

    input.addEventListener("focus", load);
    input.addEventListener("input", run);
    if (catSel) catSel.addEventListener("change", run);
    input.addEventListener("keydown", function (e) {
      var n = list.hidden ? 0 : list.children.length;
      if (e.key === "ArrowDown" && n) { e.preventDefault(); active = (active + 1) % n; mark(); }
      else if (e.key === "ArrowUp" && n) { e.preventDefault(); active = (active - 1 + n) % n; mark(); }
      else if (e.key === "Escape") { close(); }
    });
    // Enter / search button: open the highlighted result, or the only match; with several matches keep
    // the list open so the shopper chooses (instead of jumping to a guess); with none, offer WhatsApp.
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim(); if (!q) return;
      if (active > -1 && shown[active]) { window.location.href = shown[active].u; return; }
      run().then(function (res) {
        if (res === null) return;
        if (res.length === 1) window.location.href = res[0].u;
        else if (!res.length) window.open(waLink(q), "_blank", "noopener");
      });
    });
    document.addEventListener("click", function (e) { if (!form.contains(e.target)) close(); });
  });
})();

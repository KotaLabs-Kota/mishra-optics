/* ==================================================================
   MISHRA OPTICS — frontend interactions
   Vanilla JS · localStorage only · no backend, no database
================================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const money = (n) => "₹" + Number(n).toLocaleString("en-IN");
  const icon = (name, cls = "") =>
    `<svg class="icon ${cls}" aria-hidden="true"><use href="assets/icons.svg#i-${name}"></use></svg>`;
  const esc = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
    }
  };

  let cart = store.get("mo_cart", []);
  let wishlist = store.get("mo_wish", []);
  if (!Array.isArray(cart)) cart = [];
  if (!Array.isArray(wishlist)) wishlist = [];

  const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
  const lensExtra = (lensId) => (LENS_OPTIONS.find((l) => l.id === lensId) || LENS_OPTIONS[0]).extra;
  const linePrice = (item) => (getProduct(item.id)?.price || 0) + lensExtra(item.lens);
  const cartCount = () => cart.reduce((n, i) => n + i.qty, 0);
  const cartSubtotal = () => cart.reduce((sum, i) => sum + linePrice(i) * i.qty, 0);
  const FREE_SHIP = 1999;

  /* ---------------- global shell (drawers, search, toast) ---------------- */
  function mountShell() {
    if ($("#siteOverlay")) return;
    const shell = document.createElement("div");
    shell.innerHTML = `
      <div class="overlay" id="siteOverlay" data-close-all></div>

      <aside class="drawer" id="cartDrawer" aria-label="Shopping bag" aria-hidden="true">
        <div class="drawer__head">
          <h2>Your bag <span class="muted" id="cartDrawerCount" style="font-family:var(--sans);font-size:.8rem"></span></h2>
          <button class="icon-btn" data-close-all aria-label="Close bag">${icon("close")}</button>
        </div>
        <div class="drawer__body" id="cartBody"></div>
        <div class="drawer__foot" id="cartFoot"></div>
      </aside>

      <aside class="drawer" id="wishDrawer" aria-label="Saved frames" aria-hidden="true">
        <div class="drawer__head">
          <h2>Saved frames</h2>
          <button class="icon-btn" data-close-all aria-label="Close saved frames">${icon("close")}</button>
        </div>
        <div class="drawer__body" id="wishBody"></div>
      </aside>

      <aside class="drawer drawer--left" id="menuDrawer" aria-label="Menu" aria-hidden="true">
        <div class="drawer__head">
          <h2>Menu</h2>
          <button class="icon-btn" data-close-all aria-label="Close menu">${icon("close")}</button>
        </div>
        <div class="drawer__body">
          <ul class="mobile-nav">
            <li><a href="shop.html">Shop all frames ${icon("arrow-up-right")}</a></li>
            <li>
              <button type="button" aria-expanded="false" aria-controls="mobileShopSub">Shop by category ${icon("chevron-down")}</button>
              <div class="mobile-sub" id="mobileShopSub">
                <a href="shop.html?category=eyeglasses">Eyeglasses</a>
                <a href="shop.html?category=sunglasses">Sunglasses</a>
                <a href="shop.html?shape=Round">Round frames</a>
                <a href="shop.html?shape=Square">Square frames</a>
              </div>
            </li>
            <li><a href="about.html">Our story ${icon("arrow-up-right")}</a></li>
            <li><a href="contact.html">Contact & stores ${icon("arrow-up-right")}</a></li>
          </ul>
        </div>
        <div class="drawer__foot drawer__foot--menu">
          <a href="mailto:care@mishraoptics.in">${icon("mail")} care@mishraoptics.in</a>
          <a href="https://wa.me/919828534548?text=Hi%20Mishra%20Optics%2C%20I%27d%20like%20some%20help." target="_blank" rel="noopener">${icon("whatsapp")} WhatsApp us</a>
          <a href="tel:+919828534548">${icon("phone")} +91 98285 34548</a>
          <p style="font-size:.7rem;color:var(--muted);margin-top:.4rem">Kota · Jaipur · Pan-India delivery</p>
        </div>
      </aside>

      <div class="search-panel" id="searchPanel" aria-label="Search" aria-hidden="true">
        <div class="container search-panel__inner">
          <div class="search-panel__top">
            <h2>Search the collection</h2>
            <button class="icon-btn" data-close-all aria-label="Close search">${icon("close")}</button>
          </div>
          <div class="search-field">
            ${icon("search")}
            <input type="search" id="searchInput" placeholder="Try “round”, “aviator” or “tortoise”" autocomplete="off" aria-label="Search frames">
          </div>
          <div class="search-hints">
            <span>Popular</span>
            <button class="chip" data-search-chip="round">Round</button>
            <button class="chip" data-search-chip="aviator">Aviator</button>
            <button class="chip" data-search-chip="tortoise">Tortoise</button>
            <button class="chip" data-search-chip="sunglasses">Sunglasses</button>
          </div>
          <div class="search-results" id="searchResults"></div>
          <p class="search-empty" id="searchEmpty" hidden>No frames match that search. Try a shape, colour or category.</p>
        </div>
      </div>

      <div class="toast" id="toast" role="status" aria-live="polite">${icon("check")}<span id="toastText"></span></div>
    `;
    document.body.appendChild(shell);
  }

  /* ---------------- toast ---------------- */
  let toastTimer;
  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    $("#toastText").textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 3200);
  }

  /* ---------------- overlays ---------------- */
  function closeAll() {
    $$(".drawer.is-open, .search-panel.is-open").forEach((el) => {
      el.classList.remove("is-open");
      el.setAttribute("aria-hidden", "true");
    });
    $("#siteOverlay")?.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
  }
  function openPanel(selector) {
    closeAll();
    const el = $(selector);
    if (!el) return;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    $("#siteOverlay")?.classList.add("is-open");
    document.body.classList.add("no-scroll");
    if (selector === "#searchPanel") setTimeout(() => $("#searchInput")?.focus(), 220);
  }

  /* ---------------- product cards ---------------- */
  function badgeClass(badge) {
    if (!badge) return "";
    const b = badge.toLowerCase();
    if (b === "sale") return " product-card__badge--sale";
    if (b === "new") return " product-card__badge--new";
    return "";
  }
  function productCard(p, index = 0) {
    const saved = wishlist.includes(p.id);
    return `
      <article class="product-card reveal" style="--d:${Math.min(index * 55, 280)}ms">
        <div class="product-card__media">
          ${p.badge ? `<span class="product-card__badge${badgeClass(p.badge)}">${esc(p.badge)}</span>` : ""}
          <button class="wish-btn${saved ? " is-active" : ""}" data-wish="${p.id}" aria-label="${saved ? "Remove" : "Save"} ${esc(p.name)}" aria-pressed="${saved}">${icon("heart")}</button>
          <a href="product.html?id=${p.id}" aria-label="View ${esc(p.name)}">
            <img src="${p.image}" alt="${esc(p.name)} — ${esc(p.shape)} ${esc(p.category)}" loading="lazy" width="600" height="720">
          </a>
          <button class="quick-add" data-quick-add="${p.id}">${icon("plus")} Quick add</button>
        </div>
        <div class="product-card__body">
          <div class="product-card__row">
            <a class="product-card__name" href="product.html?id=${p.id}">${esc(p.name)}</a>
            <span class="product-card__price">${money(p.price)}${p.compareAt ? `<s>${money(p.compareAt)}</s>` : ""}</span>
          </div>
          <div class="product-card__meta">
            <span>${esc(p.shape)} · ${esc(p.category)}</span>
            <span class="product-card__rating">${icon("star")} ${p.rating.toFixed(1)}</span>
          </div>
          <div class="product-card__meta" style="margin-top:.45rem">
            <span class="swatches">${p.colors.map((c) => `<i class="swatch" style="background:${c.hex}" title="${esc(c.name)}"></i>`).join("")}</span>
            <span>${p.colors.length} colours</span>
          </div>
        </div>
      </article>`;
  }

  function renderHomeProducts() {
    const el = $("#homeProducts");
    if (!el) return;
    const featured = ["aravalli", "udaipur", "jaipur", "meera"].map(getProduct).filter(Boolean);
    el.innerHTML = featured.map(productCard).join("");
    observeReveals();
  }

  /* ---------------- wishlist ---------------- */
  function toggleWish(id) {
    const p = getProduct(id);
    if (!p) return;
    const i = wishlist.indexOf(id);
    if (i > -1) {
      wishlist.splice(i, 1);
      toast(`${p.name} removed from saved frames`);
    } else {
      wishlist.push(id);
      toast(`${p.name} saved for later`);
    }
    store.set("mo_wish", wishlist);
    syncWishButtons();
    renderWishlist();
    updateCounts();
  }
  function syncWishButtons() {
    $$("[data-wish]").forEach((btn) => {
      const active = wishlist.includes(btn.dataset.wish);
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
      const p = getProduct(btn.dataset.wish);
      if (p) btn.setAttribute("aria-label", `${active ? "Remove" : "Save"} ${p.name}`);
    });
  }
  function renderWishlist() {
    const body = $("#wishBody");
    if (!body) return;
    if (!wishlist.length) {
      body.innerHTML = `
        <div class="wish-empty">
          <div class="empty-icon">${icon("heart")}</div>
          <h3>Nothing saved yet</h3>
          <p>Tap the heart on any frame to keep it here while you decide.</p>
          <a href="shop.html" class="btn btn-primary btn-sm" style="margin-top:1.2rem" data-close-all>Explore frames</a>
        </div>`;
      return;
    }
    body.innerHTML = wishlist.map((id) => {
      const p = getProduct(id);
      if (!p) return "";
      return `
        <div class="cart-item">
          <img class="cart-item__img" src="${p.image}" alt="${esc(p.name)}" loading="lazy">
          <div>
            <a class="cart-item__name" href="product.html?id=${p.id}" data-close-all>${esc(p.name)}</a>
            <div class="cart-item__variant">${esc(p.shape)} · ${esc(p.material)}</div>
            <div class="cart-item__price">${money(p.price)}</div>
            <div class="cart-item__controls">
              <button class="btn btn-outline btn-sm" data-wish-add="${p.id}">Add to bag</button>
            </div>
          </div>
          <button class="cart-item__remove" data-wish-remove="${p.id}" aria-label="Remove ${esc(p.name)}">${icon("trash")}</button>
        </div>`;
    }).join("");
  }

  /* ---------------- cart ---------------- */
  function addToCart(id, options = {}) {
    const p = getProduct(id);
    if (!p) return;
    const item = {
      id,
      color: options.color || p.colors[0].name,
      size: options.size || p.size.split("·")[0].trim(),
      lens: options.lens || "single",
      qty: Math.max(1, Number(options.qty) || 1)
    };
    const key = [item.id, item.color, item.size, item.lens].join("|");
    const existing = cart.find((c) => [c.id, c.color, c.size, c.lens].join("|") === key);
    if (existing) existing.qty += item.qty;
    else cart.push(item);
    store.set("mo_cart", cart);
    renderCart();
    updateCounts();
  }
  function updateQty(key, delta) {
    const item = cart.find((c) => [c.id, c.color, c.size, c.lens].join("|") === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter((c) => c !== item);
    store.set("mo_cart", cart);
    renderCart();
    updateCounts();
  }
  function removeLine(key) {
    cart = cart.filter((c) => [c.id, c.color, c.size, c.lens].join("|") !== key);
    store.set("mo_cart", cart);
    renderCart();
    updateCounts();
  }
  function renderCart() {
    const body = $("#cartBody");
    const foot = $("#cartFoot");
    if (!body || !foot) return;
    const count = cartCount();
    const subtotal = cartSubtotal();
    const shipping = subtotal === 0 || subtotal >= FREE_SHIP ? 0 : 149;
    const remaining = Math.max(0, FREE_SHIP - subtotal);
    const progress = Math.min(100, (subtotal / FREE_SHIP) * 100);

    if (!cart.length) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="empty-icon">${icon("bag")}</div>
          <h3>Your bag is empty</h3>
          <p>Good frames are waiting. Start with the bestsellers.</p>
          <a href="shop.html" class="btn btn-primary btn-sm" style="margin-top:1.2rem" data-close-all>Shop all frames</a>
        </div>`;
      foot.innerHTML = "";
      const dc = $("#cartDrawerCount");
      if (dc) dc.textContent = "";
      return;
    }

    body.innerHTML = `
      <div class="ship-meter">
        <p>${remaining > 0 ? `You're <strong>${money(remaining)}</strong> away from complimentary shipping` : `<strong>Complimentary shipping unlocked</strong> — nice choice.`}</p>
        <div class="ship-meter__track"><div class="ship-meter__fill" style="width:${progress}%"></div></div>
      </div>
      ${cart.map((item) => {
        const p = getProduct(item.id);
        if (!p) return "";
        const key = [item.id, item.color, item.size, item.lens].join("|");
        const lens = LENS_OPTIONS.find((l) => l.id === item.lens) || LENS_OPTIONS[0];
        return `
          <div class="cart-item">
            <img class="cart-item__img" src="${p.image}" alt="${esc(p.name)}" loading="lazy">
            <div>
              <a class="cart-item__name" href="product.html?id=${p.id}" data-close-all>${esc(p.name)}</a>
              <div class="cart-item__variant">${esc(item.color)} · ${esc(item.size)} · ${esc(lens.label)}</div>
              <div class="cart-item__price">${money(linePrice(item))}</div>
              <div class="cart-item__controls">
                <div class="qty">
                  <button data-cart-minus="${key}" aria-label="Decrease quantity">${icon("minus")}</button>
                  <span>${item.qty}</span>
                  <button data-cart-plus="${key}" aria-label="Increase quantity">${icon("plus")}</button>
                </div>
              </div>
            </div>
            <button class="cart-item__remove" data-cart-remove="${key}" aria-label="Remove ${esc(p.name)}">${icon("trash")}</button>
          </div>`;
      }).join("")}
    `;
    foot.innerHTML = `
      <div class="cart-row"><span>Subtotal · ${count} item${count > 1 ? "s" : ""}</span><strong>${money(subtotal)}</strong></div>
      <div class="cart-row"><span>Shipping</span><strong>${shipping === 0 ? "Complimentary" : money(shipping)}</strong></div>
      <div class="cart-row cart-row--total"><span>Total</span><strong>${money(subtotal + shipping)}</strong></div>
      <button class="btn btn-primary btn-block cart-checkout" data-checkout>Checkout securely ${icon("arrow-right")}</button>
      <p class="cart-note">Taxes included · 30-day returns · Secure demo checkout</p>
      <button class="cart-continue" data-close-all>Continue shopping</button>
    `;
    const dc = $("#cartDrawerCount");
    if (dc) dc.textContent = `(${count})`;
  }
  function updateCounts() {
    const count = cartCount();
    $$("[data-cart-count]").forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
    });
    $$("[data-wish-count]").forEach((el) => {
      el.textContent = wishlist.length;
      el.hidden = wishlist.length === 0;
    });
  }

  /* ---------------- shop ---------------- */
  const shopState = {
    category: "all",
    shape: "all",
    color: "all",
    maxPrice: 3500,
    sort: "featured",
    q: ""
  };

  function initShopFromURL() {
    const params = new URLSearchParams(location.search);
    if (params.get("category")) shopState.category = params.get("category");
    if (params.get("shape")) shopState.shape = params.get("shape");
    if (params.get("sort")) shopState.sort = params.get("sort");
    if (params.get("q")) shopState.q = params.get("q");
  }
  function syncShopURL() {
    const params = new URLSearchParams();
    if (shopState.category !== "all") params.set("category", shopState.category);
    if (shopState.shape !== "all") params.set("shape", shopState.shape);
    if (shopState.sort !== "featured") params.set("sort", shopState.sort);
    if (shopState.q) params.set("q", shopState.q);
    const qs = params.toString();
    try { history.replaceState(null, "", location.pathname + (qs ? `?${qs}` : "")); } catch (e) { /* file protocol */ }
  }
  function filteredProducts() {
    let list = PRODUCTS.filter((p) => {
      if (shopState.category !== "all" && p.category !== shopState.category) return false;
      if (shopState.shape !== "all" && p.shape !== shopState.shape) return false;
      if (shopState.color !== "all" && !p.colors.some((c) => c.name === shopState.color)) return false;
      if (p.price > shopState.maxPrice) return false;
      if (shopState.q) {
        const hay = `${p.name} ${p.shape} ${p.category} ${p.material} ${p.colors.map((c) => c.name).join(" ")}`.toLowerCase();
        if (!hay.includes(shopState.q.toLowerCase())) return false;
      }
      return true;
    });
    switch (shopState.sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "newest": list.sort((a, b) => (b.badge === "New") - (a.badge === "New")); break;
      default: break;
    }
    return list;
  }
  function renderShopFilters() {
    const cat = $("#filterCategory");
    const shape = $("#filterShape");
    const color = $("#filterColor");
    if (!cat || !shape || !color) return;
    const categories = [
      { id: "all", label: "All frames" },
      { id: "eyeglasses", label: "Eyeglasses" },
      { id: "sunglasses", label: "Sunglasses" }
    ];
    cat.innerHTML = categories.map((c) => {
      const n = c.id === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === c.id).length;
      return `<label class="filter-option"><input type="radio" name="category" value="${c.id}" ${shopState.category === c.id ? "checked" : ""}> ${c.label}<span class="count">${n}</span></label>`;
    }).join("");

    const shapes = ["all", ...Array.from(new Set(PRODUCTS.map((p) => p.shape)))];
    shape.innerHTML = shapes.map((s) => {
      const n = s === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.shape === s).length;
      return `<label class="filter-option"><input type="radio" name="shape" value="${s}" ${shopState.shape === s ? "checked" : ""}> ${s === "all" ? "All shapes" : s}<span class="count">${n}</span></label>`;
    }).join("");

    const colors = ["all", ...Array.from(new Set(PRODUCTS.flatMap((p) => p.colors.map((c) => c.name))))];
    color.innerHTML = colors.map((c) => {
      const n = c === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.colors.some((x) => x.name === c)).length;
      return `<label class="filter-option"><input type="radio" name="color" value="${esc(c)}" ${shopState.color === c ? "checked" : ""}> ${c === "all" ? "All colours" : esc(c)}<span class="count">${n}</span></label>`;
    }).join("");

    const range = $("#priceRange");
    if (range) range.value = shopState.maxPrice;
    const priceOut = $("#priceOut");
    if (priceOut) priceOut.textContent = money(shopState.maxPrice);
  }
  function renderShop() {
    const grid = $("#shopGrid");
    if (!grid) return;
    const list = filteredProducts();
    const countEl = $("#shopCount");
    if (countEl) countEl.innerHTML = `<strong>${list.length}</strong> frame${list.length === 1 ? "" : "s"}`;
    grid.innerHTML = list.length
      ? list.map(productCard).join("")
      : `<div class="shop-empty">
           <h3>No frames match those filters</h3>
           <p>Try widening your price range or clearing a filter or two.</p>
           <button class="btn btn-primary btn-sm" data-clear-filters>Clear all filters</button>
         </div>`;
    observeReveals();
    syncShopURL();
  }
  function bindShop() {
    if (!$("#shopGrid")) return;
    initShopFromURL();
    const sortEl = $("#sortSelect");
    if (sortEl) sortEl.value = shopState.sort;
    renderShopFilters();
    renderShop();

    $("#filterCategory")?.addEventListener("change", (e) => {
      if (e.target.name === "category") { shopState.category = e.target.value; renderShop(); }
    });
    $("#filterShape")?.addEventListener("change", (e) => {
      if (e.target.name === "shape") { shopState.shape = e.target.value; renderShop(); }
    });
    $("#filterColor")?.addEventListener("change", (e) => {
      if (e.target.name === "color") { shopState.color = e.target.value; renderShop(); }
    });
    $("#priceRange")?.addEventListener("input", (e) => {
      shopState.maxPrice = Number(e.target.value);
      const out = $("#priceOut");
      if (out) out.textContent = money(shopState.maxPrice);
      renderShop();
    });
    $("#sortSelect")?.addEventListener("change", (e) => {
      shopState.sort = e.target.value;
      renderShop();
    });
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-clear-filters]")) {
        Object.assign(shopState, { category: "all", shape: "all", color: "all", maxPrice: 3500, sort: "featured", q: "" });
        const sortEl = $("#sortSelect");
        if (sortEl) sortEl.value = "featured";
        renderShopFilters();
        renderShop();
        toast("Filters cleared");
      }
    });
    $("#filterToggle")?.addEventListener("click", () => {
      const panel = $("#filtersPanel");
      if (!panel) return;
      const open = panel.classList.toggle("is-open");
      $("#filterToggle").setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("[data-close-filters]")) return;
      $("#filtersPanel")?.classList.remove("is-open");
      $("#filterToggle")?.setAttribute("aria-expanded", "false");
      $("#shopGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---------------- search ---------------- */
  function renderSearchResults(query) {
    const results = $("#searchResults");
    const empty = $("#searchEmpty");
    if (!results) return;
    const q = query.trim().toLowerCase();
    const list = q
      ? PRODUCTS.filter((p) =>
          `${p.name} ${p.shape} ${p.category} ${p.material} ${p.colors.map((c) => c.name).join(" ")}`.toLowerCase().includes(q)
        )
      : PRODUCTS.slice(0, 4);
    results.innerHTML = list.map((p) => `
      <a class="search-result" href="product.html?id=${p.id}" data-close-all>
        <img src="${p.image}" alt="${esc(p.name)}" loading="lazy">
        <span><strong>${esc(p.name)}</strong><small>${esc(p.shape)} · ${money(p.price)}</small></span>
      </a>`).join("");
    if (empty) empty.hidden = list.length > 0;
  }
  function bindSearch() {
    const input = $("#searchInput");
    if (!input) return;
    input.addEventListener("input", (e) => renderSearchResults(e.target.value));
    $$("[data-search-chip]").forEach((chip) => {
      chip.addEventListener("click", () => {
        input.value = chip.dataset.searchChip;
        renderSearchResults(input.value);
        input.focus();
      });
    });
    renderSearchResults("");
  }

  /* ---------------- product detail ---------------- */
  let pdpState = { color: null, size: null, lens: "single", qty: 1, product: null };

  function initPDP() {
    const root = $("#pdpRoot");
    if (!root) return;
    const params = new URLSearchParams(location.search);
    const id = params.get("id") || "aravalli";
    const p = getProduct(id) || PRODUCTS[0];
    document.title = `${p.name} — Mishra Optics`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", `${p.name}: ${p.description}`);
    pdpState = { color: p.colors[0].name, size: p.size.split("·")[0].trim(), lens: "single", qty: 1, product: p };

    const badge = p.badge ? `<span class="pdp__badge">${icon(p.badge === "Sale" ? "sparkle" : "award")} ${esc(p.badge)}</span>` : "";
    const compare = p.compareAt ? `<s>${money(p.compareAt)}</s><span>Save ${money(p.compareAt - p.price)}</span>` : "";
    const discount = p.compareAt ? `<span>Save ${money(p.compareAt - p.price)}</span>` : "";

    root.innerHTML = `
      <div class="container pdp">
        <nav class="breadcrumb" aria-label="Breadcrumb" style="margin-bottom:1.25rem">
          <a href="index.html">Home</a> ${icon("chevron-down")}
          <a href="shop.html">Shop</a> ${icon("chevron-right")}
          <a href="shop.html?category=${p.category}">${esc(p.category)}</a> ${icon("chevron-right")}
          <span>${esc(p.name)}</span>
        </nav>
        <div class="pdp__grid">
          <div class="gallery">
            <div class="gallery__main"><img id="galleryMain" src="${p.image}" alt="${esc(p.name)} — ${esc(p.shape)} ${esc(p.category)} by Mishra Optics" width="900" height="960"></div>
            <div class="gallery__thumbs">
              ${[0, 1, 2, 3].map((i) => `<button class="gallery__thumb${i === 0 ? " is-active" : ""}" data-thumb="${i}" aria-label="View image ${i + 1}"><img src="${p.image}" alt="" style="object-position:${["center", "30% 20%", "70% 60%", "50% 90%"][i]};transform:scale(${[1, 1.5, 1.5, 1.35][i]})"></button>`).join("")}
            </div>
          </div>
          <div class="pdp__info">
            ${badge}
            <h1>${esc(p.name)}</h1>
            <div class="pdp__rating">
              <span class="stars">${Array.from({ length: 5 }, () => icon("star")).join("")}</span>
              <span>${p.rating.toFixed(1)} · ${p.reviews} reviews</span>
              <a href="#reviews">Read reviews</a>
            </div>
            <div class="pdp__price"><strong id="pdpPrice">${money(p.price)}</strong>${compare}</div>
            <p class="pdp__desc">${esc(p.description)}</p>
            <div class="pdp__divider"></div>
            <div class="option-label">Frame colour <span id="colorName">${esc(p.colors[0].name)}</span></div>
            <div class="color-row" id="colorRow">
              ${p.colors.map((c, i) => `<button class="color-dot${i === 0 ? " is-active" : ""}" style="background:${c.hex}" data-color="${esc(c.name)}" aria-label="${esc(c.name)}" aria-pressed="${i === 0}"></button>`).join("")}
            </div>
            <div class="pdp__divider"></div>
            <div class="option-label">Size <span>${esc(p.size)}</span></div>
            <div class="size-row" id="sizeRow">
              <button class="size-btn is-active" data-size="${esc(p.size.split("·")[0].trim())}">${esc(p.size.split("·")[0].trim())}</button>
              <button class="size-btn" data-size="Size guide">Size guide</button>
            </div>
            <div class="pdp__divider"></div>
            <div class="option-label">Lens type <span>Choose at checkout</span></div>
            <div class="lens-list" id="lensList">
              ${LENS_OPTIONS.map((l) => `
                <label class="lens-option${l.id === "single" ? " is-active" : ""}">
                  <input type="radio" name="lens" value="${l.id}" ${l.id === "single" ? "checked" : ""}>
                  <strong>${esc(l.label)}</strong>
                  <small>${esc(l.note)}</small>
                </label>`).join("")}
            </div>
            <div class="buy-row">
              <div class="qty">
                <button data-pdp-minus aria-label="Decrease quantity">${icon("minus")}</button>
                <span id="pdpQty">1</span>
                <button data-pdp-plus aria-label="Increase quantity">${icon("plus")}</button>
              </div>
              <button class="btn btn-primary" data-pdp-add>Add to bag ${icon("bag")}</button>
              <button class="wish-btn${wishlist.includes(p.id) ? " is-active" : ""}" data-wish="${p.id}" aria-label="Save ${esc(p.name)}" aria-pressed="${wishlist.includes(p.id)}">${icon("heart")}</button>
            </div>
            <ul class="pdp__delivery">
              <li>${icon("truck")} <span><strong>Free delivery</strong> in 2–5 working days</span></li>
              <li>${icon("refresh")} <span><strong>30-day returns</strong> · 1-year frame warranty</span></li>
              <li>${icon("shield")} <span><strong>UV400 protection</strong> on every lens we fit</span></li>
            </ul>
            <div class="pdp__divider"></div>
            <div class="accordion">
              <button class="acc-btn" aria-expanded="true">Details & materials ${icon("chevron-down")}</button>
              <div class="acc-panel is-open"><div><ul>${p.details.map((d) => `<li>${esc(d)}</li>`).join("")}</ul></div></div>
            </div>
            <div class="accordion">
              <button class="acc-btn" aria-expanded="false">Size & fit ${icon("chevron-down")}</button>
              <div class="acc-panel"><div>${esc(p.size)}. The frame is designed to sit comfortably at the temples with a medium bridge. If you're between sizes, size down for a closer fit or up for a more relaxed look. Our fit guide on the home page can help.</div></div>
            </div>
            <div class="accordion">
              <button class="acc-btn" aria-expanded="false">Shipping & returns ${icon("chevron-down")}</button>
              <div class="acc-panel"><div>Orders ship within 24 hours from Kota. Delivery is complimentary above ₹1,999 and typically takes 2–5 working days. Prescription orders add 3–5 working days. Returns are accepted within 30 days in original condition.</div></div>
            </div>
            <div class="pdp__share"><span>Share:</span><button data-share>Copy link</button><button data-share-native>Share</button></div>
          </div>
        </div>
        <section class="section" id="reviews">
          <div class="section-head"><div class="section-head__copy"><span class="eyebrow">Reviews</span><h2>Worn & reviewed</h2></div></div>
          <div class="testi-grid" id="pdpReviews"></div>
        </section>
        <section class="section section--tight">
          <div class="section-head">
            <div class="section-head__copy"><span class="eyebrow">Complete the look</span><h2>Pairs well with</h2></div>
            <a class="link-arrow" href="shop.html">All frames ${icon("arrow-right")}</a>
          </div>
          <div class="product-grid" id="relatedProducts"></div>
        </section>
      </div>
      <div class="mobile-buy">
        <span class="price" id="mobilePrice">${money(p.price)}</span>
        <button class="btn btn-primary" data-pdp-add>Add to bag ${icon("bag")}</button>
      </div>
    `;
    document.body.classList.add("has-mobile-buy");

    $("#pdpReviews").innerHTML = TESTIMONIALS.map((t) => `
      <div class="testi-card">
        <div class="stars">${Array.from({ length: 5 }, () => icon("star")).join("")}</div>
        <blockquote>“${esc(t.quote)}”</blockquote>
        <footer><span class="testi-avatar">${esc(t.name.split(" ").map((x) => x[0]).join(""))}</span><div><strong>${esc(t.name)}</strong><small>${esc(t.city)} · Verified buyer</small></div></footer>
      </div>`).join("");

    const related = PRODUCTS.filter((x) => x.id !== p.id).sort((a, b) => (b.category === p.category) - (a.category === p.category)).slice(0, 4);
    $("#relatedProducts").innerHTML = related.map(productCard).join("");

    const updatePrice = () => {
      const total = p.price + lensExtra(pdpState.lens);
      const priceEl = $("#pdpPrice");
      if (priceEl) priceEl.textContent = money(total);
      const mobileEl = $("#mobilePrice");
      if (mobileEl) mobileEl.textContent = money(total);
    };

    $("#colorRow")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-color]");
      if (!btn) return;
      pdpState.color = btn.dataset.color;
      $$("#colorRow .color-dot").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      const label = $("#colorName");
      if (label) label.textContent = pdpState.color;
    });

    $("#sizeRow")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-size]");
      if (!btn) return;
      if (btn.dataset.size === "Size guide") {
        const acc = btn.closest(".pdp__info").querySelectorAll(".acc-btn")[1];
        acc?.click();
        acc?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      pdpState.size = btn.dataset.size;
      $$("#sizeRow .size-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
    });

    $("#lensList")?.addEventListener("change", (e) => {
      if (e.target.name !== "lens") return;
      pdpState.lens = e.target.value;
      $$("#lensList .lens-option").forEach((l) => l.classList.toggle("is-active", l.contains(e.target)));
      updatePrice();
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-pdp-plus]")) {
        pdpState.qty = Math.min(9, pdpState.qty + 1);
        const q = $("#pdpQty"); if (q) q.textContent = pdpState.qty;
      }
      if (e.target.closest("[data-pdp-minus]")) {
        pdpState.qty = Math.max(1, pdpState.qty - 1);
        const q = $("#pdpQty"); if (q) q.textContent = pdpState.qty;
      }
      if (e.target.closest("[data-pdp-add]")) {
        addToCart(p.id, { color: pdpState.color, size: pdpState.size, lens: pdpState.lens, qty: pdpState.qty });
        toast(`${p.name} added to your bag`);
        openPanel("#cartDrawer");
      }
      if (e.target.closest("[data-share]")) {
        const url = location.href;
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(url).then(() => toast("Link copied to clipboard")).catch(() => toast("Copy this page URL to share"));
        } else toast("Copy this page URL to share");
      }
      if (e.target.closest("[data-share-native]")) {
        if (navigator.share) navigator.share({ title: p.name, url: location.href }).catch(() => {});
        else toast("Copy this page URL to share");
      }
      const thumb = e.target.closest("[data-thumb]");
      if (thumb) {
        const main = $("#galleryMain");
        const positions = ["center", "30% 20%", "70% 60%", "50% 90%"];
        const scales = [1, 1.5, 1.5, 1.35];
        const i = Number(thumb.dataset.thumb);
        if (main) {
          main.style.objectPosition = positions[i];
          main.style.transform = `scale(${scales[i]})`;
          main.style.transition = "transform .5s var(--ease), object-position .5s";
        }
        $$(".gallery__thumb").forEach((t) => t.classList.toggle("is-active", t === thumb));
      }
    });
  }

  /* ---------------- accordions ---------------- */
  function bindAccordions() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".acc-btn");
      if (!btn) return;
      const panel = btn.nextElementSibling;
      if (!panel) return;
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.classList.toggle("is-open", !open);
    });
  }

  /* ---------------- fit finder ---------------- */
  function renderFitFinder() {
    const root = $("#fitFinderMount");
    if (!root) return;
    const initial = FACE_SHAPES.Oval;
    const rec = getProduct(initial.product);
    root.innerHTML = `
      <div class="fit__copy">
        <span class="eyebrow eyebrow--light">Fit finder</span>
        <h2>Find the frame that <em>fits you</em></h2>
        <p>Pick your face shape and we'll point you to a silhouette that balances your features. It's a starting point, not a rulebook.</p>
        <div class="fit__note">${icon("sparkle")} Free 30-day returns, so you can always try another.</div>
      </div>
      <div class="fit__card">
        <h3>I have a…</h3>
        <div class="shape-pills" id="shapePills">
          ${Object.keys(FACE_SHAPES).map((s) => `<button class="shape-pill${s === "Oval" ? " is-active" : ""}" data-shape="${s}">${s} face</button>`).join("")}
        </div>
        <p class="fit__tip" id="fitTip">${initial.tip}</p>
        <div class="fit__rec">
          <img src="${rec.image}" alt="${esc(rec.name)}" loading="lazy">
          <div><strong>${esc(rec.name)}</strong><small>${esc(rec.shape)} · ${money(rec.price)}</small></div>
          <a href="product.html?id=${rec.id}" aria-label="View ${esc(rec.name)}">${icon("arrow-up-right")}</a>
        </div>
      </div>`;
    $("#shapePills")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-shape]");
      if (!btn) return;
      const shape = btn.dataset.shape;
      const data = FACE_SHAPES[shape];
      const product = getProduct(data.product);
      $$("#shapePills .shape-pill").forEach((b) => b.classList.toggle("is-active", b === btn));
      const tip = $("#fitTip");
      if (tip) tip.textContent = data.tip;
      const recEl = $(".fit__rec");
      if (recEl && product) {
        recEl.innerHTML = `
          <img src="${product.image}" alt="${esc(product.name)}" loading="lazy">
          <div><strong>${esc(product.name)}</strong><small>${esc(product.shape)} · ${money(product.price)}</small></div>
          <a href="product.html?id=${product.id}" aria-label="View ${esc(product.name)}">${icon("arrow-up-right")}</a>`;
      }
    });
  }

  /* ---------------- testimonials / journal / stores / faq ---------------- */
  function renderTestimonials() {
    const el = $("#testiGrid");
    if (!el) return;
    el.innerHTML = TESTIMONIALS.map((t, i) => `
      <div class="testi-card reveal" style="--d:${i * 80}ms">
        <div class="stars">${Array.from({ length: 5 }, () => icon("star")).join("")}</div>
        <blockquote>“${esc(t.quote)}”</blockquote>
        <footer>
          <span class="testi-avatar">${esc(t.name.split(" ").map((x) => x[0]).join(""))}</span>
          <div><strong>${esc(t.name)}</strong><small>${esc(t.city)} · Verified buyer</small></div>
          <span class="testi-product">${esc(t.product)}</span>
        </footer>
      </div>`).join("");
  }
  function renderJournal() {
    const el = $("#journalGrid");
    if (!el) return;
    el.innerHTML = JOURNAL.map((post, i) => `
      <a class="post-card reveal" style="--d:${i * 80}ms" href="about.html">
        <div class="post-card__media"><img src="${post.image}" alt="${esc(post.title)}" loading="lazy"></div>
        <span class="post-card__tag">${esc(post.tag)}</span>
        <h3>${esc(post.title)}</h3>
        <p>${esc(post.excerpt)}</p>
        <div class="post-card__meta">${esc(post.read)}</div>
      </a>`).join("");
  }
  function renderStores() {
    const el = $("#storesGrid");
    if (!el) return;
    el.innerHTML = STORES.map((s) => `
      <div class="store-card">
        <span>${esc(s.label)}</span>
        <h3>${esc(s.city)}</h3>
        <p>${esc(s.address)}</p>
        <div class="store-meta">
          <span>${icon("clock")} ${esc(s.hours)}</span>
          <span>${icon("phone")} ${esc(s.phone)}</span>
        </div>
        <a class="link-arrow" href="https://maps.google.com/?q=${encodeURIComponent(s.address)}" target="_blank" rel="noopener">Get directions ${icon("arrow-up-right")}</a>
      </div>`).join("");
  }
  function renderFaqs() {
    const el = $("#faqList");
    if (!el) return;
    el.innerHTML = FAQS.map((f, i) => `
      <div class="accordion">
        <button class="acc-btn" aria-expanded="${i === 0}">${esc(f.q)} ${icon("chevron-down")}</button>
        <div class="acc-panel${i === 0 ? " is-open" : ""}"><div>${esc(f.a)}</div></div>
      </div>`).join("");
  }

  /* ---------------- forms ---------------- */
  function bindNewsletter() {
    const form = $("#newsletterForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#newsletterEmail");
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((input?.value || "").trim());
      if (!valid) {
        toast("Please enter a valid email address");
        input?.focus();
        return;
      }
      form.classList.add("is-done");
      toast("You're on the list — welcome to Mishra Optics");
    });
  }
  function bindContact() {
    const form = $("#contactForm");
    if (!form) return;
    const setError = (name, hasError) => {
      const field = form.querySelector(`[name="${name}"]`)?.closest(".field");
      if (field) field.classList.toggle("has-error", hasError);
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const topic = String(data.get("topic") || "General enquiry").trim();
      const message = String(data.get("message") || "").trim();
      let ok = true;
      if (name.length < 2) { setError("name", true); ok = false; } else setError("name", false);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError("email", true); ok = false; } else setError("email", false);
      if (message.length < 10) { setError("message", true); ok = false; } else setError("message", false);
      if (!ok) { toast("Please check the highlighted fields"); return; }

      /* Frontend-only handoff: open WhatsApp with the message pre-filled.
         No backend, database or third-party form service is involved. */
      const composed = [
        `Hello ${BUSINESS.name}, I'm ${name}.`,
        "",
        `Topic: ${topic}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        "",
        message
      ].join("\n");
      const waUrl = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(composed)}`;
      const fallback = form.closest(".form-card")?.querySelector("[data-wa-fallback]");
      if (fallback) fallback.href = waUrl;
      form.closest(".form-card")?.classList.add("is-sent");
      window.open(waUrl, "_blank", "noopener,noreferrer");
      toast("Opening WhatsApp with your message…");
    });
    form.addEventListener("input", (e) => {
      const field = e.target.closest(".field");
      if (field) field.classList.remove("has-error");
    });
  }

  /* ---------------- reveal / header / announcement ---------------- */
  let revealObserver;
  function observeReveals() {
    const items = $$(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    }
    items.forEach((el) => revealObserver.observe(el));
  }
  function bindHeader() {
    const header = $(".site-header");
    const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const items = $$(".announce__item");
    if (items.length > 1) {
      let i = 0;
      setInterval(() => {
        items[i].classList.remove("is-active");
        i = (i + 1) % items.length;
        items[i].classList.add("is-active");
      }, 4500);
    }
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------------- global events ---------------- */
  function bindGlobal() {
    document.addEventListener("click", (e) => {
      const openCart = e.target.closest("[data-open-cart]");
      if (openCart) { e.preventDefault(); openPanel("#cartDrawer"); return; }
      const openWish = e.target.closest("[data-open-wishlist]");
      if (openWish) { e.preventDefault(); openPanel("#wishDrawer"); return; }
      const openSearch = e.target.closest("[data-open-search]");
      if (openSearch) { e.preventDefault(); openPanel("#searchPanel"); return; }
      const openMenu = e.target.closest("[data-open-menu]");
      if (openMenu) { e.preventDefault(); openPanel("#menuDrawer"); return; }
      if (e.target.closest("[data-close-all]")) { closeAll(); return; }

      const wish = e.target.closest("[data-wish]");
      if (wish) { e.preventDefault(); toggleWish(wish.dataset.wish); return; }

      const quick = e.target.closest("[data-quick-add]");
      if (quick) {
        e.preventDefault();
        const p = getProduct(quick.dataset.quickAdd);
        addToCart(quick.dataset.quickAdd);
        toast(`${p.name} added to your bag`);
        return;
      }
      const wishAdd = e.target.closest("[data-wish-add]");
      if (wishAdd) {
        addToCart(wishAdd.dataset.wishAdd);
        toast(`${getProduct(wishAdd.dataset.wishAdd)?.name} added to your bag`);
        openPanel("#cartDrawer");
        return;
      }
      const wishRemove = e.target.closest("[data-wish-remove]");
      if (wishRemove) { toggleWish(wishRemove.dataset.wishRemove); return; }

      const minus = e.target.closest("[data-cart-minus]");
      if (minus) { updateQty(minus.dataset.cartMinus, -1); return; }
      const plus = e.target.closest("[data-cart-plus]");
      if (plus) { updateQty(plus.dataset.cartPlus, 1); return; }
      const remove = e.target.closest("[data-cart-remove]");
      if (remove) { removeLine(remove.dataset.cartRemove); toast("Removed from your bag"); return; }

      if (e.target.closest("[data-checkout]")) {
        toast("This is a frontend demo — checkout isn't connected");
        return;
      }

      const subToggle = e.target.closest("[aria-controls='mobileShopSub']");
      if (subToggle) {
        const sub = $("#mobileShopSub");
        const open = sub?.classList.toggle("is-open");
        subToggle.setAttribute("aria-expanded", String(Boolean(open)));
        return;
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll();
    });
  }

  /* ---------------- boot ---------------- */
  function boot() {
    mountShell();
    bindHeader();
    bindGlobal();
    bindAccordions();
    bindSearch();
    bindShop();
    bindNewsletter();
    bindContact();
    renderHomeProducts();
    renderTestimonials();
    renderJournal();
    renderStores();
    renderFaqs();
    renderFitFinder();
    initPDP();
    renderCart();
    renderWishlist();
    updateCounts();
    syncWishButtons();
    observeReveals();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

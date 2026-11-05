gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lenis = null;

// package builder ki current choice; booking form bhi isi ko padhta hai
const quoteState = { sizeId: "medium", packageId: "valet", addOnIds: [] };

fillShopDetails();
showOpenStatus();
renderMarquee();
renderVanSpecs();
setupPackageBuilder();
setupCompare();
renderWorkSteps();
setupPostcodeCheck();
renderReviews();
renderFaqList();
setupBookingForm();
setupMobileMenu();
setupThemeToggle();
setupHeaderOnScroll();
setupBookButtons();
tuckChatNearBooking();

startPage();

async function startPage() {
  if (prefersReducedMotion) {
    hideLoader();
    return;
  }
  setupSmoothScroll();
  await preloadStoryFrames(updateLoader);
  hideLoader();
  setupFrameStory();
  playHeroEntrance();
  setupSplitTitles();
  setupSectionReveals();
  setupStepRail();
  setupVanParallax();
  ScrollTrigger.refresh();
}

function updateLoader(progress) {
  document.getElementById("loader-percent").textContent = Math.round(progress * 100);
  document.getElementById("loader-fill").style.transform = `scaleX(${progress})`;
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (prefersReducedMotion) {
    loader.remove();
    return;
  }
  gsap.to(loader, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "power4.inOut", onComplete: () => loader.remove() });
}

function playHeroEntrance() {
  gsap.timeline({ delay: 0.45 })
    .from(".hero-title .line > span", { yPercent: 110, duration: 1.1, stagger: 0.12, ease: "power4.out" })
    .from(".hero-status, .caption-1 .lead, .caption-1 .cta-row", { opacity: 0, y: 20, duration: 0.8, stagger: 0.08, ease: "power3.out" }, "-=0.7")
    .from(".gloss-meter, .story-steps li, .scroll-hint", { opacity: 0, x: 12, duration: 0.6, stagger: 0.04 }, "-=0.6");
}

function setupSmoothScroll() {
  lenis = new Lenis({ duration: 1.15 });
  // ScrollTrigger ko Lenis wali scroll position chahiye, warna pin late lagta hai
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function scrollToSection(target) {
  if (lenis) lenis.scrollTo(target, { offset: target.id === "top" ? 0 : -72 });
  else target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
}

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.getAttribute("href") === "#" || link.hasAttribute("data-book-service")) return;
  const target = document.querySelector(link.getAttribute("href"));
  if (!target) return;
  event.preventDefault();
  closeMobileMenu();
  scrollToSection(target);
});

// headings ke words neeche se upar aate hain
function setupSplitTitles() {
  document.querySelectorAll(".split-title").forEach((title) => {
    title.setAttribute("aria-label", title.textContent);
    title.innerHTML = title.textContent
      .split(" ")
      .map((word) => `<span class="word" aria-hidden="true"><span>${word}</span></span>`)
      .join(" ");
    gsap.from(title.querySelectorAll(".word > span"), {
      yPercent: 115,
      duration: 1,
      stagger: 0.045,
      ease: "power4.out",
      scrollTrigger: { trigger: title, start: "top 86%", once: true },
    });
  });
}

function setupSectionReveals() {
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 90%",
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.07, ease: "power4.out" }),
  });
}

function setupStepRail() {
  gsap.fromTo("#step-rail-fill", { scaleX: 0 }, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { trigger: ".step-track", start: "top 75%", end: "bottom 55%", scrub: true },
  });
  document.querySelectorAll(".step-item").forEach((step, index) => {
    ScrollTrigger.create({
      trigger: ".step-track",
      start: `top+=${index * 60} 70%`,
      onEnter: () => step.classList.add("is-lit"),
      onLeaveBack: () => step.classList.remove("is-lit"),
    });
  });
}

// van ki photo scroll pe halki si andar sarakti hai
function setupVanParallax() {
  gsap.fromTo(".van-figure img", { scale: 1.18, yPercent: -6 }, {
    scale: 1.02,
    yPercent: 4,
    ease: "none",
    scrollTrigger: { trigger: ".van-figure", start: "top bottom", end: "bottom top", scrub: true },
  });
}

// dark default hai; light chunne pe yaad rakhte hain (storage band ho to bhi site chalti rahe)
function setupThemeToggle() {
  const button = document.getElementById("theme-toggle");
  const paint = () => {
    const isLight = document.documentElement.dataset.theme === "light";
    button.querySelector("iconify-icon").setAttribute("icon", isLight ? "ph:moon-duotone" : "ph:sun-duotone");
    button.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  };
  button.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("onyx-theme", next); } catch (error) {}
    paint();
  });
  paint();
}

function setupHeaderOnScroll() {
  const header = document.getElementById("site-header");
  const updateHeader = () => header.classList.toggle("is-solid", window.scrollY > 40);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
}

function setupMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.querySelector("iconify-icon").setAttribute("icon", isOpen ? "ph:list-bold" : "ph:x-bold");
    document.body.classList.toggle("menu-open", !isOpen);
  });
}

function closeMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  toggle.setAttribute("aria-expanded", "false");
  toggle.querySelector("iconify-icon").setAttribute("icon", "ph:list-bold");
  document.body.classList.remove("menu-open");
}

function setupBookButtons() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-book-service]");
    if (!button) return;
    event.preventDefault();
    preselectBookingService(button.dataset.bookService, quoteState.sizeId, quoteState.addOnIds);
    scrollToSection(document.getElementById("book"));
  });
  document.getElementById("quote-book").addEventListener("click", (event) => {
    event.preventDefault();
    preselectBookingService(quoteState.packageId, quoteState.sizeId, quoteState.addOnIds);
    if (bookingState.step === 1) showBookingStep(2);
    scrollToSection(document.getElementById("book"));
  });
}

// booking ke buttons pe chat button na chadhe
function tuckChatNearBooking() {
  const chat = document.getElementById("chat");
  new IntersectionObserver(([entry]) => {
    chat.classList.toggle("is-tucked", entry.isIntersecting);
  }, { rootMargin: "0px 0px -40px 0px" }).observe(document.getElementById("booking-nav"));
}

function fillShopDetails() {
  document.querySelectorAll('[data-shop="phone-link"]').forEach((link) => {
    link.href = `tel:${shopInfo.phoneLink}`;
    if (!link.querySelector("span")) link.textContent = shopInfo.phone;
  });
  document.querySelectorAll('[data-shop="whatsapp-link"]').forEach((link) => {
    link.href = `https://wa.me/${shopInfo.whatsapp}`;
    link.target = "_blank";
    link.rel = "noopener";
  });
  document.querySelectorAll('[data-shop="email"]').forEach((link) => {
    link.href = `mailto:${shopInfo.email}`;
    link.textContent = shopInfo.email;
  });
  document.querySelectorAll('[data-shop="address"]').forEach((item) => { item.textContent = shopInfo.address; });
  document.querySelectorAll(".hours").forEach((list) => {
    list.innerHTML = shopInfo.hours.map(([days, time]) => `<dt>${days}</dt><dd>${time}</dd>`).join("");
  });
  document.getElementById("footer-services").innerHTML = services
    .map((service) => `<li><a href="#book" data-book-service="${service.id}">${service.name}</a></li>`)
    .join("");
  document.getElementById("year").textContent = new Date().getFullYear();
}

// aaj ke hours se "Out today / Back tomorrow": asli hours se, koi fake badge nahi
function showOpenStatus() {
  const now = new Date();
  const day = now.getDay();
  const todayHours = day === 0 ? shopInfo.hours[2] : day === 6 ? shopInfo.hours[1] : shopInfo.hours[0];
  const match = todayHours[1].match(/(\d+):(\d+) (am|pm) – (\d+):(\d+) (am|pm)/);
  const badge = document.getElementById("hero-status");
  const status = badge.querySelector("span:last-child");
  if (!match) {
    status.textContent = "Off today · booking online is open";
    return;
  }
  const toMinutes = (h, m, half) => ((Number(h) % 12) + (half === "pm" ? 12 : 0)) * 60 + Number(m);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const isOut = minutesNow >= toMinutes(match[1], match[2], match[3]) && minutesNow < toMinutes(match[4], match[5], match[6]);
  badge.classList.toggle("is-open", isOut);
  status.textContent = isOut ? `Vans out now · until ${match[4]}:${match[5]} ${match[6]}` : `Leeds · Wakefield · Bradford`;
}

function renderMarquee() {
  const words = marqueeWords
    .map((word) => `<span>${word}</span><iconify-icon icon="ph:sparkle-fill" aria-hidden="true"></iconify-icon>`)
    .join("");
  // do baar taake loop mein jagah khaali na dikhe
  document.getElementById("marquee-track").innerHTML = `<div>${words}</div><div aria-hidden="true">${words}</div>`;
}

function renderVanSpecs() {
  document.getElementById("van-specs").innerHTML = vanSpecs
    .map(
      (spec) => `
      <li data-reveal>
        <iconify-icon icon="${spec.icon}" aria-hidden="true"></iconify-icon>
        <strong>${spec.value}</strong>
        <span>${spec.label}</span>
      </li>`
    )
    .join("");
}

/* ---------- package builder ---------- */

function quoteFor(state) {
  const size = carSizes.find((item) => item.id === state.sizeId);
  const pack = findServiceById(state.packageId);
  const extras = addOns.filter((item) => state.addOnIds.includes(item.id));
  // package ka price car size se badhta hai, add-ons fixed hain; 5 pe round
  const base = Math.round((pack.price * size.multiplier) / 5) * 5;
  const total = base + extras.reduce((sum, item) => sum + item.price, 0);
  return { size, pack, extras, base, total };
}

function setupPackageBuilder() {
  document.getElementById("size-picker").innerHTML = carSizes
    .map(
      (size) => `
      <label class="size-option">
        <input type="radio" name="builder-size" value="${size.id}" ${size.id === quoteState.sizeId ? "checked" : ""}>
        <span><iconify-icon icon="${size.icon}" aria-hidden="true"></iconify-icon><strong>${size.label}</strong><small>${size.example}</small></span>
      </label>`
    )
    .join("");

  document.getElementById("package-picker").innerHTML = services
    .map(
      (pack, index) => `
      <label class="package-option" data-reveal>
        <input type="radio" name="builder-package" value="${pack.id}" ${pack.id === quoteState.packageId ? "checked" : ""}>
        <span class="package-body">
          <span class="package-num">0${index + 1}</span>
          <span class="package-text"><strong>${pack.name}</strong><small>${pack.text}</small></span>
          <span class="package-meta"><em data-package-price="${pack.id}">${formatPrice(pack.price)}</em><small>${pack.time}</small></span>
        </span>
      </label>`
    )
    .join("");

  document.getElementById("addon-picker").innerHTML = addOns
    .map(
      (extra) => `
      <label class="addon-option">
        <input type="checkbox" name="builder-addon" value="${extra.id}">
        <span><iconify-icon icon="${extra.icon}" aria-hidden="true"></iconify-icon>${extra.name}<small>+${formatPrice(extra.price)}</small></span>
      </label>`
    )
    .join("");

  document.querySelector(".builder-controls").addEventListener("change", (event) => {
    const { name, value } = event.target;
    if (name === "builder-size") quoteState.sizeId = value;
    if (name === "builder-package") quoteState.packageId = value;
    if (name === "builder-addon") {
      quoteState.addOnIds = [...document.querySelectorAll('input[name="builder-addon"]:checked')].map((input) => input.value);
    }
    updateQuote(true);
  });
  updateQuote(false);
}

function updateQuote(animate) {
  const quote = quoteFor(quoteState);

  // har package ke saath us size ka price dikhao
  services.forEach((pack) => {
    const price = quoteFor({ ...quoteState, packageId: pack.id, addOnIds: [] }).base;
    document.querySelector(`[data-package-price="${pack.id}"]`).textContent = formatPrice(price);
  });

  document.getElementById("quote-name").textContent = quote.pack.name;
  document.getElementById("quote-car").textContent = `${quote.size.label} car · ${quote.size.example}`;
  document.getElementById("quote-includes").innerHTML = packageIncludes[quote.pack.id]
    .map((item) => `<li><iconify-icon icon="ph:check-bold" aria-hidden="true"></iconify-icon>${item}</li>`)
    .join("");
  document.getElementById("quote-extras").innerHTML = quote.extras
    .map((item) => `<li><span>${item.name}</span><span>+${formatPrice(item.price)}</span></li>`)
    .join("");
  document.getElementById("quote-time").textContent = quote.pack.time;

  const priceEl = document.getElementById("quote-price");
  const from = Number(priceEl.dataset.value || quote.total);
  priceEl.dataset.value = quote.total;
  if (!animate || prefersReducedMotion) {
    priceEl.textContent = formatPrice(quote.total);
    return;
  }
  // price gin ke upar/neeche jata hai
  const counter = { value: from };
  gsap.to(counter, {
    value: quote.total,
    duration: 0.6,
    ease: "power3.out",
    onUpdate: () => { priceEl.textContent = formatPrice(counter.value); },
  });
  gsap.fromTo(".quote-card", { "--flash": 1 }, { "--flash": 0, duration: 0.8, ease: "power2.out" });
}

/* ---------- before / after ---------- */

function setupCompare() {
  const tabs = document.getElementById("compare-tabs");
  tabs.innerHTML = compareSets
    .map(
      (set, index) => `
      <button class="compare-tab" type="button" role="tab" data-set="${set.id}" aria-selected="${index === 0}">
        <iconify-icon icon="${set.icon}" aria-hidden="true"></iconify-icon>${set.label}
      </button>`
    )
    .join("");

  const range = document.getElementById("compare-range");
  const before = document.getElementById("compare-before");
  const handle = document.getElementById("compare-handle");
  const update = () => {
    before.style.clipPath = `inset(0 ${100 - range.value}% 0 0)`;
    handle.style.left = `${range.value}%`;
  };
  range.addEventListener("input", update);
  update();

  tabs.addEventListener("click", (event) => {
    const tab = event.target.closest(".compare-tab");
    if (!tab) return;
    tabs.querySelectorAll(".compare-tab").forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
    showCompareSet(tab.dataset.set);
  });
  showCompareSet(compareSets[0].id, false);

  if (!prefersReducedMotion) {
    // pehli baar screen pe aaye to slider khud hil ke dikhata hai ke yeh drag hota hai
    const hint = { value: 50 };
    ScrollTrigger.create({
      trigger: "#compare",
      start: "top 70%",
      once: true,
      onEnter: () => gsap.timeline()
        .to(hint, { value: 18, duration: 0.9, ease: "power2.inOut", onUpdate: () => { range.value = hint.value; update(); } })
        .to(hint, { value: 62, duration: 1.1, ease: "power2.inOut", onUpdate: () => { range.value = hint.value; update(); } }),
    });
  }
}

function showCompareSet(setId, animate = true) {
  const set = compareSets.find((item) => item.id === setId);
  const swap = () => {
    document.getElementById("compare-after").src = set.after;
    document.getElementById("compare-before-img").src = set.before;
    document.getElementById("compare-after").alt = `${set.label} after the detail`;
    document.getElementById("compare-before-img").alt = `${set.label} before the detail`;
    document.getElementById("compare-note").textContent = set.note;
  };
  if (!animate || prefersReducedMotion) {
    swap();
    return;
  }
  gsap.timeline()
    .to("#compare", { clipPath: "inset(0 0 0 100%)", duration: 0.45, ease: "power3.in" })
    .add(swap)
    .fromTo("#compare", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "power3.out" });
}

function renderWorkSteps() {
  document.getElementById("step-track").insertAdjacentHTML(
    "beforeend",
    workSteps
      .map(
        (step, index) => `
        <li class="step-item" data-reveal>
          <span class="step-icon"><iconify-icon icon="${step.icon}" aria-hidden="true"></iconify-icon></span>
          <span class="step-count">0${index + 1}</span>
          <h3>${step.title}</h3>
          <p>${step.text}</p>
        </li>`
      )
      .join("")
  );
}

/* ---------- postcode check ---------- */

// "LS6 2AB" se "LS" aur 6 nikaalta hai
function readPostcodeArea(text) {
  let code = text.toUpperCase().replace(/\s+/g, "");
  // poora postcode ho to aakhri 3 (jaise "2AB") hata ke sirf area bachao
  if (/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(code)) code = code.slice(0, -3);
  const match = code.match(/^([A-Z]{1,2})(\d{1,2})[A-Z]?$/);
  if (!match) return null;
  return { prefix: match[1], district: Number(match[2]), outward: `${match[1]}${match[2]}` };
}

function findCoverage(text) {
  const area = readPostcodeArea(text);
  if (!area) return { valid: false };
  const zone = coverageAreas.find((item) => item.prefix === area.prefix && area.district >= item.from && area.district <= item.to);
  return { valid: true, area, zone };
}

function setupPostcodeCheck() {
  document.getElementById("area-list").innerHTML = coverageAreas
    .map((zone) => `<li data-reveal><strong>${zone.name}</strong><span>${zone.prefix}${zone.from} – ${zone.prefix}${zone.to}</span></li>`)
    .join("");

  const form = document.getElementById("postcode-form");
  const result = document.getElementById("postcode-result");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const check = findCoverage(form.elements.postcode.value);
    result.className = "postcode-result";
    if (!check.valid) {
      result.textContent = "Type the start of a UK postcode, like LS6 or BD3.";
      result.classList.add("is-error");
    } else if (check.zone) {
      result.innerHTML = `<iconify-icon icon="ph:check-circle-duotone" aria-hidden="true"></iconify-icon>Yes, we cover ${check.area.outward} (${check.zone.name}). <a href="#book">Book a slot</a>`;
      result.classList.add("is-yes");
      document.getElementById("postcode").value = form.elements.postcode.value.toUpperCase();
    } else {
      result.innerHTML = `<iconify-icon icon="ph:map-pin-duotone" aria-hidden="true"></iconify-icon>${check.area.outward} is just outside our usual area. <a data-shop="whatsapp-link" href="https://wa.me/${shopInfo.whatsapp}" target="_blank" rel="noopener">Message us</a> and we'll see what we can do.`;
      result.classList.add("is-no");
    }
    if (!prefersReducedMotion) gsap.fromTo(result, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 });
  });
}

function renderReviews() {
  const track = document.getElementById("review-track");
  const stars = (count) =>
    Array.from({ length: 5 }, (_, i) => `<iconify-icon icon="ph:star-fill" class="${i < count ? "is-on" : ""}" aria-hidden="true"></iconify-icon>`).join("");

  track.innerHTML = sampleReviews
    .map(
      (review) => `
      <article class="review-card">
        <span class="review-stars" aria-label="${review.rating} out of 5 stars">${stars(review.rating)}</span>
        <p>“${review.text}”</p>
        <footer>
          <span class="review-avatar" aria-hidden="true">${review.name.charAt(0)}</span>
          <span><strong>${review.name}</strong><small>${review.car} · ${review.service}</small></span>
        </footer>
      </article>`
    )
    .join("");

  const scrollByCard = (direction) => {
    const card = track.querySelector(".review-card");
    track.scrollBy({ left: direction * (card.offsetWidth + 20), behavior: prefersReducedMotion ? "auto" : "smooth" });
  };
  document.getElementById("review-prev").addEventListener("click", () => scrollByCard(-1));
  document.getElementById("review-next").addEventListener("click", () => scrollByCard(1));
}

function renderFaqList() {
  const list = document.querySelector(".faq-list");
  list.innerHTML = shopFaqs
    .map(
      (item) => `
      <details class="faq-item" data-reveal>
        <summary><span>${item.q}</span><span class="faq-icon"><iconify-icon icon="ph:plus-bold" aria-hidden="true"></iconify-icon></span></summary>
        <div class="faq-answer"><p>${item.a}</p></div>
      </details>`
    )
    .join("");

  // ek waqt mein ek hi sawal khula rahe
  list.addEventListener("toggle", (event) => {
    if (!event.target.open) return;
    list.querySelectorAll("details[open]").forEach((item) => { if (item !== event.target) item.open = false; });
  }, true);
}

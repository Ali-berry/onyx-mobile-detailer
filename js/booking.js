const bookingState = { step: 1, serviceId: null, sizeId: "medium", addOnIds: [], date: null, slot: null };
const totalBookingSteps = 4;

function setupBookingForm() {
  const form = document.getElementById("booking");
  renderServicePicker();
  renderBookingSizes();
  renderDatePicker();
  renderSlotPicker();
  updateBookingTotal();

  document.getElementById("booking-next").addEventListener("click", goToNextStep);
  document.getElementById("booking-back").addEventListener("click", () => showBookingStep(bookingState.step - 1));
  document.getElementById("booking-again").addEventListener("click", resetBooking);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    goToNextStep();
  });

  form.addEventListener("input", (event) => {
    if (event.target.name) clearFieldError(event.target.name);
  });
}

function renderServicePicker() {
  const picker = document.getElementById("service-picker");
  picker.innerHTML = services
    .map(
      (service) => `
      <label class="service-option">
        <input type="radio" name="service" value="${service.id}">
        <span class="service-option-body">
          <iconify-icon icon="${service.icon}" aria-hidden="true"></iconify-icon>
          <strong>${service.name}</strong>
          <small>${service.time}</small>
          <span class="service-option-price" data-booking-price="${service.id}">${formatPrice(service.price)}</span>
        </span>
      </label>`
    )
    .join("");

  picker.addEventListener("change", (event) => {
    bookingState.serviceId = event.target.value;
    clearFieldError("service");
    updateBookingTotal();
  });
}

function renderBookingSizes() {
  const picker = document.getElementById("booking-sizes");
  picker.innerHTML = carSizes
    .map(
      (size) => `
      <label class="size-chip">
        <input type="radio" name="size" value="${size.id}" ${size.id === bookingState.sizeId ? "checked" : ""}>
        <span>${size.label}</span>
      </label>`
    )
    .join("");
  picker.addEventListener("change", (event) => {
    bookingState.sizeId = event.target.value;
    updateBookingTotal();
  });
}

// package builder se aaye to package, size aur add-ons sab saath aate hain
function preselectBookingService(serviceId, sizeId, addOnIds) {
  const option = document.querySelector(`#service-picker input[value="${serviceId}"]`);
  if (!option) return;
  option.checked = true;
  bookingState.serviceId = serviceId;
  if (sizeId) {
    bookingState.sizeId = sizeId;
    const sizeInput = document.querySelector(`#booking-sizes input[value="${sizeId}"]`);
    if (sizeInput) sizeInput.checked = true;
  }
  if (addOnIds) bookingState.addOnIds = [...addOnIds];
  clearFieldError("service");
  updateBookingTotal();
}

function upcomingWorkDays(count) {
  const days = [];
  const day = new Date();
  day.setHours(12, 0, 0, 0);
  while (days.length < count) {
    day.setDate(day.getDate() + 1);
    if (day.getDay() !== 0) days.push(new Date(day));
  }
  return days;
}

function renderDatePicker() {
  const picker = document.getElementById("date-picker");
  picker.innerHTML = upcomingWorkDays(10)
    .map((day) => {
      const value = day.toISOString().slice(0, 10);
      const weekday = day.toLocaleDateString("en-GB", { weekday: "short" });
      const dateText = day.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      return `<button class="date-chip" type="button" data-date="${value}" aria-pressed="false"><span>${weekday}</span><strong>${dateText}</strong></button>`;
    })
    .join("");

  picker.addEventListener("click", (event) => {
    const chip = event.target.closest(".date-chip");
    if (!chip) return;
    bookingState.date = chip.dataset.date;
    bookingState.slot = null;
    picker.querySelectorAll(".date-chip").forEach((item) => item.setAttribute("aria-pressed", String(item === chip)));
    renderSlotPicker();
  });
}

function renderSlotPicker() {
  const picker = document.getElementById("slot-picker");
  if (!bookingState.date) {
    picker.innerHTML = `<p class="muted small">Choose a day to see free arrival times.</p>`;
    return;
  }
  // demo: kuch slots "full" dikhate hain taake form asli lage
  const seed = Number(bookingState.date.slice(-2));
  const isSaturday = new Date(`${bookingState.date}T12:00:00`).getDay() === 6;
  const slots = isSaturday ? bookingSlots.slice(0, 4) : bookingSlots;

  picker.innerHTML = slots
    .map((slot, index) => {
      const isFull = (seed + index) % 4 === 0;
      return `<button class="slot-chip" type="button" data-slot="${slot}" aria-pressed="false" ${isFull ? "disabled" : ""}>${slot}${isFull ? " · full" : ""}</button>`;
    })
    .join("");

  picker.onclick = (event) => {
    const chip = event.target.closest(".slot-chip");
    if (!chip || chip.disabled) return;
    bookingState.slot = chip.dataset.slot;
    clearFieldError("slot");
    picker.querySelectorAll(".slot-chip").forEach((item) => item.setAttribute("aria-pressed", String(item === chip)));
  };
}

function showFieldError(name, message) {
  const error = document.querySelector(`[data-error-for="${name}"]`);
  if (error) error.textContent = message;
  const field = document.querySelector(`#booking [name="${name}"]:not([type="radio"])`);
  if (field) field.setAttribute("aria-invalid", "true");
}

function clearFieldError(name) {
  const error = document.querySelector(`[data-error-for="${name}"]`);
  if (error) error.textContent = "";
  const field = document.querySelector(`#booking [name="${name}"]:not([type="radio"])`);
  if (field) field.removeAttribute("aria-invalid");
}

function validateBookingStep(step) {
  const form = document.getElementById("booking");
  const problems = [];
  const value = (name) => form.elements[name].value.trim();

  if (step === 1 && !bookingState.serviceId) problems.push(["service", "Pick a detail to continue."]);
  if (step === 2) {
    if (!value("make")) problems.push(["make", "Add the make."]);
    if (!value("model")) problems.push(["model", "Add the model."]);
    if (!value("street")) problems.push(["street", "Where should we come?"]);
    const coverage = findCoverage(value("postcode"));
    if (!coverage.valid) problems.push(["postcode", "Add a UK postcode, e.g. LS8 2PF."]);
    else if (!coverage.zone) problems.push(["postcode", `${coverage.area.outward} is outside our area. WhatsApp us and we'll try.`]);
  }
  if (step === 3 && (!bookingState.date || !bookingState.slot)) problems.push(["slot", "Choose a day and a time."]);
  if (step === 4) {
    if (!value("name")) problems.push(["name", "Add your name."]);
    if (value("phone").replace(/\D/g, "").length < 10) problems.push(["phone", "Add a mobile number so we can text you."]);
    const email = value("email");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push(["email", "That email doesn't look right."]);
  }

  problems.forEach(([name, message]) => showFieldError(name, message));
  if (problems.length) {
    const first = form.querySelector(`[name="${problems[0][0]}"]:not([type="radio"])`) || form.querySelector(`.booking-step[data-step="${step}"] legend`);
    if (first && first.focus) first.focus({ preventScroll: false });
  }
  return problems.length === 0;
}

function goToNextStep() {
  if (!validateBookingStep(bookingState.step)) return;
  if (bookingState.step === totalBookingSteps) {
    finishBooking();
    return;
  }
  showBookingStep(bookingState.step + 1);
}

function showBookingStep(step) {
  bookingState.step = step;
  document.querySelectorAll(".booking-step").forEach((panel) => {
    const isActive = Number(panel.dataset.step) === step;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });
  document.querySelectorAll(".booking-progress li").forEach((item, index) => {
    item.classList.toggle("is-current", index + 1 === step);
    item.classList.toggle("is-done", index + 1 < step);
  });

  document.getElementById("booking-back").hidden = step === 1;
  const next = document.getElementById("booking-next");
  next.firstChild.textContent = step === totalBookingSteps ? "Confirm booking " : "Continue ";
  updateBookingTotal();
  if (step === totalBookingSteps) renderBookingSummary();

  const panel = document.querySelector(`.booking-step[data-step="${step}"]`);
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.fromTo(panel, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" });
  }
  panel.querySelector("legend").scrollIntoView({ block: "nearest" });
}

function updateBookingTotal() {
  // har package pe is size ka price
  services.forEach((pack) => {
    const price = quoteFor({ sizeId: bookingState.sizeId, packageId: pack.id, addOnIds: [] }).base;
    document.querySelector(`[data-booking-price="${pack.id}"]`).textContent = formatPrice(price);
  });
  if (!bookingState.serviceId) {
    document.getElementById("booking-total").textContent = "";
    return;
  }
  const quote = quoteFor({ sizeId: bookingState.sizeId, packageId: bookingState.serviceId, addOnIds: bookingState.addOnIds });
  const extras = quote.extras.length ? ` + ${quote.extras.length} add-on${quote.extras.length > 1 ? "s" : ""}` : "";
  document.getElementById("booking-total").innerHTML = `${quote.pack.name}${extras} · <strong>${formatPrice(quote.total)}</strong>`;
}

function readableBookingDate() {
  return new Date(`${bookingState.date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

function renderBookingSummary() {
  const form = document.getElementById("booking");
  const quote = quoteFor({ sizeId: bookingState.sizeId, packageId: bookingState.serviceId, addOnIds: bookingState.addOnIds });
  const car = [form.elements.make.value, form.elements.model.value].filter(Boolean).join(" ");
  const place = `${form.elements.street.value}, ${form.elements.postcode.value.toUpperCase()}`;
  const extras = quote.extras.map((item) => item.name).join(", ");

  document.getElementById("booking-summary").innerHTML = `
    <h4>Check your booking</h4>
    <dl>
      <dt>Detail</dt><dd>${quote.pack.name}${extras ? ` + ${escapeText(extras)}` : ""}</dd>
      <dt>Car</dt><dd>${escapeText(car)} · ${quote.size.label}</dd>
      <dt>Where</dt><dd>${escapeText(place)} · ${escapeText(form.elements.spot.value)}</dd>
      <dt>When</dt><dd>${readableBookingDate()} at ${bookingState.slot}</dd>
      <dt>Total</dt><dd><strong>${formatPrice(quote.total)}</strong>, paid when it's done</dd>
    </dl>`;
}

function escapeText(text) {
  const holder = document.createElement("span");
  holder.textContent = text;
  return holder.innerHTML;
}

function finishBooking() {
  const form = document.getElementById("booking");
  const firstName = form.elements.name.value.trim().split(" ")[0];
  const reference = `ONX-${Math.floor(1000 + Math.random() * 9000)}`;

  // Demo: asli site pe yahan booking email / WhatsApp / Google Sheet ko jayegi
  document.querySelectorAll(".booking-step, .booking-progress, #booking-nav").forEach((item) => { item.hidden = true; });
  const done = document.getElementById("booking-done");
  document.getElementById("booking-done-text").textContent =
    `Thanks ${firstName}. We've pencilled you in for ${readableBookingDate()} at ${bookingState.slot}. We'll text you the evening before.`;
  document.getElementById("booking-ref").textContent = reference;
  done.hidden = false;
  done.focus();
}

function resetBooking() {
  const form = document.getElementById("booking");
  form.reset();
  Object.assign(bookingState, { step: 1, serviceId: null, sizeId: "medium", addOnIds: [], date: null, slot: null });
  document.querySelector('#booking-sizes input[value="medium"]').checked = true;
  document.getElementById("booking-done").hidden = true;
  document.querySelectorAll(".booking-progress, #booking-nav").forEach((item) => { item.hidden = false; });
  document.querySelectorAll(".date-chip").forEach((item) => item.setAttribute("aria-pressed", "false"));
  renderSlotPicker();
  updateBookingTotal();
  showBookingStep(1);
}

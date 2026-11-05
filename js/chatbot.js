// Asli AI ke liye: apna backend ya n8n webhook URL yahan daalo jo { reply } return kare.
// API key kabhi bhi is file mein mat rakhna, browser mein sab ko nazar aati hai.
const chatbotSettings = {
  aiEndpoint: "",
};

const chatElements = {
  root: document.getElementById("chat"),
  toggle: document.getElementById("chat-toggle"),
  panel: document.getElementById("chat-panel"),
  close: document.getElementById("chat-close"),
  log: document.getElementById("chat-log"),
  form: document.getElementById("chat-form"),
  input: document.getElementById("chat-input"),
  suggestions: document.getElementById("chat-suggestions"),
};

const starterQuestions = ["Do you cover LS6?", "Pet hair in the boot", "Do you need my water?", "Prices"];
const chatHistory = [];
let hasGreeted = false;

chatElements.toggle.addEventListener("click", openChat);
chatElements.close.addEventListener("click", closeChat);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !chatElements.panel.hidden) closeChat();
});

chatElements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = chatElements.input.value.trim();
  if (!message) return;
  chatElements.input.value = "";
  handleUserMessage(message);
});

chatElements.suggestions.addEventListener("click", (event) => {
  const chip = event.target.closest("button");
  if (chip) handleUserMessage(chip.textContent);
});

function openChat() {
  chatElements.panel.hidden = false;
  chatElements.root.classList.add("is-open");
  chatElements.toggle.setAttribute("aria-expanded", "true");
  if (!hasGreeted) {
    hasGreeted = true;
    addChatMessage("bot", `Hi, this is the ${shopInfo.name} assistant. Ask me about prices, the areas we cover, or what your car needs.`);
    showSuggestions(starterQuestions);
  }
  chatElements.input.focus();
}

function closeChat() {
  chatElements.panel.hidden = true;
  chatElements.root.classList.remove("is-open");
  chatElements.toggle.setAttribute("aria-expanded", "false");
  chatElements.toggle.focus();
}

function addChatMessage(sender, text) {
  const bubble = document.createElement("p");
  bubble.className = `chat-msg from-${sender}`;
  bubble.textContent = text;
  chatElements.log.appendChild(bubble);
  chatElements.log.scrollTop = chatElements.log.scrollHeight;
  chatHistory.push({ role: sender === "user" ? "user" : "assistant", content: text });
  return bubble;
}

function showSuggestions(options) {
  chatElements.suggestions.innerHTML = options
    .map((option) => `<button class="chip" type="button">${option}</button>`)
    .join("");
}

async function handleUserMessage(message) {
  addChatMessage("user", message);
  chatElements.suggestions.innerHTML = "";

  const typing = document.createElement("p");
  typing.className = "chat-msg from-bot is-typing";
  typing.textContent = "Typing…";
  chatElements.log.appendChild(typing);
  chatElements.log.scrollTop = chatElements.log.scrollHeight;

  const reply = await getBotReply(message);
  typing.remove();
  addChatMessage("bot", reply.text);
  showSuggestions(reply.suggestions || ["Book a slot", "Prices"]);
}

async function getBotReply(message) {
  if (chatbotSettings.aiEndpoint) {
    try {
      const response = await fetch(chatbotSettings.aiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: chatHistory.slice(-10), shop: shopInfo, services, carProblems }),
      });
      const data = await response.json();
      if (data.reply) return { text: data.reply };
    } catch (error) {
      // AI band ho to neeche wala local jawab chal jayega
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 450));
  return answerFromShopInfo(message.toLowerCase());
}

function answerFromShopInfo(text) {
  const hasWord = (...words) => words.some((word) => text.includes(word));

  if (hasWord("open booking form")) {
    scrollToSection(document.getElementById("book"));
    return { text: "Taking you there now." };
  }

  // postcode likha ho to seedha coverage check
  const postcode = text.toUpperCase().match(/\b([A-Z]{2}\d{1,2})(\s?\d[A-Z]{2})?\b/);
  if (postcode && readPostcodeArea(postcode[1])) {
    const check = findCoverage(postcode[1]);
    return check.zone
      ? { text: `Yes, ${check.area.outward} is in our ${check.zone.name} area. We'll come to your driveway or the street outside.`, suggestions: ["Book a slot", "Prices"] }
      : { text: `${check.area.outward} is just outside our usual area. Send us a WhatsApp on ${shopInfo.phone} and we'll see if we can fit you in.`, suggestions: ["Which areas?", "Prices"] };
  }
  // pehle masla dhoondo (pet hair, swirls...), phir package naam
  const matchedProblem = carProblems.find((problem) => problem.keywords.some((keyword) => text.includes(keyword)));
  if (matchedProblem && !hasWord("price", "cost", "how much")) {
    const service = findServiceById(matchedProblem.service);
    return {
      text: `${matchedProblem.cause}\n\n${matchedProblem.fix} ${service.name} starts from ${formatPrice(service.price)} for a small car and takes about ${service.time}.`,
      suggestions: ["Book a slot", "Prices"],
    };
  }

  if (hasWord("area", "cover", "come to", "postcode", "where do", "where are", "leeds", "bradford", "wakefield")) {
    const list = coverageAreas.map((zone) => `${zone.name}: ${zone.prefix}${zone.from}–${zone.prefix}${zone.to}`).join("\n");
    return { text: `We come to you in:\n${list}\n\nType your postcode here and I'll check it.` };
  }
  if (hasWord("water", "electric", "power", "socket", "tap", "hose")) {
    return { text: shopFaqs[0].a, suggestions: ["Which areas?", "Book a slot"] };
  }
  if (hasWord("rain", "weather")) {
    return { text: shopFaqs[1].a };
  }
  if (hasWord("book", "appointment", "slot", "reserve", "available")) {
    return {
      text: `Use the booking form at the bottom of the page. It takes about a minute, and no deposit is needed. Or text ${shopInfo.phone}.`,
      suggestions: ["Open booking form", "Prices"],
    };
  }
  if (hasWord("hours", "today", "sunday", "saturday", "what time", "open")) {
    const hours = shopInfo.hours.map(([days, time]) => `${days}: ${time}`).join("\n");
    return { text: `We're out on the road:\n${hours}` };
  }
  if (hasWord("phone", "call", "number", "whatsapp", "contact")) {
    return { text: `Call or WhatsApp ${shopInfo.phone}, or email ${shopInfo.email}.` };
  }
  if (hasWord("pay", "card", "cash", "deposit")) {
    return { text: "No deposit. You pay by card or bank transfer once you've walked round the car with us." };
  }

  const matchedService = services.find((service) => text.includes(service.id) || text.includes(service.name.toLowerCase().split(" ")[0]));
  if (matchedService) {
    return {
      text: `${matchedService.name}: from ${formatPrice(matchedService.price)}, about ${matchedService.time}. ${matchedService.text}`,
      suggestions: ["Book a slot", "Other prices"],
    };
  }

  if (hasWord("price", "cost", "how much", "prices", "rate", "charge")) {
    const list = services.map((service) => `${service.name}: from ${formatPrice(service.price)}`).join("\n");
    return { text: `Prices for a small car (medium +15%, large/SUV +30%):\n${list}\n\nThe package builder on the page shows your exact price.` };
  }

  if (hasWord("hi", "hello", "hey", "salam")) {
    return { text: "Hello! Ask me about prices, the areas we cover, or something specific like pet hair or swirls.", suggestions: starterQuestions };
  }

  return {
    text: `I'm not sure about that one. Message us on ${shopInfo.phone} and the detailer will answer. Or ask me about prices, areas or a problem with the car.`,
    suggestions: starterQuestions,
  };
}

// tools/build_hero.py jo "WIPES" print karta hai wahi yahan aate hain
const storyFrames = {
  count: 271,
  folder: window.innerWidth < 768 ? "assets/frames/mobile" : "assets/frames/desktop",
  wipes: [
    { start: 50, length: 19 },
    { start: 119, length: 17 },
    { start: 166, length: 17 },
    { start: 212, length: 17 },
  ],
};

// har caption kis frame pe aata hai aur kis pe jata hai
const storyCaptions = [
  { selector: ".caption-1", show: 0, hide: 20 },
  { selector: ".caption-2", show: 30, hide: 52 },
  { selector: ".caption-3", show: 70, hide: 92 },
  { selector: ".caption-4", show: 104, hide: 140 },
  { selector: ".caption-5", show: 152, hide: 190 },
  { selector: ".caption-6", show: 200, hide: 236 },
  { selector: ".caption-7", show: 248, hide: null },
];
const storyStages = [
  { start: 0, label: "Arrive" },
  { start: 69, label: "Foam" },
  { start: 100, label: "Wash" },
  { start: 150, label: "Wheels" },
  { start: 196, label: "Interior" },
  { start: 242, label: "Gloss" },
];

const storyState = { frame: 0, images: [], loaded: 0, lastDrawn: -1 };

function frameUrl(index) {
  return `${storyFrames.folder}/f${String(index + 1).padStart(3, "0")}.webp`;
}

function preloadStoryFrames(onProgress) {
  return new Promise((resolve) => {
    let finished = false;
    const done = () => {
      if (!finished) {
        finished = true;
        resolve();
      }
    };
    // dheemi connection pe 8 second baad bhi page khol do, baaki frames peeche load hote rahenge
    setTimeout(done, 8000);

    for (let i = 0; i < storyFrames.count; i++) {
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => {
        storyState.loaded++;
        onProgress(storyState.loaded / storyFrames.count);
        if (storyState.loaded === storyFrames.count) done();
        if (i === Math.round(storyState.frame)) drawStoryFrame(true);
      };
      img.src = frameUrl(i);
      storyState.images[i] = img;
    }
  });
}

function nearestLoadedFrame(index) {
  for (let offset = 0; offset < storyFrames.count; offset++) {
    const before = storyState.images[index - offset];
    if (before && before.complete && before.naturalWidth) return before;
    const after = storyState.images[index + offset];
    if (after && after.complete && after.naturalWidth) return after;
  }
  return null;
}

function resizeStoryCanvas() {
  const canvas = document.getElementById("story-canvas");
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(canvas.clientWidth * ratio);
  canvas.height = Math.round(canvas.clientHeight * ratio);
  drawStoryFrame(true);
}

function drawStoryFrame(force = false) {
  const index = Math.round(storyState.frame);
  if (!force && index === storyState.lastDrawn) return;
  const img = nearestLoadedFrame(index);
  if (!img) return;
  storyState.lastDrawn = index;

  const canvas = document.getElementById("story-canvas");
  const context = canvas.getContext("2d");
  // object-fit: cover jaisa hisaab, taake har screen pe frame poora bhare
  const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
  const drawWidth = img.naturalWidth * scale;
  const drawHeight = img.naturalHeight * scale;
  context.drawImage(img, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);

  moveScanLine(index, canvas, drawWidth);
}

// kai wipes hain; jis wipe ke andar frame ho, line usi ke kinare pe chalti hai
function moveScanLine(index, canvas, drawWidth) {
  const line = document.getElementById("scan-line");
  const wipe = storyFrames.wipes.find((item) => index >= item.start && index < item.start + item.length);
  if (!wipe) {
    line.style.opacity = "0";
    return;
  }
  // frames builder wala hi ease, taake line wipe ke kinare pe hi rahe
  const t = (index - wipe.start + 1) / wipe.length;
  const eased = 0.5 - 0.5 * Math.cos(Math.PI * t);
  const cssWidth = canvas.clientWidth;
  const drawnCss = drawWidth / (canvas.width / cssWidth);
  const x = eased * drawnCss - (drawnCss - cssWidth) / 2;
  line.style.opacity = "1";
  line.style.transform = `translateX(${x}px)`;
}

function setupFrameStory() {
  document.documentElement.classList.add("has-story");
  resizeStoryCanvas();
  window.addEventListener("resize", resizeStoryCanvas);

  const stepItems = document.querySelectorAll(".story-steps li");
  const glossValue = document.getElementById("gloss-value");
  const glossFill = document.getElementById("gloss-fill");
  const glossStage = document.getElementById("gloss-stage");
  const lastFrame = storyFrames.count - 1;

  const story = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: ".story",
      start: "top top",
      end: "+=760%",
      pin: ".story-stage",
      scrub: 0.6,
      onUpdate: (self) => {
        const frame = self.progress * lastFrame;
        let active = 0;
        storyStages.forEach((stage, i) => { if (frame >= stage.start) active = i; });
        stepItems.forEach((item, i) => item.classList.toggle("is-active", i === active));
        glossValue.textContent = Math.round(self.progress * 100);
        glossFill.style.transform = `scaleY(${self.progress})`;
        glossStage.textContent = storyStages[active].label;
      },
    },
  });

  story.to(storyState, { frame: lastFrame, duration: lastFrame, onUpdate: () => drawStoryFrame() }, 0);
  story.to(".scroll-hint", { autoAlpha: 0, duration: 6 }, 2);

  storyCaptions.forEach(({ selector, show, hide }) => {
    if (show > 0) {
      story.fromTo(selector, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 7, ease: "power2.out" }, show);
    }
    if (hide !== null) {
      story.to(selector, { autoAlpha: 0, y: -36, duration: 7, ease: "power2.in" }, hide);
    }
  });
}

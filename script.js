const SCREENS = {
  welcome: "screen-welcome",
  intro: "screen-intro",
  home: "screen-home",
};

const TYPING_TEXT = "Hi I am Rajan Kumar";
const WELCOME_DURATION_MS = 2000; // required: 2s
const TYPING_SPEED_MS = 75;

const $ = (id) => document.getElementById(id);

const audio = {
  intro: () => $("audioIntro"),
  click: () => $("audioClick"),
  pop: () => $("audioPop"),
};

let userAudioUnlocked = false;
let typingTimer = null;

function setScreen(screenKey) {
  const nextId = SCREENS[screenKey];
  Object.values(SCREENS).forEach((id) => {
    const el = $(id);
    if (!el) return;
    el.classList.toggle("screen--active", id === nextId);
  });
}

function safePlay(el) {
  if (!el) return Promise.resolve(false);
  try {
    el.currentTime = 0;
    const p = el.play();
    if (p && typeof p.then === "function") {
      return p.then(() => true).catch(() => false);
    }
    return Promise.resolve(true);
  } catch {
    return Promise.resolve(false);
  }
}

async function unlockAudio() {
  if (userAudioUnlocked) return;
  userAudioUnlocked = true;

  // “Warm” sounds so later clicks are instant.
  await safePlay(audio.click());
  if (audio.click()) audio.click().pause();
  await safePlay(audio.pop());
  if (audio.pop()) audio.pop().pause();
}

function playSound(kind) {
  const el = kind === "pop" ? audio.pop() : audio.click();
  safePlay(el);
}

function clearTyping() {
  if (typingTimer) {
    clearTimeout(typingTimer);
    typingTimer = null;
  }
}

function startTyping() {
  clearTyping();
  const target = $("typingText");
  if (!target) return;

  target.textContent = "";
  let idx = 0;

  const tick = () => {
    target.textContent += TYPING_TEXT.charAt(idx);
    idx += 1;
    if (idx < TYPING_TEXT.length) {
      typingTimer = setTimeout(tick, TYPING_SPEED_MS);
    }
  };

  tick();
}

async function startIntroAudio() {
  // required: auto-play sounds/intro.mp3
  // Browsers may block autoplay; if blocked, we’ll retry after the first user gesture.
  const ok = await safePlay(audio.intro());
  return ok;
}

function goToIntro({ replayAudio = true } = {}) {
  setScreen("intro");
  startTyping();
  if (replayAudio) startIntroAudio();
}

function goToHome() {
  setScreen("home");
}

function openModal(src) {
  const modal = $("modal");
  const img = $("modalImg");
  if (!modal || !img) return;
  img.src = src;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = $("modal");
  const img = $("modalImg");
  if (!modal || !img) return;
  modal.classList.add("hidden");
  img.removeAttribute("src");
  document.body.style.overflow = "";
}

function bindSoundDelegation() {
  // Buttons: click.wav (blue glow)
  // Cards: pop-click.wav (purple glow)
  // Icons: click.wav by default
  document.addEventListener("click", async (e) => {
    const target = e.target.closest("[data-sound]");
    if (!target) return;

    await unlockAudio();
    const kind = target.getAttribute("data-sound") || "click";
    playSound(kind === "pop" ? "pop" : "click");
  });
}

function bindWelcomeFlow() {
  setScreen("welcome");

  // If user clicks during welcome, unlock audio early and try intro audio again.
  document.addEventListener(
    "pointerdown",
    async () => {
      await unlockAudio();
      // attempt intro audio once unlocked (even if still on welcome)
      startIntroAudio();
    },
    { once: true }
  );

  setTimeout(() => {
    goToIntro({ replayAudio: true });
  }, WELCOME_DURATION_MS);
}

function bindIntroControls() {
  const btnViewWork = $("btn-view-work");
  const btnSkip = $("btn-skip");

  btnViewWork?.addEventListener("click", () => goToHome());
  btnSkip?.addEventListener("click", () => goToHome());
}

function bindHomeControls() {
  const btnReplay = $("btn-replay");
  btnReplay?.addEventListener("click", () => {
    // restart audio from beginning
    if (audio.intro()) audio.intro().currentTime = 0;
    goToIntro({ replayAudio: true });
  });

  // “Coming soon” card: do nothing besides click sound.
  document.querySelectorAll("[data-soon='true']").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  // Gallery: click -> full-screen popup with click.wav
  const grid = $("galleryGrid");
  grid?.addEventListener("click", (e) => {
    const tile = e.target.closest(".gallery-tile");
    if (!tile) return;
    const full = tile.getAttribute("data-full");
    if (!full) return;
    openModal(full);
  });
}

function bindModalControls() {
  const modal = $("modal");
  const closeBtn = $("modalClose");

  closeBtn?.addEventListener("click", () => closeModal());

  modal?.addEventListener("click", (e) => {
    // click outside image closes
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Fail-safe: never get stuck on Welcome.
  setTimeout(() => {
    try {
      const isWelcomeActive = $(SCREENS.welcome)?.classList.contains("screen--active");
      if (isWelcomeActive) goToIntro({ replayAudio: true });
    } catch {
      // ignore
    }
  }, WELCOME_DURATION_MS + 50);

  bindSoundDelegation();
  bindWelcomeFlow();
  bindIntroControls();
  bindHomeControls();
  bindModalControls();
});
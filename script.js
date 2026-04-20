const SCREENS = {
    welcome: "screen-welcome",
    intro: "screen-intro",
    home: "screen-home",
};

const TYPING_TEXT = "Hi, I am Rajan Kumar. Designer & Creator.";
const WELCOME_DURATION = 2500;
const TYPING_SPEED = 60;

const $ = (id) => document.getElementById(id);

function setScreen(screenKey) {
    const targetId = SCREENS[screenKey];
    Object.values(SCREENS).forEach(id => {
        const el = $(id);
        if (el) {
            el.classList.remove("screen--active");
            el.style.display = "none";
        }
    });
    const target = $(targetId);
    if (target) {
        target.style.display = (screenKey === 'home') ? "block" : "flex";
        setTimeout(() => target.classList.add("screen--active"), 50);
    }
}

function playSound(id) {
    const sfx = $(id);
    if (sfx) {
        sfx.currentTime = 0;
        sfx.volume = 0.3;
        sfx.play().catch(e => console.log("Sound blocked by browser"));
    }
}

function startTyping() {
    const el = $("typingText");
    if (!el) return;
    el.textContent = "";
    let i = 0;
    function type() {
        if (i < TYPING_TEXT.length) {
            el.textContent += TYPING_TEXT[i];
            i++;
            setTimeout(type, TYPING_SPEED);
        }
    }
    type();
}

// APP FLOW
document.addEventListener("DOMContentLoaded", () => {
    // Start with Welcome
    setScreen("welcome");

    // Move to Intro
    setTimeout(() => {
        setScreen("intro");
        startTyping();
        playSound("audioIntro");
    }, WELCOME_DURATION);

    // View Work Click
    $("btn-view-work")?.addEventListener("click", () => {
        playSound("audioClick");
        setScreen("home");
        document.body.style.overflow = "auto"; // Enable scroll for work
    });

    // Skip Click
    $("btn-skip")?.addEventListener("click", () => {
        playSound("audioClick");
        setScreen("home");
        document.body.style.overflow = "auto";
    });

    // Card Sounds
    document.querySelectorAll(".work-card").forEach(card => {
        card.addEventListener("click", () => {
            if (!card.classList.contains("work-card--soon")) {
                playSound("audioPop");
            }
        });
    });
});

(function () {
  "use strict";

  const GOOGLE_SEARCH = "https://www.google.com/search?q=";
  const FINAL_LINE = "Don’t let the feed farm you… farming Google for you to find the answer.";
  const STATUS_POOL = [
    "Converting your question to JSON to confuse you…",
    "Tokenizing the tokens…",
    "Checking 8 billion model parameters… None of them know.",
    "Consulting the cloud… Weather API unavailable.",
    "Checking if Bing would help… Wrong answers always.",
    "Adding an unnecessary em dash—complete.",
    "Increasing model confidence… Suspiciously high.",
    "Searching for the search engine… Found it.",
    "Downloading more RAM… Complete.",
    "Removing hallucinations… Error: created more.",
    "Downloading the entire internet… You are out of disk space.",
    "Generating a thoughtful answer… Redirecting instead.",
    "Loading empathy module… Module failed.",
    "Reading the flipping manual… answer found.",
    "Checking if rubber duck was added to the support support ticket.",
    "Ask better questions… Helping with this one anyway.",
    "The way not found… creating the way.",
    "Working with reality, not against it… Reality involves searching.",
    "Hack the problem… Opening the easiest available tool.",
    "Skill is built, not wished for… Search skill still in development.",
    "Those can’t do teach… because those who can’t do learn.",
    "Requestion the question… will redirect you to find the requestion.",
    "Progress over perfection… almost there…",
    "Asking Gemini for a gem… Complete.",
    "Uninstalling Linux Mint… Complete."
  ];

  function init() {
    const app = document.getElementById("app");
    const form = document.querySelector("[data-form]");
    const input = document.getElementById("query");
    if (!app || !form || !input) return;

    const submit = form.querySelector('[type="submit"]');
    const copy = document.querySelector("[data-copy]");
    const clear = document.querySelector("[data-clear]");
    const soundToggle = document.querySelector("[data-sound]");
    const validation = document.querySelector("[data-validation]");
    const processor = document.querySelector("[data-processor]");
    const progress = document.querySelector("[data-progress]");
    const progressFill = document.querySelector("[data-progress-fill]");
    const percent = document.querySelector("[data-percent]");
    const statusLog = document.querySelector("[data-status]");
    const googleLink = document.querySelector("[data-google-link]");
    const shareOutput = document.querySelector("[data-share-output]");
    const brandCursor = document.querySelector("[data-brand-cursor]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    let timers = [];
    let currentQuery = "";
    let soundEnabled = true;
    let audioContext = null;
    let cursorTargetX = 0;
    let cursorTargetY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let cursorResponsiveness = 0.42;
    let cursorReady = false;
    let cursorAutopilot = false;

    const clean = value => String(value || "").trim().replace(/\s+/g, " ").slice(0, 300);
    const googleUrl = query => GOOGLE_SEARCH + encodeURIComponent(query);
    const shareUrl = query => {
      const url = new URL(window.location.href);
      url.search = "";
      url.hash = "";
      if (query) url.searchParams.set("q", query);
      return url.toString();
    };
    const later = (callback, delay) => {
      const id = window.setTimeout(callback, delay);
      timers.push(id);
      return id;
    };
    const clearTimers = () => {
      timers.forEach(window.clearTimeout);
      timers = [];
    };

    function ensureAudio() {
      if (!soundEnabled) return null;
      try {
        if (!audioContext) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!AudioContext) return null;
          audioContext = new AudioContext();
        }
        if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
        return audioContext;
      } catch (_error) {
        return null;
      }
    }

    function playTypingSound(character) {
      if (!soundEnabled || !character || /\s/.test(character)) return;
      const context = ensureAudio();
      if (!context || context.state !== "running") return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(390 + Math.random() * 170, now);
      gain.gain.setValueAtTime(0.012, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.026);
    }

    function shuffledStatuses() {
      const pool = [...STATUS_POOL];
      for (let index = pool.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(Math.random() * (index + 1));
        [pool[index], pool[swap]] = [pool[swap], pool[index]];
      }
      return ["Booting up the server…", ...pool.slice(0, 7), "Preparing one expertly phrased search…", "Rewriting to teh original question…", FINAL_LINE];
    }

    function setProgress(value) {
      const bounded = Math.max(0, Math.min(100, value));
      progressFill.style.transform = `scaleX(${bounded / 100})`;
      progress.setAttribute("aria-valuenow", String(Math.round(bounded)));
      percent.textContent = `${Math.round(bounded)}%`;
      cursorResponsiveness = 0.42 - (bounded / 100) * 0.385;
      brandCursor?.style.setProperty("--cursor-spin-speed", `${0.72 + (bounded / 100) * 2.2}s`);
    }

    function updateInput() {
      validation.hidden = true;
    }

    function moveCursorTo(element, xRatio = 0.5, yRatio = 0.5) {
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      cursorTargetX = bounds.left + bounds.width * xRatio;
      cursorTargetY = bounds.top + bounds.height * yRatio;
    }

    function beginRedirect(query, delay = 1500) {
      clearTimers();
      currentQuery = clean(query);
      const destination = googleUrl(currentQuery);
      googleLink.href = destination;
      app.dataset.state = "searching";
      brandCursor?.classList.remove("is-working", "is-autopilot");
      brandCursor?.classList.add("is-searching");

      if (!reducedMotion && finePointer && brandCursor) {
        cursorAutopilot = true;
        cursorResponsiveness = 0.075;
        moveCursorTo(googleLink, 0.5, 0.5);
        later(() => { cursorTargetY += 6; }, 280);
      }
      later(() => window.location.assign(destination), reducedMotion ? 100 : delay);
    }

    function appendStatus(message, onComplete) {
      const line = document.createElement("p");
      const marker = document.createElement("span");
      const text = document.createElement("span");
      line.className = "status-line is-active";
      marker.className = "status-marker";
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = "✦";
      line.append(marker, text);
      statusLog.append(line);
      statusLog.scrollTop = statusLog.scrollHeight;
      let index = 0;

      const typeNext = () => {
        if (index >= message.length) {
          line.classList.remove("is-active");
          line.classList.add("is-complete");
          later(onComplete, 900);
          return;
        }
        const character = message[index];
        text.textContent += character;
        if (index % 2 === 0) playTypingSound(character);
        index += 1;
        statusLog.scrollTop = statusLog.scrollHeight;
        later(typeNext, reducedMotion ? 2 : 24 + Math.random() * 28);
      };
      typeNext();
    }

    function runStatuses(query, messages, index) {
      if (index >= messages.length) {
        beginRedirect(query, 2200);
        return;
      }
      setProgress(((index + 1) / messages.length) * 100);
      appendStatus(messages[index], () => {
        later(() => runStatuses(query, messages, index + 1), index === messages.length - 1 ? 1700 : 250);
      });
    }

    function startThinking(query) {
      runStatuses(query, shuffledStatuses(), 0);
    }

    function demonstrate(rawQuery) {
      const query = clean(rawQuery);
      if (!query) {
        validation.hidden = false;
        input.focus();
        return;
      }

      clearTimers();
      currentQuery = query;
      window.history.replaceState(null, "", shareUrl(query));
      googleLink.href = googleUrl(query);
      input.disabled = true;
      submit.disabled = true;
      copy.disabled = true;
      clear.disabled = true;
      validation.hidden = true;
      processor.hidden = false;
      statusLog.replaceChildren();
      app.dataset.state = "working";
      brandCursor?.classList.remove("is-searching");
      brandCursor?.classList.add("is-working");
      setProgress(0);

      if (!reducedMotion && finePointer && brandCursor) {
        cursorAutopilot = true;
        cursorResponsiveness = 0.085;
        moveCursorTo(processor, 0.08, 0.08);
        later(() => { cursorTargetY += 8; }, 330);
        later(() => {
          cursorTargetY -= 8;
          cursorAutopilot = false;
          startThinking(query);
        }, 850);
      } else {
        later(() => startThinking(query), reducedMotion ? 0 : 350);
      }
    }

    function typeSharedQuery(query, index = 0) {
      if (index >= query.length) {
        later(() => {
          cursorResponsiveness = 0.075;
          moveCursorTo(submit);
        }, 650);
        later(() => { cursorTargetY += 6; }, 1450);
        later(() => demonstrate(query), 1750);
        return;
      }

      const character = query[index];
      input.value += character;
      playTypingSound(character);
      later(() => typeSharedQuery(query, index + 1), 62 + Math.random() * 58);
    }

    function stageSharedQuery(query) {
      input.value = "";
      if (reducedMotion || !brandCursor || !document.body.classList.contains("has-brand-cursor")) {
        input.value = query;
        demonstrate(query);
        return;
      }

      const mark = document.querySelector("[data-wordmark]").getBoundingClientRect();
      cursorAutopilot = true;
      cursorReady = true;
      cursorX = mark.right - 40;
      cursorY = mark.top + mark.height * 0.5;
      cursorTargetX = cursorX;
      cursorTargetY = cursorY;
      cursorResponsiveness = 0.08;
      brandCursor.classList.add("is-autopilot");

      later(() => moveCursorTo(input, 0.28), 450);
      later(() => { cursorTargetY += 7; }, 1450);
      later(() => {
        cursorTargetY -= 7;
        input.focus();
        typeSharedQuery(query);
      }, 1750);
    }

    async function copyLink() {
      const query = clean(input.value);
      if (!query) {
        validation.hidden = false;
        input.focus();
        return;
      }
      const url = shareUrl(query);
      try {
        await navigator.clipboard.writeText(url);
        copy.textContent = "SOS link copied";
      } catch (_error) {
        window.prompt("Copy this link:", url);
      }
      shareOutput.textContent = url;
      later(() => { copy.textContent = "SOS Lost"; }, 1600);
    }

    if (!reducedMotion && finePointer && brandCursor) {
      document.body.classList.add("has-brand-cursor");
      window.addEventListener("pointermove", event => {
        if (cursorAutopilot) return;
        cursorTargetX = event.clientX;
        cursorTargetY = event.clientY;
        if (!cursorReady) {
          cursorX = cursorTargetX;
          cursorY = cursorTargetY;
          cursorReady = true;
        }
      }, { passive: true });

      const animateCursor = () => {
        if (cursorReady) {
          cursorX += (cursorTargetX - cursorX) * cursorResponsiveness;
          cursorY += (cursorTargetY - cursorY) * cursorResponsiveness;
          brandCursor.style.left = `${cursorX}px`;
          brandCursor.style.top = `${cursorY}px`;
        }
        window.requestAnimationFrame(animateCursor);
      };
      window.requestAnimationFrame(animateCursor);
    }

    document.addEventListener("pointerdown", ensureAudio, { once: true, capture: true });
    document.addEventListener("keydown", ensureAudio, { once: true, capture: true });
    form.addEventListener("submit", event => {
      event.preventDefault();
      demonstrate(input.value);
    });
    input.addEventListener("input", updateInput);
    input.addEventListener("keydown", event => {
      if (event.key.length === 1) playTypingSound(event.key);
    });
    copy.addEventListener("click", copyLink);
    clear.addEventListener("click", () => {
      input.value = "";
      updateInput();
      input.focus();
    });
    soundToggle.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      soundToggle.setAttribute("aria-pressed", String(soundEnabled));
      soundToggle.title = soundEnabled ? "Typing sounds on" : "Typing sounds off";
      if (soundEnabled) {
        ensureAudio();
        playTypingSound("x");
      }
    });
    googleLink.addEventListener("click", event => {
      event.preventDefault();
      const query = currentQuery || clean(input.value);
      if (query) beginRedirect(query, 1150);
    });

    const initialQuery = clean(new URLSearchParams(window.location.search).get("q"));
    if (initialQuery) later(() => stageSharedQuery(initialQuery), reducedMotion ? 0 : 500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();

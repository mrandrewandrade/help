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
    const validation = document.querySelector("[data-validation]");
    const processor = document.querySelector("[data-processor]");
    const progress = document.querySelector("[data-progress]");
    const progressFill = document.querySelector("[data-progress-fill]");
    const percent = document.querySelector("[data-percent]");
    const status = document.querySelector("[data-status]");
    const googleLink = document.querySelector("[data-google-link]");
    const shareOutput = document.querySelector("[data-share-output]");
    const brandCursor = document.querySelector("[data-brand-cursor]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timers = [];
    let cursorTargetX = 0;
    let cursorTargetY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let cursorResponsiveness = 0.42;
    let cursorReady = false;

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
    };
    const clearTimers = () => {
      timers.forEach(window.clearTimeout);
      timers = [];
    };

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

    function updateShare() {
      const query = clean(input.value);
      shareOutput.textContent = query ? shareUrl(query) : "Type a question to create a shareable support link.";
      validation.hidden = true;
    }

    function finish(query) {
      app.dataset.state = "searching";
      brandCursor?.classList.remove("is-working");
      brandCursor?.classList.add("is-searching");
      googleLink.href = googleUrl(query);
      later(() => window.location.assign(googleUrl(query)), reducedMotion ? 100 : 1300);
    }

    function runStatuses(query, messages, index) {
      if (index >= messages.length) {
        finish(query);
        return;
      }
      status.textContent = messages[index];
      setProgress(((index + 1) / messages.length) * 100);
      later(() => runStatuses(query, messages, index + 1), reducedMotion ? 35 : (index === messages.length - 1 ? 1200 : 620));
    }

    function demonstrate(rawQuery) {
      const query = clean(rawQuery);
      if (!query) {
        validation.hidden = false;
        input.focus();
        return;
      }

      clearTimers();
      window.history.replaceState(null, "", shareUrl(query));
      shareOutput.textContent = shareUrl(query);
      googleLink.href = googleUrl(query);
      input.disabled = true;
      submit.disabled = true;
      copy.disabled = true;
      clear.disabled = true;
      validation.hidden = true;
      processor.hidden = false;
      app.dataset.state = "working";
      brandCursor?.classList.remove("is-searching");
      brandCursor?.classList.add("is-working");
      setProgress(0);
      runStatuses(query, shuffledStatuses(), 0);
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
        copy.textContent = "Support link copied";
      } catch (_error) {
        window.prompt("Copy this link:", url);
      }
      shareOutput.textContent = url;
      later(() => { copy.textContent = "Copy support link"; }, 1600);
    }

    if (!reducedMotion && window.matchMedia("(pointer: fine)").matches && brandCursor) {
      document.body.classList.add("has-brand-cursor");
      window.addEventListener("pointermove", event => {
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

    form.addEventListener("submit", event => {
      event.preventDefault();
      demonstrate(input.value);
    });
    input.addEventListener("input", updateShare);
    copy.addEventListener("click", copyLink);
    clear.addEventListener("click", () => {
      input.value = "";
      updateShare();
      input.focus();
    });

    const initialQuery = clean(new URLSearchParams(window.location.search).get("q"));
    if (initialQuery) {
      input.value = initialQuery;
      updateShare();
      later(() => demonstrate(initialQuery), reducedMotion ? 0 : 450);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();

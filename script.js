(function () {
  "use strict";

  const GOOGLE_SEARCH = "https://www.google.com/search?q=";

  function init() {
    const app = document.getElementById("app");
    const form = document.querySelector("[data-form]");
    const input = document.getElementById("query");
    if (!app || !form || !input) return;

    const submit = form.querySelector('[type="submit"]');
    const copy = document.querySelector("[data-copy]");
    const clear = document.querySelector("[data-clear]");
    const validation = document.querySelector("[data-validation]");
    const agentLabel = document.querySelector("[data-agent-label]");
    const steps = [...document.querySelectorAll("[data-step]")];
    const answer = document.querySelector("[data-answer]");
    const handoff = document.querySelector("[data-handoff]");
    const countdown = document.querySelector("[data-countdown]");
    const googleLink = document.querySelector("[data-google-link]");
    const cancel = document.querySelector("[data-cancel]");
    const shareOutput = document.querySelector("[data-share-output]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timers = [];
    let redirectCancelled = false;

    const later = (callback, delay) => {
      const id = window.setTimeout(callback, delay);
      timers.push(id);
      return id;
    };
    const clearTimers = () => { timers.forEach(window.clearTimeout); timers = []; };
    const clean = value => String(value || "").trim().replace(/\s+/g, " ").slice(0, 300);
    const googleUrl = query => GOOGLE_SEARCH + encodeURIComponent(query);
    const shareUrl = query => {
      const url = new URL(window.location.href);
      url.search = "";
      url.hash = "";
      if (query) url.searchParams.set("q", query);
      return url.toString();
    };

    function resetSteps() {
      steps.forEach((step, index) => {
        step.className = "";
        step.querySelector("small").textContent = "Waiting";
        step.querySelector(".step-icon").textContent = String(index + 1);
      });
      answer.hidden = true;
      handoff.hidden = true;
    }

    function updateShare() {
      const query = clean(input.value);
      shareOutput.textContent = query ? shareUrl(query) : "Type a question to generate a link.";
      validation.hidden = true;
    }

    function restore(message) {
      clearTimers();
      redirectCancelled = true;
      app.dataset.state = "idle";
      input.disabled = false;
      submit.disabled = false;
      copy.disabled = false;
      clear.disabled = false;
      handoff.hidden = true;
      agentLabel.textContent = message || "Handoff paused — human operator in control";
      input.focus();
    }

    function typeQuery(query, index, done) {
      input.value = query.slice(0, index);
      if (index >= query.length) return done();
      later(() => typeQuery(query, index + 1, done), reducedMotion ? 0 : Math.max(25, 58 - query.length / 9));
    }

    function runSteps(query, index) {
      if (index >= steps.length) {
        agentLabel.textContent = "Recommendation ready";
        answer.hidden = false;
        later(() => beginHandoff(query), reducedMotion ? 80 : 700);
        return;
      }

      const step = steps[index];
      step.classList.add("is-active");
      step.querySelector("small").textContent = index === 1 ? "Reasoning" : "Working";
      agentLabel.textContent = ["Reading context", "Thinking very deeply", "Selecting a tool", "Breakthrough detected"][index];
      later(() => {
        step.classList.remove("is-active");
        step.classList.add("is-done");
        step.querySelector("small").textContent = "Done";
        runSteps(query, index + 1);
      }, reducedMotion ? 40 : 620 + index * 90);
    }

    function beginHandoff(query) {
      const destination = googleUrl(query);
      googleLink.href = destination;
      handoff.hidden = false;
      app.dataset.state = "handoff";
      [3, 2, 1].forEach((number, index) => later(() => { countdown.textContent = String(number); }, index * 1000));
      later(() => { if (!redirectCancelled) window.location.assign(destination); }, 3000);
    }

    function demonstrate(rawQuery) {
      const query = clean(rawQuery);
      if (!query) {
        validation.hidden = false;
        input.focus();
        return;
      }

      clearTimers();
      resetSteps();
      redirectCancelled = false;
      validation.hidden = true;
      input.disabled = true;
      submit.disabled = true;
      copy.disabled = true;
      clear.disabled = true;
      input.value = "";
      app.dataset.state = "typing";
      agentLabel.textContent = "Receiving question";
      window.history.replaceState(null, "", shareUrl(query));
      shareOutput.textContent = shareUrl(query);

      later(() => typeQuery(query, 0, () => {
        app.dataset.state = "thinking";
        agentLabel.textContent = "Question received";
        later(() => runSteps(query, 0), reducedMotion ? 30 : 350);
      }), reducedMotion ? 0 : 350);
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
        copy.textContent = "Helpful link copied";
        agentLabel.textContent = "Link copied — deploy responsibly";
      } catch (_error) {
        window.prompt("Copy this link:", url);
        agentLabel.textContent = "Manual copy protocol activated";
      }
      shareOutput.textContent = url;
      later(() => { copy.textContent = "Copy a helpful link"; }, 1800);
    }

    form.addEventListener("submit", event => { event.preventDefault(); demonstrate(input.value); });
    input.addEventListener("input", updateShare);
    copy.addEventListener("click", copyLink);
    clear.addEventListener("click", () => { input.value = ""; updateShare(); input.focus(); });
    cancel.addEventListener("click", () => restore());

    const initialQuery = clean(new URLSearchParams(window.location.search).get("q"));
    resetSteps();
    if (initialQuery) {
      input.value = initialQuery;
      shareOutput.textContent = shareUrl(initialQuery);
      demonstrate(initialQuery);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();

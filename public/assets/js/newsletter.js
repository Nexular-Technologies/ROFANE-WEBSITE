/**
 * Rofane Website - Newsletter signup
 * Wires every [data-newsletter-form] (the page block and the popup) to
 * /api/newsletter/subscribe, which adds the email to Brevo server-side
 * (the Brevo API key never touches the browser), and shows a signup popup
 * a few seconds after the page loads.
 */
(function () {
  const STORAGE_KEY = "rofane_newsletter_popup"; // "subscribed" or a dismissal timestamp
  const POPUP_DELAY_MS = 10000;
  const DISMISS_DAYS = 14;

  const storage = {
    get() {
      try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    },
    set(value) {
      try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* storage unavailable */ }
    },
  };

  const wireForm = (form, onSuccess) => {
    const statusEl = form.querySelector("[data-newsletter-status]");
    const btn = form.querySelector('button[type="submit"]');
    const input = form.querySelector('input[name="email"]');

    const setStatus = (msg, ok) => {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.style.color = ok ? "#00ff88" : "#ff6b6b";
    };

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const email = (input.value || "").trim();
      if (!email) {
        setStatus("Please enter your email address.", false);
        return;
      }

      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = "Subscribing…";
      setStatus("", true);

      try {
        const res = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          form.reset();
          storage.set("subscribed");
          setStatus(data.message || "You're on the list — watch your inbox.", true);
          if (onSuccess) onSuccess();
        } else {
          setStatus(data.error || "Something went wrong. Please try again.", false);
        }
      } catch (err) {
        setStatus("Network error. Please try again.", false);
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    });
  };

  document.querySelectorAll("[data-newsletter-form]").forEach((form) => wireForm(form));

  /* ---------- Signup popup ---------- */

  const saved = storage.get();
  if (saved === "subscribed") return;
  if (saved && Date.now() - Number(saved) < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;

  const popup = document.createElement("div");
  popup.className = "nl-popup";
  popup.hidden = true;
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");
  popup.setAttribute("aria-labelledby", "nlPopupTitle");
  popup.innerHTML = `
    <div class="nl-popup-backdrop" data-nl-close></div>
    <div class="nl-popup-card" tabindex="-1">
      <button type="button" class="nl-popup-close" aria-label="Close" data-nl-close>&times;</button>
      <p class="nl-popup-eyebrow">Rofane Insights</p>
      <p id="nlPopupTitle" class="nl-popup-title">Stay Ahead on <span class="text-gradient">Testing, Automation &amp; IT Talent</span></p>
      <p class="nl-popup-text">Practical thinking on test strategy, automation and building resilient IT teams, straight to your inbox.</p>
      <form class="newsletter-form" data-newsletter-form novalidate>
        <input type="email" name="email" class="form-control form-control-lg mb-2" placeholder="you@company.com" required aria-label="Email address">
        <button type="submit" class="btn-getstarted border-0 px-4 py-2 w-100">Subscribe for Insights</button>
        <p class="small mt-2 mb-0" data-newsletter-status role="status" aria-live="polite"></p>
      </form>
      <p class="small mt-3 mb-2 text-white-50">One email, real insight — no generic newsletter filler. Unsubscribe any time.</p>
      <button type="button" class="nl-popup-dismiss" data-nl-close>No thanks</button>
    </div>
  `;
  document.body.appendChild(popup);

  const card = popup.querySelector(".nl-popup-card");
  let lastFocus = null;

  const focusable = () =>
    Array.from(card.querySelectorAll("button, input")).filter((el) => !el.disabled);

  const onKey = (event) => {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key !== "Tab") return;
    // Keep keyboard focus inside the popup while it is open.
    const items = focusable();
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === card)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  function close() {
    if (popup.hidden) return;
    popup.classList.remove("is-open");
    document.removeEventListener("keydown", onKey);
    if (storage.get() !== "subscribed") storage.set(String(Date.now()));
    setTimeout(() => { popup.hidden = true; }, 350);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  // Don't interrupt someone mid-form, reading an open modal, or using the mobile menu.
  const isBusy = () => {
    const el = document.activeElement;
    return (
      document.hidden ||
      document.body.classList.contains("mobile-nav-active") ||
      Boolean(document.querySelector(".modal.show")) ||
      Boolean(el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
    );
  };

  const open = () => {
    if (storage.get() === "subscribed") return;
    if (isBusy()) {
      setTimeout(open, 3000);
      return;
    }
    lastFocus = document.activeElement;
    popup.hidden = false;
    requestAnimationFrame(() => popup.classList.add("is-open"));
    document.addEventListener("keydown", onKey);
    // Focus the card rather than the input so phones don't pop the keyboard open.
    card.focus({ preventScroll: true });
  };

  popup.querySelectorAll("[data-nl-close]").forEach((el) => el.addEventListener("click", close));
  wireForm(popup.querySelector("[data-newsletter-form]"), () => setTimeout(close, 2500));

  setTimeout(open, POPUP_DELAY_MS);
})();

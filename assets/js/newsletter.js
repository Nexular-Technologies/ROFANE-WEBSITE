/**
 * Rofane Website - Newsletter signup
 * Posts the email to /api/newsletter/subscribe, which adds it to Brevo
 * server-side (the Brevo API key never touches the browser).
 */
(function () {
  const form = document.getElementById("newsletterForm");
  if (!form) return;

  const statusEl = document.getElementById("newsletterStatus");
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
        setStatus(data.message || "You're on the list — watch your inbox.", true);
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
})();

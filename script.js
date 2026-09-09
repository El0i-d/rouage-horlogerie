/* =========================================================
   ROUAGE — interactions
   ========================================================= */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SVG_NS = "http://www.w3.org/2000/svg";

  /* ---------------------------------------------------------
     Loader d'introduction (une seule fois par session)
     --------------------------------------------------------- */
  const loader = document.querySelector(".loader");
  if (loader) {
    const alreadySeen = sessionStorage.getItem("rouage-intro") === "1";
    if (alreadySeen || reduced) {
      loader.remove();
    } else {
      const dismiss = () => {
        loader.classList.add("done");
        sessionStorage.setItem("rouage-intro", "1");
        setTimeout(() => loader.remove(), 900);
      };
      window.addEventListener("load", () => setTimeout(dismiss, 900));
      // Filet de sécurité si l'évènement load tarde
      setTimeout(dismiss, 3000);
    }
  }

  /* ---------------------------------------------------------
     Année courante
     --------------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------------------------------------------------------
     Heure locale — clin d'œil horloger, mise à jour à la seconde
     --------------------------------------------------------- */
  const clock = document.querySelector("[data-clock]");
  if (clock) {
    const tick = () => {
      clock.textContent = new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------
     En-tête : état au défilement
     --------------------------------------------------------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------
     Menu mobile
     --------------------------------------------------------- */
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  if (toggle && nav) {
    const close = () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Ouvrir le menu");
    };
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  /* ---------------------------------------------------------
     Graduations de cadran — enrichissement progressif.
     Le cadran reste lisible sans JS ; on ajoute ici la
     minuterie fine (60 traits) et le guillochage rayonnant.
     --------------------------------------------------------- */
  function buildTicks(group) {
    const cx = parseFloat(group.dataset.cx || 100);
    const cy = parseFloat(group.dataset.cy || 100);
    const outer = parseFloat(group.dataset.outer || 68);
    const len = parseFloat(group.dataset.len || 4);
    const skipMajor = group.dataset.skipMajor === "true";

    const frag = document.createDocumentFragment();
    for (let i = 0; i < 60; i++) {
      if (skipMajor && i % 5 === 0) continue;
      const angle = (i * 6 - 90) * (Math.PI / 180);
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", (cx + Math.cos(angle) * outer).toFixed(2));
      line.setAttribute("y1", (cy + Math.sin(angle) * outer).toFixed(2));
      line.setAttribute("x2", (cx + Math.cos(angle) * (outer - len)).toFixed(2));
      line.setAttribute("y2", (cy + Math.sin(angle) * (outer - len)).toFixed(2));
      frag.appendChild(line);
    }
    group.appendChild(frag);
  }

  function buildSunray(group) {
    const cx = parseFloat(group.dataset.cx || 100);
    const cy = parseFloat(group.dataset.cy || 100);
    const outer = parseFloat(group.dataset.outer || 62);
    const count = parseInt(group.dataset.count || "72", 10);

    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const angle = ((i * 360) / count - 90) * (Math.PI / 180);
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", cx);
      line.setAttribute("y1", cy);
      line.setAttribute("x2", (cx + Math.cos(angle) * outer).toFixed(2));
      line.setAttribute("y2", (cy + Math.sin(angle) * outer).toFixed(2));
      frag.appendChild(line);
    }
    group.appendChild(frag);
  }

  document.querySelectorAll("[data-ticks]").forEach(buildTicks);
  document.querySelectorAll("[data-sunray]").forEach(buildSunray);

  /* ---------------------------------------------------------
     Aiguilles à l'heure réelle sur les cadrans marqués
     --------------------------------------------------------- */
  document.querySelectorAll("[data-live-hands]").forEach((group) => {
    const cx = parseFloat(group.dataset.cx || 100);
    const cy = parseFloat(group.dataset.cy || 100);
    const h = group.querySelector(".hand-h");
    const m = group.querySelector(".hand-m");
    const s = group.querySelector(".hand-s");

    const setHands = () => {
      const now = new Date();
      const sec = now.getSeconds();
      const min = now.getMinutes() + sec / 60;
      const hr = (now.getHours() % 12) + min / 60;
      if (h) h.setAttribute("transform", `rotate(${hr * 30} ${cx} ${cy})`);
      if (m) m.setAttribute("transform", `rotate(${min * 6} ${cx} ${cy})`);
      if (s) s.setAttribute("transform", `rotate(${sec * 6} ${cx} ${cy})`);
    };
    setHands();
    if (!reduced) setInterval(setHands, 1000);
  });

  /* ---------------------------------------------------------
     Révélations au défilement
     --------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------
     Formulaires de démonstration — aucun envoi réel.
     Rouage étant un projet fictif, on confirme visuellement
     sans transmettre la moindre donnée.
     --------------------------------------------------------- */
  document.querySelectorAll("[data-demo-form]").forEach((form) => {
    const note = form.querySelector(".form-note");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (note) {
        note.textContent =
          "Démonstration — aucune donnée n'est envoyée ni conservée.";
      }
      form.reset();
    });
  });
})();

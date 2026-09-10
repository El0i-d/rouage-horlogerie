/* =========================================================
   ROUAGE — interactions
   ========================================================= */
(function () {
  "use strict";

  /* Sans JavaScript, aucun contenu ne doit rester masqué : la mise
     en retrait des éléments révélés n'est appliquée que si ce
     marqueur est posé. */
  document.documentElement.classList.add("js-anim");

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

  /* ---------------------------------------------------------
     Géométrie du mouvement de la page d'accueil.
     Les pièces répétitives — dentures, spiraux, côtes — sont
     calculées ici plutôt qu'écrites à la main : quarante-deux
     dents se décrivent mieux par une formule que par un path.
     --------------------------------------------------------- */
  const pol = (cx, cy, r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  const fmt = (p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;

  /* Roue dentée : contour alternant rayon de tête et rayon de pied. */
  function gearPath(cx, cy, ro, ri, n, ratio) {
    const step = (Math.PI * 2) / n;
    const half = (step * ratio) / 2;
    const flank = step * 0.11;
    let d = "";
    for (let i = 0; i < n; i++) {
      const a = i * step;
      d += (i === 0 ? "M" : "L") + fmt(pol(cx, cy, ri, a - half - flank));
      d += "L" + fmt(pol(cx, cy, ro, a - half));
      d += "L" + fmt(pol(cx, cy, ro, a + half));
      d += "L" + fmt(pol(cx, cy, ri, a + half + flank));
    }
    return d + "Z";
  }

  /* Roue d'échappement : dents asymétriques, face d'impulsion
     raide et dos incliné — la silhouette qui la rend identifiable. */
  function escapePath(cx, cy, ro, ri, n) {
    const step = (Math.PI * 2) / n;
    let d = "";
    for (let i = 0; i < n; i++) {
      const a = i * step;
      d += (i === 0 ? "M" : "L") + fmt(pol(cx, cy, ri, a));
      d += "L" + fmt(pol(cx, cy, ro, a + step * 0.14));
      d += "L" + fmt(pol(cx, cy, ro * 0.965, a + step * 0.36));
      d += "L" + fmt(pol(cx, cy, ri, a + step * 0.88));
    }
    return d + "Z";
  }

  /* Spiral d'Archimède : ressort de barillet et spiral de balancier. */
  function spiralPath(cx, cy, r0, r1, turns, steps) {
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = t * turns * Math.PI * 2;
      d += (i === 0 ? "M" : "L") + fmt(pol(cx, cy, r0 + (r1 - r0) * t, a));
    }
    return d;
  }

  /* Pont : secteur annulaire. Les côtes qui l'ornent sont ensuite
     tracées sur des rayons intermédiaires, donc naturellement
     contenues dedans — aucun détourage nécessaire. */
  function platePath(cx, cy, ri, ro, a1, a2) {
    const grand = Math.abs(a2 - a1) > Math.PI ? 1 : 0;
    return (
      "M" + fmt(pol(cx, cy, ro, a1)) +
      `A${ro} ${ro} 0 ${grand} 1 ` + fmt(pol(cx, cy, ro, a2)) +
      "L" + fmt(pol(cx, cy, ri, a2)) +
      `A${ri} ${ri} 0 ${grand} 0 ` + fmt(pol(cx, cy, ri, a1)) +
      "Z"
    );
  }

  const rad = (deg) => (deg * Math.PI) / 180;
  const num = (el, cle, def) => parseFloat(el.dataset[cle] ?? def);

  document.querySelectorAll("[data-gear]").forEach((p) => {
    p.setAttribute("d", gearPath(num(p, "cx", 0), num(p, "cy", 0), num(p, "ro", 40),
      num(p, "ri", 34), parseInt(p.dataset.teeth || "36", 10), num(p, "ratio", 0.42)));
  });
  document.querySelectorAll("[data-escape]").forEach((p) => {
    p.setAttribute("d", escapePath(num(p, "cx", 0), num(p, "cy", 0), num(p, "ro", 26),
      num(p, "ri", 17), parseInt(p.dataset.teeth || "15", 10)));
  });
  document.querySelectorAll("[data-spiral]").forEach((p) => {
    p.setAttribute("d", spiralPath(num(p, "cx", 0), num(p, "cy", 0), num(p, "r0", 6),
      num(p, "r1", 30), num(p, "turns", 5), 320));
  });
  document.querySelectorAll("[data-plate]").forEach((p) => {
    p.setAttribute("d", platePath(num(p, "cx", 0), num(p, "cy", 0), num(p, "ri", 90),
      num(p, "ro", 140), rad(num(p, "a1", 0)), rad(num(p, "a2", 90))));
  });

  /* Côtes de Genève : arcs concentriques sur le pont. */
  document.querySelectorAll("[data-cotes]").forEach((g) => {
    const cx = num(g, "cx", 0), cy = num(g, "cy", 0);
    const ri = num(g, "ri", 96), ro = num(g, "ro", 140);
    const a1 = rad(num(g, "a1", 0)), a2 = rad(num(g, "a2", 90));
    const pas = num(g, "step", 7);
    const frag = document.createDocumentFragment();
    for (let r = ri; r <= ro; r += pas) {
      const arc = document.createElementNS(SVG_NS, "path");
      arc.setAttribute("d", "M" + fmt(pol(cx, cy, r, a1)) +
        `A${r} ${r} 0 0 1 ` + fmt(pol(cx, cy, r, a2)));
      frag.appendChild(arc);
    }
    g.appendChild(frag);
  });

  /* Index appliqués : rapportés puis fixés un à un sur le cadran.
     Chaque index est un quadrilatère plus une arête centrale — c'est
     ce filet de lumière qui distingue un index appliqué d'un imprimé. */
  document.querySelectorAll("[data-applique]").forEach((g) => {
    const cx = num(g, "cx", 100), cy = num(g, "cy", 100);
    const outer = num(g, "outer", 58), len = num(g, "len", 8), w = num(g, "w", 2.8);
    const seul = g.dataset.only !== undefined ? parseInt(g.dataset.only, 10) : null;
    const clairseme = g.dataset.sparse === "true";

    const frag = document.createDocumentFragment();
    for (let i = 0; i < 12; i++) {
      if (seul !== null && i !== seul) continue;
      if (clairseme && i % 3 !== 0) continue;
      const a = ((i * 30 - 90) * Math.PI) / 180;
      const cardinal = i % 3 === 0;
      const L = cardinal ? len * 1.3 : len;
      const demi = (cardinal ? w : w * 0.72) / 2;
      const ux = Math.cos(a), uy = Math.sin(a);
      const px = -uy, py = ux;
      const pt = (r, o) => `${(cx + ux * r + px * o).toFixed(2)} ${(cy + uy * r + py * o).toFixed(2)}`;

      const corps = document.createElementNS(SVG_NS, "path");
      corps.setAttribute("class", "index-corps");
      corps.setAttribute("d",
        `M${pt(outer, -demi)}L${pt(outer, demi)}L${pt(outer - L, demi)}L${pt(outer - L, -demi)}Z`);
      frag.appendChild(corps);

      const arete = document.createElementNS(SVG_NS, "line");
      arete.setAttribute("class", "index-arete");
      const [x1, y1] = pt(outer, 0).split(" ");
      const [x2, y2] = pt(outer - L, 0).split(" ");
      arete.setAttribute("x1", x1); arete.setAttribute("y1", y1);
      arete.setAttribute("x2", x2); arete.setAttribute("y2", y2);
      frag.appendChild(arete);
    }
    g.appendChild(frag);
  });

  /* Perlage : cercles de grainage se recouvrant sur la platine.
     Posé en quinconce, comme au tour à perler. */
  document.querySelectorAll("[data-perlage]").forEach((g) => {
    const cx = num(g, "cx", 0), cy = num(g, "cy", 0);
    const rayon = num(g, "r", 150);
    const pas = num(g, "step", 15);
    const dot = num(g, "dot", 10);
    const frag = document.createDocumentFragment();
    let ligne = 0;
    for (let y = cy - rayon; y <= cy + rayon; y += pas * 0.86, ligne++) {
      const decal = ligne % 2 ? pas / 2 : 0;
      for (let x = cx - rayon + decal; x <= cx + rayon; x += pas) {
        if (Math.hypot(x - cx, y - cy) > rayon - dot / 2) continue;
        const c = document.createElementNS(SVG_NS, "circle");
        c.setAttribute("cx", x.toFixed(1));
        c.setAttribute("cy", y.toFixed(1));
        c.setAttribute("r", dot.toFixed(1));
        frag.appendChild(c);
      }
    }
    g.appendChild(frag);
  });

  /* Bras de roue. */
  document.querySelectorAll("[data-spokes]").forEach((g) => {
    const cx = num(g, "cx", 0), cy = num(g, "cy", 0);
    const r0 = num(g, "r0", 8), r1 = num(g, "r1", 40);
    const n = parseInt(g.dataset.count || "4", 10);
    const decal = rad(num(g, "offset", 0));
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const a = decal + (i * Math.PI * 2) / n;
      const l = document.createElementNS(SVG_NS, "line");
      const [x1, y1] = pol(cx, cy, r0, a), [x2, y2] = pol(cx, cy, r1, a);
      l.setAttribute("x1", x1.toFixed(2)); l.setAttribute("y1", y1.toFixed(2));
      l.setAttribute("x2", x2.toFixed(2)); l.setAttribute("y2", y2.toFixed(2));
      frag.appendChild(l);
    }
    g.appendChild(frag);
  });

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
     Échelonnement automatique des enfants d'un bloc révélé.
     Évite d'écrire une classe de délai sur chaque élément.
     --------------------------------------------------------- */
  document.querySelectorAll("[data-stagger]").forEach((bloc) => {
    const pas = parseFloat(bloc.dataset.stagger) || 0.07;
    [...bloc.children].forEach((enfant, i) => {
      enfant.classList.add("reveal");
      enfant.style.transitionDelay = `${(i * pas).toFixed(3)}s`;
    });
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

    /* Filet de sécurité : si l'observateur n'a rien signalé, tout
       élément déjà présent à l'écran est révélé malgré tout. Un
       contenu invisible serait bien pire qu'une animation manquée. */
    setTimeout(() => {
      revealEls.forEach((el) => {
        if (el.classList.contains("in")) return;
        const b = el.getBoundingClientRect();
        if (b.top < window.innerHeight && b.bottom > 0) el.classList.add("in");
      });
    }, 1200);
  }

  /* ---------------------------------------------------------
     Fil de progression : un trait de laiton sous l'en-tête.
     Créé en JavaScript pour ne pas alourdir les huit pages.
     --------------------------------------------------------- */
  (function fil() {
    const barre = document.createElement("div");
    barre.className = "scroll-progress";
    barre.setAttribute("aria-hidden", "true");
    document.body.appendChild(barre);
    let enAttente = false;
    const maj = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      barre.style.transform = `scaleX(${total > 0 ? window.scrollY / total : 0})`;
      enAttente = false;
    };
    const planifier = () => {
      if (enAttente) return;
      enAttente = true;
      requestAnimationFrame(maj);
    };
    maj();
    window.addEventListener("scroll", planifier, { passive: true });
    window.addEventListener("resize", planifier);
  })();

  /* ---------------------------------------------------------
     Parallaxe discrète sur le mouvement de la page d'accueil.
     Piloté par requestAnimationFrame : le gestionnaire de
     défilement ne fait qu'enregistrer une position.
     --------------------------------------------------------- */
  const parallaxes = document.querySelectorAll("[data-parallax]");
  if (parallaxes.length && !reduced) {
    let enAttente = false;
    const placer = () => {
      const h = window.innerHeight;
      parallaxes.forEach((el) => {
        const facteur = parseFloat(el.dataset.parallax) || 0.06;
        const b = el.getBoundingClientRect();
        if (b.bottom < -200 || b.top > h + 200) return;
        const centre = b.top + b.height / 2 - h / 2;
        el.style.transform = `translate3d(0, ${(-centre * facteur).toFixed(1)}px, 0)`;
      });
      enAttente = false;
    };
    const planifier = () => {
      if (enAttente) return;
      enAttente = true;
      requestAnimationFrame(placer);
    };
    placer();
    window.addEventListener("scroll", planifier, { passive: true });
    window.addEventListener("resize", planifier);
  }

  /* ---------------------------------------------------------
     Chiffres qui se composent à l'entrée dans l'écran.
     Le suffixe éventuel (« h », « s ») est conservé.
     --------------------------------------------------------- */
  const compteurs = document.querySelectorAll("[data-compte]");
  if (compteurs.length) {
    const animer = (el) => {
      const cible = parseFloat(el.dataset.compte);
      const suffixe = el.dataset.suffixe || "";
      if (reduced || !Number.isFinite(cible)) {
        el.textContent = cible.toLocaleString("fr-FR") + suffixe;
        return;
      }
      const duree = 1100;
      const debut = performance.now();
      const pas = (t) => {
        const p = Math.min((t - debut) / duree, 1);
        const adouci = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(cible * adouci).toLocaleString("fr-FR") + suffixe;
        if (p < 1) requestAnimationFrame(pas);
      };
      requestAnimationFrame(pas);
    };

    if (!("IntersectionObserver" in window)) {
      compteurs.forEach(animer);
    } else {
      const ioNum = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { animer(e.target); obs.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      compteurs.forEach((el) => ioNum.observe(el));
    }
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

// Single source of truth for the public resource URLs; an empty entry keeps the
// matching link disabled.
const PROJECT_LINKS = {
  paper: "https://arxiv.org/abs/2608.20492",
  code: "https://github.com/HVision-NKU/OraRL",
  data: "https://huggingface.co/datasets/OraRL/OraRL-Data",
  model: "https://huggingface.co/OraRL/Video-ORA-9B",
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function configureResourceLinks() {
  document.querySelectorAll("[data-resource]").forEach((element) => {
    const key = element.dataset.resource;
    const url = PROJECT_LINKS[key];

    if (!url) {
      element.classList.add("is-pending");
      element.setAttribute("aria-disabled", "true");
      element.addEventListener("click", (event) => event.preventDefault());
      return;
    }

    element.href = url;
    element.target = "_blank";
    element.rel = "noopener noreferrer";
    element.classList.remove("is-pending");
    element.removeAttribute("aria-disabled");

    if (key === "paper") {
      const buttonLabel = element.matches(".button") ? element.querySelector("span") : null;
      if (buttonLabel) buttonLabel.textContent = "Paper";
      if (element.matches(".nav-paper")) element.textContent = "Paper ↗";
    }
  });
}

function setupHeader() {
  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (!navToggle || !nav) return;

  const closeNav = () => {
    navToggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

  window.addEventListener("resize", () => {
    if (window.innerWidth > 780) closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
}

function setupRevealAnimations() {
  const items = document.querySelectorAll(".reveal");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
    observer.observe(item);
  });
}

function setupCopyButton() {
  const copyButton = document.querySelector("[data-copy]");
  const bibtex = document.querySelector("#bibtex");
  if (!copyButton || !bibtex) return;

  copyButton.addEventListener("click", async () => {
    const originalLabel = copyButton.querySelector("span")?.textContent || "Copy BibTeX";

    try {
      await navigator.clipboard.writeText(bibtex.textContent.trim());
      const label = copyButton.querySelector("span");
      if (label) label.textContent = "Copied";
      copyButton.classList.add("is-copied");

      window.setTimeout(() => {
        if (label) label.textContent = originalLabel;
        copyButton.classList.remove("is-copied");
      }, 1800);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(bibtex);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
}

configureResourceLinks();
setupHeader();
setupRevealAnimations();
setupCopyButton();

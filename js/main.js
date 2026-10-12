document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("primary-nav");

  if (!toggle || !nav) return;

  const setMenuOpen = (isOpen) => {
    nav.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Zavrieť menu" : "Otvoriť menu");
  };

  toggle.addEventListener("click", () => {
    setMenuOpen(!nav.classList.contains("is-open"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setMenuOpen(false);
      toggle.focus();
    }
  });
});

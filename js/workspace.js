const HOTSPOTS = [
  {
    id: "notebook",
    top: 33,
    left: 15,
    label: "Zošit so špirálovou väzbou, zatvorený, s jednoduchým tmavomodrým obalom bez potlače",
    heading: "Poznámkový zošit",
    text: "Sem si ručne píšem poznámky z prednášok a nápady na projekty – na rýchle skice mi papier stále nič nenahradí."
  },
  {
    id: "laptop",
    top: 31,
    left: 48,
    label: "Otvorený notebook s rozmazaným kódovacím editorom na obrazovke",
    heading: "Notebook",
    text: "Na ňom programujem – školské zadania aj prácu v IT firme, kde sa venujem umelej inteligencii a programovaniu."
  },
  {
    id: "book",
    top: 73,
    left: 85,
    label: "Zatvorená kniha s pevnou väzbou a jednoduchým obalom",
    heading: "Kniha",
    text: "Čítanie mi pomáha odpočinúť od kódu a pozerať sa na veci z iného uhla – táto kniha patrí medzi tie, ku ktorým sa vraciam."
  },
  {
    id: "shaker",
    top: 26,
    left: 81,
    label: "Šejker na nápoj s tmavomodrým vrškom",
    heading: "Šejker",
    text: "Bez neho sa na tréningu nezaobídem – patrí k mojej dennej rutine rovnako ako notebook."
  },
  {
    id: "dumbbell",
    top: 75,
    left: 23,
    label: "Jedna činka položená na boku",
    heading: "Posilňovanie",
    text: "Športu a fitnesu sa venujem pravidelne, popri tom aj online trénerstvu, ktorému by som sa v budúcnosti chcel venovať viac."
  }
];

document.addEventListener("DOMContentLoaded", function () {
  renderHotspots();
});

let activeId = null;

function renderHotspots() {
  const hotspotsLayer = document.getElementById("hotspots");
  const panelsBox = document.getElementById("hotspotPanels");

  if (!hotspotsLayer || !panelsBox) {
    return;
  }

  HOTSPOTS.forEach(function (spot) {
    const button = document.createElement("button");
    button.type = "button";
    button.id = "hotspot-" + spot.id;
    button.className = "hotspot";
    button.style.top = spot.top + "%";
    button.style.left = spot.left + "%";
    button.setAttribute("aria-label", spot.label);
    button.setAttribute("aria-describedby", "panel-" + spot.id);
    button.setAttribute("aria-controls", "panel-" + spot.id);
    button.setAttribute("aria-expanded", "false");

    // Mouse hover, keyboard focus and tap (touch screens have no hover) all show the panel.
    button.addEventListener("mouseenter", function () { setActiveHotspot(spot.id); });
    button.addEventListener("focus", function () { setActiveHotspot(spot.id); });
    button.addEventListener("click", function () { setActiveHotspot(spot.id); });
    button.addEventListener("mouseleave", function () { clearActiveHotspot(spot.id); });
    button.addEventListener("blur", function () { clearActiveHotspot(spot.id); });

    hotspotsLayer.appendChild(button);

    const panel = document.createElement("article");
    panel.id = "panel-" + spot.id;
    panel.className = "hotspot-panel";

    const heading = document.createElement("h3");
    heading.textContent = spot.heading;

    const text = document.createElement("p");
    text.textContent = spot.text;

    panel.appendChild(heading);
    panel.appendChild(text);
    panelsBox.appendChild(panel);
  });
}

// Shows the panel of the given hotspot and hides all the others (null = show the placeholder).
function setActiveHotspot(id) {
  activeId = id;

  HOTSPOTS.forEach(function (spot) {
    const isActive = spot.id === id;
    const button = document.getElementById("hotspot-" + spot.id);
    const panel = document.getElementById("panel-" + spot.id);

    button.classList.toggle("hotspot--active", isActive);
    button.setAttribute("aria-expanded", String(isActive));
    panel.classList.toggle("hotspot-panel--active", isActive);
  });

  const placeholder = document.querySelector(".hotspot-panel--placeholder");
  if (placeholder) {
    placeholder.classList.toggle("is-hidden", id !== null);
  }
}

// Hides the panel only if it still belongs to the hotspot the pointer or focus just left.
function clearActiveHotspot(id) {
  if (activeId !== id) {
    return;
  }

  const button = document.getElementById("hotspot-" + id);
  if (button === document.activeElement || button.matches(":hover")) {
    return;
  }

  setActiveHotspot(null);
}

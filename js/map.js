const SCHOOL = {
  name: "FEI STU Bratislava",
  lat: 48.1521,
  lng: 17.0716
};

const HOME = {
  name: "Bydlisko (Ružinov, Bratislava)",
  lat: 48.1486,
  lng: 17.1522
};

const STORAGE_KEY = "mapPoints";

let map;
let points = [];
let pointMarkers = [];
let routeLine = null;
let schoolMarker = null;
let homeMarker = null;
let pendingLatLng = null;
let pendingMarker = null;

document.addEventListener("DOMContentLoaded", function () {
  initMap();
  loadPoints();
  renderPoints();

  map.on("click", handleMapClick);

  document.getElementById("distanceForm").addEventListener("submit", handleFormSubmit);
  document.getElementById("addPointForm").addEventListener("submit", handleAddPointSubmit);
  document.getElementById("cancelPoint").addEventListener("click", cancelNewPoint);
});

// Creates the map and permanently adds the school and home markers.
function initMap() {
  const centerLat = (SCHOOL.lat + HOME.lat) / 2;
  const centerLng = (SCHOOL.lng + HOME.lng) / 2;

  map = L.map("map").setView([centerLat, centerLng], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  schoolMarker = L.marker([SCHOOL.lat, SCHOOL.lng])
    .addTo(map)
    .bindPopup(createPopupContent(SCHOOL.name, "Moja škola"));

  homeMarker = L.marker([HOME.lat, HOME.lng])
    .addTo(map)
    .bindPopup(createPopupContent(HOME.name, "Moje bydlisko"));
}

// Builds popup content from DOM elements, so user-entered names are always shown as plain text (no HTML injection).
function createPopupContent(title, subtitle) {
  const wrapper = document.createElement("div");

  const strong = document.createElement("strong");
  strong.textContent = title;
  wrapper.appendChild(strong);

  if (subtitle) {
    wrapper.appendChild(document.createElement("br"));
    wrapper.appendChild(document.createTextNode(subtitle));
  }

  return wrapper;
}

// Loads added points from localStorage (if any exist); damaged data is ignored instead of breaking the page.
function loadPoints() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (Array.isArray(saved)) {
      points = saved.filter(function (point) {
        return point && typeof point.name === "string" && Number.isFinite(point.lat) && Number.isFinite(point.lng);
      });
    }
  } catch (error) {
    points = [];
  }
}

// Saves added points to localStorage so they survive a page refresh.
function savePoints() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
  } catch (error) {
    // Storage can be blocked (e.g. private mode) - the points then live only until the page is closed.
  }
}

// After a map click, remembers the position, marks it and asks for a name in the side panel.
function handleMapClick(event) {
  pendingLatLng = event.latlng;

  if (pendingMarker) {
    pendingMarker.setLatLng(pendingLatLng);
  } else {
    pendingMarker = L.circleMarker(pendingLatLng, { radius: 8 }).addTo(map);
  }

  const addForm = document.getElementById("addPointForm");
  const nameInput = document.getElementById("pointName");

  document.getElementById("mapEmptyState").hidden = true;
  addForm.hidden = false;
  nameInput.value = "";
  nameInput.focus();
}

// Adds the new point with the entered name.
function handleAddPointSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("pointName").value.trim();

  if (!name || !pendingLatLng) {
    return;
  }

  points.push({
    name: name,
    lat: pendingLatLng.lat,
    lng: pendingLatLng.lng
  });

  savePoints();
  cancelNewPoint();
}

// Hides the name form and removes the temporary marker.
function cancelNewPoint() {
  pendingLatLng = null;

  if (pendingMarker) {
    map.removeLayer(pendingMarker);
    pendingMarker = null;
  }

  document.getElementById("addPointForm").hidden = true;
  renderPoints();
}

// Redraws markers of added points on the map, the list and the select field.
function renderPoints() {
  pointMarkers.forEach(function (marker) {
    map.removeLayer(marker);
  });
  pointMarkers = [];

  const emptyState = document.getElementById("mapEmptyState");
  const form = document.getElementById("distanceForm");
  const list = document.getElementById("pointsList");
  const select = document.getElementById("pointSelect");

  list.innerHTML = "";
  select.innerHTML = "";

  const isEmpty = points.length === 0;
  emptyState.hidden = !isEmpty;
  form.hidden = isEmpty;
  list.hidden = isEmpty;

  points.forEach(function (point, index) {
    const marker = L.marker([point.lat, point.lng])
      .addTo(map)
      .bindPopup(createPopupContent(point.name));
    pointMarkers.push(marker);

    const listItem = document.createElement("li");
    listItem.textContent = point.name;
    list.appendChild(listItem);

    const option = document.createElement("option");
    option.value = index;
    option.textContent = point.name;
    select.appendChild(option);
  });
}

// After the form is submitted, calculates the distance, shows it and draws the route line.
function handleFormSubmit(event) {
  event.preventDefault();

  const pointSelect = document.getElementById("pointSelect");
  const targetSelect = document.getElementById("targetSelect");
  const result = document.getElementById("mapResult");

  const pointIndex = Number(pointSelect.value);
  const point = points[pointIndex];

  if (!point) {
    return;
  }

  const isSchool = targetSelect.value === "school";
  const target = isSchool ? SCHOOL : HOME;
  const targetMarker = isSchool ? schoolMarker : homeMarker;

  const distanceKm = getDistanceInKm(point.lat, point.lng, target.lat, target.lng);
  const roundedDistance = distanceKm.toFixed(2);

  result.textContent =
    "Vzdialenosť medzi " + point.name + " a " + target.name + " je " + roundedDistance + " km.";

  drawRouteLine(point, target);

  const pointMarker = pointMarkers[pointIndex];

  pointMarker.setPopupContent(createPopupContent(point.name, roundedDistance + " km od miesta " + target.name));
  targetMarker.setPopupContent(createPopupContent(target.name, roundedDistance + " km od miesta " + point.name));
  pointMarker.openPopup();
}

// Draws the route line between the point and the target, removing the previous one first.
function drawRouteLine(point, target) {
  if (routeLine) {
    map.removeLayer(routeLine);
  }

  const lineColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-accent")
    .trim();

  routeLine = L.polyline(
    [
      [point.lat, point.lng],
      [target.lat, target.lng]
    ],
    { color: lineColor, weight: 3 }
  ).addTo(map);

  map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
}

// Haversine formula - calculates the distance between two points on Earth in kilometers.
function getDistanceInKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

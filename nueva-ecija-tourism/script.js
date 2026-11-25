/**
 * Geographic calibration for 7kv7s7cor4fe1 (1).jpeg:
 * Based on the map's 1-degree graticule grid (120°E–123°E, 13°N–19°N) and
 * Central Luzon provincial landmarks (Cabanatuan, Pantabangan, Carranglan):
 *   - Image Left (x = 0%)   ≈ 119.25° E
 *   - Image Right (x = 100%) ≈ 123.35° E
 *   - Image Top (y = 0%)    ≈ 19.05° N
 *   - Image Bottom (y = 100%) ≈ 12.65° N
 *
 * Formula used to compute x% and y% from lat/lng:
 *   x = ((lng - 119.25) / (123.35 - 119.25)) * 100
 *   y = ((19.05 - lat) / (19.05 - 12.65)) * 100
 * Adjust the four bounds above if you swap the base map image.
 */
const MAP_BOUNDS = {
  west: 119.25,
  east: 123.35,
  north: 19.05,
  south: 12.65
};

function coordsToPercent(lat, lng) {
  const x = ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100;
  const y = ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100;
  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2))
  };
}

/**
 * Editable array of Nueva Ecija tourist destinations.
 * Update names, coordinates, descriptions, features, or imageUrl here.
 */
const LOCATIONS = [
  {
    id: "minalungao-national-park",
    name: "Minalungao National Park",
    municipality: "General Tinio",
    lat: 15.3094,
    lng: 121.1278,
    ...coordsToPercent(15.3094, 121.1278),
    description:
      "A protected river gorge in General Tinio famed for its emerald river winding between towering limestone cliffs and relaxing bamboo rafting.",
    features: ["Emerald river", "Limestone cliffs", "Bamboo rafting"],
    imageUrl: "" // Optional: add path to real destination photo later
  },
  {
    id: "pantabangan-dam-lake",
    name: "Pantabangan Dam & Lake",
    municipality: "Pantabangan",
    lat: 15.8153,
    lng: 121.1114,
    ...coordsToPercent(15.8153, 121.1114),
    description:
      "Expansive reservoir surrounded by Sierra Madre foothills, offering sweeping dam views, scenic lake tours, sport fishing, and golden sunsets.",
    features: ["Dam views", "Lake tours", "Fishing", "Sunsets"],
    imageUrl: ""
  },
  {
    id: "gabaldon-falls-dupinga",
    name: "Gabaldon Falls / Dupinga River",
    municipality: "Gabaldon",
    lat: 15.4958,
    lng: 121.3414,
    ...coordsToPercent(15.4958, 121.3414),
    description:
      "Nestled at the foot of the Sierra Madre, featuring cold, clear mountain water, riverside cottages, refreshing swimming spots, and lush nature views.",
    features: ["Cold, clear water", "Cottages", "Swimming", "Nature views"],
    imageUrl: ""
  },
  {
    id: "mt-380-387-batangan",
    name: "Mt. 380 / Mt. 387 (Batangan)",
    municipality: "Carranglan",
    lat: 15.9917,
    lng: 121.0289,
    ...coordsToPercent(15.9917, 121.0289),
    description:
      "A favorite highland trail in Carranglan known for accessible hiking, rolling scenic ridges, and panoramic sunrise views above the sea of clouds.",
    features: ["Hiking", "Scenic ridges", "Sunrise views"],
    imageUrl: ""
  },
  {
    id: "camp-pangatian-memorial",
    name: "Camp Pangatian War Memorial",
    municipality: "Cabanatuan City",
    lat: 15.5056,
    lng: 121.0319,
    ...coordsToPercent(15.5056, 121.0319),
    description:
      "A solemn historical shrine and WWII memorial park commemorating the Allied raid that liberated hundreds of prisoners of war in Cabanatuan.",
    features: ["Historical shrine", "WWII memorial park"],
    imageUrl: ""
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const openMapBtn = document.getElementById("open-map-btn");
  const closeMapBtn = document.getElementById("close-map-btn");
  const mapOverlay = document.getElementById("luzon-map-overlay");
  const mapBackdrop = document.getElementById("map-backdrop");
  const pinsLayer = document.getElementById("map-pins-layer");

  const previewEmpty = document.getElementById("preview-empty");
  const previewCard = document.getElementById("preview-card");
  const previewMedia = document.getElementById("preview-media");
  const previewMunicipalityBadge = document.getElementById("preview-municipality-badge");
  const previewMunicipality = document.getElementById("preview-municipality");
  const previewTitle = document.getElementById("preview-title");
  const previewDescription = document.getElementById("preview-description");
  const previewFeatures = document.getElementById("preview-features");
  const learnMoreBtn = document.getElementById("learn-more-btn");

  let activeLocationId = null;

  // Render percentage-positioned pins over the static Luzon image
  function renderPins() {
    pinsLayer.innerHTML = "";

    LOCATIONS.forEach((loc) => {
      const pinBtn = document.createElement("button");
      pinBtn.type = "button";
      pinBtn.className = "map-pin";
      pinBtn.dataset.location = loc.id;
      pinBtn.style.left = `${loc.x}%`;
      pinBtn.style.top = `${loc.y}%`;
      pinBtn.setAttribute("aria-label", `${loc.name}, ${loc.municipality}`);

      pinBtn.innerHTML = `
        <span class="pin-tooltip">${loc.name}</span>
        <span class="pin-marker" aria-hidden="true"></span>
      `;

      pinBtn.addEventListener("click", () => selectLocation(loc.id));
      pinsLayer.appendChild(pinBtn);
    });
  }

  // Populate the preview card when a pin is clicked
  function selectLocation(locationId) {
    const loc = LOCATIONS.find((item) => item.id === locationId);
    if (!loc) return;

    activeLocationId = loc.id;

    // Highlight active pin
    pinsLayer.querySelectorAll(".map-pin").forEach((pin) => {
      pin.classList.toggle("is-active", pin.dataset.location === loc.id);
    });

    // Update card content
    previewMunicipalityBadge.textContent = loc.municipality;
    previewMunicipality.textContent = `${loc.municipality}, Nueva Ecija`;
    previewTitle.textContent = loc.name;
    previewDescription.textContent = loc.description;

    // Update image placeholder (or swap in real imageUrl if provided)
    if (loc.imageUrl) {
      previewMedia.style.backgroundImage = `url("${loc.imageUrl}")`;
      previewMedia.querySelector(".media-placeholder-label").style.display = "none";
    } else {
      previewMedia.style.backgroundImage = "";
      previewMedia.querySelector(".media-placeholder-label").style.display = "";
    }

    // Render feature pills
    previewFeatures.innerHTML = "";
    loc.features.forEach((feature) => {
      const li = document.createElement("li");
      li.textContent = feature;
      previewFeatures.appendChild(li);
    });

    // Set data-location hook on Learn More button (intentionally inert for now)
    learnMoreBtn.dataset.location = loc.id;

    previewEmpty.hidden = true;
    previewCard.hidden = false;
  }

  function openMap() {
    mapOverlay.hidden = false;
    openMapBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    closeMapBtn.focus();
  }

  function closeMap() {
    mapOverlay.hidden = true;
    openMapBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    openMapBtn.focus();
  }

  openMapBtn.addEventListener("click", openMap);
  closeMapBtn.addEventListener("click", closeMap);
  mapBackdrop.addEventListener("click", closeMap);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !mapOverlay.hidden) {
      closeMap();
    }
  });

  // TODO: Add Learn More navigation or modal logic here later using learnMoreBtn.dataset.location
  // Example:
  // learnMoreBtn.addEventListener("click", (e) => {
  //   const slug = e.currentTarget.dataset.location;
  //   window.location.href = `/destinations/${slug}.html`;
  // });

  renderPins();
});
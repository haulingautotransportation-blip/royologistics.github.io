// ===== Cities dataset (UZ + KZ + KG + RU) =====
const CITIES = [
  // Uzbekistan (UZ)
  { name: "Toshkent", country: "Uzbekistan" },
  { name: "Samarqand", country: "Uzbekistan" },
  { name: "Buxoro", country: "Uzbekistan" },
  { name: "Navoiy", country: "Uzbekistan" },
  { name: "Qarshi", country: "Uzbekistan" },
  { name: "Termiz", country: "Uzbekistan" },
  { name: "Jizzax", country: "Uzbekistan" },
  { name: "Guliston", country: "Uzbekistan" },
  { name: "Andijon", country: "Uzbekistan" },
  { name: "Namangan", country: "Uzbekistan" },
  { name: "Farg‘ona", country: "Uzbekistan" },
  { name: "Qo‘qon", country: "Uzbekistan" },
  { name: "Nukus", country: "Uzbekistan" },
  { name: "Urganch", country: "Uzbekistan" },
  { name: "Xiva", country: "Uzbekistan" },
  { name: "Qo‘shko‘pir", country: "Uzbekistan" },

  // Kazakhstan (KZ)
  { name: "Almaty", country: "Kazakhstan" },
  { name: "Astana", country: "Kazakhstan" },
  { name: "Shymkent", country: "Kazakhstan" },
  { name: "Karaganda", country: "Kazakhstan" },
  { name: "Aktobe", country: "Kazakhstan" },
  { name: "Atyrau", country: "Kazakhstan" },
  { name: "Pavlodar", country: "Kazakhstan" },
  { name: "Kostanay", country: "Kazakhstan" },
  { name: "Kyzylorda", country: "Kazakhstan" },
  { name: "Ust-Kamenogorsk", country: "Kazakhstan" },
  { name: "Semey", country: "Kazakhstan" },
  { name: "Taraz", country: "Kazakhstan" },

  // Kyrgyzstan (KG)
  { name: "Bishkek", country: "Kyrgyzstan" },
  { name: "Osh", country: "Kyrgyzstan" },
  { name: "Jalal-Abad", country: "Kyrgyzstan" },
  { name: "Karakol", country: "Kyrgyzstan" },
  { name: "Tokmok", country: "Kyrgyzstan" },
  { name: "Naryn", country: "Kyrgyzstan" },

  // Russia (RU)
  { name: "Moscow", country: "Russia" },
  { name: "Saint Petersburg", country: "Russia" },
  { name: "Kazan", country: "Russia" },
  { name: "Novosibirsk", country: "Russia" },
  { name: "Yekaterinburg", country: "Russia" },
  { name: "Krasnodar", country: "Russia" },
  { name: "Rostov-on-Don", country: "Russia" },
  { name: "Samara", country: "Russia" },
];

// ===== Helpers =====
function norm(s) {
  return (s || "")
    .toString()
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function formatCity(item) {
  return `${item.name}, ${item.country}`;
}

function getEl(id) {
  return document.getElementById(id);
}

// ===== Lanes (search dropdown) =====
let fromChoice = null; // {name,country}
let toChoice = null;

function setApplyState() {
  const applyBtn = getEl("laneApply");
  if (!applyBtn) return;
  const ok =
    fromChoice &&
    toChoice &&
    !(fromChoice.name === toChoice.name && fromChoice.country === toChoice.country);
  applyBtn.disabled = !ok;
}

function closeResults(box) {
  if (!box) return;
  box.style.display = "none";
  box.innerHTML = "";
}

function openResults(box) {
  if (!box) return;
  box.style.display = "block";
}

function renderResults(box, items, onPick) {
  if (!box) return;

  box.innerHTML = "";
  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "lane-result empty";
    empty.textContent = "No matches";
    box.appendChild(empty);
    openResults(box);
    return;
  }

  items.slice(0, 12).forEach((item) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "lane-result";
    row.textContent = formatCity(item);
    row.addEventListener("click", () => onPick(item));
    box.appendChild(row);
  });

  openResults(box);
}

function attachSearch(inputId, resultsId, side) {
  const input = getEl(inputId);
  const results = getEl(resultsId);
  if (!input || !results) return;

  input.addEventListener("input", () => {
    const q = norm(input.value);
    if (!q) {
      closeResults(results);
      return;
    }

    const matches = CITIES.filter((c) => norm(c.name).includes(q) || norm(c.country).includes(q));
    renderResults(results, matches, (picked) => {
      input.value = formatCity(picked);
      closeResults(results);

      if (side === "from") fromChoice = picked;
      if (side === "to") toChoice = picked;

      // store
      localStorage.setItem("lane_from", fromChoice ? formatCity(fromChoice) : "");
      localStorage.setItem("lane_to", toChoice ? formatCity(toChoice) : "");

      setApplyState();
    });
  });

  input.addEventListener("focus", () => {
    const q = norm(input.value);
    if (!q) return;
    const matches = CITIES.filter((c) => norm(c.name).includes(q) || norm(c.country).includes(q));
    renderResults(results, matches, (picked) => {
      input.value = formatCity(picked);
      closeResults(results);

      if (side === "from") fromChoice = picked;
      if (side === "to") toChoice = picked;

      localStorage.setItem("lane_from", fromChoice ? formatCity(fromChoice) : "");
      localStorage.setItem("lane_to", toChoice ? formatCity(toChoice) : "");

      setApplyState();
    });
  });
}

// Click outside -> close dropdowns
document.addEventListener("click", (e) => {
  const fromBox = getEl("fromResults");
  const toBox = getEl("toResults");
  const fromInput = getEl("fromInput");
  const toInput = getEl("toInput");

  if (fromBox && fromInput && !fromBox.contains(e.target) && e.target !== fromInput) closeResults(fromBox);
  if (toBox && toInput && !toBox.contains(e.target) && e.target !== toInput) closeResults(toBox);
});

// Apply lane to hero form
getEl("laneApply")?.addEventListener("click", () => {
  if (!fromChoice || !toChoice) return;

  const pickup = getEl("pickupInput");
  const delivery = getEl("deliveryInput");

  if (pickup) pickup.value = formatCity(fromChoice);
  if (delivery) delivery.value = formatCity(toChoice);
});

// Reset
getEl("laneReset")?.addEventListener("click", () => {
  fromChoice = null;
  toChoice = null;

  localStorage.removeItem("lane_from");
  localStorage.removeItem("lane_to");

  const fromInput = getEl("fromInput");
  const toInput = getEl("toInput");
  if (fromInput) fromInput.value = "";
  if (toInput) toInput.value = "";

  closeResults(getEl("fromResults"));
  closeResults(getEl("toResults"));
  setApplyState();
});

// Init (only if lanes inputs exist on the page)
attachSearch("fromInput", "fromResults", "from");
attachSearch("toInput", "toResults", "to");
setApplyState();

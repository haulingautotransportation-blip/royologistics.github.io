// === Uzbekistan Cities (expandable list) ===
// I included a strong nationwide set (major freight nodes + regional centers).
// When you paste ru.html and uz.html, I’ll also localize city labels if needed.
const UZ_CITIES = [
  "Toshkent","Nurafshon","Yangiyo‘l","Chirchiq","Angren","Olmaliq","Bekobod","Ohangaron",
  "Samarqand","Kattaqo‘rg‘on","Urgut","Jomboy","Ishtixon","Payariq",
  "Buxoro","Kogon","G‘ijduvon","Vobkent","Qorako‘l","Gazli",
  "Navoiy","Zarafshon","Uchquduq","Karmana","Nurota",
  "Qarshi","Shahrisabz","G‘uzor","Koson","Kitob","Muborak",
  "Termiz","Denov","Sherobod","Boysun","Jarqo‘rg‘on",
  "Jizzax","Guliston","Sirdaryo","Yangiyer","Shirin",
  "Andijon","Asaka","Xonobod","Shahrixon","Qo‘rg‘ontepa","Marhamat",
  "Namangan","Chust","Pop","Uchqo‘rg‘on",
  "Farg‘ona","Marg‘ilon","Qo‘qon","Quvasoy","Rishton","Oltiariq",
  "Nukus","Xo‘jayli","To‘rtko‘l","Beruniy","Chimboy","Qo‘ng‘irot",
  "Urganch","Xiva","Pitnak","Hazorasp","Shovot",
  "Qo‘shko‘pir","Gurlan","Bog‘ot","Yangiariq","Xonqa"
];

function renderButtons(containerId, onPick) {
  const root = document.getElementById(containerId);
  if (!root) return;
  root.innerHTML = "";

  UZ_CITIES.forEach(city => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "city-btn";
    b.textContent = city;
    b.addEventListener("click", () => onPick(city, b));
    root.appendChild(b);
  });
}

function clearActive(containerId) {
  const root = document.getElementById(containerId);
  if (!root) return;
  root.querySelectorAll(".city-btn").forEach(b => b.classList.remove("active"));
}

let fromCity = null;
let toCity = null;

function refreshLane() {
  const fromEl = document.getElementById("fromSelected");
  const toEl = document.getElementById("toSelected");
  const applyBtn = document.getElementById("laneApply");

  if (fromEl) fromEl.textContent = fromCity || "—";
  if (toEl) toEl.textContent = toCity || "—";

  if (applyBtn) applyBtn.disabled = !(fromCity && toCity && fromCity !== toCity);
}

renderButtons("fromCities", (city, btn) => {
  fromCity = city;
  clearActive("fromCities");
  btn.classList.add("active");
  refreshLane();
});

renderButtons("toCities", (city, btn) => {
  toCity = city;
  clearActive("toCities");
  btn.classList.add("active");
  refreshLane();
});

document.getElementById("laneReset")?.addEventListener("click", () => {
  fromCity = null;
  toCity = null;
  clearActive("fromCities");
  clearActive("toCities");
  refreshLane();
});

document.getElementById("laneApply")?.addEventListener("click", () => {
  if (!fromCity || !toCity) return;

  // Fill hero form fields
  const pickup = document.getElementById("pickupInput");
  const delivery = document.getElementById("deliveryInput");
  if (pickup) pickup.value = fromCity + ", Uzbekistan";
  if (delivery) delivery.value = toCity + ", Uzbekistan";

  // Store for later pages
  localStorage.setItem("lane_from", fromCity);
  localStorage.setItem("lane_to", toCity);
});

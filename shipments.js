import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const emailEl = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");
const listEl = document.getElementById("shipmentsList");
const emptyEl = document.getElementById("shipmentsEmpty");
const carrierSummaryEl = document.getElementById("carrierSummary");

let allShipments = [];
let currentFilter = "all";
let carrierProfile = null;

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

function renderCarrierSummary() {
  if (!carrierSummaryEl) return;

  if (!carrierProfile) {
    carrierSummaryEl.style.display = "none";
    return;
  }

  carrierSummaryEl.style.display = "block";

  const name = carrierProfile.name || "-";
  const phone = carrierProfile.phone || "-";
  const vehicleType = carrierProfile.vehicleType || "-";
  const bodyType = carrierProfile.bodyType || "-";
  const capacity = carrierProfile.capacity || "-";
  const city = carrierProfile.city || "-";
  const routes = carrierProfile.routes || "-";

  carrierSummaryEl.innerHTML = `
    <h3 style="margin-top:0;">${name}</h3>
    <p style="margin:6px 0;">📞 ${phone}</p>
    <p style="margin:6px 0;">🚚 ${vehicleType} • ${bodyType} • ${capacity}t</p>
    <p style="margin:6px 0;">📍 ${city} • 🗺️ ${routes}</p>
  `;
}

function render() {
  listEl.innerHTML = "";

  const filtered = allShipments.filter(s => {
    if (currentFilter === "all") return true;
    return (s.status || "").toLowerCase() === currentFilter;
  });

  if (filtered.length === 0) {
    emptyEl.style.display = "block";
    return;
  }
  emptyEl.style.display = "none";

  const carrierLine = carrierProfile
    ? `${carrierProfile.name || ""}${carrierProfile.vehicleType ? " • " + carrierProfile.vehicleType : ""}`
    : "";

  filtered.forEach(s => {
    const pickup = s.pickupCity || "-";
    const delivery = s.deliveryCity || "-";
    const price = (s.price ?? "-");
    const status = (s.status || "pending");
    const createdAtText = s.createdAtText || "";

    const card = document.createElement("div");
    card.className = "dashboard-card";
    card.innerHTML = `
      <h3>${pickup} → ${delivery}</h3>
      <p>Status: <b>${status}</b></p>
      <p>Price: $${price}</p>
      ${carrierLine ? `<p style="opacity:.9;">Carrier: <b>${carrierLine}</b></p>` : ``}
      <p style="opacity:.85;">${createdAtText}</p>
      <button type="button" class="btn btn-small">Details</button>
    `;
    listEl.appendChild(card);
  });
}

function setupFilters() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render();
    });
  });
}

async function loadCarrierProfile(uid) {
  const snap = await getDoc(doc(db, "carriers", uid));
  carrierProfile = snap.exists() ? snap.data() : null;
  renderCarrierSummary();
}

async function loadShipments(uid) {
  const q = query(collection(db, "shipments"), where("carrierId", "==", uid));
  const snap = await getDocs(q);

  allShipments = snap.docs.map(d => {
    const data = d.data();
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
    return {
      id: d.id,
      ...data,
      createdAtText: createdAt ? `Created: ${createdAt.toLocaleString()}` : ""
    };
  });

  render();
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  emailEl.textContent = user.email ? `Logged in as: ${user.email}` : "";
  setupFilters();

  // Load profile first (so cards can show carrier line)
  await loadCarrierProfile(user.uid);
  await loadShipments(user.uid);
});

import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const emailEl = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");
const listEl = document.getElementById("shipmentsList");
const emptyEl = document.getElementById("shipmentsEmpty");

let allShipments = [];
let currentFilter = "all";

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

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

async function loadShipments(uid) {
  console.log("Filtering shipments for UID:", uid);

  const q = query(
    collection(db, "shipments"),
    where("carrierId", "==", uid)
  );

  const snap = await getDocs(q);
  console.log("Found shipments:", snap.size);

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
  await loadShipments(user.uid);
});

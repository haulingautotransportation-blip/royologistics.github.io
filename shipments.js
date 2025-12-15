import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const emailEl = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");
const listEl = document.getElementById("shipmentsList");
const emptyEl = document.getElementById("shipmentsEmpty");

let allShipments = [];
let currentFilter = "all";

/* Logout */
logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

/* RENDER SHIPMENTS */
function render() {
  listEl.innerHTML = "";

  /* 🔴 TEMP TEST SHIPMENT — REMOVE LATER */
  allShipments = [{
    pickupCity: "Test City",
    deliveryCity: "Test City 2",
    price: 999,
    status: "active",
    createdAtText: "TEST SHIPMENT"
  }];

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
    const card = document.createElement("div");
    card.className = "dashboard-card";
    card.innerHTML = `
      <h3>${s.pickupCity} → ${s.deliveryCity}</h3>
      <p>Status: <b>${s.status}</b></p>
      <p>Price: $${s.price}</p>
      <p style="opacity:.8;">${s.createdAtText}</p>
      <button class="btn btn-small">Details</button>
    `;
    listEl.appendChild(card);
  });
}

/* FILTER BUTTONS */
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

/* LOAD FROM FIRESTORE (WILL BE USED LATER) */
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
    return {
      id: d.id,
      ...data,
      createdAtText: "From Firestore"
    };
  });

  render();
}

/* AUTH */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  emailEl.textContent = `Logged in as: ${user.email}`;
  setupFilters();

  /* 🔴 TEMP: comment this out for now */
  // await loadShipments(user.uid);

  render();
});

import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  collection, query, where, orderBy, getDocs,
  doc, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const userEmailEl = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");
const listEl = document.getElementById("shipmentsList");
const emptyEl = document.getElementById("emptyState");

let currentUser = null;
let currentFilter = "active";

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

document.querySelectorAll(".filterBtn").forEach(btn => {
  btn.addEventListener("click", async () => {
    document.querySelectorAll(".filterBtn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    await loadShipments();
  });
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  userEmailEl.textContent = `Logged in as: ${user.email || ""}`;
  await loadShipments();
});

function normalizeStatus(load) {
  // you store status like "accepted" and also currentStatus like "Accepted"
  const s = String(load.status || "").toLowerCase();
  if (s === "accepted") return "accepted";
  if (s === "in_transit" || s === "in transit") return "in_transit";
  if (s === "delivered") return "delivered";
  return s || "accepted";
}

function labelStatus(s) {
  if (s === "accepted") return "Accepted";
  if (s === "in_transit") return "In Transit";
  if (s === "delivered") return "Delivered";
  return s;
}

function cardHTML(item) {
  const pickup = item.pickupCity || "-";
  const delivery = item.deliveryCity || "-";
  const price = Number(item.price || 0);
  const status = normalizeStatus(item);

  const nextAction =
    status === "accepted"
      ? `<button class="btn" data-action="to_in_transit" data-id="${item.id}">Mark In Transit</button>`
      : status === "in_transit"
      ? `<button class="btn" data-action="to_delivered" data-id="${item.id}">Mark Delivered</button>`
      : `<span class="muted">Completed</span>`;

  return `
    <div class="card" style="padding:16px;">
      <div style="display:flex; align-items:flex-start; gap:14px; flex-wrap:wrap;">
        <div style="flex:1; min-width:240px;">
          <h3 style="margin:0 0 6px;">${pickup} → ${delivery}</h3>
          <p class="muted" style="margin:0;">Load ID: <code>${item.id}</code></p>
          <p class="muted" style="margin:6px 0 0;">Status: <strong>${labelStatus(status)}</strong></p>
        </div>

        <div style="min-width:180px;">
          <p class="muted" style="margin:0 0 8px;">Price</p>
          <div style="font-size:22px; font-weight:700;">$${price.toLocaleString()}</div>
        </div>

        <div style="display:flex; gap:10px; align-items:center; margin-left:auto;">
          ${nextAction}
        </div>
      </div>
    </div>
  `;
}

async function loadShipments() {
  listEl.innerHTML = "";
  emptyEl.style.display = "none";

  // ✅ Shipments are accepted loads
  const q = query(
    collection(db, "loads"),
    where("acceptedBy", "==", currentUser.uid),
    orderBy("acceptedAt", "desc")
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    emptyEl.style.display = "block";
    return;
  }

  let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (currentFilter === "active") {
    items = items.filter(x => {
      const s = normalizeStatus(x);
      return s === "accepted" || s === "in_transit";
    });
  } else if (currentFilter === "delivered") {
    items = items.filter(x => normalizeStatus(x) === "delivered");
  }

  if (!items.length) {
    emptyEl.style.display = "block";
    return;
  }

  listEl.innerHTML = items.map(cardHTML).join("");

  listEl.querySelectorAll("button[data-action]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (!id) return;

      if (action === "to_in_transit") await setStatus(id, "in_transit", "In Transit");
      if (action === "to_delivered") await setStatus(id, "delivered", "Delivered");

      await loadShipments();
    });
  });
}

async function setStatus(loadId, status, currentStatusLabel) {
  await updateDoc(doc(db, "loads", loadId), {
    status,                 // "in_transit" / "delivered"
    currentStatus: currentStatusLabel,
    updatedAt: serverTimestamp()
  });
}

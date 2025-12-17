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

function cardHTML(s) {
  const statusLabel =
    s.status === "accepted" ? "Accepted" :
    s.status === "in_transit" ? "In Transit" :
    s.status === "delivered" ? "Delivered" : (s.status || "-");

  const nextAction =
    s.status === "accepted"
      ? `<button class="btn" data-action="to_in_transit" data-id="${s.id}">Mark In Transit</button>`
      : s.status === "in_transit"
      ? `<button class="btn" data-action="to_delivered" data-id="${s.id}">Mark Delivered</button>`
      : `<span class="muted">Completed</span>`;

  return `
    <div class="card" style="padding:16px;">
      <div style="display:flex; align-items:flex-start; gap:14px; flex-wrap:wrap;">
        <div style="flex:1; min-width:240px;">
          <h3 style="margin:0 0 6px;">${s.pickupCity || "-"} → ${s.deliveryCity || "-"}</h3>
          <p class="muted" style="margin:0;">Load ID: <code>${s.loadId || "-"}</code></p>
          <p class="muted" style="margin:6px 0 0;">Status: <strong>${statusLabel}</strong></p>
        </div>

        <div style="min-width:180px;">
          <p class="muted" style="margin:0 0 8px;">Price</p>
          <div style="font-size:22px; font-weight:700;">$${Number(s.price || 0).toLocaleString()}</div>
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

  const q = query(
    collection(db, "shipments"),
    where("carrierUid", "==", currentUser.uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    emptyEl.style.display = "block";
    return;
  }

  let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (currentFilter === "active") {
    items = items.filter(x => x.status === "accepted" || x.status === "in_transit");
  } else if (currentFilter === "delivered") {
    items = items.filter(x => x.status === "delivered");
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

      if (action === "to_in_transit") await setStatus(id, "in_transit");
      if (action === "to_delivered") await setStatus(id, "delivered");

      await loadShipments();
    });
  });
}

async function setStatus(id, status) {
  await updateDoc(doc(db, "shipments", id), {
    status,
    updatedAt: serverTimestamp()
  });
}

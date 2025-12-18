import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const loadsList = document.getElementById("loadsList");
const loadsEmpty = document.getElementById("loadsEmpty");
const logoutBtn = document.getElementById("logoutBtn");
const emailEl = document.getElementById("userEmail");

// nice labels for shipper view
function statusText(st) {
  const s = (st || "open").toLowerCase();
  if (s === "open") return "Open";
  if (s === "accepted") return "Accepted";
  if (s === "in_transit") return "In Transit";
  if (s === "delivered") return "Delivered";
  return s;
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }

  emailEl.textContent = user.email || "";

  // LIVE updates (no refresh)
  const q = query(
    collection(db, "loads"),
    where("shipperId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snap) => {
    loadsList.innerHTML = "";
    loadsEmpty.style.display = "none";

    if (snap.empty) {
      loadsEmpty.style.display = "block";
      return;
    }

    snap.forEach((docc) => {
      const d = docc.data();
      const st = statusText(d.status);

      const card = document.createElement("div");
      card.className = "shipment-card";
      card.innerHTML = `
        <strong>${d.pickupCity || "-"} → ${d.deliveryCity || "-"}</strong><br>
        ${d.equipment || "-"} | $${d.price ?? "-"}<br>
        Status: <b>${st}</b>
        ${d.acceptedByEmail ? `<br>Carrier: <span style="opacity:.8">${d.acceptedByEmail}</span>` : ""}
      `;

      loadsList.appendChild(card);
    });
  });
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("login.html");
});

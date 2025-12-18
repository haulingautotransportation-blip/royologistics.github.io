import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const loadsList = document.getElementById("loadsList");
const loadsEmpty = document.getElementById("loadsEmpty");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }

  const q = query(
    collection(db, "loads"),
    where("shipperId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    loadsEmpty.style.display = "block";
    return;
  }

  loadsList.innerHTML = "";

  snap.forEach(doc => {
    const d = doc.data();

    const card = document.createElement("div");
    card.className = "shipment-card";
    card.innerHTML = `
      <strong>${d.pickupCity} → ${d.deliveryCity}</strong><br>
      ${d.equipment} | $${d.price}<br>
      Status: <b>${d.status}</b>
    `;

    loadsList.appendChild(card);
  });
});

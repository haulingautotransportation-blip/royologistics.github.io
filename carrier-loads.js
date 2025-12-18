import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const form = document.getElementById("loadForm");

let readyUser = null;

onAuthStateChanged(auth, (user) => {
  readyUser = user || null;
  if (!user) window.location.replace("login.html");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    if (!readyUser) throw new Error("not-authenticated");

    const pickup = document.getElementById("pickup").value.trim();
    const delivery = document.getElementById("delivery").value.trim();
    const equipment = document.getElementById("equipment").value.trim();
    const price = Number(document.getElementById("price").value);

    const ref = await addDoc(collection(db, "loads"), {
      pickupCity: pickup,
      deliveryCity: delivery,
      equipment,
      price,
      status: "open",
      shipperId: readyUser.uid,
      shipperEmail: readyUser.email || "",
      createdAt: serverTimestamp()
    });

    alert("✅ Saved. ID: " + ref.id);
    window.location.replace("my-loads.html");
  } catch (err) {
    console.error(err);
    alert("❌ Create failed: " + (err.code || err.message));
  }
});

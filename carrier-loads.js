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

  if (!readyUser) {
    alert("Please login again.");
    window.location.replace("login.html");
    return;
  }

  const pickup = document.getElementById("pickup").value.trim();
  const delivery = document.getElementById("delivery").value.trim();
  const equipment = document.getElementById("equipment").value.trim();
  const price = Number(document.getElementById("price").value);

  try {
    await addDoc(collection(db, "loads"), {
      pickupCity: pickup,
      deliveryCity: delivery,
      equipment,
      price,
      status: "open",
      shipperId: readyUser.uid,
      shipperEmail: (readyUser.email || "").toLowerCase(),
      createdAt: serverTimestamp()
    });

    window.location.replace("my-loads.html");
  } catch (err) {
    console.error(err);
    alert("Failed to create load: " + (err.code || err.message));
  }
});

import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const form = document.getElementById("loadForm");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.replace("login.html");
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pickup = document.getElementById("pickup").value.trim();
  const delivery = document.getElementById("delivery").value.trim();
  const equipment = document.getElementById("equipment").value.trim();
  const price = Number(document.getElementById("price").value);

  if (!pickup || !delivery || !equipment || !price) return;

  try {
    await addDoc(collection(db, "loads"), {
      pickupCity: pickup,
      deliveryCity: delivery,
      equipment,
      price,
      status: "open",
      shipperId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });

    window.location.replace("shipper-dashboard.html");
  } catch (err) {
    alert("Failed to create load");
    console.error(err);
  }
});

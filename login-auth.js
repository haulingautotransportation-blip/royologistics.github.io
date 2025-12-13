import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// ---- IMPORTANT ----
// This script expects these input IDs in login.html:
//
// Carrier portal:
//   id="carrierEmail"   id="carrierPassword"   button id="carrierLoginBtn"
//
// Shipper portal:
//   id="shipperEmail"   id="shipperPassword"   button id="shipperLoginBtn"
//
// If your inputs don’t have these IDs yet, just add them in the HTML (no other change).

function byId(id) {
  return document.getElementById(id);
}

async function doLogin(role) {
  const emailEl = byId(role === "carrier" ? "carrierEmail" : "shipperEmail");
  const passEl  = byId(role === "carrier" ? "carrierPassword" : "shipperPassword");

  const email = (emailEl?.value || "").trim();
  const pass  = passEl?.value || "";

  if (!email || !pass) {
    alert("Please enter email and password.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, pass);

    // Redirect after login
    window.location.href = role === "carrier" ? "carrier.html" : "shipper.html";
  } catch (err) {
    alert(err?.message || "Login failed.");
  }
}

byId("carrierLoginBtn")?.addEventListener("click", (e) => {
  e.preventDefault();
  doLogin("carrier");
});

byId("shipperLoginBtn")?.addEventListener("click", (e) => {
  e.preventDefault();
  doLogin("shipper");
});

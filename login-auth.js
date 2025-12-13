import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

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

// Listen to FORM submits (works with Enter key + button)
byId("carrierLoginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  doLogin("carrier");
});

byId("shipperLoginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  doLogin("shipper");
});

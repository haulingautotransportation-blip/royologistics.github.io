import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

function byId(id) {
  return document.getElementById(id);
}

function setMsg(text) {
  // optional: you don't have a message box in login.html, so we use alert
  alert(text);
}

async function getUserRole(uid) {
  // We’ll read role from Firestore:
  // users/{uid} { role: "carrier" | "shipper" }
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return data?.role || null;
}

async function doLogin(expectedRole) {
  // Updated: Get email and password based on expected role (carrier or shipper)
  const emailEl = byId(expectedRole === "carrier" ? "carrierEmail" : "shipperEmail");
  const passEl  = byId(expectedRole === "carrier" ? "carrierPassword" : "shipperPassword");

  const email = (emailEl?.value || "").trim();
  const pass  = passEl?.value || "";

  if (!email || !pass) {
    setMsg("Please enter email and password.");
    return;
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);

    // Check role from Firestore
    const role = await getUserRole(cred.user.uid);

    if (!role) {
      setMsg("Your account profile is not set up yet. Please contact support.");
      return;
    }

    // If user used the wrong portal
    if (role !== expectedRole) {
      setMsg(`This account is a "${role}". Please log in using the ${role} portal.`);
      return;
    }

    // Correct redirect
    window.location.href =
      role === "carrier" ? "carrier-dashboard.html" : "shipper-dashboard.html";

  } catch (err) {
    setMsg(err?.message || "Login failed.");
  }
}

// Forms: Added event listeners for both carrier and shipper login forms
byId("carrierLoginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  doLogin("carrier");
});

byId("shipperLoginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  doLogin("shipper");
});

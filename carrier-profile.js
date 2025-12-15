import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const form = document.getElementById("carrierForm");
const statusEl = document.getElementById("status");
const userEmailEl = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

const fields = [
  "name","phone","email","vehicleType","bodyType","capacity",
  "plate","license","insuranceExpiry","city","routes","payment","notes"
];

function msg(text) {
  if (statusEl) statusEl.textContent = text;
}

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  if (userEmailEl) userEmailEl.textContent = `Logged in as: ${user.email || ""}`;
  await loadProfile(user.uid);
});

async function loadProfile(uid) {
  const ref = doc(db, "carriers", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = data[id] || "";
  });

  msg("Profile loaded");
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  msg("Saving...");

  const payload = { updatedAt: serverTimestamp() };

  fields.forEach(id => {
    const el = document.getElementById(id);
    payload[id] = el ? (el.value || "") : "";
  });

  await setDoc(doc(db, "carriers", user.uid), payload, { merge: true });
  msg("Saved successfully ✅");
});

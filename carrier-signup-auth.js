import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

function byId(id) {
  return document.getElementById(id);
}

function showMsg(text, ok = true) {
  const el = byId("carrierSignupMsg");
  if (!el) return;
  el.style.display = "block";
  el.textContent = text;
  el.style.opacity = "0.95";
  // If you want different colors later, we can style via CSS.
}

byId("carrierSignupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const company = (byId("carrierCompany")?.value || "").trim();
  const contact = (byId("carrierContact")?.value || "").trim();
  const email = (byId("carrierEmail")?.value || "").trim();
  const phone = (byId("carrierPhone")?.value || "").trim();
  const equipment = (byId("carrierEquipment")?.value || "").trim();
  const password = byId("carrierPassword")?.value || "";

  if (!company || !contact || !email || !phone || !password) {
    showMsg("Please fill all required fields.", false);
    return;
  }

  try {
    showMsg("Creating account...");

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Optional: set display name
    await updateProfile(cred.user, { displayName: contact });

    // Save carrier profile + role in Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      role: "carrier",
      company,
      contactName: contact,
      email,
      phone,
      equipmentType: equipment,
      createdAt: serverTimestamp(),
      status: "active"
    });

    showMsg("Account created! Redirecting...");
    window.location.href = "carrier-dashboard.html";
  } catch (err) {
    showMsg(err?.message || "Signup failed.", false);
  }
});

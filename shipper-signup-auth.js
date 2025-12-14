import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

function byId(id) {
  return document.getElementById(id);
}

function showMsg(text, ok = true) {
  // shipper signup page does not have a message box yet → alert is fine
  alert(text);
}

byId("shipperSignupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const company = (byId("shipperCompany")?.value || "").trim();
  const contact = (byId("shipperContact")?.value || "").trim();
  const email = (byId("shipperEmail")?.value || "").trim();
  const phone = (byId("shipperPhone")?.value || "").trim();
  const shippingType = (byId("shipperShippingType")?.value || "").trim();
  const password = byId("shipperPassword")?.value || "";

  if (!company || !contact || !email || !password) {
    showMsg("Please fill all required fields.", false);
    return;
  }

  try {
    showMsg("Creating account...");

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Optional display name
    await updateProfile(cred.user, { displayName: contact });

    // Save shipper profile + role
    await setDoc(doc(db, "users", cred.user.uid), {
      role: "shipper",
      company,
      contactName: contact,
      email,
      phone,
      shippingType,
      createdAt: serverTimestamp(),
      status: "active"
    });

    showMsg("Account created! Redirecting...");
    window.location.href = "shipper-dashboard.html";
  } catch (err) {
    showMsg(err?.message || "Signup failed.", false);
  }
});

import { auth, db } from "./firebase-services.js";

console.log("Firebase conectado correctamente");
console.log("Auth:", auth);
console.log("Firestore:", db);

const estadoFirebase = document.getElementById("estado-firebase");

if (estadoFirebase) {
  estadoFirebase.textContent = "Firebase conectado correctamente";
}
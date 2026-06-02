import { auth } from "./firebase-services.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { db } from "./firebase-services.js";

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const q = query(
      collection(db, "usuarios"),
      where("email", "==", email)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {

      const usuario = snapshot.docs[0].data();

      document.querySelector(".login-card").innerHTML = `
        <img src="assets/logo-agafona.png" class="logo">
        <h2>Bienvenido ${usuario.nombre}</h2>
        <p><strong>Rol:</strong> ${usuario.rol}</p>
        <p>Acceso correcto a AGAFONA</p>
      `;

    } else {

      loginMessage.textContent =
        "Usuario encontrado en Auth pero no en Firestore";

    }

  }catch (error) {
    console.error("Error de login:", error.code, error.message);
    loginMessage.textContent =
      "Error: " + error.code;
  }

});
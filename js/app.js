import { auth, db } from "./firebase-services.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  loginMessage.textContent = "Comprobando datos...";

  try {
    await signInWithEmailAndPassword(auth, email, password);

    const q = query(
      collection(db, "usuarios"),
      where("email", "==", email)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      loginMessage.textContent = "Usuario encontrado en Auth pero no en Firestore";
      return;
    }

    const usuario = snapshot.docs[0].data();

    if (!usuario.activo) {
      loginMessage.textContent = "Usuario desactivado";
      return;
    }

    mostrarDashboard(usuario);

  } catch (error) {
    console.error("Error:", error);
    loginMessage.textContent = "Error: " + error.code;
  }
});

function mostrarDashboard(usuario) {
  document.body.innerHTML = `
    <main class="app-page">

      <header class="app-header">
        <img src="assets/logo-agafona.png" alt="AGAFONA" class="app-logo">
        <button id="logout-button" class="logout-button">Salir</button>
      </header>

      <section class="welcome-card">
        <h1>Hola, ${usuario.nombre}</h1>
        <p>Rol: ${usuario.rol}</p>
      </section>

      <div id="content-area"></div>

      <nav class="bottom-nav">
        <button>🏠<span>Inicio</span></button>
        <button>📅<span>Actividades</span></button>
        <button>📷<span>Liga</span></button>
        <button>📄<span>Docs</span></button>
        <button>👤<span>Perfil</span></button>
      </nav>

    </main>
  `;

  document.getElementById("logout-button").addEventListener("click", async () => {
    await signOut(auth);
    location.reload();
  });

  mostrarInicio();

  document.querySelectorAll(".bottom-nav button")[0]
    .addEventListener("click", mostrarInicio);

  document.querySelectorAll(".bottom-nav button")[1]
    .addEventListener("click", mostrarActividades);

  document.querySelectorAll(".bottom-nav button")[2]
    .addEventListener("click", mostrarLiga);

  document.querySelectorAll(".bottom-nav button")[3]
    .addEventListener("click", mostrarDocumentos);

  document.querySelectorAll(".bottom-nav button")[4]
    .addEventListener("click", mostrarPerfil);
}


function mostrarInicio() {
  document.getElementById("content-area").innerHTML = `
    <section class="dashboard-grid">

      <article class="dashboard-card">
        <h2>Próxima actividad</h2>
        <p>No hay actividades publicadas todavía.</p>
      </article>

      <article class="dashboard-card">
        <h2>Liga fotográfica</h2>
        <p>Sin convocatoria activa.</p>
      </article>

      <article class="dashboard-card">
        <h2>Avisos</h2>
        <p>No hay avisos nuevos.</p>
      </article>

    </section>
  `;
}

function mostrarActividades() {
  document.getElementById("content-area").innerHTML = `
    <section class="dashboard-card">
      <h2>Actividades</h2>
      <p>Próximamente...</p>
    </section>
  `;
}

function mostrarLiga() {
  document.getElementById("content-area").innerHTML = `
    <section class="dashboard-card">
      <h2>Liga Fotográfica</h2>
      <p>Próximamente...</p>
    </section>
  `;
}

function mostrarDocumentos() {
  document.getElementById("content-area").innerHTML = `
    <section class="dashboard-card">
      <h2>Documentos</h2>
      <p>Próximamente...</p>
    </section>
  `;
}

function mostrarPerfil() {
  document.getElementById("content-area").innerHTML = `
    <section class="dashboard-card">
      <h2>Mi Perfil</h2>
      <p>Próximamente...</p>
    </section>
  `;
}
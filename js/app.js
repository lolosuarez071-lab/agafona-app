import { auth, db } from "./firebase-services.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp
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

  mostrarInicio(usuario);

  const botones = document.querySelectorAll(".bottom-nav button");

  botones[0].addEventListener("click", () => mostrarInicio(usuario));
  botones[1].addEventListener("click", () => mostrarActividades(usuario));
  botones[2].addEventListener("click", mostrarLiga);
  botones[3].addEventListener("click", mostrarDocumentos);
  botones[4].addEventListener("click", () => mostrarPerfil(usuario));
}

function mostrarInicio(usuario) {

  let descripcionRol = "";

  if (usuario.rol === "admin") {
    descripcionRol = `Socio nº ${usuario.numeroSocio ?? "-"} · Administrador`;
  } else {
    descripcionRol = `Socio nº ${usuario.numeroSocio ?? "-"}`;
  }
  document.getElementById("content-area").innerHTML = `

    <section class="welcome-card">
      <h1>Hola, ${usuario.nombre} 👋</h1>
      <p>Socio nº ${usuario.numeroSocio ?? "-"} · Administrador</p>
      </section>

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

async function mostrarActividades(usuario) {
  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>Actividades</h2>
      <p>Cargando actividades...</p>
    </section>
  `;

  try {
    const q = query(
      collection(db, "actividades"),
      where("activa", "==", true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      contentArea.innerHTML = `
        <section class="dashboard-card">
          <h2>Actividades</h2>
          <p>No hay actividades publicadas todavía.</p>
        </section>
      `;
      return;
    }

    let html = `<section class="dashboard-grid">`;

    snapshot.forEach((documento) => {
      const actividad = documento.data();

      const plazas = actividad.plazas ?? 0;
      const inscritos = actividad.inscritos ?? 0;
      const disponibles = plazas - inscritos;

      html += `
        <article class="dashboard-card actividad-card">
          <div class="actividad-fecha">
            📅 ${actividad.fecha}
          </div>

          <h2>${actividad.titulo}</h2>

          <p class="actividad-lugar">
            📍 ${actividad.lugar}
          </p>

          <p class="actividad-descripcion">
            ${actividad.descripcion}
          </p>

          <div class="actividad-datos">
            <span>👥 ${inscritos}/${plazas}</span>
            <span>✅ ${disponibles} plazas libres</span>
          </div>

         <button class="actividad-btn" data-id="${documento.id}">
         Inscribirme
         </button>
      `;
    });

    html += `</section>`;
    contentArea.innerHTML = html;

    document.querySelectorAll(".actividad-btn").forEach((boton) => {
      boton.addEventListener("click", async () => {
        const actividadId = boton.dataset.id;
        await inscribirseActividad(actividadId, usuario);
      });
    });

  } catch (error) {
    console.error("Error cargando actividades:", error);
    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>Actividades</h2>
        <p>Error al cargar las actividades.</p>
      </section>
    `;
  }
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

function mostrarPerfil(usuario) {
  document.getElementById("content-area").innerHTML = `
    <section class="dashboard-card">
      <h2>Mi Perfil</h2>
      <p><strong>Nombre:</strong> ${usuario.nombre}</p>
      <p><strong>Rol:</strong> ${usuario.rol}</p>
    </section>
  `;
}

async function inscribirseActividad(actividadId, usuario) {
  try {
    const q = query(
      collection(db, "inscripciones"),
      where("actividadId", "==", actividadId),
      where("email", "==", usuario.email)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      alert("Ya estás inscrito en esta actividad");
      return;
    }

    await addDoc(collection(db, "inscripciones"), {
      actividadId: actividadId,
      nombre: usuario.nombre,
      email: usuario.email,
      fechaInscripcion: serverTimestamp()
    });

    const actividadRef = doc(db, "actividades", actividadId);

    await updateDoc(actividadRef, {
      inscritos: increment(1)
    });

    alert("Inscripción realizada correctamente");

    mostrarActividades(usuario);

  } catch (error) {
    console.error("Error al inscribirse:", error);
    alert("No se ha podido realizar la inscripción");
  }
}
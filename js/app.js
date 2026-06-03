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
  botones[2].addEventListener("click", () => mostrarLiga(usuario));
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

    const inscripcionesQuery = query(
      collection(db, "inscripciones"),
      where("email", "==", usuario.email)
    );

    const inscripcionesSnapshot = await getDocs(inscripcionesQuery);

    const actividadesInscritas = [];

    inscripcionesSnapshot.forEach((doc) => {
      actividadesInscritas.push(doc.data().actividadId);
    });

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

      const yaInscrito = actividadesInscritas.includes(documento.id);

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

         <button 
          class="actividad-btn" 
          data-id="${documento.id}"
          ${yaInscrito ? "disabled" : ""}
         >
          ${yaInscrito ? "Ya inscrito" : "Inscribirme"}
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

async function mostrarLiga(usuario) {
  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>Liga Fotográfica</h2>
      <p>Cargando convocatoria...</p>
    </section>
  `;

  try {
    const q = query(
      collection(db, "convocatorias"),
      where("activa", "==", true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      contentArea.innerHTML = `
        <section class="dashboard-card">
          <h2>Liga Fotográfica</h2>
          <p>No hay convocatoria activa.</p>
        </section>
      `;
      return;
    }

    const convocatoria = snapshot.docs[0].data();

    const fotosQuery = query(
      collection(db, "fotos"),
      where("convocatoriaId", "==", convocatoria.codigo),
      where("email", "==", usuario.email),
      where("visible", "==", true)
    );

    const fotosSnapshot = await getDocs(fotosQuery);

    let bloqueFoto = "";
    let fotoDocId = null;

    if (fotosSnapshot.empty) {
      bloqueFoto = `
        <p><strong>Mi fotografía:</strong></p>
        <p>No has enviado ninguna fotografía.</p>

        <input type="file" id="foto-liga" accept="image/*">

        <button id="subir-foto-btn" class="actividad-btn">
          Subir fotografía
        </button>
      `;
    } else {
      const fotoDoc = fotosSnapshot.docs[0];
      const foto = fotoDoc.data();
      fotoDocId = fotoDoc.id;

      bloqueFoto = `
        <p><strong>Mi fotografía:</strong></p>
        <p>${foto.tituloFoto}</p>

        <a href="${foto.urlFoto}" target="_blank" class="documento-link">
          Ver fotografía
        </a>

        <br><br>

        <input type="file" id="foto-liga" accept="image/*">

        <button id="subir-foto-btn" class="actividad-btn">
          Cambiar fotografía
        </button>
      `;
    }

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>📷 Liga Fotográfica</h2>

        <h3>${convocatoria.titulo}</h3>

        <p>🟢 Convocatoria abierta</p>

        <p>
          Del ${convocatoria.fechaInicio}
          al
          ${convocatoria.fechaFin}
        </p>

        <hr>

        ${bloqueFoto}
      </section>
    `;

    document.getElementById("subir-foto-btn").addEventListener("click", () => {
      subirFotoLiga(usuario, convocatoria, fotoDocId);
    });

  } catch (error) {
    console.error(error);

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>Liga Fotográfica</h2>
        <p>Error al cargar la convocatoria.</p>
      </section>
    `;
  }
}

async function mostrarDocumentos() {

  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>Documentos</h2>
      <p>Cargando documentos...</p>
    </section>
  `;

  try {

    const q = query(
      collection(db, "documentos"),
      where("publico", "==", true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      contentArea.innerHTML = `
        <section class="dashboard-card">
          <h2>Documentos</h2>
          <p>No hay documentos disponibles.</p>
        </section>
      `;
      return;
    }

    let html = `
  <section class="dashboard-card">
    <h2>Documentos</h2>
    <p>Consulta estatutos, bases y documentación disponible para los socios.</p>
  </section>

  <section class="dashboard-grid">
`;

    snapshot.forEach((doc) => {

      const documento = doc.data();

      html += `
        <article class="dashboard-card">

          <h2>📄 ${documento.titulo}</h2>

          <div class="documento-categoria">
  ${documento.categoria}
</div>

<br>

<a
  href="${documento.url}"
  target="_blank"
  class="documento-link"
>
  📄 Abrir documento
</a>

        </article>
      `;
    });

    html += `</section>`;

    contentArea.innerHTML = html;

  } catch (error) {

    console.error(error);

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>Documentos</h2>
        <p>Error al cargar documentos.</p>
      </section>
    `;
  }
}

function mostrarPerfil(usuario) {
  const numeroSocio = usuario.numeroSocio ?? "-";

  let rolMostrado = "Socio";

  if (usuario.rol === "admin") {
    rolMostrado = "Administrador";
  } else if (usuario.rol === "jurado") {
    rolMostrado = "Jurado";
  } else if (usuario.rol === "directiva") {
    rolMostrado = "Directiva";
  }

  document.getElementById("content-area").innerHTML = `
    <section class="dashboard-card perfil-card">
      <h2>Mi Perfil</h2>

      <div class="perfil-dato">
        <strong>Nombre</strong>
        <span>${usuario.nombre}</span>
      </div>

      <div class="perfil-dato">
        <strong>Apellidos</strong>
        <span>${usuario.apellidos ?? "-"}</span>
      </div>

      <div class="perfil-dato">
        <strong>Email</strong>
        <span>${usuario.email}</span>
      </div>

      <div class="perfil-dato">
  <strong>Nº de socio</strong>
  <span>${numeroSocio}</span>
</div>

<div class="perfil-dato">
  <strong>Estado cuota</strong>
  <span>${usuario.estadoCuota ?? "No informado"}</span>
</div>

<div class="perfil-dato">
  <strong>Perfil</strong>
  <span>${rolMostrado}</span>
</div>

      <div class="perfil-dato">
        <strong>Estado</strong>
        <span>${usuario.activo ? "Activo" : "Inactivo"}</span>
      </div>
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

async function subirFotoLiga(usuario, convocatoria, fotoDocId) {
  const CLOUD_NAME = "dbamev2pv";
  const UPLOAD_PRESET = "agafona_liga";

  const input = document.getElementById("foto-liga");
  const archivo = input.files[0];

  if (!archivo) {
    alert("Selecciona una fotografía primero");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("upload_preset", UPLOAD_PRESET);

    const respuesta = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    const datos = await respuesta.json();

    const datosFoto = {
      convocatoriaId: convocatoria.codigo,
      email: usuario.email,
      nombreSocio: `${usuario.nombre} ${usuario.apellidos ?? ""}`,
      numeroSocio: usuario.numeroSocio ?? null,
      tituloFoto: archivo.name,
      nombreArchivo: archivo.name,
      urlFoto: datos.secure_url,
      fechaSubida: serverTimestamp(),
      estado: "enviada",
      puntuacionFinal: 0,
      visible: true
    };

    if (fotoDocId) {
      const fotoRef = doc(db, "fotos", fotoDocId);
      await updateDoc(fotoRef, datosFoto);
      alert("Fotografía cambiada correctamente");
    } else {
      await addDoc(collection(db, "fotos"), datosFoto);
      alert("Fotografía subida correctamente");
    }

    mostrarLiga(usuario);

  } catch (error) {
    console.error("Error subiendo fotografía:", error);
    alert("No se ha podido subir la fotografía");
  }
}
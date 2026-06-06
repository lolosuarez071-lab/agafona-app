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
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
  orderBy
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

    localStorage.setItem("usuarioAgafona", JSON.stringify(usuario));

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
  ${
    usuario.rol === "admin" || usuario.rol === "directiva"
      ? `<button>⚙️<span>Admin</span></button>`
      : ""
  }
  <button>👤<span>Perfil</span></button>
</nav>

    </main>
  `;

  document.getElementById("logout-button").addEventListener("click", async () => {
    await signOut(auth);
    localStorage.removeItem("usuarioAgafona");
    location.reload();
  });

  mostrarInicio(usuario);

  const botones = document.querySelectorAll(".bottom-nav button");

botones[0].addEventListener("click", () => mostrarInicio(usuario));
botones[1].addEventListener("click", () => mostrarActividades(usuario));
botones[2].addEventListener("click", () => mostrarLiga(usuario));
botones[3].addEventListener("click", () => mostrarDocumentos());

if (usuario.rol === "admin" || usuario.rol === "directiva") {
  botones[4].addEventListener("click", () => mostrarAdmin(usuario));
  botones[5].addEventListener("click", () => mostrarPerfil(usuario));
} else {
  botones[4].addEventListener("click", () => mostrarPerfil(usuario));
}

}


async function mostrarInicio(usuario) {

  let descripcionRol = "";

  if (usuario.rol === "admin") {
    descripcionRol = `Socio nº ${usuario.numeroSocio ?? "-"} · Administrador`;
  } else {
    descripcionRol = `Socio nº ${usuario.numeroSocio ?? "-"}`;
  }

  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
    <section class="welcome-card">
      <h1>Hola, ${usuario.nombre} 👋</h1>
      <p>${descripcionRol}</p>
    </section>

    <section class="dashboard-card">
      <h2>Inicio</h2>
      <p>Cargando información...</p>
    </section>
  `;

  try {
    const actividadesQuery = query(
      collection(db, "actividades"),
      where("activa", "==", true)
    );

    const actividadesSnapshot = await getDocs(actividadesQuery);

let actividadHtml = "";

const hoy = new Date().toISOString().split("T")[0];

const actividadesValidas = actividadesSnapshot.docs.filter(doc => {
  const actividad = doc.data();
  return actividad.fecha >= hoy;
});

if (actividadesValidas.length === 0) {

      actividadHtml = `
        <article class="dashboard-card">
          <h2>Próxima actividad</h2>
          <p>No hay actividades publicadas todavía.</p>
        </article>
      `;
    } else {
      const actividad = actividadesValidas[0].data();

      actividadHtml = `
        <article class="dashboard-card">
          <h2>Próxima actividad</h2>
          <p><strong>${actividad.titulo}</strong></p>
          <p>📅 ${actividad.fecha}</p>
          <p>📍 ${actividad.lugar}</p>
        </article>
      `;
    }

    const convocatoriaQuery = query(
      collection(db, "convocatorias"),
      where("activa", "==", true)
    );

    const convocatoriaSnapshot = await getDocs(convocatoriaQuery);

    let ligaHtml = "";

    if (convocatoriaSnapshot.empty) {

      ligaHtml = `
        <article class="dashboard-card">
          <h2>Liga Fotográfica</h2>
          <p>Sin convocatoria activa.</p>
        </article>
      `;

    } else {

      const convocatoria = convocatoriaSnapshot.docs[0].data();

      const fotoQuery = query(
        collection(db, "fotos"),
        where("email", "==", usuario.email),
        where("convocatoriaId", "==", convocatoria.codigo)
      );

      const fotoSnapshot = await getDocs(fotoQuery);

      let estadoFoto = "⚠️ No has enviado fotografía";

      if (!fotoSnapshot.empty) {
        estadoFoto = `📷 ${fotoSnapshot.docs[0].data().tituloFoto}`;
      }

      ligaHtml = `
        <article class="dashboard-card">
          <h2>📷 Liga Fotográfica</h2>
    
          <p><strong>${convocatoria.titulo}</strong></p>
    
          <p>🟢 Convocatoria ${convocatoria.estado}</p>
    
          <p>📅 Hasta ${convocatoria.fechaFin}</p>
    
          <p>${estadoFoto}</p>
    
        </article>
      `;
    }

    const avisosQuery = query(
      collection(db, "avisos"),
      where("activo", "==", true)
    );

    const avisosSnapshot = await getDocs(avisosQuery);

let avisosHtml = "";

const avisosValidos = avisosSnapshot.docs.filter(doc => {
  const aviso = doc.data();
  return aviso.fecha >= hoy;
});

if (avisosValidos.length === 0) {

      avisosHtml = `
        <article class="dashboard-card">
          <h2>Avisos</h2>
          <p>No hay avisos nuevos.</p>
        </article>
      `;
    } else {
      avisosValidos.forEach((doc) => {
        const aviso = doc.data();

       avisosHtml += `
  <article class="dashboard-card">
    <h2>📢 Aviso</h2>
    <h3>${aviso.titulo}</h3>
    <p>${aviso.mensaje}</p>
    <p><strong>Fecha:</strong> ${aviso.fecha}</p>
  </article>
`;
      });
    }

    contentArea.innerHTML = `
  <section class="welcome-card">
    <h1>Hola, ${usuario.nombre} 👋</h1>
    <p>${descripcionRol}</p>

    <br>

    <p>
       Bienvenido/a a la app AGAFONA.
      Ya está disponible la primera versión de prueba para socios.
    </p>

  </section>

  <section class="dashboard-grid">
    ${actividadHtml}
    ${ligaHtml}
    ${avisosHtml}
  </section>
`;

  } catch (error) {
    console.error("Error cargando inicio:", error);

    contentArea.innerHTML = `
      <section class="welcome-card">
        <h1>Hola, ${usuario.nombre} 👋</h1>
        <p>${descripcionRol}</p>
      </section>

      <section class="dashboard-card">
        <h2>Inicio</h2>
        <p>Error al cargar la información.</p>
      </section>
    `;
  }
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
    const actividadesQuery = query(
      collection(db, "actividades"),
      where("activa", "==", true)
    );

    const actividadesSnapshot = await getDocs(actividadesQuery);

    let actividadesHtml = "";

    if (actividadesSnapshot.empty) {
      actividadesHtml = `
        <section class="dashboard-card">
          <h2>Actividades</h2>
          <p>No hay actividades disponibles.</p>
        </section>
      `;
    } else {
      actividadesHtml = `<section class="dashboard-grid">`;

      for (const docActividad of actividadesSnapshot.docs) {
        const actividadId = docActividad.id;
        const actividad = docActividad.data();

        const hoy = new Date().toISOString().split("T")[0];

      if (actividad.fecha < hoy) continue;

        const inscripcionQuery = query(
          collection(db, "inscripciones"),
          where("actividadId", "==", actividadId),
          where("email", "==", usuario.email)
        );

        const inscripcionSnapshot = await getDocs(inscripcionQuery);

        let botonInscripcion = "";

        if (inscripcionSnapshot.empty) {
          botonInscripcion = `
            <button onclick="inscribirseActividad('${actividadId}')">
              Inscribirme
            </button>
          `;
        } else {
          botonInscripcion = `
            <p><strong>Estado:</strong> Ya inscrito</p>
          `;
        }

        let botonInscritos = "";

        if (usuario.rol === "admin" || usuario.rol === "directiva") {
          botonInscritos = `
            <button onclick="verInscritosActividad('${actividadId}')">
              Ver inscritos
            </button>
          `;
        }

        actividadesHtml += `
          <article class="dashboard-card">
            <h3>📅 ${actividad.titulo ?? "Actividad"}</h3>
            <p>📅 ${actividad.fecha ?? ""}</p>
            <p>📍 ${actividad.lugar ?? ""}</p>
            <p>${actividad.descripcion ?? ""}</p>
            <p><strong>Inscritos:</strong> ${actividad.inscritos ?? 0}</p>

            ${botonInscripcion}
            ${botonInscritos}
          </article>
        `;
      }

      actividadesHtml += `</section>`;
    }

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>Actividades</h2>
      </section>

      ${actividadesHtml}
    `;

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

window.mostrarActividades = mostrarActividades;

async function verInscritosActividad(actividadId) {
  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>Inscritos</h2>
      <p>Cargando lista de inscritos...</p>
    </section>
  `;

  try {
    const q = query(
      collection(db, "inscripciones"),
      where("actividadId", "==", actividadId)
    );

    const snapshot = await getDocs(q);

    let inscritosHtml = "";

    if (snapshot.empty) {
      inscritosHtml = `<p>No hay inscritos todavía.</p>`;
    } else {
      let contador = 1;

      snapshot.forEach((doc) => {
        const inscrito = doc.data();

        inscritosHtml += `
  <p>
    <strong>${contador}.</strong>
    ${inscrito.nombre} ${inscrito.apellidos ?? ""}
    <br>
    <small>${inscrito.email ?? ""}</small>
  </p>
`;

        contador++;
      });
    }

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>Lista de inscritos</h2>
        ${inscritosHtml}

        <button onclick="mostrarActividadesDesdeBoton()">
          Volver
        </button>
      </section>
    `;

  } catch (error) {
    console.error("Error cargando inscritos:", error);

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>Inscritos</h2>
        <p>Error al cargar la lista de inscritos.</p>
      </section>
    `;
  }
}

window.verInscritosActividad = verInscritosActividad;

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

    const clasificacionQuery = query(
      collection(db, "clasificaciones"),
      where("convocatoriaId", "==", convocatoria.codigo),
      where("visible", "==", true),
      orderBy("posicion", "asc")
    );

    const clasificacionSnapshot = await getDocs(clasificacionQuery);

    console.log(
      "Clasificaciones encontradas:",
      clasificacionSnapshot.docs.length
    );
    clasificacionSnapshot.forEach((doc) => {
      console.log(doc.data());
    });

    let clasificacionHtml = "";

    if (clasificacionSnapshot.empty) {
      clasificacionHtml = `
          <p>No hay clasificación publicada todavía.</p>
        `;
    } else {
      clasificacionHtml = `
          <hr>
          <h3>🏆 Clasificación provisional</h3>
        `;

      clasificacionSnapshot.forEach((doc) => {
        const item = doc.data();

        clasificacionHtml += `
            <p>
              <strong>${item.posicion}.</strong>
              ${item.nombreSocio}
              — ${item.puntos} puntos
            </p>
          `;
      });
    }

    let bloqueFoto = "";
    let fotoDocId = null;

    if (fotosSnapshot.empty) {
      bloqueFoto = `
          <p><strong>Mi fotografía:</strong></p>
          <p>No has enviado ninguna fotografía.</p>
      
          <label for="titulo-foto">
          <strong>Título de la fotografía</strong>
          </label>

          <input
          type="text"
          id="titulo-foto"
          placeholder="Ejemplo: Avoceta al amanecer"
          required
          >
      
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
         <p><strong>Fotografía presentada:</strong></p>
        <p>${foto.tituloFoto}</p>

        <img
          src="${foto.urlFoto}"
          alt="${foto.tituloFoto}"
          class="miniatura-foto"
        >

          <br><br>
      
          <a href="${foto.urlFoto}" target="_blank" class="documento-link">
            Ver fotografía
          </a>
      
          <br><br>
      
          <label for="titulo-foto">
          <strong>Título de la fotografía</strong>
          </label>

          <input
          type="text"
          id="titulo-foto"
          value="${foto.tituloFoto ?? ""}"
          placeholder="Ejemplo: Avoceta al amanecer"
          required
          >
      
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

          ${clasificacionHtml}

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
  const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));
  const contentArea = document.getElementById("content-area");

  if (!usuario) {
    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>Documentos</h2>
        <p>No se ha encontrado el usuario conectado.</p>
      </section>
    `;
    return;
  }

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>Documentos</h2>
      <p>Cargando documentos...</p>
    </section>
  `;

  try {
    const q = query(
      collection(db, "documentos")
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

      const puedeVer =
        documento.visiblePara === "socios" ||
        documento.visiblePara === usuario.rol ||
        usuario.rol === "admin";

      if (!puedeVer) return;

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
async function mostrarPerfil(usuario) {
  const numeroSocio = usuario.numeroSocio ?? "-";

  let rolMostrado = "Socio";

  if (usuario.rol === "admin") {
    rolMostrado = "Administrador";
  } else if (usuario.rol === "jurado") {
    rolMostrado = "Jurado";
  } else if (usuario.rol === "directiva") {
    rolMostrado = "Directiva";
  }

  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>Mi Perfil</h2>
      <p>Cargando perfil...</p>
    </section>
  `;

  try {
    const inscripcionesQuery = query(
      collection(db, "inscripciones"),
      where("email", "==", usuario.email)
    );

    const inscripcionesSnapshot = await getDocs(inscripcionesQuery);

    let actividadesHtml = "";

    if (inscripcionesSnapshot.empty) {
      actividadesHtml = `
        <p>No tienes actividades inscritas.</p>
      `;
    } else {
      actividadesHtml = `<section class="dashboard-grid">`;

      for (const docInscripcion of inscripcionesSnapshot.docs) {
        const inscripcion = docInscripcion.data();

        const actividadRef = doc(db, "actividades", inscripcion.actividadId);
        const actividadSnap = await getDoc(actividadRef);

        let tituloActividad = "Actividad inscrita";
        let fechaActividad = "";
        let lugarActividad = "";

        if (actividadSnap.exists()) {
          const actividad = actividadSnap.data();

          tituloActividad = actividad.titulo ?? "Actividad inscrita";
          fechaActividad = actividad.fecha ?? "";
          lugarActividad = actividad.lugar ?? "";
        }

        actividadesHtml += `
  <article class="dashboard-card">
    <h3>📅 ${tituloActividad}</h3>
    <p>📅 ${fechaActividad}</p>
    <p>📍 ${lugarActividad}</p>
    <p><strong>Estado:</strong> Inscrito</p>

    <button onclick="cancelarInscripcion('${inscripcion.actividadId}')">
      Cancelar inscripción
    </button>
  </article>
`;
      }

      actividadesHtml += `</section>`;
    }

    contentArea.innerHTML = `
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

      <section class="dashboard-card">
        <h2>Mis actividades</h2>
        ${actividadesHtml}
      </section>
    `;

  } catch (error) {
    console.error("Error cargando perfil:", error);

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>Mi Perfil</h2>
        <p>Error al cargar el perfil.</p>
      </section>
    `;
  }
}

async function inscribirseActividad(actividadId) {
  const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));

  if (!usuario) {
    alert("No se ha encontrado el usuario conectado");
    return;
  }

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
      apellidos: usuario.apellidos ?? "",
      email: usuario.email,
      fechaInscripcion: serverTimestamp()
    });

    const actividadRef = doc(db, "actividades", actividadId);

    await updateDoc(actividadRef, {
      inscritos: increment(1)
    });

    alert("Inscripción realizada correctamente");

    const usuarioGuardado = JSON.parse(localStorage.getItem("usuarioAgafona"));
    mostrarActividades(usuarioGuardado);


  } catch (error) {
    console.error("Error al inscribirse:", error);
    alert("No se ha podido realizar la inscripción");
  }
}

window.inscribirseActividad = inscribirseActividad;

async function subirFotoLiga(usuario, convocatoria, fotoDocId) {
  const CLOUD_NAME = "dbamev2pv";
  const UPLOAD_PRESET = "agafona_liga";

  const input = document.getElementById("foto-liga");
  const archivo = input.files[0];

  const tituloFoto = document.getElementById("titulo-foto").value.trim();

  if (!tituloFoto) {
    alert("Escribe un título para la fotografía");
    return;
  }

  if (!archivo) {
    alert("Selecciona una fotografía primero");
    return;
  }

  const boton = document.getElementById("subir-foto-btn");
  boton.disabled = true;
  boton.textContent = "Subiendo fotografía...";

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
      tituloFoto: tituloFoto,
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

    boton.disabled = false;
    boton.textContent = fotoDocId ? "Cambiar fotografía" : "Subir fotografía";

    alert("No se ha podido subir la fotografía");
  }
}

function mostrarActividadesDesdeBoton() {
  const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));

  if (!usuario) {
    alert("No se ha encontrado el usuario conectado");
    return;
  }

  mostrarActividades(usuario);
}

window.mostrarActividadesDesdeBoton = mostrarActividadesDesdeBoton;

async function cancelarInscripcion(actividadId) {
  const confirmar = confirm("¿Seguro que quieres cancelar esta inscripción?");

  if (!confirmar) return;

  try {
    const emailUsuario = auth.currentUser.email;

    const q = query(
      collection(db, "inscripciones"),
      where("actividadId", "==", actividadId),
      where("email", "==", emailUsuario)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("No se encontró la inscripción");
      return;
    }

    await deleteDoc(
      doc(db, "inscripciones", snapshot.docs[0].id)
    );

    const actividadRef = doc(db, "actividades", actividadId);

    await updateDoc(actividadRef, {
      inscritos: increment(-1)
    });

    alert("Inscripción cancelada correctamente");

    location.reload();

  } catch (error) {
    console.error("Error al cancelar la inscripción:", error);
    alert("No se ha podido cancelar la inscripción");
  }
}

window.cancelarInscripcion = cancelarInscripcion;

function mostrarAdmin(usuario) {
  const contentArea = document.getElementById("content-area");

  if (usuario.rol !== "admin" && usuario.rol !== "directiva") {
    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>Administración</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
      </section>
    `;
    return;
  }

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>⚙️ Panel de Administración</h2>
      <p>Gestión interna de AGAFONA.</p>
    </section>

    <section class="dashboard-grid">
      <article class="dashboard-card">
        <h3>📅 Actividades</h3>
        <p>Crear nuevas actividades para los socios.</p>
        <button onclick="mostrarFormularioActividad()">
          Crear actividad
        </button>
      </article>

      <article class="dashboard-card">
        <h3>📢 Avisos</h3>
        <p>Publicar avisos importantes en el inicio.</p>
        <button onclick="mostrarFormularioAviso()">
          Crear aviso
        </button>
      </article>

      <article class="dashboard-card">
        <h3>📄 Documentos</h3>
        <p>Añadir documentos visibles para socios o directiva.</p>
        <button onclick="mostrarFormularioDocumento()">
          Añadir documento
        </button>
      </article>

      <article class="dashboard-card">
  <h3>📋 Gestionar actividades</h3>
  <p>Ver actividades creadas y desactivar actividades.</p>

  <button onclick="mostrarGestionActividades()">
    Gestionar actividades
  </button>
</article>

<article class="dashboard-card">
  <h3>📢 Gestionar avisos</h3>

  <p>
    Ver avisos creados y desactivar avisos antiguos.
  </p>

  <button onclick="mostrarGestionAvisos()">
    Gestionar avisos
  </button>

</article>

<article class="dashboard-card">
  <h3>📄 Gestionar documentos</h3>

  <p>
    Ver documentos creados y desactivar los que ya no estén disponibles.
  </p>

  <button onclick="mostrarGestionDocumentos()">
    Gestionar documentos
  </button>
</article>

<article class="dashboard-card">
  <h3>👥 Gestión de usuarios</h3>

  <p>
    Consultar usuarios, cambiar roles y desactivar accesos.
  </p>

  <button onclick="mostrarGestionUsuarios()">
    Gestionar usuarios
  </button>

</article>

    </section>
  `;
}

window.mostrarAdmin = mostrarAdmin;

function mostrarFormularioDocumento() {

  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
    <section class="dashboard-card">

      <h2>📄 Nuevo documento</h2>

      <label>Título</label>
      <input type="text" id="doc-titulo">

      <label>Categoría</label>
      <input type="text" id="doc-categoria">

      <label>URL</label>
      <input type="text" id="doc-url">

      <label>Visible para</label>

      <select id="doc-visible">
        <option value="socios">Socios</option>
        <option value="directiva">Directiva</option>
        <option value="admin">Admin</option>
      </select>

      <br><br>

      <button onclick="guardarDocumento()">
        Guardar documento
      </button>

      <button onclick="volverAdmin()">
        Volver
      </button>

    </section>
  `;
}

window.mostrarFormularioDocumento = mostrarFormularioDocumento;

async function guardarDocumento() {

  const titulo =
    document.getElementById("doc-titulo").value.trim();

  const categoria =
    document.getElementById("doc-categoria").value.trim();

  const url =
    document.getElementById("doc-url").value.trim();

  const visiblePara =
    document.getElementById("doc-visible").value;

  if (!titulo || !categoria || !url) {

    alert("Completa todos los campos.");
    return;
  }

  try {

    await addDoc(collection(db, "documentos"), {

      titulo,
      categoria,
      url,
      visiblePara,
      publico: true

    });

    alert("Documento creado correctamente.");

    const usuario =
      JSON.parse(localStorage.getItem("usuarioAgafona"));

    mostrarAdmin(usuario);

  } catch (error) {

    console.error(error);

    alert("No se pudo guardar el documento.");
  }
}

window.guardarDocumento = guardarDocumento;

function mostrarFormularioActividad() {
  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>📅 Crear actividad</h2>

      <label>Título</label>
      <input type="text" id="actividad-titulo" placeholder="Ejemplo: Salida fotográfica en La Janda">

      <label>Fecha</label>
      <input type="date" id="actividad-fecha">

      <label>Lugar</label>
      <input type="text" id="actividad-lugar" placeholder="Ejemplo: Benalup">

      <label>Descripción</label>
      <textarea id="actividad-descripcion" placeholder="Descripción de la actividad"></textarea>

      <label>Plazas</label>
      <input type="number" id="actividad-plazas" placeholder="Ejemplo: 25">

      <button onclick="guardarActividad()">
        Guardar actividad
      </button>

      <button onclick="volverAdmin()">
        Volver
      </button>
    </section>
  `;
}

window.mostrarFormularioActividad = mostrarFormularioActividad;

async function guardarActividad() {
  const titulo = document.getElementById("actividad-titulo").value.trim();
  const fecha = document.getElementById("actividad-fecha").value;
  const lugar = document.getElementById("actividad-lugar").value.trim();
  const descripcion = document.getElementById("actividad-descripcion").value.trim();
  const plazas = Number(document.getElementById("actividad-plazas").value);

  if (!titulo || !fecha || !lugar || !descripcion) {
    alert("Completa los campos obligatorios.");
    return;
  }

  try {
    await addDoc(collection(db, "actividades"), {
      titulo,
      fecha,
      lugar,
      descripcion,
      plazas: plazas || 0,
      inscritos: 0,
      activa: true,
      fechaCreacion: serverTimestamp()
    });

    alert("Actividad creada correctamente.");

    const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));
    mostrarAdmin(usuario);

  } catch (error) {
    console.error("Error creando actividad:", error);
    alert("No se pudo crear la actividad.");
  }
}

window.guardarActividad = guardarActividad;

function volverAdmin() {
  const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));
  mostrarAdmin(usuario);
}

window.volverAdmin = volverAdmin;

function mostrarFormularioAviso() {
  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>📢 Crear aviso</h2>

      <label>Título</label>
      <input type="text" id="aviso-titulo">

      <label>Mensaje</label>
      <textarea id="aviso-mensaje"></textarea>

      <label>Fecha</label>
      <input type="date" id="aviso-fecha">

      <button onclick="guardarAviso()">
        Guardar aviso
      </button>

      <button onclick="volverAdmin()">
        Volver
      </button>
    </section>
  `;
}

window.mostrarFormularioAviso = mostrarFormularioAviso;

async function guardarAviso() {

  const titulo = document.getElementById("aviso-titulo").value.trim();
  const mensaje = document.getElementById("aviso-mensaje").value.trim();
  const fecha = document.getElementById("aviso-fecha").value;

  if (!titulo || !mensaje || !fecha) {
    alert("Completa todos los campos.");
    return;
  }

  try {

    await addDoc(collection(db, "avisos"), {
      titulo,
      mensaje,
      fecha,
      activo: true,
      fechaCreacion: serverTimestamp()
    });

    alert("Aviso creado correctamente.");

    const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));
    mostrarAdmin(usuario);

  } catch (error) {

    console.error("Error creando aviso:", error);
    alert("No se pudo crear el aviso.");
  }
}

window.guardarAviso = guardarAviso;

async function mostrarGestionActividades() {

  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>📋 Gestionar actividades</h2>
      <p>Cargando actividades...</p>
    </section>
  `;

  try {

    const q = query(collection(db, "actividades"));
    const snapshot = await getDocs(q);

    let html = `
      <section class="dashboard-card">
        <h2>📋 Gestionar actividades</h2>
      </section>

      <section class="dashboard-grid">
    `;

    snapshot.forEach((docActividad) => {

      const actividad = docActividad.data();
      const actividadId = docActividad.id;

      html += `
        <article class="dashboard-card">

          <h3>${actividad.titulo}</h3>

          <p>📅 ${actividad.fecha}</p>

          <p>📍 ${actividad.lugar}</p>

          <p>
            <strong>Inscritos:</strong>
            ${actividad.inscritos ?? 0}
          </p>

          <p>
            <strong>Estado:</strong>
            ${actividad.activa ? "Activa" : "Inactiva"}
          </p>

          <button onclick="desactivarActividad('${actividadId}')">
            Desactivar actividad
          </button>

        </article>
      `;
    });

    html += `
      </section>

      <section class="dashboard-card">
        <button onclick="volverAdmin()">
          Volver
        </button>
      </section>
    `;

    contentArea.innerHTML = html;

  } catch (error) {

    console.error(error);

    alert("Error cargando actividades");

  }
}

window.mostrarGestionActividades = mostrarGestionActividades;

async function desactivarActividad(actividadId) {

  const confirmar = confirm(
    "¿Seguro que quieres desactivar esta actividad?"
  );

  if (!confirmar) return;

  try {

    const actividadRef =
      doc(db, "actividades", actividadId);

    await updateDoc(actividadRef, {
      activa: false
    });

    alert("Actividad desactivada correctamente");

    mostrarGestionActividades();

  } catch (error) {

    console.error(error);

    alert("No se pudo desactivar la actividad");

  }
}

window.desactivarActividad = desactivarActividad;


async function desactivarAviso(avisoId) {

  const confirmar = confirm(
    "¿Seguro que quieres desactivar este aviso?"
  );

  if (!confirmar) return;

  try {

    const avisoRef =
      doc(db, "avisos", avisoId);

    await updateDoc(avisoRef, {
      activo: false
    });

    alert("Aviso desactivado correctamente");

    mostrarGestionAvisos();

  } catch (error) {

    console.error(error);

    alert("No se pudo desactivar el aviso");

  }
}

window.desactivarAviso = desactivarAviso;

async function mostrarGestionAvisos() {
  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>📢 Gestionar avisos</h2>
      <p>Cargando avisos...</p>
    </section>
  `;

  try {
    const q = query(collection(db, "avisos"));
    const snapshot = await getDocs(q);

    let html = `
      <section class="dashboard-card">
        <h2>📢 Gestionar avisos</h2>
      </section>

      <section class="dashboard-grid">
    `;

    snapshot.forEach((docAviso) => {
      const aviso = docAviso.data();
      const avisoId = docAviso.id;

      html += `
        <article class="dashboard-card">
          <h3>${aviso.titulo}</h3>
          <p>${aviso.mensaje}</p>
          <p><strong>Fecha:</strong> ${aviso.fecha}</p>
          <p><strong>Estado:</strong> ${aviso.activo ? "Activo" : "Inactivo"}</p>

          <button onclick="desactivarAviso('${avisoId}')">
            Desactivar aviso
          </button>
        </article>
      `;
    });

    html += `
      </section>

      <section class="dashboard-card">
        <button onclick="volverAdmin()">Volver</button>
      </section>
    `;

    contentArea.innerHTML = html;

  } catch (error) {
    console.error(error);
    alert("Error cargando avisos");
  }
}

window.mostrarGestionAvisos = mostrarGestionAvisos;

async function mostrarGestionDocumentos() {
  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>📄 Gestionar documentos</h2>
      <p>Cargando documentos...</p>
    </section>
  `;

  try {
    const q = query(collection(db, "documentos"));
    const snapshot = await getDocs(q);

    let html = `
      <section class="dashboard-card">
        <h2>📄 Gestionar documentos</h2>
      </section>

      <section class="dashboard-grid">
    `;

    snapshot.forEach((docDocumento) => {
      const documento = docDocumento.data();
      const documentoId = docDocumento.id;

      html += `
        <article class="dashboard-card">
          <h3>${documento.titulo}</h3>
          <p><strong>Categoría:</strong> ${documento.categoria}</p>
          <p><strong>Visible para:</strong> ${documento.visiblePara}</p>
          <p><strong>Estado:</strong> ${documento.activo === false ? "Inactivo" : "Activo"}</p>

          <a href="${documento.url}" target="_blank" class="documento-link">
            📄 Abrir documento
          </a>

          <br><br>

          <button onclick="desactivarDocumento('${documentoId}')">
            Desactivar documento
          </button>
        </article>
      `;
    });

    html += `
      </section>

      <section class="dashboard-card">
        <button onclick="volverAdmin()">Volver</button>
      </section>
    `;

    contentArea.innerHTML = html;

  } catch (error) {
    console.error(error);
    alert("Error cargando documentos");
  }
}

window.mostrarGestionDocumentos = mostrarGestionDocumentos;

async function desactivarDocumento(documentoId) {
  const confirmar = confirm("¿Seguro que quieres desactivar este documento?");

  if (!confirmar) return;

  try {
    const documentoRef = doc(db, "documentos", documentoId);

    await updateDoc(documentoRef, {
      activo: false
    });

    alert("Documento desactivado correctamente");

    mostrarGestionDocumentos();

  } catch (error) {
    console.error(error);
    alert("No se pudo desactivar el documento");
  }
}

window.desactivarDocumento = desactivarDocumento;

async function mostrarGestionUsuarios() {

  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>👥 Gestión de usuarios</h2>
      <p>Cargando usuarios...</p>
    </section>
  `;

  try {

    const snapshot = await getDocs(
      collection(db, "usuarios")
    );

    let html = `
      <section class="dashboard-card">
        <h2>👥 Gestión de usuarios</h2>
      </section>

      <section class="dashboard-grid">
    `;

    snapshot.forEach((docUsuario) => {

      const usuario = docUsuario.data();
      const usuarioId = docUsuario.id;

      html += `
        <article class="dashboard-card">

          <h3>
            ${usuario.nombre}
            ${usuario.apellidos ?? ""}
          </h3>

          <p>
            <strong>Email:</strong>
            ${usuario.email}
          </p>

          <p>
            <strong>Rol:</strong>
            ${usuario.rol}
          </p>

          <p>
            <strong>Estado:</strong>
            ${usuario.activo ? "Activo" : "Inactivo"}
          </p>

          <button onclick="cambiarRol('${usuarioId}')">
            Cambiar rol
          </button>

          <br><br>

          <button onclick="desactivarUsuario('${usuarioId}')">
            Desactivar usuario
          </button>

        </article>
      `;
    });

    html += `
      </section>

      <section class="dashboard-card">
        <button onclick="volverAdmin()">
          Volver
        </button>
      </section>
    `;

    contentArea.innerHTML = html;

  } catch (error) {

    console.error(error);

    alert("Error cargando usuarios");

  }
}

window.mostrarGestionUsuarios = mostrarGestionUsuarios;

async function cambiarRol(usuarioId) {
  const nuevoRol = prompt(
    "Introduce el nuevo rol: socio, directiva, jurado o admin"
  );

  if (!nuevoRol) return;

  const rolesValidos = ["socio", "directiva", "jurado", "admin"];

  if (!rolesValidos.includes(nuevoRol)) {
    alert("Rol no válido.");
    return;
  }

  try {
    const usuarioRef = doc(db, "usuarios", usuarioId);

    await updateDoc(usuarioRef, {
      rol: nuevoRol
    });

    alert("Rol actualizado correctamente.");

    mostrarGestionUsuarios();

  } catch (error) {
    console.error(error);
    alert("No se pudo cambiar el rol.");
  }
}

window.cambiarRol = cambiarRol;

async function desactivarUsuario(usuarioId) {
  const confirmar = confirm(
    "¿Seguro que quieres desactivar este usuario?"
  );

  if (!confirmar) return;

  try {
    const usuarioRef = doc(db, "usuarios", usuarioId);

    await updateDoc(usuarioRef, {
      activo: false
    });

    alert("Usuario desactivado correctamente.");

    mostrarGestionUsuarios();

  } catch (error) {
    console.error(error);
    alert("No se pudo desactivar el usuario.");
  }
}

window.desactivarUsuario = desactivarUsuario;


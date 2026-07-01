import { auth, db, messaging } from "./firebase-services.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getToken
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging.js";

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
  setDoc,
  serverTimestamp,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();


  async function activarNotificacionesPush(usuario) {

console.log("Entrando en activarNotificacionesPush");


  try {
    if (!("Notification" in window)) {
      console.log("Este navegador no soporta notificaciones.");
      return;
    }

    const permiso = await Notification.requestPermission();

    if (permiso !== "granted") {
      console.log("Permiso de notificaciones no concedido.");
      return;
    }

    const rutaFirebaseSW =
    location.hostname === "127.0.0.1" || location.hostname === "localhost"
      ? "/firebase-messaging-sw.js"
      : "/agafona-app/firebase-messaging-sw.js";
  
  const registration = await navigator.serviceWorker.register(rutaFirebaseSW);

const token = await getToken(messaging, {
  vapidKey: "BMM2Hr1ur8wwJx_La8K-u6wsynvh6CYV05ryvOWuUNs88FGji7siVgm9wfP_P1ZTTcU966ErAs6SF8Ffl-iD-7A",
  serviceWorkerRegistration: registration
});

    if (!token) {
      console.log("No se pudo obtener token FCM.");
      return;
    }

    await setDoc(doc(db, "tokens_notificaciones", usuario.email), {
      email: usuario.email,
      nombre: usuario.nombre || "",
      roles: usuario.roles || [],
      token: token,
      activo: true,
      fechaAlta: serverTimestamp()
    }, { merge: true });

    console.log("Token de notificaciones guardado correctamente");

  } catch (error) {
    console.error("Error activando notificaciones push:", error);
  }
}

  loginMessage.textContent = "Comprobando datos...";

  try {
    await signInWithEmailAndPassword(auth, email, password);

    const usuarioRef = doc(db, "usuarios", email);
    const usuarioSnap = await getDoc(usuarioRef);
    
    if (!usuarioSnap.exists()) {
      loginMessage.textContent = "Usuario encontrado en Auth pero no en Firestore";
      return;
    }
    
    const usuario = usuarioSnap.data();

    if (!usuario.activo) {
      loginMessage.textContent = "Usuario desactivado";
      return;
    }

    localStorage.setItem("usuarioAgafona", JSON.stringify(usuario));

    activarNotificacionesPush(usuario);

    mostrarDashboard(usuario);


    console.log("Usuario:", usuario);
    console.log("Roles:", usuario.roles);
    console.log("Admin:", tieneRol(usuario, "admin"));
    console.log("Directiva:", tieneRol(usuario, "directiva"));
    console.log("Jurado:", tieneRol(usuario, "jurado"));



  } catch (error) {
    console.error("Error:", error);
    loginMessage.textContent = "Error: " + error.code;
  }
});
function tieneRol(usuario, rolBuscado) {
  if (Array.isArray(usuario.roles)) {
    return usuario.roles.includes(rolBuscado);
  }

  return usuario.rol === rolBuscado;
}

function mostrarDashboard(usuario) {
  const esAdmin = tieneRol(usuario, "admin");
  const esDirectiva = tieneRol(usuario, "directiva");
  const esJurado = tieneRol(usuario, "jurado");
  const esSocio = tieneRol(usuario, "socio");

  const esJuradoExterno =
    esJurado && usuario.esSocio === false && !esSocio;

  document.body.innerHTML = `
    <main class="app-page">
  
  <header class="app-header">

  <img src="assets/logo-agafona.png" alt="AGAFONA" class="app-logo">

  <div class="header-actions">

    <button
      id="btn-volver-header"
      class="header-button oculto">
      ←
    </button>

    <button id="menu-toggle" class="menu-toggle">
      ☰
    </button>

    <button
      id="logout-button"
      class="logout-button">
      Salir
    </button>

  </div>

</header>
  
      <aside id="side-menu" class="side-menu oculto">
        <div class="side-menu-header">
          <h2>Menú</h2>
          <button id="menu-close" class="menu-close">×</button>
        </div>
  
        ${esJuradoExterno
          ? `
          <button onclick="mostrarNotificaciones()">
  🔔 Notificaciones
</button>
            <button id="menu-inicio">🏠 Inicio</button>
            <button id="menu-jurado">⚖️ Votaciones</button>
          `
          : `
          <button id="menu-inicio">🏠 Inicio</button>

<button id="menu-notificaciones">🔔 Notificaciones</button>

<button id="menu-actividades">📅 Actividades</button>
<button id="menu-liga">📷 Liga Fotográfica</button>
<button id="menu-documentos">📄 Documentos</button>
<button id="menu-perfil">👤 Perfil</button>
        
 ${esJurado
  ? `<button id="menu-jurado">⚖️ Jurado</button>`
  : ""
}
        
            ${esAdmin || esDirectiva
              ? `<button id="menu-gestion">⚙️ Gestión</button>`
              : ""
            }
          `
        }
      </aside>
  
      <div id="menu-overlay" class="menu-overlay oculto"></div>
  
      <div id="content-area"></div>
  
      <nav class="bottom-nav">
        ${esJuradoExterno
      ? `
            <button>⚖️<span>Jurado</span></button>
            <button>🏆<span>Clasificación</span></button>
            <button>👤<span>Perfil</span></button>
          `
      : `
            <button>🏠<span>Inicio</span></button>
            <button>📅<span>Actividades</span></button>
            <button>📷<span>Liga</span></button>
            <button>📄<span>Docs</span></button>
  
            ${esAdmin || esDirectiva
        ? `<button>⚙️<span>Gestión</span></button>`
        : ""
      }
  
      ${esJurado
  ? `<button>⚖️<span>Jurado</span></button>`
  : ""
}
  
            <button>👤<span>Perfil</span></button>
          `
    }
      </nav>
  
    </main>
  `;


  document.getElementById("logout-button").addEventListener("click", async () => {
    await signOut(auth);
    localStorage.removeItem("usuarioAgafona");
    location.reload();
  });

  document.getElementById("btn-volver-header").addEventListener("click", () => {
    mostrarAdmin(usuario);
  });

  document.getElementById("logout-button").addEventListener("click", async () => {
    await signOut(auth);
    localStorage.removeItem("usuarioAgafona");
    location.reload();
  });

  document.getElementById("btn-volver-header").addEventListener("click", () => {
    mostrarAdmin(usuario);
  });

  /* MENU HAMBURGUESA */

  const sideMenu = document.getElementById("side-menu");
  const menuOverlay = document.getElementById("menu-overlay");

  function abrirMenu() {
    sideMenu.classList.remove("oculto");
    menuOverlay.classList.remove("oculto");
  }

  function cerrarMenu() {
    sideMenu.classList.add("oculto");
    menuOverlay.classList.add("oculto");
  }

  document.getElementById("menu-toggle").addEventListener("click", abrirMenu);
  document.getElementById("menu-close").addEventListener("click", cerrarMenu);
  menuOverlay.addEventListener("click", cerrarMenu);

  /* FIN MENU HAMBURGUESA */

  document.getElementById("menu-inicio")
    ?.addEventListener("click", () => {
      cerrarMenu();
      mostrarInicio(usuario);
    });

    const menuNotificaciones =
    document.getElementById("menu-notificaciones");
  
  if (menuNotificaciones) {
    menuNotificaciones.addEventListener("click", () => {
      cerrarMenu();
      mostrarNotificaciones();
    });
  }

  document.getElementById("menu-actividades")
    ?.addEventListener("click", () => {
      cerrarMenu();
      mostrarActividades(usuario);
    });

  document.getElementById("menu-liga")
    ?.addEventListener("click", () => {
      cerrarMenu();
      mostrarLiga(usuario);
    });

  document.getElementById("menu-documentos")
    ?.addEventListener("click", () => {
      cerrarMenu();
      mostrarDocumentos();
    });

  document.getElementById("menu-perfil")
    ?.addEventListener("click", () => {
      cerrarMenu();
      mostrarPerfil(usuario);
    });

  document.getElementById("menu-jurado")
    ?.addEventListener("click", () => {
      cerrarMenu();
      mostrarPanelJurado(usuario);
    });

  document.getElementById("menu-gestion")
    ?.addEventListener("click", () => {
      cerrarMenu();

      if (esAdmin) {
        mostrarAdmin(usuario);
      } else if (esDirectiva) {
        mostrarDirectiva(usuario);
      }
    });

  const botones = document.querySelectorAll(".bottom-nav button");

  if (esJuradoExterno) {
    mostrarInicio(usuario);
    return;
  }

  window.usuarioActual = usuario;

 mostrarInicio(usuario);

botones[0]?.addEventListener("click", () => mostrarInicio(usuario));
botones[1]?.addEventListener("click", () => mostrarActividades(usuario));
botones[2]?.addEventListener("click", () => mostrarLiga(usuario));
botones[3]?.addEventListener("click", () => mostrarDocumentos());

let indice = 4;

if (esAdmin) {
  botones[indice]?.addEventListener("click", () => mostrarAdmin(usuario));
  indice++;
} else if (esDirectiva) {
  botones[indice]?.addEventListener("click", () => mostrarDirectiva(usuario));
  indice++;
}

if (esJurado || esAdmin) {
  botones[indice]?.addEventListener("click", () => mostrarPanelJurado(usuario));
  indice++;
}

botones[indice]?.addEventListener("click", () => mostrarPerfil(usuario));
}


function formatearFecha(fecha) {
  if (!fecha) return "";

  const fechaObj = new Date(fecha);

  return fechaObj.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}



async function mostrarInicio(usuario) {

  window.usuarioActual = usuario;

  const contentArea = document.getElementById("content-area");

  document
    .getElementById("btn-volver-header")
    .classList.add("oculto");

  const esJurado = tieneRol(usuario, "jurado");
  const esSocio = tieneRol(usuario, "socio");
  const esJuradoExterno = esJurado && usuario.esSocio === false && !esSocio;

  if (esJuradoExterno) {
    contentArea.innerHTML = `
      <section class="welcome-card">
        <h1>Hola, ${usuario.nombre} 👋</h1>
        <p>Jurado de la liga fotográfica</p>
      </section>

        <article class="dashboard-card" onclick="mostrarPanelJurado(window.usuarioActual)">
          <h3>⚖️ Votaciones</h3>
          <p>Acceder al panel actual de votación.</p>
        </article>
      </section>
    `;

    return;
  }

  let descripcionRol = "";

  if (usuario.rol === "admin") {
    descripcionRol = `Socio nº ${usuario.numeroSocio ?? "-"} · Administrador`;
  } else {
    descripcionRol = `Socio nº ${usuario.numeroSocio ?? "-"}`;
  }

  let agafonaOnlineHtml = `
  <article
    class="dashboard-card tarjeta-clickable"
    onclick="window.mostrarAgafonaOnline()"
  >
    <h2>🌐 AGAFONA Online →</h2>
    <p>Web oficial · Facebook · Instagram</p>
  </article>
`;

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
    const hoy = new Date().toISOString().split("T")[0];

    const convocatoria = await obtenerConvocatoriaActual();

    console.log("Convocatoria inicio:", convocatoria);

    let ligaHtml = "";

    if (convocatoria) {
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

      const hoy = new Date();

      const inicioSubida = new Date(convocatoria.fechaInicioSubida);
      const finSubida = new Date(convocatoria.fechaFinSubida);
      
      const inicioVotacion = new Date(convocatoria.fechaInicioVotacion);
      const finVotacion = new Date(convocatoria.fechaFinVotacion);
      
      let estadoLiga = "🔵 Próxima convocatoria";
      
      if (hoy >= inicioSubida && hoy <= finSubida) {
        estadoLiga = "🟢 Convocatoria abierta";
      }
      else if (hoy >= inicioVotacion && hoy <= finVotacion) {
        estadoLiga = "🟡 Votación en curso";
      }
      else if (hoy > finVotacion) {
        estadoLiga = "⚫ Convocatoria cerrada";
      }

      ligaHtml = `
    <article class="dashboard-card tarjeta-clickable"
      onclick="window.mostrarLiga(window.usuarioActual)">
      <h2>📷 Liga Fotográfica →</h2>

      <p><strong>${convocatoria.titulo}</strong></p>
      <p>${estadoLiga}</p>
  <p>📅 Hasta ${formatearFecha(convocatoria.fechaFinVotacion)}</p>
      <p>${estadoFoto}</p>
    </article>
  `;

    } else {
      ligaHtml = `
    <article class="dashboard-card tarjeta-clickable"
      onclick="window.mostrarLiga(window.usuarioActual)">
      <h2>📷 Liga Fotográfica →</h2>
      <p>Sin convocatoria activa.</p>
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
    <article class="dashboard-card tarjeta-clickable"
      onclick="window.mostrarAvisos()">
      <h2>📢 Último aviso →</h2>
      <p>No hay avisos nuevos.</p>
    </article>
  `;
} else {

  const aviso = avisosValidos[0].data();

  avisosHtml = `
    <article class="dashboard-card tarjeta-clickable"
      onclick="window.mostrarAvisos()">
      <h2>📢 Avisos (más reciente) →</h2>
      <h3>${aviso.titulo}</h3>
      <p>${aviso.mensaje}</p>
      <p><strong>Fecha:</strong> ${formatearFecha(aviso.fecha)}</p>
    </article>
  `;
      
    }

    const notificacionesQuery = query(
      collection(db, "push_notificaciones"),
      orderBy("fechaEnvio", "desc"),
      limit(15)
    );
    
    const notificacionesSnapshot = await getDocs(notificacionesQuery);

const totalNotificaciones = notificacionesSnapshot.size;

let textoNotificaciones = "No hay notificaciones recientes.";

if (totalNotificaciones === 1) {
  textoNotificaciones = "1 novedad reciente";
} else if (totalNotificaciones > 1) {
  textoNotificaciones = `${totalNotificaciones} novedades recientes`;
}

let notificacionesHtml = `
  <article
    class="dashboard-card tarjeta-clickable"
    onclick="window.mostrarNotificaciones()"
  >
   <h2>🔔 Notificaciones</h2>
<p>${textoNotificaciones}</p>
<p><strong>Ver novedades →</strong></p>
  </article>
`;

    contentArea.innerHTML = `
  <section class="welcome-card">
    <h1>Hola, ${usuario.nombre} 👋</h1>
    <p>${descripcionRol}</p>

    <br>

    <p>
       Bienvenido/a a la app AGAFONA
    </p>

  </section>

<section class="dashboard-grid">
 ${notificacionesHtml}
 ${avisosHtml}
 ${ligaHtml}
 ${agafonaOnlineHtml}
</section>

<footer class="app-footer">
  © MSD · AGAFONA App 2026
</footer>
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

window.mostrarInicio = mostrarInicio;


async function mostrarActividades(usuario) {
  const contentArea = document.getElementById("content-area");

  document
    .getElementById("btn-volver-header")
    .classList.remove("oculto");

  document
    .getElementById("btn-volver-header")
    .onclick = () => mostrarInicio(usuario);

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
            <p>📅 ${actividad.fecha ? formatearFecha(actividad.fecha) : ""}</p>
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
      <section class="dashboard-card page-title-card">
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


async function crearPushNotificacion(datos) {
  try {
    await addDoc(collection(db, "push_notificaciones"), {
      titulo: datos.titulo,
      mensaje: datos.mensaje,

      origen: datos.origen ?? "manual",
      referenciaId: datos.referenciaId ?? null,

      destinatarios: {
        socios: datos.destinatarios?.socios ?? false,
        directiva: datos.destinatarios?.directiva ?? false
      },

      enviadaPor: datos.enviadaPor ?? "",
      enviadaPorEmail: datos.enviadaPorEmail ?? "",

      fechaCreacion: serverTimestamp(),
      fechaEnvio: null,

      estado: "pendiente",
      error: null
    });

    console.log("Push notificación creada correctamente");

  } catch (error) {
    console.error("Error creando push notificación:", error);
    alert("Error al crear la notificación push.");
  }
}
window.crearPushNotificacion = crearPushNotificacion;


function formatearDestinatariosPush(destinatarios) {
  if (!destinatarios) return "No indicado";

  if (typeof destinatarios === "string") {
    return destinatarios;
  }

  if (Array.isArray(destinatarios)) {
    return destinatarios.join(", ");
  }

  if (typeof destinatarios === "object") {
    return Object.keys(destinatarios)
      .filter((clave) => destinatarios[clave] === true)
      .join(", ") || "No indicado";
  }

  return "No indicado";
}


async function mostrarHistorialPush() {
  const contentArea = document.getElementById("content-area");

  let btnVolver = document.getElementById("btn-volver-header");
  btnVolver.replaceWith(btnVolver.cloneNode(true));

  btnVolver = document.getElementById("btn-volver-header");
  btnVolver.classList.remove("oculto");
  btnVolver.onclick = () => {
    volverGestion();
  };

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>🔔 Centro de notificaciones</h2>
      <p>Cargando historial de notificaciones...</p>
    </section>
  `;

  try {
    const pushQuery = query(
      collection(db, "push_notificaciones"),
      orderBy("fechaCreacion", "desc"),
      limit(50)
    );

    const snapshot = await getDocs(pushQuery);

    if (snapshot.empty) {
      contentArea.innerHTML = `
        <section class="dashboard-card">
          <h2>🔔 Centro de notificaciones</h2>
          <p>No hay notificaciones push registradas todavía.</p>
        </section>
      `;
      return;
    }

    let totalPendientes = 0;
    let totalEnviadas = 0;
    let totalErrores = 0;
    let totalConErrores = 0;

    snapshot.forEach((docSnap) => {
      const push = docSnap.data();

      if (push.estado === "pendiente") totalPendientes++;
      else if (push.estado === "enviada") totalEnviadas++;
      else if (push.estado === "error") totalErrores++;
      else if (push.estado === "enviada_con_errores") totalConErrores++;
    });

    let html = `
      <section class="dashboard-card">
        <h2>🔔 Centro de notificaciones</h2>
        <p>Resumen de las últimas notificaciones generadas por la aplicación.</p>

        <p>🟡 <strong>Pendientes:</strong> ${totalPendientes}</p>
        <p>🟢 <strong>Enviadas:</strong> ${totalEnviadas}</p>
        <p>🟠 <strong>Enviadas con errores:</strong> ${totalConErrores}</p>
        <p>🔴 <strong>Errores:</strong> ${totalErrores}</p>
      </section>
    `;

    snapshot.forEach((docSnap) => {
      const push = docSnap.data();

      let iconoEstado = "🟡";
      let textoEstado = "Pendiente";

      if (push.estado === "enviada") {
        iconoEstado = "🟢";
        textoEstado = "Enviada";
      } else if (push.estado === "enviada_con_errores") {
        iconoEstado = "🟠";
        textoEstado = "Enviada con errores";
      } else if (push.estado === "error") {
        iconoEstado = "🔴";
        textoEstado = "Error";
      }

      const fechaCreacion = push.fechaCreacion?.toDate
        ? push.fechaCreacion.toDate().toLocaleString("es-ES")
        : "Sin fecha";

      const fechaEnvio = push.fechaEnvio?.toDate
        ? push.fechaEnvio.toDate().toLocaleString("es-ES")
        : "Pendiente";

      html += `
        <article class="dashboard-card">
          <h3>${iconoEstado} ${push.titulo || "Notificación sin título"}</h3>

          <p>${push.mensaje || "Sin mensaje"}</p>

          <p>📌 <strong>Estado:</strong> ${textoEstado}</p>
          <p>👥 <strong>Destinatarios:</strong> ${formatearDestinatariosPush(push.destinatarios)}</p>
          <p>📅 <strong>Creada:</strong> ${fechaCreacion}</p>
          <p>📤 <strong>Enviada:</strong> ${fechaEnvio}</p>

          ${
            push.totalTokens > 0
              ? `
                <p>📲 <strong>Destinatarios reales:</strong> ${push.totalTokens}</p>
                <p>✅ <strong>Correctas:</strong> ${push.enviadas || 0}</p>
                <p>⚠️ <strong>Errores:</strong> ${push.errores || 0}</p>
              `
              : ""
          }

          ${
            push.mensajeError
              ? `<p>🔴 <strong>Error:</strong> ${push.mensajeError}</p>`
              : ""
          }
        </article>
      `;
    });

    contentArea.innerHTML = html;
  } catch (error) {
    console.error("Error cargando historial push:", error);

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>🔔 Centro de notificaciones</h2>
        <p>Error al cargar el historial de notificaciones.</p>
      </section>
    `;
  }
}
window.crearHtmlSeccionPush = crearHtmlSeccionPush;


function crearHtmlSeccionPush(modulo) {
  return `
    <hr>

    <h3>🔔 Notificación push</h3>

    <label>
      <input 
        type="checkbox" 
        id="${modulo}-enviar-push"
        onchange="toggleOpcionesPush('${modulo}')"
      >
      Enviar notificación push
    </label>

    <div id="${modulo}-opciones-push" class="oculto">
      <p class="small-text">
        Selecciona a quién quieres avisar.
      </p>

      <h4>Destinatarios</h4>

      <label>
        <input type="checkbox" id="${modulo}-push-socios">
        Socios
      </label>

      <label>
        <input type="checkbox" id="${modulo}-push-directiva">
        Directiva
      </label>
    </div>
  `;
}


function toggleOpcionesPush(modulo) {
  const enviarPush = document.getElementById(`${modulo}-enviar-push`).checked;
  const opcionesPush = document.getElementById(`${modulo}-opciones-push`);

  if (enviarPush) {
    opcionesPush.classList.remove("oculto");
  } else {
    opcionesPush.classList.add("oculto");

    document.getElementById(`${modulo}-push-socios`).checked = false;
    document.getElementById(`${modulo}-push-directiva`).checked = false;
  }
}

window.toggleOpcionesPush = toggleOpcionesPush;


function mostrarAgafonaOnline() {
  const contentArea = document.getElementById("content-area");

  document.getElementById("btn-volver-header").classList.remove("oculto");
  document.getElementById("btn-volver-header").onclick = () => {
    mostrarInicio(window.usuarioActual);
  };

  contentArea.innerHTML = `
    <section class="dashboard-card page-title-card">
      <h2>🌐 AGAFONA Online</h2>
      <p>Enlaces oficiales de la asociación.</p>
    </section>

    <section class="dashboard-grid">
      <article class="dashboard-card">
        <h3>🌍 Web oficial</h3>
        <p>Visita la web principal de AGAFONA.</p>
        <button onclick="window.open('https://www.agafona.com', '_blank')">
          Abrir web
        </button>
      </article>

      <article class="dashboard-card">
        <h3>📘 Facebook</h3>
        <p>Sigue las publicaciones de AGAFONA.</p>
        <button onclick="window.open('https://www.facebook.com/agafona', '_blank')">
          Abrir Facebook
        </button>
      </article>

      <article class="dashboard-card">
        <h3>📸 Instagram</h3>
        <p>Fotografías y actividad social de AGAFONA.</p>
        <button onclick="window.open('https://www.instagram.com/agafona', '_blank')">
          Abrir Instagram
        </button>
      </article>
    </section>
  `;
}

window.mostrarAgafonaOnline = mostrarAgafonaOnline;


async function mostrarNotificaciones() {
  const contentArea = document.getElementById("content-area");

  document.getElementById("btn-volver-header").classList.remove("oculto");
  document.getElementById("btn-volver-header").onclick = () => {
    mostrarInicio(window.usuarioActual);
  };

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>🔔 Notificaciones</h2>
      <p>Cargando notificaciones...</p>
    </section>
  `;

  try {
    const notificacionesQuery = query(
      collection(db, "push_notificaciones"),
      orderBy("fechaEnvio", "desc"),
      limit(15)
    );

    const snapshot = await getDocs(notificacionesQuery);

    let notificacionesHtml = "";

    snapshot.forEach((doc) => {
      const notificacion = doc.data();

      const fechaNotificacion =
        notificacion.fechaEnvio?.toDate?.() ??
        notificacion.fechaCreacion?.toDate?.() ??
        notificacion.creada?.toDate?.() ??
        null;

      let icono = "🔔";

      if (notificacion.tipo === "aviso") icono = "📢";
      if (notificacion.tipo === "actividad") icono = "📅";
      if (notificacion.tipo === "liga") icono = "📷";
      if (notificacion.tipo === "clasificacion") icono = "🏆";
      if (notificacion.tipo === "documento") icono = "📄";

      notificacionesHtml += `
        <article class="dashboard-card tarjeta-clickable">
          <h3>${icono} ${notificacion.titulo || "Notificación"}</h3>
          <p>${notificacion.mensaje || ""}</p>
          <p class="fecha-notificacion">
            <small>${fechaNotificacion ? formatearFecha(fechaNotificacion) : ""}</small>
          </p>
        </article>
      `;
    });

    if (!notificacionesHtml) {
      notificacionesHtml = `
        <section class="dashboard-card">
          <p>No hay notificaciones disponibles.</p>
        </section>
      `;
    }

    contentArea.innerHTML = `
      <section class="dashboard-card page-title-card">
        <h2>🔔 Notificaciones</h2>
      </section>

      <section class="dashboard-grid">
        ${notificacionesHtml}
      </section>
    `;

  } catch (error) {
    console.error("Error cargando notificaciones:", error);

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>🔔 Notificaciones</h2>
        <p>Error al cargar las notificaciones.</p>
      </section>
    `;
  }
}

window.mostrarNotificaciones = mostrarNotificaciones;


async function mostrarAvisos() {
  const contentArea = document.getElementById("content-area");

  document.getElementById("btn-volver-header").classList.remove("oculto");
  document.getElementById("btn-volver-header").onclick = () => mostrarInicio(window.usuarioActual);

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>📢 Avisos</h2>
      <p>Cargando avisos...</p>
    </section>
  `;

  try {
    const avisosQuery = query(
      collection(db, "avisos"),
      where("activo", "==", true),
      limit(15)
    );
    
    const avisosSnapshot = await getDocs(avisosQuery);

    const hoy = new Date().toISOString().split("T")[0];
    
    const avisosValidos = avisosSnapshot.docs.filter((doc) => {
      const aviso = doc.data();
      return aviso.fecha >= hoy;
    });
    
    if (avisosValidos.length === 0) {

      contentArea.innerHTML = `
        <section class="dashboard-card">
          <h2>📢 Avisos</h2>
          <p>No hay avisos nuevos.</p>
        </section>
      `;
      return;
    }

    let avisosHtml = `
    <section class="dashboard-grid">
  `;

    avisosValidos.forEach((docAviso) => {
      const aviso = docAviso.data();

      avisosHtml += `
        <article class="dashboard-card">
          <h3>${aviso.titulo}</h3>
          <p>${aviso.mensaje}</p>
          <p><strong>Fecha:</strong> ${formatearFecha(aviso.fecha)}</p>
        </article>
      `;
    });

    avisosHtml += `</section>`;

    contentArea.innerHTML = `
    ${avisosHtml}
  `;

  } catch (error) {
    console.error("Error cargando avisos:", error);

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>📢 Avisos</h2>
        <p>Error al cargar los avisos.</p>
      </section>
    `;
  }
}

window.mostrarAvisos = mostrarAvisos;


async function verInscritosActividad(actividadId) {
  const contentArea = document.getElementById("content-area");

  document.getElementById("btn-volver-header").classList.remove("oculto");
  document.getElementById("btn-volver-header").onclick = () => {
    mostrarActividades(window.usuarioActual);
  };

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

  document.getElementById("btn-volver-header").classList.remove("oculto");
  document.getElementById("btn-volver-header").onclick = () => {
    mostrarInicio(usuario);
  };

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>📷 Liga Fotográfica</h2>
      <p>Cargando convocatoria...</p>
    </section>
  `;

  try {
    const convocatoria = await obtenerConvocatoriaActual();

    if (!convocatoria) {
      contentArea.innerHTML = `
        <section class="dashboard-card">
          <h2>📷 Liga Fotográfica</h2>
          <p>No hay convocatoria activa.</p>
        </section>
      `;
      return;
    }

    const subidaAbierta = convocatoria.estadoCalculado === "subida";

    const fotosQuery = query(
      collection(db, "fotos"),
      where("convocatoriaId", "==", convocatoria.codigo),
      where("email", "==", usuario.email),
      where("visible", "==", true)
    );

    const fotosSnapshot = await getDocs(fotosQuery);

    let clasificacionHtml = "";

    let bloqueFoto = "";
    let fotoDocId = null;

    if (fotosSnapshot.empty) {
      if (subidaAbierta) {
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
        bloqueFoto = `
          <p><strong>Mi fotografía:</strong></p>
          <p>No has enviado ninguna fotografía.</p>
          <p>El periodo de subida está cerrado.</p>
        `;
      }
    } else {
      const fotoDoc = fotosSnapshot.docs[0];
      const foto = fotoDoc.data();
      fotoDocId = fotoDoc.id;

      if (subidaAbierta) {
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
      } else {
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

          <p>El periodo de subida está cerrado. Ya no se puede cambiar la fotografía.</p>
        `;
      }
    }

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>📷 Liga Fotográfica</h2>

        <h3>${convocatoria.titulo}</h3>

<p>
  <strong>Periodo de subida:</strong>
  del ${formatearFecha(convocatoria.fechaInicioSubida)}
  al ${formatearFecha(convocatoria.fechaFinSubida)}
</p>

<p>
  <strong>Periodo de votación:</strong>
  del ${formatearFecha(convocatoria.fechaInicioVotacion)}
  al ${formatearFecha(convocatoria.fechaFinVotacion)}
</p>
<hr>

${bloqueFoto}

<div class="liga-actions">
  <button onclick="mostrarClasificacionConvocatoria()">
    🏆 Clasificación convocatoria
  </button>

  <button onclick="mostrarClasificacionGeneral()">
    🏅 Clasificación general
  </button>

  <button onclick="mostrarJuradoLiga()">
    👥 Jurado de la liga
  </button>
</div>

${clasificacionHtml}
      </section>
    `;

    const subirFotoBtn = document.getElementById("subir-foto-btn");

    if (subirFotoBtn) {
      subirFotoBtn.addEventListener("click", () => {
        subirFotoLiga(usuario, convocatoria, fotoDocId);
      });
    }

  } catch (error) {
    console.error(error);

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>📷 Liga Fotográfica</h2>
        <p>Error al cargar la convocatoria.</p>
      </section>
    `;
  }
}

window.mostrarLiga = mostrarLiga;


async function mostrarDocumentos() {
  const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));
  const contentArea = document.getElementById("content-area");

  let btnVolver = document.getElementById("btn-volver-header");
  btnVolver.replaceWith(btnVolver.cloneNode(true));

  btnVolver = document.getElementById("btn-volver-header");
  btnVolver.classList.remove("oculto");
  btnVolver.onclick = () => {
    mostrarInicio(window.usuarioActual);
  };

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
        <article class="dashboard-card compact-card">
          <h2>📄 ${documento.titulo}</h2>

          <div class="documento-categoria">
            ${documento.categoria}
          </div>

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

  let btnVolver = document.getElementById("btn-volver-header");
  btnVolver.replaceWith(btnVolver.cloneNode(true));

  btnVolver = document.getElementById("btn-volver-header");
  btnVolver.classList.remove("oculto");
  btnVolver.onclick = () => {
    mostrarInicio(window.usuarioActual);
  };

  const numeroSocio = usuario.numeroSocio ?? "-";
  let rolMostrado = "Socio";

  if (Array.isArray(usuario.roles)) {
    rolMostrado = usuario.roles
      .map((rol) => {
        if (rol === "admin") return "Administrador";
        if (rol === "directiva") return "Directiva";
        if (rol === "jurado") return "Jurado";
        if (rol === "socio") return "Socio";
        return rol;
      })
      .join(", ");
  } else {
    if (usuario.rol === "admin") {
      rolMostrado = "Administrador";
    } else if (usuario.rol === "jurado") {
      rolMostrado = "Jurado";
    } else if (usuario.rol === "directiva") {
      rolMostrado = "Directiva";
    }
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
        
          <p>📅 ${formatearFecha(fechaActividad)}</p>
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

<section id="card-estadisticas" class="dashboard-card clickable">
  <h2>📊 Mis estadísticas</h2>

  <p>
    Consulta tu participación en la liga y tu actividad en AGAFONA.
  </p>
</section>

    `;

 document
  .getElementById("card-estadisticas")
  ?.addEventListener("click", () => {
    console.log("CLICK");
    console.log(usuario);
    mostrarMisEstadisticas(usuario);
  });

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

  let btnVolver = document.getElementById("btn-volver-header");
  btnVolver.replaceWith(btnVolver.cloneNode(true));

  btnVolver = document.getElementById("btn-volver-header");
  btnVolver.classList.remove("oculto");
  btnVolver.onclick = () => {
    mostrarInicio(usuario);
  };

  if (!tieneRol(usuario, "admin") && !tieneRol(usuario, "directiva")) {
    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>⚙️ Administración</h2>
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

    <article class="dashboard-card">
      <h3>📋 Gestionar actividades</h3>
      <p>Ver actividades creadas y desactivar actividades.</p>

      <button onclick="mostrarGestionActividades()">
        Gestionar actividades
      </button>
    </article>

    <article class="dashboard-card">
      <h3>📢 Gestionar avisos</h3>
      <p>Ver avisos creados y desactivar avisos antiguos.</p>

      <button onclick="mostrarGestionAvisos()">
        Gestionar avisos
      </button>
    </article>

    <article class="dashboard-card">
      <h3>📄 Gestionar documentos</h3>
      <p>Ver documentos creados y desactivar los que ya no estén disponibles.</p>

      <button onclick="mostrarGestionDocumentos()">
        Gestionar documentos
      </button>
    </article>

    <article class="dashboard-card">
      <h3>🔔 Enviar notificación</h3>
      <p>Crear una comunicación para socios y/o directiva.</p>

      <button onclick="mostrarEnviarNotificacion()">
        Enviar notificación
      </button>
    </article>

    <article class="dashboard-card">
      <h3>👥 Gestión de usuarios</h3>
      <p>Consultar usuarios, cambiar roles y desactivar accesos.</p>

      <button onclick="mostrarGestionUsuarios()">
        Gestionar usuarios
      </button>
    </article>

    <article class="dashboard-card">
      <h3>📷 Gestión Liga</h3>
      <p>Crear y gestionar convocatorias de la liga fotográfica.</p>

      <button onclick="mostrarGestionLiga()">
        Gestionar liga
      </button>
    </article>

    <article class="dashboard-card">
  <h3>🔔 Historial Push</h3>
  <p>Consultar el estado de las notificaciones enviadas.</p>

  <button onclick="mostrarHistorialPush()">
    Ver historial push
  </button>
</article>

  `;
}

window.mostrarAdmin = mostrarAdmin;
window.mostrarHistorialPush = mostrarHistorialPush;


function mostrarEnviarNotificacion() {
  const contentArea = document.getElementById("content-area");

  let btnVolver = document.getElementById("btn-volver-header");
  btnVolver.replaceWith(btnVolver.cloneNode(true));

  btnVolver = document.getElementById("btn-volver-header");
  btnVolver.classList.remove("oculto");

  btnVolver.onclick = () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));
  
    if (tieneRol(usuario, "admin")) {
      mostrarAdmin(usuario);
    } else {
      mostrarDirectiva(usuario);
    }
  };

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>🔔 Enviar notificación</h2>
      <p>Crear una notificación para socios y/o directiva.</p>
    </section>

    <section class="dashboard-card">
      <label for="notificacion-titulo">Título</label>
      <input 
        type="text" 
        id="notificacion-titulo" 
        placeholder="Escribe el título"
      >

      <label for="notificacion-mensaje">Mensaje</label>
      <textarea 
        id="notificacion-mensaje" 
        placeholder="Escribe el mensaje"
        rows="5"
      ></textarea>

      <h3>Destinatarios</h3>

      <label>
        <input type="checkbox" id="destinatarios-socios">
        Socios
      </label>

      <label>
        <input type="checkbox" id="destinatarios-directiva">
        Directiva
      </label>

      <hr>

      <button onclick="guardarNotificacion()">
        ENVIAR
      </button>
    </section>
  `;
}

window.mostrarEnviarNotificacion = mostrarEnviarNotificacion;


async function guardarNotificacion() {

  const titulo = document.getElementById("notificacion-titulo").value.trim();
  const mensaje = document.getElementById("notificacion-mensaje").value.trim();

  const socios = document.getElementById("destinatarios-socios").checked;
  const directiva = document.getElementById("destinatarios-directiva").checked;

  if (!titulo) {
    alert("Introduce un título.");
    return;
  }

  if (!mensaje) {
    alert("Introduce un mensaje.");
    return;
  }

  if (!socios && !directiva) {
    alert("Selecciona al menos un destinatario.");
    return;
  }

  try {

    const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));

    await crearPushNotificacion({
      titulo,
      mensaje,
    
      origen: "manual",
      referenciaId: null,
    
      destinatarios: {
        socios,
        directiva
      },
    
      enviadaPor: usuario.nombre || usuario.email,
      enviadaPorEmail: usuario.email
    });

    alert("Notificación guardada correctamente.");

    mostrarEnviarNotificacion();

  } catch (error) {

    console.error(error);

    alert("Error al guardar la notificación.");

  }

}

window.guardarNotificacion = guardarNotificacion;

function mostrarFormularioDocumento() {
  const contentArea = document.getElementById("content-area");

  document.getElementById("btn-volver-header").classList.remove("oculto");
  document.getElementById("btn-volver-header").onclick = () => {
    mostrarGestionDocumentos();
  };

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

      ${crearHtmlSeccionPush("documento")}

      <button onclick="guardarDocumento()">
        Guardar documento
      </button>

    </section>
  `;
}

window.mostrarFormularioDocumento = mostrarFormularioDocumento;

async function guardarDocumento() {
  const titulo = document.getElementById("doc-titulo").value.trim();
  const categoria = document.getElementById("doc-categoria").value.trim();
  const url = document.getElementById("doc-url").value.trim();
  const visiblePara = document.getElementById("doc-visible").value;

  const enviarPush = document.getElementById("documento-enviar-push").checked;
  const pushSocios = document.getElementById("documento-push-socios").checked;
  const pushDirectiva = document.getElementById("documento-push-directiva").checked;

  if (!titulo || !categoria || !url) {
    alert("Completa todos los campos.");
    return;
  }

  if (enviarPush && !pushSocios && !pushDirectiva) {
    alert("Selecciona al menos un destinatario para la notificación push.");
    return;
  }

  try {
    const documentoRef = await addDoc(collection(db, "documentos"), {
      titulo,
      categoria,
      url,
      visiblePara,
      activo: true,
      publico: true,
      fechaCreacion: serverTimestamp()
    });

    if (enviarPush) {
      const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));

      await crearPushNotificacion({
        titulo: "Nuevo documento disponible",
        mensaje: titulo,

        origen: "documento",
        referenciaId: documentoRef.id,

        destinatarios: {
          socios: pushSocios,
          directiva: pushDirectiva
        },

        enviadaPor: usuario.nombre || usuario.email,
        enviadaPorEmail: usuario.email
      });
    }

    alert("Documento creado correctamente.");

    const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));

    if (tieneRol(usuario, "admin")) {
      mostrarAdmin(usuario);
    } else {
      mostrarDirectiva(usuario);
    }

  } catch (error) {
    console.error(error);
    alert("No se pudo guardar el documento.");
  }
}

window.guardarDocumento = guardarDocumento;

function mostrarFormularioActividad() {
  const contentArea = document.getElementById("content-area");

  document.getElementById("btn-volver-header").classList.remove("oculto");
  document.getElementById("btn-volver-header").onclick = () => {
    mostrarGestionActividades();
  };

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

      ${crearHtmlSeccionPush("actividad")}

      <button onclick="guardarActividad()">
        Guardar actividad
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

  const enviarPush = document.getElementById("actividad-enviar-push").checked;
  const pushSocios = document.getElementById("actividad-push-socios").checked;
  const pushDirectiva = document.getElementById("actividad-push-directiva").checked;

  if (!titulo || !fecha || !lugar || !descripcion) {
    alert("Completa los campos obligatorios.");
    return;
  }

  if (enviarPush && !pushSocios && !pushDirectiva) {
    alert("Selecciona al menos un destinatario para la notificación push.");
    return;
  }

  try {
    const actividadRef = await addDoc(collection(db, "actividades"), {
      titulo,
      fecha,
      lugar,
      descripcion,
      plazas: plazas || 0,
      inscritos: 0,
      activa: true,
      fechaCreacion: serverTimestamp()
    });

    if (enviarPush) {
      const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));

      await crearPushNotificacion({
        titulo: "Nueva actividad publicada",
        mensaje: titulo,

        origen: "actividad",
        referenciaId: actividadRef.id,

        destinatarios: {
          socios: pushSocios,
          directiva: pushDirectiva
        },

        enviadaPor: usuario.nombre || usuario.email,
        enviadaPorEmail: usuario.email
      });
    }

    alert("Actividad creada correctamente.");

    const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));
    mostrarAdmin(usuario);

  } catch (error) {
    console.error("Error creando actividad:", error);
    alert("No se pudo crear la actividad.");
  }
}

window.guardarActividad = guardarActividad;

function mostrarFormularioAviso() {
  const contentArea = document.getElementById("content-area");

  document.getElementById("btn-volver-header").classList.remove("oculto");
  document.getElementById("btn-volver-header").onclick = () => {
    mostrarGestionAvisos();
  };

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>📢 Crear aviso</h2>

      <label>Título</label>
      <input type="text" id="aviso-titulo">

      <label>Mensaje</label>
      <textarea id="aviso-mensaje"></textarea>

      <label>Fecha</label>
      <input type="date" id="aviso-fecha">

      ${crearHtmlSeccionPush("aviso")}

      <button onclick="guardarAviso()">
        Guardar aviso
      </button>

    </section>
  `;
}

window.mostrarFormularioAviso = mostrarFormularioAviso;

async function guardarAviso() {
  const titulo = document.getElementById("aviso-titulo").value.trim();
  const mensaje = document.getElementById("aviso-mensaje").value.trim();
  const fecha = document.getElementById("aviso-fecha").value;

  const enviarPush = document.getElementById("aviso-enviar-push").checked;
  const pushSocios = document.getElementById("aviso-push-socios").checked;
  const pushDirectiva = document.getElementById("aviso-push-directiva").checked;

  if (!titulo || !mensaje || !fecha) {
    alert("Completa todos los campos.");
    return;
  }

  if (enviarPush && !pushSocios && !pushDirectiva) {
    alert("Selecciona al menos un destinatario para la notificación push.");
    return;
  }

  try {
    const avisoRef = await addDoc(collection(db, "avisos"), {
      titulo,
      mensaje,
      fecha,
      activo: true,
      fechaCreacion: serverTimestamp()
    });

    if (enviarPush) {
      const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));

      await crearPushNotificacion({
        titulo: "Nuevo aviso publicado",
        mensaje: titulo,

        origen: "aviso",
        referenciaId: avisoRef.id,

        destinatarios: {
          socios: pushSocios,
          directiva: pushDirectiva
        },

        enviadaPor: usuario.nombre || usuario.email,
        enviadaPorEmail: usuario.email
      });
    }

    alert("Aviso creado correctamente.");

    const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));

    if (tieneRol(usuario, "admin")) {
      mostrarAdmin(usuario);
    } else {
      mostrarDirectiva(usuario);
    }

  } catch (error) {
    console.error("Error creando aviso:", error);
    alert("No se pudo crear el aviso.");
  }
}

window.guardarAviso = guardarAviso;



async function mostrarGestionActividades() {
  const contentArea = document.getElementById("content-area");
  const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));

  document.getElementById("btn-volver-header").classList.remove("oculto");
  document.getElementById("btn-volver-header").onclick = () => {
    volverGestion();
  };

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
        <p>Crear, consultar y gestionar actividades de AGAFONA.</p>

        <button onclick="mostrarFormularioActividad()">
          Crear nueva actividad
        </button>
      </section>

      <section class="dashboard-grid">
    `;

    if (snapshot.empty) {
      html += `
        <article class="dashboard-card">
          <p>No hay actividades creadas todavía.</p>
        </article>
      `;
    }

    snapshot.forEach((docActividad) => {
      const actividad = docActividad.data();
      const actividadId = docActividad.id;

      html += `
        <article class="dashboard-card">
          <h3>${actividad.titulo}</h3>

          <p>📅 ${formatearFecha(actividad.fecha)}</p>
          <p>📍 ${actividad.lugar}</p>

          <p>
            <strong>Inscritos:</strong>
            ${actividad.inscritos ?? 0}
          </p>

          <p>
            <strong>Estado:</strong>
            ${actividad.activa ? "Activa" : "Inactiva"}
          </p>

          <button onclick="cambiarEstadoActividad('${actividadId}', ${actividad.activa === true})">
            ${actividad.activa ? "Desactivar actividad" : "Activar actividad"}
          </button>

          <button onclick="borrarActividad('${actividadId}')">
            Borrar actividad
          </button>
        </article>
      `;
    });

    html += `
    </section>
  `;

    contentArea.innerHTML = html;

  } catch (error) {
    console.error(error);
    alert("Error cargando actividades");
  }
}

window.mostrarGestionActividades = mostrarGestionActividades;


async function mostrarGestionAvisos() {
  const contentArea = document.getElementById("content-area");
  const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));

  document.getElementById("btn-volver-header").classList.remove("oculto");
  document.getElementById("btn-volver-header").onclick = () => {
    volverGestion();
  
  };

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

        <button onclick="mostrarFormularioAviso()">
          Crear nuevo aviso
        </button>
      </section>

      <section class="dashboard-grid">
    `;

    if (snapshot.empty) {
      html += `
        <article class="dashboard-card">
          <p>No hay avisos creados todavía.</p>
        </article>
      `;
    }

    snapshot.forEach((docAviso) => {
      const aviso = docAviso.data();
      const avisoId = docAviso.id;

      html += `
        <article class="dashboard-card">
          <h3>${aviso.titulo}</h3>
          <p>${aviso.mensaje}</p>
          <p><strong>Fecha:</strong> ${formatearFecha(aviso.fecha)}</p>
          <p><strong>Estado:</strong> ${aviso.activo ? "Activo" : "Inactivo"}</p>

          <button onclick="cambiarEstadoAviso('${avisoId}', ${aviso.activo === true})">
            ${aviso.activo ? "Desactivar aviso" : "Activar aviso"}
          </button>

          <button onclick="borrarAviso('${avisoId}')">
            Borrar aviso
          </button>
        </article>
      `;
    });

    html += `
      </section>
    `;

    contentArea.innerHTML = html;

  } catch (error) {
    console.error(error);
    alert("Error cargando avisos");
  }
}

window.mostrarGestionAvisos = mostrarGestionAvisos;



async function cambiarEstadoAviso(avisoId, estadoActual) {
  console.log("Cambiando aviso:", avisoId, estadoActual);

  const nuevoEstado = !estadoActual;

  try {
    await updateDoc(doc(db, "avisos", avisoId), {
      activo: nuevoEstado
    });

    alert(
      nuevoEstado
        ? "Aviso activado correctamente"
        : "Aviso desactivado correctamente"
    );

    mostrarGestionAvisos();

  } catch (error) {
    console.error("Error cambiando estado del aviso:", error);
    alert("No se pudo cambiar el estado del aviso");
  }
}

window.cambiarEstadoAviso = cambiarEstadoAviso;



async function mostrarGestionDocumentos() {
  const contentArea = document.getElementById("content-area");
  const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));

document.getElementById("btn-volver-header").classList.remove("oculto");
document.getElementById("btn-volver-header").onclick = () => {
  volverGestion();

};

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
      <p>
        Crear, consultar y gestionar documentos de AGAFONA.
      </p>
  
      <button onclick="mostrarFormularioDocumento()">
        Subir nuevo documento
      </button>
    </section>
  `;

    if (snapshot.empty) {
      html += `
        <article class="dashboard-card">
          <p>No hay documentos disponibles.</p>
        </article>
      `;
    }

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

          <button onclick="cambiarEstadoDocumento('${documentoId}', ${documento.activo !== false})">
            ${documento.activo === false ? "Activar documento" : "Desactivar documento"}
          </button>

          <button onclick="borrarDocumento('${documentoId}')">
            Borrar documento
          </button>
        </article>
      `;
    });

    html += `
      </section>
    `;

    contentArea.innerHTML = html;

  } catch (error) {
    console.error(error);
    alert("Error cargando documentos");
  }
}

window.mostrarGestionDocumentos = mostrarGestionDocumentos;



async function cambiarEstadoDocumento(documentoId, estadoActual) {
  console.log("Cambiando documento:", documentoId, estadoActual);

  const nuevoEstado = !estadoActual;

  try {
    console.log("Antes de updateDoc");

    await updateDoc(doc(db, "documentos", documentoId), {
      activo: nuevoEstado
    });

    console.log("Después de updateDoc");

    alert(
      nuevoEstado
        ? "Documento activado correctamente"
        : "Documento desactivado correctamente"
    );

    mostrarGestionDocumentos();

  } catch (error) {
    console.error("ERROR DOCUMENTO:", error);
    alert("Error al cambiar el estado del documento");
  }
}

window.cambiarEstadoDocumento = cambiarEstadoDocumento;



async function mostrarGestionUsuarios() {

  const contentArea = document.getElementById("content-area");

  let btnVolver = document.getElementById("btn-volver-header");
  btnVolver.replaceWith(btnVolver.cloneNode(true));

  btnVolver = document.getElementById("btn-volver-header");
  btnVolver.classList.remove("oculto");
  btnVolver.onclick = () => {
    mostrarAdmin(window.usuarioActual);
  };

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
  <strong>Roles:</strong>
  ${usuario.roles ? usuario.roles.join(", ") : "Sin roles"}
</p>

          <p>
            <strong>Estado:</strong>
            ${usuario.activo ? "Activo" : "Inactivo"}
          </p>

          <button onclick="cambiarRol('${usuarioId}')">
            Cambiar rol
          </button>

          <br><br>

          <button onclick="cambiarEstadoUsuario('${usuarioId}', ${usuario.activo === true})">
  ${usuario.activo === true ? "Desactivar usuario" : "Activar usuario"}
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


async function cambiarEstadoUsuario(usuarioId, estadoActual) {
  const nuevoEstado = !estadoActual;

  try {
    await updateDoc(doc(db, "usuarios", usuarioId), {
      activo: nuevoEstado
    });

    alert(
      nuevoEstado
        ? "Usuario activado correctamente"
        : "Usuario desactivado correctamente"
    );

    mostrarGestionUsuarios();

  } catch (error) {
    console.error("Error cambiando estado del usuario:", error);
    alert("Error al cambiar el estado del usuario");
  }
}

window.cambiarEstadoUsuario = cambiarEstadoUsuario;

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

async function mostrarGestionLiga() {
  const contentArea = document.getElementById("content-area");

  let btnVolver = document.getElementById("btn-volver-header");
  btnVolver.replaceWith(btnVolver.cloneNode(true));

  btnVolver = document.getElementById("btn-volver-header");
  btnVolver.classList.remove("oculto");
  btnVolver.onclick = () => {
    mostrarAdmin(window.usuarioActual);
  };


  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>📷 Gestión Liga</h2>
      <p>Cargando información de la liga...</p>
    </section>
  `;

  try {
    const ligasQuery = query(
      collection(db, "ligas"),
      where("activa", "==", true)
    );

    const ligasSnapshot = await getDocs(ligasQuery);

    let ligaActualHtml = "";

    if (ligasSnapshot.empty) {
      ligaActualHtml = `
        <article class="dashboard-card">
          <h3>🏆 Liga actual</h3>
          <p>No hay ninguna liga activa.</p>
        </article>
      `;
    } else {
      const ligaDoc = ligasSnapshot.docs[0];
      const liga = ligaDoc.data();

      const convocatoriasQuery = query(
        collection(db, "convocatorias"),
        where("ligaId", "==", ligaDoc.id)
      );

      const convocatoriasSnapshot = await getDocs(convocatoriasQuery);

      ligaActualHtml = `  
  <article class="dashboard-card">
    <h3>🏆 Liga actual</h3>

    <p><strong>${liga.titulo}</strong></p>
    <p><strong>Años:</strong> ${liga.anioInicio} - ${liga.anioFin}</p>
    <p><strong>Estado:</strong> ${liga.activa ? "Activa" : "Inactiva"}</p>
    <p><strong>Convocatorias:</strong> ${convocatoriasSnapshot.size}</p>
  </article>
`;
    }

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>📷 Gestión Liga</h2>
        <p>Crear y gestionar convocatorias de la liga fotográfica.</p>
      </section>

      ${ligaActualHtml}

      <section class="dashboard-grid">
        <article class="dashboard-card">
          <h3>🏆 Crear liga</h3>
          <p>Crear una liga completa y generar sus convocatorias automáticamente.</p>

          <button onclick="mostrarFormularioLiga()">
            Crear liga
          </button>
        </article>

        <article class="dashboard-card">
          <h3>📋 Ver convocatorias</h3>
          <p>Consultar convocatorias creadas.</p>

          <button onclick="mostrarListadoConvocatorias()">
            Ver convocatorias
          </button>
        </article>

       <article class="dashboard-card">
  <h3>👨‍⚖️ Jurado de la liga</h3>
  <p>Gestionar los jurados que puntuarán toda la liga.</p>

  <button onclick="mostrarGestionJuradoLiga()">
    Gestionar jurado
  </button>

  <button onclick="mostrarEditarInfoJurado()">
    Editar biografías y méritos
  </button>
</article>
      </section>

    `;

  } catch (error) {
    console.error("Error cargando gestión liga:", error);

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>📷 Gestión Liga</h2>
        <p>Error al cargar la información de la liga.</p>
      </section>
    `;
  }
}

window.mostrarGestionLiga = mostrarGestionLiga;



async function guardarConvocatoria() {

  const titulo =
    document.getElementById("convocatoria-titulo").value.trim();

  const codigo =
    document.getElementById("convocatoria-codigo").value.trim();

  const fechaInicio =
    document.getElementById("convocatoria-fecha-inicio").value;

  const fechaFin =
    document.getElementById("convocatoria-fecha-fin").value;

  if (
    !titulo ||
    !codigo ||
    !fechaInicio ||
    !fechaFin
  ) {
    alert("Completa todos los campos.");
    return;
  }

  try {

    await addDoc(collection(db, "convocatorias"), {

      titulo,
      codigo,
      fechaInicio,
      fechaFin,

      activa: false,

      estado: "Preparada"

    });

    alert("Convocatoria creada correctamente.");

    mostrarGestionLiga();

  } catch (error) {

    console.error(error);

    alert("No se pudo crear la convocatoria.");

  }
}

window.guardarConvocatoria = guardarConvocatoria;

async function mostrarListadoConvocatorias() {
  const contentArea = document.getElementById("content-area");

  document.getElementById("btn-volver-header").classList.remove("oculto");
document.getElementById("btn-volver-header").onclick = () => {
  mostrarGestionLiga();
};

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>📋 Convocatorias</h2>
      <p>Cargando convocatorias...</p>
    </section>
  `;

  try {
    const snapshot = await getDocs(collection(db, "convocatorias"));

    let html = `
      <section class="dashboard-card">
        <h2>📋 Convocatorias</h2>
      </section>

      <section class="dashboard-grid">
    `;

    snapshot.forEach((docConvocatoria) => {
      const convocatoria = docConvocatoria.data();
      const convocatoriaId = docConvocatoria.id;
      const estadoCalculado = calcularEstadoConvocatoria(convocatoria);

      html += `
        <article class="dashboard-card">
          <h3>${convocatoria.titulo}</h3>
          <p><strong>Código:</strong> ${convocatoria.codigo}</p>
         <p><strong>Inicio subida:</strong> ${formatearFecha(convocatoria.fechaInicioSubida)}</p>
<p><strong>Fin votación:</strong> ${formatearFecha(convocatoria.fechaFinVotacion)}</p>
<p><strong>Estado:</strong> ${estadoCalculado}</p>
          

          <button onclick="activarConvocatoria('${convocatoriaId}')">
            Activar
          </button>

          <button onclick="cerrarConvocatoria('${convocatoriaId}')">
            Cerrar
          </button>

          <button onclick="verParticipantesConvocatoria('${convocatoria.codigo}')">
          Ver participantes
          </button>
        </article>

      `;
    });

    html += `
      </section>

      <section class="dashboard-card">
        <button onclick="mostrarGestionLiga()">Volver</button>
      </section>
    `;

    contentArea.innerHTML = html;

  } catch (error) {
    console.error(error);
    alert("Error cargando convocatorias");
  }
}

window.mostrarListadoConvocatorias = mostrarListadoConvocatorias;

async function activarConvocatoria(convocatoriaId) {
  const confirmar = confirm(
    "¿Seguro que quieres activar esta convocatoria?"
  );

  if (!confirmar) return;

  try {
    const convocatoriaRef = doc(db, "convocatorias", convocatoriaId);

    await updateDoc(convocatoriaRef, {
      activa: true,
      estado: "Abierta"
    });

    alert("Convocatoria activada correctamente.");

    mostrarListadoConvocatorias();

  } catch (error) {
    console.error(error);
    alert("No se pudo activar la convocatoria.");
  }
}

window.activarConvocatoria = activarConvocatoria;


async function cerrarConvocatoria(convocatoriaId) {
  const confirmar = confirm(
    "¿Seguro que quieres cerrar esta convocatoria?"
  );

  if (!confirmar) return;

  try {
    const convocatoriaRef = doc(db, "convocatorias", convocatoriaId);

    await updateDoc(convocatoriaRef, {
      activa: false,
      estado: "Cerrada"
    });

    alert("Convocatoria cerrada correctamente.");

    mostrarListadoConvocatorias();

  } catch (error) {
    console.error(error);
    alert("No se pudo cerrar la convocatoria.");
  }
}

window.cerrarConvocatoria = cerrarConvocatoria;

async function verParticipantesConvocatoria(codigoConvocatoria) {
  const contentArea = document.getElementById("content-area");

  document.getElementById("btn-volver-header").classList.remove("oculto");
document.getElementById("btn-volver-header").onclick = () => {
  mostrarListadoConvocatorias();
};

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>📷 Participantes</h2>
      <p>Cargando participantes...</p>
    </section>
  `;

  try {
    const q = query(
      collection(db, "fotos"),
      where("convocatoriaId", "==", codigoConvocatoria),
      where("visible", "==", true)
    );

    const snapshot = await getDocs(q);

    let html = `
      <section class="dashboard-card">
        <h2>📷 Participantes</h2>
        <p><strong>Convocatoria:</strong> ${codigoConvocatoria}</p>
        <p><strong>Total participantes:</strong> ${snapshot.size}</p>
      </section>

      <section class="dashboard-grid">
    `;

    if (snapshot.empty) {
      html += `
        <article class="dashboard-card">
          <p>No hay fotografías presentadas todavía.</p>
        </article>
      `;
    } else {
      let contador = 1;

      snapshot.forEach((docFoto) => {
        const foto = docFoto.data();

        html += `
          <article class="dashboard-card">
            <h3>${contador}. ${foto.nombreSocio ?? "Socio"}</h3>
            <p><strong>Título:</strong> ${foto.tituloFoto ?? "-"}</p>

            <img
              src="${foto.urlFoto}"
              alt="${foto.tituloFoto ?? "Fotografía"}"
              class="miniatura-foto"
            >

            <br><br>

            <a href="${foto.urlFoto}" target="_blank" class="documento-link">
              Ver fotografía
            </a>
          </article>
        `;

        contador++;
      });
    }

    html += `
      </section>

      <section class="dashboard-card">
        <button onclick="mostrarListadoConvocatorias()">
          Volver
        </button>
      </section>
    `;

    contentArea.innerHTML = html;

  } catch (error) {
    console.error(error);
    alert("Error cargando participantes");
  }
}

window.verParticipantesConvocatoria = verParticipantesConvocatoria;

async function mostrarGestionJuradoLiga() {
  const contentArea = document.getElementById("content-area");

  let btnVolver = document.getElementById("btn-volver-header");
  btnVolver.replaceWith(btnVolver.cloneNode(true));

  btnVolver = document.getElementById("btn-volver-header");
  btnVolver.classList.remove("oculto");
  btnVolver.onclick = () => {
    mostrarGestionLiga();
  };

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>👨‍⚖️ Jurado de la liga</h2>
      <p>Cargando jurado...</p>
    </section>
  `;

  try {
    const configRef = doc(db, "configuracionLiga", "ligaActual");
    const configSnap = await getDoc(configRef);

    let jurado1 = "";
    let jurado2 = "";
    let jurado3 = "";

    if (configSnap.exists()) {
      const config = configSnap.data();

      jurado1 = config.jurado1 ?? "";
      jurado2 = config.jurado2 ?? "";
      jurado3 = config.jurado3 ?? "";
    }

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>👨‍⚖️ Jurado de la liga</h2>

        <label>Jurado 1 - Email</label>
        <input type="email" id="jurado-1" value="${jurado1}">

        <label>Jurado 2 - Email</label>
        <input type="email" id="jurado-2" value="${jurado2}">

        <label>Jurado 3 - Email</label>
        <input type="email" id="jurado-3" value="${jurado3}">

        <button onclick="guardarJuradoLiga()">
          Guardar jurado
        </button>

      </section>
    `;

  } catch (error) {
    console.error(error);
    alert("Error cargando jurado");
  }
}

window.mostrarGestionJuradoLiga = mostrarGestionJuradoLiga;

async function guardarJuradoLiga() {
  const jurado1 = document.getElementById("jurado-1").value.trim();
  const jurado2 = document.getElementById("jurado-2").value.trim();
  const jurado3 = document.getElementById("jurado-3").value.trim();

  if (!jurado1 || !jurado2 || !jurado3) {
    alert("Introduce los tres correos de los jurados.");
    return;
  }

  try {
    const configRef = doc(db, "configuracionLiga", "ligaActual");

    await updateDoc(configRef, {
      jurado1,
      jurado2,
      jurado3
    });

    alert("Jurado guardado correctamente.");

    mostrarGestionLiga();

  } catch (error) {
    console.error(error);
    alert("No se pudo guardar el jurado.");
  }
}

window.guardarJuradoLiga = guardarJuradoLiga;


async function mostrarPanelJurado(usuario) {
  const contentArea = document.getElementById("content-area");

  let btnVolver = document.getElementById("btn-volver-header");
  btnVolver.replaceWith(btnVolver.cloneNode(true));

  btnVolver = document.getElementById("btn-volver-header");
  btnVolver.classList.remove("oculto");
  btnVolver.onclick = () => {
    mostrarInicio(window.usuarioActual);
  };

  if (!tieneRol(usuario, "jurado") && !tieneRol(usuario, "admin")) {
    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>⚖️ Panel Jurado</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
      </section>
    `;
    return;
  }

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>Panel Jurado</h2>
      <p>Cargando convocatoria...</p>
    </section>
  `;

  try {
    const convocatoria = await obtenerConvocatoriaActual();

    if (!convocatoria) {
      contentArea.innerHTML = `
        <section class="dashboard-card">
          <h2>Panel Jurado</h2>
          <p>No hay convocatoria disponible para el jurado en este momento.</p>
        </section>
      `;
      return;
    }

    if (convocatoria.estadoCalculado !== "votacion") {
      contentArea.innerHTML = `
        <section class="dashboard-card">
          <h2>Panel Jurado</h2>
          <p>La convocatoria actual todavía no está en periodo de votación.</p>
          <p><strong>Convocatoria:</strong> ${convocatoria.titulo || convocatoria.codigo}</p>
          <p><strong>Estado actual:</strong> ${convocatoria.estadoCalculado}</p>
        </section>
      `;
      return;
    }

    const fotosQuery = query(
      collection(db, "fotos"),
      where("convocatoriaId", "==", convocatoria.codigo),
      where("visible", "==", true)
    );

    const fotosSnapshot = await getDocs(fotosQuery);

    if (fotosSnapshot.empty) {
      contentArea.innerHTML = `
        <section class="dashboard-card">
          <h2>Panel Jurado</h2>
          <p>No hay fotografías para valorar en esta convocatoria.</p>
        </section>
      `;
      return;
    }

    let html = `
      <section class="dashboard-card">
        <h2>Panel Jurado</h2>
        <p><strong>Convocatoria:</strong> ${convocatoria.titulo || convocatoria.codigo}</p>
        <p>Valora las fotografías de forma anónima.</p>
      </section>
    `;

    for (const docFoto of fotosSnapshot.docs) {
      const foto = docFoto.data();

      const votoId = `${convocatoria.codigo}_${docFoto.id}_${usuario.email}`;
      const votoSnap = await getDoc(doc(db, "votaciones", votoId));

      let tecnicaActual = "";
      let creatividadActual = "";
      let dificultadActual = "";
      let textoEstado = "⏳ Pendiente de votar";
      let textoBoton = "Guardar puntuación";

      if (votoSnap.exists()) {
        const voto = votoSnap.data();

        tecnicaActual = voto.tecnica;
        creatividadActual = voto.creatividad;
        dificultadActual = voto.dificultad;

        textoEstado = "✅ Fotografía ya votada. Puedes modificar la puntuación si lo deseas.";
        textoBoton = "Modificar puntuación";
      }

      html += `
        <section class="dashboard-card foto-jurado-card">

          <p>
            <strong>${foto.tituloFoto || "Sin título"}</strong>
          </p>

          <p>${textoEstado}</p>

          <img
            src="${foto.urlFoto}"
            alt="${foto.tituloFoto || "Fotografía participante"}"
            class="miniatura-foto"
          >

          <br><br>

          <button onclick="abrirVisorFoto('${foto.urlFoto}', '${foto.tituloFoto || "Fotografía"}')">
            🔍 Ver fotografía grande
          </button>

          <div class="form-group">
            <label>Técnica /5</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.5"
              id="tecnica-${docFoto.id}"
              value="${tecnicaActual}"
            >
          </div>

          <div class="form-group">
            <label>Creatividad /3</label>
            <input
              type="number"
              min="0"
              max="3"
              step="0.5"
              id="creatividad-${docFoto.id}"
              value="${creatividadActual}"
            >
          </div>

          <div class="form-group">
            <label>Dificultad /2</label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.5"
              id="dificultad-${docFoto.id}"
              value="${dificultadActual}"
            >
          </div>

          <button onclick="guardarVotoJurado('${docFoto.id}', '${convocatoria.codigo}', '${usuario.email}')">
            ${textoBoton}
          </button>
        </section>
      `;
    }

    contentArea.innerHTML = html;

  } catch (error) {
    console.error("Error en panel jurado:", error);

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>Panel Jurado</h2>
        <p>Error al cargar el panel de jurado.</p>
      </section>
    `;
  }
}

window.mostrarPanelJurado = mostrarPanelJurado;


async function mostrarJuradoLiga() {
  const contentArea = document.getElementById("content-area");

  let btnVolver = document.getElementById("btn-volver-header");
  btnVolver.replaceWith(btnVolver.cloneNode(true));

  btnVolver = document.getElementById("btn-volver-header");
  btnVolver.classList.remove("oculto");
  btnVolver.onclick = () => {
    mostrarLiga(window.usuarioActual);
  };

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>👥 Jurado de la liga</h2>
      <p>Cargando información...</p>
    </section>
  `;

  try {

    const configRef = doc(db, "configuracionLiga", "ligaActual");
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
      contentArea.innerHTML = `
        <section class="dashboard-card">
          <h2>👥 Jurado de la liga</h2>
          <p>No hay jurado configurado.</p>
        </section>
      `;
      return;
    }

    const config = configSnap.data();

    const emailsJurado = [
      config.jurado1,
      config.jurado2,
      config.jurado3
    ].filter(Boolean);

    let html = `
      <section class="dashboard-card">
        <h2>👥 Jurado de la liga</h2>
        <p>Conoce a los miembros encargados de valorar las fotografías.</p>
      </section>
    `;

    for (const email of emailsJurado) {

      const usuarioQuery = query(
        collection(db, "usuarios"),
        where("email", "==", email)
      );

      const usuarioSnapshot = await getDocs(usuarioQuery);

      if (!usuarioSnapshot.empty) {

        const usuario = usuarioSnapshot.docs[0].data();

        html += `
          <section class="dashboard-card">
            <h3>👤 ${usuario.nombre || "Jurado"}</h3>

            <p>
              ${usuario.bioJurado || "Información no disponible."}
            </p>

            <h4>🏆 Méritos</h4>

            <p>
              ${usuario.meritosJurado || "Información no disponible."}
            </p>
          </section>
        `;
      }
    }

    contentArea.innerHTML = html;

  } catch (error) {
    console.error(error);

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>👥 Jurado de la liga</h2>
        <p>Error cargando la información del jurado.</p>
      </section>
    `;
  }
}

window.mostrarJuradoLiga = mostrarJuradoLiga;


async function mostrarEditarInfoJurado() {
  const contentArea = document.getElementById("content-area");

  let btnVolver = document.getElementById("btn-volver-header");
  btnVolver.replaceWith(btnVolver.cloneNode(true));

  btnVolver = document.getElementById("btn-volver-header");
  btnVolver.classList.remove("oculto");
  btnVolver.onclick = () => {
    mostrarGestionLiga();
  };

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>👥 Editar biografías y méritos</h2>
      <p>Cargando jurado...</p>
    </section>
  `;

  try {
    const configRef = doc(db, "configuracionLiga", "ligaActual");
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
      contentArea.innerHTML = `
        <section class="dashboard-card">
          <h2>👥 Editar biografías y méritos</h2>
          <p>No hay jurado configurado actualmente.</p>
        </section>
      `;
      return;
    }

    const config = configSnap.data();

    const emailsJurado = [
      config.jurado1,
      config.jurado2,
      config.jurado3
    ].filter(Boolean);

    let html = `
      <section class="dashboard-card">
        <h2>👥 Editar biografías y méritos</h2>
        <p>Edita la información pública de los miembros del jurado asignados a la liga.</p>
      </section>

      <section class="dashboard-grid">
    `;

    if (emailsJurado.length === 0) {
      html += `
        <article class="dashboard-card">
          <p>No hay jurados asignados todavía.</p>
        </article>
      `;
    }

    for (const email of emailsJurado) {
      const usuarioQuery = query(
        collection(db, "usuarios"),
        where("email", "==", email)
      );

      const usuarioSnapshot = await getDocs(usuarioQuery);

      if (usuarioSnapshot.empty) {
        html += `
          <article class="dashboard-card">
            <h3>Jurado no encontrado</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p>No existe ningún usuario con este email.</p>
          </article>
        `;
        continue;
      }

      const docUsuario = usuarioSnapshot.docs[0];
      const usuario = docUsuario.data();
      const usuarioId = docUsuario.id;

      html += `
        <article class="dashboard-card">
          <h3>${usuario.nombre || "Jurado"}</h3>
          <p><strong>Email:</strong> ${usuario.email}</p>

          <label>Biografía</label>
          <textarea id="bio-${usuarioId}" rows="4">${usuario.bioJurado || ""}</textarea>

          <label>Méritos</label>
          <textarea id="meritos-${usuarioId}" rows="4">${usuario.meritosJurado || ""}</textarea>

          <button onclick="guardarInfoJurado('${usuarioId}')">
            Guardar información
          </button>
        </article>
      `;
    }

    html += `
      </section>
    `;

    contentArea.innerHTML = html;

  } catch (error) {
    console.error(error);
    alert("Error cargando la información del jurado.");
  }
}

window.mostrarEditarInfoJurado = mostrarEditarInfoJurado;


async function guardarInfoJurado(usuarioId) {
  const bio = document.getElementById(`bio-${usuarioId}`).value.trim();
  const meritos = document.getElementById(`meritos-${usuarioId}`).value.trim();

  try {
    await updateDoc(doc(db, "usuarios", usuarioId), {
      bioJurado: bio,
      meritosJurado: meritos
    });

    alert("Información del jurado actualizada correctamente.");

    mostrarEditarInfoJurado();

  } catch (error) {
    console.error(error);
    alert("Error guardando la información del jurado.");
  }
}

window.guardarInfoJurado = guardarInfoJurado;



function abrirVisorFoto(urlFoto, tituloFoto) {
  const visor = document.createElement("div");

  visor.className = "visor-foto";

  visor.innerHTML = `
    <div class="visor-foto-contenido">
      <button class="visor-cerrar" onclick="cerrarVisorFoto()">
        ✕
      </button>

      <img
        src="${urlFoto}"
        alt="${tituloFoto}"
        class="visor-foto-img"
      >

      <p>${tituloFoto}</p>
    </div>
  `;

  document.body.appendChild(visor);
}

window.abrirVisorFoto = abrirVisorFoto;

function cerrarVisorFoto() {
  const visor = document.querySelector(".visor-foto");

  if (visor) {
    visor.remove();
  }
}

window.cerrarVisorFoto = cerrarVisorFoto;

async function mostrarFormularioValoracion(fotoId) {
  const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));
  const contentArea = document.getElementById("content-area");

  if (!usuario) {
    alert("No se ha encontrado el usuario.");
    return;
  }

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>⚖️ Valorar fotografía</h2>
      <p>Cargando fotografía...</p>
    </section>
  `;

  try {
    const fotoRef = doc(db, "fotos", fotoId);
    const fotoSnap = await getDoc(fotoRef);

    if (!fotoSnap.exists()) {
      alert("No se encontró la fotografía.");
      mostrarPanelJurado(usuario);
      return;
    }

    const foto = fotoSnap.data();

    let tecnicaActual = "";
    let creatividadActual = "";
    let dificultadActual = "";

    const votoQuery = query(
      collection(db, "votaciones"),
      where("fotoId", "==", fotoId),
      where("juradoEmail", "==", usuario.email)
    );

    const votoSnapshot = await getDocs(votoQuery);

    if (!votoSnapshot.empty) {
      const voto = votoSnapshot.docs[0].data();

      tecnicaActual = voto.tecnica;
      creatividadActual = voto.creatividad;
      dificultadActual = voto.dificultad;
    }

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>⚖️ Valorar fotografía</h2>

        <p><strong>Título:</strong> ${foto.tituloFoto ?? "-"}</p>

        <img
          src="${foto.urlFoto}"
          alt="${foto.tituloFoto ?? "Fotografía"}"
          class="miniatura-foto"
        >

        <br><br>

        <button onclick="abrirVisorFoto('${foto.urlFoto}', '${foto.tituloFoto ?? "Fotografía"}')">
          🔍 Ver fotografía grande
        </button>

        <hr>

       <label>Técnica / calidad fotográfica (0 a 5)</label>
<input
  type="number"
  id="valor-tecnica"
  min="0"
  max="5"
  step="0.5"
  value="${tecnicaActual}"
>

<label>Creatividad / originalidad (0 a 3)</label>
<input
  type="number"
  id="valor-creatividad"
  min="0"
  max="3"
  step="0.5"
  value="${creatividadActual}"
>

<label>Dificultad / mérito (0 a 2)</label>
<input
  type="number"
  id="valor-dificultad"
  min="0"
  max="2"
  step="0.5"
  value="${dificultadActual}"
>

        <button onclick="guardarValoracion('${fotoId}')">
          Guardar valoración
        </button>

        <button onclick="mostrarPanelJurado(${JSON.stringify(usuario).replace(/"/g, '&quot;')})">
          Volver
        </button>
      </section>
    `;

  } catch (error) {
    console.error(error);
    alert("Error cargando fotografía.");
  }
}

window.mostrarFormularioValoracion = mostrarFormularioValoracion;

async function guardarValoracion(fotoId) {
  const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));

  const tecnica = Number(document.getElementById("valor-tecnica").value);
  const creatividad = Number(document.getElementById("valor-creatividad").value);
  const dificultad = Number(document.getElementById("valor-dificultad").value);

  if (
    tecnica < 0 || tecnica > 5 ||
    creatividad < 0 || creatividad > 3 ||
    dificultad < 0 || dificultad > 2
  ) {
    alert("Revisa las puntuaciones. Técnica 0-5, creatividad 0-3, dificultad 0-2.");
    return;
  }

  const total = tecnica + creatividad + dificultad;

  try {

    const q = query(
      collection(db, "votaciones"),
      where("fotoId", "==", fotoId),
      where("juradoEmail", "==", usuario.email)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {

      await addDoc(collection(db, "votaciones"), {
        fotoId,
        juradoEmail: usuario.email,
        tecnica,
        creatividad,
        dificultad,
        total,
        fecha: serverTimestamp()
      });

      alert(`Valoración guardada. Total: ${total}`);

    } else {

      const votoId = snapshot.docs[0].id;

      await updateDoc(
        doc(db, "votaciones", votoId),
        {
          tecnica,
          creatividad,
          dificultad,
          total,
          fecha: serverTimestamp()
        }
      );

      alert(`Valoración actualizada. Total: ${total}`);
    }

    mostrarPanelJurado(usuario);

  } catch (error) {
    console.error("Error guardando valoración:", error);
    alert("No se pudo guardar la valoración.");
  }
}

window.guardarValoracion = guardarValoracion;

function mostrarFormularioLiga() {

  const contentArea = document.getElementById("content-area");

  let btnVolver = document.getElementById("btn-volver-header");
btnVolver.replaceWith(btnVolver.cloneNode(true));

btnVolver = document.getElementById("btn-volver-header");
btnVolver.classList.remove("oculto");
btnVolver.onclick = () => {
  mostrarGestionLiga();
};

  contentArea.innerHTML = `
    <section class="dashboard-card">

      <h2>🏆 Nueva Liga</h2>

      <label>Título de la liga</label>

      <input
        type="text"
        id="liga-titulo"
        placeholder="Liga Fotográfica 2026-2027"
      >

      <label>Año inicio</label>

      <input
        type="number"
        id="liga-anio-inicio"
        value="2026"
      >

      <label>Año fin</label>

      <input
        type="number"
        id="liga-anio-fin"
        value="2027"
      >

      <button onclick="guardarLigaYConvocatorias()">
        Crear liga
      </button>

     
    </section>
  `;
}

window.mostrarFormularioLiga = mostrarFormularioLiga;

async function guardarLigaYConvocatorias() {
  const titulo = document.getElementById("liga-titulo").value.trim();
  const anioInicio = Number(document.getElementById("liga-anio-inicio").value);
  const anioFin = Number(document.getElementById("liga-anio-fin").value);

  if (!titulo || !anioInicio || !anioFin) {
    alert("Completa todos los campos.");
    return;
  }

  try {
    const ligaRef = await addDoc(collection(db, "ligas"), {
      titulo,
      anioInicio,
      anioFin,
      activa: true,
      fechaCreacion: serverTimestamp()
    });

    const meses = [
      { nombre: "Noviembre", numero: 11, anio: anioInicio },
      { nombre: "Diciembre", numero: 12, anio: anioInicio },
      { nombre: "Enero", numero: 1, anio: anioFin },
      { nombre: "Febrero", numero: 2, anio: anioFin },
      { nombre: "Marzo", numero: 3, anio: anioFin },
      { nombre: "Abril", numero: 4, anio: anioFin },
      { nombre: "Mayo", numero: 5, anio: anioFin },
      { nombre: "Junio", numero: 6, anio: anioFin }
    ];

    for (const mes of meses) {
      const numeroMes = String(mes.numero).padStart(2, "0");
      const ultimoDia = new Date(mes.anio, mes.numero, 0).getDate();

      await addDoc(collection(db, "convocatorias"), {
        ligaId: ligaRef.id,
        titulo: `${mes.nombre} ${mes.anio}`,
        codigo: `${mes.anio}-${numeroMes}`,
        fechaInicioSubida: `${mes.anio}-${numeroMes}-01`,
        fechaFinSubida: `${mes.anio}-${numeroMes}-15`,
        fechaInicioVotacion: `${mes.anio}-${numeroMes}-16`,
        fechaFinVotacion: `${mes.anio}-${numeroMes}-${ultimoDia}`,
        activa: false,
        estado: "Programada"
      });
    }

    alert("Liga y convocatorias creadas correctamente.");

    mostrarGestionLiga();

  } catch (error) {
    console.error("Error creando liga:", error);
    alert("No se pudo crear la liga.");
  }
}

window.guardarLigaYConvocatorias = guardarLigaYConvocatorias;

async function obtenerConvocatoriaActual() {
  const hoy = new Date().toISOString().split("T")[0];

  const convocatoriasQuery = query(
    collection(db, "convocatorias"),
    where("fechaFinVotacion", ">=", hoy),
    limit(3)
  );

  const snapshot = await getDocs(convocatoriasQuery);

  for (const docConvocatoria of snapshot.docs) {
    const convocatoria = docConvocatoria.data();

    const estaEnSubida =
      hoy >= convocatoria.fechaInicioSubida &&
      hoy <= convocatoria.fechaFinSubida;

    const estaEnVotacion =
      hoy >= convocatoria.fechaInicioVotacion &&
      hoy <= convocatoria.fechaFinVotacion;

    if (estaEnSubida || estaEnVotacion) {
      return {
        id: docConvocatoria.id,
        ...convocatoria,
        estadoCalculado: estaEnSubida ? "subida" : "votacion"
      };
    }
  }

  return null;
}

window.obtenerConvocatoriaActual = obtenerConvocatoriaActual;

function calcularEstadoConvocatoria(convocatoria) {
  const hoy = new Date().toISOString().split("T")[0];

  if (
    hoy >= convocatoria.fechaInicioSubida &&
    hoy <= convocatoria.fechaFinSubida
  ) {
    return "Subida de fotografías";
  }

  if (
    hoy >= convocatoria.fechaInicioVotacion &&
    hoy <= convocatoria.fechaFinVotacion
  ) {
    return "Votación del jurado";
  }

  if (hoy < convocatoria.fechaInicioSubida) {
    return "Programada";
  }

  return "Cerrada";
}

window.calcularEstadoConvocatoria = calcularEstadoConvocatoria;

async function mostrarClasificacionConvocatoria(origen = "liga") {
  const contentArea = document.getElementById("content-area");

  let btnVolver = document.getElementById("btn-volver-header");
  btnVolver.replaceWith(btnVolver.cloneNode(true));

  btnVolver = document.getElementById("btn-volver-header");
  btnVolver.classList.remove("oculto");

  if (origen === "gestion") {
    btnVolver.onclick = () => mostrarGestionLiga();
  } else {
    btnVolver.onclick = () => mostrarLiga(window.usuarioActual);
  }

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>🏆 Clasificación convocatoria</h2>
      <p>Cargando clasificación...</p>
    </section>
  `;

  try {
    const convocatoria = await obtenerConvocatoriaActual();

    if (!convocatoria) {
      contentArea.innerHTML = `
        <section class="dashboard-card">
          <h2>🏆 Clasificación convocatoria</h2>
          <p>No existe convocatoria activa.</p>
        </section>
      `;
      return;
    }

    const fotosQuery = query(
      collection(db, "fotos"),
      where("convocatoriaId", "==", convocatoria.codigo),
      where("visible", "==", true)
    );

    const fotosSnapshot = await getDocs(fotosQuery);

    const clasificacion = [];

    for (const docFoto of fotosSnapshot.docs) {
      const foto = docFoto.data();

      const votosQuery = query(
        collection(db, "votaciones"),
        where("convocatoriaId", "==", convocatoria.codigo),
        where("fotoId", "==", docFoto.id)
      );

      const votosSnapshot = await getDocs(votosQuery);

      let totalPuntos = 0;
      let numeroVotos = 0;

      votosSnapshot.forEach((docVoto) => {
        totalPuntos += docVoto.data().total || 0;
        numeroVotos++;
      });

      clasificacion.push({
        nombreSocio: foto.nombreSocio || "Socio",
        tituloFoto: foto.tituloFoto || "Sin título",
        urlFoto: foto.urlFoto || "",
        puntos: totalPuntos,
        numeroVotos: numeroVotos
      });
    }

    clasificacion.sort((a, b) => b.puntos - a.puntos);

    let html = `
      <section class="dashboard-card">
        <h2>🏆 Clasificación convocatoria</h2>
        <p>${convocatoria.titulo || convocatoria.codigo}</p>
        <p>Pincha en el nombre del socio para ver la fotografía presentada.</p>
      </section>

      <section class="dashboard-card">
    `;

    if (clasificacion.length === 0) {
      html += `
        <p>No hay fotografías presentadas en esta convocatoria.</p>
      `;
    }

    clasificacion.forEach((item, index) => {
      const nombreSeguro = item.nombreSocio.replace(/'/g, "\\'");
      const tituloSeguro = item.tituloFoto.replace(/'/g, "\\'");
      const urlSegura = item.urlFoto.replace(/'/g, "\\'");

      html += `
        <p>
          <strong>${index + 1}.</strong>

          <button
            type="button"
            class="link-button"
            onclick="abrirVisorFoto('${urlSegura}', '${tituloSeguro}')">
            ${nombreSeguro}
          </button>

          (${item.tituloFoto})
          - ${item.puntos} puntos
          <br>
          <small>Votos recibidos: ${item.numeroVotos}</small>
        </p>
      `;
    });

    html += `
      </section>
    `;

    contentArea.innerHTML = html;

  } catch (error) {
    console.error("Error calculando clasificación:", error);
    alert("Error calculando clasificación.");
  }
}

window.mostrarClasificacionConvocatoria = mostrarClasificacionConvocatoria;
window.mostrarClasificacionJurado = mostrarClasificacionConvocatoria;


async function mostrarClasificacionGeneral() {
  const contentArea = document.getElementById("content-area");

  let btnVolver = document.getElementById("btn-volver-header");
  btnVolver.replaceWith(btnVolver.cloneNode(true));

  btnVolver = document.getElementById("btn-volver-header");
  btnVolver.classList.remove("oculto");
  btnVolver.onclick = () => {
    mostrarLiga(window.usuarioActual);
  };

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>🏆 Clasificación general</h2>
      <p>Cargando clasificación...</p>
    </section>
  `;

  try {
    const q = query(
      collection(db, "clasificaciones"),
      where("visible", "==", true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      contentArea.innerHTML = `
        <section class="dashboard-card">
          <h2>🏆 Clasificación general</h2>
          <p>No hay clasificaciones publicadas todavía.</p>
        </section>
      `;
      return;
    }

    const acumulado = {};

    snapshot.forEach((docClasificacion) => {
      const item = docClasificacion.data();

      const clave = item.email || item.nombreSocio;

      if (!acumulado[clave]) {
        acumulado[clave] = {
          nombreSocio: item.nombreSocio,
          puntos: 0
        };
      }

      acumulado[clave].puntos += Number(item.puntos) || 0;
    });

    const clasificacionGeneral = Object.values(acumulado).sort(
      (a, b) => b.puntos - a.puntos
    );

    let html = `
      <section class="dashboard-card">
        <h2>🏆 Clasificación general</h2>
        <p>Puntuación acumulada de todas las convocatorias publicadas.</p>
      </section>

      <section class="dashboard-grid">
    `;

    clasificacionGeneral.forEach((item, index) => {
      html += `
        <article class="dashboard-card">
          <h3>${index + 1}. ${item.nombreSocio}</h3>
          <p><strong>${item.puntos}</strong> puntos</p>
        </article>
      `;
    });

    html += `
      </section>
    `;

    contentArea.innerHTML = html;

  } catch (error) {
    console.error(error);

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>🏆 Clasificación general</h2>
        <p>Error al cargar la clasificación general.</p>
      </section>
    `;
  }
}

window.mostrarClasificacionGeneral = mostrarClasificacionGeneral;


let accionConfirmada = null;

function crearModalConfirmacionSiNoExiste() {
  let modal = document.getElementById("modal-confirmacion");

  if (modal) return;

  const modalHtml = `
    <div id="modal-confirmacion" class="modal oculto">
      <div class="modal-contenido">
        <h3>Confirmar acción</h3>

        <p id="modal-mensaje">
          ¿Seguro que quieres continuar?
        </p>

        <div class="modal-botones">
          <button id="btn-cancelar-modal" type="button">
            Cancelar
          </button>

          <button id="btn-confirmar-modal" type="button" class="btn-peligro">
            Borrar
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);

  document.getElementById("btn-cancelar-modal").addEventListener("click", function () {
    cerrarConfirmacion();
  });

  document.getElementById("btn-confirmar-modal").addEventListener("click", async function () {
    if (accionConfirmada) {
      await accionConfirmada();
    }
  });
}

window.mostrarConfirmacion = function (mensaje, callback) {
  crearModalConfirmacionSiNoExiste();

  const modal = document.getElementById("modal-confirmacion");
  const texto = document.getElementById("modal-mensaje");

  texto.textContent = mensaje;

  accionConfirmada = callback;

  modal.classList.remove("oculto");
};

window.cerrarConfirmacion = function () {
  const modal = document.getElementById("modal-confirmacion");

  if (modal) {
    modal.classList.add("oculto");
  }

  accionConfirmada = null;
};


async function guardarVotoJurado(fotoId, convocatoriaId, emailJurado) {
  try {
    const tecnica = Number(document.getElementById(`tecnica-${fotoId}`).value);
    const creatividad = Number(document.getElementById(`creatividad-${fotoId}`).value);
    const dificultad = Number(document.getElementById(`dificultad-${fotoId}`).value);

    if (
      tecnica < 0 || tecnica > 5 ||
      creatividad < 0 || creatividad > 3 ||
      dificultad < 0 || dificultad > 2 ||
      isNaN(tecnica) || isNaN(creatividad) || isNaN(dificultad)
    ) {
      alert("Revisa las puntuaciones. Técnica máximo 5, creatividad máximo 3 y dificultad máximo 2.");
      return;
    }

    const total = tecnica + creatividad + dificultad;

    const votoId = `${convocatoriaId}_${fotoId}_${emailJurado}`;

    await setDoc(doc(db, "votaciones", votoId), {
      convocatoriaId,
      fotoId,
      emailJurado,
      tecnica,
      creatividad,
      dificultad,
      total,
      fechaVoto: serverTimestamp()
    });

    alert(`✅ Puntuación guardada correctamente. Total: ${total} puntos`);

  } catch (error) {
    console.error("Error al guardar voto:", error);
    alert("Error al guardar la puntuación.");
  }
}

window.guardarVotoJurado = guardarVotoJurado;


async function calcularClasificacionConvocatoria(convocatoriaId) {
  try {
    const convocatoriaQuery = query(
      collection(db, "convocatorias"),
      where("codigo", "==", convocatoriaId)
    );

    const convocatoriaSnapshot = await getDocs(convocatoriaQuery);

    let ligaId = null;

    if (!convocatoriaSnapshot.empty) {
      ligaId = convocatoriaSnapshot.docs[0].data().ligaId || null;
    }

    const fotosQuery = query(
      collection(db, "fotos"),
      where("convocatoriaId", "==", convocatoriaId),
      where("visible", "==", true)
    );

    const fotosSnapshot = await getDocs(fotosQuery);

    if (fotosSnapshot.empty) {
      alert("No hay fotos para calcular la clasificación.");
      return;
    }

    let clasificacion = [];

    for (const docFoto of fotosSnapshot.docs) {
      const foto = docFoto.data();

      const votosQuery = query(
        collection(db, "votaciones"),
        where("convocatoriaId", "==", convocatoriaId),
        where("fotoId", "==", docFoto.id)
      );

      const votosSnapshot = await getDocs(votosQuery);

      let puntosTotales = 0;
      let numeroVotos = 0;

      votosSnapshot.forEach((docVoto) => {
        const voto = docVoto.data();
        puntosTotales += voto.total || 0;
        numeroVotos++;
      });

      clasificacion.push({
        fotoId: docFoto.id,
        convocatoriaId: convocatoriaId,
        ligaId: ligaId,
        socioEmail: foto.email,
        nombreSocio: foto.nombreSocio || "Socio",
        puntos: puntosTotales,
        numeroVotos: numeroVotos
      });
    }

    clasificacion.sort((a, b) => b.puntos - a.puntos);

    for (let i = 0; i < clasificacion.length; i++) {
      const item = clasificacion[i];

      await setDoc(
        doc(db, "clasificaciones", `${convocatoriaId}_${item.fotoId}`),
        {
          ...item,
          ligaId: ligaId,
          posicion: i + 1,
          fechaCalculo: serverTimestamp()
        }
      );
    }

    alert("Clasificación mensual calculada correctamente.");

  } catch (error) {
    console.error("Error al calcular clasificación:", error);
    alert("Error al calcular la clasificación.");
  }
}

window.calcularClasificacionConvocatoria = calcularClasificacionConvocatoria;


function mostrarDirectiva(usuario) {
  const contentArea = document.getElementById("content-area");

  let btnVolver = document.getElementById("btn-volver-header");
  btnVolver.replaceWith(btnVolver.cloneNode(true));

  btnVolver = document.getElementById("btn-volver-header");
  btnVolver.classList.remove("oculto");
  btnVolver.onclick = () => {
    mostrarInicio(window.usuarioActual);
  };


  if (!tieneRol(usuario, "directiva") && !tieneRol(usuario, "admin")) {
    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>⚙️ Gestión</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
      </section>
    `;
    return;
  }

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>⚙️ Gestión Directiva</h2>
      <p>Panel de gestión para miembros de la directiva.</p>
    </section>

    <section class="dashboard-grid">
      <article class="dashboard-card">
        <h3>📅 Actividades</h3>
        <p>Crear y gestionar actividades de AGAFONA.</p>
        <button onclick="mostrarGestionActividades()">Gestionar actividades</button>
      </article>

      <article class="dashboard-card">
        <h3>📄 Documentos</h3>
        <p>Subir y gestionar documentos internos.</p>
        <button onclick="mostrarGestionDocumentos()">Gestionar documentos</button>
      </article>

      <article class="dashboard-card">
        <h3>📢 Avisos</h3>
        <p>Crear avisos para socios.</p>
        <button onclick="mostrarGestionAvisos()">Gestionar avisos</button>
      </article>

      <article class="dashboard-card">
  <h3>🔔 Enviar notificación</h3>
  <p>Crear una comunicación rápida para socios y/o directiva.</p>

  <button onclick="mostrarEnviarNotificacion()">
    Enviar notificación
  </button>
</article>

    </section>
  `;
}

window.mostrarDirectiva = mostrarDirectiva;



function volverGestion() {
  const usuario = JSON.parse(localStorage.getItem("usuarioAgafona"));

  if (!usuario) {
    location.reload();
    return;
  }

  if (tieneRol(usuario, "admin")) {
    mostrarAdmin(usuario);
  } else if (tieneRol(usuario, "directiva")) {
    mostrarDirectiva(usuario);
  } else {
    mostrarInicio(usuario);
  }
}

window.volverGestion = volverGestion;


async function borrarActividad(actividadId) {
  mostrarConfirmacion(
    "¿Seguro que quieres borrar esta actividad definitivamente?",
    async function () {
      console.log("Borrando actividad:", actividadId);

      try {
        await deleteDoc(doc(db, "actividades", actividadId));

        cerrarConfirmacion();

        alert("Actividad borrada correctamente");

        mostrarGestionActividades();

      } catch (error) {
        console.error("ERROR BORRANDO ACTIVIDAD:", error);

        cerrarConfirmacion();

        alert("Error al borrar la actividad");
      }
    }
  );
}

window.borrarActividad = borrarActividad;


async function borrarAviso(avisoId) {

  mostrarConfirmacion(
    "¿Seguro que quieres borrar este aviso definitivamente?",
    async function () {

      try {
        await deleteDoc(doc(db, "avisos", avisoId));

        cerrarConfirmacion();

        alert("Aviso borrado correctamente");

        mostrarGestionAvisos();

      } catch (error) {

        console.error(error);

        cerrarConfirmacion();

        alert("Error al borrar el aviso");
      }
    }
  );
}

window.borrarAviso = borrarAviso;


async function borrarDocumento(documentoId) {

  mostrarConfirmacion(
    "¿Seguro que quieres borrar este documento definitivamente?",
    async function () {

      console.log("Borrando documento:", documentoId);

      try {
        await deleteDoc(doc(db, "documentos", documentoId));

        cerrarConfirmacion();

        alert("Documento borrado correctamente");

        mostrarGestionDocumentos();

      } catch (error) {

        console.error("ERROR BORRANDO DOCUMENTO:", error);

        cerrarConfirmacion();

        alert("Error al borrar el documento");
      }
    }
  );
}

window.borrarDocumento = borrarDocumento;


async function cambiarEstadoActividad(actividadId, estadoActual) {
  console.log("Cambiando actividad:", actividadId, estadoActual);

  const nuevoEstado = !estadoActual;

  try {
    await updateDoc(doc(db, "actividades", actividadId), {
      activa: nuevoEstado
    });

    alert(
      nuevoEstado
        ? "Actividad activada correctamente"
        : "Actividad desactivada correctamente"
    );

    mostrarGestionActividades();

  } catch (error) {
    console.error("ERROR CAMBIANDO ACTIVIDAD:", error);
    alert("Error al cambiar el estado de la actividad");
  }
}

window.cambiarEstadoActividad = cambiarEstadoActividad;


async function mostrarMisEstadisticas(usuario) {
  const contentArea = document.getElementById("content-area");

  document.getElementById("btn-volver-header").classList.remove("oculto");
  document.getElementById("btn-volver-header").onclick = () => mostrarPerfil(usuario);

  contentArea.innerHTML = `
    <section class="dashboard-card">
      <h2>📊 Mis estadísticas</h2>
      <p>Cargando estadísticas...</p>
    </section>
  `;

  try {
    const fotosQuery = query(
      collection(db, "fotos"),
      where("email", "==", usuario.email),
      where("visible", "==", true)
    );

    const fotosSnapshot = await getDocs(fotosQuery);
    const totalFotosEnviadas = fotosSnapshot.size;

    const clasificacionesSocioQuery = query(
      collection(db, "clasificaciones"),
      where("socioEmail", "==", usuario.email)
    );

    const clasificacionesSocioSnapshot = await getDocs(clasificacionesSocioQuery);

    const convocatoriasParticipadas = new Set();
    let mejorPosicion = null;

    clasificacionesSocioSnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (data.convocatoriaId) {
        convocatoriasParticipadas.add(data.convocatoriaId);
      }

      if (typeof data.posicion === "number") {
        if (mejorPosicion === null || data.posicion < mejorPosicion) {
          mejorPosicion = data.posicion;
        }
      }
    });

    const todasClasificacionesSnapshot = await getDocs(
      collection(db, "clasificaciones")
    );

    const puntosPorSocio = {};

    todasClasificacionesSnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (!data.socioEmail) return;

      if (!puntosPorSocio[data.socioEmail]) {
        puntosPorSocio[data.socioEmail] = {
          email: data.socioEmail,
          puntos: 0
        };
      }

      puntosPorSocio[data.socioEmail].puntos += Number(data.puntos) || 0;
    });

    const clasificacionGeneral = Object.values(puntosPorSocio)
      .sort((a, b) => b.puntos - a.puntos)
      .map((socio, index) => ({
        ...socio,
        posicion: index + 1
      }));

    const posicionActual = clasificacionGeneral.find(
      (socio) => socio.email === usuario.email
    );

    const inscripcionesQuery = query(
      collection(db, "inscripciones"),
      where("email", "==", usuario.email)
    );

    const inscripcionesSnapshot = await getDocs(inscripcionesQuery);
    const totalActividadesInscritas = inscripcionesSnapshot.size;

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>📊 Mis estadísticas</h2>

        <p>
          <strong>📷 Fotografías enviadas:</strong>
          ${totalFotosEnviadas}
        </p>

        <p>
          <strong>🏅 Convocatorias participadas:</strong>
          ${convocatoriasParticipadas.size}
        </p>

        <p>
          <strong>🥇 Posición actual en la liga:</strong>
          ${
            posicionActual
              ? `${posicionActual.posicion}.ª posición`
              : "Sin clasificación todavía"
          }
        </p>

        <p>
          <strong>🏆 Mejor posición obtenida:</strong>
          ${
            mejorPosicion !== null
              ? `${mejorPosicion}.ª posición`
              : "Sin datos todavía"
          }
        </p>

        <p>
          <strong>📅 Actividades inscritas:</strong>
          ${totalActividadesInscritas}
        </p>
      </section>
    `;
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);

    contentArea.innerHTML = `
      <section class="dashboard-card">
        <h2>📊 Mis estadísticas</h2>
        <p>No se pudieron cargar las estadísticas.</p>
      </section>
    `;
  }
}


async function activarNotificacionesPush(usuario) {
  try {
    if (!("Notification" in window)) {
      console.log("Este navegador no soporta notificaciones.");
      return;
    }

    const permiso = await Notification.requestPermission();

    if (permiso !== "granted") {
      console.log("Permiso de notificaciones no concedido.");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: "BMM2Hr1ur8wwJx_La8K-u6wsynvh6CYV05ryvOWuUNs88FGji7siVgm9wfP_P1ZTTcU966ErAs6SF8Ffl-iD-7A"
    });

    if (!token) {
      console.log("No se pudo obtener token FCM.");
      return;
    }

    await setDoc(doc(db, "tokens_notificaciones", usuario.email), {
      email: usuario.email,
      nombre: usuario.nombre || "",
      roles: usuario.roles || [],
      token: token,
      activo: true,
      fechaAlta: serverTimestamp()
    }, { merge: true });

    console.log("Token de notificaciones guardado correctamente");

  } catch (error) {
    console.error("Error activando notificaciones push:", error);
  }
}
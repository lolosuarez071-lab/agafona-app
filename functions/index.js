const { setGlobalOptions } = require("firebase-functions/v2");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

function destinatarioCoincide(destinatariosPush, rolesUsuario = []) {
  if (!destinatariosPush) return false;

  if (typeof destinatariosPush === "string") {
    return (
      destinatariosPush === "todos" ||
      rolesUsuario.includes(destinatariosPush)
    );
  }

  if (Array.isArray(destinatariosPush)) {
    return destinatariosPush.some((destino) =>
      destino === "todos" || rolesUsuario.includes(destino)
    );
  }

  if (typeof destinatariosPush === "object") {
    return Object.keys(destinatariosPush).some((destino) =>
      destinatariosPush[destino] === true &&
      (destino === "todos" || rolesUsuario.includes(destino))
    );
  }

  return false;
}

exports.enviarPushNotificacion = onDocumentCreated(
  {
    document: "push_notificaciones/{pushId}",
    region: "europe-west1",
  },
  async (event) => {
    const snapshot = event.data;
    const pushId = event.params.pushId;

    if (!snapshot) return;

    const push = snapshot.data();

    if (!push || push.estado !== "pendiente") {
      logger.info("Push ignorada", { pushId });
      return;
    }

    try {
      const titulo = push.titulo || "AGAFONA";
      const mensaje = push.mensaje || "";
      const destinatarios = push.destinatarios || { socios: true };

      const tokensSnapshot = await admin
        .firestore()
        .collection("tokens_notificaciones")
        .where("activo", "==", true)
        .get();

      const tokens = [];

      tokensSnapshot.forEach((docSnap) => {
        const registro = docSnap.data();

        const token = registro.token;
        const roles = (registro.roles || []).map((rol) => {
          if (rol === "socio") return "socios";
          if (rol === "directiva") return "directiva";
          if (rol === "admin") return "admin";
          if (rol === "jurado") return "jurado";
          return rol;
        });

        if (
          token &&
          destinatarioCoincide(destinatarios, roles) &&
          !tokens.includes(token)
        ) {
          tokens.push(token);
        }
      });

      if (tokens.length === 0) {
        await snapshot.ref.update({
          estado: "error",
          mensajeError: "No se encontraron tokens de notificación",
          fechaError: admin.firestore.FieldValue.serverTimestamp(),
          totalTokens: 0,
          enviadas: 0,
          errores: 0,
        });

        return;
      }

      const message = {
        tokens,
        notification: {
          title: titulo,
          body: mensaje,
        },
        data: {
          tipo: String(push.tipo || "general"),
          referenciaId: String(push.referenciaId || ""),
          origen: String(push.origen || ""),
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      await snapshot.ref.update({
        estado: response.failureCount > 0 ? "enviada_con_errores" : "enviada",
        fechaEnvio: admin.firestore.FieldValue.serverTimestamp(),
        totalTokens: tokens.length,
        enviadas: response.successCount,
        errores: response.failureCount,
      });

      logger.info("Push enviada", {
        pushId,
        totalTokens: tokens.length,
        enviadas: response.successCount,
        errores: response.failureCount,
      });
    } catch (error) {
      logger.error("Error enviando push", error);

      await snapshot.ref.update({
        estado: "error",
        mensajeError: error.message,
        fechaError: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
);
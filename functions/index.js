const { setGlobalOptions } = require("firebase-functions/v2");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

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
      const destinatarios = push.destinatarios || "socios";

      const usuariosSnapshot = await admin
        .firestore()
        .collection("usuarios")
        .where("activo", "==", true)
        .get();

      const tokens = [];

      usuariosSnapshot.forEach((doc) => {
        const usuario = doc.data();
        const roles = usuario.roles || [];

        const coincide =
          destinatarios === "todos" ||
          destinatarios === "socios" ||
          roles.includes(destinatarios);

        if (coincide && Array.isArray(usuario.tokens_notificaciones)) {
          usuario.tokens_notificaciones.forEach((token) => {
            if (token && !tokens.includes(token)) {
              tokens.push(token);
            }
          });
        }
      });

      if (tokens.length === 0) {
        await snapshot.ref.update({
          estado: "error",
          mensajeError: "No se encontraron tokens de notificación",
          fechaError: admin.firestore.FieldValue.serverTimestamp(),
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
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

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
          tipo: push.tipo || "general",
          referenciaId: push.referenciaId || "",
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
// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

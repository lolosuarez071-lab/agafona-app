importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Notificación recibida en segundo plano:", payload);

  const titulo = payload.notification?.title || "AGAFONA";
  const opciones = {
    body: payload.notification?.body || "Tienes una nueva notificación",
    icon: "/assets/logo-agafona.png",
    badge: "/assets/logo-agafona.png"
  };

  self.registration.showNotification(titulo, opciones);
});
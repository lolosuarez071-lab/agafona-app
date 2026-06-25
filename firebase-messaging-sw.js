importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB_vBfGEGsv0If66XM7oAXUQjXUtv5B614",
  authDomain: "agafona-app.firebaseapp.com",
  projectId: "agafona-app",
  storageBucket: "agafona-app.firebasestorage.app",
  messagingSenderId: "952287808321",
  appId: "1:952287808321:web:6fc690fb51b6b5b80e2fc0",
  measurementId: "G-FE2E1T9834"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Notificación recibida en segundo plano:", payload);

  const titulo = payload.notification?.title || "AGAFONA";

  const opciones = {
    body: payload.notification?.body || "Tienes una nueva notificación",
    icon: "/agafona-app/assets/logo-agafona.png",
    badge: "/agafona-app/assets/logo-agafona.png"
  };

  self.registration.showNotification(titulo, opciones);
});
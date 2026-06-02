import { auth } from "./firebase-services.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  loginMessage.textContent = "Comprobando datos...";
  loginMessage.style.color = "#666";

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    loginMessage.textContent = "Inicio de sesión correcto";
    loginMessage.style.color = "green";

    console.log("Usuario conectado:", userCredential.user);
  } catch (error) {
    loginMessage.textContent = "Correo o contraseña incorrectos";
    loginMessage.style.color = "red";

    console.error("Error de login:", error);
  }
});
# 07 - Arquitectura Firebase

## 1. Objetivo del documento

Este documento describe la arquitectura técnica de la aplicación AGAFONA App basada en Firebase.

La finalidad es definir cómo se organizarán los servicios principales de Firebase dentro del proyecto, especialmente para la gestión de usuarios, roles, fotografías, votaciones, actividades y clasificaciones.

La aplicación estará pensada como una PWA para móvil, usando HTML, CSS y JavaScript en el frontend, y Firebase como backend principal.

---

## 2. Servicios principales de Firebase

La arquitectura de AGAFONA App se apoyará principalmente en tres servicios de Firebase:

- Firebase Authentication
- Cloud Firestore
- Firebase Storage

Cada servicio tendrá una función concreta dentro de la aplicación.

---

## 3. Firebase Authentication

Firebase Authentication se utilizará para gestionar el acceso de los usuarios a la aplicación.

Permitirá:

- Registrar usuarios.
- Iniciar sesión.
- Cerrar sesión.
- Recuperar contraseña.
- Identificar al usuario conectado.
- Asociar cada usuario con un rol dentro de la aplicación.

Los usuarios podrán tener diferentes roles:

- socio
- jurado
- admin

El inicio de sesión será necesario para acceder a las zonas privadas de la aplicación.

---

## 4. Cloud Firestore

Cloud Firestore será la base de datos principal de la aplicación.

En Firestore se guardará la información estructurada del proyecto, como usuarios, actividades, concursos, fotografías, votaciones y clasificaciones.

Colecciones principales previstas:

```text
usuarios
actividades
concursos
fotografias
votaciones
clasificaciones
notificaciones
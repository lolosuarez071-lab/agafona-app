# 13 - PWA y sistema de notificaciones

## 1. Objetivo

Este documento define las características de AGAFONA App como aplicación web progresiva (PWA) y el sistema de notificaciones previsto para mantener informados a socios, jurados, miembros de la directiva y administradores.

La finalidad es proporcionar una experiencia similar a una aplicación móvil nativa sin necesidad de publicar la aplicación en las tiendas de aplicaciones.

---

## 2. ¿Qué es una PWA?

AGAFONA App se desarrollará como una Progressive Web App (PWA).

Una PWA es una aplicación web que puede instalarse en dispositivos móviles y ordenadores ofreciendo una experiencia muy similar a una aplicación nativa.

Ventajas:

* No requiere App Store ni Google Play.
* Instalación sencilla.
* Actualización automática.
* Compatible con Android e iPhone.
* Menor coste de mantenimiento.
* Acceso desde navegador o como aplicación instalada.

---

## 3. Instalación de la aplicación

Los usuarios podrán instalar la aplicación directamente desde el navegador.

### Android

Proceso previsto:

```text
Abrir AGAFONA App
↓
Mostrar opción "Instalar aplicación"
↓
Aceptar instalación
↓
Icono en pantalla principal
```

### iPhone

Proceso previsto:

```text
Abrir AGAFONA App en Safari
↓
Compartir
↓
Añadir a pantalla de inicio
↓
Icono en pantalla principal
```

---

## 4. Funcionamiento como aplicación

Una vez instalada:

* Tendrá icono propio.
* Se abrirá en pantalla completa.
* Funcionará con apariencia de aplicación móvil.
* Mantendrá la sesión iniciada.
* Accederá directamente a las funciones principales.

---

## 5. Identidad visual

La PWA utilizará:

* Nombre oficial de AGAFONA.
* Logotipo de AGAFONA.
* Iconos adaptados a móvil.
* Colores corporativos de la asociación.

Elementos previstos:

```text
Icono 192x192
Icono 512x512
Splash screen
Tema visual corporativo
```

---

## 6. Navegación móvil

La aplicación estará optimizada para dispositivos móviles.

Características:

* Menús simplificados.
* Botones grandes.
* Navegación inferior.
* Diseño responsive.
* Accesibilidad mejorada.

---

## 7. Sistema de notificaciones

La aplicación dispondrá de un sistema de notificaciones para informar a los usuarios sobre eventos importantes.

Las notificaciones podrán mostrarse:

* Dentro de la aplicación.
* Como aviso emergente en el dispositivo.
* Como recordatorio de actividades o procesos de la liga.

---

## 8. Notificaciones de la liga

Ejemplos:

### Inicio del periodo de subida

```text
Ya puedes subir tu fotografía para la convocatoria actual.
```

### Fin próximo del plazo de subida

```text
Quedan pocos días para enviar tu fotografía.
```

### Inicio de votaciones

```text
La fase de votación ya está disponible.
```

### Publicación de resultados

```text
Ya puedes consultar la clasificación mensual.
```

---

## 9. Notificaciones de actividades

Ejemplos:

```text
Nueva actividad publicada.
```

```text
Se ha abierto el plazo de inscripción.
```

```text
Recordatorio de actividad programada para este fin de semana.
```

---

## 10. Notificaciones de documentos

Ejemplos:

```text
Se han publicado las nuevas bases de la Liga.
```

```text
Nueva acta de Asamblea disponible.
```

```text
Nueva documentación para la Junta Directiva.
```

Estas últimas solo se enviarán a usuarios con permisos adecuados.

---

## 11. Notificaciones para directiva

Los miembros de la directiva podrán recibir avisos específicos.

Ejemplos:

```text
Nueva acta pendiente de revisión.
```

```text
Documentación interna disponible.
```

```text
Recordatorio de reunión de Junta Directiva.
```

---

## 12. Configuración de notificaciones

Cada usuario podrá decidir qué tipos de notificaciones desea recibir.

Opciones previstas:

```text
Liga fotográfica
Actividades
Documentos
Clasificaciones
Avisos generales
```

---

## 13. Notificaciones push

La aplicación quedará preparada para utilizar Firebase Cloud Messaging.

Esto permitirá enviar mensajes directamente al dispositivo.

Ejemplo:

```text
AGAFONA

Ya está abierta la convocatoria de febrero.
```

---

## 14. Funcionamiento sin conexión

La PWA incorporará Service Worker para mejorar la experiencia de uso.

Permitirá:

* Cargar recursos previamente visitados.
* Mantener la aplicación operativa parcialmente.
* Reducir tiempos de carga.

Las funciones que requieran acceso a Firestore necesitarán conexión a Internet.

---

## 15. Actualizaciones de la aplicación

Las actualizaciones se desplegarán automáticamente.

El usuario no tendrá que instalar nuevas versiones manualmente.

Proceso:

```text
Nueva versión publicada
↓
El navegador detecta cambios
↓
Actualización automática
↓
Usuario utiliza la versión más reciente
```

---

## 16. Seguridad

Las notificaciones respetarán los permisos definidos en la aplicación.

Ejemplos:

```text
Socios:
  actividades
  clasificaciones
  avisos

Jurados:
  votaciones
  clasificaciones

Directiva:
  documentación interna
  avisos de Junta

Administradores:
  gestión completa
```

---

## 17. Beneficios para AGAFONA

La utilización de una PWA permitirá:

* Mejor comunicación con los socios.
* Menor dependencia del correo electrónico.
* Acceso rápido a información relevante.
* Centralización de avisos.
* Mayor participación en actividades y concursos.
* Reducción de costes de desarrollo.

---

## 18. Conclusión

La utilización de tecnología PWA permitirá que AGAFONA App funcione como una aplicación moderna, accesible y fácil de utilizar.

La incorporación de notificaciones facilitará la comunicación con socios, jurados, directiva y administradores, mejorando la participación y el acceso a la información de la asociación.

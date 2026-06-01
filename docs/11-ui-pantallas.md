# 11 - UI y pantallas de la aplicación

## 1. Objetivo

Este documento define las pantallas principales de AGAFONA App.

La finalidad es dejar claro qué verá cada tipo de usuario y qué funciones estarán disponibles en cada zona de la aplicación.

La aplicación estará pensada principalmente para uso móvil, por lo que las pantallas deberán ser sencillas, claras y rápidas de utilizar.

---

## 2. Criterios generales de diseño

La interfaz deberá seguir estas ideas:

* Diseño sencillo.
* Uso cómodo en móvil.
* Botones grandes y claros.
* Navegación inferior tipo app.
* Textos fáciles de entender.
* Acceso rápido a la liga fotográfica.
* Acceso rápido a actividades y avisos.
* Diferentes pantallas según el rol del usuario.

---

## 3. Pantallas públicas

Las pantallas públicas serán visibles sin iniciar sesión.

### 3.1 Pantalla de inicio

Contenido previsto:

* Nombre de la aplicación.
* Imagen o identidad visual de AGAFONA.
* Botón de acceso.
* Información breve de la asociación.
* Acceso a avisos públicos, si los hubiera.

### 3.2 Pantalla de login

Contenido previsto:

* Campo de correo electrónico.
* Campo de contraseña.
* Botón de iniciar sesión.
* Enlace para recuperar contraseña.

### 3.3 Recuperar contraseña

Contenido previsto:

* Campo de correo electrónico.
* Botón para enviar correo de recuperación.
* Mensaje de confirmación.

---

## 4. Pantallas del socio

El socio tendrá acceso a las funciones principales de participación en la asociación.

### 4.1 Inicio del socio

Contenido previsto:

* Saludo al socio.
* Próxima actividad.
* Estado de la liga fotográfica.
* Avisos recientes.
* Acceso rápido a clasificación.

### 4.2 Mi perfil

Contenido previsto:

* Nombre.
* Correo electrónico.
* Rol.
* Estado de socio.
* Participaciones en la liga.
* Botón de cerrar sesión.

### 4.3 Liga fotográfica

Contenido previsto:

* Jornada actual.
* Estado de la jornada:

  * subida
  * votación
  * cerrada
* Fechas importantes.
* Información de participación.
* Botón para subir fotografía cuando esté permitido.

### 4.4 Subir fotografía

Contenido previsto:

* Nombre de la jornada.
* Información de la categoría:

  * Naturaleza general
* Selector de imagen.
* Campo de título de la fotografía.
* Aviso de una sola fotografía por socio y jornada.
* Botón de enviar.

Reglas:

```text
Solo se podrá subir una fotografía por socio y jornada.
Solo se podrá subir durante el periodo del día 1 al 15.
```

### 4.5 Clasificación mensual

Contenido previsto:

* Jornada mensual.
* Lista de resultados.
* Posición.
* Nombre del socio.
* Puntos obtenidos.

### 4.6 Clasificación anual

Contenido previsto:

* Temporada actual.
* Ranking acumulado.
* Posición.
* Nombre del socio.
* Puntos totales.

### 4.7 Actividades

Contenido previsto:

* Lista de actividades publicadas.
* Fecha.
* Lugar.
* Descripción.
* Información adicional.

En fases futuras podrá incluir inscripción a actividades.

### 4.8 Avisos

Contenido previsto:

* Lista de avisos publicados.
* Fecha del aviso.
* Título.
* Mensaje.

---

## 5. Pantallas del jurado

El jurado tendrá acceso principalmente a las votaciones.

### 5.1 Inicio del jurado

Contenido previsto:

* Saludo al jurado.
* Estado de votaciones.
* Número de fotografías pendientes.
* Acceso rápido a votar.

### 5.2 Votaciones

Contenido previsto:

* Fotografía a valorar.
* Título de la fotografía, si se decide mostrar.
* Campos de puntuación:

  * Técnica
  * Creatividad
  * Dificultad
* Total calculado automáticamente.
* Botón de guardar voto.
* Botón de siguiente fotografía.

El jurado no verá el autor de la fotografía.

### 5.3 Historial de votaciones

Contenido previsto:

* Fotografías ya votadas.
* Fecha de votación.
* Puntuación emitida.

### 5.4 Perfil del jurado

Contenido previsto:

* Nombre.
* Correo electrónico.
* Rol.
* Botón de cerrar sesión.

---

## 6. Pantallas del administrador

El administrador tendrá acceso a la gestión completa de la aplicación.

### 6.1 Panel de administración

Contenido previsto:

* Resumen general.
* Usuarios registrados.
* Jornada activa.
* Fotografías subidas.
* Votaciones pendientes.
* Accesos rápidos de gestión.

### 6.2 Gestión de usuarios

Contenido previsto:

* Lista de usuarios.
* Nombre.
* Correo.
* Rol.
* Estado.
* Opciones para cambiar rol o desactivar usuario.

Roles disponibles:

```text
socio
jurado
admin
```

### 6.3 Gestión de liga

Contenido previsto:

* Temporada activa.
* Jornada actual.
* Estado de la jornada.
* Fechas de subida.
* Fechas de votación.
* Botón para cerrar jornada.
* Botón para publicar clasificación.

### 6.4 Gestión de fotografías

Contenido previsto:

* Lista de fotografías subidas.
* Autor.
* Jornada.
* Estado.
* Vista previa.
* Opciones de revisión.

Esta pantalla sí podrá mostrar el autor, ya que será solo para administración.

### 6.5 Gestión de votaciones

Contenido previsto:

* Fotografías pendientes de votación.
* Jurados asignados.
* Número de votos recibidos.
* Estado de cada fotografía.

### 6.6 Clasificaciones

Contenido previsto:

* Generar clasificación mensual.
* Revisar resultados.
* Publicar clasificación.
* Actualizar clasificación anual.

### 6.7 Gestión de actividades

Contenido previsto:

* Crear actividad.
* Editar actividad.
* Eliminar actividad.
* Publicar actividad.

Campos:

```text
título
descripción
fecha
lugar
imagen opcional
```

### 6.8 Gestión de avisos

Contenido previsto:

* Crear aviso.
* Editar aviso.
* Eliminar aviso.
* Publicar aviso.

Campos:

```text
título
mensaje
fecha
visible
```

### 6.9 Configuración de liga

Contenido previsto:

* Máximo por jurado.
* Número de jurados por fotografía.
* Criterios de puntuación.
* Estado de temporada.
* Opciones futuras de configuración.

Configuración inicial:

```text
Técnica: 5 puntos
Creatividad: 3 puntos
Dificultad: 2 puntos
Máximo por jurado: 10 puntos
Número de jurados: 3
Máximo total por fotografía: 30 puntos
```

---

## 7. Navegación inferior

La aplicación tendrá una navegación inferior pensada para móvil.

Para socio:

```text
Inicio | Liga | Subir | Clasificación | Perfil
```

Para jurado:

```text
Inicio | Votar | Historial | Clasificación | Perfil
```

Para administrador:

```text
Inicio | Liga | Usuarios | Actividades | Config
```

---

## 8. Pantallas futuras

En fases posteriores se podrán añadir nuevas pantallas:

* Documentos para socios.
* Inscripción a actividades.
* Galería histórica.
* Estadísticas personales.
* Histórico de clasificaciones.
* Configuración avanzada.
* Zona de socios con documentación interna.

---

## 9. Consideraciones de usabilidad

La app debe ser fácil de usar para socios con distintos niveles de experiencia digital.

Por ello se recomienda:

* Evitar menús complejos.
* Usar textos claros.
* Mostrar mensajes de confirmación.
* Mostrar errores comprensibles.
* Evitar formularios largos.
* Hacer visible siempre el estado de la liga.
* No sobrecargar la pantalla de inicio.

---

## 10. Conclusión

Las pantallas de AGAFONA App estarán organizadas según el rol del usuario.

El socio tendrá una experiencia sencilla centrada en actividades, avisos, liga y clasificaciones.

El jurado tendrá una zona específica para votar fotografías de forma anónima respecto al autor.

El administrador contará con un panel de gestión para controlar usuarios, liga, fotografías, votaciones, actividades y avisos.

Este documento servirá como referencia para diseñar y programar las primeras pantallas reales de la PWA.

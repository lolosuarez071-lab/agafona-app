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
* Acceso rápido a la Liga AGAFONA.
* Acceso rápido a actividades y avisos.
* Acceso rápido a documentos.
* Diferentes pantallas según los roles del usuario.
* Diseño alineado con la identidad visual de AGAFONA.

---

## 3. Pantallas públicas

Las pantallas públicas serán visibles sin iniciar sesión.

### 3.1 Pantalla de inicio

Contenido previsto:

* Logo AGAFONA.
* Imagen corporativa.
* Botón de acceso.
* Información breve de la asociación.
* Avisos públicos.
* Próximas actividades destacadas.

### 3.2 Pantalla de login

Contenido previsto:

* Campo de correo electrónico.
* Campo de contraseña.
* Botón de iniciar sesión.
* Recuperar contraseña.

### 3.3 Recuperar contraseña

Contenido previsto:

* Campo de correo electrónico.
* Botón para enviar recuperación.
* Confirmación de envío.

---

## 4. Pantallas del socio

### 4.1 Inicio del socio

Contenido previsto:

* Saludo personalizado.
* Estado de la liga.
* Convocatoria activa.
* Próxima actividad.
* Avisos recientes.
* Fotografía destacada.
* Accesos rápidos.

### 4.2 Mi perfil

Contenido previsto:

* Nombre.
* Correo electrónico.
* Roles.
* Estado de socio.
* Historial de participación.
* Cerrar sesión.

### 4.3 Liga fotográfica

Contenido previsto:

* Liga activa.
* Convocatoria actual.
* Estado de la convocatoria.
* Fechas importantes.
* Situación de participación.
* Acceso a clasificación.

Estados:

```text
subida
votacion
cerrada
```

### 4.4 Subir fotografía

Contenido previsto:

* Nombre de la convocatoria.
* Categoría:

```text
Naturaleza general
```

* Selector de imagen.
* Título de la fotografía.
* Información de requisitos técnicos.
* Botón de enviar.
* Botón de sustituir fotografía.

Reglas:

```text
1 fotografía activa por convocatoria.
Posibilidad de sustituir la fotografía hasta el cierre del plazo.
```

Requisitos técnicos:

```text
Formato JPG
1920 px lado mayor
72 ppp
Entre 0,5 MB y 1,5 MB
```

### 4.5 Clasificación de convocatoria

Contenido previsto:

* Convocatoria actual.
* Posición.
* Nombre del socio.
* Puntos obtenidos.

### 4.6 Clasificación general

Contenido previsto:

* Liga activa.
* Ranking acumulado.
* Posición.
* Nombre del socio.
* Puntos acumulados.

### 4.7 Actividades

Contenido previsto:

* Actividades publicadas.
* Fecha.
* Lugar.
* Descripción.
* Información adicional.

### 4.8 Avisos

Contenido previsto:

* Avisos publicados.
* Fecha.
* Título.
* Mensaje.

### 4.9 Documentos

Contenido previsto:

* Bases de la Liga.
* Estatutos.
* Actas de Asamblea.
* Memorias.
* Otros documentos autorizados para socios.

---

## 5. Pantallas del jurado

### 5.1 Inicio del jurado

Contenido previsto:

* Saludo.
* Estado de votaciones.
* Fotografías pendientes.
* Acceso rápido a votar.

### 5.2 Votaciones

Contenido previsto:

* Fotografía.
* Título (si se muestra).
* Técnica.
* Creatividad.
* Dificultad.
* Total calculado automáticamente.
* Guardar voto.
* Siguiente fotografía.

El autor permanecerá oculto.

### 5.3 Historial de votaciones

Contenido previsto:

* Fotografías votadas.
* Fecha.
* Puntuación emitida.

### 5.4 Perfil

Contenido previsto:

* Nombre.
* Correo.
* Roles.
* Cerrar sesión.

---

## 6. Pantallas de la directiva

### 6.1 Inicio directiva

Contenido previsto:

* Resumen de actividad.
* Acceso rápido a documentación interna.
* Avisos relevantes.

### 6.2 Documentación interna

Contenido previsto:

* Actas de Junta Directiva.
* Informes internos.
* Presupuestos.
* Planificación.
* Documentación restringida.

### 6.3 Perfil

Contenido previsto:

* Datos personales.
* Roles.
* Cerrar sesión.

---

## 7. Pantallas del administrador

### 7.1 Panel de administración

Contenido previsto:

* Resumen general.
* Usuarios.
* Convocatoria activa.
* Fotografías enviadas.
* Estado de votaciones.
* Accesos rápidos.

### 7.2 Gestión de usuarios

Contenido previsto:

* Nombre.
* Correo.
* Roles.
* Estado.

Roles posibles:

```text
socio
jurado
directiva
admin
```

### 7.3 Gestión de la liga

Contenido previsto:

* Liga activa.
* Convocatoria actual.
* Estado.
* Fechas de subida.
* Fechas de votación.
* Publicar clasificaciones.

### 7.4 Gestión de fotografías

Contenido previsto:

* Fotografías enviadas.
* Autor.
* Convocatoria.
* Estado.
* Vista previa.
* Validación técnica.

### 7.5 Gestión de votaciones

Contenido previsto:

* Jurados.
* Fotografías.
* Votos emitidos.
* Estado de votación.

### 7.6 Gestión de clasificaciones

Contenido previsto:

* Clasificación de convocatoria.
* Clasificación general.
* Recalcular resultados.
* Publicar resultados.

### 7.7 Gestión documental

Contenido previsto:

* Crear documento.
* Editar documento.
* Eliminar documento.
* Asignar permisos.

### 7.8 Gestión de actividades

Contenido previsto:

* Crear.
* Editar.
* Eliminar.
* Publicar.

### 7.9 Gestión de avisos

Contenido previsto:

* Crear.
* Editar.
* Eliminar.
* Publicar.

### 7.10 Configuración de liga

Contenido previsto:

* Número de jurados.
* Puntuación máxima.
* Criterios de puntuación.
* Fechas de liga.
* Requisitos técnicos de fotografías.

---

## 8. Navegación inferior

### Socio

```text
Inicio | Liga | Clasificación | Documentos | Perfil
```

### Jurado

```text
Inicio | Votar | Historial | Clasificación | Perfil
```

### Directiva

```text
Inicio | Documentos | Avisos | Actividades | Perfil
```

### Administrador

```text
Inicio | Liga | Usuarios | Documentos | Config
```

---

## 9. Pantallas futuras

Posibles ampliaciones:

* Inscripción a actividades.
* Histórico de ligas.
* Estadísticas personales.
* Galería histórica.
* Buscador documental.
* Notificaciones push.
* Zona de concursos independientes.

---

## 10. Consideraciones de usabilidad

La aplicación deberá ser sencilla para usuarios con distintos niveles de experiencia tecnológica.

Se recomienda:

* Evitar menús complejos.
* Mostrar mensajes claros.
* Confirmar acciones importantes.
* Mostrar errores comprensibles.
* Minimizar pasos innecesarios.
* Facilitar el acceso a la Liga AGAFONA.

---

## 11. Conclusión

Las pantallas de AGAFONA App estarán organizadas según los roles del usuario.

La aplicación proporcionará acceso sencillo a la liga fotográfica, documentación, actividades y avisos, manteniendo una experiencia clara y coherente con la identidad visual de AGAFONA.

La estructura propuesta servirá como base para el diseño definitivo y la programación de la interfaz de usuario.

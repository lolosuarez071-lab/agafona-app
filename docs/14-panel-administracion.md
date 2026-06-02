# 14 - Panel de administración

## 1. Objetivo

Este documento define las funcionalidades del panel de administración de AGAFONA App.

Su finalidad es proporcionar una herramienta centralizada para gestionar usuarios, actividades, documentación, liga fotográfica, clasificaciones y configuración general de la aplicación.

El panel estará disponible únicamente para usuarios con permisos de administración.

---

## 2. Filosofía de diseño

El panel deberá ser:

* Sencillo.
* Intuitivo.
* Adaptado a ordenador y tablet.
* Accesible desde móvil para tareas rápidas.
* Fácil de utilizar por personas sin conocimientos técnicos.

El objetivo es facilitar la gestión diaria de la asociación.

---

## 3. Dashboard principal

Al acceder al panel se mostrará un resumen general.

Información prevista:

```text
Usuarios registrados
Socios activos
Convocatoria activa
Fotografías recibidas
Votaciones pendientes
Próximas actividades
Últimos avisos publicados
```

También incluirá accesos rápidos a las funciones más utilizadas.

---

## 4. Gestión de usuarios

El administrador podrá:

* Crear usuarios.
* Editar usuarios.
* Desactivar usuarios.
* Reactivar usuarios.
* Asignar roles.
* Consultar historial básico.

Roles disponibles:

```text
socio
jurado
directiva
admin
```

Un usuario podrá disponer de varios roles simultáneamente.

---

## 5. Gestión de la liga fotográfica

Será una de las áreas principales del panel.

Permitirá:

* Crear liga.
* Configurar convocatorias.
* Abrir y cerrar convocatorias.
* Consultar participación.
* Revisar fotografías.
* Supervisar votaciones.
* Publicar clasificaciones.

---

## 6. Configuración de temporada

La administración podrá definir:

```text
Nombre de temporada
Fecha de inicio
Fecha de fin
Número de convocatorias
```

Configuración inicial:

```text
Temporada:
Noviembre - Junio

Convocatorias:
8
```

---

## 7. Gestión de fotografías

La administración podrá:

* Consultar fotografías enviadas.
* Ver autor.
* Revisar datos asociados.
* Validar fotografías.
* Detectar incidencias.

Información visible:

```text
Autor
Fecha de envío
Convocatoria
Título
Estado
```

---

## 8. Gestión de jurados

Permitirá:

* Asignar jurados.
* Revisar votaciones.
* Ver estado de participación.
* Detectar votaciones pendientes.

Información prevista:

```text
Jurado
Fotografías asignadas
Fotografías votadas
Fotografías pendientes
```

---

## 9. Gestión de clasificaciones

La administración podrá:

* Generar clasificación de convocatoria.
* Publicar clasificación de convocatoria.
* Actualizar clasificación general.
* Consultar históricos.

Información:

```text
Posición
Socio
Puntos
Evolución
```

---

## 10. Gestión de actividades

Permitirá:

* Crear actividades.
* Editar actividades.
* Publicar actividades.
* Cancelar actividades.

Campos previstos:

```text
Título
Descripción
Fecha
Lugar
Imagen
Información adicional
```

---

## 11. Gestión documental

La administración podrá gestionar toda la documentación de la asociación.

Tipos previstos:

```text
Bases de la Liga
Actas de Asamblea
Estatutos
Normativas
Memorias
Actas de Junta Directiva
Documentación interna
```

Funciones:

* Subir documentos.
* Modificar documentos.
* Eliminar documentos.
* Cambiar visibilidad.

---

## 12. Niveles de visibilidad documental

Cada documento podrá tener uno de los siguientes niveles:

```text
Público
Socios
Directiva
Administración
```

La aplicación aplicará automáticamente las restricciones correspondientes.

---

## 13. Gestión de avisos y noticias

La administración podrá:

* Crear avisos.
* Programar publicaciones.
* Editar contenido.
* Eliminar publicaciones.

Ejemplos:

```text
Apertura de convocatoria
Resultados publicados
Nueva actividad
Avisos generales
Publicación de documentos
```

---

## 14. Sistema de notificaciones

La administración podrá enviar notificaciones a grupos concretos.

Destinatarios posibles:

```text
Todos los socios
Jurados
Directiva
Administradores
Usuarios seleccionados
```

---

## 15. Configuración de la liga

La aplicación permitirá configurar:

```text
Número de jurados
Puntuación máxima
Criterios de valoración
Número de convocatorias
Periodo de subida
Requisitos técnicos de fotografías
```

Configuración inicial:

```text
Técnica: 5
Creatividad: 3
Dificultad: 2

Máximo jurado: 10
Máximo fotografía: 30
Jurados: 3

Formato JPG
1920 px lado mayor
72 ppp
0,5 MB - 1,5 MB
```

---

## 16. Auditoría básica

El sistema podrá registrar acciones importantes.

Ejemplos:

```text
Usuario creado
Rol modificado
Documento publicado
Clasificación generada
Actividad creada
```

Esto permitirá conocer cambios relevantes realizados en la plataforma.

---

## 17. Estadísticas

En fases futuras se podrán incorporar:

* Participación por convocatoria.
* Evolución de socios.
* Participación en actividades.
* Histórico de clasificaciones.
* Estadísticas de la liga.

---

## 18. Beneficios para la asociación

El panel de administración permitirá:

* Centralizar la gestión.
* Reducir tareas manuales.
* Mejorar la comunicación.
* Mantener documentación organizada.
* Facilitar el trabajo de la directiva.
* Mejorar el seguimiento de la liga.

---

## 19. Consideraciones futuras

Posibles ampliaciones:

* Gestión de inscripciones.
* Control de pagos.
* Exportación de informes.
* Firma electrónica.
* Integración con la web de AGAFONA.
* Generación automática de certificados.

---

## 20. Conclusión

El panel de administración será el centro de gestión de AGAFONA App.

Permitirá controlar usuarios, liga, actividades, documentación y comunicaciones desde una única plataforma, facilitando el trabajo diario de la asociación y reduciendo la dependencia de herramientas externas.

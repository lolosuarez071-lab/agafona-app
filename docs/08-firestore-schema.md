# 08 - Esquema de Firestore

## 1. Objetivo

Este documento define la estructura inicial de la base de datos Cloud Firestore utilizada por AGAFONA App.

El diseño busca:

* Facilitar el desarrollo de la aplicación.
* Permitir futuras ampliaciones.
* Mantener la compatibilidad con la Liga AGAFONA.
* Separar claramente usuarios, fotografías, votaciones y clasificaciones.

---

## 2. Colección usuarios

Cada usuario registrado tendrá un documento propio.

Ruta:

```text
usuarios/{uid}
```

Ejemplo:

```js
{
  nombre: "Juan Pérez",
  email: "juan@email.com",
  roles: "socio",
  activo: true,
  fechaAlta: "2026-01-15",
  avatar: "url_avatar"
}
```

Roles permitidos:

```text
socio
jurado
directiva
admin
```

---

## 3. Colección configuracionLiga

Permite modificar la configuración sin cambiar código.

Ruta:

```text
configuracionLiga/{liga}
```

Ejemplo:


```js

{
  liga: 2026,

   ligaMesInicio: 11,
  ligaMesFin: 6,
  numeroConvocatorias: 8,
  
  maximoPorJurado: 10,
  numeroJuradosPorFoto: 3,
  maximoTotalFoto: 30,

  unaFotoPorSocio: true,

validacionFotografias: {
  formatosPermitidos: ["jpg"],
  ladoMayor: 1920,
  resolucion: 72,
  pesoMinimoMB: 0.5,
  pesoMaximoMB: 1.5
}

  criterios: [
    {
      nombre: "tecnica",
      etiqueta: "Técnica",
      maximo: 5
    },
    {
      nombre: "creatividad",
      etiqueta: "Creatividad",
      maximo: 3
    },
    {
      nombre: "dificultad",
      etiqueta: "Dificultad",
      maximo: 2
    }
  ]
}
```

---

## 4. Colección concursos

Define concursos y ligas.

Ruta:

```text
concursos/{concursoId}
```

Ejemplo:

```js
{
  nombre: "Liga AGAFONA 2026",
  tipo: "liga",
  activa: true,
  liga: 2026,
  fechaInicio: "2026-01-01",
  fechaFin: "2026-12-31"
}
```

---

## 5. Colección 

Representa cada mes de competición.

Ruta:

```text
convocatorias/{convocatoriaid}
```

Ejemplo:

```js
{
  liga: 2026,
  mes: 5,
  nombre: "Mayo 2026",

  fechaInicioSubida: "2026-05-01",
  fechaFinSubida: "2026-05-15",

  fechaInicioVotacion: "2026-05-16",
  fechaFinVotacion: "2026-05-31",

  estado: "votacion"
}
```

Estados:

```text
subida
votacion
cerrada
```

---

## 6. Colección fotografias

Ruta:

```text
fotografias/{fotoId}
```

Ejemplo:

```js
{
  convocatoriaId: "2026_05",
  autorId: "uid_usuario",
  titulo: "Abejaruco al amanecer",

  urlImagen: "url_storage",

  fechaSubida: "2026-05-10",

  estado: "aceptada",

  totalPuntos: 27
}
```

El campo autorId nunca será visible para los jurados.

---

## 7. Colección votaciones

Una votación corresponde a un jurado evaluando una fotografía.

Ruta:

```text
votaciones/{votacionId}
```

Ejemplo:

```js
{
  fotoId: "foto123",

  juradoId: "jurado456",

  puntuaciones: {
    tecnica: 4,
    creatividad: 3,
    dificultad: 2
  },

  total: 9,

  comentario: "",

  fechaVoto: "2026-05-20"
}
```

Validaciones:

```text
Técnica <= 5
Creatividad <= 3
Dificultad <= 2

Total <= 10
```

---

## 8. Colección clasificacionConvocatoria

Ruta:

```text
clasificacionConvocatoria/{convocatoriaId}
```

Ejemplo:

```js
{
  convocatoriaId: "2026_05",

  resultados: [
    {
      socioId: "uid1",
      puntos: 28,
      posicion: 1
    },
    {
      socioId: "uid2",
      puntos: 25,
      posicion: 2
    }
  ]
}
```

---

## 9. Colección clasificacionAnual

Ruta:

```text
clasificacionAnual/{liga}
```

Ejemplo:

```js
{
  liga: 2026,

  resultados: [
    {
      socioId: "uid1",
      puntos: 154,
      posicion: 1
    },
    {
      socioId: "uid2",
      puntos: 146,
      posicion: 2
    }
  ]
}
```

---

## 10. Colección actividades

Ruta:

```text
actividades/{actividadId}
```

Ejemplo:

```js
{
  titulo: "Salida fotográfica Doñana",

  descripcion: "...",

  fecha: "2026-06-15",

  localizacion: "Doñana",

  plazas: 25,

  inscripcionAbierta: true
}
```

---

## 11. Colección notificaciones

Ruta:

```text
notificaciones/{id}
```

Ejemplo:

```js
{
  titulo: "Nueva actividad",

  mensaje: "Ya está abierta la inscripción.",

  fecha: "2026-06-01",

  visible: true
}
```

---

## 12. Resumen de colecciones

```text
usuarios
configuracionLiga
concursos
convocatorias
fotografias
votaciones
clasificacionConvocatoria
clasificacionAnual
actividades
notificaciones
```

---

## 13. Consideraciones futuras

La estructura deberá permitir:

* Nuevos criterios de puntuación.
* Cambios en el número de jurados.
* Varias ligas simultáneas.
* Nuevos concursos independientes.
* Nuevos roles de usuario.
* Estadísticas avanzadas.
* Integración futura con la web de AGAFONA.

```
```

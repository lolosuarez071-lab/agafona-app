# 18 - Modelo final de datos

## 1. Objetivo

Este documento define el modelo definitivo de datos para AGAFONA App.

Recoge todas las decisiones funcionales adoptadas durante la fase de análisis y servirá como referencia principal para la implementación de Firebase.

---

## 2. Principios del modelo

La aplicación se basa en las siguientes reglas:

- Una única Liga AGAFONA por temporada.
- Una única categoría: Naturaleza General.
- 1 fotografía activa por socio y convocatoria.
El socio podrá sustituir la fotografía enviada mientras el plazo de subida esté abierto.
Finalizado el plazo, la fotografía quedará bloqueada para votación.
- Tres jurados por fotografía.
- Máximo 10 puntos por jurado.
- Máximo 30 puntos por fotografía.
- Jurado anónimo respecto al autor.
- Clasificación por convocatoria.
- Clasificación general de la liga.

---

## 3. Estructura principal

```text
usuarios
ligas
convocatorias
fotografias
votaciones
clasificacionConvocatoria
clasificacionGeneral
actividades
avisos
documentos
configuracionLiga
auditoria
```

---

## Requisitos técnicos de las fotografías

Requisitos técnicos de las fotografías

- Formato JPG.
- Lado mayor de 1920 píxeles.
- Resolución de 72 ppp.
- Tamaño mínimo de 0,5 MB.
- Tamaño máximo de 1,5 MB.

La aplicación comprobará automáticamente estos requisitos antes de aceptar una fotografía.

---

## 4. Colección usuarios

```text
usuarios/{uid}
```

Ejemplo:

```js
{
  nombre: "",
  email: "",
  roles: [
    "socio"
  ],
  activo: true,
  fechaAlta: ""
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

## 5. Colección ligas

Representa una edición completa de la Liga AGAFONA.

```text
ligas/{ligaId}
```

Ejemplo:

```js
{
  nombre: "Liga AGAFONA 2026-2027",
  fechaInicio: "2026-11-01",
  fechaFin: "2027-06-30",
  numeroConvocatorias: 8,
  activa: true
}
```

---

## 6. Colección convocatorias

Cada convocatoria corresponde a un mes de competición.

```text
convocatorias/{convocatoriaId}
```

Ejemplo:

```js
{
  ligaId: "liga_2026_2027",
  nombre: "Abril 2027",

  fechaInicioSubida: "",
  fechaFinSubida: "",

  fechaInicioVotacion: "",
  fechaFinVotacion: "",

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

## 7. Colección fotografías

```text
fotografias/{fotoId}
```

Ejemplo:

```js
{
  convocatoriaId: "",
  autorId: "",
  titulo: "",
  urlImagen: "",
  fechaSubida: "",
  fechaUltimaModificacion: "",
  totalPuntos: 0,
  estado: "activa"
}

validacion: {
  formatosPermitidos: ["jpg"],
  ladoMayor: 1920,
  resolucion: 72,
  pesoMinimoMB: 0.5,
  pesoMaximoMB: 1.5
}
```

Regla:

```text
1 fotografía por socio y convocatoria
```

---

## 8. Colección votaciones

```text
votaciones/{votacionId}
```

Ejemplo:

```js
{
  fotoId: "",
  juradoId: "",

  tecnica: 5,
  creatividad: 3,
  dificultad: 2,

  total: 10,

  comentario: ""
}
```

Límites:

```text
Técnica      máximo 5
Creatividad  máximo 3
Dificultad   máximo 2

Total        máximo 10
```

---

## 9. Colección clasificacionConvocatoria

```text
clasificacionConvocatoria/{convocatoriaId}
```

Ejemplo:

```js
{
  posicion: 1,
  socioId: "",
  puntos: 28
}
```

---

## 10. Colección clasificacionGeneral

```text
clasificacionGeneral/{ligaId}
```

Ejemplo:

```js
{
  posicion: 1,
  socioId: "",
  puntosAcumulados: 182
}
```

---

## 11. Colección actividades

```text
actividades/{actividadId}
```

Información:

- título
- descripción
- fecha
- lugar
- imagen

---

## 12. Colección avisos

```text
avisos/{avisoId}
```

Información:

- título
- mensaje
- fecha
- visible

---

## 13. Colección documentos

```text
documentos/{documentoId}
```

Ejemplo:

```js
{
  titulo: "",
  categoria: "",
  visibilidad: "socios",
  urlDocumento: ""
}
```

Visibilidades:

```text
publico
socios
directiva
admin
```

---

## 14. Colección configuracionLiga

```text
configuracionLiga/{ligaId}
```

Ejemplo:

```js
{
  maximoPorJurado: 10,
  numeroJurados: 3,
  maximoPorFotografia: 30
}
```

---

## 15. Colección auditoria

Permitirá registrar acciones importantes.

Ejemplos:

```text
Usuario creado
Rol modificado
Documento publicado
Clasificación generada
```

---

## 16. Firebase Storage

Contendrá:

```text
Fotografías
Documentos
Avatares
Material de actividades
```

---

## 17. Relaciones principales

```text
Liga
 └─ Convocatorias

Convocatoria
 └─ Fotografías

Fotografía
 └─ Votaciones

Votaciones
 └─ Clasificación Convocatoria

Clasificaciones Convocatoria
 └─ Clasificación General
```

---

## 18. Conclusión

Este modelo representa la estructura definitiva de datos de AGAFONA App y servirá como referencia para la implementación de Firebase, Firestore y Storage.
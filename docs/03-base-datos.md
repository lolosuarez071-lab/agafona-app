# 03 - Modelo de Datos

## Objetivo

Definir la estructura principal de datos de AGAFONA App.

La aplicación utilizará Firebase Firestore como base de datos principal y Firebase Storage para el almacenamiento temporal de fotografías y documentos.

---

## Resumen de colecciones

| Colección | Descripción |
|---|---|
| usuarios | Guarda los datos básicos de usuarios registrados y sus roles. |
| actividades | Guarda las actividades organizadas por AGAFONA. |
| inscripciones | Relaciona usuarios con actividades a las que se apuntan. |
| avisos | Guarda comunicaciones y avisos importantes. |
| documentos | Guarda información sobre documentos disponibles para los usuarios. |
| convocatoriasLiga | Guarda las convocatorias mensuales de la liga fotográfica. |
| fotosLiga | Guarda los datos de las fotografías subidas temporalmente. |
| puntuaciones | Guarda las puntuaciones realizadas por el jurado. |
| clasificaciones | Guarda resultados mensuales y clasificación general. |
| localizaciones | Guarda localizaciones fotográficas propuestas por socios. |

---

## usuarios

Guarda la información básica de cada usuario registrado.

| Campo | Tipo | Descripción |
|---|---|---|
| uid | string | Identificador único del usuario. Coincide con Firebase Authentication. |
| nombre | string | Nombre visible del usuario. |
| email | string | Correo electrónico usado para acceder. |
| roles | array | Roles asignados: socio, jurado o admin. |
| numeroSocio | string | Número de socio, si pertenece a AGAFONA. |
| estadoCuota | string | activa, pendiente o exento. |
| fechaAlta | date | Fecha de alta del usuario o socio. |
| activo | boolean | Indica si puede acceder a la aplicación. |
| fechaUltimoPago | date | Fecha del último pago registrado. |
| fechaVencimientoCuota | date | Fecha hasta la que la cuota está vigente. |

### Notas

- Un usuario puede tener más de un rol.
- Un jurado puede no ser socio.
- Cada socio solo podrá ver sus propios datos personales.
- El administrador asignará los roles manualmente.
- El socio podrá consultar su estado de cuota, último pago y fecha de vencimiento.

---

## actividades

Guarda las actividades organizadas por AGAFONA.

| Campo | Tipo | Descripción |
|---|---|---|
| id | string | Identificador único de la actividad. |
| titulo | string | Nombre de la actividad. |
| descripcion | string | Descripción detallada. |
| fecha | date | Fecha de realización. |
| hora | string | Hora de inicio. |
| lugar | string | Lugar o punto de encuentro. |
| plazas | number | Número máximo de participantes. |
| requiereInscripcion | boolean | Indica si la actividad requiere inscripción previa. |
| estado | string | abierta, cerrada o finalizada. |
| fechaCreacion | date | Fecha de creación. |
| creadaPor | string | UID del administrador creador. |

### Notas

- No todas las actividades tendrán que requerir inscripción.
- Las actividades con plazas limitadas podrán usar lista de espera.

---

## inscripciones

Relaciona usuarios con actividades.

| Campo | Tipo | Descripción |
|---|---|---|
| id | string | Identificador único. |
| actividadId | string | Actividad asociada. |
| usuarioId | string | Usuario inscrito. |
| fechaInscripcion | date | Fecha de inscripción. |
| estado | string | inscrito, lista_espera o cancelado. |
| posicionListaEspera | number | Posición en lista de espera, si corresponde. |

### Relación

Un usuario puede inscribirse en varias actividades.

Una actividad puede tener varios usuarios inscritos.

### Lista de espera

La aplicación permitirá gestionar listas de espera para actividades con plazas limitadas.

Cuando una actividad alcance el número máximo de plazas disponibles, las nuevas solicitudes podrán registrarse con estado:

- lista_espera

En caso de cancelación de una inscripción confirmada, la aplicación podrá promocionar al primer usuario de la lista de espera.

---

## avisos

Guarda comunicaciones importantes para los usuarios.

| Campo | Tipo | Descripción |
|---|---|---|
| id | string | Identificador único. |
| titulo | string | Título del aviso. |
| contenido | string | Texto del aviso. |
| fechaPublicacion | date | Fecha de publicación. |
| publicadoPor | string | UID del administrador. |
| visible | boolean | Indica si el aviso está activo. |
| prioridad | string | normal, importante o urgente. |

---

## documentos

Guarda información sobre documentos disponibles.

| Campo | Tipo | Descripción |
|---|---|---|
| id | string | Identificador único. |
| titulo | string | Título del documento. |
| descripcion | string | Breve descripción. |
| urlArchivo | string | Enlace al archivo en Firebase Storage o almacenamiento externo. |
| categoria | string | estatutos, normativa, seguro, acta, formulario u otros. |
| fechaSubida | date | Fecha de subida. |
| subidoPor | string | UID del administrador. |
| visible | boolean | Indica si el documento está disponible. |

---

## convocatoriasLiga

Guarda las convocatorias mensuales de la liga fotográfica.

| Campo | Tipo | Descripción |
|---|---|---|
| id | string | Identificador único. |
| titulo | string | Nombre de la convocatoria. |
| mes | number | Mes de la convocatoria. |
| anio | number | Año de la convocatoria. |
| fechaInicioSubida | date | Inicio del periodo de subida. |
| fechaFinSubida | date | Fin del periodo de subida. |
| fechaInicioVotacion | date | Inicio del periodo de votación. |
| fechaFinVotacion | date | Fin del periodo de votación. |
| estado | string | pendiente, subida, votacion, cerrada. |
| maxFotos | number | Número máximo de fotos permitidas en la convocatoria. |

### Apertura y cierre automático

El periodo de subida de fotografías se abrirá automáticamente el día 1 de cada mes a las 00:01 h y se cerrará el día 15 a las 23:59 h.

Fuera de ese periodo, el sistema no permitirá subir fotografías a la convocatoria mensual.

El periodo de votación comenzará el día 16 de cada mes y finalizará el último día del mes.

### Notas

- Cada socio podrá presentar una única fotografía por convocatoria mensual.
- La participación estimada será de entre 38 y 45 fotografías mensuales.

---

## fotosLiga

Guarda la información de las fotografías subidas para la liga interna.

| Campo | Tipo | Descripción |
|---|---|---|
| id | string | Identificador único. |
| titulo | string | Título de la fotografía. |
| usuarioId | string | UID del socio que sube la foto. |
| convocatoriaId | string | Convocatoria a la que pertenece. |
| urlImagen | string | Enlace temporal a la imagen. |
| nombreArchivo | string | Nombre interno del archivo. |
| pesoKB | number | Peso aproximado de la imagen. |
| ancho | number | Ancho en píxeles. |
| alto | number | Alto en píxeles. |
| fechaSubida | date | Fecha de subida. |
| estado | string | pendiente, aceptada, rechazada o archivada. |

### Notas

- El jurado no verá el autor de la fotografía.
- El jurado solo verá imagen, título y formulario de puntuación.
- Las imágenes se almacenarán temporalmente en Firebase Storage.
- Tras cerrar la convocatoria, podrán archivarse externamente y eliminarse de la app.

---

## puntuaciones

Guarda las puntuaciones realizadas por el jurado.

| Campo | Tipo | Descripción |
|---|---|---|
| id | string | Identificador único. |
| fotoId | string | Fotografía puntuada. |
| convocatoriaId | string | Convocatoria asociada. |
| juradoId | string | UID del jurado. |
| tecnica | number | Puntuación técnica. |
| creatividad | number | Puntuación creatividad. |
| dificultad | number | Puntuación dificultad. |
| total | number | Suma total de la puntuación. |
| fechaVoto | date | Fecha de votación. |

### Notas

- Cada jurado solo podrá tener una puntuación por fotografía.
- Si modifica la valoración, la puntuación existente será actualizada.
- Al cierre de la convocatoria todas las puntuaciones quedarán bloqueadas.
- La puntuación total se calculará sumando técnica, creatividad y dificultad.

---

## clasificaciones

Guarda los resultados mensuales y generales.

| Campo | Tipo | Descripción |
|---|---|---|
| id | string | Identificador único. |
| usuarioId | string | Usuario participante. |
| convocatoriaId | string | Convocatoria asociada. |
| puntosMensuales | number | Puntos obtenidos en una convocatoria. |
| puntosTotales | number | Puntuación acumulada. |
| posicionMensual | number | Puesto en la convocatoria. |
| posicionGeneral | number | Puesto en la clasificación general. |
| fechaActualizacion | date | Fecha de actualización.

### Cálculo automático

Al finalizar el periodo de votación de cada convocatoria mensual, la aplicación calculará automáticamente los resultados mensuales y actualizará la clasificación general.

---

## localizaciones

Guarda localizaciones fotográficas aportadas por socios.

| Campo | Tipo | Descripción |
|---|---|---|
| id | string | Identificador único. |
| titulo | string | Nombre de la localización. |
| descripcion | string | Descripción del lugar. |
| tipoFotografia | string | aves, paisaje, macro, nocturna u otros. |
| latitud | number | Coordenada GPS. |
| longitud | number | Coordenada GPS. |
| usuarioId | string | Usuario que propone la localización. |
| fechaCreacion | date | Fecha de creación. |
| estado | string | pendiente, aprobada o rechazada. |

### Notas

- Las localizaciones propuestas por socios deberán ser revisadas por un administrador antes de publicarse.

### Estado del módulo

El módulo de localizaciones fotográficas se considera una funcionalidad opcional para fases posteriores.

Si se implementa, las localizaciones aprobadas serán visibles para todos los socios activos. Este módulo deberá diseñarse con cuidado para que sea práctico y evitar publicar información sensible sobre especies o espacios delicados.  
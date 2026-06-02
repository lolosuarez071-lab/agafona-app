# 10 - Flujo funcional de la aplicación

## 1. Objetivo

Este documento describe los principales flujos de funcionamiento de AGAFONA App.

La finalidad es explicar cómo se moverán los usuarios dentro de la aplicación y qué acciones podrá realizar cada tipo de usuario según sus roles.

Los flujos definidos servirán como guía para el desarrollo posterior de la PWA y su conexión con Firebase.

---

## 2. Roles principales

La aplicación tendrá cuatro roles principales:

```text
socio
jurado
directiva
admin
```

Un usuario podrá disponer de uno o varios roles simultáneamente.

Ejemplos:

```text
Socio
Socio + Jurado
Socio + Directiva
Socio + Directiva + Jurado
Administrador
```

Cada rol tendrá acceso a funciones diferentes.

---

## 3. Flujo general de acceso

```text
Usuario abre AGAFONA App
  ↓
Pantalla de inicio
  ↓
Inicio de sesión
  ↓
Firebase Authentication identifica al usuario
  ↓
La app consulta sus roles en Firestore
  ↓
Se muestra el panel correspondiente
```

Según sus roles, el usuario podrá acceder a diferentes zonas:

```text
socio     → panel de socio
jurado    → panel de jurado
directiva → panel de directiva
admin     → panel de administración
```

---

## 4. Flujo del socio

El socio podrá acceder a las funciones principales de la asociación.

```text
Socio inicia sesión
  ↓
Accede al panel de socio
  ↓
Puede consultar:
    - actividades
    - avisos
    - liga fotográfica
    - clasificación de convocatoria
    - clasificación general
    - documentos para socios
    - perfil personal
```

El socio no tendrá acceso a funciones de administración ni de votación como jurado, salvo que también tenga asignado el rol correspondiente.

---

## 5. Flujo de subida de fotografía

Cada socio podrá tener una única fotografía activa por convocatoria.

La categoría será única:

```text
Naturaleza general
```

No se contemplan varias categorías para evitar complicaciones logísticas, necesidad de más jurado, clasificaciones separadas y gestión de premios diferentes.

Durante el periodo de envío, el socio podrá sustituir su fotografía tantas veces como desee.

La última fotografía enviada dentro del plazo será la que participe en la fase de votación.

Flujo:

```text
Socio entra en Liga Fotográfica
  ↓
La app comprueba la convocatoria activa
  ↓
La app comprueba si está en periodo de subida
  ↓
La app comprueba si existe una fotografía previa
  ↓
Si existe fotografía previa:
    puede sustituirla
  ↓
Si no existe fotografía previa:
    puede subir una nueva
  ↓
La fotografía se sube a Firebase Storage
  ↓
Se crea o actualiza el registro en Firestore
  ↓
La app muestra confirmación
```

Reglas principales:

```text
1 socio = 1 fotografía activa por convocatoria
1 convocatoria = 1 mes
1 categoría = Naturaleza general
```

---

## 6. Periodo de subida

El periodo de subida será del día 1 al día 15 de cada convocatoria.

Durante este periodo:

- El socio puede subir su fotografía.
- El socio puede sustituir su fotografía enviada.
- El socio puede ver si ya ha participado.
- El administrador puede revisar fotografías.
- El jurado todavía no vota.

Fuera de este periodo, la fotografía quedará bloqueada y no podrá modificarse.

---

## 7. Flujo de votación del jurado

El periodo de votación será del día 16 hasta el final del mes.

Cada fotografía será valorada por tres jurados.

Cada jurado podrá otorgar un máximo de 10 puntos por fotografía.

La puntuación estará dividida en:

```text
Técnica: máximo 5 puntos
Creatividad: máximo 3 puntos
Dificultad: máximo 2 puntos
Total máximo por jurado: 10 puntos
```

Flujo:

```text
Jurado inicia sesión
  ↓
Accede al panel de jurado
  ↓
Entra en votaciones activas
  ↓
La app muestra fotografías sin autor
  ↓
El jurado puntúa:
    - Técnica
    - Creatividad
    - Dificultad
  ↓
La app calcula el total
  ↓
El voto se guarda en Firestore
  ↓
El jurado pasa a la siguiente fotografía
```

---

## 8. Anonimato durante la votación

Durante la votación, el jurado no verá el autor de la fotografía.

El jurado podrá ver:

- La fotografía.
- El título, si se decide mostrarlo.
- Los campos de puntuación.

El jurado no podrá ver:

- Nombre del socio.
- ID del autor.
- Perfil del autor.
- Datos personales relacionados con la fotografía.

El administrador sí podrá consultar la relación entre fotografía y autor.

---

## 9. Flujo de cálculo de puntuaciones

Cada fotografía podrá obtener un máximo de 30 puntos.

```text
Jurado 1: máximo 10 puntos
Jurado 2: máximo 10 puntos
Jurado 3: máximo 10 puntos
Total máximo fotografía: 30 puntos
```

Flujo:

```text
Finaliza el periodo de votación
  ↓
La app recoge las votaciones de cada fotografía
  ↓
Suma los puntos de los tres jurados
  ↓
Calcula el total de cada fotografía
  ↓
Ordena las fotografías por puntuación
  ↓
Genera la clasificación de convocatoria
```

---

## 10. Flujo de clasificación de convocatoria

La clasificación de convocatoria se generará al finalizar cada convocatoria.

```text
Convocatoria cerrada
  ↓
Se suman las puntuaciones
  ↓
Se ordenan los resultados
  ↓
Se asignan posiciones
  ↓
Se publica la clasificación de convocatoria
```

La clasificación de convocatoria podrá ser consultada por socios, jurados y administradores cuando esté publicada.

---

## 11. Flujo de clasificación general

La clasificación general sumará los resultados obtenidos por cada socio durante las convocatorias de la liga.

```text
Clasificación de convocatoria publicada
  ↓
Se añaden los puntos a la clasificación general
  ↓
Se recalcula la posición de cada socio
  ↓
Se actualiza la clasificación general de la liga
```

La clasificación general permitirá ver la evolución de la liga completa.

---

## 12. Flujo de la directiva

Los miembros de la directiva podrán acceder a documentación interna y zonas restringidas de la asociación.

```text
Directiva inicia sesión
  ↓
Accede al panel de directiva
  ↓
Puede consultar:
    - actas de Junta Directiva
    - informes internos
    - presupuestos autorizados
    - planificación
    - documentación interna
```

La directiva no tendrá acceso a funciones técnicas de administración salvo que también tenga rol de administrador.

---

## 13. Flujo del administrador

El administrador tendrá acceso a la gestión completa de la aplicación.

```text
Admin inicia sesión
  ↓
Accede al panel de administración
  ↓
Puede gestionar:
    - usuarios
    - roles
    - convocatorias
    - fotografías
    - votaciones
    - clasificaciones
    - documentos
    - actividades
    - avisos
    - configuración de la liga
```

El administrador será el único usuario que podrá modificar la configuración principal de la liga.

---

## 14. Flujo de actividades

El administrador podrá crear actividades de AGAFONA.

```text
Admin crea actividad
  ↓
Introduce título, fecha, descripción y localización
  ↓
Publica la actividad
  ↓
Los socios la consultan desde la app
```

En fases futuras se podrá añadir inscripción a actividades.

---

## 15. Flujo de notificaciones

El administrador podrá publicar avisos o notificaciones.

```text
Admin crea aviso
  ↓
El aviso se guarda en Firestore
  ↓
La app lo muestra a los usuarios correspondientes
```

Las notificaciones podrán utilizarse para comunicar:

- nuevas actividades
- apertura de subida de fotografías
- inicio de votaciones
- publicación de clasificaciones
- publicación de documentos
- avisos importantes de la asociación

---

## 16. Flujo documental

La aplicación permitirá consultar documentos según los permisos de cada usuario.

```text
Usuario inicia sesión
  ↓
La app consulta sus roles
  ↓
La app muestra los documentos permitidos
```

Ejemplos:

```text
Socios:
  - bases de la liga
  - estatutos
  - actas de asamblea
  - memorias

Directiva:
  - actas de Junta Directiva
  - informes internos
  - presupuestos
  - planificación

Admin:
  - gestión completa de documentos
```

---

## 17. Flujo de perfil de usuario

Cada usuario podrá consultar su perfil.

```text
Usuario inicia sesión
  ↓
Accede a perfil
  ↓
Consulta sus datos básicos
```

El usuario podrá ver:

- nombre
- correo
- roles
- estado de socio
- participación en la liga

Los cambios importantes, como roles o estado, serán gestionados por administración.

---

## 18. Requisitos técnicos de las fotografías

Las fotografías enviadas deberán cumplir las condiciones indicadas en las bases de participación.

Requisitos iniciales:

```text
Formato: JPG
Lado mayor: 1920 px
Resolución: 72 ppp
Tamaño mínimo: 0,5 MB
Tamaño máximo: 1,5 MB
```

La aplicación deberá comprobar estos requisitos antes de aceptar la fotografía.

---

## 19. Decisiones funcionales importantes

Para simplificar la gestión de AGAFONA App se establecen las siguientes decisiones iniciales:

```text
Una sola categoría: Naturaleza general.
Una fotografía activa por socio y convocatoria.
Posibilidad de sustituir la fotografía durante el periodo de envío.
Tres jurados por fotografía.
Máximo 10 puntos por jurado.
Máximo 30 puntos por fotografía.
Una clasificación por convocatoria.
Una clasificación general de la liga.
Documentos visibles según roles.
```

Estas decisiones reducen la complejidad para la directiva y hacen que la aplicación sea más fácil de mantener.

---

## 20. Consideraciones futuras

Aunque la aplicación se diseñará de forma sencilla, se dejará preparada para posibles mejoras futuras:

- Cambiar criterios de puntuación.
- Cambiar número de jurados.
- Ajustar máximos de puntuación.
- Añadir comentarios internos del jurado.
- Añadir inscripción a actividades.
- Añadir estadísticas históricas.
- Añadir buscador documental.
- Añadir histórico de ligas.

No se plantea inicialmente añadir varias categorías, ya que supondría más carga de gestión, más jurados, más clasificaciones y más premios.

---

## 21. Conclusión

El flujo funcional de AGAFONA App busca ser práctico, claro y fácil de gestionar.

La aplicación se centrará en las necesidades reales de la asociación, especialmente en la liga fotográfica, las actividades, los avisos, la documentación y las clasificaciones.

El diseño prioriza la sencillez para socios, jurado, directiva y administración, evitando una estructura demasiado compleja que pueda dificultar el trabajo de la asociación.
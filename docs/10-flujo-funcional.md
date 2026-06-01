# 10 - Flujo funcional de la aplicación

## 1. Objetivo

Este documento describe los principales flujos de funcionamiento de AGAFONA App.

La finalidad es explicar cómo se moverán los usuarios dentro de la aplicación y qué acciones podrá realizar cada tipo de usuario según su rol.

Los flujos definidos servirán como guía para el desarrollo posterior de la PWA y su conexión con Firebase.

---

## 2. Roles principales

La aplicación tendrá tres roles principales:

* socio
* jurado
* admin

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
La app consulta su rol en Firestore
  ↓
Se muestra el panel correspondiente
```

Según el rol, el usuario accederá a una zona diferente:

```text
socio  → panel de socio
jurado → panel de jurado
admin  → panel de administración
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
    - clasificación mensual
    - clasificación anual
    - perfil personal
```

El socio no tendrá acceso a funciones de administración ni de votación como jurado.

---

## 5. Flujo de subida de fotografía

Cada socio podrá subir una sola fotografía por jornada mensual.

La categoría será única:

```text
Naturaleza general
```

No se contemplan varias categorías para evitar complicaciones logísticas, necesidad de más jurado, clasificaciones separadas y gestión de premios diferentes.

Flujo:

```text
Socio entra en Liga Fotográfica
  ↓
La app comprueba la jornada activa
  ↓
La app comprueba si está en periodo de subida
  ↓
La app comprueba si el socio ya ha subido una fotografía
  ↓
Si no ha subido fotografía:
    puede seleccionar imagen
  ↓
La fotografía se sube a Firebase Storage
  ↓
Se crea el registro en Firestore
  ↓
La app muestra confirmación
```

Reglas principales:

```text
1 socio = 1 fotografía por jornada
1 jornada = 1 mes
1 categoría = Naturaleza general
```

---

## 6. Periodo de subida

El periodo de subida será del día 1 al día 15 de cada mes.

Durante este periodo:

* El socio puede subir su fotografía.
* El socio puede ver si ya ha participado.
* El administrador puede revisar fotografías.
* El jurado todavía no vota.

Fuera de este periodo, la app no permitirá nuevas subidas para esa jornada.

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

* La fotografía.
* El título, si se decide mostrarlo.
* Los campos de puntuación.

El jurado no podrá ver:

* Nombre del socio.
* ID del autor.
* Perfil del autor.
* Datos personales relacionados con la fotografía.

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
Genera la clasificación mensual
```

---

## 10. Flujo de clasificación mensual

La clasificación mensual se generará al finalizar cada jornada.

```text
Jornada cerrada
  ↓
Se suman las puntuaciones
  ↓
Se ordenan los resultados
  ↓
Se asignan posiciones
  ↓
Se publica la clasificación mensual
```

La clasificación mensual podrá ser consultada por socios, jurados y administradores cuando esté publicada.

---

## 11. Flujo de clasificación anual

La clasificación anual sumará los resultados obtenidos por cada socio durante las jornadas mensuales de la temporada.

```text
Clasificación mensual publicada
  ↓
Se añaden los puntos a la clasificación anual
  ↓
Se recalcula la posición de cada socio
  ↓
Se actualiza la clasificación de la temporada
```

La clasificación anual permitirá ver la evolución de la liga durante todo el año.

---

## 12. Flujo del administrador

El administrador tendrá acceso a la gestión completa de la aplicación.

```text
Admin inicia sesión
  ↓
Accede al panel de administración
  ↓
Puede gestionar:
    - usuarios
    - roles
    - jornadas
    - fotografías
    - votaciones
    - clasificaciones
    - actividades
    - avisos
    - configuración de la liga
```

El administrador será el único usuario que podrá modificar la configuración principal de la liga.

---

## 13. Flujo de actividades

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

## 14. Flujo de notificaciones

El administrador podrá publicar avisos o notificaciones.

```text
Admin crea aviso
  ↓
El aviso se guarda en Firestore
  ↓
La app lo muestra a los socios
```

Las notificaciones podrán utilizarse para comunicar:

* nuevas actividades
* apertura de subida de fotografías
* inicio de votaciones
* publicación de clasificaciones
* avisos importantes de la asociación

---

## 15. Flujo de perfil de usuario

Cada usuario podrá consultar su perfil.

```text
Usuario inicia sesión
  ↓
Accede a perfil
  ↓
Consulta sus datos básicos
```

El usuario podrá ver:

* nombre
* correo
* rol
* estado de socio
* participación en la liga

Los cambios importantes, como rol o estado, serán gestionados por administración.

---

## 16. Decisiones funcionales importantes

Para simplificar la gestión de AGAFONA App se establecen las siguientes decisiones iniciales:

```text
Una sola categoría: Naturaleza general.
Una fotografía por socio y jornada.
Tres jurados por fotografía.
Máximo 10 puntos por jurado.
Máximo 30 puntos por fotografía.
Una clasificación mensual.
Una clasificación anual.
```

Estas decisiones reducen la complejidad para la directiva y hacen que la aplicación sea más fácil de mantener.

---

## 17. Consideraciones futuras

Aunque la aplicación se diseñará de forma sencilla, se dejará preparada para posibles mejoras futuras:

* Cambiar criterios de puntuación.
* Cambiar número de jurados.
* Ajustar máximos de puntuación.
* Añadir comentarios internos del jurado.
* Añadir inscripción a actividades.
* Añadir documentos privados para socios.
* Añadir estadísticas históricas.

No se plantea inicialmente añadir varias categorías, ya que supondría más carga de gestión, más jurados, más clasificaciones y más premios.

---

## 18. Conclusión

El flujo funcional de AGAFONA App busca ser práctico, claro y fácil de gestionar.

La aplicación se centrará en las necesidades reales de la asociación, especialmente en la liga fotográfica, las actividades, los avisos y las clasificaciones.

El diseño prioriza la sencillez para socios, jurado y administración, evitando una estructura demasiado compleja que pueda dificultar el trabajo de la directiva.

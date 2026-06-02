# 19 - Revisión final del proyecto

## 1. Objetivo

Este documento recoge el estado final de la fase de análisis y diseño de AGAFONA App.

Su finalidad es consolidar las decisiones tomadas durante la elaboración de la documentación y servir como punto de partida para la fase de desarrollo e implantación.

---

## 2. Estado actual del proyecto

La fase de análisis puede considerarse completada.

Durante esta etapa se han definido:

* Objetivos de la aplicación.
* Arquitectura general.
* Modelo de datos.
* Sistema de permisos.
* Gestión documental.
* Liga fotográfica.
* Flujo funcional.
* Interfaz de usuario.
* Panel de administración.
* Implantación Firebase.
* Identidad visual.

La documentación generada proporciona una visión completa del funcionamiento previsto de la aplicación.

---

## 3. Decisiones funcionales principales

### Liga fotográfica

Se establecen las siguientes decisiones:

```text
Una única Liga AGAFONA.
Una única categoría:
Naturaleza general.
```

La liga se desarrollará entre:

```text
Noviembre y Junio.
```

Con un total de:

```text
8 convocatorias.
```

---

### Participación

Cada socio podrá:

```text
Subir una única fotografía activa por convocatoria.
```

Durante el periodo de envío:

```text
Del día 1 al día 15.
```

El socio podrá sustituir su fotografía tantas veces como desee.

La última fotografía enviada será la válida para la votación.

---

### Votación

Cada fotografía será valorada por:

```text
3 jurados.
```

Cada jurado podrá otorgar:

```text
Máximo 10 puntos.
```

Distribuidos en:

```text
Técnica: 5 puntos
Creatividad: 3 puntos
Dificultad: 2 puntos
```

Puntuación máxima por fotografía:

```text
30 puntos.
```

---

### Clasificaciones

La aplicación generará:

```text
Clasificación de convocatoria.
Clasificación general de la liga.
```

---

## 4. Roles definidos

La aplicación contempla los siguientes roles:

```text
socio
jurado
directiva
admin
```

Un usuario podrá disponer de varios roles simultáneamente.

Ejemplos:

```text
Socio + Jurado
Socio + Directiva
Socio + Directiva + Jurado
```

---

## 5. Gestión documental

La aplicación incorporará una biblioteca documental organizada por niveles de acceso.

Niveles previstos:

```text
Público
Socios
Directiva
Administración
```

Documentos previstos:

```text
Bases de la Liga
Estatutos
Actas de Asamblea
Memorias
Normativas
Actas de Junta Directiva
Informes internos
Presupuestos
```

---

## 6. Requisitos técnicos de fotografías

Las fotografías deberán cumplir:

```text
Formato JPG
1920 px lado mayor
72 ppp
Peso mínimo 0,5 MB
Peso máximo 1,5 MB
```

La aplicación validará automáticamente estos requisitos.

---

## 7. Arquitectura tecnológica

Tecnologías previstas:

```text
HTML
CSS
JavaScript
Firebase
GitHub
GitHub Pages
PWA
```

Servicios Firebase:

```text
Authentication
Cloud Firestore
Storage
Cloud Messaging
```

---

## 8. Identidad visual

La aplicación seguirá la línea gráfica de AGAFONA.

Elementos principales:

```text
Logo AGAFONA
Verde corporativo
Negro corporativo
Diseño limpio y moderno
Uso prioritario en móvil
```

La identidad visual podrá evolucionar sin afectar a la estructura funcional de la aplicación.

---

## 9. Estado de la documentación

Documentación completada:

```text
01-vision
02-hld
03-base-datos
04-permisos
05-roadmap
06-wireframes
07-arquitectura-firebase
08-firestore-schema
09-reglas-seguridad-firebase
10-flujo-funcional
11-ui-pantallas
12-pwa-y-notificaciones
13-plan-firebase
14-panel-administracion
15-plan-firebase
16-identidad-visual
17-mockups-ui
18-modelo-final-datos
19-revision-final-proyecto
```

---

## 10. Aspectos pendientes de revisión

Antes de iniciar el desarrollo conviene revisar:

```text
Posible duplicidad entre:
13-plan-firebase.md
15-plan-firebase.md
```

Y verificar la coherencia final de nombres y contenidos.

---

## 11. Próxima fase

Una vez completada la documentación, la siguiente etapa será:

```text
Configuración de Firebase.
Creación del proyecto.
Autenticación.
Firestore.
Storage.
Primer prototipo funcional.
```

El objetivo será disponer de una primera versión operativa de AGAFONA App para realizar pruebas internas.

---

## 12. Conclusión

La fase de análisis y diseño puede considerarse finalizada.

La documentación generada describe con suficiente detalle la estructura, funcionamiento y objetivos de AGAFONA App.

El proyecto dispone ya de una base sólida para comenzar la fase de desarrollo, manteniendo una visión realista, escalable y adaptada a las necesidades actuales de AGAFONA.

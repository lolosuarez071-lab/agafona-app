# 02 - High Level Design (HLD)

## Objetivo

Definir la arquitectura general de la aplicación AGAFONA App y la relación entre usuarios, módulos y servicios externos.

## Arquitectura general

                   AGAFONA APP

                          │
                          ▼

                  Autenticación
                   Firebase Auth

                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼

      Socio           Jurado           Admin

         │                │                │

         └────────────┬───┴───────┬────────┘
                      │           │
                      ▼           ▼

                Firestore     Storage

                      │           │

                      ▼           ▼

               Datos Liga     Fotografías

                      │

                      ▼

                 Clasificaciones



## Automatización de la Liga Fotográfica

                AGAFONA APP

                       │
                       ▼

                   Firestore

                       │
                       ▼

            Motor de Automatización

                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼

 Apertura Liga   Cierre Subida   Apertura Votación

                       │
                       ▼

              Cierre Votación

                       │
                       ▼

             Cálculo Resultados

                       │
                       ▼

      Actualización Clasificación

                       │
                       ▼

     Creación Convocatoria Siguiente

     
### Objetivo

Reducir al mínimo la intervención manual del administrador en la gestión mensual de la liga fotográfica.

### Procesos automáticos

- Apertura de convocatoria el día 1 a las 00:01.
- Cierre de subida el día 15 a las 23:59.
- Apertura de votación el día 16.
- Cierre de votación el último día del mes.
- Cálculo automático de resultados.
- Actualización automática de clasificación general.
- Generación automática de la siguiente convocatoria mensual.

### Notificaciones automáticas

En una fase posterior, la aplicación podrá enviar notificaciones automáticas a los socios en momentos clave de la liga fotográfica:

- Apertura del periodo de subida de fotografías.
- Aviso previo al cierre del periodo de subida.
- Apertura del periodo de votación para jurados.
- Publicación de clasificación mensual.
- Actualización de clasificación general.

Estas notificaciones tendrán como objetivo mejorar la participación y reducir comunicaciones manuales por otros canales.


## Módulos del sistema

| Código | Módulo | Descripción |
|---|---|---|
| M01 | Autenticación | Gestiona el acceso de usuarios, inicio de sesión, cierre de sesión y recuperación de contraseña. |
| M02 | Inicio y Avisos | Muestra avisos importantes, novedades y comunicaciones rápidas para los usuarios. |
| M03 | Actividades | Gestiona el calendario de actividades, detalles de cada salida o evento e inscripciones. |
| M04 | Perfil de Usuario | Muestra los datos básicos del usuario autenticado. Cada socio solo podrá ver sus propios datos. |
| M05 | Cuotas | Permite consultar el estado de la cuota del socio, fecha de pago y vigencia. |
| M06 | Documentos | Permite acceder a documentos internos, normativas, formularios, seguros o archivos informativos. |
| M07 | Liga Fotográfica | Gestiona convocatorias, subida temporal de fotografías, periodos de participación y votación. |
| M08 | Puntuaciones y Clasificaciones | Gestiona las puntuaciones del jurado, resultados mensuales y clasificación general. |
| M09 | Localizaciones Fotográficas | Permite consultar y proponer localizaciones útiles para fotografía de naturaleza. |
| M10 | Administración | Permite al administrador gestionar usuarios, roles, actividades, avisos, documentos, cuotas, liga y localizaciones. |

## Reglas generales del diseño

- La aplicación será una PWA accesible desde móvil y ordenador.
- El acceso estará restringido mediante autenticación.
- Los permisos dependerán del rol asignado al usuario.
- Un jurado puede ser socio o no serlo.
- Los jurados serán autorizados manualmente por un administrador.
- Durante la votación, el jurado no verá el autor de las fotografías.
- El jurado solo verá la imagen, el título de la foto y el formulario de puntuación.
- Las fotos de la liga se almacenarán temporalmente en Firebase Storage.
- Al finalizar la convocatoria, las fotos podrán archivarse externamente y eliminarse de la app.
- La app conservará solo los datos necesarios para resultados y clasificación._.
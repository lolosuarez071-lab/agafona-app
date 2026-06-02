# 04 - Permisos y Seguridad

## Objetivo

Definir los permisos de acceso de cada tipo de usuario de AGAFONA App.

La aplicación utilizará autenticación y un sistema de roles para controlar qué puede ver y hacer cada usuario.

---

## Roles del sistema

| Roles | Descripción |
|-----|-----|
| socio | Usuario miembro de AGAFONA. |
| jurado | Usuario autorizado para puntuar fotografías de la liga. |
| directiva | Usuario miembro de la Junta Directiva con acceso a documentación y funciones internas. |
| admin | Usuario con permisos de administración global. |
---

## Reglas generales

- Todos los usuarios deberán iniciar sesión.
- Los roles serán asignados manualmente por un administrador.
- Un usuario puede tener más de un rol.
- Un jurado puede no ser socio.
- Los usuarios desactivados no podrán acceder.
- Cada socio solo podrá ver sus propios datos personales.
- El jurado no podrá ver el autor de las fotografías durante la votación.
- La subida de fotografías solo estará permitida del día 1 a las 00:01 al día 15 a las 23:59.
- La votación solo estará permitida desde el día 16 hasta el último día del mes.
- La clasificación de convocatoria y la clasificación general se calcularán automáticamente al cierre de la votación.

---

## Permisos del socio

Puede:

- Iniciar sesión.
- Consultar avisos.
- Consultar actividades.
- Inscribirse en actividades.
- Consultar documentos.
- Ver su perfil.
- Consultar su estado de cuota.
- Participar en las convocatorias de la liga.
Subir una fotografía por convocatoria.
Sustituir su fotografía mientras el plazo de envío permanezca abierto.  
- Consultar clasificaciones.
- Consultar localizaciones aprobadas, si el módulo se implementa.

No puede:

- Ver datos personales de otros socios.
- Modificar cuotas.
- Gestionar usuarios.
- Puntuar fotografías.
- Administrar actividades, avisos o documentos.
- Subir fotografías fuera del periodo permitido.

---

## Permisos del jurado

Puede:

- Iniciar sesión.
- Acceder al módulo de liga durante el periodo de votación.
- Ver las fotografías presentadas.
- Ver el título de cada fotografía.
- Puntuar fotografías durante el periodo permitido.
- Consultar clasificaciones, si se permite.
- No podrá consultar las puntuaciones emitidas por otros jurados.
- Solo podrá consultar las puntuaciones realizadas por él mismo hasta el cierre de la convocatoria.
- Modificar sus propias puntuaciones mientras la convocatoria permanezca abierta.
- Revisar las puntuaciones emitidas por él mismo durante el periodo de votación.

No puede:

- Ver el autor de las fotografías.
- Ver las puntuaciones emitidas por otros jurados.
- Ver datos personales de socios.
- Subir fotografías como jurado, salvo que también tenga rol de socio.
- Modificar cuotas.
- Gestionar usuarios.
- Gestionar actividades.
- Gestionar documentos.
- Votar fuera del periodo permitido.

---

## Permisos de la directiva

Puede:

- Iniciar sesión.
- Consultar documentación interna de la asociación.
- Consultar actas de Junta Directiva.
- Consultar informes internos.
- Consultar presupuestos y documentación económica autorizada.
- Consultar documentación de planificación y organización.
- Acceder a documentación restringida para la Junta.

No puede:

- Gestionar usuarios.
- Asignar roles.
- Modificar permisos.
- Administrar la aplicación.
- Modificar clasificaciones de la liga.

---

## Permisos del administrador

Puede:

- Gestionar usuarios.
- Activar o desactivar usuarios.
- Asignar roles.
- Gestionar actividades.
- Gestionar inscripciones.
- Gestionar avisos.
- Gestionar documentos internos de la directiva.
- Gestionar cuotas.
- Gestionar convocatorias de liga.
- Revisar fotografías.
- Consultar resultados.
- Gestionar clasificaciones.
- Gestionar localizaciones, si el módulo se implementa.

---

## Seguridad de la liga fotográfica

Durante el periodo de votación, el jurado solo verá:

- Imagen presentada.
- Título de la fotografía.
- Formulario de puntuación.
- Los socios podrán sustituir su fotografía durante el periodo de envío. Al comenzar la votación la fotografía quedará bloqueada.

El sistema ocultará al jurado cualquier dato que pueda identificar al autor de la fotografía.

La relación entre fotografía y socio quedará guardada internamente para poder calcular resultados y clasificaciones.

### Visibilidad de fotografías y puntuaciones

Durante el periodo de participación y votación:

- Los socios no podrán visualizar las fotografías presentadas por otros participantes.
- Cada socio solo podrá visualizar la fotografía presentada por él mismo.
- Los jurados podrán visualizar las fotografías necesarias para realizar la valoración.
- Los jurados no podrán visualizar las puntuaciones emitidas por otros jurados.
- Los socios no podrán visualizar puntuaciones parciales ni resultados provisionales.
- Cada jurado podrá consultar y modificar exclusivamente sus propias puntuaciones hasta el cierre de la convocatoria.
- Una vez cerrada la convocatoria, las puntuaciones quedarán bloqueadas y no podrán modificarse.

Una vez finalizada la convocatoria y publicados los resultados:

- Los socios podrán consultar la clasificación mensual.
- Los socios podrán consultar la clasificación general.
- La organización podrá decidir si las fotografías participantes se muestran públicamente o permanecen archivadas.

---

## Automatización de la liga

El sistema gestionará automáticamente el ciclo mensual de la liga:

- Apertura de subida: día 1 a las 00:01.
- Cierre de subida: día 15 a las 23:59.
- Apertura de votación: día 16.
- Cierre de votación: último día del mes.
- Cálculo de resultados.
- Actualización de clasificación general.
- Creación de la siguiente convocatoria mensual.

El objetivo es reducir la intervención manual del administrador.

---

## Protección de datos

La aplicación almacenará únicamente los datos personales necesarios:

- Nombre.
- Correo electrónico.
- Número de socio, si corresponde.
- Estado de cuota.

No se almacenarán datos personales innecesarios.

Cada usuario solo podrá acceder a la información que necesite según su rol.

---

### Niveles de acceso a documentos

Público:
- Información pública.

Socios:
- Bases de la liga.
- Estatutos.
- Actas de asamblea.
- Memorias.

Directiva:
- Actas de Junta Directiva.
- Informes internos.
- Presupuestos.
- Documentación de planificación.

Administrador:
- Acceso total.
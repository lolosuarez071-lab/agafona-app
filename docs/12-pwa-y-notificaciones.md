# 12 - Documentos y permisos avanzados

## 1. Objetivo

Este documento define la gestión documental y los permisos avanzados de AGAFONA App.

La finalidad es permitir el acceso controlado a distintos tipos de documentación según el perfil de cada usuario, facilitando la gestión interna de la asociación y el acceso a información relevante para socios y miembros de la directiva.

---

## 2. Necesidad de una gestión documental

Además de la liga fotográfica, AGAFONA genera documentación que debe estar disponible para distintos grupos de usuarios.

Actualmente existen documentos que pueden ser consultados por todos los socios y otros que deben permanecer restringidos a la Junta Directiva.

La aplicación deberá contemplar ambos escenarios.

---

## 3. Roles de usuario

La aplicación utilizará los siguientes roles:

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

---

## 4. Roles múltiples

La estructura deberá permitir que un usuario acumule varios roles.

Ejemplo:

```js
{
  nombre: "Manuel Suárez",
  roles: [
    "socio",
    "directiva"
  ]
}
```

Esta aproximación resulta más flexible que asignar un único rol.

---

## 5. Tipos de documentos

La aplicación deberá permitir almacenar diferentes tipos de documentación.

### Documentación pública

Visible para cualquier visitante.

Ejemplos:

* Información general de la asociación.
* Bases de concursos abiertos.
* Información pública de actividades.

---

### Documentación para socios

Visible únicamente para usuarios identificados como socios.

Ejemplos:

* Bases de la Liga.
* Estatutos.
* Actas de Asamblea.
* Memorias anuales.
* Normativas internas aprobadas.

---

### Documentación de directiva

Visible únicamente para miembros de la Junta Directiva.

Ejemplos:

* Actas de Junta Directiva.
* Informes internos.
* Planificación anual.
* Presupuestos.
* Documentación de trabajo.

---

### Documentación administrativa

Visible únicamente para administradores.

Ejemplos:

* Copias de seguridad.
* Informes técnicos.
* Configuración avanzada.
* Documentación interna de la aplicación.

---

## 6. Biblioteca documental

La aplicación dispondrá de una zona denominada:

```text
Documentos
```

Organizada inicialmente en:

```text
Documentos
│
├── Liga Fotográfica
├── Estatutos
├── Actas de Asamblea
├── Memorias
├── Normativas
└── Otros documentos
```

Los usuarios únicamente visualizarán las categorías para las que tengan permisos.

---

## 7. Zona documental de directiva

Los miembros de la directiva dispondrán de una sección adicional:

```text
Documentos Directiva
```

Ejemplo:

```text
Documentos Directiva
│
├── Actas Junta Directiva
├── Informes internos
├── Presupuestos
├── Planificación anual
└── Documentación de trabajo
```

Esta zona no será visible para socios que no pertenezcan a la directiva.

---

## 8. Bases de la Liga

Las bases de participación de la Liga Fotográfica se almacenarán como documento oficial.

Formato recomendado:

```text
PDF
```

Ventajas:

* Fácil actualización.
* Documento oficial único.
* Acceso sencillo desde móvil.
* Evita duplicar información dentro de la aplicación.

La aplicación mostrará un resumen de la competición y un enlace al documento completo.

---

## 9. Liga AGAFONA

La aplicación deberá contemplar el funcionamiento real de la Liga AGAFONA.

Características actuales:

```text
Liga:
Noviembre a Junio

Total convocatorias:
8
```

Ejemplo:

```text
Noviembre
Diciembre
Enero
Febrero
Marzo
Abril
Mayo
Junio
```

La configuración deberá permitir modificar estos parámetros en futuras convocatorias.

---

## 10. Visibilidad documental

Cada documento tendrá un nivel de acceso.

Ejemplo:

```js
{
  titulo: "Acta Asamblea 2027",
  visibilidad: "socios"
}
```

Valores posibles:

```text
publico
socios
directiva
admin
```

---

## 11. Almacenamiento de documentos

Los documentos se almacenarán en Firebase Storage.

Firestore almacenará únicamente la información descriptiva.

Ejemplo:

```js
{
  titulo: "Bases Liga 2026-2027",
  categoria: "liga",
  visibilidad: "socios",
  urlDocumento: "firebase_storage_url",
  fechaPublicacion: "2026-10-15"
}
```

---

## 12. Permisos avanzados

Además de los roles, la aplicación deberá quedar preparada para utilizar permisos específicos.

Ejemplos:

```text
ver_documentos_socios
ver_documentos_directiva
crear_documentos
editar_documentos
gestionar_liga
gestionar_usuarios
```

Esto permitirá futuras ampliaciones sin necesidad de modificar toda la estructura de usuarios.

---

## 13. Beneficios de esta estructura

La gestión documental permitirá:

* Centralizar información.
* Facilitar el trabajo de la directiva.
* Reducir el uso de correos electrónicos.
* Mantener documentos organizados.
* Mejorar el acceso desde dispositivos móviles.
* Conservar documentación histórica.

---

## 14. Posibles ampliaciones futuras

La estructura deberá permitir incorporar en el futuro:

* Firma digital de documentos.
* Confirmación de lectura.
* Historial de versiones.
* Buscador documental.
* Descarga de documentos.
* Organización por ligas.
* Archivo histórico de actas.

---

## 15. Conclusión

La gestión documental será una funcionalidad importante dentro de AGAFONA App.

La aplicación deberá permitir distribuir documentación a socios y miembros de la directiva de forma segura, organizada y accesible desde cualquier dispositivo.

La incorporación del rol de directiva y la definición de distintos niveles de visibilidad permitirán adaptar la aplicación a las necesidades reales de gestión de la asociación.

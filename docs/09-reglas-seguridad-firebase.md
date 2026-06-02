# 09 - Reglas de Seguridad Firebase

## 1. Objetivo

Este documento define las reglas generales de seguridad previstas para AGAFONA App usando Firebase.

La finalidad es controlar qué usuarios pueden leer, crear, modificar o eliminar información según su rol dentro de la aplicación.

Los roles principales serán:

* socio
* jurado
* directiva
* admin

---

## 2. Principios generales

La seguridad de la aplicación se basará en estas ideas:

* Los usuarios deben iniciar sesión para acceder a las zonas privadas.
* Cada usuario podrá tener uno o varios roles asignados.
* Un socio solo podrá gestionar sus propios datos y fotografías.
* Un jurado podrá votar fotografías, pero no conocer al autor.
* Un administrador tendrá acceso completo a la gestión.
* Los usuarios no autenticados solo podrán ver información pública.

---

## 3. Usuarios no autenticados

Los usuarios no autenticados podrán acceder únicamente a la parte pública de la aplicación.

Podrán ver:

* Pantalla inicial.
* Información general de AGAFONA.
* Avisos públicos.
* Actividades públicas.

No podrán:

* Subir fotografías.
* Votar.
* Acceder a zona de socios.
* Consultar datos privados.
* Modificar información.

---

## 4. Rol socio

El socio podrá:

* Ver su perfil.
* Modificar algunos datos personales propios.
* Consultar actividades.
* Consultar notificaciones.
* Subir una fotografía por convocatoria.
Sustituir su fotografía mientras el plazo de envío permanezca abierto.
* Consultar clasificaciones.
* Ver sus propias participaciones.

El socio no podrá:

* Votar como jurado.
* Ver autores de otras fotografías durante la votación.
* Modificar fotografías de otros socios.
* Crear concursos.
* Cambiar clasificaciones.
* Gestionar usuarios.

---

## 5. Rol jurado

El jurado podrá:

* Acceder a la zona de votación.
* Ver fotografías asignadas para votar.
* Emitir una votación por fotografía.
* Consultar sus propias votaciones.

El jurado no podrá:

* Ver el autor de las fotografías durante la votación.
* Modificar votos de otros jurados.
* Subir fotografías en nombre de otros usuarios.
* Gestionar concursos.
* Gestionar usuarios.
* Publicar clasificaciones.

---

## 6. Rol directiva

La directiva podrá:

* Consultar documentación interna.
* Consultar actas de Junta Directiva.
* Consultar informes internos.
* Consultar documentación de planificación.
* Consultar documentación restringida para la Junta.

La directiva no podrá:

* Gestionar usuarios.
* Asignar roles.
* Modificar permisos.
* Gestionar la aplicación.
* Modificar clasificaciones.

---

## 7. Rol administrador

El administrador podrá:

* Gestionar usuarios.
* Asignar roles.
* Crear concursos.
* Crear convocatorias de liga.
* Revisar fotografías.
* Consultar autores de fotografías.
* Gestionar votaciones.
* Calcular o publicar clasificaciones.
* Crear actividades.
* Publicar notificaciones.
* Subir documentos.
* Modificar configuración de la liga.

El administrador será el único rol con permisos completos de gestión.

---

## 8. Seguridad en usuarios

Colección:

```text
usuarios/{uid}
```

Reglas previstas:

* Cada usuario podrá leer su propio perfil.
* Cada usuario podrá modificar algunos datos de su propio perfil.
* Solo el administrador podrá cambiar roles.
* Solo el administrador podrá desactivar usuarios.
* Solo el administrador podrá ver el listado completo de usuarios.
* La fotografía quedará bloqueada automáticamente al finalizar el plazo de envío y no podrá modificarse durante la fase de votación.

Ejemplo lógico:

```text
Si el usuario está autenticado y el documento es suyo:
  puede leerlo.

Si el usuario es administrador:
  puede leer y modificar cualquier usuario.

Si el usuario no es administrador:
  no puede cambiar su rol.
```

---

## 9. Seguridad en fotografías

Colección:

```text
fotografias/{fotoId}
```

Reglas previstas:

* Un socio podrá subir su propia fotografía.
* Un socio solo podrá modificar su fotografía mientras esté en fase de subida.
* Un socio no podrá modificar fotografías de otros socios.
* El jurado podrá ver fotografías durante la fase de votación, pero sin datos del autor.
* El administrador podrá ver y gestionar todas las fotografías.

El campo `autorId` deberá protegerse especialmente para que no sea visible por el jurado durante la votación.

---

## 10. Seguridad en votaciones

Colección:

```text
votaciones/{votacionId}
```

Reglas previstas:

* Solo un usuario con rol jurado podrá crear votaciones.
* Cada jurado podrá votar una sola vez cada fotografía asignada.
* Un jurado no podrá modificar votos de otros jurados.
* Un socio no podrá votar.
* El administrador podrá consultar todas las votaciones.

Validaciones:

```text
Técnica <= 5
Creatividad <= 3
Dificultad <= 2
Total <= 10
```

La suma de los tres jurados dará un máximo de 30 puntos por fotografía.

---

## 11. Seguridad en configuración de liga

Colección:

```text
configuracionLiga/{liga}
```

Reglas previstas:

* Solo el administrador podrá crear o modificar la configuración.
* Socios y jurados podrán leer la configuración si es necesario para mostrar información.
* Nadie salvo administración podrá cambiar criterios de puntuación.

Ejemplo de configuración:

```js
{
  maximoPorJurado: 10,
  numeroJuradosPorFoto: 3,
  maximoTotalFoto: 30,
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

## 12. Seguridad en clasificaciones

Colecciones:

```text
clasificacionConvocatoria
clasificacionGeneral
```

Reglas previstas:

* Socios podrán leer clasificaciones publicadas.
* Jurados podrán leer clasificaciones publicadas.
* Administradores podrán crear, modificar o recalcular clasificaciones.
* Las clasificaciones no publicadas solo serán visibles para administradores.

---

## 13. Seguridad en actividades

Colección:

```text
actividades/{actividadId}
```

Reglas previstas:

* Los usuarios podrán leer actividades publicadas.
* Solo el administrador podrá crear actividades.
* Solo el administrador podrá modificar actividades.
* Solo el administrador podrá eliminar actividades.

---

## 14. Seguridad en Firebase Storage

Firebase Storage almacenará principalmente:

* Fotografías de concursos.
* Avatares.
* Bases de la Liga.
* Actas de Asamblea.
* Actas de Junta Directiva.
* Estatutos.
* Otros documentos.
* Imágenes de actividades.

Reglas previstas:

* Un socio solo podrá subir fotografías propias.
* Las fotografías de liga solo se podrán subir durante el periodo permitido.
* El jurado podrá visualizar fotografías asignadas para votación.
* Los documentos privados solo serán visibles para usuarios autorizados.
* El administrador tendrá permisos completos de gestión.

---

## 15. Seguridad en Firebase Storage

Firebase Storage almacenará principalmente:

* Fotografías de concursos.
* Avatares.
* Documentos.
* Imágenes de actividades.

Reglas previstas:

* Un socio solo podrá subir fotografías propias.
* Las fotografías de liga solo se podrán subir durante el periodo permitido.
* El jurado podrá visualizar fotografías asignadas para votación.
* Los documentos privados solo serán visibles para usuarios autorizados.
* El administrador tendrá permisos completos de gestión.

---

## 16. Anonimato del jurado

Una regla fundamental de AGAFONA App será mantener el anonimato del autor durante la votación.

Durante la fase de votación:

* El jurado verá la fotografía.
* El jurado verá el título si se permite.
* El jurado no verá el nombre del socio.
* El jurado no verá el `autorId`.
* El jurado no podrá acceder al perfil del autor desde la votación.

El administrador sí podrá consultar la relación entre fotografía y autor.

---

## 17. Reglas futuras

En fases posteriores se podrán definir reglas más avanzadas:

* Control por liga.
* Control por convocatoria activa.
* Control por fecha exacta de subida.
* Control de número máximo de fotografías por socio.
* Control de votaciones duplicadas.
* Control de documentos privados.
* Auditoría de cambios importantes.

---

## 18. Conclusión

Las reglas de seguridad de Firebase serán una parte esencial de AGAFONA App.

Estas reglas permitirán proteger los datos de socios, controlar el acceso por roles, mantener la imparcialidad del jurado y evitar modificaciones no autorizadas.

Este documento servirá como base para crear posteriormente las reglas reales de Firestore y Firebase Storage.

# 15 - Plan de implantación Firebase

## 1. Objetivo

Este documento define el plan de implantación de Firebase dentro de AGAFONA App.

Su finalidad es servir de guía para configurar y conectar todos los servicios necesarios para el funcionamiento de la aplicación.

La implantación se realizará de forma progresiva, permitiendo validar cada fase antes de continuar con la siguiente.

---

## 2. Servicios Firebase previstos

AGAFONA App utilizará los siguientes servicios:

```text
Firebase Authentication
Cloud Firestore
Firebase Storage
Firebase Hosting (opcional)
Firebase Cloud Messaging
```

---

## 3. Arquitectura general

```text
AGAFONA App (PWA)

│
├── Firebase Authentication
│
├── Cloud Firestore
│
├── Firebase Storage
│
└── Firebase Cloud Messaging
```

---

## 4. Fase 1 - Creación del proyecto

Objetivos:

* Crear proyecto Firebase.
* Configurar entorno.
* Registrar aplicación web.

Tareas:

```text
Crear proyecto AGAFONA App
Activar Analytics (opcional)
Registrar aplicación web
Obtener configuración Firebase
```

Resultado esperado:

```text
Proyecto Firebase operativo.
```

---

## 5. Fase 2 - Autenticación

Objetivos:

* Implementar acceso seguro.

Métodos previstos:

```text
Correo electrónico + contraseña
```

Funciones:

```text
Registro
Inicio de sesión
Cerrar sesión
Recuperar contraseña
```

Resultado esperado:

```text
Usuarios autenticados correctamente.
```

---

## 6. Fase 3 - Gestión de usuarios

Objetivos:

* Crear colección usuarios.

Campos iniciales:

```js
{
  uid: "",
  nombre: "",
  email: "",
  roles: [],
  activo: true,
  fechaAlta: ""
}
```

Roles previstos:

```text
socio
jurado
directiva
admin
```

Resultado esperado:

```text
Usuarios almacenados y gestionados desde Firestore.
```

---

## 7. Fase 4 - Liga fotográfica

Objetivos:

* Crear estructura de ligas.
* Crear convocatorias.
* Crear fotografías.
* Crear votaciones.
* Crear clasificaciones.

Configuración inicial:

```text
Liga:
Noviembre - Junio

Convocatorias:
8

Jurados:
3

Máximo por jurado:
10 puntos

Máximo fotografía:
30 puntos

Una fotografía activa por socio

Sustitución permitida hasta el día 15
```

Categoría inicial:

```text
Naturaleza general
```

Resultado esperado:

```text
Liga completamente operativa.
```

---

## 8. Fase 5 - Firebase Storage

Objetivos:

* Almacenar imágenes.
* Almacenar documentos.

Tipos previstos:

```text
Fotografías de la Liga
Avatares
Bases de participación
Actas de Asamblea
Actas Junta Directiva
Estatutos
Memorias
Documentación interna
```

Resultado esperado:

```text
Archivos accesibles según permisos.
```

---

## 9. Fase 6 - Actividades y avisos

Objetivos:

* Publicar actividades.
* Publicar avisos.
* Gestionar información general.

Colecciones:

```text
actividades
notificaciones
```

Resultado esperado:

```text
Comunicación centralizada.
```

---

## 10. Fase 7 - Sistema documental

Objetivos:

* Gestionar documentos por permisos.

Tipos:

```text
Públicos
Socios
Directiva
Administración
```

Documentos previstos:

```text
Bases de la Liga
Actas de Asamblea
Actas Junta Directiva
Estatutos
Normativas
Memorias
```

Resultado esperado:

```text
Biblioteca documental operativa.
```

---

## 11. Fase 8 - Notificaciones

Objetivos:

* Integrar Firebase Cloud Messaging.

Tipos de aviso:

```text
Liga
Clasificaciones
Actividades
Documentos
Avisos generales
```

Resultado esperado:

```text
Usuarios informados mediante notificaciones.
```

---

## 12. Reglas de seguridad

Objetivos:

* Aplicar permisos por rol.

Control previsto:

```text
Socios
Jurados
Directiva
Administradores
```

Las reglas deberán impedir accesos no autorizados a documentos, fotografías y datos privados.

Resultado esperado:

```text
Sistema seguro y controlado.
```

---

## 13. Entorno de desarrollo

Tecnologías previstas:

```text
HTML
CSS
JavaScript
Firebase
GitHub
GitHub Pages
VS Code
```

No se prevé inicialmente el uso de frameworks complejos.

---

## 14. Estrategia de pruebas

Las pruebas se realizarán por fases.

Orden recomendado:

```text
Login
Usuarios
Liga y convocatorias
Fotografías
Votaciones
Clasificación de convocatoria
Clasificación general
Documentos
Actividades
Notificaciones
```

Cada módulo deberá funcionar antes de continuar con el siguiente.

---

## 15. Copias de seguridad

Se recomienda mantener:

```text
Repositorio GitHub
Exportaciones periódicas Firestore
Copias de documentos importantes
```

La información crítica de la asociación deberá disponer siempre de respaldo.

---

## 16. Costes previstos

Fase inicial:

```text
GitHub Pages
Firebase Plan Gratuito
```

Mientras el volumen de usuarios y almacenamiento sea reducido, no se prevén costes significativos.

---

## 17. Escalabilidad

La arquitectura deberá permitir:

```text
Más usuarios
Más ligas
Más documentos
Más actividades
Más funcionalidades
```

sin necesidad de rehacer la aplicación.

---

## 18. Hoja de ruta técnica

Orden recomendado de desarrollo:

```text
1. Autenticación
2. Usuarios
3. Liga y convocatorias
4. Fotografías
5. Votaciones
6. Clasificación de convocatoria
7. Clasificación general
8. Documentos
9. Gestión documental avanzada
10. Actividades
11. Notificaciones
```

---

## 19. Riesgos identificados

Principales riesgos:

```text
Gestión incorrecta de permisos
Exceso de almacenamiento
Errores en votaciones
Pérdida de datos
Configuraciones incorrectas
```

Todos ellos podrán mitigarse mediante pruebas y copias de seguridad.

---

## 20. Conclusión

Firebase proporciona una plataforma adecuada para AGAFONA App, permitiendo construir una aplicación moderna, segura y escalable.

La implantación por fases permitirá validar cada componente antes de continuar con el siguiente, reduciendo riesgos y facilitando el mantenimiento futuro del sistema.

La estructura definida permitirá gestionar la Liga AGAFONA, la documentación de la asociación, las actividades y la comunicación con socios, jurados, directiva y administradores desde una única plataforma.


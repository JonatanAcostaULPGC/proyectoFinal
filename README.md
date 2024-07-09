# SmartPantry

## Descripción

Este proyecto es una aplicación móvil desarrollada con Angular, Ionic y Firebase, que tiene como objetivo minimizar el desperdicio de alimentos. La aplicación permite a los usuarios realizar un seguimiento de los alimentos que poseen, ingresando la cantidad y la fecha de caducidad, y notificándoles cuando un alimento está próximo a caducar.

## Características

- **Seguimiento de alimentos:** Permite a los usuarios registrar los alimentos que tienen, con detalles como cantidad y fecha de caducidad.
- **Notificaciones:** Envía alertas cuando un alimento está próximo a caducar.
- **Lista de compra:** Genera listas de compra basadas en los alimentos próximos a caducar y permite editar las listas.
- **Interfaz amigable:** Diseño intuitivo y fácil de usar.

## Tecnologías Utilizadas

- **Angular:** Framework de desarrollo web basado en TypeScript.
- **Ionic:** Framework para el desarrollo de aplicaciones móviles multiplataforma.
- **Firebase:** Plataforma en la nube que ofrece autenticación, base de datos en tiempo real, almacenamiento y funciones en la nube.

## Instalación

1. **Clona el repositorio:**

    ```bash
    git clone https://github.com/tu-usuario/tu-repositorio.git
    cd tu-repositorio
    ```

2. **Instala las dependencias:**

    ```bash
    npm install
    ```

3. **Configura Firebase:**

    - Crea un proyecto en [Firebase](https://firebase.google.com/).
    - Configura la autenticación y la base de datos en tiempo real.
    - Copia las credenciales de Firebase en `src/environments/environment.ts`.

4. **Ejecuta la aplicación:**

    ```bash
    ionic serve
    ```

## Uso

1. **Registro/Iniciar Sesión:**
    - Los usuarios pueden registrarse o iniciar sesión con su correo electrónico y contraseña.

2. **Agregar Alimentos:**
    - Los usuarios pueden agregar alimentos especificando la cantidad y la fecha de caducidad.

3. **Notificaciones:**
    - La aplicación notificará a los usuarios cuando un alimento esté próximo a caducar.

4. **Lista de Compra:**
    - Los usuarios pueden ver y editar una lista de compra basada en los alimentos próximos a caducar.

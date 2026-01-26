# Voto Claro - Asistente de programas de gobierno

Proyecto para comparar y entender propuestas de candidaturas en procesos de eleccion (nacionales u organizacionales).

## Tecnologias
- Frontend: React (Vite), Tailwind CSS, React Router
- Backend: Node.js, Express, Firebase Admin (Firestore)

## Estructura general
- `Lineamientos del proyecto/`: documento oficial del curso.
- `Requerimientos/`: requerimientos y borradores de historias de usuario.
- `frontend/`: aplicacion web (React + Tailwind).
- `backend/`: API REST con Firebase (Firestore).

## Estructura principal del frontend
- `frontend/src/app/`: configuracion de la app, rutas y layouts.
- `frontend/src/features/`: modulos por dominio (elections, candidates, proposals, comparison, search, reports, interviews, faq, admin, auth).
- `frontend/src/components/`: componentes reutilizables (UI y navegacion).
- `frontend/src/pages/`: paginas transversales (ej. 404).
- `frontend/src/services/`: integracion con API (cliente Axios y servicios por dominio).
- `frontend/src/hooks/`: hooks compartidos.
- `frontend/src/utils/`: utilidades generales (ej. `cn`).
- `frontend/src/types/`: tipos y contratos compartidos.
- `frontend/src/store/`: estado global (si se requiere).
- `frontend/src/styles/`: estilos globales o tokens (si se requieren).
- `frontend/src/assets/`: imagenes e iconos.

## Estructura principal del backend
- `backend/src/app.js`: configuracion de Express (middlewares y rutas).
- `backend/src/server.js`: arranque del servidor.
- `backend/src/config/`: configuracion de Firebase.
- `backend/src/features/`: modulos por dominio (elections, candidates, proposals, reports).
- `backend/src/middleware/`: validacion, manejo de errores y utilidades.
- `backend/src/routes/`: rutas principales de la API.
- `backend/src/utils/`: utilidades compartidas (errores HTTP).

## Variables de entorno
- Frontend: copiar `frontend/.env.example` a `frontend/.env`.
- Backend: copiar `backend/.env.example` a `backend/.env`.

## Firebase (Firestore)
- Crear un proyecto en Firebase y descargar el service account JSON.
- Opcion 1: convertir el JSON a base64 y ponerlo en `FIREBASE_SERVICE_ACCOUNT`.
- Opcion 2: guardar el JSON en disco y usar `FIREBASE_SERVICE_ACCOUNT_PATH`.
- Definir `FIREBASE_PROJECT_ID` segun el proyecto de Firebase.

## Comandos basicos
Frontend:
```bash
cd frontend
npm install
npm run dev
```

Backend:
```bash
cd backend
npm install
npm run dev
```

## Notas del dominio
- La app debe permitir seleccionar procesos de eleccion, comparar candidaturas y revisar propuestas por tema.
- Se busca neutralidad y transparencia en la presentacion de datos y fuentes.

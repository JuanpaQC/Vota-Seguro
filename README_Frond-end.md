# Voto Claro - Asistente de programas de gobierno

Proyecto para comparar y entender propuestas de candidaturas en procesos de eleccion (nacionales u organizacionales).

## Tecnologias
- React (Vite)
- Tailwind CSS
- React Router
- Axios

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

## Variables de entorno
- Copiar `frontend/.env.example` a `frontend/.env` y ajustar `VITE_API_URL` cuando exista el backend.

## Comandos basicos
```bash
cd frontend
npm install
npm run dev
```

## Notas del dominio
- La app debe permitir seleccionar procesos de eleccion, comparar candidaturas y revisar propuestas por tema.
- Se busca neutralidad y transparencia en la presentacion de datos y fuentes.

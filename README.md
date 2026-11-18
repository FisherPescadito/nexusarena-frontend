# NexusArena – Frontend

Interfaz en **React 18 + Vite + React Router**. Consume el backend de NexusArena (API REST propia)
y las APIs públicas de Riot (Data Dragon) y valorant-api.com.

## Estructura
    src/main.jsx              rutas (HashRouter) y arranque
    src/context/AuthContext   sesión del usuario (login, registro, logout)
    src/lib/client.js         cliente de NUESTRA API (fetch + token)
    src/lib/externalApi.js    APIs públicas de LoL y Valorant
    src/lib/hooks.js          useApi (carga de datos con reintento) y usePicks
    src/lib/constants.js      juegos, estados y roles
    src/components/           Layout, formularios (Field, Form, FormModal), GameBadge, Bracket, ConfirmButton, QueryState, ErrorBoundary
    src/pages/                Home, Auth, Profile, Dashboard, Tournaments, TournamentDetail, Teams

## Ejecutar en local
Necesitas el backend corriendo (ver README del backend).

    copy .env.example .env.local      # en PowerShell/cmd (en Mac/Linux: cp)
    npm install
    npm run dev                       # http://localhost:5173

## Variable de entorno
`VITE_API_URL` = dirección del backend, **terminada en /api**.
- Local: `http://localhost:3000/api`
- Producción: `https://tu-api.onrender.com/api`

Vite incluye la variable al compilar, así que si cambia hay que volver a desplegar.

## Despliegue (Vercel o Netlify)
1. Subir este repositorio a GitHub.
2. En vercel.com → Add New → Project → importar el repositorio (detecta Vite solo).
3. En **Environment Variables** agregar `VITE_API_URL` con la URL de la API en Render (terminada en /api).
4. Deploy. Copiar la URL resultante y ponerla como `FRONTEND_URL` en Render (así la API acepta las peticiones del front).

Comandos de Vite: `npm run build` (genera `dist/`) y `npm run preview`.

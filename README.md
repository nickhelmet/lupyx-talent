# Lupyx Talent

**Conectando talento con oportunidades**

Plataforma web de Lupyx Talent, consultora de reclutamiento y selección que acompaña a empresas en la identificación, atracción y selección del talento adecuado. Gestionamos procesos integrales para posiciones IT y generales en LATAM.

## Tech Stack

- **Frontend:** Next.js + React 19 + Tailwind CSS 4 + Framer Motion
- **Auth:** Firebase Authentication (Google Sign-In)
- **Database:** Cloud Firestore
- **Storage:** Firebase Storage (CVs/PDFs)
- **Hosting:** Firebase Hosting
- **Backend:** Firebase Cloud Functions (Node 22)

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
src/
├── app/            # Next.js App Router (páginas y layouts)
├── components/     # Componentes React reutilizables
├── hooks/          # Custom hooks (useAuth, useJobs, etc.)
├── lib/            # Configuración (Firebase, utils)
├── services/       # API client functions
└── types/          # TypeScript type definitions
functions/          # Firebase Cloud Functions (backend)
```

## Links

- [LinkedIn](https://www.linkedin.com/company/lupyx-talent/)
- [Instagram](https://www.instagram.com/lupyx.talent)
- [Web](https://lupyxtalent.com)

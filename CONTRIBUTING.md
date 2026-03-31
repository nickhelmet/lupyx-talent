# Contributing

## Workflow

1. Tomar un issue del [Project Board](https://github.com/nickhelmet/lupyx-talent/issues)
2. Crear branch: `feature/<issue-number>-<descripcion>`
3. Implementar con tests
4. `npm run lint && npm run build` deben pasar
5. Push y crear PR referenciando el issue (`Closes #N`)
6. CI debe pasar (lint + typecheck + build)
7. Merge a main → deploy automático a Firebase

## Commits

Conventional commits:
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` documentación
- `refactor:` refactorización sin cambio funcional
- `test:` agregar o modificar tests
- `chore:` mantenimiento, deps, CI

## Setup local

```bash
git clone https://github.com/nickhelmet/lupyx-talent.git
cd lupyx-talent
npm install
cp .env.example .env.local  # completar con Firebase keys
npm run dev
```

Cloud Functions:
```bash
cd functions
npm install
npx tsc --noEmit  # verificar tipos
```

## Estructura

```
src/app/           → Páginas (Next.js App Router)
src/components/    → Componentes React
src/hooks/         → Custom hooks (useAuth)
src/services/      → API client
src/lib/           → Firebase config
src/types/         → TypeScript definitions
functions/src/     → Cloud Functions backend
docs/              → Documentación
```

# Arquitectura

```
                    ┌─────────────────────┐
                    │   lupyxtalent.com    │
                    │  Firebase Hosting    │
                    │  (Static SPA/SSG)   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼────┐  ┌───────▼──────┐  ┌──────▼───────┐
    │ Firebase Auth │  │   Cloud      │  │  Firebase    │
    │ Google SignIn │  │  Functions   │  │  Storage     │
    │  (free 50k)  │  │  (Node 22)   │  │  (CVs/PDFs)  │
    └──────────────┘  └───────┬──────┘  └──────────────┘
                              │
                    ┌─────────▼─────────┐
                    │    Firestore      │
                    │  southamerica-e1  │
                    │    (NoSQL)        │
                    └───────────────────┘
```

## Cloud Functions

| Función | Método | Auth | Descripción |
|---------|--------|------|-------------|
| `listJobs` | GET | No | Lista jobs activos (público, cache 5min) |
| `submitApplication` | POST | Sí | Enviar postulación (check duplicados) |
| `listApplications` | GET | Sí | Mis postulaciones |
| `userProfile` | GET/POST | Sí | Ver/actualizar perfil |

## Firestore Collections

```
users/{uid}              → Perfil de usuario
jobs/{jobId}             → Búsquedas laborales
applications/{appId}     → Postulaciones
notifications/{notifId}  → Notificaciones
config/allowlist         → admin_emails[], blocked_emails[]
```

## Firestore Indexes

Firestore crea índices automáticos para queries simples (un solo campo). Pero queries compuestas (filtro por un campo + orden por otro) requieren un **índice compuesto** creado manualmente.

### Índices del proyecto

| Collection | Campos | Tipo | Usado por |
|-----------|--------|------|-----------|
| `jobs` | `status` ASC + `postedDate` DESC | Compuesto | `listJobs` — filtra jobs activos ordenados por fecha |

### Cómo crear un índice

Si una Cloud Function falla con `FAILED_PRECONDITION: The query requires an index`, hay dos formas:

**Opción 1 — Link del error:** El error incluye un link directo a Firebase Console que crea el índice con un click.

**Opción 2 — CLI:**
```bash
gcloud firestore indexes composite create --project=lupyx-talent \
  --collection-group=COLLECTION \
  --field-config field-path=CAMPO1,order=ascending \
  --field-config field-path=CAMPO2,order=descending
```

Los índices tardan 2-5 minutos en crearse. Una vez creados, funcionan permanentemente.

### Cuándo se necesitan

| Query | Índice necesario |
|-------|-----------------|
| `where("status", "==", "ACTIVE")` | No (automático) |
| `orderBy("postedDate", "desc")` | No (automático) |
| `where("status", "==", "ACTIVE").orderBy("postedDate", "desc")` | **Sí** (compuesto) |
| `where("userId", "==", uid).orderBy("appliedAt", "desc")` | **Sí** (compuesto) |

---

## Tests

### Frontend (10 tests)
```bash
npm test   # desde raíz
```
- Type definitions: 5 tests (enums, interfaces)
- Environment: 3 tests (emulator detection, API base URL)
- Analytics: 2 tests (track functions exist, callable sin Firebase)

### Cloud Functions (46 tests)
```bash
cd functions && npx vitest run
```
- Validation: 20 tests (sanitize, email, phone, DNI, statuses, PDF magic bytes)
- Validation integration: 15 tests (XSS, NoSQL injection, overflow, enum whitelist, score clamping, URL/date validation)
- CORS: 6 tests (allowed origins, headers, unknown domains)
- Rate limiter: 3 tests (config, limits)

### CI
Ambos test suites corren en cada PR: `npm test` (frontend) + `npx vitest run` (functions).

---

## Dependabot

Configurado en `.github/dependabot.yml` para alertar vulnerabilidades automáticamente:
- **npm (root):** dependencias frontend — semanal
- **npm (functions/):** dependencias Cloud Functions — semanal
- **GitHub Actions:** workflows — semanal

PRs automáticos con label `devops`. Revisar y mergear patches de seguridad lo antes posible.

---

## Analytics

Firebase Analytics integrado con eventos custom:

| Evento | Trigger | Datos |
|--------|---------|-------|
| `job_apply_start` | Click en Postularme | jobId |
| `job_apply_complete` | Postulación enviada | jobId |
| `linkedin_click` | Click en Ver en LinkedIn | — |
| `contact_click` | Click en contacto | method (LinkedIn/Instagram/Email) |
| `login` | Google Sign-In exitoso | method: google |
| `dark_mode_toggle` | Toggle dark mode | mode |

**Measurement ID:** `G-JWQWYY5WTQ`
**Dashboard:** https://analytics.google.com → Lupyx Talent

---

## App Check (Bot Protection)

Firebase App Check con reCAPTCHA v3 verifica que cada request viene de nuestra app legítima.

- **Frontend:** `initializeAppCheck()` en `src/lib/firebase.ts` genera tokens automáticamente
- **listJobs:** verifica App Check antes de ejecutar (bloquea curl/bots)
- **authMiddleware:** verifica App Check antes de verificar auth token (protege TODOS los endpoints autenticados)
- **Requests sin App Check token:** reciben 403 sin ejecutar lógica ni consumir Firestore

### Setup
1. Firebase Console → App Check → Registrar app con reCAPTCHA v3
2. Google reCAPTCHA Admin → Crear site key v3 con dominios autorizados
3. Frontend: inicializar con `ReCaptchaV3Provider(siteKey)`
4. Functions: `verifyAppCheck(req)` antes de procesar

---

## Cost Protection

### maxInstances
Todas las Cloud Functions tienen `maxInstances: 1` (excepto `listJobs: 2`).
Esto limita el costo máximo a ~$3/mes incluso bajo ataque sostenido 24/7.

Requests que exceden la capacidad reciben 429 automáticamente de Cloud Run (sin ejecutar código).

---

## Rate Limiting

Todas las Cloud Functions están protegidas con rate limiting **in-memory** (costo $0).

### Límites por endpoint

| Endpoint | Max requests | Ventana | Identificador |
|----------|-------------|---------|---------------|
| `listJobs` (público) | 60 | 1 min | IP |
| `submitApplication` | 3 | 15 min | userId |
| `userProfile` | 20 | 1 min | userId |
| `getNotifications` | 30 | 1 min | userId |
| Admin endpoints | 10-30 | 1 min | userId |

### Comportamiento
- Request permitido → headers `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Request bloqueado → HTTP 429 con `retryAfter` en body
- Error en rate limiter → fail open (permite request, loguea error)
- Contadores in-memory (Map<>), se resetean en cold starts
- Costo del rate limiting: $0 (no usa Firestore)

---

## Auth Flow

### OAuth Redirect URIs (Google Cloud Console)

Los siguientes URIs deben estar registrados en Google Cloud Console → Credentials → OAuth 2.0 Client:

```
https://lupyxtalent.com/__/auth/handler
https://www.lupyxtalent.com/__/auth/handler
https://lupyx-talent.firebaseapp.com/__/auth/handler
```

Sin estos, el login falla con `redirect_uri_mismatch` (Error 400).

### Flujo

1. Usuario clickea "Iniciar sesión" → Google Sign-In popup
2. Firebase Auth genera ID token
3. Frontend envía token en `Authorization: Bearer <token>`
4. Cloud Function verifica con `verifyIdToken()`
5. Chequea allowlist en Firestore (cache 5min)
6. Retorna datos o 401/403

## Backup

**Estado: DESACTIVADO** (sin datos de producción, evita costos innecesarios).

Implementado en `functions/src/backup.ts`. Para activar: descomentar export en `index.ts` y deploy. Ver issue #99.

---

## Deploy Pipeline

```
PR → Lint + TypeCheck + 56 Tests → Build → Merge → Auto-deploy Firebase Hosting
Functions: manual `firebase deploy --only functions` (o agregar al CI)
```

## Resumen de protecciones

| Capa | Implementación | Costo |
|------|---------------|-------|
| maxInstances: 1 | Todas las functions | $0 |
| App Check (reCAPTCHA v3) | Frontend + Cloud Functions | $0 |
| Rate limiting in-memory | Todas las functions | $0 |
| Auth middleware + allowlist | Endpoints protegidos | $0 |
| Input validation/sanitization | Todos los campos | $0 |
| Firestore/Storage rules deny-all | Config | $0 |
| Security headers (CSP, HSTS, etc.) | firebase.json | $0 |
| Dependabot | GitHub | $0 |
| Budget alerts | Google Cloud | $0 |

**Costo fijo mensual sin tráfico: $0.** Costo máximo bajo ataque: ~$3/mes.

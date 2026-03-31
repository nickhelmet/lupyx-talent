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

## Rate Limiting

Todas las Cloud Functions están protegidas con rate limiting basado en Firestore.

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
- Contadores almacenados en `rate_limits/` collection en Firestore

---

## Auth Flow

1. Usuario clickea "Iniciar sesión" → Google Sign-In popup
2. Firebase Auth genera ID token
3. Frontend envía token en `Authorization: Bearer <token>`
4. Cloud Function verifica con `verifyIdToken()`
5. Chequea allowlist en Firestore (cache 5min)
6. Retorna datos o 401/403

## Deploy Pipeline

```
PR → Lint + TypeCheck + Build → Merge → Auto-deploy Firebase Hosting
```

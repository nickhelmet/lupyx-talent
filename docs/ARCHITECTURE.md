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

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

## Cloud Functions (34)

### Public
| Función | Método | Auth | Descripción |
|---------|--------|------|-------------|
| `listJobs` | GET | App Check | Lista jobs activos (público, cache 5min) |
| `subscribe` | POST | No | Suscripción email newsletter |
| `sitemap` | GET | No | Genera sitemap.xml dinámico |

### User (auth required)
| Función | Método | Auth | Descripción |
|---------|--------|------|-------------|
| `submitApplication` | POST | Sí | Enviar postulación + auto-crear candidato en talent pool |
| `listApplications` | GET | Sí | Mis postulaciones (filtra comentarios internos) |
| `withdrawApplication` | POST | Sí | Retirar postulación en estado PENDING |
| `userProfile` | GET/POST | Sí | Ver/actualizar perfil |
| `getNotifications` | GET | Sí | Lista notificaciones del usuario |
| `markNotificationRead` | POST | Sí | Marcar notificación como leída |

### Admin — Jobs
| Función | Método | Auth | Descripción |
|---------|--------|------|-------------|
| `createJob` | POST | Admin | Crear búsqueda |
| `updateJob` | POST | Admin | Editar búsqueda |
| `updateJobStatus` | POST | Admin | Cambiar estado (ACTIVE/PAUSED/CLOSED) |
| `adminListJobs` | GET | Admin | Lista todas las búsquedas |

### Admin — Applications
| Función | Método | Auth | Descripción |
|---------|--------|------|-------------|
| `adminListApplications` | GET | Admin | Lista todas las postulaciones |
| `updateApplicationStatus` | POST | Admin | Cambiar estado + historial |
| `addInterviewNotes` | POST | Admin | Notas de entrevista |
| `manageInterviewRounds` | POST | Admin | Agendar/gestionar rondas de entrevista |
| `addComment` | POST | Admin | Comentarios (públicos + internos) |
| `getApplicationDetail` | POST | Admin | Detalle con comentarios y CV analysis |
| `deleteApplication` | POST | Admin | Eliminar postulación + CV de Storage + audit log |
| `fraudAnalysis` | POST | Admin | Análisis de fraude (duplicados, CVs sospechosos) |

### Admin — Candidates (Talent Pool)
| Función | Método | Auth | Descripción |
|---------|--------|------|-------------|
| `listCandidates` | GET | Admin | Lista candidatos enriquecidos (applications + perfil + CV analysis) |
| `addCandidate` | POST | Admin | Agregar candidato manual |
| `deleteCandidate` | POST | Admin | Eliminar candidato |

### Admin — Users & Config
| Función | Método | Auth | Descripción |
|---------|--------|------|-------------|
| `listUsers` | GET | Admin | Lista usuarios |
| `updateUserRole` | POST | Admin | Cambiar rol (USER/ADMIN) |
| `toggleUserStatus` | POST | Admin | Activar/desactivar usuario |
| `adminDashboard` | GET | Admin | Stats: pending apps, totals |
| `adminUsage` | GET | Admin | Métricas: Firestore, Storage, Gemini |
| `getAllowlist` | GET | Admin | Ver allowlist |
| `addAllowlistEmail` | POST | Admin | Agregar email a allowlist |
| `removeAllowlistEmail` | POST | Admin | Remover email de allowlist |

### Admin — AI & Files
| Función | Método | Auth | Descripción |
|---------|--------|------|-------------|
| `analyzeCv` | POST | Admin | Análisis CV con Gemini 2.5 Flash (CEFR, match %, seniority) |
| `downloadCv` | POST | Admin | Descarga segura de CV (signed URL) |

## Firestore Collections

```
users/{uid}              → Perfil de usuario, rol, preferencias
jobs/{jobId}             → Búsquedas laborales (title, slug, status, tags)
applications/{appId}     → Postulaciones (status, CV, scores, comments, statusHistory)
candidates/{candidateId} → Talent pool (skills, tags, source, matchHistory, cvAnalysis)
notifications/{notifId}  → Notificaciones por usuario
config/allowlist         → admin_emails[], blocked_emails[]
usage_counters/gemini_*  → Contadores de invocaciones Gemini por día
```

## Firestore Indexes

Firestore crea índices automáticos para queries de un solo campo. Queries que combinan filtro + orden en campos distintos requieren un **índice compuesto** creado manualmente.

### Índices del proyecto

| Collection | Campos | Tipo | Usado por |
|-----------|--------|------|-----------|
| `jobs` | `status` ASC + `postedDate` DESC | Compuesto | `listJobs` — jobs activos por fecha |
| `applications` | `userId` ASC + `appliedAt` DESC | Compuesto | `listApplications` — postulaciones de un usuario |
| `applications` | `email` ASC + `appliedAt` DESC | Compuesto | `listCandidates` — postulaciones por email del candidato |

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

Los índices tardan 2-5 minutos en crearse. Verificar estado:
```bash
gcloud firestore indexes composite list --project=lupyx-talent
```

### Cuándo se necesitan

| Query | Índice necesario |
|-------|-----------------|
| `where("status", "==", "ACTIVE")` | No (automático) |
| `orderBy("postedDate", "desc")` | No (automático) |
| `where("status", "==", "ACTIVE").orderBy("postedDate", "desc")` | **Sí** (compuesto) |
| `where("userId", "==", uid).orderBy("appliedAt", "desc")` | **Sí** (compuesto) |
| `where("email", "==", x).orderBy("appliedAt", "desc")` | **Sí** (compuesto) |

---

## Páginas (14)

| Ruta | Tipo | Auth | Descripción |
|------|------|------|-------------|
| `/` | Landing pública | No | Hero, búsquedas, valores, FAQ, CTA |
| `/busquedas` | Lista pública | No | Búsquedas activas con filtros |
| `/busquedas/[slug]` | Detalle SSG | No | Detalle de búsqueda + Schema.org JobPosting |
| `/postular/[slug]` | Formulario | Sí | Formulario postulación + upload CV |
| `/nosotros` | Info pública | No | Valores, proceso, stats |
| `/privacidad` | Legal | No | Política de privacidad |
| `/terminos` | Legal | No | Términos de servicio |
| `/auth/signin` | Login | No | Google Sign-In + returnUrl |
| `/mi-cuenta` | Perfil | Sí | Datos personales + mis postulaciones |
| `/admin` | Dashboard | Admin | Stats, pendientes, métricas |
| `/admin/jobs` | CRUD | Admin | Lista, crear, editar, pausar búsquedas |
| `/admin/applications` | Gestión | Admin | Postulaciones: status, entrevistas, CV analysis, comments, delete |
| `/admin/candidates` | Talent pool | Admin | Candidatos: agregar, buscar, filtrar, detalle enriquecido |
| `/admin/users` | Gestión | Admin | Usuarios: roles, activar/desactivar, exportar CSV |
| `/admin/allowlist` | Config | Admin | Emails autorizados + bloqueados |
| `/admin/usage` | Monitoreo | Admin | Firestore, Storage, Gemini, gráficos 30 días |

## Tests: 167 (73 frontend + 94 functions)

### Frontend (73 tests, 10 files)
```bash
npm test   # desde raíz
```
- Type definitions, environment, analytics
- CSV export, status/education/source labels
- Candidate search, tag filters, pagination
- Admin API filters, status distribution
- TypeWriter, base64 conversion, App Check

### Cloud Functions (94 tests, 9 files)
```bash
cd functions && npx vitest run
```
- Validation: sanitize, email, phone, DNI, education, PDF magic bytes
- Integration: XSS, NoSQL injection, overflow, enum whitelist, scores
- CORS: origins, headers, methods
- Rate limiter: limits, counters, headers
- Applications: duplicate check, CV upload validation
- Candidates: validation, sanitization, path traversal protection
- Comments: internal flag, author
- Subscribe: deduplication, XSS
- Status history: timeline, transitions, days between changes
- Admin usage: metrics, PDF validation

### CI Pipeline (GitHub Actions)
```
PR/push → [lint-typecheck] ─┐
          [test-frontend]  ──┼─→ [build] ─→ [deploy] (only on merge to main)
          [test-functions] ──┘
```
4 jobs en paralelo → build solo si todos pasan → auto-deploy a Firebase Hosting.

---

## Analytics

Firebase Analytics con eventos custom:

| Evento | Trigger | Datos |
|--------|---------|-------|
| `job_apply_start` | Click en Postularme | jobId |
| `job_apply_complete` | Postulación enviada | jobId |
| `linkedin_click` | Click en Ver en LinkedIn | — |
| `contact_click` | Click en contacto | method |
| `login` | Google Sign-In exitoso | method: google |
| `dark_mode_toggle` | Toggle dark mode | mode |

---

## App Check (Bot Protection)

Firebase App Check con reCAPTCHA v3 en **modo monitor** (logs warnings, permite requests).

- Frontend: `initializeAppCheck()` genera tokens automáticamente
- Functions: `verifyAppCheck(req)` loguea si falta token pero no bloquea
- Header: `X-Firebase-AppCheck` en todas las requests

---

## Cost Protection (7 capas)

| Capa | Implementación | Costo |
|------|---------------|-------|
| maxInstances: 1 | Todas las functions | $0 |
| App Check (reCAPTCHA v3) | Frontend + Cloud Functions | $0 |
| Rate limiting in-memory | Todas las functions | $0 |
| Auth middleware + allowlist | Endpoints protegidos | $0 |
| Input validation/sanitization | Todos los campos | $0 |
| Firestore/Storage rules deny-all | Config | $0 |
| Security headers (CSP, HSTS, etc.) | firebase.json | $0 |

**Costo fijo mensual sin tráfico: $0.** Costo máximo bajo ataque: ~$3/mes.

---

## Auth Flow

### OAuth Redirect URIs
```
https://lupyxtalent.com/__/auth/handler
https://www.lupyxtalent.com/__/auth/handler
https://lupyx-talent.firebaseapp.com/__/auth/handler
```

### Flujo
1. Usuario clickea "Iniciar sesión" → Google Sign-In popup
2. Firebase Auth genera ID token
3. Frontend envía token en `Authorization: Bearer <token>`
4. Cloud Function verifica con `verifyIdToken()`
5. Chequea allowlist en Firestore (cache 5min)
6. Retorna datos o 401/403

---

## Rate Limiting

In-memory (Map<>), costo $0, se resetea en cold starts.

| Endpoint | Max requests | Ventana | Identificador |
|----------|-------------|---------|---------------|
| `listJobs` (público) | 60 | 1 min | IP |
| `submitApplication` | 3 | 15 min | userId |
| `userProfile` | 20 | 1 min | userId |
| `getNotifications` | 30 | 1 min | userId |
| Admin endpoints | 10-30 | 1 min | userId |

---

## Backup

**Estado: DESACTIVADO** (sin datos de producción significativos, evita costos). Implementado en `functions/src/backup.ts`. Ver issue #99.

---

## Dependabot

- **npm (root):** dependencias frontend — semanal
- **npm (functions/):** dependencias Cloud Functions — semanal
- **GitHub Actions:** workflows — semanal

---

*Última actualización: Abril 2026*

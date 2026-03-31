# Firebase + React SPA Project Guide

Guía genérica y reutilizable para crear proyectos web con Firebase. Actualizada en base a la implementación de proyectos reales.

## Índice

1. [Branding](#branding)
2. [Arquitectura](#arquitectura)
3. [Stack tecnológico](#stack-tecnológico)
4. [Estructura del proyecto](#estructura-del-proyecto)
4. [Setup inicial](#setup-inicial)
5. [Firebase Configuration](#firebase-configuration)
6. [Autenticación](#autenticación)
7. [Firestore (Base de datos)](#firestore)
8. [Firebase Storage](#firebase-storage)
9. [Cloud Functions](#cloud-functions)
10. [Hosting y Deploy](#hosting-y-deploy)
11. [Modo mantenimiento](#modo-mantenimiento)
12. [Seguridad](#seguridad)
13. [CI/CD Pipeline](#cicd-pipeline)
14. [Docker para desarrollo local](#docker-para-desarrollo-local)
15. [Monitoreo y Alertas](#monitoreo-y-alertas)
16. [Costos y Quotas](#costos-y-quotas)
17. [Checklist de lanzamiento](#checklist-de-lanzamiento)

---

## Branding

Cada proyecto necesita identidad visual definida antes de empezar a codear.

### Logo
- Colocar logo principal en `public/logo.jpg` (o .png/.svg)
- Usar en: Header (navbar), Hero (prominente), Footer (pequeño), Maintenance page, Favicon, OG Image
- Tamaños recomendados: Header 40-48px height, Hero 80-112px, Footer 40px, Favicon 32x32/192x192

### Paleta de colores
Definir en `globals.css` como variables CSS y Tailwind theme:

```css
@theme inline {
  --color-brand-dark: #XXXXXX;     /* Texto fuerte, headers */
  --color-brand-secondary: #XXXXXX; /* Texto secundario */
  --color-brand-soft: #XXXXXX;      /* Backgrounds suaves, badges */
  --color-brand-accent: #XXXXXX;    /* CTAs, highlights, links activos */
  --color-brand-white: #FFFFFF;      /* Fondo principal */
}
```

**Regla:** Nunca usar colores hex directos en componentes. Siempre referenciar las variables de tema para facilitar cambios globales.

### Tipografía
- **Fuente principal:** Definir en `layout.tsx` con `next/font/google`
- **Recomendadas:** Geist (moderna, técnica), Inter (legible), DM Sans (amigable)
- **Jerarquía:** H1 bold 4xl-7xl, H2 bold 3xl-4xl, body regular lg, small text sm
- **Letter spacing:** -0.02em en títulos grandes para mayor impacto

### Recursos
- `public/logo.jpg` — Logo principal
- `public/og-image.jpg` — Open Graph image (1200x630px)
- `public/favicon.ico` — Favicon
- Iconos: Lucide React (tree-shakeable, consistente)

---

## Arquitectura

```
┌─────────────────────────────────┐
│    Firebase Hosting (CDN)       │
│    React/Next.js SPA            │
│    Static export (out/)         │
└──────────────┬──────────────────┘
               │ /api/* rewrites
┌──────────────▼──────────────────┐
│    Cloud Functions (Node 22)    │
│    Auth middleware + API        │
└──────┬───────────┬──────────────┘
       │           │
┌──────▼─────┐ ┌──▼──────────────┐
│ Firestore  │ │ Firebase Storage │
│  (NoSQL)   │ │   (Archivos)    │
└────────────┘ └─────────────────┘
       │
┌──────▼─────┐
│  Firebase  │
│    Auth    │
└────────────┘
```

**Principios:**
- Frontend 100% estático (SPA exportada), servida desde CDN
- Backend serverless (Cloud Functions), escala automáticamente
- Base de datos NoSQL (Firestore), sin servidor que mantener
- Auth delegada a Firebase (Google, email/password, etc.)
- Archivos en Storage con acceso solo via Admin SDK
- Todo corre en el free tier (Spark plan) para proyectos pequeños/medianos

---

## Stack tecnológico

| Componente | Tecnología | Por qué |
|------------|-----------|---------|
| Frontend | Next.js + React + Tailwind CSS | SSG/SPA con export estático, DX excelente |
| Animaciones | Framer Motion | Animaciones declarativas, performantes |
| Iconos | Lucide React | Lightweight, tree-shakeable |
| Auth | Firebase Auth | Gratis hasta 50k MAU, Google Sign-In nativo |
| Database | Cloud Firestore | Serverless, realtime, generous free tier |
| Storage | Firebase Storage | Integrado con Auth, CDN incluido |
| Backend | Cloud Functions (Node 22) | Serverless, auto-scale, pay-per-use |
| Hosting | Firebase Hosting | CDN global, SSL gratis, custom domains |
| CI/CD | GitHub Actions | Integrado con GitHub, free para repos públicos |
| Dev local | Docker + Firebase Emulators | Reproduce prod localmente |

---

## Estructura del proyecto

```
proyecto/
├── src/                    # Frontend (Next.js)
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks (useAuth, etc.)
│   ├── lib/               # Config (firebase.ts, utils)
│   ├── services/          # API client functions
│   └── types/             # TypeScript definitions
├── functions/             # Cloud Functions (backend)
│   ├── src/
│   │   ├── index.ts       # Exports all functions
│   │   ├── authMiddleware.ts
│   │   └── [feature].ts   # Feature-specific functions
│   ├── package.json
│   └── tsconfig.json
├── docs/                  # Documentación
├── firebase.json          # Firebase config (hosting, rewrites, headers)
├── .firebaserc            # Project ID
├── firestore.rules        # Deny all client access
├── storage.rules          # Deny all client access
├── docker-compose.yml     # Firebase Emulators para dev
├── next.config.ts         # output: 'export' para static
├── .env.example           # Template de variables
└── .github/workflows/ci.yml
```

---

## Setup inicial

### 1. Crear proyecto Next.js
```bash
npx create-next-app@latest mi-proyecto --typescript --tailwind --eslint --app --src-dir --yes
cd mi-proyecto
npm install framer-motion lucide-react firebase
```

### 2. Configurar Next.js para export estático
```typescript
// next.config.ts
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
};
```

### 3. Crear proyecto Firebase
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Crear proyecto (o usar existente)
firebase projects:create mi-proyecto-id

# Inicializar
firebase init
# Seleccionar: Hosting, Firestore, Storage, Emulators
# Public directory: out
# Single-page app: Yes
```

### 4. Archivos Firebase mínimos

**firebase.json:**
```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
        ]
      }
    ],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  },
  "firestore": { "rules": "firestore.rules" },
  "storage": { "rules": "storage.rules" },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "hosting": { "port": 5002 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

**firestore.rules** y **storage.rules:**
```
rules_version = '2';
// Deny ALL client access - only via Admin SDK in Cloud Functions
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Firebase Configuration

```typescript
// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

**.env.example:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## Autenticación

### Setup en Firebase Console

Antes de que el login funcione, configurar en Firebase Console:

#### 1. Habilitar proveedor Google
- Firebase Console → Authentication → **Sign-in method** → **Get started**
- Click **Google** → **Enable**
- Nombre público del proyecto (lo que ven los usuarios en el popup)
- Email de soporte (cuenta de admin)
- **Save**

#### 2. Agregar dominios autorizados
- Firebase Console → Authentication → **Settings** → **Authorized domains**
- Verificar que están:
  - `tu-proyecto.web.app` (automático)
  - `tu-proyecto.firebaseapp.com` (automático)
- Agregar manualmente:
  - `tudominio.com`
  - `www.tudominio.com`
  - `localhost` (para desarrollo)

> **Sin esto, el popup de Google Sign-In falla con error de redirect_uri.** Es un paso fácil de olvidar.

#### 3. Usar dominio custom en el popup de Google (importante)

Por defecto, el popup de Google Sign-In muestra `tu-proyecto.firebaseapp.com`.
Para que muestre tu dominio custom:

```
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tudominio.com    # ← NO firebaseapp.com
```

Esto funciona porque Firebase Hosting sirve `/__/auth/handler` en tu dominio custom.
Sin este cambio, los usuarios ven "Ir a tu-proyecto.firebaseapp.com" en el popup.

#### 4. Configurar pantalla de consentimiento OAuth (opcional)
- Google Cloud Console → APIs & Services → OAuth consent screen
- Agregar logo, nombre de app, links de privacidad
- Solo necesario si querés personalizar lo que ven los usuarios en el popup

### Allowlist: restringir acceso a usuarios autorizados

Para sitios en desarrollo o acceso controlado, usar una allowlist en Firestore:

```
config/allowlist
├── allowed_emails: ["user1@gmail.com", "user2@gmail.com"]  ← quién puede acceder
├── admin_emails: ["admin@example.com"]                      ← quién es admin
├── blocked_emails: []                                       ← bloqueados explícitamente
```

**Lógica en authMiddleware:**
1. Si `allowed_emails` está vacío → acceso abierto (público)
2. Si tiene emails → solo esos pueden usar las Cloud Functions
3. `blocked_emails` siempre tiene prioridad (deny > allow)
4. `admin_emails` otorga rol admin en la respuesta de auth

**Para abrir al público:** vaciar `allowed_emails` en Firestore.

**Seed de datos:** Siempre incluir la allowlist en el script de seed para que nuevos ambientes arranquen con los usuarios correctos.

---

### Patrón: Firebase Auth + Cloud Functions verification

**Frontend (hook):**
```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
  const logout = () => signOut(auth);

  return { user, loading, loginWithGoogle, logout };
}
```

**Backend (Cloud Function middleware):**
```typescript
// functions/src/authMiddleware.ts
import { getAuth } from "firebase-admin/auth";

export async function verifyAuth(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}
```

---

## Firestore

### Diseño de modelo de datos NoSQL

**Reglas de oro:**
1. Denormalizar datos que se leen juntos frecuentemente
2. Usar subcollections para relaciones 1:N con datos grandes
3. Guardar counters denormalizados para dashboards (evitar count queries)
4. IDs de documentos: usar auto-ID o slugs legibles
5. Timestamps: siempre como strings ISO o Firestore Timestamp

**Ejemplo estructura:**
```
users/{uid}           → perfil de usuario
  /experiences/{id}   → subcollection de experiencias

items/{itemId}        → items principales
  /subItems/{id}      → subcollection

config/settings       → configuración global (allowlist, etc.)
```

---

## Admin Panel

### Patrón: Layout protegido con sidebar

```
src/app/admin/
├── layout.tsx       → Auth gate + sidebar + header
├── page.tsx         → Dashboard con stats cards
├── jobs/page.tsx    → CRUD de items principales
├── items/page.tsx   → Gestión de subrecursos
└── users/page.tsx   → Gestión de usuarios
```

**Principios:**
1. Layout verifica auth y rol admin — redirige a login si no autenticado
2. Sidebar con navegación, colapsable en mobile
3. Cada página es un `"use client"` component con su propio estado
4. Stats en dashboard usan counters denormalizados en Firestore (no queries costosos)
5. Tablas con búsqueda, filtros y paginación
6. Acciones destructivas requieren confirmación
7. Dark mode en todos los componentes admin

### User panel (candidatos)

Ruta `/mi-cuenta` con:
- Perfil (datos de Google + campos extra)
- Historial de postulaciones con estado
- Auth-gated pero sin rol admin

---

## Firebase Storage

**Patrón: upload via Cloud Function (no directo del cliente)**

```typescript
// Cloud Function que recibe archivo y lo sube a Storage
import { getStorage } from "firebase-admin/storage";

const bucket = getStorage().bucket();

async function uploadFile(buffer: Buffer, path: string, contentType: string) {
  const file = bucket.file(path);
  await file.save(buffer, { contentType, metadata: { cacheControl: "public, max-age=31536000" } });
  return file.publicUrl();
}
```

**Seguridad:**
- Validar tipo MIME y magic bytes del archivo
- Limitar tamaño máximo
- Generar nombres de archivo seguros (nunca usar input del usuario)
- Storage rules: `allow read, write: if false` (solo Admin SDK)

---

## Hosting y Deploy

### Deploy manual
```bash
# Build frontend
npm run build

# Deploy todo
firebase deploy

# Deploy solo hosting
firebase deploy --only hosting

# Deploy solo firestore rules
firebase deploy --only firestore:rules
```

### Dominio custom (con Cloudflare)

#### 1. Agregar dominio principal en Firebase
- Firebase Console → Hosting → **Add custom domain** → `tudominio.com`
- Firebase genera un TXT de verificación y registros A

#### 2. Configurar DNS en Cloudflare
Ir a Cloudflare Dashboard → tu dominio → DNS → Records:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| TXT | `@` | `hosting-site=tu-proyecto-id` | — |
| TXT | `_acme-challenge` | (valor de Firebase para SSL) | — |
| A | `@` | (IP que da Firebase, ej: `199.36.158.100`) | **DNS only** |
| CNAME | `www` | `tu-proyecto.web.app` | **DNS only** |

> **IMPORTANTE:** El proxy de Cloudflare debe estar **APAGADO** (nube gris / "DNS only") en los registros A y CNAME. Si queda proxied (nube naranja), Firebase no puede generar el certificado SSL.

#### 3. Agregar www en Firebase
- Firebase Console → Hosting → **Add custom domain** → `www.tudominio.com`
- Configurar como redirect a dominio principal

#### 4. Configurar SSL en Cloudflare
- Cloudflare → SSL/TLS → seleccionar **"Full"** o **"Full (strict)"**
- **Nunca** usar "Flexible" con Firebase

#### 5. Verificación
- SSL tarda entre 5 min y 1 hora en generarse
- Verificar con: `curl -sI https://tudominio.com | head -5`
- Debe retornar HTTP 200 con headers de seguridad

#### Tiempos de propagación
| Registro | Propagación típica |
|----------|-------------------|
| TXT (verificación) | 1-5 minutos |
| A (dominio principal) | 5-30 minutos |
| CNAME (www) | 5-60 minutos |
| SSL (Let's Encrypt) | 5 min - 1 hora |

---

## Modo mantenimiento

Patrón para proteger el sitio durante desarrollo sin necesidad de backend:

```typescript
// Componente MaintenanceGate
// - Visitante normal ve "Sitio en construcción"
// - Equipo accede con ?preview=SECRET_KEY en la URL
// - La key se guarda en localStorage para sesiones futuras
// - Para quitar: eliminar MaintenanceGate del layout
```

**Acceso equipo:** `https://tusitio.com?preview=TU_CLAVE_SECRETA`

---

## Seguridad

### Checklist de seguridad mínima
- [ ] Firestore rules: deny all client access
- [ ] Storage rules: deny all client access
- [ ] Cloud Functions: verificar auth token en endpoints protegidos
- [ ] CORS: solo dominios propios
- [ ] Security headers en firebase.json (X-Frame-Options, CSP, etc.)
- [ ] Input validation con Zod en Cloud Functions
- [ ] Rate limiting por IP/usuario
- [ ] No secrets en código (usar env vars o Secret Manager)
- [ ] .env en .gitignore
- [ ] Firebase App Check habilitado (producción)

---

## Analytics

### Firebase Analytics setup

```typescript
// src/lib/analytics.ts
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";

// Lazy init — only in browser, only if supported
export async function trackEvent(name: string, params?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  if (!(await isSupported())) return;
  const analytics = getAnalytics();
  logEvent(analytics, name, params);
}
```

**Eventos recomendados:** `page_view`, `login`, `sign_up`, item-specific views/actions, external link clicks.

**Cookie consent:** Implementar banner opt-in antes de inicializar analytics (GDPR/LGPD).

---

## Testing

### Vitest config

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

**Estrategia:**
1. Type definition tests (validar que los tipos son correctos)
2. Utility function tests (pure functions)
3. Component render tests (básicos, no snapshot)
4. Cloud Functions tests (en `functions/` con su propio vitest)
5. CI corre `npm test` en cada PR

---

## CI/CD Pipeline

### GitHub Actions (referencia)
```yaml
name: CI/CD
on:
  pull_request: { branches: [main] }
  push: { branches: [main] }

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test

  build:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run build

  deploy:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: tu-proyecto-id
```

---

## Docker para desarrollo local

```yaml
# docker-compose.yml
services:
  dev:
    image: node:22-alpine
    container_name: miproyecto-dev
    working_dir: /app
    ports:
      - "3000:3000"   # Next.js dev
      - "4000:4000"   # Emulator UI
      - "5001:5001"   # Functions
      - "8080:8080"   # Firestore
      - "9099:9099"   # Auth
      - "9199:9199"   # Storage
    volumes:
      - .:/app
      - node_modules:/app/node_modules
    command: sh -c "npm install && npx firebase emulators:start & npm run dev"

volumes:
  node_modules:
```

---

## Rate Limiting

### Patrón: Firestore-backed rate limiter

```typescript
// Guardar contadores por IP/usuario en Firestore
// Documento: rate_limits/{endpoint}_{identifier}
// Campos: count, resetAt, updatedAt
// Lógica: si count >= max o window expiró → reset/deny
```

**Configuración por endpoint:**
| Endpoint | Max requests | Window |
|----------|-------------|--------|
| submitApplication | 3 | 15 min |
| listJobs (público) | 60 | 1 min |
| Admin endpoints | 30 | 1 min |

**Headers de respuesta:** `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Input Validation

- Sanitizar strings: strip HTML tags, entities, limit length
- Validar email, phone, DNI con regex
- Validar enums contra listas whitelist
- PDF: verificar magic bytes (`%PDF`)
- Nunca confiar en input del cliente — validar en Cloud Functions

---

## Backup y Recovery

### Firestore scheduled export
```typescript
// Cloud Function scheduled: daily at 3am
// Exporta todas las collections a gs://proyecto-backups/firestore/YYYY-MM-DD
// Requiere: @google-cloud/firestore y permisos de export
```

**Retención:** 30 días. **RPO:** < 24 horas. **RTO:** < 1 hora.

---

## Ambientes

| Ambiente | Firebase | Descripción |
|----------|----------|-------------|
| **Development** | Emulators (local) | Docker containers, datos de seed |
| **Staging** | Preview channels | Automático en PRs, URL temporal |
| **Production** | Proyecto principal | Dominio custom, App Check, rate limiting |

Detección automática en `src/lib/environment.ts` basada en env vars.

---

## Costos y Quotas

### Firebase Spark Plan (gratis)
| Servicio | Límite gratis |
|----------|--------------|
| Hosting | 10 GB storage, 360 MB/day transfer |
| Firestore | 50k reads, 20k writes, 20k deletes /day, 1 GB storage |
| Storage | 5 GB storage, 1 GB/day download |
| Auth | 50k MAU |
| Functions (Blaze) | 2M invocations/month, 400k GB-sec |

### Estrategia de costos
1. Empezar en Spark plan (gratis, sin tarjeta)
2. Migrar a Blaze cuando necesites Cloud Functions
3. Configurar budget alerts ($5, $10, $25)
4. Poner maxInstances en cada Cloud Function
5. Monitorear quotas en Firebase Console

---

## Checklist de lanzamiento

### Pre-launch
- [ ] Dominio custom configurado con SSL
- [ ] Security headers configurados
- [ ] Firestore y Storage rules en deny-all
- [ ] Firebase Auth providers habilitados
- [ ] Cloud Functions deployadas
- [ ] App Check habilitado
- [ ] Budget alerts configurados
- [ ] CI/CD pipeline funcionando
- [ ] Tests pasando
- [ ] Analytics configurado

### Post-launch
- [ ] Verificar uptime y latency
- [ ] Verificar que analytics recolecta datos
- [ ] Monitorear costos en primeras 48hs
- [ ] Verificar que rate limiting funciona
- [ ] Probar flujo completo como usuario nuevo

---

*Última actualización: Marzo 2026 — basada en implementación de Lupyx Talent*

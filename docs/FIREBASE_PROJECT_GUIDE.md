# Firebase + React SPA Project Guide

Guía genérica y reutilizable para crear proyectos web con Firebase. Actualizada en base a la implementación de proyectos reales.

## Índice

1. [Arquitectura](#arquitectura)
2. [Stack tecnológico](#stack-tecnológico)
3. [Estructura del proyecto](#estructura-del-proyecto)
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

### Dominio custom
1. En Firebase Console → Hosting → Add custom domain
2. Configurar DNS según instrucciones (A records o CNAME)
3. SSL se configura automáticamente
4. Redirect www → dominio principal

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

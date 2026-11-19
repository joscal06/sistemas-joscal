# Sistemas Joscal — Administración de servicios

Sitio web y panel de administración de **Sistemas Joscal**, un emprendimiento que ofrece desarrollo web a la medida,
MEAL y tableros de indicadores, automatización de procesos e inteligencia artificial a ONG, centros educativos, PYMES y
emprendimientos. *"La tecnología se adapta a tus procesos, no al revés."*

- **Aplicación en producción (Vercel):** `PENDIENTE: pegar aquí la URL de Vercel`
- **Repositorio:** https://github.com/joscal06/sistemas-joscal

> **Sobre el despliegue.** La aplicación se preparó para **AWS Amplify + DynamoDB** (configuración incluida y
> documentada abajo), pero la cuenta de AWS no pudo activarse sin registrar una tarjeta de crédito. Por eso se publicó
> en **Vercel** con **Upstash Redis** como base de datos (ambos gratuitos y sin tarjeta). El código elige el
> almacenamiento según las variables de entorno, así que pasar a Amplify + DynamoDB no requiere cambios.

## Funcionalidades

**Sitio público (`/`)**

- Propuesta de valor, las cuatro líneas de trabajo y la metodología de cinco pasos.
- Catálogo de servicios y planes mensuales **leídos desde la base de datos** (lo que se marca como público en el panel).
- Formulario para solicitar un diagnóstico gratuito de 30 minutos, que crea una solicitud en el panel.

**Panel de administración (`/admin`, con inicio de sesión)**

| Módulo | Qué permite |
| --- | --- |
| Tablero | Cobrado en el mes contra el punto de equilibrio ($2,400), saldo por cobrar y vencido, ingreso recurrente mensual, clientes activos, proyectos en curso, tickets y solicitudes; gráfico de cobros de 6 meses, avance hacia la meta anual e ingresos por línea de servicio. |
| Clientes | Alta, edición y ficha de cada cliente (segmento, contacto, estado) con sus contratos, cobros y tickets. |
| Servicios | Catálogo con línea, tipo de cobro (proyecto, paquete o mensual), rango de precios y visibilidad en el sitio. |
| Contratos y proyectos | Contratos de pago único o mensual con código correlativo (`C-2026-001`), avance, fechas y **plan de pagos automático** (anticipo del 50 % + saldo, o primera cuota). |
| Pagos y facturación | Cobros pendientes, vencidos y pagados; registro de pagos con método y fecha; **recibo imprimible** con correlativo (`R-000001`); generación de las cuotas del mes de todos los contratos mensuales sin duplicar. |
| Solicitudes | Solicitudes que llegan del sitio: marcar como contactada, descartar o **convertir en cliente**. |
| Soporte | Tickets con número correlativo (`T-0001`), prioridad, estado y conversación de respuestas. |

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Components, Server Actions, Middleware) |
| Lenguaje y estilos | TypeScript estricto, Tailwind CSS 4 |
| Base de datos | **Upstash Redis** en producción (Vercel); **Amazon DynamoDB** (AWS SDK v3) listo para Amplify; memoria en desarrollo |
| Autenticación | Cookie `httpOnly` con JWT firmado (HS256, `jose`), verificada en el middleware y en cada Server Action |
| Validación | Zod en todas las acciones del servidor |
| Despliegue | **Vercel** (SSR) con despliegue continuo desde la rama `main`; `amplify.yml` listo para **AWS Amplify Hosting** |

## Arquitectura

```
Navegador ──HTTPS──▶ Vercel (CDN + funciones SSR de Next.js)      ·  alternativa: AWS Amplify Hosting
                         │  Server Components / Server Actions
                         ▼
                   Upstash Redis (REST)                           ·  alternativa: Amazon DynamoDB
```

El navegador nunca habla con la base de datos: toda lectura y escritura pasa por el servidor de Next.js, a través de
una interfaz `Store` (`src/lib/store.ts`) con tres implementaciones:

- **Redis (Upstash):** un hash por entidad (`sj:cliente`, `sj:pago`…; campo = id, valor = JSON) y un hash
  `sj:contador` para los correlativos con `HINCRBY` (atómico). Si la base está vacía, la primera visita carga los
  datos de ejemplo una sola vez (protegido con `SET NX`).
- **DynamoDB:** **una sola tabla** con clave de partición `pk` (tipo de entidad) y clave de ordenamiento `sk` (id).
  Listar una entidad es un `Query` por `pk`, y los correlativos usan un contador atómico (`UpdateItem ... ADD`).
- **Memoria:** datos de ejemplo para desarrollo sin servicios externos.

## Variables de entorno

Están documentadas en [`.env.example`](.env.example). El archivo `.env` real **nunca** se sube al repositorio.

| Variable | Uso |
| --- | --- |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Upstash Redis. Vercel las crea solas al conectar la base desde *Storage* (también se aceptan `UPSTASH_REDIS_REST_URL` / `_TOKEN`). |
| `DB_TABLE` | Nombre de la tabla de DynamoDB (`sistemas-joscal`) |
| `DB_REGION` | Región de la tabla (`us-east-1`) |
| `DB_ACCESS_KEY_ID` / `DB_SECRET_ACCESS_KEY` | *Opcionales.* En Amplify no hacen falta: se usa el rol de cómputo. Solo para ejecutar en local contra DynamoDB real. Amplify no permite variables que empiecen con `AWS`, por eso el prefijo `DB_`. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciales del panel |
| `SESSION_SECRET` | Secreto de al menos 32 caracteres para firmar la sesión |
| `NEXT_PUBLIC_SITE_URL` | URL pública (metadatos Open Graph) |
| `DATA_STORE` | Opcional: `memory` fuerza datos de ejemplo en memoria; `redis` ignora `DB_TABLE`. Por defecto: DynamoDB si hay `DB_TABLE`, si no Redis si hay credenciales, si no memoria. |

## Ejecutar en local

Requisitos: Node.js 20 o superior.

```bash
git clone https://github.com/joscal06/sistemas-joscal.git
cd sistemas-joscal
npm install
cp .env.example .env.local   # completa ADMIN_*, SESSION_SECRET y, si no tienes AWS, pon DATA_STORE=memory
npm run dev                  # http://localhost:3000  ·  panel en /admin
```

Con `DATA_STORE=memory` la aplicación arranca con datos de ejemplo (sin AWS). Para producción: `npm run build && npm start`.

## Despliegue en Vercel (producción actual)

1. **Importar el repositorio.** Vercel → *Add New → Project* → `sistemas-joscal`. Detecta Next.js; no hay que cambiar
   nada del build.
2. **Variables de entorno** (antes de *Deploy*): `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET` y
   `NEXT_PUBLIC_SITE_URL`.
3. **Base de datos.** En el proyecto → *Storage* → *Create Database* → **Upstash for Redis** (plan gratuito) →
   conectar al proyecto. Vercel agrega `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
4. **Redesplegar** (*Deployments → Redeploy*) para que tome las variables nuevas. La primera visita carga los datos
   de ejemplo.

## Despliegue alternativo en AWS Amplify + DynamoDB

1. **Tabla de DynamoDB.** Consola de AWS → DynamoDB → *Create table*: nombre `sistemas-joscal`, clave de partición
   `pk` (String), clave de ordenamiento `sk` (String), capacidad *On-demand*.
2. **Rol de cómputo con permisos mínimos (sin claves).** IAM → *Roles* → *Create role* → *Custom trust policy* con
   [`docs/amplify-compute-trust.json`](docs/amplify-compute-trust.json), y una política en línea con
   [`docs/iam-policy.json`](docs/iam-policy.json) (reemplaza `<ID_DE_CUENTA>`). Así el servidor de Next.js obtiene
   credenciales temporales y no hay claves de acceso guardadas en ningún lado.
3. **Conectar el repositorio.** AWS Amplify → *Create new app* → GitHub → repositorio `sistemas-joscal`, rama `main`.
   Amplify detecta Next.js y usa el [`amplify.yml`](amplify.yml) del repositorio. En *App settings → IAM roles*
   elegir el rol del paso 2 como **Compute role**.
4. **Variables de entorno.** En *Advanced settings* (o luego en *Hosting → Environment variables*) agregar
   `DB_TABLE`, `DB_REGION`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET` y `NEXT_PUBLIC_SITE_URL`.
   *(Alternativa: un usuario IAM con la misma política y sus claves en `DB_ACCESS_KEY_ID` / `DB_SECRET_ACCESS_KEY`.)*
5. **Desplegar** y abrir la URL `https://main.<id>.amplifyapp.com`. Si la tabla está vacía, entrar a `/admin` y pulsar
   **Cargar datos de ejemplo**.

> **Detalle importante de Amplify:** las variables de la consola solo existen durante el *build*. Para que el servidor
> de Next.js las lea en tiempo de ejecución, `amplify.yml` las copia a `.env.production` antes de `npm run build`.

## Estructura

```
src/
├── app/
│   ├── page.tsx                 # Sitio público
│   ├── acciones-publicas.ts     # Server Action del formulario de diagnóstico
│   └── admin/
│       ├── acciones.ts          # Server Actions del panel (validadas con Zod)
│       ├── login/               # Inicio de sesión
│       └── (panel)/             # Tablero, clientes, servicios, contratos, pagos, solicitudes, soporte
├── components/                  # Formularios, tablas, navegación
├── lib/
│   ├── store.ts                 # Acceso a datos: Redis, DynamoDB o memoria
│   ├── datos.ts                 # Consultas e indicadores del tablero
│   ├── seed.ts                  # Datos de ejemplo basados en el modelo de negocio
│   ├── auth.ts / session.ts     # Sesión con cookie httpOnly + JWT
│   └── types.ts                 # Modelo de datos
└── middleware.ts                # Protege /admin
```

## Seguridad

- Sesión en cookie `httpOnly`, `SameSite=Lax` y `Secure` en producción; nada sensible en el navegador.
- Las claves de AWS solo existen en el servidor y el usuario IAM solo puede operar sobre una tabla.
- Comparación de credenciales en tiempo constante y validación de toda entrada con Zod.
- Encabezados `X-Frame-Options`, `X-Content-Type-Options` y `Referrer-Policy`.
- Los clientes y datos de ejemplo son ficticios.

---

Autor: José Manuel Calderón González

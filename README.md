# Sistemas Joscal — Administración de servicios

Sitio web y panel de administración de **Sistemas Joscal**, un emprendimiento que ofrece desarrollo web a la medida,
MEAL y tableros de indicadores, automatización de procesos e inteligencia artificial a ONG, centros educativos, PYMES y
emprendimientos. *"La tecnología se adapta a tus procesos, no al revés."*

- **Aplicación en producción (AWS Amplify):** `PENDIENTE: pegar aquí la URL de Amplify`
- **Repositorio:** https://github.com/joscal06/sistemas-joscal

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
| Base de datos | **Amazon DynamoDB** (servicio gestionado, modo bajo demanda) con AWS SDK v3 |
| Autenticación | Cookie `httpOnly` con JWT firmado (HS256, `jose`), verificada en el middleware y en cada Server Action |
| Validación | Zod en todas las acciones del servidor |
| Despliegue | **AWS Amplify Hosting** (SSR) con despliegue continuo desde la rama `main` |

## Arquitectura

```
Navegador ──HTTPS──▶ AWS Amplify Hosting (CDN + cómputo SSR de Next.js)
                         │  Server Components / Server Actions
                         ▼
                   Amazon DynamoDB  ── tabla "sistemas-joscal"
```

El navegador nunca habla con la base de datos: toda lectura y escritura pasa por el servidor de Next.js.
Se usa **una sola tabla** con clave de partición `pk` (tipo de entidad: `cliente`, `servicio`, `contrato`, `pago`,
`solicitud`, `ticket`, `contador`) y clave de ordenamiento `sk` (id). Listar una entidad es un `Query` por `pk`, y los
correlativos usan un contador atómico (`UpdateItem ... ADD`).

## Variables de entorno

Están documentadas en [`.env.example`](.env.example). El archivo `.env` real **nunca** se sube al repositorio.

| Variable | Uso |
| --- | --- |
| `DB_TABLE` | Nombre de la tabla de DynamoDB (`sistemas-joscal`) |
| `DB_REGION` | Región de la tabla (`us-east-1`) |
| `DB_ACCESS_KEY_ID` / `DB_SECRET_ACCESS_KEY` | Claves de un usuario IAM con permisos solo sobre la tabla. Amplify no permite variables que empiecen con `AWS`, por eso el prefijo `DB_`. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciales del panel |
| `SESSION_SECRET` | Secreto de al menos 32 caracteres para firmar la sesión |
| `NEXT_PUBLIC_SITE_URL` | URL pública (metadatos Open Graph) |
| `DATA_STORE` | `memory` fuerza datos de ejemplo en memoria (solo desarrollo) |

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

## Despliegue en AWS Amplify

1. **Tabla de DynamoDB.** Consola de AWS → DynamoDB → *Create table*: nombre `sistemas-joscal`, clave de partición
   `pk` (String), clave de ordenamiento `sk` (String), capacidad *On-demand*.
2. **Usuario IAM con permisos mínimos.** IAM → *Users* → *Create user* → adjuntar una política en línea con
   [`docs/iam-policy.json`](docs/iam-policy.json) (reemplaza `<ID_DE_CUENTA>`). Crear una *access key* para
   "Application running outside AWS".
3. **Conectar el repositorio.** AWS Amplify → *Create new app* → GitHub → repositorio `sistemas-joscal`, rama `main`.
   Amplify detecta Next.js y usa el [`amplify.yml`](amplify.yml) del repositorio.
4. **Variables de entorno.** En *Advanced settings* (o luego en *Hosting → Environment variables*) agregar las
   variables de la tabla anterior.
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
│   ├── store.ts                 # Acceso a datos: DynamoDB o memoria
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

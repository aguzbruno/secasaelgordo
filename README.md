# Se casa el Gordo · Mendoza 26

PWA (Next.js + TypeScript + Tailwind) con info, itinerario y gastos de la despedida.

## Desarrollo

```bash
npm install
npm run dev
```

En desarrollo los gastos se guardan en `.data/db.json`.

## Producción (Vercel)

Los gastos se guardan en Upstash Redis. En Vercel: Storage / Marketplace → Upstash Redis, conectarlo al proyecto. Variables que lee la app:

- `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (también acepta `KV_REST_API_URL` y `KV_REST_API_TOKEN`)

Sin ellas, la API responde 503.

## Contenido

Todo lo editable (itinerario, vuelos, quinta, bodega, participantes, gastos fijos) está en `src/lib/trip.ts`.

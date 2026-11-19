import "server-only";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { Redis } from "@upstash/redis";
import type { EntityMap, EntityName } from "./types";
import { datosDeEjemplo } from "./seed";

/**
 * Almacenamiento de datos.
 *
 * - "dynamodb": una sola tabla de Amazon DynamoDB con clave de partición `pk` (tipo de entidad)
 *   y clave de ordenamiento `sk` (id). Listar una entidad es un Query por `pk`.
 * - "redis": Upstash Redis (base gratuita integrada con Vercel); ver RedisStore.
 * - "memory": datos en memoria con datos de ejemplo; solo para desarrollo local o demostración.
 */
export interface Store {
  readonly kind: "dynamodb" | "redis" | "memory";
  list<E extends EntityName>(entity: E): Promise<EntityMap[E][]>;
  get<E extends EntityName>(entity: E, id: string): Promise<EntityMap[E] | null>;
  put<E extends EntityName>(entity: E, item: EntityMap[E]): Promise<void>;
  remove(entity: EntityName, id: string): Promise<void>;
  /** Contador atómico para correlativos (contratos, recibos, tickets) */
  next(counter: string): Promise<number>;
}

type Row = { id: string } & Record<string, unknown>;

class MemoryStore implements Store {
  readonly kind = "memory" as const;
  private data = new Map<string, Map<string, Row>>();
  private counters = new Map<string, number>();

  constructor() {
    const seed = datosDeEjemplo();
    for (const [entity, rows] of Object.entries(seed.entidades)) {
      const m = new Map<string, Row>();
      for (const r of rows as unknown as Row[]) m.set(r.id, structuredClone(r));
      this.data.set(entity, m);
    }
    for (const [k, v] of Object.entries(seed.contadores)) this.counters.set(k, v);
  }

  private table(entity: string) {
    let t = this.data.get(entity);
    if (!t) {
      t = new Map();
      this.data.set(entity, t);
    }
    return t;
  }
  async list<E extends EntityName>(entity: E) {
    return [...this.table(entity).values()].map((r) => structuredClone(r)) as unknown as EntityMap[E][];
  }
  async get<E extends EntityName>(entity: E, id: string) {
    const r = this.table(entity).get(id);
    return r ? (structuredClone(r) as unknown as EntityMap[E]) : null;
  }
  async put<E extends EntityName>(entity: E, item: EntityMap[E]) {
    this.table(entity).set(item.id, structuredClone(item) as unknown as Row);
  }
  async remove(entity: EntityName, id: string) {
    this.table(entity).delete(id);
  }
  async next(counter: string) {
    const n = (this.counters.get(counter) ?? 0) + 1;
    this.counters.set(counter, n);
    return n;
  }
}

class DynamoStore implements Store {
  readonly kind = "dynamodb" as const;
  private doc: DynamoDBDocumentClient;

  constructor(private tableName: string) {
    const accessKeyId = process.env.DB_ACCESS_KEY_ID;
    const secretAccessKey = process.env.DB_SECRET_ACCESS_KEY;
    const client = new DynamoDBClient({
      region: process.env.DB_REGION || "us-east-1",
      // Si no hay claves explícitas se usa la cadena de credenciales por defecto
      // (por ejemplo, el rol de cómputo de Amplify).
      credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
    });
    this.doc = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }

  async list<E extends EntityName>(entity: E) {
    const items: EntityMap[E][] = [];
    let ExclusiveStartKey: Record<string, unknown> | undefined;
    do {
      const res = await this.doc.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: "pk = :pk",
          ExpressionAttributeValues: { ":pk": entity },
          ExclusiveStartKey,
        }),
      );
      for (const it of res.Items ?? []) items.push(strip(it) as unknown as EntityMap[E]);
      ExclusiveStartKey = res.LastEvaluatedKey;
    } while (ExclusiveStartKey);
    return items;
  }
  async get<E extends EntityName>(entity: E, id: string) {
    const res = await this.doc.send(
      new GetCommand({ TableName: this.tableName, Key: { pk: entity, sk: id } }),
    );
    return res.Item ? (strip(res.Item) as unknown as EntityMap[E]) : null;
  }
  async put<E extends EntityName>(entity: E, item: EntityMap[E]) {
    await this.doc.send(
      new PutCommand({ TableName: this.tableName, Item: { pk: entity, sk: item.id, ...item } }),
    );
  }
  async remove(entity: EntityName, id: string) {
    await this.doc.send(
      new DeleteCommand({ TableName: this.tableName, Key: { pk: entity, sk: id } }),
    );
  }
  async next(counter: string) {
    const res = await this.doc.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { pk: "contador", sk: counter },
        UpdateExpression: "ADD valor :uno",
        ExpressionAttributeValues: { ":uno": 1 },
        ReturnValues: "UPDATED_NEW",
      }),
    );
    return Number(res.Attributes?.valor ?? 1);
  }
}

/**
 * Redis (Upstash, integrado con Vercel): un hash por entidad (`sj:<entidad>`, campo = id, valor = JSON)
 * y un hash `sj:contador` para los correlativos (HINCRBY es atómico). La primera vez que se usa una base
 * vacía carga los datos de ejemplo, una sola vez, protegida con `SET NX`.
 */
class RedisStore implements Store {
  readonly kind = "redis" as const;
  private redis: Redis;
  private listo: Promise<void> | null = null;

  constructor(url: string, token: string) {
    this.redis = new Redis({ url, token });
  }

  private key(entity: string) {
    return `sj:${entity}`;
  }

  private preparar() {
    this.listo ??= (async () => {
      const primero = await this.redis.set("sj:sembrado", new Date().toISOString(), { nx: true });
      if (primero !== "OK") return;
      const seed = datosDeEjemplo();
      const p = this.redis.pipeline();
      for (const [entity, rows] of Object.entries(seed.entidades)) {
        if (!rows.length) continue;
        p.hset(this.key(entity), Object.fromEntries((rows as unknown as Row[]).map((r) => [r.id, r])));
      }
      p.hset("sj:contador", seed.contadores);
      await p.exec();
    })().catch((e) => {
      this.listo = null;
      throw e;
    });
    return this.listo;
  }

  async list<E extends EntityName>(entity: E) {
    await this.preparar();
    const all = await this.redis.hgetall<Record<string, Row>>(this.key(entity));
    return Object.values(all ?? {}) as unknown as EntityMap[E][];
  }
  async get<E extends EntityName>(entity: E, id: string) {
    await this.preparar();
    const r = await this.redis.hget<Row>(this.key(entity), id);
    return (r ?? null) as unknown as EntityMap[E] | null;
  }
  async put<E extends EntityName>(entity: E, item: EntityMap[E]) {
    await this.preparar();
    await this.redis.hset(this.key(entity), { [item.id]: item });
  }
  async remove(entity: EntityName, id: string) {
    await this.preparar();
    await this.redis.hdel(this.key(entity), id);
  }
  async next(counter: string) {
    await this.preparar();
    return this.redis.hincrby("sj:contador", counter, 1);
  }
}

function strip(item: Record<string, unknown>) {
  const { pk: _pk, sk: _sk, ...rest } = item;
  void _pk;
  void _sk;
  return rest;
}

const g = globalThis as unknown as { __sjStore?: Store };

export function getStore(): Store {
  if (g.__sjStore) return g.__sjStore;
  const forced = process.env.DATA_STORE;
  const table = process.env.DB_TABLE;
  // Vercel (Upstash Redis del Marketplace) define KV_REST_API_*; Upstash directo usa UPSTASH_REDIS_REST_*.
  const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (forced === "memory") g.__sjStore = new MemoryStore();
  else if (table && forced !== "redis") g.__sjStore = new DynamoStore(table);
  else if (redisUrl && redisToken) g.__sjStore = new RedisStore(redisUrl, redisToken);
  else g.__sjStore = new MemoryStore();
  return g.__sjStore;
}

/** Carga los datos de ejemplo en el almacenamiento actual (para una tabla de DynamoDB vacía). */
export async function cargarDatosDeEjemplo() {
  const store = getStore();
  const seed = datosDeEjemplo();
  for (const [entity, rows] of Object.entries(seed.entidades)) {
    for (const r of rows) await store.put(entity as EntityName, r as never);
  }
  // Ajusta los contadores para que los correlativos continúen después de los datos de ejemplo
  for (const [k, v] of Object.entries(seed.contadores)) {
    let n = 0;
    while (n < v) n = await store.next(k);
  }
}

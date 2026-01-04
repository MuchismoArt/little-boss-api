import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/health", async () => {
  return { ok: true, name: "little-boss-api" };
});

app.listen({
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  host: "0.0.0.0"
});

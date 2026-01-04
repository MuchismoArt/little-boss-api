import Fastify from "fastify";

const app = Fastify({ logger: true });

/**
 * CORS minimal (utile pour Flutter Web / tests navigateur)
 */
app.addHook("onSend", async (req, reply, payload) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type");
  return payload;
});

// Répond aux requêtes OPTIONS (préflight)
app.options("*", async (req, reply) => {
  reply.code(204).send();
});

/**
 * Données fake (MVP)
 */
const NANNIES = [
  {
    id: "n1",
    fullName: "Nina Martin",
    city: "Paris",
    yearsExp: 5,
    skills: ["bébé", "repas", "sorties"],
    hourlyRate: 12,
    available: true,
  },
  {
    id: "n2",
    fullName: "Sara Diallo",
    city: "Lyon",
    yearsExp: 2,
    skills: ["devoirs", "jeux", "anglais"],
    hourlyRate: 10,
    available: true,
  },
  {
    id: "n3",
    fullName: "Camille Bernard",
    city: "Paris",
    yearsExp: 8,
    skills: ["nouveau-né", "montessori", "premiers secours"],
    hourlyRate: 15,
    available: false,
  },
];

// Stockage temporaire en mémoire
const BOOKINGS = [];

/**
 * Health check
 */
app.get("/health", async () => {
  return { ok: true, name: "little-boss-api" };
});

/**
 * GET /nannies?city=Paris&skill=anglais
 */
app.get("/nannies", async (req) => {
  const { city, skill } = req.query ?? {};

  let list = NANNIES.filter((n) => n.available);

  if (city) {
    list = list.filter(
      (n) => n.city.toLowerCase() === String(city).toLowerCase()
    );
  }

  if (skill) {
    const s = String(skill).toLowerCase();
    list = list.filter((n) =>
      n.skills.some((k) => k.toLowerCase().includes(s))
    );
  }

  return { nannies: list };
});

/**
 * GET /nannies/:id
 */
app.get("/nannies/:id", async (req, reply) => {
  const { id } = req.params;
  const nanny = NANNIES.find((n) => n.id === id);

  if (!nanny) {
    reply.code(404);
    return { error: "Nanny not found" };
  }

  return nanny;
});

/**
 * POST /bookings
 * Body JSON:
 * {
 *   "nannyId": "n1",
 *   "familyName": "Famille Dupont",
 *   "startAt": "2026-01-10T18:00:00",
 *   "endAt": "2026-01-10T22:00:00",
 *   "message": "..."
 * }
 */
app.post("/bookings", async (req, reply) => {
  const { nannyId, familyName, startAt, endAt, message } = req.body || {};

  if (!nannyId || !familyName || !startAt || !endAt) {
    reply.code(400);
    return { error: "Missing required fields" };
  }

  const nanny = NANNIES.find((n) => n.id === nannyId);
  if (!nanny) {
    reply.code(404);
    return { error: "Nanny not found" };
  }

  const booking = {
    id: `b${BOOKINGS.length + 1}`,
    nannyId,
    familyName,
    startAt,
    endAt,
    message: message || "",
    status: "REQUESTED",
    createdAt: new Date().toISOString(),
  };

  BOOKINGS.push(booking);
  return booking;
});

/**
 * GET /bookings (debug)
 */
app.get("/bookings", async (req, reply) => {
  const { familyName, nannyId, status } = req.query || {};

  let results = [...BOOKINGS];

  if (familyName) {
    results = results.filter(
      (b) => (b.familyName || "").toLowerCase() === String(familyName).toLowerCase()
    );
  }

  if (nannyId) {
    results = results.filter((b) => b.nannyId === nannyId);
  }

  if (status) {
    results = results.filter((b) => b.status === status);
  }

  return { bookings: results };
});

app.listen({
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  host: "0.0.0.0",
});

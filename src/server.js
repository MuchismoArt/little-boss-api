import Fastify from "fastify";

const app = Fastify({ logger: true });

// Données fake (MVP) : on branchera la DB après
const NANNIES = [
  {
    id: "n1",
    fullName: "Nina Martin",
    city: "Paris",
    yearsExp: 5,
    skills: ["bébé", "repas", "sorties"],
    hourlyRate: 12,
    available: true
  },
  {
    id: "n2",
    fullName: "Sara Diallo",
    city: "Lyon",
    yearsExp: 2,
    skills: ["devoirs", "jeux", "anglais"],
    hourlyRate: 10,
    available: true
  },
  {
    id: "n3",
    fullName: "Camille Bernard",
    city: "Paris",
    yearsExp: 8,
    skills: ["nouveau-né", "montessori", "premiers secours"],
    hourlyRate: 15,
    available: false
  }
];

app.get("/health", async () => {
  return { ok: true, name: "little-boss-api" };
});

// GET /nannies?city=Paris&skill=anglais
app.get("/nannies", async (req) => {
  const { city, skill } = req.query ?? {};

  let list = NANNIES.filter(n => n.available);

  if (city) {
    list = list.filter(n => n.city.toLowerCase() === String(city).toLowerCase());
  }
  if (skill) {
    const s = String(skill).toLowerCase();
    list = list.filter(n => n.skills.some(k => k.toLowerCase().includes(s)));
  }

  return { nannies: list };
});

app.listen({
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  host: "0.0.0.0"
});
// GET /nannies/:id
app.get("/nannies/:id", async (req, reply) => {
  const { id } = req.params;
  const nanny = NANNIES.find(n => n.id === id);

  if (!nanny) {
    reply.code(404);
    return { error: "Nanny not found" };
  }

  return nanny;
});

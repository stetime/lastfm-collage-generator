import TTLCache from "@isaacs/ttlcache";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import getUser from "./lastfm";
import { WorkerPool } from "./lib/worker-pool";
import logger from "./utils/logger";

if (!process.env.LFMKEY) {
	logger.error("Last.fm API key not set in environment variables");
	process.exit(1);
}

if (!process.env.BASEURL) {
	logger.error("Last.fm API base URL not set in environment variables");
	process.exit(1);
}

const cache = new TTLCache<string, User>({ ttl: 1000 * 60 * 60 * 24 });
const validDurations = [
	"7day",
	"1month",
	"3month",
	"6month",
	"12month",
	"overall",
];

const pool = new WorkerPool(
	navigator.hardwareConcurrency ?? 4,
	new URL("./lib/collage-worker.ts", import.meta.url),
);

const app = new Hono();
const port = process.env.PORT || 3000;
app.use(serveStatic({ root: "./src/public" }));

app.get("/", async (c) =>
	c.html(await Bun.file("./src/public/home.html").text()),
);

app.get("/api/:username/:duration", async (c) => {
	const { username, duration } = c.req.param();
	if (!validDurations.includes(duration)) {
		return c.text(`invalid duration: ${duration}`, 400);
	}
	const cacheKey = `${username}:${duration}`;
	const cachedUser = cache.get(cacheKey);
	if (cachedUser) {
		logger.debug(`retrieving data from cache for ${cacheKey}`);
		logger.debug(`remaining TTL: ${cache.getRemainingTTL(cacheKey)}`);
		return c.json(cachedUser);
	}
	const user = await getUser(username, duration);
	if (!user) {
		return c.notFound();
	}
	user.b64 = await pool.run(user);
	cache.set(cacheKey, user);
	return c.json(user);
});

Bun.serve({
	fetch: app.fetch,
	port,
});

logger.info(`listening on port: ${port}`);

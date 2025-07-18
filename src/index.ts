import express from "express"
import path from "path"
import logger from "./utils/logger"
import getUser from "./lastfm"
import getCollage from "./collage"
import helmet from "helmet"
import limiter from "./middleware/rateLimit"
import unknownEndpoint from "./middleware/unknownEndpoint"
import TTLCache from "@isaacs/ttlcache"
import compression from "compression"
import PinoHttp from "pino-http"

if (!process.env.LFMKEY) {
  logger.error("Last.fm API key not set in environment variables")
  process.exit(1)
}

if (!process.env.BASEURL) {
  logger.error("Last.fm API base URL not set in environment variables")
  process.exit(1)
}

const cache = new TTLCache<String, User>({ ttl: 1000 * 60 * 60 * 24 })
const validDurations = [
  "7day",
  "1month",
  "3month",
  "6month",
  "12month",
  "overall",
]

const app = express()
const port = process.env.PORT || 3000
app.use(compression())
app.use(express.static(path.join(__dirname, "../src/public")))
app.use(helmet())
app.use(limiter)
app.use(PinoHttp())

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../src/public/home.html"))
})

app.get("/api/:username/:duration", async (req, res) => {
  const { username, duration } = req.params
  if (!validDurations.includes(duration)) {
    return res.status(400).send(`invalid duration: ${duration}`)
  }
  const cacheKey = `${username}:${duration}`
  const cachedUser = cache.get(cacheKey)
  if (cachedUser) {
    logger.debug(`retrieving data from cache for ${cacheKey}`)
    logger.debug(`remaining TTL: ${cache.getRemainingTTL(cacheKey)}`)
    return res.json(cachedUser)
  }
  const user = await getUser(username, duration)
  if (!user) {
    return res.status(404).end()
  }
  user.b64 = await getCollage(user)
  cache.set(cacheKey, user)
  res.json(user)
})

if (process.env.NODE_ENV === "development") {
  app.get("/image/:username/:duration", async (req, res) => {
    const { username, duration } = req.params
    const user = await getUser(username, duration)
    if (!user || user.albums.length === 0) {
      return res
        .status(404)
        .send(`no listening data for ${req.params.username}`)
    }
    const base64 = await getCollage(user)
    user.b64 = `data:image/png;base64,${base64}`
    const buffer = Buffer.from(user.b64.split(",")[1], "base64")
    res.type("jpeg")
    res.send(buffer)
  })
}

app.use(unknownEndpoint)

app.listen(port, () => {
  logger.info(`listening on port: ${port}`)
})

import express from 'express'
import path from 'path'
import logger from './utils/logger'
import getUser from './lastfm'
import getCollage from './collage'
import morgan from './middleware/morgan'
import limiter from './middleware/rateLimit'
import unknownEndpoint from './middleware/unknownEndpoint'
import TTLCache from '@isaacs/ttlcache'

const cache = new TTLCache<String, User>({ ttl: 1000 * 60 * 60 * 24 })

const app = express()
const port = 3000
app.use(express.static(path.join(__dirname, '../src/public')))
app.use(morgan)
app.use(limiter)

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/public/home.html'))
})

app.get('/api/:username/:duration', async (req, res) => {
  const { username, duration } = req.params
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

app.get('/image/:username/:duration', async (req, res) => {
  const { username, duration } = req.params
  const user = await getUser(username, duration)
  if (!user || user.albums.length === 0) {
    return res.status(404).send(`no listening data for ${req.params.username}`)
  }
  const base64 = await getCollage(user)
  user.b64 = `data:image/png;base64,${base64}`
  const buffer = Buffer.from(user.b64.split(',')[1], 'base64')
  res.type('jpeg')
  res.send(buffer)
})

app.use(unknownEndpoint)

app.listen(port, () => {
  logger.info('listening on 3000')
})

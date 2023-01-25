const config = require('./utils/config')
const express = require('express')
const middleware = require('./utils/middleware')
const lastfm = require('./lastfm')
const path = require('path')
const logger = require('./utils/logger')

const app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.use(middleware.morganMiddleware)

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/home.html'))
})

app.get('/api/:username/:duration', async (req, res) => {
  const { username, duration } = req.params
  const user = await lastfm.getTopAlbums(username, duration)
  if (!user) {
    return res.status(404).end()
  }
  user.b64 = await lastfm.generateCollage(user)
  res.json(user)
})

app.use(middleware.unknownEndpoint)
app.listen(config.PORT, () => {
  logger.info(`listening on ${config.PORT}`)
})

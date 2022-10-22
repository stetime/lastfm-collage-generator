const morgan = require('morgan')
const logger = require('./logger')

const morganMiddleware = morgan((tokens, req, res) => {
  const msg = [
    tokens['remote-addr'](req).substring(7),
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms',
  ].join(' ')
  logger.http(msg)
  return null
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

module.exports = {
  morganMiddleware,
  unknownEndpoint,
}

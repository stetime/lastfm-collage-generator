import morgan, { StreamOptions } from 'morgan'
import logger from '../utils/logger'

const stream: StreamOptions = {
  write: (message) =>
    logger.http(message.substring(0, message.lastIndexOf('\n'))),
}

function skip() {
  const env = process.env.NODE_ENV || 'development'
  return env !== 'development'
}

const morganMiddleware = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms :user-agent',
  { stream, skip }
)

export default morganMiddleware

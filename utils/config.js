process.env.NODE_ENV != 'production' && require('dotenv').config()
const { PORT, LFMKEY, BASEURL } = process.env

module.exports = {
  PORT,
  LFMKEY,
  BASEURL,
}

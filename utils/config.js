process.env.NODE_ENV === 'development' && require('dotenv').config()
const { PORT, LFMKEY, BASEURL } = process.env

module.exports = {
  PORT,
  LFMKEY,
  BASEURL,
}

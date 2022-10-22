const config = require('./utils/config')
const axios = require('axios')
const { createCanvas } = require('canvas')
const { createCollage } = require('@mtblc/image-collage')
const logger = require('./utils/logger')

const getTopAlbums = async (username, duration) => {
  const endpoint = `${config.BASEURL}&user=${username}&period=${duration}&api_key=${config.LFMKEY}&format=json`
  const response = await axios
    .get(endpoint)
    .catch((error) => error.response.data)
  if ('error' in response) {
    logger.error(response)
    return
  }
  const data = response.data.topalbums.album
  const user = { user: username }
  user.albums = data
    .map((album) => {
      return {
        artist: album.artist.name,
        name: album.name,
        image: album.image.filter((image) => image.size === 'extralarge')[0][
          '#text'
        ],
      }
    })
    .slice(0, 16)
  return user
}

const generateCollage = async (user) => {
  if (user.albums.length === 0) {
    return
  }
  const images = user.albums.map(
    (album) => album.image || generateFiller(album)
  )
  const canvas = await createCollage(images, 1200, 'image/jpeg')
  return canvas.toString('base64')
}

const generateFiller = (album) => {
  const width = 300
  const height = 300
  const canvas = createCanvas(width, height)
  const context = canvas.getContext('2d')
  context.fillStyle = '#000000'
  context.fillRect(0, 0, width, height)
  context.font = `10pt 'Unifont`
  context.fillStyle = '#fff'
  context.fillText(`${album.artist} - ${album.name}`, 05, 20)
  return canvas.toBuffer('image/jpeg')
}

module.exports = {
  getTopAlbums,
  generateCollage,
  generateFiller,
}

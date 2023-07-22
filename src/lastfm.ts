import logger from './utils/logger'
import axios from 'axios'
const { LFMKEY, BASEURL } = process.env

// fetch requested user / duration top albums and return a user object

async function getUser(username: string, duration: string) {
  const endpoint = `${BASEURL}&user=${username}&period=${duration}&api_key=${LFMKEY}&format=json`
  logger.debug(
    `attempting to fetch last.fm api data for user: ${username} - duration: ${duration}`
  )
  const response: LastfmResponse = await axios.get(endpoint)
  const albums = response.data.topalbums.album
  const user: User = { username: username, albums: [], b64: undefined }
  user.albums = albums
    .map((album) => {
      return {
        artist: album.artist.name,
        title: album.name,
        image: album.image.filter((image) => image.size === 'extralarge')[0][
          '#text'
        ],
      }
    })
    .slice(0, 16) // slice this according to size input
  return user
}

export default getUser

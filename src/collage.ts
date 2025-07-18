import Canvas from "canvas"
import { Buffer } from "buffer"
import logger from "./utils/logger"
import axios from "axios"

function getPlaceHolder(imageWidth: number, imageHeight: number) {
  const canvas = Canvas.createCanvas(imageWidth, imageHeight)
  const context = canvas.getContext("2d")
  context.fillStyle = "black"
  context.fillRect(0, 0, imageWidth, imageHeight)
  return canvas.toBuffer()
}

async function createCollage(user: User): Promise<string | undefined> {
  logger.debug(`album count: ${user.albums.length}`)
  let canvasSize = [1200, 1200]
  let imagesPerRow = 4
  if (user.albums.length < 16 && user.albums.length >= 12) {
    canvasSize = [1200, 900]
  }
  if (user.albums.length < 12) {
    canvasSize = [900, 900]
    imagesPerRow = 3
  }
  if (user.albums.length < 8) {
    canvasSize = [900, 600]
    imagesPerRow = 3
  }
  const [x, y] = canvasSize
  const canvas = Canvas.createCanvas(x, y)
  const ctx = canvas.getContext("2d")
  const imageWidth = 300
  const imageHeight = 300
  const imageUrls = user.albums.map((album) => album.image)
  if (imageUrls.length < 1) {
    return
  }

  const imageBuffers = await Promise.all(
    imageUrls.map(async (imageUrl) => {
      if (!imageUrl) {
        return getPlaceHolder(imageWidth, imageHeight)
      }
      try {
        const result = await axios.get(imageUrl, {
          responseType: "arraybuffer",
          timeout: 5000,
        })
        return Buffer.from(result.data, "binary")
      } catch (error) {
        logger.error(`failed to fetch image: ${imageUrl}`, error)
        return getPlaceHolder(imageWidth, imageHeight)
      }
    })
  )

  for (let i = 0; i < imageBuffers.length; i++) {
    const row = Math.floor(i / imagesPerRow)
    const col = i % imagesPerRow
    const buffer = imageBuffers[i]
    const img = await Canvas.loadImage(buffer)
    ctx.drawImage(
      img,
      col * imageWidth,
      row * imageHeight,
      imageWidth,
      imageHeight
    )
    const album = user.albums[i]
    if (album) {
      ctx.fillStyle = "white"
      ctx.font = "16px Unifont"
      ctx.textBaseline = "top"
      const artistX = col * imageWidth + 4
      const artistY = row * imageHeight + 0
      ctx.strokeText(album.artist, artistX, artistY)
      ctx.fillText(album.artist, artistX, artistY)
      ctx.font = "16px Unifont"
      const titleX = col * imageWidth + 4
      const titleY = row * imageHeight + 16
      ctx.strokeText(album.title, titleX, titleY)
      ctx.fillText(album.title, titleX, titleY)
    }
  }

  return canvas.toBuffer("image/jpeg", { quality: 1 }).toString("base64")
}

export default createCollage

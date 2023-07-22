import {AxiosResponse} from 'axios'
export {}

declare global {
  interface Album {
    artist: string
    title: string
    image: string | undefined
  }

  interface User {
    username: string
    albums: Array<Album>
    b64: string | undefined
  }

  interface LastfmAlbum {
    artist: {
      name: string
    }
    name: string
    image: {
      size: string
      '#text': string
    }[]
  }

  interface Fmdata {
    topalbums: {
      album: LastfmAlbum[]
    }
  }

  type LastfmResponse = AxiosResponse<Fmdata>
}
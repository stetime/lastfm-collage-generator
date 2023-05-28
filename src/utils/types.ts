import { AxiosResponse } from 'axios'
export interface Album {
  artist: string
  title: string
  image: string | undefined
}

export interface User {
  username: string
  albums: Array<Album>
  b64: string | undefined
}

export interface LastfmAlbum {
  artist: {
    name: string
  }
  name: string
  image: {
    size: string
    '#text': string
  }[]
}

export interface Fmdata {
  topalbums: {
    album: LastfmAlbum[]
  }
}

export type LastfmResponse = AxiosResponse<Fmdata>

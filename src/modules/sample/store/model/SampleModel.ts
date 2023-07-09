import { action, computed, observable, makeObservable } from 'mobx'
import { ArtistModel } from 'src/modules/artist/store'

export default class SampleModel {
  public id = 0

  public title = ''

  public duration = 0

  public playCount = 0

  public tags: string[] = []

  public url = ''

  public sampleFileCatalogId = 0

  public artistId = 0

  public artistUrlAlias = ''

  public artist = new ArtistModel()

  public artistName = ''

  constructor(initialData: SampleModel = null) {
    makeObservable(this, {
      id: observable,
      title: observable,
      duration: observable,
      playCount: observable,
      tags: observable,
      url: observable,
      sampleFileCatalogId: observable,
      artistId: observable,
      artistUrlAlias: observable,
      artist: observable,
      artistName: observable,
      setId: action,
      setTitle: action,
      setDuration: action,
      setTags: action,
      setUrl: action,
      setSampleFileCatalogId: action,
      setArtistId: action,
      setArtistName: action,
      setArtistUrlAlias: action,
      incrementPlayCount: action,
      asCreateJson: computed,
      asUpdateJson: computed,
    })

    if (initialData) {
      this.id = initialData.id
      this.title = initialData.title
      this.duration = initialData.duration
      this.playCount = initialData.playCount
      this.url = initialData.url
      this.sampleFileCatalogId = initialData.sampleFileCatalogId
      this.artistId = initialData.artistId
      this.artistUrlAlias = initialData.artistUrlAlias
      this.artistName = initialData.artistName
      this.artist = new ArtistModel(initialData.artist)

      const tags = new Array<string>()
      if (initialData.tags) {
        initialData.tags.map(tag => tags.push(tag))
      }

      this.tags = tags
    }
  }

  public setId = (id: number) => {
    this.id = id
  }

  public setTitle = (title: string) => {
    this.title = title
  }

  public setDuration = (duration: number) => {
    this.duration = duration
  }

  public setTags = (tags: string[]) => {
    this.tags = tags
  }

  public setUrl = (url: string) => {
    this.url = url
  }

  public setSampleFileCatalogId = (sampleFileCatalogId: number) => {
    this.sampleFileCatalogId = sampleFileCatalogId
  }

  public setArtistId = (artistId: number) => {
    this.artistId = artistId
  }

  public setArtistName = (artistName: string) => {
    this.artistName = artistName
  }

  public setArtistUrlAlias = (artistUrlAlias: string) => {
    this.artistUrlAlias = artistUrlAlias
  }

  public incrementPlayCount = () => {
    this.playCount += 1
  }

  get asCreateJson() {
    return {
      title: this.title,
      duration: this.duration,
      sampleFileCatalogId: this.sampleFileCatalogId,
      tags: this.tags,
    }
  }

  get asUpdateJson() {
    return { title: this.title, tags: this.tags }
  }
}

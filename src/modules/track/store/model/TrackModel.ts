import { action, computed, observable, makeObservable } from 'mobx'
import { ArtistModel } from 'src/modules/artist/store'
import GenreModel from 'src/modules/genre/store/model/GenreModel'
import InstrumentModel from 'src/modules/instrument/store/model/InstrumentModel'
import KeyModel from 'src/modules/key/store/model/KeyModel'
import PriceModel from 'src/modules/price/store/model/PriceModel'
import TagModel from 'src/modules/tag/store/model/TagModel'
export default class TrackModel {
  public id = 0

  public title = ''

  public producedBy = ''

  public writtenBy = ''

  public price: PriceModel = new PriceModel()

  public duration = 0

  public playCount = 0

  public genres: GenreModel[] = []

  public instruments: InstrumentModel[] = []

  public tags: TagModel[] = []

  public key: KeyModel = new KeyModel()

  public keyId = 0

  public status = 0

  public genreIds: number[] = []

  public instrumentIds: number[] = []

  public tagIds: number[] = []

  public url = ''

  public trackFileCatalogId = 0

  public artworkFileCatalogId = 0

  public artworkUrl = ''

  public artist = new ArtistModel()

  public artistId = 0

  public artistUrlAlias = ''

  public artistName = ''

  public createdDate = new Date()

  public updatedDate = new Date()

  constructor(initialData: TrackModel = null) {
    makeObservable(this, {
      id: observable,
      title: observable,
      producedBy: observable,
      writtenBy: observable,
      price: observable,
      duration: observable,
      playCount: observable,
      genres: observable,
      instruments: observable,
      tags: observable,
      key: observable,
      keyId: observable,
      status: observable,
      genreIds: observable,
      instrumentIds: observable,
      tagIds: observable,
      url: observable,
      trackFileCatalogId: observable,
      artworkFileCatalogId: observable,
      artworkUrl: observable,
      artist: observable,
      artistId: observable,
      artistUrlAlias: observable,
      artistName: observable,
      createdDate: observable,
      updatedDate: observable,
      setId: action,
      setTitle: action,
      setDuration: action,
      setGenres: action,
      setInstruments: action,
      setTags: action,
      setStatus: action,
      setArtworkFileCatalogId: action,
      setArtworkUrl: action,
      setUrl: action,
      setTrackFileCatalogId: action,
      setArtistId: action,
      setArtistName: action,
      setArtistUrlAlias: action,
      setPrice: action,
      setKey: action,
      incrementPlayCount: action,
      statusLabel: computed,
      asCreateJson: computed,
      asUpdateJson: computed,
    })

    if (initialData) {
      this.id = initialData.id
      this.title = initialData.title
      this.producedBy = initialData.producedBy
      this.writtenBy = initialData.writtenBy
      this.duration = initialData.duration
      this.playCount = initialData.playCount
      this.genreIds = initialData.genreIds
      this.url = initialData.url
      this.trackFileCatalogId = initialData.trackFileCatalogId
      this.artworkFileCatalogId = initialData.artworkFileCatalogId
      this.artworkUrl = initialData.artworkUrl
      this.artistId = initialData.artistId
      this.artistUrlAlias = initialData.artistUrlAlias
      this.artistName = initialData.artistName
      this.keyId = initialData.keyId
      this.status = initialData.status
      this.artist = new ArtistModel(initialData.artist)
      this.price = new PriceModel(initialData.price)
      this.updatedDate = new Date(initialData.updatedDate)
      this.createdDate = new Date(initialData.createdDate)

      const genreIds = new Array<number>()
      const genres = new Array<GenreModel>()

      if (initialData.genres) {
        initialData.genres.map(genre => {
          genres.push(new GenreModel(genre))
          genreIds.push(genre.id)
        })
      }
      this.genres = genres
      this.genreIds = genreIds

      const instrumentIds = new Array<number>()
      const instruments = new Array<InstrumentModel>()

      if (initialData.instruments) {
        initialData.instruments.map(instrument => {
          instruments.push(new InstrumentModel(instrument))
          instrumentIds.push(instrument.id)
        })
      }
      this.instruments = instruments
      this.instrumentIds = instrumentIds

      const tagIds = new Array<number>()
      const tags = new Array<TagModel>()

      if (initialData.tags) {
        initialData.tags.map(tag => {
          tags.push(new TagModel(tag))
          tagIds.push(tag.id)
        })
      }
      this.tags = tags
      this.tagIds = tagIds

      if (initialData.key) {
        this.key = new KeyModel(initialData.key)
      }
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

  public setStatus = (status: number) => {
    this.status = status
  }

  public setGenres = (genres: GenreModel[]) => {
    const genreIds = new Array<number>()
    const newGenres = new Array<GenreModel>()

    if (genres) {
      genres.map(genre => {
        newGenres.push(new GenreModel(genre))
        genreIds.push(genre.id)
      })
    }

    this.genres = newGenres
    this.genreIds = genreIds
  }

  public setInstruments = (instruments: InstrumentModel[]) => {
    const instrumentIds = new Array<number>()
    const newInstruments = new Array<InstrumentModel>()

    if (instruments) {
      instruments.map(instrument => {
        newInstruments.push(new InstrumentModel(instrument))
        instrumentIds.push(instrument.id)
      })
    }
    this.instruments = newInstruments
    this.instrumentIds = instrumentIds
  }

  public setTags = (tags: TagModel[]) => {
    const tagIds = new Array<number>()
    const newTags = new Array<TagModel>()

    if (tags) {
      tags.map(tag => {
        newTags.push(new TagModel(tag))
        tagIds.push(tag.id)
      })
    }
    this.tags = newTags
    this.tagIds = tagIds
  }

  public setArtworkFileCatalogId = (artworkFileCatalogId: number) => {
    this.artworkFileCatalogId = artworkFileCatalogId
  }

  public setArtworkUrl = (artworkUrl: string) => {
    this.artworkUrl = artworkUrl
  }

  public setUrl = (url: string) => {
    this.url = url
  }

  public setTrackFileCatalogId = (trackFileCatalogId: number) => {
    this.trackFileCatalogId = trackFileCatalogId
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

  public setPrice = (price: number) => {
    const newPrice = new PriceModel(this.price)
    newPrice.updatePrice(price)
    this.price = newPrice
  }

  public setKey = (key: KeyModel) => {
    if (key) {
      this.keyId = key.id
      this.key = new KeyModel(key)
    }
  }

  public incrementPlayCount = () => {
    this.playCount += 1
  }

  get statusLabel() {
    switch (this.status) {
      case TrackStatus.Unpublished:
        return 'Unpublished'
      case TrackStatus.Published:
        return 'Published'
      case TrackStatus.Archived:
        return 'Archived'
      default:
        return 'N/A'
    }
  }

  get asCreateJson() {
    return {
      title: this.title,
      duration: this.duration,
      trackFileCatalogId: this.trackFileCatalogId,
      genreIds: this.genreIds,
      instrumentIds: this.instrumentIds,
      tagIds: this.tagIds,
      artworkFileCatalogId: this.artworkFileCatalogId,
      producedBy: this.producedBy,
      writtenBy: this.writtenBy,
      keyId: this.keyId,
      ...this.price.asJson,
    }
  }

  get asUpdateJson() {
    return {
      title: this.title,
      genreIds: this.genreIds,
      instrumentIds: this.instrumentIds,
      tagIds: this.tagIds,
      artworkFileCatalogId: this.artworkFileCatalogId,
      producedBy: this.producedBy,
      writtenBy: this.writtenBy,
      keyId: this.keyId,
      status: this.status,
      ...this.price.asJson,
    }
  }
}

export enum TrackStatus {
  NA = 0,
  Unpublished = 1,
  Published = 2,
  Archived = 3,
}

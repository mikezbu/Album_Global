import { action, computed, observable, makeObservable } from 'mobx'

import { ArtistModel } from 'src/modules/artist/store'
import PriceModel from 'src/modules/price/store/model/PriceModel'
import { SampleModel } from 'src/modules/sample/store'
import { TrackModel } from 'src/modules/track/store'

export enum CollectionType {
  NA = 0,
  Sample = 1,
  Track = 2,
}

export default class CollectionModel {
  public id = 0

  public type: number = CollectionType.NA

  public name = ''

  public description = ''

  public status = CollectionStatus.NA

  public price: PriceModel = new PriceModel()

  public albumArtUrl = ''

  public albumArtFileCatalogId = 0

  public samples = observable.map<number, SampleModel>()

  public tracks = observable.map<number, TrackModel>()

  public artists = new Array<ArtistModel>()

  public sampleIds = new Array<number>()

  public trackIds = new Array<number>()

  constructor(initialData: CollectionModel = null) {
    makeObservable(this, {
      id: observable,
      type: observable,
      name: observable,
      description: observable,
      status: observable,
      price: observable,
      albumArtUrl: observable,
      albumArtFileCatalogId: observable,
      samples: observable,
      tracks: observable,
      artists: observable,
      sampleIds: observable,
      trackIds: observable,
      setStatus: action,
      updateProperty: action,
      setAlbumArtUrl: action,
      setAlbumArtFileCatalogId: action,
      setSamples: action,
      setTracks: action,
      statusLabel: computed,
      getCreateJson: computed,
      getUpdateJson: computed,
    })

    if (initialData) {
      this.id = initialData.id
      this.type = initialData.type
      this.name = initialData.name
      this.description = initialData.description
      this.status = initialData.status
      this.albumArtUrl = initialData.albumArtUrl
      this.albumArtFileCatalogId = initialData.albumArtFileCatalogId

      if (initialData.samples) {
        const sampleIds = new Array<number>()
        this.samples.clear()

        Object.values(initialData.samples).forEach((element: any) => {
          if (element && element[1] && element[1].id) {
            this.samples.set(element[1].id, new SampleModel(element[1]))
            sampleIds.push(element[1].id)
          } else if (element && element.id) {
            this.samples.set(element.id, new SampleModel(element))
            sampleIds.push(element.id)
          }
        })

        this.sampleIds = sampleIds
      }

      if (initialData.tracks) {
        const trackIds = new Array<number>()
        this.tracks.clear()

        Object.values(initialData.tracks).forEach((element: any) => {
          if (element && element[1] && element[1].id) {
            this.tracks.set(element[1].id, new TrackModel(element[1]))
            trackIds.push(element[1].id)
          } else if (element && element.id) {
            this.tracks.set(element.id, new TrackModel(element))
            trackIds.push(element.id)
          }
        })

        this.trackIds = trackIds
      }

      if (initialData.artists) {
        const artists = new Array<ArtistModel>()
        initialData.artists.forEach((element: ArtistModel) => {
          artists.push(new ArtistModel(element))
        })
        this.artists = artists
      }

      if (initialData.price) {
        this.price = new PriceModel(initialData.price)
      }
    }
  }

  public updateProperty = (property: string, value: string | number) => {
    this[property] = value
  }

  public setAlbumArtUrl = (albumArtUrl: string) => {
    this.albumArtUrl = albumArtUrl
  }

  public setStatus = (status: number) => {
    this.status = status
  }

  public setAlbumArtFileCatalogId = (albumArtFileCatalogId: number) => {
    this.albumArtFileCatalogId = albumArtFileCatalogId
  }

  // Samples
  public setSamples = (samples: SampleModel[]) => {
    const sampleIds = new Array<number>()
    this.samples.clear()
    if (samples && samples.length > 0) {
      samples.forEach((sample: SampleModel) => {
        sampleIds.push(sample.id)
        this.samples.set(sample.id, new SampleModel(sample))
      })
    }

    this.sampleIds = sampleIds
  }

  // Tracks
  public setTracks = (tracks: TrackModel[]) => {
    const trackIds = new Array<number>()
    this.tracks.clear()
    if (tracks && tracks.length > 0) {
      tracks.forEach((track: TrackModel) => {
        trackIds.push(track.id)
        this.tracks.set(track.id, new TrackModel(track))
      })
    }

    this.trackIds = trackIds
  }

  get statusLabel() {
    switch (this.status) {
      case CollectionStatus.Unpublished:
        return 'Unpublished'
      case CollectionStatus.Published:
        return 'Published'
      case CollectionStatus.Archived:
        return 'Archived'
      default:
        return 'N/A'
    }
  }

  get getCreateJson() {
    return {
      name: this.name,
      description: this.description,
      price: this.price,
      type: this.type,
      albumArtFileCatalogId: this.albumArtFileCatalogId,
      sampleIds: this.sampleIds,
      trackIds: this.trackIds,
      ...this.price.asJson,
    }
  }

  get getUpdateJson() {
    return {
      name: this.name,
      description: this.description,
      price: this.price,
      type: this.type,
      status: this.status,
      albumArtFileCatalogId: this.albumArtFileCatalogId,
      sampleIds: this.sampleIds,
      trackIds: this.trackIds,
      ...this.price.asJson,
    }
  }
}

export enum CollectionStatus {
  NA = 0,
  Unpublished = 1,
  Published = 2,
  Archived = 3,
}

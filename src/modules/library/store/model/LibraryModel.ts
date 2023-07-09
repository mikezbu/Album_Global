import { action, observable, makeObservable } from 'mobx'

import CollectionModel from 'src/modules/collection/store/model/CollectionModel'
import { SampleModel } from 'src/modules/sample/store'
import { TrackModel } from 'src/modules/track/store'

export enum LibraryType {
  NA = 0,
  Collection = 1,
  Track = 2,
  Sample = 3,
}

export default class LibraryModel {
  public id = 0

  public type: number = LibraryType.NA

  public track: TrackModel = new TrackModel()

  public sample: SampleModel = new SampleModel()

  public collection: CollectionModel = new CollectionModel()

  public transactionId = 0

  public addedDate: Date = new Date()

  // Local fields
  public originalFilename = ''

  public downloadUrl = ''

  public downloadUrlReady = true

  constructor(initialData: LibraryModel = null) {
    makeObservable(this, {
      id: observable,
      type: observable,
      track: observable,
      sample: observable,
      collection: observable,
      transactionId: observable,
      addedDate: observable,
      originalFilename: observable,
      downloadUrl: observable,
      downloadUrlReady: observable,
      setOriginalFilename: action,
      setDownloadUrl: action,
      setDownloadReady: action,
    })

    if (initialData) {
      this.id = initialData.id
      this.type = initialData.type
      this.track = initialData.track
      this.sample = initialData.sample
      this.collection = initialData.collection
      this.transactionId = initialData.transactionId
      this.addedDate = initialData.addedDate

      if (initialData.track) {
        this.track = new TrackModel(initialData.track)
      }

      if (initialData.collection) {
        this.collection = new CollectionModel(initialData.collection)
      }
    }
  }

  public setOriginalFilename = (originalFilename: string): void => {
    this.originalFilename = originalFilename
  }

  public setDownloadUrl = (url: string): void => {
    this.downloadUrl = url
  }

  public setDownloadReady = (downloadUrlReady: boolean): void => {
    this.downloadUrlReady = downloadUrlReady
  }
}

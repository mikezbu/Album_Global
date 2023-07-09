import { action, computed, observable, makeObservable } from 'mobx'

import { getStore } from 'src/common/store'
import CollectionModel from 'src/modules/collection/store/model/CollectionModel'
import PriceModel, { Currency } from 'src/modules/price/store/model/PriceModel'
import { TrackModel } from 'src/modules/track/store'

export default class CartModel {
  public id = 0

  public currency: Currency = Currency.USD

  public trackIds: number[] = new Array<number>()

  public tracks = observable.map<number, TrackModel>()

  public collectionIds: number[] = new Array<number>()

  public collections = observable.map<number, CollectionModel>()

  constructor(initialData: CartModel = null) {
    makeObservable(this, {
      id: observable,
      currency: observable,
      trackIds: observable,
      tracks: observable,
      collectionIds: observable,
      collections: observable,
      addTrack: action,
      removeTrack: action,
      addCollection: action,
      removeCollection: action,
      getCreateJson: computed,
      getUpdateJson: computed,
      totalItemCount: computed,
      cartTotal: computed,
    })

    if (initialData) {
      this.id = initialData.id
      this.currency = initialData.currency

      this.tracks.clear()
      const trackIds = new Array<number>()
      if (initialData.tracks) {
        initialData.tracks.forEach((track: TrackModel) => {
          this.tracks.set(track.id, new TrackModel(track))
          trackIds.push(track.id)
        })
        this.trackIds = trackIds
      }

      if (initialData.collections) {
        this.collections.clear()
        const collectionIds = new Array<number>()
        initialData.collections.forEach((collection: CollectionModel) => {
          this.collections.set(collection.id, new CollectionModel(collection))
          collectionIds.push(collection.id)
        })

        this.collectionIds = collectionIds
      }
    }
  }

  // Tracks
  public addTrack = (track: TrackModel) => {
    if (!this.tracks.has(track.id)) {
      this.trackIds.push(track.id)
      this.tracks.set(track.id, track)
    }
  }

  public removeTrack = (idToRemove: number) => {
    if (this.tracks.has(idToRemove)) {
      this.tracks.delete(idToRemove)
      this.trackIds = this.trackIds.filter(trackId => trackId !== idToRemove)
    }
  }

  // Collections
  public addCollection = (collection: CollectionModel) => {
    if (!this.collections.has(collection.id)) {
      this.collectionIds.push(collection.id)
      this.collections.set(collection.id, collection)
    }
  }

  public removeCollection = (idToRemove: number) => {
    if (this.collections.has(idToRemove)) {
      this.collections.delete(idToRemove)
      this.collectionIds = this.collectionIds.filter(collectionId => collectionId !== idToRemove)
    }
  }

  get getCreateJson() {
    return {
      collectionIds: this.collectionIds,
      trackIds: this.trackIds,
      currency: this.currency,
    }
  }

  get getUpdateJson() {
    return {
      collectionIds: this.collectionIds,
      trackIds: this.trackIds,
      currency: this.currency,
    }
  }

  get totalItemCount(): number {
    return this.collections.size + this.tracks.size
  }

  get cartTotal(): string {
    const price = new PriceModel()

    const totalPriceInLocalCurrency =
      Array.from(this.tracks.values()).reduce(
        (previousValue: number, track: TrackModel) =>
          previousValue + track.price.localCurrencyPrice,
        0
      ) +
      Array.from(this.collections.values()).reduce(
        (previousValue: number, collection: CollectionModel) =>
          previousValue + collection.price.localCurrencyPrice,
        0
      )

    price.updatePrice(totalPriceInLocalCurrency)
    price.updateCurrency(getStore().appState.localCurrency)

    return price.formattedPrice
  }
}

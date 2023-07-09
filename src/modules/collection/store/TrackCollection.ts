import { action, observable, makeObservable } from 'mobx'

import { getStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import Paginator from 'src/common/store/util/Paginator'
import { Operation } from 'src/common/store/util/SearchCriteria'
import { getCollectionsByArtistIdAndType, searchCollections } from 'src/modules/collection/api'
import CollectionModel, { CollectionType } from 'src/modules/collection/store/model/CollectionModel'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export default class TrackCollection extends Paginator {
  public trackCollections = new Map<number, CollectionModel>()

  public loading = false

  constructor(initialData: TrackCollection = null) {
    super()

    makeObservable(this, {
      trackCollections: observable,
      loading: observable,
      setTrackCollections: action,
      fetchCollectionByArtist: action,
      searchCollections: action,
      fetchTrackCollectionsCallback: action,
    })

    if (initialData) {
      if (initialData.trackCollections && initialData.trackCollections.size > 0) {
        Object.values(initialData.trackCollections).forEach((element: any) => {
          if (element && element[1] && element[1].id) {
            this.trackCollections.set(element[1].id, new CollectionModel(element[1]))
          } else if (element && element.id) {
            this.trackCollections.set(element.id, new CollectionModel(element))
          }
        })
      }
    }
  }

  public setTrackCollections = (trackCollections: Map<number, CollectionModel>) => {
    this.trackCollections = trackCollections
  }

  /**
   *
   * Only to be used for fetching tracks by the artist themselves
   */
  public fetchCollectionByArtist = (artistId: number) => {
    this.loading = true

    getCollectionsByArtistIdAndType(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      artistId,
      CollectionType.Track,
      this.fetchTrackCollectionsCallback
    )
  }

  public searchCollections = filterCriteria => {
    this.loading = true

    if (!filterCriteria) filterCriteria = {}
    if (!filterCriteria.columns) filterCriteria = { ...filterCriteria, columns: [] }

    filterCriteria.columns.push({
      key: 'type',
      operation: Operation.Equals,
      value: CollectionType.Track,
    })

    searchCollections(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      filterCriteria || {},
      this.fetchTrackCollectionsCallback
    )
  }

  public fetchTrackCollectionsCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      const trackCollections = new Map<number, CollectionModel>()

      response.data.content.forEach((element: any) => {
        trackCollections.set(element.id, new CollectionModel(element))
      })

      this.setTrackCollections(trackCollections)
      this.totalCount = response.data.totalElements
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('No collection found')
    }

    this.loading = false
  }
}

import { action, observable, makeObservable } from 'mobx'

import { getStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import Paginator from 'src/common/store/util/Paginator'
import { getAllVerifiedArtists } from 'src/modules/artist/api'
import { ArtistModel } from 'src/modules/artist/store'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export default class ExploreArtists extends Paginator {
  public artists = observable.map<number, ArtistModel>()

  public loading = false

  constructor(initialData: ExploreArtists = null) {
    super()

    makeObservable(this, {
      artists: observable,
      loading: observable,
      fetchArtists: action,
      fetchArtistsCallback: action,
    })

    if (initialData) {
      if (initialData.artists) {
        Object.values(initialData.artists).forEach((element: any) => {
          if (element && element[1] && element[1].id) {
            this.artists.set(element[1].id, new ArtistModel(element[1]))
          } else if (element && element.id) {
            this.artists.set(element.id, new ArtistModel(element))
          }
        })
      }
    }
  }

  public fetchArtists = () => {
    this.loading = true

    getAllVerifiedArtists(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      this.fetchArtistsCallback
    )
  }

  public fetchArtistsCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.artists.clear()
      response.data.content.forEach((element: any) => {
        this.artists.set(element.id, new ArtistModel(element))
      })

      this.totalCount = response.data.totalElements
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('No artists found')
    }

    this.loading = false
  }
}

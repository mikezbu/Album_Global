import { action, observable, makeObservable } from 'mobx'

import { getStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import Paginator from 'src/common/store/util/Paginator'
import { searchTracks, updateTrackPlayCount } from 'src/modules/track/api'
import { TrackModel } from 'src/modules/track/store'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export default class ExploreTracks extends Paginator {
  public tracks = observable.map<number, TrackModel>()

  public trackIds = new Array<number>()

  public selectedTrack: TrackModel = null

  public selectedTrackIdIndex = -1

  public selectedTrackId = -1

  public loading = false

  constructor(initialData: ExploreTracks = null) {
    super()

    makeObservable(this, {
      tracks: observable,
      trackIds: observable,
      selectedTrack: observable,
      selectedTrackIdIndex: observable,
      selectedTrackId: observable,
      loading: observable,
      selectTrackById: action,
      searchTracks: action,
      selectNextTrack: action,
      selectPreviousTrack: action,
      fetchTracksCallback: action,
      incrementAndUpdatePlayCount: action,
    })

    if (initialData) {
      if (initialData.tracks) {
        const trackIds = new Array<number>()
        const tracks = observable.map<number, TrackModel>()

        Object.values(initialData.tracks).forEach((element: any) => {
          if (element && element[1] && element.id) {
            tracks.set(element[1].id, new TrackModel(element[1]))
            trackIds.push(element[1].id)
          } else if (element && element.id) {
            tracks.set(element.id, new TrackModel(element))
            trackIds.push(element.id)
          }
        })

        this.tracks = tracks
        this.trackIds = trackIds
      }
    }
  }

  public selectTrackById = (id: number) => {
    this.selectedTrackIdIndex = this.trackIds.indexOf(id)
    if (this.selectedTrackIdIndex >= 0) {
      this.selectedTrack = this.tracks.get(id)
      this.selectedTrackId = this.selectedTrack.id
    } else {
      this.selectedTrack = null
      this.selectedTrackId = -1
    }
  }

  public selectNextTrack = () => {
    if (this.selectedTrack) {
      if (
        this.trackIds.length &&
        this.selectedTrackIdIndex + 1 < this.trackIds.length &&
        this.selectedTrackIdIndex + 1 >= 0
      ) {
        this.selectedTrackIdIndex += 1
        this.selectedTrack = this.tracks.get(this.trackIds[this.selectedTrackIdIndex])
        this.selectedTrackId = this.selectedTrack.id
      } else {
        this.selectedTrackIdIndex = -1
        this.selectedTrack = null
        this.selectedTrackId = -1
      }
    }
  }

  public selectPreviousTrack = () => {
    if (this.selectedTrack) {
      if (
        this.trackIds.length &&
        this.selectedTrackIdIndex - 1 < this.trackIds.length &&
        this.selectedTrackIdIndex - 1 >= 0
      ) {
        this.selectedTrackIdIndex -= 1
        this.selectedTrack = this.tracks.get(this.trackIds[this.selectedTrackIdIndex])
        this.selectedTrackId = this.selectedTrack.id
      } else {
        this.selectedTrackIdIndex = -1
        this.selectedTrack = null
        this.selectedTrackId = -1
      }
    }
  }

  public searchTracks = (filterCriteria = {}) => {
    this.loading = true

    searchTracks(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      filterCriteria,
      this.fetchTracksCallback
    )
  }

  public fetchTracksCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.tracks.clear()
      const trackIds = new Array<number>()
      response.data.content.forEach(element => {
        this.tracks.set(element.id, new TrackModel(element))
        trackIds.push(element.id)
      })
      this.trackIds = trackIds
      this.totalCount = response.data.totalElements
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('No tracks found')
    }

    this.loading = false
  }

  public incrementAndUpdatePlayCount = (trackId: number) => {
    updateTrackPlayCount(trackId, () => {})
  }
}

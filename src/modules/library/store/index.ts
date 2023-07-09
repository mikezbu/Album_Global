import { action, observable, makeObservable } from 'mobx'

import Paginator from 'src/common/store/util/Paginator'
import { generateDownloadLink, getLibrary } from 'src/modules/library/api'
import LibraryModel from 'src/modules/library/store/model/LibraryModel'
import { TrackModel } from 'src/modules/track/store'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export default class LibraryStore extends Paginator {
  public libraries = observable.map<number, LibraryModel>()

  public selectedLibrary: LibraryModel = new LibraryModel()

  public selectedTrack: TrackModel = null

  public loading = false

  public generatingDownloadUrl = false

  constructor(initialData: LibraryStore = null) {
    super()

    makeObservable(this, {
      libraries: observable,
      selectedLibrary: observable,
      loading: observable,
      generatingDownloadUrl: observable,
      selectedTrack: observable,
      selectTrackById: action,
      setSelectedLibrary: action,
      fetchLibrary: action,
      fetchLibraryCallback: action,
      getDownloadUrl: action,
      getDownloadUrlCallback: action,
    })

    if (initialData) {
      Object.keys(initialData).forEach(element => {
        this[element] = initialData[element]
      })
    }
  }

  public setSelectedLibrary = (id: number) => {
    if (this.libraries.has(id)) {
      this.selectedLibrary = this.libraries.get(id)
    } else {
      this.selectedLibrary = new LibraryModel()
    }
  }

  public fetchLibrary = () => {
    this.loading = true

    getLibrary(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      this.fetchLibraryCallback
    )
  }

  public fetchLibraryCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.libraries.clear()
      response.data.content.forEach((library: LibraryModel) =>
        this.libraries.set(library.id, new LibraryModel(library))
      )
      this.totalCount = response.data.totalElements
    }

    this.loading = false
  }

  public getDownloadUrl = () => {
    if (this.selectedLibrary != null && this.selectedLibrary.id !== 0) {
      this.generatingDownloadUrl = true
      generateDownloadLink(this.selectedLibrary.id, this.getDownloadUrlCallback)
    }
  }

  public getDownloadUrlCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      const itemToUpdate = this.libraries.get(this.selectedLibrary.id)
      itemToUpdate.setDownloadUrl(response.data.downloadUrl)
      window.location = response.data.downloadUrl
      this.libraries.get(this.selectedLibrary.id).setDownloadReady(true)
    }

    this.generatingDownloadUrl = false
  }

  public selectTrackById = (id: number) => {
    this.selectedTrack = this.libraries.get(id)?.track
  }
}

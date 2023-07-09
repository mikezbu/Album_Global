import PromisePool from 'es6-promise-pool'
import { action, observable, runInAction, makeObservable } from 'mobx'

import { createFileCatalog, FileType, uploadFile } from 'src/common/api/file-catalog'
import { getStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import Paginator from 'src/common/store/util/Paginator'
import { Operation } from 'src/common/store/util/SearchCriteria'
import GenreModel from 'src/modules/genre/store/model/GenreModel'
import InstrumentModel from 'src/modules/instrument/store/model/InstrumentModel'
import KeyModel from 'src/modules/key/store/model/KeyModel'
import { createTag } from 'src/modules/tag/api'
import TagModel from 'src/modules/tag/store/model/TagModel'
import {
  createTrack,
  deleteTrack,
  generateDownloadLink,
  searchTracks,
  searchTracksPrivate,
  updateTrack,
  updateTrackPlayCount,
} from 'src/modules/track/api'
import TrackModel from 'src/modules/track/store/model/TrackModel'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export default class TrackStore extends Paginator {
  public tracks = observable.map<number, TrackModel>()

  public track: TrackModel = null

  public trackToUpdate = new TrackModel()

  public trackToUpdateIdIndex = -1

  public trackIds = new Array<number>()

  public selectedTrack: TrackModel = null

  public selectedTrackIdIndex = -1

  public lastTrackToEdit = false

  public firstTrackToEdit = false

  public selectedTrackId = -1

  public loading = false

  public updating = false

  public creating = false

  public updatedSuccessfully = false

  public fileInputChanged = false

  public generatingDownloadUrl = false

  constructor(initialData: TrackStore = null) {
    super()

    makeObservable(this, {
      tracks: observable,
      track: observable,
      trackToUpdate: observable,
      trackToUpdateIdIndex: observable,
      trackIds: observable,
      selectedTrack: observable,
      selectedTrackIdIndex: observable,
      lastTrackToEdit: observable,
      firstTrackToEdit: observable,
      selectedTrackId: observable,
      loading: observable,
      updating: observable,
      creating: observable,
      updatedSuccessfully: observable,
      fileInputChanged: observable,
      generatingDownloadUrl: observable,
      setLoading: action,
      setFileInputChanged: action,
      resetFlags: action,
      selectTrackById: action,
      setSelectedTrack: action,
      setTrackToUpdate: action,
      setTrackToUpdateById: action,
      selectNextTrack: action,
      selectPreviousTrack: action,
      selectNextTrackToUpdate: action,
      selectPreviousTrackToUpdate: action,
      searchTracks: action,
      searchTracksPrivate: action,
      fetchTracksByTagId: action,
      fetchTracksByGenreId: action,
      fetchTracksByInstrumentId: action,
      fetchTracksCallback: action,
      fetchTrackCallback: action,
      updateTrackToUpdateGenres: action,
      updateTrackToUpdateInstruments: action,
      updateTrackToUpdateKey: action,
      updateTrackToUpdatePrice: action,
      updateTrackToUpdateProperty: action,
      updateTrack: action,
      incrementAndUpdatePlayCount: action,
      deleteTrack: action,
      trackUpdateCallback: action,
      trackDeleteCallback: action,
      uploadFilesAndCreateTrack: action,
      uploadFile: action,
      uploadFileCallback: action,
      trackCreateCallback: action,
      getTrackAsAnObserveableMap: action,
      getDownloadUrl: action,
      getDownloadUrlCallback: action,
    })

    if (initialData) {
      if (initialData.tracks) {
        Object.values(initialData.tracks).forEach((element: any) => {
          if (element && element[1] && element[1].id) {
            this.tracks.set(element[1].id, new TrackModel(element[1]))
            this.trackIds.push(element[1].id)
          } else if (element && element.id) {
            this.tracks.set(element.id, new TrackModel(element))
            this.trackIds.push(element.id)
          }
        })
      }

      this.track = new TrackModel(initialData.track)
    }
  }

  public setLoading = (loading: boolean) => {
    this.loading = loading
  }

  public setFileInputChanged = (fileInputChanged: boolean) => {
    this.fileInputChanged = fileInputChanged
  }

  public resetFlags = () => {
    this.updatedSuccessfully = false
    this.fileInputChanged = false
    this.loading = false
    this.updating = false
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

  public setSelectedTrack = (track: TrackModel) => {
    if (track && track.id !== 0) {
      this.selectedTrack = track
      this.selectedTrackId = track.id
    } else {
      this.selectedTrack = null
      this.selectedTrackId = -1
    }
  }

  public setTrackToUpdate = (track: TrackModel) => {
    this.trackToUpdate = track
  }

  public setTrackToUpdateById = (id: number) => {
    if (this.tracks.has(id)) {
      this.trackToUpdate = new TrackModel(this.tracks.get(id))
      this.trackToUpdateIdIndex = this.trackIds.indexOf(id)
      if (this.trackToUpdateIdIndex === 0) {
        this.firstTrackToEdit = true
      } else {
        this.firstTrackToEdit = false
      }

      if (this.trackToUpdateIdIndex === this.trackIds.length - 1) {
        this.lastTrackToEdit = true
      } else {
        this.lastTrackToEdit = false
      }
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

  public selectNextTrackToUpdate = () => {
    if (this.trackToUpdate) {
      if (
        this.trackIds.length &&
        this.trackToUpdateIdIndex + 1 < this.trackIds.length &&
        this.trackToUpdateIdIndex + 1 >= 0
      ) {
        this.trackToUpdateIdIndex += 1
        this.trackToUpdate = new TrackModel(
          this.tracks.get(this.trackIds[this.trackToUpdateIdIndex])
        )
      }

      if (this.trackToUpdateIdIndex === 0) {
        this.firstTrackToEdit = true
      } else {
        this.firstTrackToEdit = false
      }

      if (this.trackToUpdateIdIndex === this.trackIds.length - 1) {
        this.lastTrackToEdit = true
      } else {
        this.lastTrackToEdit = false
      }
    }
  }

  public selectPreviousTrackToUpdate = () => {
    if (this.trackToUpdate) {
      if (
        this.trackIds.length &&
        this.trackToUpdateIdIndex - 1 < this.trackIds.length &&
        this.trackToUpdateIdIndex - 1 >= 0
      ) {
        this.trackToUpdateIdIndex -= 1
        this.trackToUpdate = new TrackModel(
          this.tracks.get(this.trackIds[this.trackToUpdateIdIndex])
        )
      }

      if (this.trackToUpdateIdIndex === 0) {
        this.firstTrackToEdit = true
      } else {
        this.firstTrackToEdit = false
      }

      if (this.trackToUpdateIdIndex === this.trackIds.length - 1) {
        this.lastTrackToEdit = true
      } else {
        this.lastTrackToEdit = false
      }
    }
  }

  public searchTracks = filterCriteria => {
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

  public searchTracksPrivate = filterCriteria => {
    this.loading = true

    searchTracksPrivate(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      filterCriteria,
      this.fetchTracksCallback
    )
  }

  public fetchTracksByTagId = (tagId: number) => {
    this.loading = true

    const joins = []

    if (tagId > 0) {
      joins.push({
        key: 'tagIds',
        operation: Operation.In,
        value: [tagId],
      })
    }

    const columns = []

    searchTracks(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      { joins: joins, columns: columns },
      this.fetchTracksCallback
    )
  }

  public fetchTracksByGenreId = (genreId: number) => {
    this.loading = true

    const joins = []

    if (genreId > 0) {
      joins.push({
        key: 'genreIds',
        operation: Operation.In,
        value: [genreId],
      })
    }

    const columns = []

    searchTracks(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      { joins: joins, columns: columns },
      this.fetchTracksCallback
    )
  }

  public fetchTracksByInstrumentId = (instrumentId: number) => {
    this.loading = true

    const joins = []

    if (instrumentId > 0) {
      joins.push({
        key: 'instrumentIds',
        operation: Operation.In,
        value: [instrumentId],
      })
    }

    const columns = []

    searchTracks(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      { joins: joins, columns: columns },
      this.fetchTracksCallback
    )
  }

  public fetchTracksCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      const trackIds = new Array<number>()
      this.tracks.clear()
      response.data.content.forEach((track: TrackModel) => {
        this.tracks.set(track.id, new TrackModel(track))
        trackIds.push(track.id)
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

  public fetchTrackCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.track = new TrackModel(response.data)
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('Track not found')
    }

    this.loading = false
  }

  // Updates
  public updateTrackToUpdateGenres = (genres: GenreModel[]) => {
    this.trackToUpdate.setGenres(genres)
  }

  public updateTrackToUpdateInstruments = (newInstruments: InstrumentModel[]) => {
    this.trackToUpdate.setInstruments(newInstruments)
  }

  public updateTrackToUpdateTags = (newTags: TagModel[]) => {
    this.trackToUpdate.setTags(newTags)
  }

  public updateTrackToUpdateKey = (key: KeyModel) => {
    this.trackToUpdate.setKey(key)
  }

  public updateTrackToUpdateStatus = (status: number) => {
    this.trackToUpdate.setStatus(status)
  }

  public updateTrackToUpdatePrice = (price: number) => {
    this.trackToUpdate.setPrice(price)
  }

  public updateTrackToUpdateProperty = (property: string, value: string) => {
    this.trackToUpdate[property] = value
  }

  public updateTrack = async (selectedFiles: any[]) => {
    this.updating = true

    const trackToUpdate = { track: this.trackToUpdate, fileUploaded: false }

    if (this.fileInputChanged && selectedFiles && selectedFiles.length > 0) {
      const allPromise = selectedFiles.map(selectedFile =>
        this.uploadFile(selectedFile.file, selectedFile.type, trackToUpdate)
      )

      await Promise.all(allPromise)
    }

    if (!this.fileInputChanged || (this.fileInputChanged && trackToUpdate.fileUploaded)) {
      if (trackToUpdate.track.tags && trackToUpdate.track.tags.length > 0) {
        const updatedTags = new Array<TagModel>()

        for (const tag of trackToUpdate.track.tags) {
          // All the tags below 10,000 are new tags we want to create
          if (tag.id < 10000) {
            await createTag(tag.getCreateJson, response => {
              if (isSuccessResponse(response)) {
                updatedTags.push(new TagModel(response.data))
              }
            })
          } else {
            updatedTags.push(tag)
          }
        }

        this.updateTrackToUpdateTags(updatedTags)
      }

      updateTrack(
        trackToUpdate.track.id,
        trackToUpdate.track.asUpdateJson,
        this.trackUpdateCallback
      )
    }
  }

  public incrementAndUpdatePlayCount = (trackId: number) => {
    updateTrackPlayCount(trackId, () => {})
  }

  public deleteTrack = (trackId: number) => {
    this.updating = true
    this.tracks.delete(trackId)
    this.trackIds = this.trackIds.filter(id => id !== trackId)

    deleteTrack(trackId, this.trackDeleteCallback)
  }

  public trackUpdateCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.tracks.set(response.data.id, new TrackModel(response.data))
      this.selectTrackById(-1)
      this.updatedSuccessfully = true
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Track updated successfully!')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('An error occurred while updating track')
    }

    this.updating = false
  }

  public trackDeleteCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Track deleted')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('An error occurred while deleting track')
    }

    this.updating = false
  }

  public uploadFilesAndCreateTrack = async (selectedFiles: any[]): Promise<void> => {
    if (selectedFiles && selectedFiles.length > 0) {
      this.creating = true

      let index = 0
      const promiseProducer = () => {
        if (index < selectedFiles.length) {
          const selectedFile = selectedFiles[index]
          const track = new TrackModel()
          runInAction(() => {
            track.title = selectedFile.file.name
            track.duration = selectedFile.duration
          })

          const trackToCreate = { track, fileUploaded: false }
          index++

          // Upload the file then create the track
          return this.uploadFile(selectedFile.file, 'track', trackToCreate).then(() =>
            this.createTrack(trackToCreate.track)
          )
        } else {
          return null
        }
      }

      const concurrency = 3

      // Create a pool.
      const pool = new PromisePool(promiseProducer, concurrency)

      // Start the pool and wait
      await pool.start()

      runInAction(() => {
        this.creating = false
      })
    }
  }

  public uploadFile = async (
    file: File,
    type: string,
    trackToCreate: ITrackCreate
  ): Promise<void> => {
    let uploadPath = ''
    let fileIsPublic = false
    let success = false

    let fileType = FileType.NA
    let fullFilePath = ''
    let fileCatalogId = 0

    if (type === 'artworkUrl') {
      fileType = FileType.Images
    } else {
      fileType = FileType.Track
    }

    await createFileCatalog(
      {
        fileType,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
      },
      (response: any) => {
        if (isSuccessResponse(response)) {
          uploadPath = response.data.uploadUrl
          fileIsPublic = response.data.public
          fullFilePath = response.data.fullCdnUrl
          fileCatalogId = response.data.id

          success = true
        } else {
          getStore().appState.setMessageVariant(MessageVariant.Error)
          getStore().appState.setShowMessage(true)
          getStore().appState.setMessage(
            `An error occurred while uploading file. ${response.data ? response.data.message : ''}`
          )
        }
      }
    )

    if (success) {
      if (type === 'artworkUrl') {
        trackToCreate.track.setArtworkUrl(fullFilePath)
        trackToCreate.track.setArtworkFileCatalogId(fileCatalogId)
      } else {
        trackToCreate.track.setTrackFileCatalogId(fileCatalogId)
      }

      return uploadFile(uploadPath, file, fileIsPublic, this.uploadFileCallback(trackToCreate))
    } else Promise.reject()
  }

  public uploadFileCallback = (trackToCreate: ITrackCreate) => (response: any) => {
    if (isSuccessResponse(response)) {
      trackToCreate.fileUploaded = true
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('An error occurred while uploading file')
    }
  }

  public createTrack = async (track: TrackModel): Promise<void> => {
    return createTrack(track.asCreateJson, this.trackCreateCallback)
  }

  public trackCreateCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      const backupTracks = observable.map<number, TrackModel>(this.tracks)
      this.tracks.clear()
      this.tracks.set(response.data.id, new TrackModel(response.data))

      backupTracks.forEach((value: TrackModel, key: number) => this.tracks.set(key, value))

      this.trackIds.unshift(response.data.id)

      this.selectTrackById(-1)
      this.selectedTrack = new TrackModel()
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('An error occurred while creating track')
    }
  }

  public getTrackAsAnObserveableMap = (track: TrackModel) => {
    const trackMap = observable.map<number, TrackModel>()
    trackMap.set(track?.id, track)

    return trackMap
  }

  public getDownloadUrl = (id: number) => {
    this.generatingDownloadUrl = true
    generateDownloadLink(id, this.getDownloadUrlCallback)
  }

  public getDownloadUrlCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      window.location = response.data.downloadUrl
    }

    this.generatingDownloadUrl = false
  }
}

interface ITrackCreate {
  track: TrackModel
  fileUploaded: boolean
}

export { TrackModel }

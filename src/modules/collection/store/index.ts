import { action, observable, makeObservable } from 'mobx'

import { createFileCatalog, FileType, uploadFile } from 'src/common/api/file-catalog'
import { getStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import Paginator from 'src/common/store/util/Paginator'
import {
  createCollection,
  deleteCollection,
  getCollection,
  getCollectionsByArtistIdAndType,
  updateCollection,
} from 'src/modules/collection/api'
import CollectionModel, { CollectionType } from 'src/modules/collection/store/model/CollectionModel'
import { updateSamplePlayCount } from 'src/modules/sample/api'
import { SampleModel } from 'src/modules/sample/store'
import { updateTrackPlayCount } from 'src/modules/track/api'
import { TrackModel } from 'src/modules/track/store'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export default class CollectionStore extends Paginator {
  public collections = observable.map<number, CollectionModel>()

  public trackCollections = observable.map<number, CollectionModel>()

  public samplePacks = observable.map<number, CollectionModel>()

  public collection: CollectionModel = null

  public collectionToCreateOrModify = new CollectionModel()

  public selectedSample: SampleModel = null

  public selectedTrack: TrackModel = null

  public selectedSampleIdIndex = -1

  public selectedSampleId = -1

  public selectedTrackIdIndex = -1

  public selectedTrackId = -1

  public loading = false

  public collectionForArtistLoaded = false

  public updatedSuccessfully = false

  public createdSuccessfully = false

  public updating = false

  public fileInputChanged = false

  public fileUploaded = false

  constructor(initialData: CollectionStore = null) {
    super()

    makeObservable(this, {
      collections: observable,
      trackCollections: observable,
      samplePacks: observable,
      collection: observable,
      collectionToCreateOrModify: observable,
      selectedSample: observable,
      selectedTrack: observable,
      selectedSampleIdIndex: observable,
      selectedSampleId: observable,
      selectedTrackIdIndex: observable,
      selectedTrackId: observable,
      loading: observable,
      collectionForArtistLoaded: observable,
      updatedSuccessfully: observable,
      createdSuccessfully: observable,
      updating: observable,
      fileInputChanged: observable,
      fileUploaded: observable,
      resetFlags: action,
      resetCreateOrUpdate: action,
      setLoading: action,
      selectSampleById: action,
      selectTrackById: action,
      selectNextTrack: action,
      selectPreviousTrack: action,
      selectNextSample: action,
      selectPreviousSample: action,
      setSelectedSample: action,
      setSelectedTrack: action,
      setFileInputChanged: action,
      fetchCollection: action,
      fetchCollectionByArtistId: action,
      fetchCollectionsCallback: action,
      fetchCollectionCallback: action,
      handleCollectionToCreateOrModifyInputChange: action,
      setCollectionToCreateOrModifySamples: action,
      setCollectionToCreateOrModifyTracks: action,
      setCollectionToCreateOrModify: action,
      updateCollection: action,
      collectionUpdateCallback: action,
      createCollection: action,
      collectionCreateCallback: action,
      incrementAndUpdatePlayCount: action,
      incrementAndUpdateTrackPlayCount: action,
      uploadFile: action,
      uploadFileCallback: action,
      deleteCollection: action,
      deleteCollectionCallback: action,
    })

    if (initialData) {
      if (initialData.collections) {
        const collections = observable.map<number, CollectionModel>()
        const samplePacks = observable.map<number, CollectionModel>()
        const trackCollections = observable.map<number, CollectionModel>()

        Object.values(initialData.collections).forEach((element: any) => {
          if (element && element[1] && element[1].id) {
            collections.set(element[1].id, new CollectionModel(element[1]))

            if (element[1].type === CollectionType.Sample) {
              samplePacks.set(element[1].id, new CollectionModel(element[1]))
            } else if (element[1].type === CollectionType.Track) {
              trackCollections.set(element[1].id, new CollectionModel(element[1]))
            }
          } else if (element && element.id) {
            collections.set(element.id, new CollectionModel(element))

            if (element.type === CollectionType.Sample) {
              samplePacks.set(element.id, new CollectionModel(element))
            } else if (element.type === CollectionType.Track) {
              trackCollections.set(element.id, new CollectionModel(element))
            }
          }
        })

        this.collections = collections
        this.trackCollections = trackCollections
        this.samplePacks = samplePacks
      }

      this.collection = new CollectionModel(initialData.collection)
    }
  }

  public resetFlags = () => {
    this.updatedSuccessfully = false
    this.createdSuccessfully = false
    this.fileUploaded = false
    this.fileInputChanged = false
    this.loading = false
    this.updating = false
    this.selectedSampleId = -1
    this.selectedSampleIdIndex = -1
  }

  public resetCreateOrUpdate = () => {
    this.resetFlags()
    this.collectionToCreateOrModify = new CollectionModel()
  }

  public setLoading = (loading: boolean) => {
    this.loading = loading
  }

  public selectSampleById = (id: number) => {
    this.selectedSampleIdIndex = this.collection.sampleIds.indexOf(id)
    if (this.selectedSampleIdIndex >= 0) {
      this.selectedSample = this.collection.samples.get(id)
      this.selectedSampleId = this.selectedSample.id
    } else {
      this.selectedSample = null
      this.selectedSampleId = -1
    }
  }

  public selectTrackById = (id: number) => {
    this.selectedTrackIdIndex = this.collection.trackIds.indexOf(id)
    if (this.selectedTrackIdIndex >= 0) {
      this.selectedTrack = this.collection.tracks.get(id)
      this.selectedTrackId = this.selectedTrack.id
    } else {
      this.selectedTrack = null
      this.selectedTrackId = -1
    }
  }

  public selectNextTrack = () => {
    if (this.selectedTrack) {
      if (
        this.collection.trackIds.length &&
        this.selectedTrackIdIndex + 1 < this.collection.trackIds.length &&
        this.selectedTrackIdIndex + 1 >= 0
      ) {
        this.selectedTrackIdIndex += 1
        this.selectedTrack = this.collection.tracks.get(
          this.collection.trackIds[this.selectedTrackIdIndex]
        )
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
        this.collection.trackIds.length &&
        this.selectedTrackIdIndex - 1 < this.collection.trackIds.length &&
        this.selectedTrackIdIndex - 1 >= 0
      ) {
        this.selectedTrackIdIndex -= 1
        this.selectedTrack = this.collection.tracks.get(
          this.collection.trackIds[this.selectedTrackIdIndex]
        )
        this.selectedTrackId = this.selectedTrack.id
      } else {
        this.selectedTrackIdIndex = -1
        this.selectedTrack = null
        this.selectedTrackId = -1
      }
    }
  }

  public selectNextSample = () => {
    if (this.selectedSample) {
      if (
        this.collection.sampleIds.length &&
        this.selectedSampleIdIndex + 1 < this.collection.sampleIds.length &&
        this.selectedSampleIdIndex + 1 >= 0
      ) {
        this.selectedSampleIdIndex += 1
        this.selectedSample = this.collection.samples.get(
          this.collection.sampleIds[this.selectedSampleIdIndex]
        )
        this.selectedSampleId = this.selectedSample.id
      } else {
        this.selectedSampleIdIndex = -1
        this.selectedSample = null
        this.selectedSampleId = -1
      }
    }
  }

  public selectPreviousSample = () => {
    if (this.selectedSample) {
      if (
        this.collection.sampleIds.length &&
        this.selectedSampleIdIndex - 1 < this.collection.sampleIds.length &&
        this.selectedSampleIdIndex - 1 >= 0
      ) {
        this.selectedSampleIdIndex -= 1
        this.selectedSample = this.collection.samples.get(
          this.collection.sampleIds[this.selectedSampleIdIndex]
        )
        this.selectedSampleId = this.selectedSample.id
      } else {
        this.selectedSampleIdIndex = -1
        this.selectedSample = null
        this.selectedSampleId = -1
      }
    }
  }

  public setSelectedSample = (sample: SampleModel) => {
    if (sample) {
      this.selectedSample = sample
      this.selectedSampleId = sample.id
    } else {
      this.selectedSampleIdIndex = -1
      this.selectedSample = null
      this.selectedSampleId = -1
    }
  }

  public setSelectedTrack = (track: TrackModel) => {
    if (track) {
      this.selectedTrack = track
      this.selectedTrackIdIndex = track.id
    } else {
      this.selectedTrackIdIndex = -1
      this.selectedTrack = null
      this.selectedTrackIdIndex = -1
    }
  }

  public setFileInputChanged = (fileInputChanged: boolean) => {
    this.fileInputChanged = fileInputChanged
  }

  public fetchCollection = (id: number) => {
    this.loading = true

    getCollection(id, this.fetchCollectionCallback)
  }

  public fetchCollectionByArtistId = (artistId: number, type: CollectionType) => {
    this.loading = true

    getCollectionsByArtistIdAndType(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      artistId,
      type,
      this.fetchCollectionsCallback
    )
  }

  public fetchCollectionsCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.collections.clear()
      response.data.content.forEach(element => {
        this.collections.set(element.id, new CollectionModel(element))

        if (element.type === CollectionType.Sample) {
          this.samplePacks.set(element.id, new CollectionModel(element))
        } else if (element.type === CollectionType.Track) {
          this.trackCollections.set(element.id, new CollectionModel(element))
        }
      })

      this.totalCount = response.data.totalElements
      this.collectionForArtistLoaded = true
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('Collections not found')
    }

    this.loading = false
  }

  public fetchCollectionCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.collection = new CollectionModel(response.data)
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('Collection not found')
    }

    this.loading = false
  }

  // Updates
  public handleCollectionToCreateOrModifyInputChange = (
    property: string,
    value: string | number
  ) => {
    this.collectionToCreateOrModify.updateProperty(property, value)
  }

  public setCollectionToCreateOrModifySamples = (samples: SampleModel[]) => {
    this.collectionToCreateOrModify.setSamples(samples)
  }

  public setCollectionToCreateOrModifyTracks = (tracks: TrackModel[]) => {
    this.collectionToCreateOrModify.setTracks(tracks)
  }

  public setCollectionToCreateOrModify = (id: number) => {
    if (this.collections.has(id)) {
      this.collectionToCreateOrModify = this.collections.get(id)
    }
  }

  public updateCollection = async (selectedFiles: any[]) => {
    const collectionToCreateOrModify = this.collectionToCreateOrModify
    this.updating = true

    if (this.fileInputChanged && selectedFiles && selectedFiles.length > 0) {
      const allPromise = selectedFiles.map(selectedFile =>
        this.uploadFile(selectedFile.file, selectedFile.type, collectionToCreateOrModify)
      )

      await Promise.all(allPromise)
    }

    if (!this.fileInputChanged || (this.fileInputChanged && this.fileUploaded)) {
      updateCollection(
        collectionToCreateOrModify.id,
        collectionToCreateOrModify.getUpdateJson,
        this.collectionUpdateCallback
      )
    }
  }

  public collectionUpdateCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.collections.set(response.data.id, new CollectionModel(response.data))

      if (response.data.type === CollectionType.Sample) {
        this.samplePacks.set(response.data.id, new CollectionModel(response.data))
      } else if (response.data.type === CollectionType.Track) {
        this.trackCollections.set(response.data.id, new CollectionModel(response.data))
      }

      this.updatedSuccessfully = true

      this.collectionToCreateOrModify = new CollectionModel()

      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Updated successfully')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('An error occurred while updating collection')
    }

    this.updating = false
  }

  // Creates
  public createCollection = async (selectedFiles: any[]) => {
    const collectionCreate = this.collectionToCreateOrModify
    this.updating = true

    if (this.fileInputChanged && selectedFiles && selectedFiles.length > 0) {
      const allPromise = selectedFiles.map(selectedFile =>
        this.uploadFile(selectedFile.file, selectedFile.type, collectionCreate)
      )

      await Promise.all(allPromise)
    }

    if (!this.fileInputChanged || (this.fileInputChanged && this.fileUploaded)) {
      createCollection(collectionCreate.getCreateJson, this.collectionCreateCallback)
    }
  }

  public collectionCreateCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.collections.set(response.data.id, new CollectionModel(response.data))

      if (response.data.type === CollectionType.Sample) {
        this.samplePacks.set(response.data.id, new CollectionModel(response.data))
      } else if (response.data.type === CollectionType.Track) {
        this.trackCollections.set(response.data.id, new CollectionModel(response.data))
      }

      this.createdSuccessfully = true

      this.collectionToCreateOrModify = new CollectionModel()

      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Created successfully')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('An error occurred while creating collection')
    }

    this.updating = false
  }

  // Sample play count increment
  public incrementAndUpdatePlayCount = (sampleId: number) => {
    const sample = this.collection.samples.get(sampleId)
    sample.incrementPlayCount()

    updateSamplePlayCount(sampleId, () => {})
  }

  public incrementAndUpdateTrackPlayCount = (trackId: number) => {
    updateTrackPlayCount(trackId, () => {})
  }

  public uploadFile = async (
    file: File,
    type: string,
    modelToModify: CollectionModel
  ): Promise<void> => {
    let uploadPath = ''
    let fileIsPublic = false
    let success = false

    let fileType = FileType.NA
    let fullFilePath = ''
    let fileCatalogId = 0

    if (type === 'albumArtUrl') {
      fileType = FileType.Images
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

          this.updating = false
        }
      }
    )

    if (success) {
      if (type === 'albumArtUrl') {
        modelToModify.setAlbumArtUrl(fullFilePath)
        modelToModify.setAlbumArtFileCatalogId(fileCatalogId)
      }

      return uploadFile(uploadPath, file, fileIsPublic, this.uploadFileCallback)
    }
  }

  public uploadFileCallback = (response: any) => {
    if (isSuccessResponse(response)) {
      this.fileUploaded = true
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('An error occurred while uploading file')
      this.updating = false
    }
  }

  // Delete
  public deleteCollection = (collectionId: number) => {
    this.updating = true
    deleteCollection(collectionId, this.deleteCollectionCallback)
  }

  public deleteCollectionCallback = (response: any) => {
    if (isSuccessResponse(response)) {
      this.collections.delete(this.collectionToCreateOrModify.id)
      this.samplePacks.delete(this.collectionToCreateOrModify.id)
      this.trackCollections.delete(this.collectionToCreateOrModify.id)

      this.collectionToCreateOrModify = new CollectionModel()
      this.updatedSuccessfully = true
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('An error occurred while deleting collection')
    }

    this.updating = false
  }
}

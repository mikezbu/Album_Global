import PromisePool from 'es6-promise-pool'
import { action, observable, runInAction, makeObservable } from 'mobx'

import { createFileCatalog, FileType, uploadFile } from 'src/common/api/file-catalog'
import { getStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import Paginator from 'src/common/store/util/Paginator'
import {
  createSample,
  deleteSample,
  getSamples,
  getSamplesByArtistId,
  updateSample,
  updateSamplePlayCount,
} from 'src/modules/sample/api'
import SampleModel from 'src/modules/sample/store/model/SampleModel'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

const isServer = typeof window === 'undefined'

export default class SampleStore extends Paginator {
  public samples = observable.map<number, SampleModel>()

  public sample: SampleModel = null

  public sampleToUpdate = new SampleModel()

  public sampleToUpdateIdIndex = -1

  public lastSampleToEdit = false

  public firstSampleToEdit = false

  public sampleIds = new Array<number>()

  public selectedSample: SampleModel = null

  public selectedSampleIdIndex = -1

  public selectedSampleId = -1

  public loading = false

  public paging = false

  public updating = false

  public creating = false

  public updatedSuccessfully = false

  constructor(initialData: SampleStore = null) {
    super()

    makeObservable(this, {
      samples: observable,
      sample: observable,
      sampleToUpdate: observable,
      sampleToUpdateIdIndex: observable,
      lastSampleToEdit: observable,
      firstSampleToEdit: observable,
      sampleIds: observable,
      selectedSample: observable,
      selectedSampleIdIndex: observable,
      selectedSampleId: observable,
      loading: observable,
      paging: observable,
      updating: observable,
      creating: observable,
      updatedSuccessfully: observable,
      setLoading: action,
      resetFlags: action,
      selectSampleById: action,
      setSelectedSample: action,
      setSampleToUpdate: action,
      selectNextSampleToUpdate: action,
      selectPreviousSampleToUpdate: action,
      selectNextSample: action,
      selectPreviousSample: action,
      fetchSamples: action,
      fetchSamplesByArtistId: action,
      fetchSamplesCallback: action,
      fetchSampleCallback: action,
      updateTags: action,
      updateSampleToUpdateProperty: action,
      updateSample: action,
      incrementAndUpdatePlayCount: action,
      deleteSample: action,
      sampleUpdateCallback: action,
      sampleDeleteCallback: action,
      uploadFilesAndCreateSample: action,
      uploadFile: action,
      uploadFileCallback: action,
      sampleCreateCallback: action,
      getSampleAsAnObserveableMap: action,
    })

    if (initialData) {
      if (initialData.samples) {
        Object.values(initialData.samples).forEach((element: any) => {
          if (element && element[1] && element[1].id) {
            this.samples.set(element[1].id, new SampleModel(element[1]))
            this.sampleIds.push(element[1].id)
          } else if (element && element.id) {
            this.samples.set(element.id, new SampleModel(element))
            this.sampleIds.push(element.id)
          }
        })
      }

      this.sample = new SampleModel(initialData.sample)
    }
  }

  public setLoading = (loading: boolean) => {
    this.loading = loading
  }

  public resetFlags = () => {
    this.updatedSuccessfully = false
  }

  public selectSampleById = (id: number) => {
    this.selectedSampleIdIndex = this.sampleIds.indexOf(id)
    if (this.selectedSampleIdIndex >= 0) {
      this.selectedSample = new SampleModel(this.samples.get(id))
      this.selectedSampleId = this.selectedSample.id
    } else {
      this.selectedSample = null
      this.selectedSampleId = -1
    }
  }

  public setSelectedSample = (sample: SampleModel) => {
    if (sample && sample.id !== 0) {
      this.selectedSample = sample
      this.selectedSampleId = sample.id
    } else {
      this.selectedSample = null
      this.selectedSampleId = -1
    }
  }

  public setSampleToUpdate = (id: number) => {
    if (this.samples.has(id)) {
      this.sampleToUpdate = new SampleModel(this.samples.get(id))
      this.sampleToUpdateIdIndex = this.sampleIds.indexOf(id)
      if (this.sampleToUpdateIdIndex === 0) {
        this.firstSampleToEdit = true
      } else {
        this.firstSampleToEdit = false
      }

      if (this.sampleToUpdateIdIndex === this.sampleIds.length - 1) {
        this.lastSampleToEdit = true
      } else {
        this.lastSampleToEdit = false
      }
    }
  }

  public selectNextSampleToUpdate = () => {
    if (this.sampleToUpdate) {
      if (
        this.sampleIds.length &&
        this.sampleToUpdateIdIndex + 1 < this.sampleIds.length &&
        this.sampleToUpdateIdIndex + 1 >= 0
      ) {
        this.sampleToUpdateIdIndex += 1
        this.sampleToUpdate = new SampleModel(
          this.samples.get(this.sampleIds[this.sampleToUpdateIdIndex])
        )
      }

      if (this.sampleToUpdateIdIndex === 0) {
        this.firstSampleToEdit = true
      } else {
        this.firstSampleToEdit = false
      }

      if (this.sampleToUpdateIdIndex === this.sampleIds.length - 1) {
        this.lastSampleToEdit = true
      } else {
        this.lastSampleToEdit = false
      }
    }
  }

  public selectPreviousSampleToUpdate = () => {
    if (this.sampleToUpdate) {
      if (
        this.sampleIds.length &&
        this.sampleToUpdateIdIndex - 1 < this.sampleIds.length &&
        this.sampleToUpdateIdIndex - 1 >= 0
      ) {
        this.sampleToUpdateIdIndex -= 1
        this.sampleToUpdate = new SampleModel(
          this.samples.get(this.sampleIds[this.sampleToUpdateIdIndex])
        )
      }

      if (this.sampleToUpdateIdIndex === 0) {
        this.firstSampleToEdit = true
      } else {
        this.firstSampleToEdit = false
      }

      if (this.sampleToUpdateIdIndex === this.sampleIds.length - 1) {
        this.lastSampleToEdit = true
      } else {
        this.lastSampleToEdit = false
      }
    }
  }

  public selectNextSample = () => {
    if (this.selectedSample) {
      if (
        this.sampleIds.length &&
        this.selectedSampleIdIndex + 1 < this.sampleIds.length &&
        this.selectedSampleIdIndex + 1 >= 0
      ) {
        this.selectedSampleIdIndex += 1
        this.selectedSample = new SampleModel(
          this.samples.get(this.sampleIds[this.selectedSampleIdIndex])
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
        this.sampleIds.length &&
        this.selectedSampleIdIndex - 1 < this.sampleIds.length &&
        this.selectedSampleIdIndex - 1 >= 0
      ) {
        this.selectedSampleIdIndex -= 1
        this.selectedSample = new SampleModel(
          this.samples.get(this.sampleIds[this.selectedSampleIdIndex])
        )
        this.selectedSampleId = this.selectedSample.id
      } else {
        this.selectedSampleIdIndex = -1
        this.selectedSample = null
        this.selectedSampleId = -1
      }
    }
  }

  public fetchSamples = (silent = false) => {
    if (!silent) {
      this.loading = true
    } else {
      this.paging = true
    }

    getSamples(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      this.fetchSamplesCallback
    )
  }

  public fetchSamplesByArtistId = (artistId: number, silent = false) => {
    if (!silent) {
      this.loading = true
    } else {
      this.paging = true
    }

    getSamplesByArtistId(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      artistId,
      this.fetchSamplesCallback
    )
  }

  public fetchSamplesCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.samples.clear()
      const sampleIds = new Array<number>()
      response.data.content.forEach(element => {
        this.samples.set(element.id, new SampleModel(element))
        sampleIds.push(element.id)
      })

      this.sampleIds = sampleIds
      this.totalCount = response.data.totalElements
    } else {
      if (!isServer) {
        getStore().appState.setShowMessage(true)
        getStore().appState.setMessageVariant(MessageVariant.Error)
        getStore().appState.setMessage('No samples found')
      }
    }

    this.loading = false
    this.paging = false
  }

  public fetchSampleCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.sample = new SampleModel(response.data)
    } else {
      this.sample = new SampleModel()
      if (!isServer) {
        getStore().appState.setShowMessage(true)
        getStore().appState.setMessageVariant(MessageVariant.Error)
        getStore().appState.setMessage('Sample not found')
      }
    }

    this.loading = false
  }

  // Updates
  public updateTags = (newTags: string[]) => {
    this.sampleToUpdate.setTags(newTags)
  }

  public updateSampleToUpdateProperty = (property: string, value: string) => {
    this.sampleToUpdate[property] = value
  }

  public updateSample = () => {
    this.updating = true

    updateSample(
      this.sampleToUpdate.id,
      this.sampleToUpdate.asUpdateJson,
      this.sampleUpdateCallback
    )
  }

  public incrementAndUpdatePlayCount = (sampleId: number) => {
    updateSamplePlayCount(sampleId, () => {})
  }

  public deleteSample = (sampleId: number) => {
    this.updating = true
    this.samples.delete(sampleId)
    this.sampleIds = this.sampleIds.filter(id => id !== sampleId)

    deleteSample(sampleId, this.sampleDeleteCallback)
  }

  public sampleUpdateCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.samples.set(response.data.id, new SampleModel(response.data))
      this.selectSampleById(-1)
      this.updatedSuccessfully = true
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Sample updated successfully!')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('An error occurred while updating sample')
    }

    this.updating = false
  }

  public sampleDeleteCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Sample deleted')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('An error occurred while deleting sample')
    }

    this.updating = false
  }

  public uploadFilesAndCreateSample = async (selectedFiles: any[]) => {
    if (selectedFiles && selectedFiles.length > 0) {
      this.creating = true

      let index = 0
      const promiseProducer = () => {
        if (index < selectedFiles.length) {
          const selectedFile = selectedFiles[index]
          const sample = new SampleModel()
          runInAction(() => {
            sample.title = selectedFile.file.name
            sample.duration = selectedFile.duration
          })

          const sampleToCreate = { sample, fileUploaded: false }
          index++

          // Upload the file then create the sample
          return this.uploadFile(selectedFile.file, sampleToCreate).then(() =>
            this.createSample(sampleToCreate.sample)
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

  public uploadFile = async (file: File, sampleToCreate: ISampleCreate): Promise<void> => {
    let uploadPath = ''
    let fileIsPublic = false
    let success = false

    const fileType = FileType.Sample
    let fileCatalogId = 0

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
      sampleToCreate.sample.setSampleFileCatalogId(fileCatalogId)

      return uploadFile(uploadPath, file, fileIsPublic, this.uploadFileCallback(sampleToCreate))
    }
  }

  public uploadFileCallback = (sampleToCreate: ISampleCreate) => (response: any) => {
    if (isSuccessResponse(response)) {
      sampleToCreate.fileUploaded = true
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('An error occurred while uploading file')
    }
  }

  public createSample = async (sample: SampleModel): Promise<void> => {
    return createSample(sample.asCreateJson, this.sampleCreateCallback)
  }

  public sampleCreateCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.samples.set(response.data.id, new SampleModel(response.data))
      this.sampleIds.push(response.data.id)

      this.selectSampleById(-1)
      this.selectedSample = new SampleModel()
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('An error occurred while creating sample')
    }
  }

  public getSampleAsAnObserveableMap = (sample: SampleModel) => {
    const sampleMap = observable.map<number, SampleModel>()
    sampleMap.set(sample.id, sample)

    return sampleMap
  }
}

interface ISampleCreate {
  sample: SampleModel
  fileUploaded: boolean
}

export { SampleModel }

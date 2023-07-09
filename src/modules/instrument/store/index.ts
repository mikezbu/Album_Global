import { action, observable, makeObservable } from 'mobx'
import { createFileCatalog, FileType, uploadFile } from 'src/common/api/file-catalog'

import { getStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import {
  getInstruments,
  createInstrument,
  deleteInstrument,
  updateInstrument,
  getInstrument,
} from 'src/modules/instrument/api'
import InstrumentModel from 'src/modules/instrument/store/model/InstrumentModel'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export default class InstrumentStore {
  public instruments = observable.map<number, InstrumentModel>()

  public instrument = new InstrumentModel()

  public instrumentToCreateOrModify = new InstrumentModel()

  public selectedInstrumentId = -1

  public loading = false

  public loaded = false

  public modifying = false

  public updatedSuccessfully = false

  public createdSuccessfully = false

  public fileInputChanged = false

  public fileUploaded = false

  constructor(initialData: InstrumentStore = null) {
    makeObservable(this, {
      instruments: observable,
      instrument: observable,
      instrumentToCreateOrModify: observable,
      selectedInstrumentId: observable,
      loading: observable,
      loaded: observable,
      modifying: observable,
      updatedSuccessfully: observable,
      createdSuccessfully: observable,
      fileInputChanged: observable,
      fileUploaded: observable,
      resetCreateOrUpdate: action,
      setFileInputChanged: action,
      resetFlags: action,
      updateInstrumentToCreateOrModifyProperty: action,
      setInstrumentToCreateOrModify: action,
      fetchInstrument: action,
      fetchInstrumentCallback: action,
      fetchInstruments: action,
      fetchInstrumentsCallback: action,
      createInstrument: action,
      createInstrumentCallback: action,
      updateInstrument: action,
      updateInstrumentCallback: action,
      deleteInstrument: action,
      deleteInstrumentCallback: action,
      uploadFile: action,
      uploadFileCallback: action,
    })
    if (initialData) {
      if (initialData.instruments) {
        Object.values(initialData.instruments).forEach((element: any) => {
          if (element && element[1] && element[1].id) {
            this.instruments.set(element[1].id, new InstrumentModel(element[1]))
          } else if (element && element.id) {
            this.instruments.set(element.id, new InstrumentModel(element))
          }
        })
      }

      this.instrument = new InstrumentModel(initialData.instrument)
    }
  }

  public resetCreateOrUpdate = () => {
    this.resetFlags()
    this.instrumentToCreateOrModify = new InstrumentModel()
    this.selectedInstrumentId = -1
  }

  public resetFlags = () => {
    this.loading = false
    this.createdSuccessfully = false
    this.updatedSuccessfully = false
    this.modifying = false
  }

  public setFileInputChanged = (fileInputChanged: boolean) => {
    this.fileInputChanged = fileInputChanged
  }

  public updateInstrumentToCreateOrModifyProperty = (property: string, value: string) => {
    this.instrumentToCreateOrModify.updateProperty(property, value)
  }

  public setInstrumentToCreateOrModify = (id: number) => {
    if (this.instruments.has(id)) {
      this.instrumentToCreateOrModify = new InstrumentModel(this.instruments.get(id))
      this.selectedInstrumentId = id
    }
  }

  public fetchInstrument = (id: number) => {
    this.loading = true
    getInstrument(id, this.fetchInstrumentCallback)
  }

  public fetchInstrumentCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.instrument = new InstrumentModel(response.data)
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('Instrument not found')
    }

    this.loading = false
  }

  public fetchInstruments = () => {
    this.loading = true
    getInstruments(this.fetchInstrumentsCallback)
  }

  public fetchInstrumentsCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.instruments.clear()

      response.data.forEach((instrument: InstrumentModel) => {
        this.instruments.set(instrument.id, new InstrumentModel(instrument))
      })

      this.loaded = true
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('Instruments not found')
    }

    this.loading = false
  }

  public createInstrument = async (selectedFiles: any[]) => {
    const instrumentCreate = this.instrumentToCreateOrModify
    this.modifying = true

    if (this.fileInputChanged && selectedFiles && selectedFiles.length > 0) {
      const allPromise = selectedFiles.map(selectedFile =>
        this.uploadFile(selectedFile.file, selectedFile.type, instrumentCreate)
      )

      await Promise.all(allPromise)
    }

    if (!this.fileInputChanged || (this.fileInputChanged && this.fileUploaded)) {
      return createInstrument(
        this.instrumentToCreateOrModify.getCreateJson,
        this.createInstrumentCallback
      )
    }
  }

  public createInstrumentCallback = response => {
    if (isSuccessResponse(response)) {
      const instrument = new InstrumentModel(response.data)
      this.instruments.set(response.data.id, instrument)
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Instrument Created')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(`Error creating Instrument. ${response.data.message}`)
    }

    this.createdSuccessfully = true
    this.modifying = false
  }

  public updateInstrument = async (selectedFiles: any[]) => {
    const instrumentUpdate = this.instrumentToCreateOrModify
    this.modifying = true

    if (this.fileInputChanged && selectedFiles && selectedFiles.length > 0) {
      const allPromise = selectedFiles.map(selectedFile =>
        this.uploadFile(selectedFile.file, selectedFile.type, instrumentUpdate)
      )

      await Promise.all(allPromise)
    }
    if (!this.fileInputChanged || (this.fileInputChanged && this.fileUploaded)) {
      updateInstrument(
        this.instrumentToCreateOrModify.id,
        this.instrumentToCreateOrModify.getUpdateJson,
        this.updateInstrumentCallback
      )
    }
  }

  public updateInstrumentCallback = response => {
    if (isSuccessResponse(response)) {
      const instrument = new InstrumentModel(response.data)
      this.instruments.set(response.data.id, instrument)
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Instrument Updated')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(`Error updating Instrument. ${response.data.message}`)
    }

    this.modifying = false
    this.updatedSuccessfully = true
  }

  public deleteInstrument = () => {
    this.modifying = true
    return deleteInstrument(this.selectedInstrumentId, this.deleteInstrumentCallback)
  }

  public deleteInstrumentCallback = response => {
    if (isSuccessResponse(response)) {
      this.instruments.delete(this.selectedInstrumentId)
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(`Error deleting Instrument. ${response.data.message}`)
    }

    this.updatedSuccessfully = true
    this.modifying = false
  }

  public uploadFile = async (
    file: File,
    type: string,
    modelToModify: InstrumentModel
  ): Promise<void> => {
    let uploadPath = ''
    let fileIsPublic = false
    let success = false

    let fileType = FileType.NA
    let fullFilePath = ''
    let fileCatalogId = 0

    if (type === 'artworkUrl') {
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

          this.modifying = false
        }
      }
    )

    if (success) {
      if (type === 'artworkUrl') {
        modelToModify.setArtworkUrl(fullFilePath)
        modelToModify.setArtworkFileCatalogId(fileCatalogId)
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
      this.modifying = false
    }
  }
}

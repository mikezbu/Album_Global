import { action, observable, makeObservable } from 'mobx'
import { createFileCatalog, FileType, uploadFile } from 'src/common/api/file-catalog'

import { getStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import { getGenres, createGenre, deleteGenre, updateGenre, getGenre } from 'src/modules/genre/api'
import GenreModel from 'src/modules/genre/store/model/GenreModel'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export default class GenreStore {
  public genres = observable.map<number, GenreModel>()

  public genre = new GenreModel()

  public genreToCreateOrModify = new GenreModel()

  public selectedGenreId = -1

  public loading = false

  public loaded = false

  public modifying = false

  public updatedSuccessfully = false

  public createdSuccessfully = false

  public fileInputChanged = false

  public fileUploaded = false

  constructor(initialData: GenreStore = null) {
    makeObservable(this, {
      genres: observable,
      genre: observable,
      genreToCreateOrModify: observable,
      selectedGenreId: observable,
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
      updateGenreToCreateOrModifyProperty: action,
      setGenreToCreateOrModify: action,
      fetchGenre: action,
      fetchGenreCallback: action,
      fetchGenres: action,
      fetchGenresCallback: action,
      createGenre: action,
      createGenreCallback: action,
      updateGenre: action,
      updateGenreCallback: action,
      deleteGenre: action,
      deleteGenreCallback: action,
      uploadFile: action,
      uploadFileCallback: action,
    })

    if (initialData) {
      if (initialData.genres) {
        Object.values(initialData.genres).forEach((element: any) => {
          if (element && element[1] && element[1].id) {
            this.genres.set(element[1].id, new GenreModel(element[1]))
          } else if (element && element.id) {
            this.genres.set(element.id, new GenreModel(element))
          }
        })
      }

      this.genre = new GenreModel(initialData.genre)
    }
  }

  public resetCreateOrUpdate = () => {
    this.resetFlags()
    this.genreToCreateOrModify = new GenreModel()
    this.selectedGenreId = -1
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

  public updateGenreToCreateOrModifyProperty = (property: string, value: string) => {
    this.genreToCreateOrModify.updateProperty(property, value)
  }

  public setGenreToCreateOrModify = (id: number) => {
    if (this.genres.has(id)) {
      this.genreToCreateOrModify = new GenreModel(this.genres.get(id))
      this.selectedGenreId = id
    }
  }

  public fetchGenre = (id: number) => {
    this.loading = true
    getGenre(id, this.fetchGenresCallback)
  }

  public fetchGenreCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.genre = new GenreModel(response.data)
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('Genre not found')
    }

    this.loading = false
  }

  public fetchGenres = () => {
    this.loading = true
    getGenres(this.fetchGenresCallback)
  }

  public fetchGenresCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.genres.clear()

      response.data.forEach((genre: GenreModel) => {
        this.genres.set(genre.id, new GenreModel(genre))
      })

      this.loaded = true
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('Genres not found')
    }

    this.loading = false
  }

  public createGenre = async (selectedFiles: any[]) => {
    const genreCreate = this.genreToCreateOrModify
    this.modifying = true

    if (this.fileInputChanged && selectedFiles && selectedFiles.length > 0) {
      const allPromise = selectedFiles.map(selectedFile =>
        this.uploadFile(selectedFile.file, selectedFile.type, genreCreate)
      )

      await Promise.all(allPromise)
    }

    if (!this.fileInputChanged || (this.fileInputChanged && this.fileUploaded)) {
      return createGenre(this.genreToCreateOrModify.getCreateJson, this.createGenreCallback)
    }
  }

  public createGenreCallback = response => {
    if (isSuccessResponse(response)) {
      const genre = new GenreModel(response.data)
      this.genres.set(response.data.id, genre)
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Genre Created')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(`Error Creating Genre. ${response.data.message}`)
    }

    this.createdSuccessfully = true
    this.modifying = false
  }

  public updateGenre = async (selectedFiles: any[]) => {
    const genreUpdate = this.genreToCreateOrModify
    this.modifying = true

    if (this.fileInputChanged && selectedFiles && selectedFiles.length > 0) {
      const allPromise = selectedFiles.map(selectedFile =>
        this.uploadFile(selectedFile.file, selectedFile.type, genreUpdate)
      )

      await Promise.all(allPromise)
    }
    if (!this.fileInputChanged || (this.fileInputChanged && this.fileUploaded)) {
      updateGenre(
        this.genreToCreateOrModify.id,
        this.genreToCreateOrModify.getUpdateJson,
        this.updateGenreCallback
      )
    }
  }

  public updateGenreCallback = response => {
    if (isSuccessResponse(response)) {
      const genre = new GenreModel(response.data)
      this.genres.set(response.data.id, genre)
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Genre Updated')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(`Error updating Genre. ${response.data.message}`)
    }

    this.modifying = false
    this.updatedSuccessfully = true
  }

  public deleteGenre = () => {
    this.modifying = true
    return deleteGenre(this.selectedGenreId, this.deleteGenreCallback)
  }

  public deleteGenreCallback = response => {
    if (isSuccessResponse(response)) {
      this.genres.delete(this.selectedGenreId)
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(`Error deleting Genre: ${response.data.message}`)
    }

    this.updatedSuccessfully = true
    this.modifying = false
  }

  public uploadFile = async (
    file: File,
    type: string,
    modelToModify: GenreModel
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

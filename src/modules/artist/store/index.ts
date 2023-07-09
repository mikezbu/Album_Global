import { action, observable, runInAction, makeObservable } from 'mobx'

import { createFileCatalog, FileType, uploadFile } from 'src/common/api/file-catalog'
import { getStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import Paginator from 'src/common/store/util/Paginator'
import {
  createArtist,
  findArtistByUserId,
  getAllArtists,
  getArtist,
  updateArtist,
} from 'src/modules/artist/api'
import ArtistModel from 'src/modules/artist/store/model/ArtistModel'
import { TrackModel } from 'src/modules/track/store'
import { isSuccessResponse } from 'src/util/request/RequestUtils'

export default class ArtistStore extends Paginator {
  public artists = observable.map<number, ArtistModel>()

  public artist = new ArtistModel()

  public artistToCreateOrModify = new ArtistModel()

  public selectedTrack: TrackModel = null

  public selectedTrackIdIndex = -1

  public selectedTrackId = -1

  public hasFieldChanged = false

  public hasError = false

  public artistCreated = false

  public artistUpdated = false

  public heroImageUrl = ''

  public profileImageUrl = ''

  public loading = false

  public updating = false

  public fileInputChanged = false

  public fileUploaded = false

  constructor(initialData: ArtistStore = null) {
    super()

    makeObservable(this, {
      artists: observable,
      artist: observable,
      artistToCreateOrModify: observable,
      selectedTrack: observable,
      selectedTrackIdIndex: observable,
      selectedTrackId: observable,
      hasFieldChanged: observable,
      hasError: observable,
      artistCreated: observable,
      artistUpdated: observable,
      heroImageUrl: observable,
      profileImageUrl: observable,
      loading: observable,
      updating: observable,
      fileInputChanged: observable,
      fileUploaded: observable,
      reset: action,
      resetFlags: action,
      setHasError: action,
      setArtistCreated: action,
      setFileInputChanged: action,
      setHasFiledChanged: action,
      handleArtistToCreateOrModifyInputChange: action,
      setArtistToCreateOrModify: action,
      getArtistById: action,
      getArtistByIdForUpdate: action,
      getArtistByUserIdForUpdate: action,
      fetchAllArtistsAsAdmin: action,
      fetchAllArtistsAsAdminCallback: action,
      fetchArtistCallback: action,
      fetchArtistForUpdateCallback: action,
      createArtist: action,
      createArtistCallback: action,
      updateVerified: action,
      updateProfileLocked: action,
      updateProfileLockedCallback: action,
      updateVerifiedCallback: action,
      updateArtist: action,
      updateArtistCallback: action,
      uploadFile: action,
      uploadFileCallback: action,
    })

    if (initialData) {
      if (initialData.artist) {
        this.artist = new ArtistModel(initialData.artist)
      }

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

  public reset = () => {
    this.artistToCreateOrModify = new ArtistModel()
    this.hasFieldChanged = false
    this.hasError = false
    this.artistCreated = false
    this.artistUpdated = false
    this.updating = false
    this.fileUploaded = false
    this.fileInputChanged = false
  }

  public resetFlags = () => {
    this.hasFieldChanged = false
    this.hasError = false
    this.artistCreated = false
    this.artistUpdated = false
    this.updating = false
    this.fileUploaded = false
    this.fileInputChanged = false
  }

  public setHasError = (value: boolean) => {
    this.hasError = value
  }

  public setArtistCreated = (value: boolean) => {
    this.artistCreated = value
  }

  public setFileInputChanged = (fileInputChanged: boolean) => {
    this.fileInputChanged = fileInputChanged

    if (fileInputChanged) {
      this.hasFieldChanged = true
    }
  }

  public setHasFiledChanged = (hasFieldChanged: boolean) => {
    this.hasFieldChanged = hasFieldChanged
  }

  public setArtistToCreateOrModify = artist => {
    this.artistToCreateOrModify = new ArtistModel(artist)
  }

  public handleArtistToCreateOrModifyInputChange = (field: string, value: string) => {
    this.artistToCreateOrModify.updateProperty(field, value)
    this.hasFieldChanged = true
  }

  public getArtistById(id: number) {
    getArtist(id, this.fetchArtistCallback)
  }

  public getArtistByIdForUpdate(id: number) {
    this.updating = true
    getArtist(id, this.fetchArtistForUpdateCallback)
  }

  public getArtistByUserIdForUpdate(userId: number) {
    this.loading = true
    findArtistByUserId(userId, this.fetchArtistForUpdateCallback)
  }

  public fetchAllArtistsAsAdmin() {
    this.loading = true

    getAllArtists(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      this.fetchAllArtistsAsAdminCallback
    )
  }

  public fetchAllArtistsAsAdminCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.artists.clear()

      response.data.content.forEach(element => {
        this.artists.set(element.id, new ArtistModel(element))
      })
      this.totalCount = response.data.totalElements
    } else {
      getStore().appState.showError('Artist not found')
    }

    this.loading = false
  }

  public fetchArtistCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      const artist = new ArtistModel()
      artist.fromAPIModel(response.data)
      this.artist = artist
    } else {
      getStore().appState.showError('Artist not found')
    }
  }

  public fetchArtistForUpdateCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.artistToCreateOrModify = new ArtistModel(response.data)
    } else {
      getStore().appState.showError('Artist not found')
    }

    this.loading = false
  }

  public createArtist = async (selectedFiles: any[]) => {
    this.updating = true
    if (this.fileInputChanged && selectedFiles && selectedFiles.length > 0) {
      const allPromise = selectedFiles.map(selectedFile =>
        this.uploadFile(selectedFile.file, selectedFile.type, this.artistToCreateOrModify)
      )

      await Promise.all(allPromise)
    }

    return createArtist(this.artistToCreateOrModify.asJson, this.createArtistCallback)
  }

  public createArtistCallback = (response: any) => {
    if (isSuccessResponse(response)) {
      this.artistCreated = true
      getStore().userStore.user.setHasArtistProfile(true)
      getStore().userStore.user.setArtistId(response.data.id)
      getStore().userStore.user.setHasArtistProfile(true)
      getStore().userStore.user.setProfilePictureUrl(response.data.profileImageUrl)
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('Error: ' + response.data.message)
    }

    this.updating = false
  }

  public updateVerified = (artistId: number, verified: boolean) => {
    this.updating = true

    updateArtist(artistId, { verified }, this.updateVerifiedCallback)
  }

  public updateProfileLocked = (artistId: number, profileLocked: boolean) => {
    this.updating = true

    updateArtist(artistId, { profileLocked }, this.updateProfileLockedCallback)
  }

  public updateProfileLockedCallback = (response: any) => {
    if (isSuccessResponse(response)) {
      this.artists.get(response.data.id).profileLocked = response.data.profileLocked
      getStore().appState.showSuccess('Profile locked updated successfully')
    } else {
      getStore().appState.showError('Error: ' + response.data.message)
    }

    this.updating = false
  }

  public updateVerifiedCallback = (response: any) => {
    if (isSuccessResponse(response)) {
      this.artists.get(response.data.id).verified = response.data.verified
      getStore().appState.showSuccess('Verified updated successfully')
    } else {
      getStore().appState.showError
      getStore().appState.setMessage('Error: ' + response.data.message)
    }

    this.updating = false
  }

  public updateArtist = async (selectedFiles: any[]) => {
    if (this.fileInputChanged && selectedFiles && selectedFiles.length > 0) {
      this.updating = true
      const allPromise = selectedFiles.map(selectedFile =>
        this.uploadFile(selectedFile.file, selectedFile.type, this.artistToCreateOrModify)
      )

      await Promise.all(allPromise)
    }

    if (!this.fileInputChanged || (this.fileInputChanged && this.fileUploaded)) {
      runInAction(() => {
        this.updating = true
      })
      return updateArtist(
        this.artistToCreateOrModify.id,
        this.artistToCreateOrModify.asJson,
        this.updateArtistCallback
      )
    }
  }

  public updateArtistCallback = (response: any) => {
    if (isSuccessResponse(response)) {
      this.artistUpdated = true
      this.hasFieldChanged = false
      this.hasError = false

      getStore().appState.showSuccess('Updated Successfully!')
      getStore().userStore.getUserInformation() // Update profile picture incase it has changed
    } else {
      getStore().appState.showError('Error: ' + response.data.message)
    }

    this.updating = false
  }

  public uploadFile = async (
    file: File,
    type: string,
    modelToModify: ArtistModel
  ): Promise<void> => {
    let uploadPath = ''
    let fileIsPublic = false
    let success = false

    let fileType = FileType.NA
    let fullFilePath = ''
    let fileCatalogId = 0

    if (type === 'heroImageUrl' || type === 'profileImageUrl') {
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
          getStore().appState.showError(
            `An error occurred while updating file. ${response.data ? response.data.message : ''}`
          )

          this.updating = false
        }
      }
    )

    if (success) {
      if (type === 'heroImageUrl') {
        modelToModify.setHeroImageUrl(fullFilePath)
        modelToModify.setHeroImageFileCatalogId(fileCatalogId)
      }
      if (type === 'profileImageUrl') {
        modelToModify.setProfileImageUrl(fullFilePath)
        modelToModify.setProfileImageFileCatalogId(fileCatalogId)
      }

      return uploadFile(uploadPath, file, fileIsPublic, this.uploadFileCallback)
    }
  }

  public uploadFileCallback = (response: any) => {
    if (isSuccessResponse(response)) {
      this.fileUploaded = true
    } else {
      getStore().appState.showError('An error occurred while updating file')
      this.updating = false
    }
  }
}

export { ArtistModel }

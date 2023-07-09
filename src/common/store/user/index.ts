import { action, observable, runInAction, makeObservable } from 'mobx'

import { createFileCatalog, FileType, uploadFile } from 'src/common/api/file-catalog'
import { getStore } from 'src/common/store'
import {
  changePassword,
  createPassword,
  deleteUser,
  forgotPassword,
  getAllUsers,
  getUserFromRequestContext,
  resendEmailVerification,
  resetPassword,
  updateUser,
  verifyEmail,
} from 'src/common/store/api/user'
import { MessageVariant } from 'src/common/store/AppState'
import UserModel from 'src/common/store/user/model/UserModel'
import { isSuccessResponse } from 'src/util/request/RequestUtils'
import Paginator from '../util/Paginator'

export default class UserStore extends Paginator {
  public users = observable.map<number, UserModel>()

  public user: UserModel = new UserModel()

  public userUpdate: UserModel = new UserModel()

  public loading = false

  public emailError = false

  public emailExists = false

  public firstNameError = false

  public lastNameError = false

  public currentPassword = ''

  public currentPasswordError = false

  public newPassword = ''

  public emailVerificationResent = false

  public newPasswordError = false

  public newPasswordConfirmation = ''

  public newPasswordConfirmationError = false

  public newPasswordsDoNotMatch = false

  public newPasswordNotLongEnough = false

  public passwordFieldChanged = false

  public passwordResetSuccess = false

  public passwordCreateToken = ''

  public passwordCreateSuccess = false

  public passwordResetEmailSent = false

  public formError = false

  public fieldChanged = false

  public error = false

  public accountDeleted = false

  public errorMessage = ''

  public updated = false

  public fileUploaded = false

  public fileInputChanged = false

  public updating = false

  public emailVerified = false

  constructor(initialData: UserStore = null) {
    super()

    makeObservable<
      this,
      | 'newPasswordFieldsHaveErrors'
      | 'currentPasswordFieldsHaveErrors'
      | 'forgotPasswordCallback'
      | 'resetPasswordCallback'
      | 'createPasswordCallback'
      | 'deleteAccountCallback'
      | 'changePasswordCallback'
      | 'resendEmailVerificationCallback'
      | 'updateUserInfoCallback'
      | 'updateUserInfoNoMessageCallback'
      | 'getUserForUpdateCallback'
      | 'updateUserCallback'
    >(this, {
      users: observable,
      user: observable,
      userUpdate: observable,
      loading: observable,
      emailError: observable,
      emailExists: observable,
      firstNameError: observable,
      lastNameError: observable,
      currentPassword: observable,
      currentPasswordError: observable,
      newPassword: observable,
      emailVerificationResent: observable,
      newPasswordError: observable,
      newPasswordConfirmation: observable,
      newPasswordConfirmationError: observable,
      newPasswordsDoNotMatch: observable,
      newPasswordNotLongEnough: observable,
      passwordFieldChanged: observable,
      passwordResetSuccess: observable,
      passwordCreateToken: observable,
      passwordCreateSuccess: observable,
      passwordResetEmailSent: observable,
      formError: observable,
      fieldChanged: observable,
      error: observable,
      accountDeleted: observable,
      errorMessage: observable,
      updated: observable,
      fileUploaded: observable,
      fileInputChanged: observable,
      updating: observable,
      emailVerified: observable,
      resetFlags: action,
      resetValidationFlags: action,
      resetPasswordChangeFields: action,
      reset: action,
      getUserInformation: action,
      getUserForUpdate: action,
      selectUserToUpdateById: action,
      submissionHasErrors: action,
      newPasswordFieldsHaveErrors: action,
      currentPasswordFieldsHaveErrors: action,
      setValue: action,
      setFileInputChanged: action,
      setPasswordCreateToken: action,
      updatePasswordValue: action,
      updateError: action,
      updateUserInfo: action,
      resendEmailVerification: action,
      changePassword: action,
      deleteAccount: action,
      forgotPassword: action,
      verifyEmail: action,
      resetPassword: action,
      createPassword: action,
      uploadFile: action,
      fetchAllUsersAsAdmin: action,
      fetchAllUsersAsAdminCallback: action,
      adminUpdateUser: action,
      uploadFileCallback: action,
      verifyEmailCallback: action,
      forgotPasswordCallback: action,
      resetPasswordCallback: action,
      createPasswordCallback: action,
      deleteAccountCallback: action,
      changePasswordCallback: action,
      resendEmailVerificationCallback: action,
      updateUserInfoCallback: action,
      updateUserInfoNoMessageCallback: action,
      updateUserCallback: action,
      getUserInformationCallback: action,
      getUserForUpdateCallback: action,
    })

    if (initialData) {
      Object.keys(initialData).forEach(element => {
        this[element] = initialData[element]
        this.users = observable.map<number, UserModel>()
      })

      if (initialData.users) {
        Object.values(initialData.users).forEach((element: any) => {
          if (element && element[1] && element[1].id) {
            this.users.set(element[1].id, new UserModel(element[1]))
          } else if (element && element.id) {
            this.users.set(element.id, new UserModel(element))
          }
        })
      }
    }
  }

  public resetFlags = (): void => {
    this.accountDeleted = false
    this.updated = false
    this.fileUploaded = false
    this.fileInputChanged = false
    this.updating = false
    this.emailVerified = false
    this.updated = false
    this.passwordCreateSuccess = false

    this.resetValidationFlags()
  }

  public resetValidationFlags = (): void => {
    this.error = false
    this.emailError = false
    this.emailExists = false
    this.emailVerificationResent = false
    this.firstNameError = false
    this.lastNameError = false
    this.currentPasswordError = false
    this.newPasswordError = false
    this.newPasswordConfirmationError = false
    this.newPasswordsDoNotMatch = false
    this.newPasswordNotLongEnough = false
    this.passwordFieldChanged = false
    this.fieldChanged = false
    this.formError = false
  }

  public resetPasswordChangeFields = () => {
    this.currentPassword = ''
    this.newPasswordConfirmation = ''
    this.newPassword = ''

    this.resetFlags()
  }

  public reset = () => {
    this.user = new UserModel()
    this.users.clear()
    this.loading = false
    this.errorMessage = ''
    this.passwordCreateToken = ''
    this.resetFlags()
  }

  public getUserInformation = (): void => {
    this.loading = true
    getUserFromRequestContext(this.getUserInformationCallback)
  }

  public getUserForUpdate = (): void => {
    this.loading = true
    getUserFromRequestContext(this.getUserForUpdateCallback)
  }

  public selectUserToUpdateById = (id: number) => {
    this.userUpdate = this.users.get(id)
  }

  public submissionHasErrors = (): boolean => {
    this.resetValidationFlags()

    let error = false

    if (this.user.firstName === '') {
      this.firstNameError = true
      error = true
    }

    if (this.user.lastName === '') {
      this.lastNameError = true
      error = true
    }

    if (this.user.email === '') {
      this.emailError = true
      error = true
    }

    if (error) {
      this.formError = true
    }

    return error
  }

  private newPasswordFieldsHaveErrors = (): boolean => {
    let error = false

    if (this.newPassword === '') {
      this.newPasswordError = true
      error = true
    }

    if (this.newPasswordConfirmation === '') {
      this.newPasswordConfirmationError = true
      error = true
    }

    if (
      !this.newPasswordError &&
      !this.newPasswordConfirmationError &&
      this.newPassword !== this.newPasswordConfirmation
    ) {
      this.newPasswordsDoNotMatch = true
      this.newPasswordConfirmationError = true
      this.newPasswordError = true
      error = true
    }

    if (
      !this.newPasswordError &&
      !this.newPasswordConfirmationError &&
      !this.newPasswordsDoNotMatch &&
      this.newPassword.length < 6
    ) {
      this.newPasswordNotLongEnough = true
      this.newPasswordConfirmationError = true
      this.newPasswordError = true
      error = true
    }

    if (error) {
      this.formError = true
    }

    return error
  }

  private currentPasswordFieldsHaveErrors = (): boolean => {
    let error = false

    if (this.currentPassword === '') {
      this.currentPasswordError = true
      error = true
    }

    if (error) {
      this.formError = true
    }

    return error
  }

  public changePasswordFieldsHaveErrors = (): boolean => {
    this.resetValidationFlags()
    return this.currentPasswordFieldsHaveErrors() || this.newPasswordFieldsHaveErrors()
  }

  public setValue = (name: string, value: string): void => {
    this.userUpdate.setValue(name, value)
    this.updateError(name)
    this.fieldChanged = true
  }

  public setEnabled = (enabled: boolean) => {
    this.userUpdate.setEnabled(enabled)
  }

  public setAccountLocked = (accountLocked: boolean) => {
    this.userUpdate.setAccountLocked(accountLocked)
  }

  public setAccountExpired = (accountExpired: boolean) => {
    this.userUpdate.setAccountExpired(accountExpired)
  }

  public setFileInputChanged = (fileInputChanged: boolean) => {
    this.fileInputChanged = fileInputChanged

    if (fileInputChanged) {
      this.fieldChanged = true
    }
  }

  public setPasswordCreateToken = (passwordCreateToken: string): void => {
    this.passwordCreateToken = passwordCreateToken
  }

  public updatePasswordValue = (name: string, value: string): void => {
    this[name] = value
    this.updateError(name)
    if (this.newPassword.length && this.newPasswordConfirmation.length) {
      this.passwordFieldChanged = true
    }
  }

  public updateError = (field: string): void => {
    if (this[`${field}Error`]) {
      this[`${field}Error`] = false
    }
  }

  public fetchAllUsersAsAdmin() {
    this.loading = true

    getAllUsers(
      this.pageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      this.fetchAllUsersAsAdminCallback
    )
  }

  public fetchAllUsersAsAdminCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.users.clear()

      response.data.content.forEach(element => {
        this.users.set(element.id, new UserModel(element))
      })
      this.totalCount = response.data.totalElements
    } else {
      getStore().appState.showError('Users not found')
    }

    this.loading = false
  }

  public updateUserInfo = async (selectedFiles: any[]) => {
    if (!this.submissionHasErrors()) {
      if (this.fileInputChanged && selectedFiles && selectedFiles.length > 0) {
        runInAction(() => {
          this.loading = true
        })

        const allPromise = selectedFiles.map(selectedFile =>
          this.uploadFile(selectedFile.file, selectedFile.type, this.userUpdate)
        )

        await Promise.all(allPromise)
      }

      if (!this.fileInputChanged || (this.fileInputChanged && this.fileUploaded)) {
        runInAction(() => {
          this.loading = true
        })
        updateUser(
          this.userUpdate.id,
          this.userUpdate.getAsUpdateJson(),
          this.updateUserInfoCallback
        )
      }
    }
  }

  public adminUpdateUser = () => {
    updateUser(this.userUpdate.id, this.userUpdate.getAsAdminUpdateJson(), this.updateUserCallback)
  }

  public resendEmailVerification = () => {
    resendEmailVerification(this.user.id, this.resendEmailVerificationCallback)
  }

  public changePassword = (): void => {
    if (!this.changePasswordFieldsHaveErrors()) {
      this.updating = true
      changePassword(this.user.id, this.getPasswordChangeAsJson(), this.changePasswordCallback)
    }
  }

  public deleteAccount = (): void => {
    this.updating = false
    deleteUser(getStore().userStore.user.id, this.deleteAccountCallback)
  }

  public forgotPassword = (email: string): void => {
    forgotPassword({ email }, this.forgotPasswordCallback)
  }

  public verifyEmail = (token: string) => {
    this.updating = true
    verifyEmail({ emailVerificationToken: token }, this.verifyEmailCallback)
  }

  public resetPassword = (passwordResetToken: string, newPassword: string): void => {
    resetPassword({ passwordResetToken, newPassword }, this.resetPasswordCallback)
  }

  public createPassword = (): void => {
    if (!this.newPasswordFieldsHaveErrors()) {
      this.updating = false
      createPassword(this.getPasswordCreateAsJson(), this.createPasswordCallback)
    }
  }

  public uploadFile = async (file: File, type: string, modelToModify: UserModel): Promise<void> => {
    let uploadPath = ''
    let fileIsPublic = false
    let success = false

    let fileType = FileType.NA
    let fullFilePath = ''
    let fileCatalogId = 0

    if (type === 'profilePictureUrl') {
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
      if (type === 'profilePictureUrl') {
        modelToModify.setProfilePictureUrl(fullFilePath)
        modelToModify.setProfilePictureFileCatalogId(fileCatalogId)
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

  public updateArtistSignUpOnBoardingStep = (artistSignUpOnBoardingStep: number) => {
    return updateUser(
      this.userUpdate.id,
      { artistSignUpOnBoardingStep },
      this.updateUserInfoNoMessageCallback
    )
  }

  public verifyEmailCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.emailVerified = true
    } else {
      this.error = true
      this.errorMessage = 'This link has expired'
    }

    this.updating = false
  }

  private forgotPasswordCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.reset()
      this.passwordResetEmailSent = true
    } else {
      this.error = true
      this.errorMessage = 'An account with that email was not found.'
    }
  }

  private resetPasswordCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.error = false
      this.passwordResetSuccess = true
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(response.data.message)
    }
  }

  private createPasswordCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.error = false
      this.passwordCreateSuccess = true
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Password created successfully!')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(response.data.message)
    }

    this.updating = false
  }

  private deleteAccountCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      getStore().authenticationStore.logout()
      this.accountDeleted = true
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Account deleted successfully!')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(response.data.message)
    }

    this.updating = false
  }

  private changePasswordCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.resetPasswordChangeFields()
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Password changed successfully!')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(response.data.message)
    }

    this.updating = false
  }

  private resendEmailVerificationCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.emailVerificationResent = true
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Email sent successfully!')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(response.data.message)
    }
  }

  private updateUserInfoCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.resetFlags()
      this.user = new UserModel(response.data)
      this.updated = true
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('User Updated Successfully')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(response.data.message)
    }

    this.loading = false
  }

  private updateUserInfoNoMessageCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.updated = true
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(response.data.message)
    }

    this.loading = false
  }

  private updateUserCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      const user = new UserModel(response.data)
      this.users.set(response.data.id, user)
      this.updated = true
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('Information Updated Successfully')
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage(response.data.message)
    }

    this.loading = false
  }

  public getUserInformationCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.user = new UserModel(response.data)
      getStore().cartStore.initializeCart()
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('Error loading user information')
    }

    this.loading = false
  }

  private getUserForUpdateCallback = (response: any): void => {
    if (isSuccessResponse(response)) {
      this.userUpdate = new UserModel(response.data)
    } else {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Error)
      getStore().appState.setMessage('Error loading user information')
    }

    this.loading = false
  }

  private getPasswordChangeAsJson = () => ({
    currentPassword: this.currentPassword,
    newPassword: this.newPassword,
  })

  private getPasswordCreateAsJson = () => ({
    passwordCreateToken: this.passwordCreateToken,
    newPassword: this.newPassword,
  })
}

export { UserModel }

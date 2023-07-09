import { Avatar, IconButton, Typography } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React, { ChangeEvent } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'

import ImagePreview from 'src/common/components/image/ImagePreview'
import Loading from 'src/common/components/layout/Loading'
import { ArtistStore, UserStore } from 'src/common/store'
import ImageCropper from 'src/common/components/image/ImageCropper'
import Modal from 'src/common/components/modal/Modal'
import ArtistForm from './ArtistForm'
import ArtistModify from './ArtistModify'

export interface IArtistModifyContainerProps {
  artistStore?: ArtistStore
  userStore?: UserStore
  onComplete?: () => void
  createArtist?: boolean
  onBack?: () => void
}

const ArtistModifyContainer = inject(
  'artistStore',
  'userStore'
)(
  observer(
    class ArtistModifyContainer extends React.Component<IArtistModifyContainerProps> {
      public state = {
        selectedFiles: new Map<string, any>(),
        error: [],
        profilePictureCropperModalOpen: false,
        heroPictureCropperModalOpen: false,
      }

      private readonly _artistStore: ArtistStore
      private readonly _userStore: UserStore

      constructor(props: Readonly<IArtistModifyContainerProps>) {
        super(props)
        this._artistStore = props.artistStore
        this._userStore = props.userStore

        this._artistStore.reset()
      }

      public componentDidMount() {
        if (this._userStore.user.hasArtistProfile) {
          this._artistStore.getArtistByUserIdForUpdate(this._userStore.user.id)
        }
      }

      public componentDidUpdate() {
        if (this._artistStore.artistUpdated || this._artistStore.artistCreated) {
          this._artistStore.resetFlags()
          this.setState({
            selectedFiles: new Map<string, any>(),
            error: [],
          })
        }
      }

      public render() {
        const artist = this._artistStore.artistToCreateOrModify

        const heroImgFile = this.state.selectedFiles.get('heroImageUrl')
        const heroImgFileError = this.state.error.find(error => error.type === 'heroImageUrl')

        const pictureFile = this.state.selectedFiles.get('profileImageUrl')
        const pictureFileError = this.state.error.find(error => error.type === 'profileImageUrl')

        if (this._artistStore.loading) {
          return <Loading />
        }

        return (
          <div className="flex w-full flex-col">
            <div className="relative">
              {heroImgFile && heroImgFile.cropped ? (
                <ImagePreview
                  id={artist.id}
                  className={`max-h-80 overflow-hidden ${
                    this._artistStore.artist.heroImageUrl.length === 0 && 'h-36 sm:h-80'
                  }`}
                  src={
                    heroImgFile && heroImgFile.imagePreview
                      ? heroImgFile.imagePreview
                      : artist.heroImageUrl
                  }
                />
              ) : (
                <ImagePreview
                  id={artist.id}
                  className={`max-h-80 overflow-hidden ${
                    this._artistStore.artist.heroImageUrl.length === 0 && 'h-36 sm:h-80'
                  }`}
                  src={artist.heroImageUrl}
                />
              )}
              <input
                accept="image/*"
                className="hidden"
                id="background-image-upload"
                type="file"
                onChange={this.onChangeUploadImage('heroImageUrl')}
              />
              <label htmlFor="background-image-upload">
                <div className="absolute bottom-0 flex h-14 w-full cursor-pointer bg-black bg-opacity-75" />
                <div className="absolute bottom-4 left-2/4 cursor-pointer text-center">
                  {this.props.createArtist ? 'Upload' : 'Change'}
                </div>
              </label>
            </div>

            <Modal
              content={
                pictureFile ? (
                  <>
                    <ImageCropper
                      src={pictureFile.imagePreview}
                      filename={pictureFile.file.name}
                      aspect={1}
                      circularCrop={true}
                      onCropComplete={this.onCropComplete('profileImageUrl')}
                    />
                    <div className="flex rounded bg-background-dark py-4 px-2">
                      <IconButton
                        aria-label="Delete"
                        color="inherit"
                        onClick={() => {
                          this.removeSelectedFile(pictureFile.type)
                          this.setState({ profilePictureCropperModalOpen: false })
                        }}
                        size="large"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>

                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="caption">{pictureFile.file.name}</Typography>
                        <div>
                          <Typography variant="caption">
                            {(pictureFile.file.size / 1000000).toFixed(2)} MB
                          </Typography>
                        </div>
                      </div>
                    </div>
                    {pictureFileError && (
                      <Typography variant="caption" color="error">
                        {pictureFileError.message}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="caption">No Image Selected</Typography>
                )
              }
              onClose={() => this.setState({ profilePictureCropperModalOpen: false })}
              open={this.state.profilePictureCropperModalOpen}
              title={'Crop your image'}
              maxWidth="sm"
            />
            <Modal
              content={
                heroImgFile ? (
                  <>
                    <ImageCropper
                      src={heroImgFile.imagePreview}
                      filename={heroImgFile.file.name}
                      aspect={16 / 6}
                      onCropComplete={this.onCropComplete('heroImageUrl')}
                    />
                    <div className="flex rounded bg-background-dark py-4 px-2">
                      <IconButton
                        aria-label="Delete"
                        color="inherit"
                        onClick={() => {
                          this.removeSelectedFile(heroImgFile.type)
                          this.setState({ heroPictureCropperModalOpen: false })
                        }}
                        size="large"
                        className="mr-2"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>

                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="caption">{heroImgFile.file.name}</Typography>
                        <div>
                          <Typography variant="caption">
                            {(heroImgFile.file.size / 1000000).toFixed(2)} MB
                          </Typography>
                        </div>
                      </div>
                    </div>
                    {heroImgFileError && (
                      <Typography variant="caption" color="error">
                        {heroImgFileError.message}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="caption">No Image Selected</Typography>
                )
              }
              onClose={() => this.setState({ heroPictureCropperModalOpen: false })}
              open={this.state.heroPictureCropperModalOpen}
              title={'Crop your image'}
              maxWidth="sm"
            />

            <div className="-mt-6 flex items-center justify-between py-0 px-4">
              <div className="flex items-center">
                <div className="relative -mt-8 sm:-mt-10 ">
                  {pictureFile && pictureFile.cropped ? (
                    <Avatar
                      className="h-24 w-24 rounded-full sm:h-32 sm:w-32"
                      src={pictureFile.imagePreview}
                      alt={artist.name}
                    />
                  ) : (
                    <Avatar
                      className="h-24 w-24 rounded-full sm:h-32 sm:w-32"
                      src={artist.profileImageUrl}
                      alt={artist.name}
                    />
                  )}

                  <input
                    accept="image/*"
                    className="hidden"
                    id="profile-picture-upload"
                    type="file"
                    onChange={this.onChangeUploadImage('profileImageUrl')}
                  />
                  <label htmlFor="profile-picture-upload">
                    <div className="absolute top-12 flex h-12 w-24 rounded-b-full bg-black bg-opacity-75 sm:top-16 sm:h-16 sm:w-32" />
                    <div className="b-0 absolute top-16/9 flex w-full cursor-pointer items-center justify-center sm:pt-2">
                      {this.props.createArtist ? 'Upload' : 'Change'}
                    </div>
                  </label>
                </div>
                <div className="ml-6 pt-8">
                  <div className="text-xl font-semibold sm:text-2xl">{artist.name}</div>
                  <div className="text-sm font-normal text-gray-400">{artist.location}</div>
                </div>
              </div>
            </div>
            <ArtistModify
              selectedFiles={this.state.selectedFiles}
              onComplete={this.props.onComplete}
              createArtist={this.props.createArtist}
              onBack={this.props.onBack}
            />
          </div>
        )
      }

      private onCropComplete = (type: string) => (imageBlob: any) => {
        if (imageBlob) {
          const file = imageBlob as File

          const selectedFiles = this.state.selectedFiles
          selectedFiles.set(type, {
            file,
            imagePreview: window.URL.createObjectURL(file),
            type,
            cropped: true,
          })

          this._artistStore.setFileInputChanged(true)
          this.setState({
            selectedFiles,
            profilePictureCropperModalOpen: false,
            heroPictureCropperModalOpen: false,
          })
        }
      }

      private onChangeUploadImage = (type: string) => (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files)

        // 5MB Limit
        if (files[0] && files[0].size / 1000000 <= 5) {
          this._artistStore.setFileInputChanged(true)

          const selectedFiles = this.state.selectedFiles

          selectedFiles.set(type, {
            file: files[0],
            imagePreview: window.URL.createObjectURL(files[0]),
            type,
            cropped: false,
          })

          this.setState({
            selectedFiles,
            error: this.state.error.filter(error => error.type !== type),
          })

          if (type === 'profileImageUrl') {
            this.setState({
              profilePictureCropperModalOpen: true,
            })
          } else if (type === 'heroImageUrl') {
            this.setState({
              heroPictureCropperModalOpen: true,
            })
          }
        } else {
          this.state.error.push({
            hasError: true,
            type,
            message: 'File is too big, select an image less than 5MB',
          })
          this.setState({
            error: this.state.error,
          })
        }

        event.target.value = null
      }

      private removeSelectedFile = (type: string) => {
        const selectedFiles = this.state.selectedFiles
        selectedFiles.delete(type)

        this.setState({
          selectedFiles,
          error: this.state.error.filter(error => error.type === type),
        })

        if (!this.state.selectedFiles || this.state.selectedFiles.size === 0) {
          this._userStore.setFileInputChanged(false)
        }
      }
    }
  )
)

export default ArtistModifyContainer

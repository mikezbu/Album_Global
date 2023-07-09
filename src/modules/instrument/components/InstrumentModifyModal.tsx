import { Button, IconButton, TextField, Typography } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React, { ChangeEvent } from 'react'
import ImagePreview from 'src/common/components/image/ImagePreview'
import DeleteIcon from '@mui/icons-material/Delete'

import Loading from 'src/common/components/layout/Loading'
import Modal from 'src/common/components/modal/Modal'
import { InstrumentStore } from 'src/common/store'
import confirm from 'src/util/ConfirmationDialog'
import ImageCropperModal from 'src/common/components/image/ImageCropperModal'

interface IInstrumentModifyModal {
  instrumentStore?: InstrumentStore
  createInstrument?: boolean
  open: boolean
  onClose: () => void
}

const InstrumentModifyModal = inject('instrumentStore')(
  observer(
    class InstrumentModifyModal extends React.Component<IInstrumentModifyModal> {
      static defaultProps = {
        createInstrument: false,
      }

      private readonly _instrumentStore: InstrumentStore

      public state = {
        selectedFiles: new Map<string, any>(),
        error: [],
        imageCropperOpen: false,
      }

      constructor(props: IInstrumentModifyModal) {
        super(props)

        this._instrumentStore = props.instrumentStore
      }

      public render() {
        const { open } = this.props
        const instrument = this._instrumentStore.instrumentToCreateOrModify
        const artworkFile = this.state.selectedFiles.get('artworkUrl')
        const artworkError = this.state.error.find(error => error.type === 'artworkUrl')

        return (
          <Modal
            title={`${this.getLabel()} Instrument`}
            onClose={this.onCloseModal}
            open={open}
            fullWidth
            maxWidth="sm"
            content={
              <form onSubmit={this.onSubmit}>
                <div className="flex gap-4">
                  {this._instrumentStore.modifying && <Loading size={40} />}

                  <div>
                    <div className="flex h-[150px] w-[150px] flex-col">
                      {!artworkFile && (
                        <ImagePreview
                          id={instrument.id}
                          className="h-full w-full"
                          src={instrument.artworkUrl}
                        />
                      )}
                      {artworkFile && (
                        <ImagePreview
                          id={instrument.id}
                          className="h-full w-full"
                          src={artworkFile.imagePreview}
                        />
                      )}
                    </div>
                    {artworkFile && (
                      <div className="mt-4 flex items-center">
                        <IconButton
                          aria-label="Delete"
                          color="inherit"
                          onClick={() => this.removeSelectedFile(artworkFile.type)}
                          size="large"
                          className="mr-2"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>

                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <Typography variant="caption">{artworkFile.file.name}</Typography>
                          <div>
                            <Typography variant="caption">
                              {(artworkFile.file.size / 1000000).toFixed(2)} MB
                            </Typography>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex">
                        <input
                          accept="image/*"
                          className="hidden"
                          id="artwork-image-upload"
                          type="file"
                          onChange={this.onChangeUploadImage('artworkUrl')}
                        />
                        <label htmlFor="artwork-image-upload">
                          <Button
                            variant="contained"
                            component="span"
                            id="upload-image-button"
                            aria-label="Upload an Image"
                            size="small"
                          >
                            {instrument.artworkUrl && instrument.artworkUrl !== ''
                              ? 'Change '
                              : 'Upload '}
                            Artwork
                          </Button>
                        </label>
                      </div>
                    </div>
                    {artworkError && (
                      <Typography variant="caption" color="error">
                        {artworkError.message}
                      </Typography>
                    )}
                  </div>
                  <div className="flex w-full flex-col gap-3">
                    <TextField
                      autoFocus
                      name="name"
                      fullWidth
                      required
                      type="text"
                      label="Instrument Name"
                      onChange={this.handleInputChange('name')}
                      value={instrument.name}
                      variant="filled"
                    />
                    <TextField
                      name="description"
                      fullWidth
                      multiline
                      rows={4}
                      type="text"
                      label="Description"
                      onChange={this.handleInputChange('description')}
                      value={instrument.description}
                      variant="filled"
                    />
                  </div>
                </div>
                {artworkFile && (
                  <ImageCropperModal
                    open={this.state.imageCropperOpen}
                    onClose={this.closeImageEditor}
                    src={artworkFile.imagePreview}
                    filename={artworkFile.file.name}
                    aspect={1}
                    onCropComplete={this.onCropComplete('artworkUrl')}
                    forceEdit
                  />
                )}
              </form>
            }
            actions={
              <div className="flex w-full justify-between">
                {!this.props.createInstrument && (
                  <>
                    <Button
                      aria-label="Delete Instrument"
                      onClick={this.confirmDelete}
                      size="small"
                    >
                      Delete
                    </Button>
                    <div className="flex items-center">
                      <div className="mr-4">
                        <Button aria-label="Close" onClick={this.onCloseModal} size="small">
                          Close
                        </Button>
                      </div>
                      <Button
                        aria-label="Save"
                        variant="contained"
                        color="primary"
                        type="submit"
                        size="small"
                        onClick={this.onSubmit}
                      >
                        Save
                      </Button>
                    </div>
                  </>
                )}

                {this.props.createInstrument && (
                  <>
                    <div className="mr-4">
                      <Button aria-label="Close" onClick={this.onCloseModal} size="small">
                        Close
                      </Button>
                    </div>
                    <Button
                      aria-label="Save"
                      variant="contained"
                      color="primary"
                      type="submit"
                      size="small"
                      onClick={this.onSubmit}
                    >
                      Save
                    </Button>
                  </>
                )}
              </div>
            }
          />
        )
      }

      private closeImageEditor = () => {
        this.removeSelectedFile('artworkUrl')
        this.setState({ imageCropperOpen: false })
      }

      private removeSelectedFile = (type: string) => {
        const selectedFiles = this.state.selectedFiles
        selectedFiles.delete(type)

        this.setState({
          selectedFiles,
          error: this.state.error.filter(error => error.type === type),
        })

        if (!this.state.selectedFiles || this.state.selectedFiles.size === 0) {
          this._instrumentStore.setFileInputChanged(false)
        }
      }

      private onCropComplete = (type: string) => (imageBlob: any) => {
        if (imageBlob) {
          const file = imageBlob as File

          const selectedFiles = this.state.selectedFiles
          selectedFiles.set(type, {
            file,
            imagePreview: window.URL.createObjectURL(file),
            type,
          })

          this.setState({ selectedFiles, imageCropperOpen: false })
          this._instrumentStore.setFileInputChanged(true)
        }
      }

      private onChangeUploadImage = (type: string) => (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files)

        // 5MB Limit
        if (files[0] && files[0].size / 1000000 <= 5) {
          this._instrumentStore.setFileInputChanged(true)

          const selectedFiles = this.state.selectedFiles

          selectedFiles.set(type, {
            file: files[0],
            imagePreview: window.URL.createObjectURL(files[0]),
            type,
          })

          this.setState({
            selectedFiles,
            error: this.state.error.filter(error => error.type !== type),
            imageCropperOpen: true,
          })
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

      private confirmDelete = () => {
        confirm({
          title: 'Delete Instrument?',
          message: 'Are you want to permanently delete this instrument?',
          onAnswer: answer => this.handleDelete(answer),
          confirmActionText: 'Delete',
        })
      }

      private handleDelete = async (answer: boolean) => {
        if (answer) {
          await this._instrumentStore.deleteInstrument()
          this.onCloseModal()
        }
      }

      private onSubmit = async e => {
        e.preventDefault()

        if (this.props.createInstrument) {
          await this._instrumentStore.createInstrument(
            Array.from(this.state.selectedFiles.values())
          )
        } else {
          await this._instrumentStore.updateInstrument(
            Array.from(this.state.selectedFiles.values())
          )
        }

        this.onCloseModal()
      }

      private handleInputChange = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
        this._instrumentStore.updateInstrumentToCreateOrModifyProperty(name, e.currentTarget.value)
      }

      private onCloseModal = () => {
        this.props.onClose()
      }

      private getLabel = (): string => {
        if (this.props.createInstrument) return 'Create'
        else return 'Edit'
      }
    }
  )
)

export default InstrumentModifyModal

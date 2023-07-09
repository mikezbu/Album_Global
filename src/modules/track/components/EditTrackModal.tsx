import {
  Button,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DeleteIcon from '@mui/icons-material/Delete'
import { inject, observer } from 'mobx-react'
import React, { ChangeEvent } from 'react'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'

import ImageCropper from 'src/common/components/image/ImageCropper'
import ImagePreview from 'src/common/components/image/ImagePreview'
import Loading from 'src/common/components/layout/Loading'
import { TrackStore } from 'src/common/store'
import GenreAutoComplete from 'src/modules/genre/components/GenreAutoComplete'
import GenreModel from 'src/modules/genre/store/model/GenreModel'
import InstrumentAutoComplete from 'src/modules/instrument/components/InstrumentAutoComplete'
import InstrumentModel from 'src/modules/instrument/store/model/InstrumentModel'
import KeyAutoComplete from 'src/modules/key/components/KeyAutoComplete'
import KeyModel from 'src/modules/key/store/model/KeyModel'
import { Currency } from 'src/modules/price/store/model/PriceModel'
import confirm from 'src/util/ConfirmationDialog'
import TagAutoComplete from 'src/modules/tag/components/TagAutoComplete'
import TagModel from 'src/modules/tag/store/model/TagModel'
import { TrackStatus } from '../store/model/TrackModel'

interface IEditTrackModal {
  trackStore?: TrackStore
  onClose: () => void
}

const EditTrackModal = inject('trackStore')(
  observer(
    class EditTrackModal extends React.Component<IEditTrackModal> {
      public state = {
        selectedFiles: new Map<string, any>(),
        error: [],
      }

      private readonly _trackStore: TrackStore

      constructor(props: IEditTrackModal) {
        super(props)

        this._trackStore = props.trackStore
      }

      componentDidUpdate() {
        if (this._trackStore.updatedSuccessfully) {
          this.onCloseModal()
        }
      }

      public render() {
        const track = this._trackStore.trackToUpdate
        const { symbol, amountForDisplay } = track.price

        const artworkFile = this.state.selectedFiles.get('artworkUrl')
        const artworkError = this.state.error.find(error => error.type === 'artworkUrl')

        return (
          <div className="flex h-full flex-col bg-background-main px-5 sm:px-8">
            <div className="flex justify-between py-2">
              <Button
                variant="outlined"
                color="primary"
                size="small"
                disabled={this._trackStore.firstTrackToEdit}
                onClick={this.selectPreviousTrackToUpdate}
                className="my-2"
                startIcon={<ChevronLeftIcon />}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                disabled={this._trackStore.lastTrackToEdit}
                onClick={this.selectNextTrackToUpdate}
                className="my-2"
                endIcon={<ChevronRightIcon />}
              >
                Next
              </Button>
            </div>
            <Divider className="mb-4" />
            <div className="overflow-scroll">
              {(this._trackStore.updating || this._trackStore.loading) && <Loading size={40} />}
              <ValidatorForm debounceTime={750} onSubmit={this.onSubmit}>
                <Grid container className="mb-5" spacing={2}>
                  <Grid item xs={12} md={12} lg={12}>
                    <div className="flex h-[150px] w-[150px] flex-col">
                      {!artworkFile && (
                        <ImagePreview
                          id={track.id}
                          className="h-full w-full"
                          src={track.artworkUrl}
                        />
                      )}
                      {artworkFile && (
                        <>
                          <ImageCropper
                            src={artworkFile.imagePreview}
                            filename={artworkFile.file.name}
                            aspect={1}
                            onCropComplete={this.onCropComplete('artworkUrl')}
                          />

                          <div className="flex items-center">
                            <IconButton
                              aria-label="Delete"
                              color="inherit"
                              onClick={() => this.removeSelectedFile(artworkFile.type)}
                              size="large"
                              className="mr-4"
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
                        </>
                      )}
                    </div>
                  </Grid>
                  <Grid item xs={12} md={12} lg={12}>
                    <div className="my-1 flex items-center justify-between">
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
                            {track.artworkUrl && track.artworkUrl !== '' ? 'Change ' : 'Upload '}{' '}
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
                  </Grid>

                  <Grid item xs={12} md={12} lg={12}>
                    <TextValidator
                      name="title"
                      fullWidth
                      required
                      validators={['required']}
                      errorMessages={['Title is required']}
                      type="text"
                      label="Title"
                      onChange={this.handleInputChange('title')}
                      value={track.title}
                      variant="filled"
                    />
                  </Grid>
                  <Grid item xs={12} md={12} lg={12}>
                    <GenreAutoComplete
                      selectedGenres={track.genres}
                      onGenresSelect={this.updateGenres}
                    />
                  </Grid>
                  <Grid item xs={12} md={12} lg={12}>
                    <InstrumentAutoComplete
                      selectedInstruments={track.instruments}
                      onInstrumentsSelect={this.updateInstruments}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} lg={6}>
                    <KeyAutoComplete selectedKey={track.key} onKeysSelect={this.updateKey} />
                  </Grid>
                  <Grid item xs={12} md={6} lg={6}>
                    <Select
                      value={track.status.toString()}
                      onChange={this.updateStatus}
                      fullWidth
                      variant="filled"
                      label="Status"
                      placeholder="Status"
                    >
                      <MenuItem value={TrackStatus.Unpublished}>Unpublished</MenuItem>
                      <MenuItem value={TrackStatus.Published}>Published</MenuItem>
                      <MenuItem value={TrackStatus.Archived}>Archived</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={12} md={12} lg={12}>
                    <TagAutoComplete selectedTags={track.tags} onTagsSelect={this.updateTags} />
                  </Grid>
                  <Grid item xs={12} md={6} lg={6}>
                    <TextValidator
                      name="producedBy"
                      fullWidth
                      type="text"
                      label="Produced By"
                      onChange={this.handleInputChange('producedBy')}
                      value={track.producedBy}
                      variant="filled"
                    />
                  </Grid>
                  <Grid item xs={12} md={6} lg={6}>
                    <TextValidator
                      name="writtenBy"
                      fullWidth
                      type="text"
                      label="Written By"
                      onChange={this.handleInputChange('writtenBy')}
                      value={track.writtenBy}
                      variant="filled"
                    />
                  </Grid>
                  {/* <Grid item sm={12} md={2} >
                    <TextValidator
                      name="currency"
                      fullWidth
                      select
                      required
                      validators={['required']}
                      errorMessages={['Currency is required']}
                      type="text"
                      label="Currency"
                      onChange={this.handleCurrencyChange}
                      value={currency}
                      variant="filled"
                    >
                      {Object.values(Currency).map(option => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextValidator>
                  </Grid> */}
                  <Grid item xs={12} md={12} lg={12}>
                    <TextValidator
                      name="price"
                      fullWidth
                      type="number"
                      label="Price"
                      required
                      validators={['required', 'minNumber:0', 'isFloat']}
                      errorMessages={[
                        'Price is required',
                        'Only positive amount can be set for price',
                        'Price is invalid',
                      ]}
                      onChange={this.handlePriceChange}
                      value={amountForDisplay}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">{symbol}</InputAdornment>,
                      }}
                      variant="filled"
                    />
                  </Grid>
                </Grid>
              </ValidatorForm>
            </div>
            <div className="flex w-full justify-between pb-5">
              {/* <Button aria-label="Delete Collection" onClick={this.confirmDelete(track.id)}>
                Delete
              </Button> */}
              <div className="h-1 w-1"></div>
              <div>
                <Button aria-label="Cancel" className="mr-5" onClick={this.onCloseModal}>
                  Cancel
                </Button>
                <Button
                  aria-label="Save"
                  variant="contained"
                  color="primary"
                  type="submit"
                  onClick={this.onSubmit}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        )
      }

      private selectPreviousTrackToUpdate = () => {
        this.setState({
          selectedFiles: new Map<string, any>(),
          error: [],
        })

        this._trackStore.selectPreviousTrackToUpdate()
      }

      private selectNextTrackToUpdate = () => {
        this._trackStore.setLoading(true)
        this.setState({
          selectedFiles: new Map<string, any>(),
          error: [],
        })

        this._trackStore.selectNextTrackToUpdate()
        this._trackStore.setLoading(false)
      }

      private confirmDelete = (id: number) => () => {
        confirm({
          title: 'Delete Track?',
          message: 'Are you want to permanently delete this track?',
          onAnswer: answer => this.handleDelete(answer, id),
          confirmActionText: 'Delete',
        })
      }

      private updateGenres = (genres: GenreModel[]) => {
        this._trackStore.updateTrackToUpdateGenres(genres)
      }

      private updateInstruments = (instruments: InstrumentModel[]) => {
        this._trackStore.updateTrackToUpdateInstruments(instruments)
      }

      private updateStatus = (event: SelectChangeEvent) => {
        this._trackStore.updateTrackToUpdateStatus(parseInt(event.target.value))
      }

      private updateKey = (key: KeyModel) => {
        this._trackStore.updateTrackToUpdateKey(key)
      }

      private updateTags = (tags: TagModel[]) => {
        this._trackStore.updateTrackToUpdateTags(tags)
      }

      private handleDelete = (answer: boolean, id: number) => {
        if (answer) {
          this._trackStore.deleteTrack(id)
          this.onCloseModal()
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

          this.setState({ selectedFiles })
          this._trackStore.setFileInputChanged(true)
        }
      }

      private onChangeUploadImage = (type: string) => (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files)

        // 5MB Limit
        if (files[0] && files[0].size / 1000000 <= 5) {
          this._trackStore.setFileInputChanged(true)

          const selectedFiles = this.state.selectedFiles

          selectedFiles.set(type, {
            file: files[0],
            imagePreview: window.URL.createObjectURL(files[0]),
            type,
          })

          this.setState({
            selectedFiles,
            error: this.state.error.filter(error => error.type !== type),
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

      private removeSelectedFile = (type: string) => {
        const selectedFiles = this.state.selectedFiles
        selectedFiles.delete(type)

        this.setState({
          selectedFiles,
          error: this.state.error.filter(error => error.type === type),
        })

        if (!this.state.selectedFiles || this.state.selectedFiles.size === 0) {
          this._trackStore.setFileInputChanged(false)
        }
      }

      private onSubmit = () => {
        this._trackStore.updateTrack(Array.from(this.state.selectedFiles.values()))
      }

      private handleInputChange = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
        this._trackStore.updateTrackToUpdateProperty(name, e.currentTarget.value)
      }

      private handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (parseFloat(e.currentTarget.value.replace(/^0+/, ''))) {
          this._trackStore.trackToUpdate.price.updatePrice(
            parseFloat(e.currentTarget.value.replace(/^0+/, ''))
          )
        } else {
          this._trackStore.trackToUpdate.price.updatePrice(0)
        }
      }

      private handleCurrencyChange = (e: ChangeEvent<HTMLInputElement>) => {
        this._trackStore.trackToUpdate.price.updateCurrency(e.target.value as Currency)
      }

      private onCloseModal = () => {
        this._trackStore.resetFlags()
        this.props.onClose()

        setTimeout(() => {}, 200)
      }
    }
  )
)

export default EditTrackModal

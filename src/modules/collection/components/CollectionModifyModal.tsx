import {
  Autocomplete,
  Button,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import DeleteIcon from '@mui/icons-material/Delete'
import { values } from 'mobx'
import { inject, observer } from 'mobx-react'
import React, { ChangeEvent } from 'react'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'

import ImageCropper from 'src/common/components/image/ImageCropper'
import ImagePreview from 'src/common/components/image/ImagePreview'
import Loading from 'src/common/components/layout/Loading'
import Modal from 'src/common/components/modal/Modal'
import { AppState, SampleStore, UserStore } from 'src/common/store'
import CollectionStore from 'src/modules/collection/store'
import {
  CollectionStatus,
  CollectionType,
} from 'src/modules/collection/store/model/CollectionModel'
import { Currency } from 'src/modules/price/store/model/PriceModel'
import SamplePackSampleTable from 'src/modules/sample/components/SamplePackSampleTable'
import SamplePlayer from 'src/modules/sample/components/SamplePlayer'
import { SampleModel } from 'src/modules/sample/store'
import CollectionTrackTable from 'src/modules/track/components/CollectionTrackTable'
import TrackStore, { TrackModel } from 'src/modules/track/store'
import confirm from 'src/util/ConfirmationDialog'
import { Operation } from 'src/common/store/util/SearchCriteria'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

interface ICollectionModifyModal {
  appState?: AppState
  collectionStore?: CollectionStore
  sampleStore?: SampleStore
  trackStore?: TrackStore
  userStore?: UserStore
  open: boolean
  type: CollectionType
  createCollection?: boolean
  onClose: () => void
}

const CollectionModifyModal = inject(
  'appState',
  'collectionStore',
  'sampleStore',
  'trackStore',
  'userStore'
)(
  observer(
    class CollectionModifyModal extends React.Component<ICollectionModifyModal> {
      public state = {
        isSamplePlaying: false,
        selectedSample: null,
        selectedFiles: new Map<string, any>(),
        error: [],
      }

      private readonly _appState: AppState
      private readonly _collectionStore: CollectionStore
      private readonly _sampleStore: SampleStore
      private readonly _trackStore: TrackStore
      private readonly _userStore: UserStore

      constructor(props: ICollectionModifyModal) {
        super(props)

        this._appState = props.appState
        this._collectionStore = props.collectionStore
        this._sampleStore = props.sampleStore
        this._trackStore = props.trackStore
        this._userStore = props.userStore
      }

      public componentDidMount() {
        this._collectionStore.resetFlags()

        this._sampleStore.resetPagination()
        this._sampleStore.setSortColumn('createdDate')
        this._sampleStore.setSortDirection('desc')
        this._sampleStore.setPageSize(100)

        if (this.props.type === CollectionType.Sample) {
          this._sampleStore.fetchSamplesByArtistId(this._userStore.user.artistId)
        } else if (this.props.type === CollectionType.Track) {
          const filterCriteria = {
            columns: [],
            joins: [],
          }

          filterCriteria.columns.push({
            key: 'artistId',
            operation: Operation.Equals,
            value: this._userStore.user.artistId,
          })

          this._trackStore.searchTracksPrivate(filterCriteria)
        }
      }

      public componentDidUpdate() {
        if (
          this._collectionStore.updatedSuccessfully ||
          this._collectionStore.createdSuccessfully
        ) {
          this.onCloseModal()

          this.setState({
            isSamplePlaying: false,
            selectedSample: null,
            selectedFiles: new Map<string, any>(),
            error: [],
          })
        }
      }

      public getArtistSamples = (): SampleModel[] => {
        return Array.from(this._sampleStore.samples.values())
      }

      public getCollectionSamples = (): SampleModel[] => {
        return Array.from(this._collectionStore.collectionToCreateOrModify.samples.values())
      }

      public getArtistTracks = (): TrackModel[] => {
        return values(this._trackStore.tracks) as TrackModel[]
      }

      public getCollectionTracks = (): TrackModel[] => {
        return values(this._collectionStore.collectionToCreateOrModify.tracks) as TrackModel[]
      }

      public render() {
        const { open } = this.props
        const collection = this._collectionStore.collectionToCreateOrModify
        const { symbol, amountForDisplay } = collection.price

        const albumArtFile = this.state.selectedFiles.get('albumArtUrl')
        const albumArtError = this.state.error.find(error => error.type === 'albumArtUrl')

        return (
          <Modal
            content={
              <div className="w-full p-4">
                {this._collectionStore.updating && <Loading size={40} />}
                <ValidatorForm debounceTime={750} onSubmit={this.onSubmit}>
                  <Grid container spacing={3} className="mb-6">
                    <Grid item xs={12} sm={4} className="w-full">
                      <div className="flex flex-col items-center">
                        {!albumArtFile && (
                          <ImagePreview
                            id={collection.id}
                            className="mb-4"
                            src={
                              albumArtFile && albumArtFile.imagePreview
                                ? albumArtFile.imagePreview
                                : collection.albumArtUrl
                            }
                          />
                        )}
                        {albumArtFile && (
                          <ImageCropper
                            className="mb-4"
                            src={albumArtFile.imagePreview}
                            filename={albumArtFile.file.name}
                            aspect={1}
                            onCropComplete={this.onCropComplete('albumArtUrl')}
                          />
                        )}
                        <input
                          accept="image/*"
                          className="hidden"
                          id="artwork-image-upload"
                          type="file"
                          onChange={this.onChangeUploadImage('albumArtUrl')}
                        />
                        <label htmlFor="artwork-image-upload">
                          <Button
                            color="secondary"
                            variant="contained"
                            component="span"
                            id="upload-image-button"
                            aria-label="Upload an Image"
                            size="small"
                          >
                            Change artwork
                          </Button>
                        </label>
                        {albumArtFile && (
                          <div style={{ display: 'flex' }}>
                            <IconButton
                              aria-label="Delete"
                              color="inherit"
                              onClick={() => this.removeSelectedFile(albumArtFile.type)}
                              size="large"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>

                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <Typography variant="caption">{albumArtFile.file.name}</Typography>
                              <div>
                                <Typography variant="caption">
                                  {(albumArtFile.file.size / 1000000).toFixed(2)} MB
                                </Typography>
                              </div>
                            </div>
                          </div>
                        )}
                        {albumArtError && (
                          <Typography variant="caption" color="error">
                            {albumArtError.message}
                          </Typography>
                        )}
                      </div>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Grid container spacing={3} className="mb-6">
                        <Grid item xs={12} sm={12} className="w-full">
                          <TextValidator
                            name="name"
                            fullWidth
                            required
                            validators={['required']}
                            errorMessages={['Name is required']}
                            type="text"
                            label={`${this.getLabel()} Name`}
                            onChange={this.handleInputChange('name')}
                            value={collection.name}
                            variant="filled"
                          />
                        </Grid>
                        <Grid item xs={12} sm={12} className="w-full">
                          <TextValidator
                            name="description"
                            fullWidth
                            type="text"
                            label="Description"
                            onChange={this.handleInputChange('description')}
                            value={collection.description}
                            variant="filled"
                            spellCheck
                          />
                        </Grid>

                        {/* <Grid item xs={12} sm={12} className= w-full"> */}
                        {/* <Grid item xs={12} sm={4} className= w-full">
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
                        <Grid item xs={12} sm={6} className="w-full">
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
                            value={amountForDisplay.toString()}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">{symbol}</InputAdornment>
                              ),
                            }}
                            variant="filled"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} className="w-full">
                          <Select
                            value={collection.status.toString()}
                            onChange={this.updateStatus}
                            fullWidth
                            variant="filled"
                            label="Status"
                            placeholder="Status"
                          >
                            <MenuItem value={CollectionStatus.Unpublished}>Unpublished</MenuItem>
                            <MenuItem value={CollectionStatus.Published}>Published</MenuItem>
                            <MenuItem value={CollectionStatus.Archived}>Archived</MenuItem>
                          </Select>
                        </Grid>
                      </Grid>
                    </Grid>
                    {this.props.type === CollectionType.Sample && (
                      <Grid item xs={12} sm={12} className="w-full">
                        <Typography variant="h6" gutterBottom>
                          Samples
                        </Typography>
                        <Autocomplete
                          multiple
                          disableClearable
                          options={this.getArtistSamples()}
                          disableCloseOnSelect
                          value={this.getCollectionSamples()}
                          getOptionLabel={(option: SampleModel) => option.title}
                          onChange={this.setSelectedSamples}
                          isOptionEqualToValue={(option: SampleModel, value: SampleModel) =>
                            option.id === value.id
                          }
                          renderTags={value => (
                            <Typography variant="subtitle1">
                              {value.length} sample{value.length > 1 ? 's' : ''} selected
                            </Typography>
                          )}
                          renderOption={(props, option: SampleModel, { selected }) => (
                            <li className="flex items-center" {...props} key={option.id}>
                              <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                              />
                              {option.title}
                            </li>
                          )}
                          renderInput={params => (
                            <TextField
                              {...params}
                              variant="filled"
                              label="Add or remove samples"
                              fullWidth
                            />
                          )}
                        />
                        <Divider style={{ margin: '1em 0' }} />

                        <SamplePackSampleTable
                          isSamplePlaying={this.state.isSamplePlaying}
                          playbackControl={this.playbackControl}
                          onSampleSelect={this.onSampleSelect}
                          selectedSampleId={this._collectionStore.selectedSampleId}
                          data={this._collectionStore.collectionToCreateOrModify.samples}
                          hiddenColumns={['playCount', 'delete', 'options']}
                          notFoundLabel={'Add samples by searching and selecting them from above'}
                        />
                        <SamplePlayer
                          isSamplePlaying={this.state.isSamplePlaying}
                          sample={this.state.selectedSample}
                          onEnded={this.onStop}
                          onPause={this.onPause}
                          onPlay={this.onPlay}
                        />
                      </Grid>
                    )}
                    {this.props.type === CollectionType.Track && (
                      <Grid item xs={12} sm={12} className="w-full">
                        <Typography variant="h6" gutterBottom>
                          Track Collection
                        </Typography>
                        <Autocomplete
                          multiple
                          disableClearable
                          options={this.getArtistTracks()}
                          disableCloseOnSelect
                          value={this.getCollectionTracks()}
                          getOptionLabel={(option: TrackModel) => option.title}
                          onChange={this.setSelectedTracks}
                          isOptionEqualToValue={(option: TrackModel, value: TrackModel) =>
                            option.id === value.id
                          }
                          renderTags={value => (
                            <Typography variant="subtitle1">
                              {value.length} track{value.length > 1 ? 's' : ''} selected
                            </Typography>
                          )}
                          renderOption={(props, option: TrackModel, { selected }) => (
                            <li className="flex items-center" {...props} key={option.id}>
                              <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                                className="mr-3"
                              />
                              {option.title}
                            </li>
                          )}
                          renderInput={params => (
                            <TextField
                              {...params}
                              variant="filled"
                              label="Add or remove tracks"
                              fullWidth
                            />
                          )}
                        />
                        <Divider style={{ margin: '1em 0' }} />

                        <CollectionTrackTable
                          isTrackPlaying={this._appState.isTrackPlaying}
                          playbackControl={this.playbackControl}
                          onTrackSelect={this.onTrackSelect}
                          selectedTrackId={this._collectionStore.selectedTrackId}
                          data={this._collectionStore.collectionToCreateOrModify.tracks}
                          hiddenColumns={['playCount', 'delete', 'price', 'options']}
                          notFoundLabel={`Add ${this.getItemLabel()}s by searching and selecting them from above`}
                        />
                      </Grid>
                    )}
                  </Grid>
                </ValidatorForm>
              </div>
            }
            actions={
              <div className="flex w-full justify-end p-2">
                {/* {!this.props.createCollection && (
                  <Button
                    aria-label="Delete Collection"
                    onClick={this.confirmDelete(collection.id)}
                  >
                    Delete
                  </Button>
                )} */}
                <div className="flex items-center">
                  <div className="mr-4">
                    <Button aria-label="Cancel" className="mr-4" onClick={this.onCloseModal}>
                      Cancel
                    </Button>
                  </div>
                  <Button
                    color="primary"
                    aria-label="Save"
                    variant="contained"
                    type="submit"
                    onClick={this.onSubmit}
                  >
                    {this.getCreateEditActionLabel()}
                  </Button>
                </div>
              </div>
            }
            onClose={this.onCloseModal}
            open={open}
            title={`${this.getCreateEditHeaderLabel()} ${this.getLabel()}`}
            fullWidth
            maxWidth="lg"
          />
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
          })

          this.setState({ selectedFiles })
          this._collectionStore.setFileInputChanged(true)
        }
      }

      private onChangeUploadImage = (type: string) => (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files)

        // 5MB Limit
        if (files[0] && files[0].size / 1000000 <= 5) {
          this._collectionStore.setFileInputChanged(true)

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
          this._collectionStore.setFileInputChanged(false)
        }
      }

      private confirmDelete = (id: number) => () => {
        confirm({
          title: `Delete ${this.getLabel()}?`,
          message: `Are you want to permanently delete this ${this.getLabel()}?`,
          onAnswer: answer => this.handleDelete(answer, id),
          confirmActionText: 'Delete',
        })
      }

      private handleDelete = (answer: boolean, id: number) => {
        if (answer) {
          this._collectionStore.deleteCollection(id)
        }
      }

      private getLabel = () => {
        if (this.props.type === CollectionType.Sample) {
          return 'Sample Pack'
        } else if (this.props.type === CollectionType.Track) {
          return 'Collection'
        }

        return ''
      }

      private getItemLabel = () => {
        if (this.props.type === CollectionType.Sample) {
          return 'sample'
        } else if (this.props.type === CollectionType.Track) {
          return 'track'
        }

        return ''
      }

      private onTrackSelect = (id: number) => {
        this.onStop()
        this._collectionStore.setSelectedTrack(
          this._collectionStore.collectionToCreateOrModify.tracks.get(id)
        )

        if (this._collectionStore.selectedTrack) {
          this._appState.setTrack(this._collectionStore.selectedTrack)
          this.onPlay()
        }
      }

      private onSubmit = () => {
        if (this.props.createCollection) {
          this._collectionStore.createCollection(Array.from(this.state.selectedFiles.values()))
        } else {
          this._collectionStore.updateCollection(Array.from(this.state.selectedFiles.values()))
        }
      }

      private handleInputChange = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
        this._collectionStore.handleCollectionToCreateOrModifyInputChange(
          name,
          e.currentTarget.value
        )
      }

      private handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
        this._collectionStore.collectionToCreateOrModify.price.updatePrice(
          parseFloat(e.currentTarget.value)
        )
      }

      private updateStatus = (event: SelectChangeEvent) => {
        this._collectionStore.handleCollectionToCreateOrModifyInputChange(
          'status',
          parseInt(event.target.value)
        )
      }

      private handleCurrencyChange = (e: ChangeEvent<HTMLInputElement>) => {
        this._collectionStore.collectionToCreateOrModify.price.updateCurrency(
          e.target.value as Currency
        )
      }

      private onCloseModal = () => {
        this._collectionStore.resetFlags()
        this.props.onClose()

        setTimeout(() => {
          this.setState({ isSamplePlaying: false, selectedSample: null })
          this._collectionStore.resetCreateOrUpdate()
        }, 200)
      }

      private setSelectedSamples = (
        event: React.ChangeEvent<{}>,
        selectedSamples: SampleModel[]
      ) => {
        this._collectionStore.setCollectionToCreateOrModifySamples(selectedSamples)
      }

      private setSelectedTracks = (event: React.ChangeEvent<{}>, selectedTracks: TrackModel[]) => {
        this._collectionStore.setCollectionToCreateOrModifyTracks(selectedTracks)
      }

      private getCreateEditHeaderLabel = () => {
        if (this.props.createCollection) {
          return 'Create'
        }
        return 'Edit'
      }

      private getCreateEditActionLabel = () => {
        if (this.props.createCollection) {
          return 'Create'
        }
        return 'Save'
      }

      private onSampleSelect = (id: number) => {
        this.onStop()
        this._collectionStore.setSelectedSample(
          this._collectionStore.collectionToCreateOrModify.samples.get(id)
        )

        if (this._collectionStore.selectedSample) {
          this.setState({ selectedSample: this._collectionStore.selectedSample })
          this.onPlay()
        }
      }

      private onPlay = () => {
        if (this.props.type === CollectionType.Sample) {
          this.setState({ isSamplePlaying: true })
        } else if (this.props.type === CollectionType.Track) {
          this._appState.setIsTrackPlaying(true)
        }
      }

      private onPause = () => {
        if (this.props.type === CollectionType.Sample) {
          this.setState({ isSamplePlaying: false })
        } else if (this.props.type === CollectionType.Track) {
          this._appState.setIsTrackPlaying(false)
        }
      }

      private onStop = () => {
        if (this.props.type === CollectionType.Sample) {
          this.setState({ isSamplePlaying: false })
        } else if (this.props.type === CollectionType.Track) {
          this._appState.setIsTrackPlaying(false)
        }
      }

      private playbackControl = (state: number) => {
        if (state === 0) {
          this.onStop()
        }

        if (state === 1) {
          this.onPause()
        }

        if (state === 2) {
          this.onPlay()
        }
      }
    }
  )
)

export default CollectionModifyModal

import { Button, Divider, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

import { inject, observer } from 'mobx-react'
import React from 'react'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import UploadModal from 'src/common/components/UploadModal'
import { getStore, SampleStore, UserStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import { Order } from 'src/common/store/util/Paginator'
import EditSampleModal from 'src/modules/sample/components/EditSampleModal'
import SamplePlayer from 'src/modules/sample/components/SamplePlayer'
import SampleTable from 'src/modules/sample/components/SampleTable'
import { ActionType } from 'src/modules/track/components/TrackTable'

const PREFIX = 'SampleManagement'

const classes = {
  container: `${PREFIX}-container`,
  header: `${PREFIX}-header`,
  uploadButton: `${PREFIX}-uploadButton`,
}

const Root = styled('div')(() => ({
  [`&.${classes.container}`]: {
    position: 'relative',
    width: '100%',
    padding: '2em',
    display: 'flex',
    flexDirection: 'column',
  },

  [`& .${classes.header}`]: {
    paddingBottom: '1em',

    '@media screen and (max-width: 600px)': {
      paddingBottom: '1em',
    },
  },

  [`& .${classes.uploadButton}`]: {
    alignSelf: 'flex-end',
    marginBottom: '1em',
  },
}))

interface ISampleManagement {
  sampleStore?: SampleStore
  userStore?: UserStore
}

const SampleManagement = inject(
  'sampleStore',
  'userStore'
)(
  observer(
    class SampleManagement extends React.Component<ISampleManagement> {
      public state = {
        isSamplePlaying: false,
        selectedSample: null,
        uploadModalOpen: false,
        openEditSampleModal: false,
      }

      private readonly _sampleStore: SampleStore
      private readonly _userStore: UserStore

      constructor(props: ISampleManagement) {
        super(props)

        this._sampleStore = props.sampleStore
        this._userStore = props.userStore
      }

      public componentDidMount() {
        this._sampleStore.resetPagination()
        this._sampleStore.setSortColumn('createdDate')
        this._sampleStore.setSortDirection('desc')
        this._sampleStore.setPageSize(48)
        this._sampleStore.fetchSamplesByArtistId(this._userStore.user.artistId)
      }

      public render() {
        return (
          <Root className={classes.container}>
            <Typography variant="h6" gutterBottom>
              Manage samples
            </Typography>
            <Divider style={{ marginBottom: '1em' }} />
            <Button
              aria-label="upload"
              variant="contained"
              color="primary"
              onClick={this.openUploadModal}
              className={classes.uploadButton}
            >
              Upload samples
            </Button>

            {this._sampleStore.loading ? (
              <SkeletonLoader count={10} type="table" />
            ) : (
              <>
                <SampleTable
                  isSamplePlaying={this.state.isSamplePlaying}
                  playbackControl={this.playbackControl}
                  onSampleSelect={this.onSampleSelect}
                  selectedSampleId={this._sampleStore.selectedSampleId}
                  data={this._sampleStore.samples}
                  paging={this._sampleStore.paging}
                  rowsPerPage={this._sampleStore.pageSize}
                  totalCount={this._sampleStore.totalCount}
                  setRowsPerPage={this.setPageSize}
                  setPageNumber={this.setPageNumber}
                  setSort={this.setSort}
                  pageNumber={this._sampleStore.pageNumber}
                  sortColumn={this._sampleStore.sortColumn}
                  sortDirection={this._sampleStore.sortDirection}
                  hiddenColumns={['artist.name', 'playCount', 'options']}
                  actionType={ActionType.Edit}
                />
              </>
            )}
            <UploadModal
              onClose={this.closeUploadModal}
              open={this.state.uploadModalOpen}
              onUpload={this.uploadAndCreateSamples}
              label="samples"
              acceptedFileTypes=".wav,.mp3"
              multipleFileUpload
              fileSizeLimitMB={50}
              maxNumberOfFiles={24}
              uploading={this._sampleStore.creating}
            />
            <EditSampleModal
              open={this.state.openEditSampleModal}
              onClose={this.closeEditSampleModal}
            />
            <SamplePlayer
              isSamplePlaying={this.state.isSamplePlaying}
              sample={this.state.selectedSample}
              onEnded={this.onStop}
              onPause={this.onPause}
              onPlay={this.onPlay}
            />
          </Root>
        )
      }

      private onSampleSelect = (id: number) => {
        this._sampleStore.selectSampleById(id)
        this._sampleStore.setSampleToUpdate(id)

        if (this._sampleStore.selectedSample) {
          this.setState({
            selectedSample: this._sampleStore.selectedSample,
            openEditSampleModal: true,
          })
        }
      }

      private onPlay = () => {
        this.setState({ isSamplePlaying: true })
      }

      private onPause = () => {
        this.setState({ isSamplePlaying: false })
      }

      private onStop = () => {
        this.setState({ isSamplePlaying: false })
        this._sampleStore.selectSampleById(-1)
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

      private uploadAndCreateSamples = async (filesToUpload: any[]) => {
        await this._sampleStore.uploadFilesAndCreateSample(filesToUpload)
        this.closeUploadModal()
        getStore().appState.setShowMessage(true)
        getStore().appState.setMessageVariant(MessageVariant.Success)
        getStore().appState.setMessage('Samples created successfully!')
      }

      private setPageSize = (pageSize: number) => {
        this._sampleStore.setPageSize(pageSize)
        this._sampleStore.fetchSamplesByArtistId(this._userStore.user.artistId, true)
      }

      private setPageNumber = (pageNumber: number) => {
        this._sampleStore.setPageNumber(pageNumber)
        this._sampleStore.fetchSamplesByArtistId(this._userStore.user.artistId, true)
      }

      private setSort = (sortDirection: Order, sortColumn: string) => {
        this._sampleStore.setSortDirection(sortDirection)
        this._sampleStore.setSortColumn(sortColumn)
        this._sampleStore.fetchSamplesByArtistId(this._userStore.user.artistId, true)
      }

      private openUploadModal = () => {
        this.setState({ uploadModalOpen: true })
      }

      private closeUploadModal = () => {
        this.setState({ uploadModalOpen: false })
      }

      private closeEditSampleModal = () => {
        this.setState({ openEditSampleModal: false })
      }
    }
  )
)

export default SampleManagement

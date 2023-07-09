import { Box, Link, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { inject, observer } from 'mobx-react'
import { WithRouterProps } from 'next/dist/client/with-router'
import Head from 'next/head'
import { withRouter } from 'next/router'
import Router from 'next/router'
import React from 'react'

import ImagePreview from 'src/common/components/image/ImagePreview'
import ShareModal from 'src/common/components/ShareModal'
import SkeletonLoader from 'src/common/components/SkeletonLoader'
import { SampleStore } from 'src/common/store'
import { APP_URL } from 'src/ApplicationConfiguration'
import CollectionModel from 'src/modules/collection/store/model/CollectionModel'
import { getSample } from 'src/modules/sample/api'
import SamplePackSampleTable from 'src/modules/sample/components/SamplePackSampleTable'
import SamplePlayer from 'src/modules/sample/components/SamplePlayer'
import { IContext } from 'src/pages/_app'

const PREFIX = 'SampleDetail'

const classes = {
  pageContainer: `${PREFIX}-pageContainer`,
  collectionDetailContainer: `${PREFIX}-collectionDetailContainer`,
  content: `${PREFIX}-content`,
  albumArtWrapper: `${PREFIX}-albumArtWrapper`,
  albumArt: `${PREFIX}-albumArt`,
  trackDetails: `${PREFIX}-trackDetails`,
}

const Root = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  height: '100%',
  width: '100%',

  [`& .${classes.collectionDetailContainer}`]: {
    display: 'flex',
    backgroundColor: '#232B3E',
    padding: '3em',

    '@media screen and (max-width: 600px)': {
      padding: '1em 1em 4em 1em',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: '2em',
    },
  },

  [`& .${classes.content}`]: {
    padding: '2em 3em 8em 3em',

    '@media screen and (max-width: 600px)': {
      padding: '1em 1em 4em 1em',
    },
  },

  [`& .${classes.albumArtWrapper}`]: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',

    '@media screen and (min-width: 600px)': {
      marginRight: '2em',
    },
  },

  [`& .${classes.albumArt}`]: {
    width: '150px',
    height: '150px',
  },

  [`& .${classes.trackDetails}`]: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    maxHeight: '150px',

    '@media screen and (max-width: 600px)': {
      marginTop: '1em',
    },
  },
}))

const isServer = typeof window === 'undefined'

interface IIndex extends WithRouterProps {
  sampleStore: SampleStore
}

const Index = inject('sampleStore')(
  observer(
    class Index extends React.Component<IIndex> {
      public static async getInitialProps(ctx: IContext) {
        if (ctx.query.sampleId) {
          ctx.store.sampleStore.setLoading(true)
          await getSample(ctx.query.sampleId, ctx.store.sampleStore.fetchSampleCallback)
        }
      }

      public state = {
        isSamplePlaying: false,
        selectedSample: null,
        openAddToCartModal: false,
        collectionToAddToCart: CollectionModel,
        openShareModal: false,
      }

      private readonly _sampleStore: SampleStore

      constructor(props: IIndex) {
        super(props)

        this._sampleStore = props.sampleStore
      }

      public render() {
        const { sample } = this._sampleStore

        return (
          <Root>
            <Head>
              <title key="title">{sample.title}</title>
              <meta key="og:url" property="og:url" content={`${APP_URL}/tracks/${sample.id}`} />
              <meta key="og:title" property="og:title" content={sample.title} />
              <meta key="og:description" property="og:description" content={sample.artist.name} />
              <meta key="og:type" property="og:type" content="music.song" />
              <meta key="og:image" property="og:image" content={sample.artist.profileImageUrl} />
              <meta key="og:audio:secure_url" property="og:audio:secure_url" content={sample.url} />
              <meta key="og:audio:type" property="og:audio:type" content="audio/mp3" />
              <meta key="music:song" property="music:song" content={sample.title} />
              <meta
                key="music:duration"
                property="music:duration"
                content={sample.duration?.toString()}
              />
            </Head>
            {this._sampleStore.loading ? (
              <>
                <div className={classes.collectionDetailContainer}>
                  <SkeletonLoader count={1} type="track" />
                </div>
                <div className={classes.content}>
                  <SkeletonLoader count={12} type="table" />
                </div>
              </>
            ) : (
              <>
                <div className={classes.collectionDetailContainer}>
                  <div className={classes.albumArtWrapper}>
                    <ImagePreview
                      id={sample.id}
                      src={sample?.artist.profileImageUrl}
                      className={classes.albumArt}
                    />
                    {/* <Button
                  color="primary"
                  style={{ marginTop: '1em' }}
                  onClick={this.onOpenShareModal}
                >
                  Share
                </Button> */}
                  </div>
                  <div className={classes.trackDetails}>
                    <Box>
                      <Typography variant="h6">{sample.title}</Typography>
                      <Link
                        onClick={() => this.onArtistClick(sample.artist.urlAlias)}
                        component="button"
                        underline="none"
                        variant="subtitle1"
                        gutterBottom
                      >
                        {sample.artist.name}
                      </Link>
                    </Box>
                  </div>
                </div>
                <SamplePackSampleTable
                  isSamplePlaying={this.state.isSamplePlaying}
                  playbackControl={this.playbackControl}
                  onSampleSelect={this.onSampleSelect}
                  selectedSampleId={this._sampleStore.selectedSampleId}
                  data={this._sampleStore.getSampleAsAnObserveableMap(this._sampleStore.sample)}
                  hiddenColumns={['delete', 'playCount']}
                />
                <div className={classes.content}>
                  <SamplePlayer
                    isSamplePlaying={this.state.isSamplePlaying}
                    sample={this.state.selectedSample}
                    onEnded={this.onStop}
                    onPause={this.onPause}
                    onPlay={this.onPlay}
                    incrementPlayCount={this.incrementPlayCount}
                  />
                </div>
                <ShareModal
                  open={this.state.openShareModal}
                  onClose={this.onShareModalClose}
                  url={!isServer ? window.location.href : ''}
                  header={sample.title}
                  subheader={sample.artistName}
                />
              </>
            )}
          </Root>
        )
      }

      public incrementPlayCount = (sampleId: number) => {
        this._sampleStore.incrementAndUpdatePlayCount(sampleId)
      }

      private onSampleSelect = () => {
        this.onStop()
        this._sampleStore.setSelectedSample(this._sampleStore.sample)

        if (this._sampleStore.selectedSample) {
          this.setState({ selectedSample: this._sampleStore.selectedSample })
          this.onPlay()
        }
      }

      private onCloseAddToCartModal = () => {
        this.setState({ openAddToCartModal: false })
      }

      private onArtistClick = (urlArtist: string) => {
        Router.push('/artists/[slug]', `/artists/${urlArtist}`)
      }

      private onPlay = () => {
        this.setState({ isSamplePlaying: true })
      }

      private onPause = () => {
        this.setState({ isSamplePlaying: false })
      }

      private onStop = () => {
        this.setState({ isSamplePlaying: false })
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

      private onOpenShareModal = () => {
        this.setState({ openShareModal: true })
      }

      private onShareModalClose = () => {
        this.setState({ openShareModal: false })
      }
    }
  )
)

export default withRouter(Index)

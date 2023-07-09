import { Box, Button, Link, Typography } from '@mui/material'
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
import { CollectionStore, getStore } from 'src/common/store'
import { APP_URL } from 'src/ApplicationConfiguration'
import AddToCart from 'src/modules/cart/components/AddToCart'
import { CartItemType } from 'src/modules/cart/store'
import { getCollection } from 'src/modules/collection/api'
import CollectionModel from 'src/modules/collection/store/model/CollectionModel'
import SamplePackSampleTable from 'src/modules/sample/components/SamplePackSampleTable'
import SamplePlayer from 'src/modules/sample/components/SamplePlayer'
import { IContext } from 'src/pages/_app'
import { pageContainer } from 'src/common/styles/SharedStyles'

const PREFIX = '[collectionId]'

const classes = {
  pageContainer: `${PREFIX}-pageContainer`,
  collectionDetailContainer: `${PREFIX}-collectionDetailContainer`,
  albumArtWrapper: `${PREFIX}-albumArtWrapper`,
  albumArt: `${PREFIX}-albumArt`,
  albumDetails: `${PREFIX}-albumDetails`,
  content: `${PREFIX}-content`,
  buyButton: `${PREFIX}-buyButton`,
}

const Root = styled('div')(() => ({
  [`&.${classes.pageContainer}`]: pageContainer,

  [`& .${classes.collectionDetailContainer}`]: {
    display: 'flex',
    marginBottom: '1em',
    marginTop: '1em',

    '@media screen and (max-width: 600px)': {
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '2em',
    },
  },

  [`& .${classes.albumArtWrapper}`]: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',

    '@media screen and (max-width: 600px)': {
      marginBottom: '0',
    },

    '@media screen and (min-width: 600px)': {
      marginRight: '2em',
      marginBottom: '1em',
    },
  },

  [`& .${classes.albumArt}`]: {
    width: '150px',
    height: '150px',
  },

  [`& .${classes.albumDetails}`]: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    maxHeight: '150px',

    '@media screen and (max-width: 600px)': {
      marginTop: '1em',
    },
  },

  [`& .${classes.content}`]: {
    padding: '2em 3em 8em 3em',

    '@media screen and (max-width: 600px)': {
      padding: '1em 1em 4em 1em',
    },
  },

  [`& .${classes.buyButton}`]: {},
}))

const isServer = typeof window === 'undefined'

interface IIndex extends WithRouterProps {
  collectionStore: CollectionStore
}

const Index = inject('collectionStore')(
  observer(
    class Index extends React.Component<IIndex> {
      public static async getInitialProps(ctx: IContext) {
        if (ctx.query.collectionId) {
          ctx.store.collectionStore.setLoading(true)
          await getCollection(
            ctx.query.collectionId,
            ctx.store.collectionStore.fetchCollectionCallback
          )
        }
      }

      public state = {
        isSamplePlaying: false,
        selectedSample: null,
        openAddToCartModal: false,
        collectionToAddToCart: CollectionModel,
        openShareModal: false,
      }

      private readonly _collectionStore: CollectionStore

      constructor(props: IIndex) {
        super(props)

        this._collectionStore = props.collectionStore
      }

      public render() {
        const { collection } = this._collectionStore

        return (
          <Root className={classes.pageContainer}>
            <Head>
              <title key="title">{collection.name}</title>
              <meta
                key="og:url"
                property="og:url"
                content={`${APP_URL}/sample-pack/${collection.id}`}
              />
              <meta key="og:title" property="og:title" content={collection.name} />
              <meta
                key="og:description"
                property="og:description"
                content={collection.artists[0].name}
              />
              <meta key="og:image" property="og:image" content={collection.albumArtUrl} />
            </Head>
            {this._collectionStore.loading ? (
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
                      id={collection.id}
                      src={collection.albumArtUrl}
                      className={classes.albumArt}
                    />
                    {/* <Button
                  color="primary"
                  size="small"
                  onClick={this.onOpenShareModal}
                  style={{ marginTop: '1em' }}
                >
                  Share
                </Button> */}
                  </div>
                  <div className={classes.albumDetails}>
                    <Box>
                      <Typography variant="h6">{collection.name}</Typography>
                      {collection.artists.length > 0 && (
                        <Link
                          onClick={() => this.onArtistClick(collection.artists[0].urlAlias)}
                          component="button"
                          underline="none"
                          variant="subtitle1"
                          gutterBottom
                        >
                          {collection.artists[0].name}
                        </Link>
                      )}
                    </Box>
                    <Box display="flex" marginTop="0.5em">
                      {getStore().cartStore.cart.collections.has(collection.id) ? (
                        <Button variant="outlined" color="primary" size="small" disabled>
                          In Cart
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          className={classes.buyButton}
                          onClick={this.onPriceClick}
                        >
                          {collection.price.formattedPrice}
                        </Button>
                      )}
                    </Box>
                  </div>
                </div>
                <div className={classes.content}>
                  <SamplePackSampleTable
                    isSamplePlaying={this.state.isSamplePlaying}
                    playbackControl={this.playbackControl}
                    onSampleSelect={this.onSampleSelect}
                    selectedSampleId={this._collectionStore.selectedSampleId}
                    data={this._collectionStore.collection.samples}
                    hiddenColumns={['delete', 'playCount']}
                  />
                </div>
                <SamplePlayer
                  isSamplePlaying={this.state.isSamplePlaying}
                  sample={this.state.selectedSample}
                  onEnded={this.onStop}
                  onPause={this.onPause}
                  onPlay={this.onPlay}
                  incrementPlayCount={this.incrementPlayCount}
                />
                <AddToCart
                  openAddToCartModal={this.state.openAddToCartModal}
                  onClose={this.onCloseAddToCartModal}
                  type={CartItemType.Collection}
                  itemToAdd={this.state.collectionToAddToCart}
                />
                <ShareModal
                  open={this.state.openShareModal}
                  onClose={this.onShareModalClose}
                  url={!isServer ? window.location.href : ''}
                  id={collection.id}
                  imgUrl={collection.albumArtUrl}
                  header={collection.name}
                  subheader={collection?.artists[0].name}
                />
              </>
            )}
          </Root>
        )
      }

      public incrementPlayCount = (sampleId: number) => {
        this._collectionStore.incrementAndUpdatePlayCount(sampleId)
      }

      private onSampleSelect = (id: number) => {
        this.onStop()
        this._collectionStore.selectSampleById(id)

        if (this._collectionStore.selectedSample) {
          this.setState({ selectedSample: this._collectionStore.selectedSample })
          this.onPlay()
        }
      }

      private onPriceClick = () => {
        this.setState({
          openAddToCartModal: true,
          collectionToAddToCart: this._collectionStore.collection,
        })
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

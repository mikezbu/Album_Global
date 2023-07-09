import { Alert, AlertTitle, Avatar, Button, IconButton, Tab, Tabs, Tooltip } from '@mui/material'
import { inject, observer } from 'mobx-react'
import Head from 'next/head'
import Router from 'next/router'
import React from 'react'
import ShareIcon from '@mui/icons-material/Share'
import VerifiedIcon from '@mui/icons-material/Verified'
import InfoIcon from '@mui/icons-material/Info'

import { ArtistStore, AuthenticationStore, getStore } from 'src/common/store'
import { APP_URL } from 'src/ApplicationConfiguration'
import { findArtistByUrlAlias, findArtistByUserId } from 'src/modules/artist/api'
import { IContext } from 'src/pages/_app'
import ImagePreview from 'src/common/components/image/ImagePreview'
import ShareModal from 'src/common/components/ShareModal'
import ArtistBio from 'src/modules/artist/components/ArtistBio'
import TrendingTracks from 'src/modules/track/components/TrendingTracks'
import CollectionsViewer from 'src/modules/collection/components/CollectionsViewer'

const isServer = typeof window === 'undefined'

interface IArtist {
  authenticationStore?: AuthenticationStore
  artistStore?: ArtistStore
}

const Artist = inject(
  'artistStore',
  'authenticationStore'
)(
  observer(
    class Artist extends React.Component<IArtist> {
      public static async getInitialProps(ctx: IContext) {
        if (ctx.query.slug === 'my-profile') {
          await findArtistByUserId(
            ctx.store.userStore.user.id,
            ctx.store.artistStore.fetchArtistCallback
          )
        } else if (ctx.query.slug) {
          await findArtistByUrlAlias(ctx.query.slug, ctx.store.artistStore.fetchArtistCallback)
        }
      }

      private readonly _artistStore: ArtistStore
      private readonly _authenticationStore: AuthenticationStore

      public state = {
        openShareModal: false,
        defaultTab: 0,
      }

      constructor(props: IArtist) {
        super(props)
        this._artistStore = props.artistStore
        this._authenticationStore = props.authenticationStore
      }

      public componentDidMount() {
        if (
          Router.query.slug &&
          Router.query.slug === 'my-profile' &&
          this._artistStore.artist.urlAlias.length > 0
        ) {
          Router.push('/artists/[slug]', `/artists/${this._artistStore.artist.urlAlias}`, {
            shallow: true,
          })
        }

        this.checkProfileValidity()
      }

      public componentDidUpdate() {
        if (
          Router.query.slug &&
          Router.query.slug === 'my-profile' &&
          this._artistStore.artist.urlAlias.length > 0
        ) {
          Router.push('/artists/[slug]', `/artists/${this._artistStore.artist.urlAlias}`, {
            shallow: true,
          })
        }
      }

      public render() {
        if (this.shouldProfileBeHidden()) {
          return <></>
        }

        return (
          <div className="flex w-full flex-col pb-28">
            <Head>
              <title key="title">{this._artistStore.artist.name}</title>
              <meta
                key="og:url"
                property="og:url"
                content={`${APP_URL}/artists/${this._artistStore.artist.urlAlias}`}
              />
              <meta key="og:title" property="og:title" content={this._artistStore.artist.name} />
              <meta
                key="og:description"
                property="og:description"
                content={this._artistStore.artist.bio}
              />
              <meta
                key="og:image"
                property="og:image"
                content={this._artistStore.artist.profileImageUrl}
              />
            </Head>
            {this._artistStore.artist.profileLocked && (
              <div className="mx-8 my-8">
                <Alert severity="error" variant="outlined" className="w-full">
                  <AlertTitle>Your Profile is Locked</AlertTitle>
                  Your profile has been locked and not publicly visible, please reach out to
                  hello@bevios.com to inquire further.
                </Alert>
              </div>
            )}
            <ImagePreview
              id={this._artistStore.artist.id}
              className={`max-h-80 overflow-hidden ${
                this._artistStore.artist.heroImageUrl.length === 0 && 'h-36 sm:h-80'
              }`}
              src={
                this._artistStore.artist.heroImageUrl.length > 0
                  ? this._artistStore.artist.heroImageUrl
                  : ''
              }
            />
            <div className="-mt-6 flex flex-col justify-between py-0 px-4 sm:flex-row sm:items-center">
              <div className="flex items-center">
                {this._artistStore.artist.profileImageUrl.length > 0 ? (
                  <Avatar
                    alt={this._artistStore.artist.name}
                    src={this._artistStore.artist.profileImageUrl}
                    className="flex min-h-[75px] min-w-[75px] sm:min-h-[100px] sm:min-w-[100px]"
                  />
                ) : (
                  <Avatar
                    alt={this._artistStore.artist.name}
                    className="relative flex min-h-[75px] min-w-[75px] sm:min-h-[100px] sm:min-w-[100px]"
                  >
                    <ImagePreview id={this._artistStore.artist.id + 1} />
                    <div className="absolute">{this._artistStore.artist.nameInitial}</div>
                  </Avatar>
                )}
                <div className="ml-6 pt-6">
                  <div className="text-xl font-semibold sm:text-2xl">
                    <span className="flex items-center">
                      {this._artistStore.artist.verified ? (
                        <VerifiedIcon className="mr-2 text-sky-400" />
                      ) : (
                        <Tooltip title="Your profile has not been verified yet">
                          <InfoIcon className="mr-2 text-amber-500" />
                        </Tooltip>
                      )}{' '}
                      {this._artistStore.artist.name}
                    </span>
                  </div>
                  <div className="text-sm font-normal text-gray-400">
                    {this._artistStore.artist.location}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end sm:pt-7">
                {this._artistStore.artist.userId === getStore().userStore.user.id &&
                  this._artistStore.artist.userId !== 0 && (
                    <div className="mr-4">
                      <Button
                        onClick={() =>
                          Router.push(
                            '/artists/[slug]/edit',
                            `/artists/${this._artistStore.artist.urlAlias}/edit`
                          )
                        }
                        variant="outlined"
                        color="primary"
                        size="small"
                      >
                        Edit
                      </Button>
                    </div>
                  )}

                <IconButton aria-haspopup="true" onClick={this.onOpenShareModal} size="large">
                  <ShareIcon />
                </IconButton>
              </div>
            </div>
            <div className="px-8 pb-32">
              <div className="mt-3 ml-2 mr-2">
                <Tabs
                  value={this.state.defaultTab}
                  onChange={this.handleTabChange}
                  aria-label="artist work tabs"
                  allowScrollButtonsMobile
                  scrollButtons
                >
                  <Tab label="Tracks" id="1" aria-controls="1" />
                  <Tab label="Collections" id="2" aria-controls="2" />
                  <Tab label="About" id="3" aria-controls="3" />
                </Tabs>
              </div>
              <div role="tabpanel" hidden={this.state.defaultTab !== 0} id="0" aria-labelledby="0">
                <TrendingTracks
                  numberOfTrendingTracks={12}
                  artistId={this._artistStore.artist.id}
                  self={
                    this._authenticationStore.authenticated &&
                    this._artistStore.artist.userId === getStore().userStore.user.id &&
                    this._artistStore.artist.userId !== 0
                  }
                />
              </div>
              <div role="tabpanel" hidden={this.state.defaultTab !== 1} id="1" aria-labelledby="1">
                <div className="pt-4">
                  <CollectionsViewer
                    artistId={this._artistStore.artist.id}
                    self={
                      this._authenticationStore.authenticated &&
                      this._artistStore.artist.userId === getStore().userStore.user.id &&
                      this._artistStore.artist.userId !== 0
                    }
                  />
                </div>
              </div>
              <div role="tabpanel" hidden={this.state.defaultTab !== 2} id="2" aria-labelledby="2">
                {!this.shouldProfileBeHidden() && (
                  <ArtistBio artist={this.props.artistStore.artist} />
                )}
              </div>
            </div>
            <ShareModal
              open={this.state.openShareModal}
              onClose={this.onShareModalClose}
              url={!isServer ? window.location.href : ''}
            />
          </div>
        )
      }

      private handleTabChange = (event, newValue) => {
        this.setState({ defaultTab: newValue })
      }

      private onOpenShareModal = () => {
        this.setState({ openShareModal: true })
      }

      private onShareModalClose = () => {
        this.setState({ openShareModal: false })
      }

      private shouldProfileBeHidden = (): boolean => {
        return (
          (!this._artistStore.artist.verified || this._artistStore.artist.profileLocked) &&
          !this._artistStore.loading &&
          !this._authenticationStore.authenticationInProgress &&
          !getStore().userStore.loading &&
          !(
            this._artistStore.artist.userId === getStore().userStore.user.id &&
            this._artistStore.artist.userId !== 0
          )
        )
      }

      private checkProfileValidity = () => {
        if (this.shouldProfileBeHidden()) {
          Router.push('/')
        }
      }
    }
  )
)

export default Artist

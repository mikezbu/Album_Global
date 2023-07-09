import { Alert, AlertTitle, NoSsr, Typography } from '@mui/material'
import { inject, observer } from 'mobx-react'
import Head from 'next/head'
import React from 'react'
import Router from 'next/router'

import Loading from 'src/common/components/layout/Loading'
import TabViewContainer from 'src/common/components/tabs/TabViewContainer'
import withAuth from 'src/common/components/withAuth'
import { ArtistStore, UserStore } from 'src/common/store'
import CollectionManagement from 'src/modules/collection/components/CollectionManagement'
import TrackManagement from 'src/modules/track/components/TrackManagement'

export interface IIndexProps {
  artistStore?: ArtistStore
  userStore?: UserStore
}

const Index = inject(
  'artistStore',
  'userStore'
)(
  observer(
    class Index extends React.Component<IIndexProps> {
      public state = {
        defaultTab: 0,
        selectedFiles: new Map<string, any>(),
        error: [],
      }

      private readonly _artistStore: ArtistStore
      private readonly _userStore: UserStore

      constructor(props: Readonly<IIndexProps>) {
        super(props)
        this._artistStore = props.artistStore
        this._userStore = props.userStore

        this._artistStore.reset()
      }

      public componentDidMount() {
        if (this._userStore.user.hasArtistProfile) {
          this._artistStore.getArtistByUserIdForUpdate(this._userStore.user.id)
        } else {
          Router.push('/artists/apply')
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
        if (this._artistStore.loading) {
          return (
            <NoSsr>
              <Loading />
            </NoSsr>
          )
        }

        return (
          <NoSsr>
            <div className="w-full bg-background-main pb-28">
              <Head>
                <title key="title">Manage</title>
              </Head>

              <div className="flex flex-col items-center py-2 sm:py-4">
                {!this._artistStore.artistToCreateOrModify.verified && (
                  <div className="my-4 mx-8">
                    <Alert severity="warning" variant="outlined">
                      <AlertTitle>Your Profile is In Review</AlertTitle>
                      Your profile is under review and has not been verified yet. You may upload
                      tracks and manage your profile, but it won&apos;t be publicly visible until
                      it&apos;s been verified. You can reach us at hello@bevios.com if you have any
                      questions.
                    </Alert>
                  </div>
                )}
                {this._artistStore.artistToCreateOrModify.profileLocked ? (
                  <div className="my-4 mx-8">
                    <Alert severity="error" variant="outlined" className="w-full">
                      <AlertTitle>Your Profile is Locked</AlertTitle>
                      Your profile has been locked, please reach out to hello@bevios.com to inquire
                      further.
                    </Alert>
                  </div>
                ) : (
                  <TabViewContainer
                    options={this.getTabOptions()}
                    selectedTabId={this.state.defaultTab}
                  />
                )}
              </div>
            </div>
          </NoSsr>
        )
      }

      private getTabOptions = () => {
        return [
          {
            id: 3,
            label: 'Manage Tracks',
            view: <TrackManagement />,
            path: 'track',
          },
          {
            id: 4,
            label: 'Manage Track Collection',
            view: <CollectionManagement />,
            path: 'track-collection',
          },
        ]
      }
    }
  )
)

export default withAuth(Index)

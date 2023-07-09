import { Drawer, Typography } from '@mui/material'
import AlbumIcon from '@mui/icons-material/Album'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic'
import SearchIcon from '@mui/icons-material/Search'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import PianoIcon from '@mui/icons-material/Piano'
import CategoryIcon from '@mui/icons-material/Category'
import StraightenIcon from '@mui/icons-material/Straighten'
import TagIcon from '@mui/icons-material/Tag'
import { inject, observer } from 'mobx-react'
import { WithRouterProps } from 'next/dist/client/with-router'
import Router from 'next/router'
import { withRouter } from 'next/router'
import React from 'react'
import dynamic from 'next/dynamic'

import BlankLayout from 'src/common/components/layout/BlankLayout'
import Footer from 'src/common/components/layout/Footer'
import Navbar from 'src/common/components/layout/navbar'
import { AppState, AuthenticationStore, getStore, UserStore } from 'src/common/store'
import { navigationBarHeight } from 'src/common/styles/SharedStyles'
import LoginForm from 'src/modules/login/component/LoginForm'
import SignUpForm from 'src/modules/sign-up/component/SignUpForm'
import ImpersonationFloater from 'src/modules/login/component/ImpersonationFloater'
import { BannerType } from 'src/common/components/Banner'
import { PropsWithChildren } from 'react'

const Banner = dynamic(() => import('src/common/components/Banner'), {
  ssr: false,
})

export type ILayout = WithRouterProps &
  PropsWithChildren & {
    appState?: AppState
    userStore?: UserStore
    authenticationStore?: AuthenticationStore
  }

const Layout = inject(
  'appState',
  'authenticationStore',
  'userStore'
)(
  observer(
    class Layout extends React.Component<ILayout> {
      private readonly _authenticationStore: AuthenticationStore
      private readonly _appState: AppState
      private readonly _userStore: UserStore

      constructor(props: ILayout) {
        super(props)

        this._appState = props.appState
        this._userStore = props.userStore
        this._authenticationStore = props.authenticationStore
      }

      public render() {
        const { children, router } = this.props
        const { pathname } = router

        const drawerMenuItems = (
          <>
            <div className="flex h-full w-full flex-col justify-between overflow-x-hidden text-slate-200">
              <div className="pt-8 pr-8 pb-16">
                <div
                  className="mb-4 ml-4 h-full max-h-16 w-full cursor-pointer"
                  onClick={this.goHome}
                >
                  <img src="/logo/dark/logo.png" className="w-32" height="auto" alt="logo" />
                </div>
                <Typography
                  variant="body2"
                  onClick={this.onLinkSelect('/')}
                  className={[
                    'flex cursor-pointer items-center py-2.5 pl-6 hover:text-primary-light',
                    pathname === '/'
                      ? 'rounded-r-full bg-background-light/[0.75] hover:text-current'
                      : 'my-2',
                  ].join(' ')}
                >
                  <SearchIcon className="mr-3" />
                  DISCOVER
                </Typography>
                <Typography
                  variant="body2"
                  onClick={this.onLinkSelect('/artists')}
                  className={[
                    'flex cursor-pointer items-center py-2.5 pl-6 hover:text-primary-light',
                    pathname.startsWith('/artists')
                      ? 'rounded-r-full bg-background-light/[0.75] hover:text-current'
                      : 'my-2',
                  ].join(' ')}
                >
                  <PersonIcon className="mr-3" />
                  ARTISTS
                </Typography>
                <Typography
                  variant="body2"
                  onClick={this.onLinkSelect('/explore')}
                  className={[
                    'flex cursor-pointer items-center py-2.5 pl-6 hover:text-primary-light',
                    pathname === '/explore' || pathname.startsWith('/tracks')
                      ? 'rounded-r-full bg-background-light/[0.75] hover:text-current'
                      : 'my-2',
                  ].join(' ')}
                >
                  <AudiotrackIcon className="mr-3" />
                  EXPLORE
                </Typography>
                <Typography
                  variant="body2"
                  onClick={this.onLinkSelect('/collection')}
                  className={[
                    'flex cursor-pointer items-center py-2.5 pl-6 hover:text-primary-light',
                    pathname.startsWith('/collection')
                      ? 'rounded-r-full bg-background-light/[0.75] hover:text-current'
                      : 'my-2',
                  ].join(' ')}
                >
                  <AlbumIcon className="mr-3" />
                  COLLECTIONS
                </Typography>
                {/* <Typography
                variant="subtitle1"
                onClick={this.onLinkSelect('/samples/trending')}
                className={[
                'flex items-center py-2.5 cursor-pointer pl-6 hover:text-primary-light',
                pathname === '/samples/trending' ? 'bg-background-light/[0.75] rounded-r-full hover:text-current' : 'my-2',
              ].join(' ')}
              >
                <TrendingUpIcon className="mr-3" />
                Trending Samples
              </Typography>
              <Typography
                variant="subtitle1"
                onClick={this.onLinkSelect('/samples')}
                className={[
                  'flex items-center py-2.5 cursor-pointer pl-6 hover:text-primary-light',
                  pathname === '/samples' ? 'bg-background-light/[0.75] rounded-r-full hover:text-current' : 'my-2',
                ].join(' ')}
              >
                <GraphicEqIcon className="mr-3" />
                Samples
              </Typography>
              <Typography
                variant="subtitle1"
                onClick={this.onLinkSelect('/sample-pack')}
                className={[
                  'flex items-center py-2.5 cursor-pointer pl-6 hover:text-primary-light',
                  pathname === '/sample-pack' ? 'bg-background-light/[0.75] rounded-r-full hover:text-current' : 'my-2',
                ].join(' ')}
              >
                <AlbumIcon className="mr-3" />
                Sample Packs
              </Typography>
              <Typography
                variant="subtitle1"
                onClick={this.onLinkSelect('/tracks/trending')}
                className={[
                  'flex items-center py-2.5 cursor-pointer pl-6 hover:text-primary-light',
                  pathname === '/tracks/trending-pack' ? 'bg-background-light/[0.75] rounded-r-full hover:text-current' : 'my-2',
                ].join(' ')}
              >
                <TrendingUpIcon className="mr-3" />
                Trending Tracks
              </Typography> */}
                {this._authenticationStore.authenticated && (
                  <>
                    <Typography
                      variant="body2"
                      onClick={this.onLinkSelect('/library')}
                      className={[
                        'flex cursor-pointer items-center py-2.5 pl-6 hover:text-primary-light',
                        pathname === '/library'
                          ? 'rounded-r-full bg-background-light/[0.75] hover:text-current'
                          : 'my-2',
                      ].join(' ')}
                    >
                      <LibraryMusicIcon className="mr-3" />
                      MY LIBRARY
                    </Typography>
                    {getStore().authenticationStore.isSuperAdmin() && (
                      <>
                        <Typography
                          variant="body2"
                          color="primary"
                          style={{ marginTop: '2em', marginBottom: '1em', paddingLeft: '2em' }}
                        >
                          ADMIN
                        </Typography>
                        <Typography
                          variant="body2"
                          onClick={this.onLinkSelect('/manage-all/user')}
                          className={[
                            'flex cursor-pointer items-center py-2.5 pl-6 hover:text-primary-light',
                            pathname === '/manage-all/user'
                              ? 'rounded-r-full bg-background-light/[0.75] hover:text-current'
                              : 'my-2',
                          ].join(' ')}
                        >
                          <PeopleIcon className="mr-3" />
                          USERS
                        </Typography>
                        <Typography
                          variant="body2"
                          onClick={this.onLinkSelect('/manage-all/artist')}
                          className={[
                            'flex cursor-pointer items-center py-2.5 pl-6 hover:text-primary-light',
                            pathname === '/manage-all/artist'
                              ? 'rounded-r-full bg-background-light/[0.75] hover:text-current'
                              : 'my-2',
                          ].join(' ')}
                        >
                          <PeopleIcon className="mr-3" />
                          ARTISTS
                        </Typography>
                        <Typography
                          variant="body2"
                          onClick={this.onLinkSelect('/manage-all/track')}
                          className={[
                            'flex cursor-pointer items-center py-2.5 pl-6 hover:text-primary-light',
                            pathname === '/manage-all/track'
                              ? 'rounded-r-full bg-background-light/[0.75] hover:text-current'
                              : 'my-2',
                          ].join(' ')}
                        >
                          <AudiotrackIcon className="mr-3" />
                          TRACKS
                        </Typography>
                        <Typography
                          variant="body2"
                          onClick={this.onLinkSelect('/manage-all/instrument')}
                          className={[
                            'flex cursor-pointer items-center py-2.5 pl-6 hover:text-primary-light',
                            pathname === '/manage-all/instrument'
                              ? 'rounded-r-full bg-background-light/[0.75] hover:text-current'
                              : 'my-2',
                          ].join(' ')}
                        >
                          <PianoIcon className="mr-3" />
                          INSTRUMENTS
                        </Typography>
                        <Typography
                          variant="body2"
                          onClick={this.onLinkSelect('/manage-all/genre')}
                          className={[
                            'flex cursor-pointer items-center py-2.5 pl-6 hover:text-primary-light',
                            pathname === '/manage-all/genre'
                              ? 'rounded-r-full bg-background-light/[0.75] hover:text-current'
                              : 'my-2',
                          ].join(' ')}
                        >
                          <CategoryIcon className="mr-3" />
                          GENRES
                        </Typography>
                        <Typography
                          variant="body2"
                          onClick={this.onLinkSelect('/manage-all/key')}
                          className={[
                            'flex cursor-pointer items-center py-2.5 pl-6 hover:text-primary-light',
                            pathname === '/manage-all/key'
                              ? 'rounded-r-full bg-background-light/[0.75] hover:text-current'
                              : 'my-2',
                          ].join(' ')}
                        >
                          <StraightenIcon className="mr-3" />
                          KEYS
                        </Typography>
                        <Typography
                          variant="body2"
                          onClick={this.onLinkSelect('/manage-all/tag')}
                          className={[
                            'flex cursor-pointer items-center py-2.5 pl-6 hover:text-primary-light',
                            pathname === '/manage-all/tag'
                              ? 'rounded-r-full bg-background-light/[0.75] hover:text-current'
                              : 'my-2',
                          ].join(' ')}
                        >
                          <TagIcon className="mr-3" />
                          TAGS
                        </Typography>
                      </>
                    )}
                    {/* <Typography
                variant="body2"
                onClick={this.onLinkSelect('/favorites')}
                className={[
                  'flex items-center py-2.5 cursor-pointer pl-6 hover:text-primary-light',
                  pathname === '/favorites'
                    ? 'bg-background-light/[0.75] rounded-r-full hover:text-current'
                    : 'my-2',
                ].join(' ')}
              >
                <FavoriteIcon className="mr-3" />
                MY FAVORITES
              </Typography> */}
                  </>
                )}
              </div>
              <Footer />
            </div>
          </>
        )

        return (
          <BlankLayout>
            <div className="flex h-screen">
              <>
                <div className="flex sm:hidden">
                  <Drawer
                    className="z-50 w-56 flex-shrink-0"
                    variant="temporary"
                    open={this.props.appState.drawerOpen}
                    onClose={this.handleDrawerToggle}
                    classes={{
                      paper: 'border-none bg-none w-56',
                    }}
                    ModalProps={{
                      keepMounted: true,
                    }}
                  >
                    {drawerMenuItems}
                  </Drawer>
                </div>
                {this.props.appState.isDrawerVisible && (
                  <div className="hidden sm:flex">
                    <Drawer
                      className="z-40 w-56 flex-shrink-0"
                      classes={{
                        paper: [
                          'border-none bg-none w-56',
                          this._appState.track ? 'pb-16' : 'pb-0',
                        ].join(' '),
                      }}
                      variant="permanent"
                      open
                    >
                      {drawerMenuItems}
                    </Drawer>
                  </div>
                )}
              </>
              <div
                id="main-container"
                className={[
                  'relative flex h-full w-full min-w-[320px] flex-col overflow-auto bg-background-main',
                  this._appState.track ? 'mb-20' : '',
                ].join(' ')}
              >
                <div className="min-h-[64px] sm:min-h-[80px]" />
                <Navbar />
                {!this._authenticationStore.authenticationInProgress &&
                  !this._userStore.user.hasArtistProfile &&
                  this.shouldRenderBanner() && (
                    <Banner
                      id={1}
                      message="Are you an artist? Sign up now and receive 100% of your sales revenue for first 6 months!"
                      ctaLabel="Sign up"
                      ctaAction={this.onLinkSelect('/artists/apply')}
                      type={BannerType.Info}
                      dismissible
                    />
                  )}
                {children}
              </div>
            </div>

            {this._appState.openLoginModal && <LoginForm modal />}
            {this._appState.openSignUpModal && <SignUpForm modal />}
            {this._authenticationStore.authenticated &&
              this._authenticationStore.inImpersonation && <ImpersonationFloater />}
          </BlankLayout>
        )
      }

      private shouldRenderBanner = () => {
        const pathname = this.props.router.pathname

        return (
          pathname !== '/artists' &&
          pathname !== '/artists/apply' &&
          !pathname.startsWith('/checkout')
        )
      }

      private handleDrawerToggle = () => {
        this.props.appState.handleDrawerToggle()
      }

      private onLinkSelect = (route: string) => () => {
        if (this.props.appState.drawerOpen) {
          this.props.appState.handleDrawerToggle()
        }

        Router.push(route)
      }

      private goHome = () => {
        Router.push('/')
      }
    }
  )
)

export default withRouter(Layout)

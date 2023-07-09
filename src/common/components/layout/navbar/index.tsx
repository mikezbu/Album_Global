import { Badge, Button, ClickAwayListener, IconButton, Toolbar } from '@mui/material'
import { inject, observer } from 'mobx-react'
import MenuIcon from '@mui/icons-material/Menu'
import React from 'react'
import Router from 'next/router'
import SearchIcon from '@mui/icons-material/Search'

import { AppState, AuthenticationStore, CartStore, UserStore } from 'src/common/store'
import CartPopper from 'src/modules/cart/components/CartPopper'
import Search from 'src/modules/search/components/Search'
import UserMenuItems from 'src/common/components/layout/navbar/components/UserMenuItems'

export interface INavbar {
  authenticationStore?: AuthenticationStore
  appState?: AppState
  cartStore?: CartStore
  userStore?: UserStore
}

const Navbar = inject(
  'authenticationStore',
  'userStore',
  'appState',
  'cartStore'
)(
  observer(
    class Navbar extends React.PureComponent<INavbar> {
      public state = {
        showMobileSearch: false,
        openCartPopper: false,
        cartPopperAnchor: null,
      }

      private readonly _authenticationStore: AuthenticationStore
      private readonly _appState: AppState
      private readonly _cartStore: CartStore
      private readonly _userStore: UserStore

      constructor(props: INavbar) {
        super(props)

        this._authenticationStore = props.authenticationStore
        this._appState = props.appState
        this._cartStore = props.cartStore
        this._userStore = props.userStore

        if (typeof window !== 'undefined') {
          this._authenticationStore.checkTokenAccess()
        }
      }

      public render() {
        return (
          <Toolbar
            variant="dense"
            classes={{
              root: [
                'flex justify-between fixed bg-background-main shadow-xl z-40 h-full max-h-14 w-full sm:max-h-20',
                this.props.appState.isDrawerVisible
                  ? `max-w-full sm:max-w-[calc(100vw-224px)]`
                  : 'max-w-full',
              ].join(' '),
            }}
          >
            {!this.props.appState.isDrawerVisible && (
              <div className="hidden h-full items-center sm:flex">
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={this.handleDrawerToggle}
                  className="mr-2"
                  size="large"
                >
                  <MenuIcon />
                </IconButton>
                <div
                  className="flex h-full max-h-16 w-full cursor-pointer items-center py-2"
                  onClick={this.goHome}
                >
                  <img src="/logo/dark/logo.png" width="auto" height="100%" alt="logo" />
                </div>
              </div>
            )}

            <div className="flex h-full items-center sm:hidden">
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={this.handleDrawerToggle}
                className="mr-2"
                size="large"
              >
                <MenuIcon />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="open serach"
                edge="start"
                onClick={this.handleMobileSearchClick}
                size="large"
              >
                <SearchIcon />
              </IconButton>
            </div>

            <div className="hidden h-11 w-1/2 max-w-2xl items-center rounded-2xl bg-background-dark sm:flex">
              <Search />
            </div>

            <div className="flex items-center">
              <div className="flex sm:hidden">
                {this.state.showMobileSearch && (
                  <ClickAwayListener onClickAway={this.handleMobileSearchClick} touchEvent={false}>
                    <div className="py- absolute top-0 left-0 z-40 h-full w-full bg-background-dark px-6">
                      <div className="flex h-full items-center bg-background-dark">
                        <Search autoFocus />
                      </div>
                    </div>
                  </ClickAwayListener>
                )}
              </div>
              <div className="mr-4">
                <IconButton
                  disableRipple
                  aria-label="cart"
                  onClick={this.handleOpenCartPopper}
                  size="small"
                >
                  <Badge
                    badgeContent={this._cartStore.cart.totalItemCount}
                    classes={{ badge: 'text-primary-dark bg-secondary-light' }}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <img
                      src="/images/illustrations/shopping-bag.svg"
                      width="100%"
                      height="100%"
                      alt="Shopping bag"
                    />
                  </Badge>
                </IconButton>
              </div>
              <CartPopper
                onClose={this.handleCloseCartPopper}
                open={this.state.openCartPopper}
                anchor={this.state.cartPopperAnchor}
              />
              {this._authenticationStore.authenticated ? (
                <UserMenuItems
                  logout={this.logout}
                  user={this._userStore.user}
                  resetFlags={this.resetFlags}
                />
              ) : (
                <>
                  {/* <Button
                  variant="contained"
                  aria-label="Sign Up"
                  onClick={this.handleOpenSignUpModal}
                  color="primary"
                  className="mr-1"
                >
                  Sign Up
                </Button> */}
                  <Button
                    aria-label="Log In"
                    color="primary"
                    onClick={this.handleOpenLoginModal}
                    className="mr-1"
                  >
                    LOG IN
                  </Button>
                </>
              )}
            </div>
          </Toolbar>
        )
      }

      private resetFlags = () => {
        this._appState.setOpenLoginModal(false)
        this._appState.setOpenSignupModal(false)
        this.handleCloseAvatarMenu()
      }

      private handleCloseAvatarMenu = () => {
        this.setState({ menuAnchor: null })
      }

      private handleOpenCartPopper = (event: React.MouseEvent<HTMLElement>) => {
        this.setState({ openCartPopper: true, cartPopperAnchor: event.currentTarget })
      }

      private handleCloseCartPopper = () => {
        this.setState({ openCartPopper: false })
      }

      private handleOpenLoginModal = () => {
        this._appState.setOpenLoginModal(true)
      }

      private handleOpenSignUpModal = () => {
        this._appState.setOpenSignupModal(true)
      }

      private logout = () => {
        this._authenticationStore.logout()
        this.resetFlags()
        Router.push('/')
      }

      private goHome = () => {
        Router.push('/')
      }

      private handleDrawerToggle = () => {
        this._appState.handleDrawerToggle()
      }

      private handleMobileSearchClick = () => {
        this.setState({ showMobileSearch: !this.state.showMobileSearch })
      }
    }
  )
)

export default Navbar

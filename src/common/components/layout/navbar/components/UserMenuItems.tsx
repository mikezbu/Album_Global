//these imports are from Material UI, and import icons-material

import {
  Avatar,
  Button,
  ClickAwayListener,
  Divider,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
} from '@mui/material'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import TuneIcon from '@mui/icons-material/Tune'
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined'
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic'
import ReceiptIcon from '@mui/icons-material/Receipt'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { observer } from 'mobx-react'
import Router from 'next/router'
import React from 'react'

import { UserModel } from 'src/common/store/user'

export interface IUserMenuItems { //export interface IUserMenuItems, no resetFlags or logout
  user: UserModel
  resetFlags: () => void
  logout: () => void
}

const UserMenuItems = observer( //export react.PureComponent. The purpose of this is to describe the menu items that are in the dropdown component of the avatar menu.
  class UserMenuItems extends React.PureComponent<IUserMenuItems> {
    public state = {
      menuAnchor: null,
      isMenuOpen: false,
    }

    public render() {
      const { user } = this.props

      return (
        <div>
          <Button
            aria-label="Account of current user"
            aria-haspopup="true"
            onClick={this.handleMenu}
            className="px-2.5 py-2"
            color="primary"
            disableRipple
            endIcon={<KeyboardArrowDownIcon className="hidden sm:block" />}
          >
            <Avatar alt={user.firstName} src={user.profilePictureUrl} />
            <span className="ml-2 hidden sm:block">{user.firstName}</span>
          </Button>
          <Popper
            open={this.state.isMenuOpen}
            anchorEl={this.state.menuAnchor}
            transition
            className="z-40"
          >
            {({ TransitionProps }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin: 'center top',
                }}
              >
                <Paper
                  id="avatar-list-grow"
                  className="min-w-[200px] bg-background-dark bg-none p-2"
                >
                  <ClickAwayListener onClickAway={this.handleCloseAvatarMenu}>
                    <MenuList disablePadding>
                      {user.hasArtistProfile && [
                        <MenuItem
                          key="artist-profile"
                          onClick={this.handleViewMyArtistProfileClick}
                        >
                          <AssignmentIndOutlinedIcon className="mr-2" />
                          View Profile
                        </MenuItem>,
                        <MenuItem key="manage" onClick={this.handleManageClick}>
                          <TuneIcon className="mr-2" />
                          Manage
                        </MenuItem>,
                      ]}
                      {!user.hasArtistProfile && (
                        <MenuItem onClick={this.handleCreateArtistProfile}>
                          <AddCircleOutlineOutlinedIcon className="mr-2" />
                          Become an Artist
                        </MenuItem>
                      )}
                      <Divider variant="fullWidth" style={{ margin: '0.5em' }} />
                      <MenuItem onClick={this.handleAccountClick}>
                        <SettingsOutlinedIcon className="mr-2" />
                        Account
                      </MenuItem>
                      <Divider variant="fullWidth" style={{ margin: '0.5em' }} />
                      <MenuItem onClick={this.handleReceiptClick}>
                        <ReceiptIcon className="mr-2" />
                        Receipts
                      </MenuItem>
                      <MenuItem onClick={this.handleLibraryClick}>
                        <LibraryMusicIcon className="mr-2" />
                        My Library
                      </MenuItem>
                      <Divider variant="fullWidth" style={{ margin: '0.5em' }} />
                      <MenuItem onClick={this.logout}>
                        <ExitToAppOutlinedIcon className="mr-2" />
                        <Typography variant="inherit">Log Out</Typography>
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>
      )
    }

    private handleMenu = (event: React.MouseEvent<HTMLElement>) => {
      this.setState({ menuAnchor: event.currentTarget, isMenuOpen: true })
    }

    private handleCloseAvatarMenu = () => {
      this.setState({ isMenuOpen: false })
    }

    private handleCreateArtistProfile = () => {
      this.handleCloseAvatarMenu()
      Router.push('/artists/apply')
      this.props.resetFlags()
    }

    private handleManageClick = () => {
      this.handleCloseAvatarMenu()
      Router.push('/manage')
      this.props.resetFlags()
    }

    private handleViewMyArtistProfileClick = () => {
      this.handleCloseAvatarMenu()
      Router.push('/artists/[slug]', `/artists/my-profile?userId=${this.props.user.id}`)
      this.props.resetFlags()
    }

    private logout = () => {
      this.handleCloseAvatarMenu()
      this.props.logout()
    }

    private handleAccountClick = () => {
      this.handleCloseAvatarMenu()
      Router.push('/account')
      this.props.resetFlags()
    }

    private handleReceiptClick = () => {
      this.handleCloseAvatarMenu()
      Router.push('/receipts')
      this.props.resetFlags()
    }

    private handleLibraryClick = () => {
      this.handleCloseAvatarMenu()
      Router.push('/library')
      this.props.resetFlags()
    }
  }
)

export default UserMenuItems

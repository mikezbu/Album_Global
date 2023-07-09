import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HelpIcon from '@mui/icons-material/Help'
import { inject, observer } from 'mobx-react'
import Router from 'next/router'
import React, { ChangeEvent } from 'react'

import ImageCropper from 'src/common/components/image/ImageCropper'
import ImagePreview from 'src/common/components/image/ImagePreview'
import Loading from 'src/common/components/layout/Loading'
import withAuth from 'src/common/components/withAuth'
import { UserStore } from 'src/common/store'

const PREFIX = 'GeneralInformation'

const classes = {
  root: `${PREFIX}-root`,
  marginTop: `${PREFIX}-marginTop`,
  padding: `${PREFIX}-padding`,
  verified: `${PREFIX}-verified`,
  notVerified: `${PREFIX}-notVerified`,
  fileUploadInput: `${PREFIX}-fileUploadInput`,
  imagePreview: `${PREFIX}-imagePreview`,
  actionContainer: `${PREFIX}-actionContainer`,
  saveButton: `${PREFIX}-saveButton`,
}

const Root = styled('div')(() => ({
  position: 'relative',
  width: '100%',
  padding: '2em',
  display: 'flex',
  flexDirection: 'column',

  [`& .${classes.marginTop}`]: {
    marginTop: '1em',
  },

  [`& .${classes.padding}`]: {
    padding: '1em 0',
  },

  [`& .${classes.verified}`]: {
    color: 'green',
  },

  [`& .${classes.notVerified}`]: {
    color: 'orange',
  },

  [`& .${classes.fileUploadInput}`]: {
    display: 'none',
  },

  [`& .${classes.imagePreview}`]: {
    padding: '1em',
    marginBottom: '1em',
  },

  [`& .${classes.actionContainer}`]: {
    display: 'flex',
    flexDirection: 'column',
  },

  [`& .${classes.saveButton}`]: {
    alignSelf: 'flex-end',
  },
}))

export interface IGeneralInformationProps {
  userStore?: UserStore
}

const GeneralInformation = inject('userStore')(
  observer(
    class GeneralInformation extends React.Component<IGeneralInformationProps> {
      public state = {
        selectedFiles: new Map<string, any>(),
        error: [],
      }

      private readonly _userStore: UserStore

      constructor(props: Readonly<IGeneralInformationProps>) {
        super(props)
        this._userStore = props.userStore
      }

      public componentDidUpdate() {
        if (this._userStore.updated) {
          this._userStore.resetFlags()
          this.setState({
            selectedFiles: new Map<string, any>(),
            error: [],
          })
        }
      }

      public render() {
        const { emailVerified } = this._userStore.userUpdate

        if (this._userStore.accountDeleted) {
          Router.push('/')
        }

        const profilePictureFile = this.state.selectedFiles.get('profilePictureUrl')
        const profilePictureError = this.state.error.find(
          error => error.type === 'profilePictureUrl'
        )

        return (
          <Root className={classes.root}>
            <Typography variant="h6" gutterBottom>
              General information
            </Typography>
            <Divider />
            {this._userStore.updating && <Loading position="absolute" size={40} />}
            {!emailVerified && (
              <Box component="div" marginTop="1em">
                <Alert severity="warning" variant="outlined">
                  <AlertTitle>Email not verified</AlertTitle>
                  You haven&apos;t verified your email. Click on the link in your email to verify.
                  You may also request a new verification email.
                  <Button
                    onClick={this._userStore.resendEmailVerification}
                    color="primary"
                    variant="text"
                    className={classes.marginTop}
                  >
                    Resend Email Verification
                  </Button>
                </Alert>
              </Box>
            )}
            <Typography variant="body2" gutterBottom className={classes.padding} />
            <Grid container spacing={4}>
              {!this._userStore.user.hasArtistProfile && (
                <Grid item xs={12} sm={12} md={4}>
                  {!profilePictureFile && (
                    <ImagePreview
                      id={this._userStore.user.id}
                      src={
                        profilePictureFile && profilePictureFile.imagePreview
                          ? profilePictureFile.imagePreview
                          : this._userStore.user.profilePictureUrl
                      }
                    />
                  )}
                  {profilePictureFile && (
                    <ImageCropper
                      className={classes.imagePreview}
                      src={profilePictureFile.imagePreview}
                      filename={profilePictureFile.file.name}
                      aspect={1}
                      circularCrop={true}
                      onCropComplete={this.onCropComplete('profilePictureUrl')}
                    />
                  )}
                  <input
                    accept="image/*"
                    className={classes.fileUploadInput}
                    id="image-upload"
                    type="file"
                    onChange={this.onChangeUploadImage('profilePictureUrl')}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      color="primary"
                      variant="contained"
                      component="span"
                      id="upload-image-button"
                      aria-label="Upload an Image"
                      size="small"
                      className="mt-4"
                    >
                      Change profile picture
                    </Button>
                  </label>

                  {profilePictureError && (
                    <Typography variant="caption" color="error">
                      {profilePictureError.message}
                    </Typography>
                  )}
                </Grid>
              )}
              <Grid item xs={12} sm={this._userStore.user.hasArtistProfile ? 12 : 8}>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      id="firstName"
                      fullWidth
                      variant="filled"
                      required
                      type="text"
                      label="First Name"
                      autoComplete="given-name"
                      error={this._userStore.firstNameError}
                      onChange={this.handleInputChange('firstName')}
                      value={this._userStore.userUpdate.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      id="lastName"
                      fullWidth
                      variant="filled"
                      required
                      type="text"
                      label="Last Name"
                      autoComplete="family-name"
                      error={this._userStore.lastNameError}
                      onChange={this.handleInputChange('lastName')}
                      value={this._userStore.userUpdate.lastName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      id="email"
                      fullWidth
                      variant="filled"
                      required
                      type="email"
                      label="Email"
                      autoComplete="email"
                      error={this._userStore.emailError}
                      onChange={this.handleInputChange('email')}
                      value={this._userStore.userUpdate.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {emailVerified && (
                              <Tooltip title="Email Verified">
                                <CheckCircleIcon className={classes.verified} />
                              </Tooltip>
                            )}
                            {!emailVerified && (
                              <Tooltip title="Email Not Verified">
                                <HelpIcon className={classes.notVerified} />
                              </Tooltip>
                            )}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      id="phoneNumber"
                      fullWidth
                      variant="filled"
                      type="text"
                      label="Phone Number"
                      autoComplete="tel"
                      onChange={this.handleInputChange('phoneNumber')}
                      value={this._userStore.userUpdate.phoneNumber}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={12} className={classes.actionContainer}>
                <Button
                  variant="contained"
                  type="submit"
                  color="primary"
                  className={classes.saveButton}
                  disabled={!this._userStore.fieldChanged}
                  onClick={this.onSubmit}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Root>
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
          this._userStore.setFileInputChanged(true)
        }
      }

      private handleInputChange =
        (property: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
          this._userStore.setValue(property, e.target.value)
        }

      private onSubmit = () => {
        this._userStore.updateUserInfo(Array.from(this.state.selectedFiles.values()))
      }

      private onChangeUploadImage = (type: string) => (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files)

        // 2MB Limit
        if (files[0] && files[0].size / 1000000 <= 2) {
          this._userStore.setFileInputChanged(true)

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
            message: 'File is too big, select an image less than 2MB',
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
          this._userStore.setFileInputChanged(false)
        }
      }
    }
  )
)

export default withAuth(GeneralInformation)

import { IconButton, Snackbar, SnackbarContent } from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/CloseOutlined'
import ErrorIcon from '@mui/icons-material/ErrorOutlined'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import WarningIcon from '@mui/icons-material/WarningOutlined'
import { observer } from 'mobx-react'
import React from 'react'

import { getStore } from 'src/common/store'

const PREFIX = 'Notifier'

const classes = {
  success: `${PREFIX}-success`,
  error: `${PREFIX}-error`,
  info: `${PREFIX}-info`,
  warning: `${PREFIX}-warning`,
  icon: `${PREFIX}-icon`,
  iconVariant: `${PREFIX}-iconVariant`,
  message: `${PREFIX}-message`,
}

const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
  [`& .${classes.success}`]: {
    backgroundColor: theme.palette.success.dark,
  },

  [`& .${classes.error}`]: {
    backgroundColor: theme.palette.error.dark,
  },

  [`& .${classes.info}`]: {
    backgroundColor: theme.palette.primary.main,
  },

  [`& .${classes.warning}`]: {
    backgroundColor: theme.palette.warning.dark,
  },

  [`& .${classes.icon}`]: {
    fontSize: 20,
  },

  [`& .${classes.iconVariant}`]: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },

  [`& .${classes.message}`]: {
    display: 'flex',
    alignItems: 'center',
  },
}))

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
}

const Notifier = observer(
  class Notifier extends React.PureComponent {
    public render() {
      const Icon = variantIcon[getStore().appState.messageVariant]

      const message = (
        <span
          id="snackbar-message-id"
          dangerouslySetInnerHTML={{ __html: getStore().appState.message }}
        />
      )

      if (getStore().appState.showMessage) {
        return (
          <StyledSnackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            autoHideDuration={6000}
            onClose={this.handleSnackbarClose}
            open={getStore().appState.showMessage}
            ContentProps={{
              'aria-describedby': 'snackbar-message-id',
            }}
          >
            <SnackbarContent
              className={[classes[getStore().appState.messageVariant]].join(' ')}
              aria-describedby="client-snackbar"
              message={
                <span id="client-snackbar" className={classes.message}>
                  <Icon className={[classes.icon, classes.iconVariant].join(' ')} />
                  {message}
                </span>
              }
              action={[
                <IconButton
                  key="close"
                  aria-label="close"
                  color="inherit"
                  onClick={this.handleSnackbarClose}
                  size="large"
                >
                  <CloseIcon className={classes.icon} />
                </IconButton>,
              ]}
            />
          </StyledSnackbar>
        )
      }
      return <div> </div>
    }

    private handleSnackbarClose = () => {
      getStore().appState.setShowMessage(false)
      getStore().appState.setMessage('')
    }
  }
)

export default Notifier

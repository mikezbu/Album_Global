import { styled } from '@mui/material/styles'
import { observer } from 'mobx-react'
import Router from 'next/router'
import React from 'react'

import withAuth from 'src/common/components/withAuth'
import { getStore } from 'src/common/store'

import { Box, Divider, Typography } from '@mui/material'

const PREFIX = 'ArtistApplicationStatus'

const classes = {
  icon: `${PREFIX}-icon`,
  text: `${PREFIX}-text`,
}

const StyledBox = styled(Box)(() => ({
  [`& .${classes.icon}`]: {
    marginRight: '0.5em',
  },

  [`& .${classes.text}`]: {
    marginTop: '2em',
  },
}))

const ArtistApplicationStatus = observer(
  class ArtistApplicationStatus extends React.Component {
    public render() {
      return (
        <StyledBox position="relative" width="100%" padding="2em">
          <Typography variant="h6" gutterBottom>
            Your application status
          </Typography>
          <Divider />
          <Typography variant="subtitle1" gutterBottom className={classes.text}>
            Thank you, {getStore().userStore.user.firstName}!
          </Typography>
          <Typography variant="subtitle1">
            We have received your application and we are reviewing it. We will let you know once it
            has been approved!
          </Typography>
        </StyledBox>
      )
    }

    private onLinkSelect = (route: string) => () => {
      Router.push(route)
    }
  }
)

export default withAuth(ArtistApplicationStatus)

import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import BlankLayout from 'src/common/components/layout/BlankLayout'

const Error = ({ statusCode }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100%"
      flexDirection="column"
    >
      <Box component="div" padding="2em" display="flex" alignItems="center" flexDirection="column">
        <Typography variant="h3" gutterBottom>
          {statusCode}
        </Typography>
        <Typography variant="h3" gutterBottom>
          Well, this is embarrassing. Something went wrong :(
        </Typography>
        <Typography variant="h6" gutterBottom>
          Please refresh this page and try it again or you can try this action again
        </Typography>
        <Typography variant="h6" gutterBottom>
          <Button href="/">Take me home </Button>
        </Typography>
        <Box
          component="div"
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
        >
          <img
            src="/images/illustrations/undraw_server_down_s4lk.svg"
            width="100%"
            alt="Server down"
          />
        </Box>
      </Box>
    </Box>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

Error.Layout = BlankLayout

export default Error
